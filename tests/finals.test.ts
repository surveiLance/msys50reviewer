import { expect, test } from "vitest";
import { getSubject, getSubjectData } from "../lib/subjects";
import { readNotes } from "../lib/notes";
import { findSection } from "../lib/peek";
import { listTests } from "../lib/tests";
import { examData } from "../lib/studyStructure";
import * as finals from "../lib/finals";
import { moduleAccuracy, type Attempt } from "../lib/scores";

const subject = getSubject("msys-50")!;
const data = getSubjectData("msys-50")!;
const coverage = ["module-4", "module-5", "module-6"];
test("confirmed finals registers separately from the archived midterm", () => {
  expect(subject.finals?.modules).toEqual(coverage);
  expect(listTests(subject, data).find(t => t.slug === "finals")?.kind).toBe("finals");
  expect(examData(subject, data).tests["module-4"]).toBeUndefined();
});
test("a full finals round balances modules and supports both case formats", () => {
  const pool = finals.finalsPool(data, coverage, true);
  const run = finals.pickFinalsRound(pool, ["mc", "multi"], 30, []);
  expect(run.qs).toHaveLength(30);
  expect(new Set(run.qs.map(q => q.id)).size).toBe(30);
  for (const mod of ["M4", "M5", "M6"]) {
    const questions = run.qs.filter(q => q.kind !== "match" && q.mod === mod);
    expect(questions).toHaveLength(10);
    expect(new Set(questions.map(q => q.kind))).toEqual(new Set(["mc", "multi"]));
  }
});
test("finals case rounds keep full coverage after a type is deselected or history is exhausted", () => {
  const pool = finals.finalsPool(data, coverage, true);
  for (const type of ["mc", "multi"] as const) {
    const first = finals.pickFinalsRound(pool, [type], 10, []);
    const next = finals.pickFinalsRound(pool, [type], 10, first.seen);
    expect(next.qs.some(q => first.qs.some(old => old.id === q.id))).toBe(false);
    const exhausted = finals.pickFinalsRound(pool, [type], 30, pool[type].map(q => q.id));
    expect(exhausted.qs).toHaveLength(30);
    for (const mod of ["M4", "M5", "M6"]) expect(exhausted.qs.filter(q => q.kind !== "match" && q.mod === mod)).toHaveLength(10);
  }
});
test("finals does not import earlier modules or unsupported formats", () => {
  const pool = finals.finalsPool(data, coverage, true);
  const questions = Object.values(pool).flat();
  expect(questions).toHaveLength(60);
  for (const q of questions) {
    expect(["mc", "multi"]).toContain(q.kind);
    if (q.kind === "match") throw new Error("Unexpected matching case");
    expect(["M4", "M5", "M6"]).toContain(q.mod);
    expect(q.source).toMatch(/^[456]\.[123] slide/);
    expect(q.prompt.replace(/<ol[\s\S]*$/, "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).length).toBeGreaterThanOrEqual(120);
    if (q.kind === "mc" || q.kind === "multi") {
      expect(new Set(q.options).size).toBe(q.options.length);
      for (const answer of q.kind === "mc" ? [q.answer] : q.correct) expect(q.options).toContain(answer);
      expect(q.why?.split("\n").length).toBeGreaterThanOrEqual(3);
    }
  }
});
test("concept-review rounds balance module coverage and keep format selection", () => {
  const pool = finals.finalsPool(data, coverage, false);
  const run = finals.pickFinalsRound(pool, ["tf", "mc", "multi", "blank", "match"], 30, []);
  expect(run.qs).toHaveLength(30);
  for (const tag of ["M4", "M5", "M6"]) expect(run.qs.filter(q => q.mod === tag)).toHaveLength(10);
  expect(new Set(run.qs.map(q => q.kind))).toEqual(new Set(["tf", "mc", "multi", "blank", "match"]));
});
test("module strength includes finals items without counting other covered modules", () => {
  const attempt: Attempt = { id: "finals", kind: "finals", at: 1, score: 9, max: 30, answered: 30, byModule: { M4: [7, 10], M5: [2, 10], M6: [0, 10] }, parts: [] };
  expect(moduleAccuracy([attempt], "module-4", 4)).toMatchObject({ correct: 7, total: 10, pct: 70 });
  expect(moduleAccuracy([attempt], "module-1", 1)).toMatchObject({ correct: 0, total: 0 });
});

test("short rounds redistribute places when a covered bank has fewer questions", () => {
  const q = (id: string, mod: string) => ({ kind: "mc" as const, id, mod, section: "Case", prompt: id, options: ["A", "B"], answer: "A" });
  const pool = { tf: [], tf2: [], match: [], blank: [], multi: [], mc: [q("a", "M4"), ...Array.from({ length: 5 }, (_, i) => q(`b${i}`, "M5")), ...Array.from({ length: 5 }, (_, i) => q(`c${i}`, "M6"))] };
  const run = finals.pickFinalsRound(pool, ["mc"], 10, []);
  expect(run.qs).toHaveLength(10);
  expect(run.qs.filter(q => q.mod === "M4")).toHaveLength(1);
  expect(new Set(run.qs.map(q => q.id)).size).toBe(10);
});
test("checking both true-or-false formats never duplicates one statement within a finals round", () => {
  const pool = finals.finalsPool(data, coverage, false);
  const run = finals.pickFinalsRound(pool, ["tf", "tf2"], 30, []);
  expect(run.qs).toHaveLength(30);
  expect(new Set(run.qs.map(q => q.id)).size).toBe(30);
});

test("answer review follows the cited slide despite distracting company context", () => {
  for (const [module, source, part, expected, prompt] of [
    ["module-4", "4.2 slide 9", "p-4-2", 2, "A company lists TOGAF’s main components: Architecture Capability Framework, Enterprise Continuum, Architecture Content Framework and ADM."],
    ["module-5", "5.1 slide 13", "p-5-1", 6, "A team establishes scope, purpose and focus, selects viewpoints, creates and structures models, visualizes them, uses them, and maintains them."],
  ] as const) {
    const question = { kind: "mc" as const, id: source, section: "Case", prompt, answer: "Only I", options: ["Only I"], source };
    expect(findSection({ [module]: readNotes(subject.slug, module) }, question, undefined, part)?.index).toBe(expected);
  }
});
