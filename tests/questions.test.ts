import { afterEach, expect, test, vi } from "vitest";
import { pickTypes, type Pool, type Question, type QType } from "../lib/questions";

const pool = (): Pool => ({ tf: [], tf2: [], mc: [], multi: [], blank: [], match: [] });
const counts = (type: QType, n: number): Record<QType, number> => ({ tf: 0, tf2: 0, mc: 0, multi: 0, blank: 0, match: 0, [type]: n });
const mc = (id: string, mod = "M1"): Question => ({ id, kind: "mc", mod, prompt: id, section: "Practice", options: ["Right", "Wrong"], answer: "Right" });
afterEach(() => vi.restoreAllMocks());

test("rounds rotate oldest-first after exhaustion without immediately repeating recent questions", () => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  const p = pool(); p.mc = Array.from({ length: 12 }, (_, i) => mc(`c:${i}`));
  let seen: string[] = [];
  let previous: string[] = [];
  const covered = new Set<string>();
  for (let i = 0; i < 10; i++) {
    const round = pickTypes(p, counts("mc", 5), seen);
    const ids = round.qs.map(q => q.id);
    expect(ids.some(id => previous.includes(id))).toBe(false);
    ids.forEach(id => covered.add(id));
    seen = round.seen; previous = ids;
  }
  expect(covered.size).toBe(12);
  expect(seen.length).toBe(12);
});

test("fresh questions win over repeats and tiny banks still fill the round uniquely", () => {
  const p = pool(); p.mc = [mc("old"), mc("recent"), mc("fresh")];
  const round = pickTypes(p, counts("mc", 2), ["old", "recent"]);
  expect(new Set(round.qs.map(q => q.id))).toEqual(new Set(["fresh", "old"]));
  expect(pickTypes(p, counts("mc", 3), round.seen).qs).toHaveLength(3);
});

test("matching rotates unseen rows before revisiting previously tested rows", () => {
  const p = pool(); p.match = [{ kind: "match", id: "matching", section: "Terms", inst: "Match", options: ["A"], rows: Array.from({ length: 15 }, (_, i) => ({ prompt: `Row ${i}`, answer: "A" })) }];
  let seen: string[] = []; const covered = new Set<string>();
  for (let i = 0; i < 3; i++) {
    const round = pickTypes(p, counts("match", 1), seen);
    const q = round.qs[0]; if (q.kind !== "match") throw new Error("Expected matching");
    q.rows.forEach(row => { expect(covered.has(row.prompt)).toBe(false); covered.add(row.prompt); });
    seen = round.seen;
  }
  expect(covered.size).toBe(15);
});

test("regular mixed-module questions are balanced too", () => {
  const p = pool(); p.mc = ["M1", "M2", "M3"].flatMap(m => Array.from({ length: 10 }, (_, i) => mc(`${m}:${i}`, m)));
  const round = pickTypes(p, counts("mc", 6), []);
  for (const mod of ["M1", "M2", "M3"]) expect(round.qs.filter(q => q.kind !== "match" && q.mod === mod)).toHaveLength(2);
});
