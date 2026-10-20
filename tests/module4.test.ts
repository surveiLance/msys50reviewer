import { expect, test } from "vitest";
import raw from "../content/msys-50/data.json";
import { expandQuestionData } from "../content/msys-50/fresh";
import { poolModule, grade, QTYPES, pickTypes } from "../lib/questions";
import { examData } from "../lib/studyStructure";
import { questionBank, selectQuestions } from "../convex/partyQuestions";
import { readNotes } from "../lib/notes";
import type { SubjectData, SubjectMeta } from "../lib/types";

const data = expandQuestionData(raw as unknown as SubjectData);
test("Module 4 provides playable rounds in every solo question type with valid grading", () => {
  expect(data.tests["module-4"]).toBeDefined();
  const pool = poolModule(data.tests["module-4"], "module-4", data.multi?.["module-4"], data.blanks?.["module-4"]);
  for (const { key } of QTYPES) {
    expect(pool[key].length, key).toBeGreaterThanOrEqual(key === "match" ? 3 : 10);
    for (const q of pool[key]) {
      const a = q.kind === "tf" ? { text: q.answer } : q.kind === "tf2" ? { choice: q.isTrue ? "True" : "False" } : q.kind === "multi" ? { checks: q.correct } : q.kind === "match" ? { picks: q.rows.map(r => r.answer) } : { choice: q.answer };
      expect(grade(q, a).points).toBe(grade(q, a).max);
      if (q.kind === "mc") { expect(new Set(q.options).size).toBe(q.options.length); expect(q.options).toContain(q.answer); expect(q.why).toBeTruthy(); }
      if (q.kind !== "match") expect(q.source).toMatch(/^4\.[123]/);
    }
  }
  expect(data.cards["module-4"].length).toBeGreaterThanOrEqual(40);
  expect(data.alternative?.["module-4"]?.length).toBeGreaterThanOrEqual(12);
  const round = pickTypes(pool, { tf: 4, tf2: 4, mc: 10, multi: 4, blank: 4, match: 3 }, []).qs;
  expect(new Set(round.map(q => q.id)).size).toBe(round.length);
});
test("Module 4 notes split into three readable parts and preserve review anchors", () => {
  let parts: ReturnType<typeof readNotes> = [];
  try { parts = readNotes("msys-50", "module-4"); } catch { /* Missing content is the behavior under test. */ }
  expect(parts.map(p => p.id)).toEqual(["p-4-1", "p-4-2", "p-4-3"]);
  for (const part of parts) {
    expect(part.sections.length).toBeGreaterThanOrEqual(4);
    expect(part.sections.every(s => s.id && s.title && s.html.trim())).toBe(true);
  }
});
test("Module 4 is available to party draws, with quotas and all battle types supported", () => {
  const bank = questionBank().filter(q => q.module === "M4");
  expect(bank.length).toBeGreaterThan(60);
  for (const kind of ["scenario", "mc", "tf", "tf2", "multi", "blank", "match"] as const) {
    const qs = selectQuestions({ mode: "mixed", moduleCounts: { M4: kind === "match" ? 3 : 10 }, count: kind === "match" ? 3 : 10, types: [kind], seconds: 60, capacity: 4 });
    expect(qs.every(q => q.module === "M4" && q.kind === kind)).toBe(true);
  }
});
test("new course content never enters the archived midterm or mutates old banks", () => {
  const subject = { modules: [], exam: { modules: ["module-1", "module-2", "module-3"] } } as unknown as SubjectMeta;
  expect(data.tests["module-4"]).toBeDefined();
  expect(examData(subject, data).tests["module-4"]).toBeUndefined();
  expect(examData(subject, data).scenarios.M4).toBeUndefined();
  expect(examData(subject, data).alternative?.["module-4"]).toBeUndefined();
  expect(data.tests["module-1"]["1"]).toBe(raw.tests["module-1"]["1"]);
});
