/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api, internal } from "../convex/_generated/api";
import schema from "../convex/schema";
import { isCorrect, questionBank, selectQuestions, type PartySettings } from "../convex/partyQuestions";

const modules = import.meta.glob("../convex/**/*.{ts,js}");
const a = "a".repeat(64), b = "b".repeat(64), c = "c".repeat(64);
const settings: PartySettings = { mode: "mixed", types: ["scenario"], count: 5, seconds: 60, capacity: 4 };
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
async function setup(start = true) {
  const t = convexTest(schema, modules);
  for (const [token, name] of [[a, "Alice"], [b, "Bob"], [c, "Charlie"]]) await t.mutation(api.battle.register, { token, name });
  const partyId = await t.mutation(api.parties.create, { token: a, title: "Study party", settings });
  for (const token of [b, c]) await t.mutation(api.parties.requestJoin, { token, partyId });
  const lobby = await t.query(api.parties.get, { token: a, partyId });
  for (const m of lobby!.roster.filter(m => m.status === "pending")) await t.mutation(api.parties.moderate, { token: a, partyId, memberId: m.id, approve: true });
  if (start) {
    for (const token of [b, c]) await t.mutation(api.parties.act, { token, partyId, action: "ready", revision: 0 });
    await t.mutation(api.parties.act, { token: a, partyId, action: "start" });
  }
  const raw = await t.run(ctx => ctx.db.get(partyId));
  return { t, partyId, raw: raw! };
}
test("nickname gate, public discovery, approval and host-only start/settings", async () => {
  const { t, partyId } = await setup(false);
  await expect(t.query(api.parties.discover, { token: "unknown" })).rejects.toThrow("nickname");
  expect((await t.query(api.parties.discover, { token: b }))[0]).toMatchObject({ title: "Study party", joined: 3 });
  await expect(t.mutation(api.parties.act, { token: b, partyId, action: "start" })).rejects.toThrow("leader");
  await expect(t.mutation(api.parties.act, { token: a, partyId, action: "start" })).rejects.toThrow("ready");
  await expect(t.mutation(api.parties.configure, { token: b, partyId, settings })).rejects.toThrow("leader");
  await t.mutation(api.parties.act, { token: b, partyId, action: "ready", revision: 0 });
  await t.mutation(api.parties.configure, { token: a, partyId, settings: { ...settings, seconds: 90 } });
  const changed = await t.query(api.parties.get, { token: a, partyId });
  expect(changed?.revision).toBe(1);
  expect(changed?.roster.find(m => m.name === "Bob")?.ready).toBe(false);
  await expect(t.mutation(api.parties.act, { token: b, partyId, action: "ready", revision: 0 })).rejects.toThrow("changed");
  const target = changed!.roster.find(m => m.name === "Charlie")!;
  await t.mutation(api.parties.moderate, { token: a, partyId, memberId: target.id, approve: false });
  await t.mutation(api.parties.act, { token: c, partyId, action: "leave" });
  await expect(t.mutation(api.parties.requestJoin, { token: c, partyId })).rejects.toThrow("declined");
});
test("pending players cannot see questions or act; capacity is enforced at approval", async () => {
  const { t, partyId } = await setup(false);
  const charlie = (await t.query(api.parties.get, { token: a, partyId }))!.roster.find(m => m.name === "Charlie")!;
  await t.mutation(api.parties.act, { token: c, partyId, action: "leave" });
  await t.mutation(api.parties.requestJoin, { token: c, partyId });
  await t.mutation(api.parties.configure, { token: a, partyId, settings: { ...settings, capacity: 2 } });
  await expect(t.mutation(api.parties.moderate, { token: a, partyId, memberId: charlie.id, approve: true })).rejects.toThrow("full");
  await expect(t.mutation(api.parties.act, { token: c, partyId, action: "ready", revision: 1 })).rejects.toThrow("approve");
  await t.mutation(api.parties.act, { token: b, partyId, action: "ready", revision: 1 });
  await t.mutation(api.parties.act, { token: a, partyId, action: "start" });
  const pending = await t.query(api.parties.get, { token: c, partyId });
  expect(pending?.question).toBeNull();
  expect(pending?.result).toBeNull();
  expect(await t.query(api.parties.discover, { token: c })).toEqual([]);
});
test("fastest fully correct wins after everyone locks; guesses and duplicate locks do not win", async () => {
  const { t, partyId, raw } = await setup();
  const correct = raw.questions[0].correct[0], wrong = raw.questions[0].options.find(o => o !== correct)!;
  vi.advanceTimersByTime(100);
  await t.mutation(api.parties.act, { token: a, partyId, action: "answer", index: 0, answer: wrong });
  await t.mutation(api.parties.act, { token: a, partyId, action: "answer", index: 0, answer: correct });
  vi.advanceTimersByTime(200);
  await t.mutation(api.parties.act, { token: b, partyId, action: "answer", index: 0, answer: correct });
  const hidden = await t.query(api.parties.get, { token: c, partyId });
  expect(hidden?.result).toBeNull();
  expect(hidden?.roster.every(m => m.score === 0)).toBe(true);
  expect(JSON.stringify(hidden)).not.toContain(a);
  expect(hidden?.question).not.toHaveProperty("correct");
  vi.advanceTimersByTime(200);
  await t.mutation(api.parties.act, { token: c, partyId, action: "answer", index: 0, answer: correct });
  const reveal = await t.query(api.parties.get, { token: a, partyId });
  expect(reveal?.phase).toBe("reveal");
  expect(reveal?.result?.players.map(m => [m.name, m.correct, m.points, m.milliseconds])).toEqual([["Alice", false, 0, 100], ["Bob", true, 1, 300], ["Charlie", true, 0, 500]]);
  await expect(t.mutation(api.parties.act, { token: b, partyId, action: "next", index: 0 })).rejects.toThrow("leader");
  await t.mutation(api.parties.act, { token: a, partyId, action: "next", index: 0 });
  await t.mutation(api.parties.act, { token: b, partyId, action: "answer", index: 0, answer: correct });
  expect((await t.query(api.parties.get, { token: b, partyId }))?.yourAnswer).toBeNull();
});
test("last lock ends game, exact ties share points, accuracy is independent of speed and stats count once", async () => {
  const { t, partyId, raw } = await setup();
  for (let index = 0; index < 5; index++) {
    const correct = raw.questions[index].correct[0], wrong = raw.questions[index].options.find(o => o !== correct)!;
    for (const token of [a, b]) await t.mutation(api.parties.act, { token, partyId, action: "answer", index, answer: correct });
    vi.advanceTimersByTime(500);
    await t.mutation(api.parties.act, { token: c, partyId, action: "answer", index, answer: index ? correct : wrong });
    await t.mutation(api.parties.act, { token: a, partyId, action: "next", index });
  }
  const done = await t.query(api.parties.get, { token: a, partyId });
  expect(done?.phase).toBe("finished");
  expect(done?.review).toHaveLength(5);
  expect(done?.roster.map(m => m.score)).toEqual([5, 5, 0]);
  await t.mutation(internal.parties.timeout, { partyId, index: 4 });
  for (const weekly of [false, true]) {
    const rows = await t.query(api.battle.leaderboard, { weekly });
    expect(rows).toHaveLength(3);
    expect(rows.filter(r => r.name !== "Charlie").every(r => r.matches === 1 && r.draws === 1 && r.accuracy === 100)).toBe(true);
    expect(rows.find(r => r.name === "Charlie")).toMatchObject({ matches: 1, draws: 0, accuracy: 80 });
  }
});
test("timeouts, stale timers, and leaving a group with two remaining players", async () => {
  const { t, partyId, raw } = await setup();
  await t.mutation(api.parties.act, { token: a, partyId, action: "answer", index: 0, answer: raw.questions[0].correct[0] });
  await t.mutation(api.parties.act, { token: c, partyId, action: "leave" });
  expect((await t.query(api.parties.get, { token: a, partyId }))?.phase).toBe("question");
  vi.advanceTimersByTime(60_001);
  await t.mutation(internal.parties.timeout, { partyId, index: 0 });
  const reveal = await t.query(api.parties.get, { token: a, partyId });
  expect(reveal?.phase).toBe("reveal");
  expect(reveal?.result?.players.find(m => m.name === "Bob")?.milliseconds).toBeNull();
  await t.mutation(api.parties.act, { token: a, partyId, action: "next", index: 0 });
  await t.mutation(internal.parties.timeout, { partyId, index: 0 });
  expect((await t.query(api.parties.get, { token: a, partyId }))?.phase).toBe("question");
  await t.mutation(api.parties.act, { token: a, partyId, action: "leave" });
  expect((await t.query(api.parties.get, { token: b, partyId }))?.phase).toBe("cancelled");
  expect(await t.query(api.battle.leaderboard, { weekly: false })).toEqual([]);
});
test("all seven types cover Modules 1–3, validate their answers, and avoid repeated statements", () => {
  const types: PartySettings["types"] = ["scenario", "mc", "tf2", "tf", "multi", "blank", "match"];
  for (const mode of ["mixed", "M1", "M2", "M3"] as const) {
    const questions = selectQuestions({ ...settings, mode, types, count: 10 });
    expect(new Set(questions.map(q => q.kind)).size).toBe(7);
    expect(questions.every(q => mode === "mixed" || q.module === mode)).toBe(true);
    expect(new Set(questions.map(q => q.prompt.replace(/<[^>]*>/g, "") + q.rows.join("|"))).size).toBe(10);
    for (const q of questions) {
      const answer = q.kind === "multi" || q.kind === "match" ? q.correct : q.kind === "tf" ? q.accept[0] : q.correct[0];
      expect(isCorrect(q, answer)).toBe(true);
      if (q.kind === "match") expect(q.rows.length).toBeLessThanOrEqual(3);
      if (q.kind === "multi") expect(isCorrect(q, [...q.correct, "invalid"])).toBe(false);
    }
  }
  for (const q of questionBank()) {
    if (q.kind !== "tf") expect(q.correct.every(a => q.options.includes(a))).toBe(true);
    expect(q.correct.every(a => a.length <= 150)).toBe(true);
  }
});

test("custom module counts are exact, omit unchecked modules, and cover selected types", () => {
  const custom: PartySettings = { ...settings, count: 15, moduleCounts: { M1: 5, M2: 10 }, types: ["scenario", "mc", "tf2", "tf", "multi", "blank", "match"] };
  for (let draw = 0; draw < 40; draw++) {
    const qs = selectQuestions(custom);
    expect(qs).toHaveLength(15);
    expect(qs.filter(q => q.module === "M1")).toHaveLength(5);
    expect(qs.filter(q => q.module === "M2")).toHaveLength(10);
    expect(qs.some(q => q.module === "M3")).toBe(false);
    expect(new Set(qs.map(q => q.kind)).size).toBe(7);
  }
  expect(selectQuestions({ ...settings, count: 1, moduleCounts: { M3: 1 } })).toHaveLength(1);
  for (const moduleCounts of [{}, { M1: 0 }, { M1: -1 }, { M1: 1.5 }, { M1: 21 }]) expect(() => selectQuestions({ ...settings, moduleCounts })).toThrow("Select at least one module");
  expect(() => selectQuestions({ ...settings, count: 6, moduleCounts: { M1: 5 } })).toThrow("total");
  expect(() => selectQuestions({ ...settings, count: 20, moduleCounts: { M1: 20 } })).toThrow("Module 1");
});
test("custom counts persist in a lobby and survive into the started game", async () => {
  const { t, partyId } = await setup(false);
  const custom: PartySettings = { ...settings, count: 7, moduleCounts: { M1: 2, M3: 5 } };
  await t.mutation(api.parties.configure, { token: a, partyId, settings: custom });
  expect((await t.query(api.parties.discover, { token: b }))[0].settings.moduleCounts).toEqual({ M1: 2, M3: 5 });
  for (const token of [b, c]) await t.mutation(api.parties.act, { token, partyId, action: "ready", revision: 1 });
  await t.mutation(api.parties.act, { token: a, partyId, action: "start" });
  const raw = await t.run(ctx => ctx.db.get(partyId));
  expect(raw!.questions.filter(q => q.module === "M1")).toHaveLength(2);
  expect(raw!.questions.filter(q => q.module === "M3")).toHaveLength(5);
  expect((await t.query(api.parties.get, { token: b, partyId }))?.total).toBe(7);
});
