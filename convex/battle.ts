import { ConvexError, v } from "convex/values";
import { mutation, query, internalMutation, type MutationCtx, type QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import data from "../content/msys-50/data.json";

const bank = Object.entries(data.scenarios).flatMap(([module, questions]) =>
  questions.map((q, i) => ({ ...q, id: `${module}-${i}`, module })));
const findQuestion = (id: string) => {
  const q = bank.find((q) => q.id === id);
  if (!q) throw new ConvexError("Question unavailable.");
  return q;
};
const shuffled = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
const week = () => {
  const d = new Date(Date.now());
  d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
  return d.toISOString().slice(0, 10);
};
const cleanName = (name: string) => {
  const cleaned = name.trim().replace(/\s+/g, " ");
  if (cleaned.length < 1 || cleaned.length > 24 || /[\x00-\x1f<>]/.test(cleaned)) throw new ConvexError("Use a nickname of 1–24 characters, without angle brackets.");
  return cleaned;
};
async function player(ctx: QueryCtx | MutationCtx, token: string) {
  const p = await ctx.db.query("players").withIndex("by_token", (q) => q.eq("token", token)).unique();
  if (!p) throw new ConvexError("Enter your nickname first.");
  return p;
}
async function roomFor(ctx: QueryCtx | MutationCtx, code: string) {
  return ctx.db.query("rooms").withIndex("by_code", (q) => q.eq("code", code.trim().toUpperCase())).unique();
}
function side(room: Doc<"rooms">, id: Id<"players">) {
  if (room.owner === id) return "owner" as const;
  if (room.guest === id) return "guest" as const;
  throw new ConvexError("Join this room before playing.");
}
function scores(room: Doc<"rooms">) {
  const count = (answers: number[]) => answers.reduce((total, a, i) => total + (a >= 0 && findQuestion(room.questions[i]).a === findQuestion(room.questions[i]).o[a] ? 1 : 0), 0);
  return { owner: count(room.ownerAnswers), guest: count(room.guestAnswers) };
}
async function startQuestion(ctx: MutationCtx, room: Doc<"rooms">, index: number) {
  const deadline = Date.now() + 60_000;
  await ctx.db.patch(room._id, { phase: "question", index, deadline, ownerNext: false, guestNext: false });
  await ctx.scheduler.runAt(deadline, internal.battle.timeout, { roomId: room._id, index });
}
async function reveal(ctx: MutationCtx, room: Doc<"rooms">) {
  const fill = (a: number[]) => a.length > room.index ? a : [...a, -1];
  await ctx.db.patch(room._id, { phase: "reveal", ownerAnswers: fill(room.ownerAnswers), guestAnswers: fill(room.guestAnswers) });
}
async function finish(ctx: MutationCtx, room: Doc<"rooms">) {
  if (!room.guest) return;
  const points = scores(room);
  for (const [id, correct, opponent] of [[room.owner, points.owner, points.guest], [room.guest, points.guest, points.owner]] as const) {
    const p = await ctx.db.get(id);
    if (!p) continue;
    for (const period of ["all", week()]) {
      const prior = await ctx.db.query("standings").withIndex("by_player_period", (q) => q.eq("player", id).eq("period", period)).unique();
      const values = {
        name: p.name, wins: (prior?.wins ?? 0) + Number(correct > opponent), draws: (prior?.draws ?? 0) + Number(correct === opponent),
        matches: (prior?.matches ?? 0) + 1, correct: (prior?.correct ?? 0) + correct, answered: (prior?.answered ?? 0) + room.questions.length,
      };
      if (prior) await ctx.db.patch(prior._id, values);
      else await ctx.db.insert("standings", { ...values, player: id, period });
    }
  }
  await ctx.db.patch(room._id, { phase: "finished" });
}

export const register = mutation({
  args: { token: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    if (!/^[a-f0-9]{64}$/.test(args.token)) throw new ConvexError("Invalid browser identity. Please reload.");
    const name = cleanName(args.name);
    const p = await ctx.db.query("players").withIndex("by_token", (q) => q.eq("token", args.token)).unique();
    if (p) {
      await ctx.db.patch(p._id, { name });
      const standings = await ctx.db.query("standings").withIndex("by_player_period", (q) => q.eq("player", p._id)).collect();
      for (const row of standings) await ctx.db.patch(row._id, { name });
    } else await ctx.db.insert("players", { token: args.token, name, lastRoomAt: 0 });
    return { name };
  },
});
export const create = mutation({
  args: { token: v.string(), mode: v.union(v.literal("mixed"), v.literal("M1"), v.literal("M2"), v.literal("M3")) },
  handler: async (ctx, args) => {
    const p = await player(ctx, args.token);
    if (Date.now() - p.lastRoomAt < 10_000) throw new ConvexError("Wait a few seconds before creating another room.");
    // Only one active room per host; replacing it informs the previous opponent.
    const owned = await ctx.db.query("rooms").withIndex("by_owner", (q) => q.eq("owner", p._id)).order("desc").take(20);
    for (const r of owned) if (["lobby", "question", "reveal"].includes(r.phase)) await ctx.db.patch(r._id, { phase: "cancelled" });
    let code = "";
    for (let tries = 0; tries < 10; tries++) {
      code = Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
      if (!await roomFor(ctx, code)) break;
      code = "";
    }
    if (!code) throw new ConvexError("Couldn't create a room. Try again.");
    const selected = args.mode === "mixed"
      ? shuffled(shuffled(["M1", "M2", "M3"]).flatMap((module, i) => shuffled(bank.filter((q) => q.module === module)).slice(0, i === 0 ? 4 : 3)))
      : shuffled(bank.filter((q) => q.module === args.mode)).slice(0, 10);
    const id = await ctx.db.insert("rooms", {
      code, owner: p._id, mode: args.mode, phase: "lobby", questions: selected.map((q) => q.id), orders: selected.map((q) => shuffled(q.o.map((_, i) => i))),
      index: 0, ownerReady: false, guestReady: false, ownerNext: false, guestNext: false, ownerAnswers: [], guestAnswers: [], deadline: 0, expiresAt: Date.now() + 2 * 60 * 60_000,
    });
    await ctx.db.patch(p._id, { lastRoomAt: Date.now() });
    await ctx.scheduler.runAt(Date.now() + 2 * 60 * 60_000, internal.battle.expire, { roomId: id });
    return code;
  },
});
export const join = mutation({
  args: { token: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const p = await player(ctx, args.token);
    const room = await roomFor(ctx, args.code);
    if (!room || room.expiresAt < Date.now()) throw new ConvexError("Room not found or expired.");
    if (room.owner === p._id || room.guest === p._id) return room.code;
    if (room.phase !== "lobby") throw new ConvexError("This battle has already started.");
    if (room.guest) throw new ConvexError("Both sides are occupied. Create a new room.");
    await ctx.db.patch(room._id, { guest: p._id });
    return room.code;
  },
});
export const act = mutation({
  args: { token: v.string(), code: v.string(), action: v.union(v.literal("ready"), v.literal("answer"), v.literal("next"), v.literal("leave")), index: v.optional(v.number()), answer: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const p = await player(ctx, args.token);
    const room = await roomFor(ctx, args.code);
    if (!room) throw new ConvexError("Room not found.");
    const s = side(room, p._id);
    if (args.action === "leave") {
      if (["finished", "cancelled"].includes(room.phase)) return;
      if (room.phase === "lobby" && s === "guest") await ctx.db.patch(room._id, { guest: undefined, guestReady: false });
      else await ctx.db.patch(room._id, { phase: "cancelled" });
      return;
    }
    if (room.expiresAt < Date.now()) throw new ConvexError("This room has expired.");
    if (args.action === "ready") {
      if (room.phase !== "lobby" || !room.guest) throw new ConvexError("Wait for both players to join.");
      await ctx.db.patch(room._id, s === "owner" ? { ownerReady: true } : { guestReady: true });
      if (s === "owner" ? room.guestReady : room.ownerReady) await startQuestion(ctx, room, 0);
    } else {
      // Index guards make duplicate/retried requests harmless across questions.
      if (args.index !== room.index) return;
      if (args.action === "answer") {
        if (room.phase !== "question") return;
        if (Date.now() >= room.deadline) { await reveal(ctx, room); return; }
        const answers = s === "owner" ? room.ownerAnswers : room.guestAnswers;
        if (answers.length > room.index) return;
        const q = findQuestion(room.questions[room.index]);
        if (!Number.isInteger(args.answer) || args.answer! < 0 || args.answer! >= q.o.length) throw new ConvexError("Choose an answer.");
        const nextAnswers = [...answers, args.answer!];
        const nextRoom = { ...room, ...(s === "owner" ? { ownerAnswers: nextAnswers } : { guestAnswers: nextAnswers }) };
        await ctx.db.patch(room._id, s === "owner" ? { ownerAnswers: nextAnswers } : { guestAnswers: nextAnswers });
        if (nextRoom.ownerAnswers.length > room.index && nextRoom.guestAnswers.length > room.index) await reveal(ctx, nextRoom);
      } else if (room.phase === "reveal") {
        await ctx.db.patch(room._id, s === "owner" ? { ownerNext: true } : { guestNext: true });
        if (s === "owner" ? room.guestNext : room.ownerNext) {
          if (room.index === room.questions.length - 1) await finish(ctx, room);
          else await startQuestion(ctx, room, room.index + 1);
        }
      }
    }
  },
});
export const timeout = internalMutation({
  args: { roomId: v.id("rooms"), index: v.number() },
  handler: async (ctx, { roomId, index }) => {
    const room = await ctx.db.get(roomId);
    if (room?.phase === "question" && room.index === index && Date.now() >= room.deadline) await reveal(ctx, room);
  },
});
export const expire = internalMutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const room = await ctx.db.get(roomId);
    if (room && !["finished", "cancelled"].includes(room.phase)) await ctx.db.patch(roomId, { phase: "cancelled" });
  },
});

export const getRoom = query({
  args: { token: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const p = await player(ctx, args.token);
    const room = await roomFor(ctx, args.code);
    if (!room) return null;
    const s = side(room, p._id);
    const owner = await ctx.db.get(room.owner);
    const guest = room.guest ? await ctx.db.get(room.guest) : null;
    const revealed = room.phase === "reveal" || room.phase === "finished";
    const q = findQuestion(room.questions[room.index]);
    const mine = s === "owner" ? room.ownerAnswers : room.guestAnswers;
    const pointTotals = scores(room);
    const priorTotals = scores({ ...room, ownerAnswers: room.ownerAnswers.slice(0, room.index), guestAnswers: room.guestAnswers.slice(0, room.index) });
    // No tokens, future questions, correct answers, or opponent choices leak before reveal.
    return {
      code: room.code, side: s, mode: room.mode, phase: room.phase, index: room.index, total: room.questions.length, deadline: room.deadline,
      owner: { name: owner?.name ?? "Player 1", ready: room.ownerReady, next: room.ownerNext, answered: room.ownerAnswers.length > room.index, score: revealed ? pointTotals.owner : priorTotals.owner },
      guest: guest ? { name: guest.name, ready: room.guestReady, next: room.guestNext, answered: room.guestAnswers.length > room.index, score: revealed ? pointTotals.guest : priorTotals.guest } : null,
      yourAnswer: mine[room.index] ?? null,
      question: ["question", "reveal", "finished"].includes(room.phase) ? { prompt: q.q, module: q.module, options: room.orders[room.index].map((i) => ({ value: i, text: q.o[i] })) } : null,
      result: revealed ? { correct: q.o.indexOf(q.a), explanation: q.w ?? "", ownerAnswer: room.ownerAnswers[room.index], guestAnswer: room.guestAnswers[room.index] } : null,
      review: room.phase === "finished" ? room.questions.map((id, i) => {
        const item = findQuestion(id);
        return { prompt: item.q, options: item.o, correct: item.a, explanation: item.w ?? "", ownerAnswer: room.ownerAnswers[i], guestAnswer: room.guestAnswers[i] };
      }) : null,
    };
  },
});
export const leaderboard = query({
  args: { weekly: v.boolean() },
  handler: async (ctx, { weekly }) => {
    const period = weekly ? week() : "all";
    const rows = await ctx.db.query("standings").withIndex("by_period_wins", (q) => q.eq("period", period)).order("desc").take(50);
    return rows.map((r) => ({ id: r.player, name: r.name, wins: r.wins, draws: r.draws, matches: r.matches, accuracy: Math.round(100 * r.correct / r.answered) }));
  },
});
