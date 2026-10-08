import { ConvexError, v } from "convex/values";
import { mutation, query, internalMutation, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { answerType, settingsType } from "./partyTypes";
import { isCorrect, selectQuestions, validateSettings } from "./partyQuestions";

async function player(ctx: MutationCtx | QueryCtx, token: string) {
  const p = await ctx.db.query("players").withIndex("by_token", q => q.eq("token", token)).unique();
  if (!p || !p.name.trim()) throw new ConvexError("Choose your nickname before joining a party.");
  return p;
}
async function members(ctx: MutationCtx | QueryCtx, partyId: Id<"parties">) {
  return ctx.db.query("partyMembers").withIndex("by_party", q => q.eq("party", partyId)).collect();
}
async function member(ctx: MutationCtx | QueryCtx, partyId: Id<"parties">, playerId: Id<"players">) {
  return ctx.db.query("partyMembers").withIndex("by_party_player", q => q.eq("party", partyId).eq("player", playerId)).unique();
}
async function getParty(ctx: MutationCtx | QueryCtx, id: Id<"parties">) {
  const party = await ctx.db.get(id);
  if (!party) throw new ConvexError("Party not found.");
  return party;
}
function hostOnly(party: Doc<"parties">, id: Id<"players">) {
  if (party.host !== id) throw new ConvexError("Only the party leader can do that.");
}
async function begin(ctx: MutationCtx, party: Doc<"parties">, index: number) {
  const startedAt = Date.now();
  const deadline = startedAt + party.settings.seconds * 1000;
  await ctx.db.patch(party._id, { phase: "question", index, startedAt, deadline });
  await ctx.scheduler.runAt(deadline, internal.parties.timeout, { partyId: party._id, index });
}
function week() {
  const d = new Date(Date.now()); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
  return d.toISOString().slice(0, 10);
}
async function finish(ctx: MutationCtx, party: Doc<"parties">, people: Doc<"partyMembers">[]) {
  const contenders = people.filter(m => m.status === "approved");
  const highest = Math.max(...contenders.map(m => m.score));
  const winners = contenders.filter(m => m.score === highest);
  for (const m of people.filter(m => m.participated)) {
    const correct = m.answers.filter(a => a.correct).length;
    for (const period of ["all", week()]) {
      const prior = await ctx.db.query("standings").withIndex("by_player_period", q => q.eq("player", m.player).eq("period", period)).unique();
      const won = winners.some(w => w.player === m.player);
      const values = { name: m.name, wins: (prior?.wins ?? 0) + Number(won && winners.length === 1), draws: (prior?.draws ?? 0) + Number(won && winners.length > 1), matches: (prior?.matches ?? 0) + 1, correct: (prior?.correct ?? 0) + correct, answered: (prior?.answered ?? 0) + party.questions.length };
      if (prior) await ctx.db.patch(prior._id, values); else await ctx.db.insert("standings", { ...values, player: m.player, period });
    }
  }
  await ctx.db.patch(party._id, { phase: "finished" });
}
async function settle(ctx: MutationCtx, party: Doc<"parties">) {
  if (party.phase !== "question") return;
  const people = await members(ctx, party._id);
  const active = people.filter(m => m.status === "approved");
  if (active.length < 2) { await ctx.db.patch(party._id, { phase: "cancelled" }); return; }
  const q = party.questions[party.index];
  const right = active.filter(m => m.answers[party.index] && isCorrect(q, m.answers[party.index].answer));
  const fastest = right.length ? Math.min(...right.map(m => m.answers[party.index].at)) : -1;
  const updated: Doc<"partyMembers">[] = [];
  for (const m of people) {
    if (!m.participated) { updated.push(m); continue; }
    const answer = m.answers[party.index] ?? { answer: q.kind === "match" || q.kind === "multi" ? [] : "", at: party.deadline, correct: false, points: 0 };
    const correct = isCorrect(q, answer.answer);
    const points = Number(m.status === "approved" && correct && answer.at === fastest);
    const answers = [...m.answers]; answers[party.index] = { ...answer, correct, points };
    const score = m.score + points;
    await ctx.db.patch(m._id, { answers, score }); updated.push({ ...m, answers, score });
  }
  if (party.index === party.questions.length - 1) await finish(ctx, party, updated);
  else await ctx.db.patch(party._id, { phase: "reveal" });
}

export const create = mutation({
  args: { token: v.string(), title: v.string(), settings: settingsType },
  handler: async (ctx, args) => {
    const p = await player(ctx, args.token);
    const title = args.title.trim();
    if (!title || title.length > 60 || /[<>\x00-\x1f]/.test(title)) throw new ConvexError("Choose a party name of 1–60 characters.");
    validateSettings(args.settings);
    if (Date.now() - p.lastRoomAt < 10_000) throw new ConvexError("Wait a few seconds before creating another party.");
    // Validate the bank now, so an impossible setup never becomes a public lobby.
    selectQuestions(args.settings);
    const existing = await ctx.db.query("parties").withIndex("by_host", q => q.eq("host", p._id)).order("desc").take(20);
    for (const party of existing) if (["lobby", "question", "reveal"].includes(party.phase)) await ctx.db.patch(party._id, { phase: "cancelled" });
    const partyId = await ctx.db.insert("parties", { host: p._id, title, settings: args.settings, phase: "lobby", questions: [], index: 0, startedAt: 0, deadline: 0, expiresAt: Date.now() + 2 * 60 * 60_000, revision: 0 });
    await ctx.db.insert("partyMembers", { party: partyId, player: p._id, name: p.name, status: "approved", ready: true, answers: [], score: 0, participated: false });
    await ctx.db.patch(p._id, { lastRoomAt: Date.now() });
    await ctx.scheduler.runAt(Date.now() + 2 * 60 * 60_000, internal.parties.expire, { partyId });
    return partyId;
  },
});
export const discover = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await player(ctx, token);
    const parties = await ctx.db.query("parties").withIndex("by_phase", q => q.eq("phase", "lobby")).order("desc").take(50);
    return Promise.all(parties.filter(p => p.expiresAt > Date.now()).map(async p => {
      const list = await members(ctx, p._id);
      return { id: p._id, title: p.title, host: list.find(m => m.player === p.host)?.name ?? "Party leader", settings: p.settings, joined: list.filter(m => m.status === "approved").length };
    }));
  },
});
export const requestJoin = mutation({
  args: { token: v.string(), partyId: v.id("parties") },
  handler: async (ctx, { token, partyId }) => {
    const p = await player(ctx, token), party = await getParty(ctx, partyId);
    if (party.phase !== "lobby" || party.expiresAt < Date.now()) throw new ConvexError("This party is no longer accepting players.");
    const existing = await member(ctx, partyId, p._id);
    if (existing?.status === "rejected") throw new ConvexError("The leader declined your request for this party.");
    if (existing?.status === "approved" || existing?.status === "pending") return partyId;
    const list = await members(ctx, partyId);
    if (list.filter(m => m.status === "approved").length >= party.settings.capacity) throw new ConvexError("This party is full.");
    if (list.length >= 40 && !existing) throw new ConvexError("Too many join requests in this party. Try another lobby.");
    if (existing) await ctx.db.patch(existing._id, { status: "pending", ready: false, name: p.name });
    else await ctx.db.insert("partyMembers", { party: partyId, player: p._id, name: p.name, status: "pending", ready: false, answers: [], score: 0, participated: false });
    return partyId;
  },
});
export const moderate = mutation({
  args: { token: v.string(), partyId: v.id("parties"), memberId: v.id("partyMembers"), approve: v.boolean() },
  handler: async (ctx, args) => {
    const p = await player(ctx, args.token), party = await getParty(ctx, args.partyId); hostOnly(party, p._id);
    if (party.phase !== "lobby") throw new ConvexError("The roster is locked after the game starts.");
    const target = await ctx.db.get(args.memberId);
    if (!target || target.party !== party._id || target.player === party.host) throw new ConvexError("Invalid player selection.");
    if (args.approve && target.status !== "pending") throw new ConvexError("This player isn't waiting for approval.");
    if (args.approve && (await members(ctx, party._id)).filter(m => m.status === "approved").length >= party.settings.capacity) throw new ConvexError("The party is full.");
    await ctx.db.patch(target._id, { status: args.approve ? "approved" : "rejected", ready: false });
  },
});
export const configure = mutation({
  args: { token: v.string(), partyId: v.id("parties"), settings: settingsType },
  handler: async (ctx, args) => {
    const p = await player(ctx, args.token), party = await getParty(ctx, args.partyId); hostOnly(party, p._id);
    if (party.phase !== "lobby") throw new ConvexError("Settings are locked during the game.");
    selectQuestions(args.settings);
    const list = await members(ctx, party._id);
    if (args.settings.capacity < list.filter(m => m.status === "approved").length) throw new ConvexError("Remove players before lowering the player limit.");
    await ctx.db.patch(party._id, { settings: args.settings, revision: party.revision + 1 });
    for (const m of list) if (m.status === "approved") await ctx.db.patch(m._id, { ready: m.player === party.host });
  },
});
export const act = mutation({
  args: { token: v.string(), partyId: v.id("parties"), action: v.union(v.literal("ready"), v.literal("start"), v.literal("answer"), v.literal("next"), v.literal("leave")), index: v.optional(v.number()), answer: v.optional(answerType), revision: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const p = await player(ctx, args.token), party = await getParty(ctx, args.partyId);
    const me = await member(ctx, party._id, p._id);
    if (!me) throw new ConvexError("Request to join this party first.");
    if (args.action === "leave") {
      if (me.status === "rejected") return;
      if (p._id === party.host && !["finished", "cancelled"].includes(party.phase)) await ctx.db.patch(party._id, { phase: "cancelled" });
      else if (party.phase === "lobby" || ["question", "reveal"].includes(party.phase)) {
        await ctx.db.patch(me._id, { status: "left", ready: false });
        const active = (await members(ctx, party._id)).filter(m => m.status === "approved");
        if (party.phase !== "lobby" && active.length < 2) await ctx.db.patch(party._id, { phase: "cancelled" });
        else if (party.phase === "question" && active.every(m => m.answers.length > party.index)) await settle(ctx, party);
      }
      return;
    }
    if (me.status !== "approved") throw new ConvexError("Wait for the leader to approve you.");
    if (party.expiresAt < Date.now()) throw new ConvexError("This party expired.");
    if (args.action === "ready") {
      if (party.phase !== "lobby") return;
      if (args.revision !== party.revision) throw new ConvexError("Settings changed. Review them and press Ready again.");
      await ctx.db.patch(me._id, { ready: true });
    } else if (args.action === "start") {
      hostOnly(party, p._id);
      if (party.phase !== "lobby") return;
      const list = await members(ctx, party._id), active = list.filter(m => m.status === "approved");
      if (active.length < 2 || !active.every(m => m.ready)) throw new ConvexError("At least two approved players must be ready.");
      const questions = selectQuestions(party.settings);
      await ctx.db.patch(party._id, { questions });
      for (const m of active) await ctx.db.patch(m._id, { participated: true });
      await begin(ctx, { ...party, questions }, 0);
    } else {
      if (args.index !== party.index) return;
      if (args.action === "next") {
        hostOnly(party, p._id);
        if (party.phase === "reveal") await begin(ctx, party, party.index + 1);
      } else if (party.phase === "question") {
        if (me.answers.length > party.index) return;
        if (Date.now() >= party.deadline) { await settle(ctx, party); return; }
        const q = party.questions[party.index];
        const answer = args.answer;
        if (answer === undefined || typeof answer === "string" && (!answer.trim() || answer.length > 150) || Array.isArray(answer) && (answer.length > 12 || answer.some(a => typeof a !== "string" || a.length > 150))) throw new ConvexError("Choose or enter your answer.");
        if (q.kind === "match" || q.kind === "multi") {
          if (!Array.isArray(answer) || !answer.length || answer.some(a => !q.options.includes(a)) || q.kind === "match" && answer.length !== q.rows.length || q.kind === "multi" && new Set(answer).size !== answer.length) throw new ConvexError("Complete your answer using the available choices.");
        } else if (typeof answer !== "string" || q.kind !== "tf" && !q.options.includes(answer)) throw new ConvexError("Choose an available answer.");
        const answers = [...me.answers, { answer, at: Date.now(), correct: false, points: 0 }];
        await ctx.db.patch(me._id, { answers });
        const active = (await members(ctx, party._id)).filter(m => m.status === "approved");
        if (active.every(m => m.answers.length > party.index)) await settle(ctx, party);
      }
    }
  },
});
export const timeout = internalMutation({
  args: { partyId: v.id("parties"), index: v.number() },
  handler: async (ctx, { partyId, index }) => {
    const party = await ctx.db.get(partyId);
    if (party?.phase === "question" && party.index === index && Date.now() >= party.deadline) await settle(ctx, party);
  },
});
export const expire = internalMutation({
  args: { partyId: v.id("parties") },
  handler: async (ctx, { partyId }) => {
    const party = await ctx.db.get(partyId);
    if (party && !["finished", "cancelled"].includes(party.phase)) await ctx.db.patch(partyId, { phase: "cancelled" });
  },
});
export const get = query({
  args: { token: v.string(), partyId: v.id("parties") },
  handler: async (ctx, { token, partyId }) => {
    const p = await player(ctx, token), party = await ctx.db.get(partyId);
    if (!party) return null;
    const list = await members(ctx, partyId), me = list.find(m => m.player === p._id);
    if (!me) return null;
    const host = party.host === p._id, canPlay = me.status === "approved" || me.participated;
    const revealed = party.phase === "reveal" || party.phase === "finished";
    const q = party.questions[party.index];
    const active = list.filter(m => m.status === "approved");
    return {
      id: party._id, title: party.title, host, hostName: list.find(m => m.player === party.host)?.name ?? "Leader", settings: party.settings, revision: party.revision,
      phase: party.phase, index: party.index, total: party.settings.count, startedAt: party.startedAt, deadline: party.deadline, status: me.status,
      me: me._id, yourAnswer: me.answers[party.index]?.answer ?? null,
      roster: list.filter(m => m.status === "approved" || m.participated || host && m.status === "pending").map(m => ({ id: m._id, name: m.name, status: m.status, host: m.player === party.host, ready: m.ready, score: m.score, answered: m.answers.length > party.index })),
      readyToStart: active.length >= 2 && active.every(m => m.ready),
      question: q && canPlay ? { kind: q.kind, module: q.module, prompt: q.prompt, options: q.options, rows: q.rows } : null,
      result: q && revealed && canPlay ? { correct: q.correct, explanation: q.explanation, source: q.source, players: list.filter(m => m.participated).map(m => {
        const answer = m.answers[party.index];
        return { id: m._id, name: m.name, answer: answer?.answer ?? null, correct: answer?.correct ?? false, points: answer?.points ?? 0, milliseconds: answer && (typeof answer.answer === "string" ? !!answer.answer : !!answer.answer.length) ? answer.at - party.startedAt : null };
      }) } : null,
      review: party.phase === "finished" && canPlay ? party.questions.map((q, i) => ({ prompt: q.prompt, correct: q.correct, explanation: q.explanation, rows: q.rows, yourAnswer: me.answers[i]?.answer ?? null, points: me.answers[i]?.points ?? 0, ok: me.answers[i]?.correct ?? false })) : null,
    };
  },
});
