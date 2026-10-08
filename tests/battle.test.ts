/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api, internal } from "../convex/_generated/api";
import schema from "../convex/schema";
import data from "../content/msys-50/data.json";

const modules = import.meta.glob("../convex/**/*.{ts,js}");
const a = "a".repeat(64), b = "b".repeat(64), c = "c".repeat(64);
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

async function setup() {
  const t = convexTest(schema, modules);
  await t.mutation(api.battle.register, { token: a, name: "Alice" });
  await t.mutation(api.battle.register, { token: b, name: "Bob" });
  await t.mutation(api.battle.register, { token: c, name: "Charlie" });
  const code = await t.mutation(api.battle.create, { token: a, mode: "mixed" });
  await t.mutation(api.battle.join, { token: b, code });
  return { t, code };
}

test("room privacy, side limits, shared choices, ready gate and immutable answers", async () => {
  const { t, code } = await setup();
  await expect(t.mutation(api.battle.join, { token: c, code })).rejects.toThrow("Both sides");
  await expect(t.query(api.battle.getRoom, { token: c, code })).rejects.toThrow("Join this room");
  const lobby = await t.query(api.battle.getRoom, { token: a, code });
  expect(lobby?.question).toBeNull();
  expect(JSON.stringify(lobby)).not.toContain(a);
  await t.mutation(api.battle.act, { token: a, code, action: "ready" });
  expect((await t.query(api.battle.getRoom, { token: a, code }))?.phase).toBe("lobby");
  await t.mutation(api.battle.act, { token: b, code, action: "ready" });
  const question = await t.query(api.battle.getRoom, { token: a, code });
  expect(question?.question).toEqual((await t.query(api.battle.getRoom, { token: b, code }))?.question);
  expect(question?.result).toBeNull();
  await t.mutation(api.battle.act, { token: a, code, action: "answer", index: 0, answer: 0 });
  await t.mutation(api.battle.act, { token: a, code, action: "answer", index: 0, answer: 1 });
  const waiting = await t.query(api.battle.getRoom, { token: b, code });
  expect(waiting?.yourAnswer).toBeNull();
  expect(waiting?.result).toBeNull();
  expect(waiting?.owner.score).toBe(0);
  expect((await t.query(api.battle.getRoom, { token: a, code }))?.yourAnswer).toBe(0);
  await t.mutation(api.battle.act, { token: b, code, action: "answer", index: 0, answer: 2 });
  expect((await t.query(api.battle.getRoom, { token: a, code }))?.phase).toBe("reveal");
  await t.mutation(api.battle.act, { token: a, code, action: "next", index: 0 });
  expect((await t.query(api.battle.getRoom, { token: a, code }))?.index).toBe(0);
  await t.mutation(api.battle.act, { token: b, code, action: "next", index: 0 });
  await t.mutation(api.battle.act, { token: a, code, action: "answer", index: 0, answer: 0 });
  expect((await t.query(api.battle.getRoom, { token: a, code }))?.yourAnswer).toBeNull();
});

test("complete match scores on the server and updates weekly/all-time standings exactly once", async () => {
  const { t, code } = await setup();
  await t.mutation(api.battle.act, { token: a, code, action: "ready" });
  await t.mutation(api.battle.act, { token: b, code, action: "ready" });
  const raw = await t.run(async (ctx) => ctx.db.query("rooms").withIndex("by_code", q => q.eq("code", code)).unique());
  expect(raw!.questions).toHaveLength(10);
  expect(new Set(raw!.questions).size).toBe(10);
  for (const module of ["M1", "M2", "M3"]) expect(raw!.questions.filter(id => id.startsWith(module)).length).toBeGreaterThanOrEqual(3);
  for (let index = 0; index < 10; index++) {
    const [module, pos] = raw!.questions[index].split("-");
    const question = data.scenarios[module as keyof typeof data.scenarios][Number(pos)];
    const answer = question.o.indexOf(question.a);
    await t.mutation(api.battle.act, { token: a, code, action: "answer", index, answer });
    await t.mutation(api.battle.act, { token: b, code, action: "answer", index, answer: (answer + 1) % question.o.length });
    await t.mutation(api.battle.act, { token: a, code, action: "next", index });
    await t.mutation(api.battle.act, { token: b, code, action: "next", index });
  }
  const done = await t.query(api.battle.getRoom, { token: a, code });
  expect(done?.phase).toBe("finished");
  expect(done?.owner.score).toBe(10);
  expect(done?.guest?.score).toBe(0);
  expect(done?.review).toHaveLength(10);
  await t.mutation(api.battle.act, { token: b, code, action: "next", index: 9 });
  for (const weekly of [false, true]) {
    const rows = await t.query(api.battle.leaderboard, { weekly });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ name: "Alice", wins: 1, matches: 1, accuracy: 100 });
    expect(rows[1]).toMatchObject({ name: "Bob", wins: 0, matches: 1, accuracy: 0 });
    expect(JSON.stringify(rows)).not.toContain(a);
  }
  await t.mutation(api.battle.register, { token: a, name: "Alicia" });
  expect((await t.query(api.battle.leaderboard, { weekly: false }))[0].name).toBe("Alicia");
});

test("server timeout marks missing answers, stale timers do not advance the next question", async () => {
  const { t, code } = await setup();
  await t.mutation(api.battle.act, { token: a, code, action: "ready" });
  await t.mutation(api.battle.act, { token: b, code, action: "ready" });
  const raw = await t.run(async ctx => ctx.db.query("rooms").withIndex("by_code", q => q.eq("code", code)).unique());
  await t.mutation(api.battle.act, { token: a, code, action: "answer", index: 0, answer: 0 });
  vi.advanceTimersByTime(60_001);
  await t.finishInProgressScheduledFunctions();
  const reveal = await t.query(api.battle.getRoom, { token: a, code });
  expect(reveal?.phase).toBe("reveal");
  expect(reveal?.result?.guestAnswer).toBe(-1);
  await t.mutation(api.battle.act, { token: a, code, action: "next", index: 0 });
  await t.mutation(api.battle.act, { token: b, code, action: "next", index: 0 });
  await t.mutation(internal.battle.timeout, { roomId: raw!._id, index: 0 });
  expect((await t.query(api.battle.getRoom, { token: a, code }))?.phase).toBe("question");
});

test("leaving cancels without leaderboard points; nicknames and browser tokens are validated", async () => {
  const { t, code } = await setup();
  await expect(t.mutation(api.battle.register, { token: "short", name: "X" })).rejects.toThrow("Invalid browser identity");
  await expect(t.mutation(api.battle.register, { token: a, name: "<script>" })).rejects.toThrow("nickname");
  await t.mutation(api.battle.act, { token: a, code, action: "ready" });
  await t.mutation(api.battle.act, { token: b, code, action: "ready" });
  await t.mutation(api.battle.act, { token: b, code, action: "leave" });
  expect((await t.query(api.battle.getRoom, { token: a, code }))?.phase).toBe("cancelled");
  expect(await t.query(api.battle.leaderboard, { weekly: false })).toEqual([]);
});

test("module-only draws, empty guest slot reuse, and room expiry", async () => {
  const { t, code } = await setup();
  await t.mutation(api.battle.act, { token: b, code, action: "leave" });
  expect((await t.query(api.battle.getRoom, { token: a, code }))?.guest).toBeNull();
  await t.mutation(api.battle.join, { token: c, code });
  expect((await t.query(api.battle.getRoom, { token: a, code }))?.guest?.name).toBe("Charlie");
  vi.advanceTimersByTime(10_001);
  const nextCode = await t.mutation(api.battle.create, { token: a, mode: "M2" });
  expect((await t.query(api.battle.getRoom, { token: a, code }))?.phase).toBe("cancelled");
  await t.mutation(api.battle.join, { token: b, code: nextCode });
  for (const token of [a, b]) await t.mutation(api.battle.act, { token, code: nextCode, action: "ready" });
  const raw = await t.run(async ctx => ctx.db.query("rooms").withIndex("by_code", q => q.eq("code", nextCode)).unique());
  expect(raw!.questions.every(q => q.startsWith("M2-"))).toBe(true);
  for (let index = 0; index < 10; index++) {
    for (const token of [a, b]) await t.mutation(api.battle.act, { token, code: nextCode, action: "answer", index, answer: 0 });
    for (const token of [a, b]) await t.mutation(api.battle.act, { token, code: nextCode, action: "next", index });
  }
  const rows = await t.query(api.battle.leaderboard, { weekly: false });
  expect(rows.every(r => r.draws === 1 && r.wins === 0 && r.matches === 1)).toBe(true);
  vi.advanceTimersByTime(10_001);
  const expiredCode = await t.mutation(api.battle.create, { token: a, mode: "M1" });
  const expired = await t.run(async ctx => ctx.db.query("rooms").withIndex("by_code", q => q.eq("code", expiredCode)).unique());
  vi.advanceTimersByTime(2 * 60 * 60_000 + 1);
  await t.mutation(internal.battle.expire, { roomId: expired!._id });
  expect((await t.query(api.battle.getRoom, { token: a, code: expiredCode }))?.phase).toBe("cancelled");
  await expect(t.mutation(api.battle.join, { token: b, code: expiredCode })).rejects.toThrow("expired");
});

test("scenario bank has valid, distinct choices and lesson explanations", () => {
  for (const pool of Object.values(data.scenarios)) for (const q of pool) {
    expect(q.o.includes(q.a)).toBe(true);
    expect(new Set(q.o).size).toBe(q.o.length);
    expect(q.w).toBeTruthy();
  }
});

test("leaderboard ranks only by wins and equal wins share a rank in both periods", async () => {
  const { t } = await setup();
  const date = new Date(Date.now());
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  for (const period of ["all", date.toISOString().slice(0, 10)]) {
    await t.run(async ctx => {
      for (const [token, wins, correct, draws, matches] of [[a, 2, 1, 0, 2], [b, 2, 10, 10, 20], [c, 1, 10, 20, 30]] as const) {
        const p = await ctx.db.query("players").withIndex("by_token", q => q.eq("token", token)).unique();
        await ctx.db.insert("standings", { player: p!._id, name: p!.name, period, wins, correct, answered: 10, draws, matches });
      }
    });
  }
  for (const weekly of [false, true]) {
    const rows = await t.query(api.battle.leaderboard, { weekly });
    expect(rows.map(r => [r.wins, r.rank])).toEqual([[2, 1], [2, 1], [1, 3]]);
    expect(rows.filter(r => r.rank === 1).map(r => r.name).sort()).toEqual(["Alice", "Bob"]);
  }
});

test("nicknames are globally unique across case, spacing and normalized Unicode; edits keep scores and party names in sync", async () => {
  const { t, code } = await setup();
  for (const name of [" ALICE ", "alice", "Ａｌｉｃｅ", "Ali\u200bce"]) await expect(t.mutation(api.battle.register, { token: c, name })).rejects.toThrow("already taken");
  await expect(t.mutation(api.battle.register, { token: "d".repeat(64), name: "Bob" })).rejects.toThrow("already taken");
  await t.mutation(api.battle.register, { token: a, name: "ALICE" });
  expect(await t.query(api.battle.profile, { token: a })).toEqual({ name: "ALICE" });
  await t.mutation(api.battle.register, { token: b, name: "Bobby" });
  await t.mutation(api.battle.register, { token: c, name: "Bob" });
  expect((await t.query(api.battle.getRoom, { token: a, code }))?.guest?.name).toBe("Bobby");
});

test("legacy duplicate repair preserves wins, avoids occupied suffixes, and is idempotent", async () => {
  const t = convexTest(schema, modules);
  await t.mutation(api.battle.register, { token: a, name: "Alice" });
  vi.advanceTimersByTime(10);
  const duplicate = await t.run(ctx => ctx.db.insert("players", { token: b, name: " alice ", lastRoomAt: 0 }));
  vi.advanceTimersByTime(10);
  await t.mutation(api.battle.register, { token: c, name: "Alice 2" });
  await expect(t.mutation(api.battle.register, { token: "d".repeat(64), name: "ALICE" })).rejects.toThrow("taken");
  await t.run(ctx => ctx.db.insert("standings", { player: duplicate, period: "all", name: " alice ", wins: 7, draws: 2, matches: 9, correct: 20, answered: 30 }));
  expect(await t.mutation(internal.battle.dedupeNicknames, {})).toEqual({ profiles: 3, renamed: 1 });
  expect(await t.query(api.battle.profile, { token: b })).toEqual({ name: "alice 3" });
  expect((await t.query(api.battle.leaderboard, { weekly: false }))[0]).toMatchObject({ name: "alice 3", wins: 7, draws: 2, matches: 9 });
  expect((await t.mutation(internal.battle.dedupeNicknames, {})).renamed).toBe(0);
  await expect(t.mutation(api.battle.register, { token: "d".repeat(64), name: "ALICE 3" })).rejects.toThrow("taken");
});
