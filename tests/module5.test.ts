import { expect, test } from "vitest";
import { readNotes } from "../lib/notes";
import raw from "../content/msys-50/data.json";
import { expandQuestionData } from "../content/msys-50/fresh";
import { poolModule, grade, QTYPES } from "../lib/questions";
import type { SubjectData } from "../lib/types";
import { SUBJECTS, getSubjectData } from "../lib/subjects";
import { examData, studyGroups } from "../lib/studyStructure";
import { listTests } from "../lib/tests";
import { selectQuestions, questionBank, questionKey, type PartySettings } from "../convex/partyQuestions";

test("Module 5 reader delivers three navigable parts and all 18 guide answers", () => {
  let parts: ReturnType<typeof readNotes> = [];
  try { parts = readNotes("msys-50", "module-5"); } catch { /* Missing notes are the regression. */ }
  expect(parts.map(p => p.id)).toEqual(["p-5-1", "p-5-2", "p-5-3"]);
  expect(parts.map(p => [...p.sections.flatMap(s => [...s.html.matchAll(/<details class="qa">/g)])].length)).toEqual([9, 5, 4]);
  for (const p of parts) {
    expect(p.sections.length).toBeGreaterThanOrEqual(5);
    expect(p.sections.every(s => s.id && s.title && s.html.trim())).toBe(true);
  }
  const html = parts.map(p => p.intro + p.sections.map(s => s.html).join("")).join("");
  for (const id of ["m5-analysis", "m5-transformation", "m5-claims-layers", "m5-claims-phases", "m5-views", "m5-purpose", "m5-content", "m5-service-stack", "m5-core", "m5-academic"]) {
    expect(html, id).toContain(`id="${id}"`);
  }
});

test("Module 5 registers as a finals lesson without entering archived exams or modifying earlier banks", () => {
  const subject = SUBJECTS.find(s => s.slug === "msys-50")!;
  const data = getSubjectData("msys-50")!;
  expect(studyGroups(subject).find(g => g.id === "finals")?.modules.map(m => m.slug)).toContain("module-5");
  expect(listTests(subject, data).find(t => t.slug === "module-5")?.bank).toBeGreaterThan(100);
  const exam = examData(subject, data);
  expect(Object.keys(exam.tests)).toEqual(["module-1", "module-2", "module-3"]);
  expect(exam.pools.M5).toBeUndefined(); expect(exam.scenarios.M5).toBeUndefined(); expect(exam.alternative?.["module-5"]).toBeUndefined();
  expect(data.tests["module-1"]["1"]).toBe(raw.tests["module-1"]["1"]);
  const twice = expandQuestionData(raw as unknown as SubjectData);
  expect(data.cards["module-4"]).toEqual(twice.cards["module-4"]);
});

test("M5 party quotas and single-module mode draw all seven types without altering old mixed defaults", () => {
  for (const kind of ["scenario", "mc", "tf", "tf2", "multi", "blank", "match"] as const) {
    const settings = { mode: "mixed", moduleCounts: { M5: 10 }, count: 10, types: [kind], seconds: 60, capacity: 4 } as unknown as PartySettings;
    const qs = selectQuestions(settings);
    expect(qs).toHaveLength(10);
    expect(qs.every(q => q.module === "M5" && q.kind === kind)).toBe(true);
    expect(new Set(qs.map(questionKey)).size).toBe(10);
  }
  const single = selectQuestions({ mode: "M5", count: 10, types: ["mc"], seconds: 60, capacity: 4 } as unknown as PartySettings);
  expect(single.every(q => q.module === "M5")).toBe(true);
  const legacy = selectQuestions({ mode: "mixed", count: 10, types: ["mc"], seconds: 60, capacity: 4 });
  expect(legacy.every(q => ["M1", "M2", "M3"].includes(q.module))).toBe(true);
  for (const q of questionBank().filter(q => q.module === "M5" && q.kind === "tf")) expect(q.prompt).toMatch(/<u>.+?<\/u>/);
});

test("Module 5 supplies fair playable questions with references across all solo types", () => {
  const data = expandQuestionData(raw as unknown as SubjectData);
  expect(data.tests["module-5"]).toBeDefined();
  const pool = poolModule(data.tests["module-5"] ?? {}, "module-5", data.multi?.["module-5"], data.blanks?.["module-5"]);
  for (const { key } of QTYPES) {
    expect(pool[key].length, key).toBeGreaterThanOrEqual(key === "match" ? 3 : 10);
    for (const q of pool[key]) {
      const answer = q.kind === "tf" ? { text: q.answer } : q.kind === "tf2" ? { choice: q.isTrue ? "True" : "False" } : q.kind === "match" ? { picks: q.rows.map(r => r.answer) } : q.kind === "multi" ? { checks: q.correct } : { choice: q.answer };
      expect(grade(q, answer).points, q.id).toBe(grade(q, answer).max);
      if (q.kind === "tf") { expect(q.prompt).toMatch(/<u>.+?<\/u>/); expect(q.why).toBeTruthy(); }
      if (q.kind === "match") { expect(new Set(q.rows.map(r => r.answer)).size).toBe(q.rows.length); continue; }
      expect(q.source).toMatch(/^5\.[123]/);
      if (q.kind === "mc") { expect(new Set(q.options).size).toBe(q.options.length); expect(q.options).toContain(q.answer); }
      if (q.kind === "multi") { expect(new Set(q.options).size).toBe(q.options.length); expect(q.correct.every(a => q.options.includes(a))).toBe(true); }
    }
  }
  expect(data.cards["module-5"].length).toBeGreaterThan(50);
  const queries = [
    ["Analytical and simulation", "How the analysis is performed"],
    ["agreements with the representation", "Validation"],
    ["implements an application service", "Realizes"],
  ];
  for (const [stem, answer] of queries) {
    const q = pool.mc.find(q => q.kind === "mc" && q.prompt.includes(stem));
    expect(q, stem).toBeDefined();
    expect(q?.kind === "mc" && q.answer).toBe(answer);
  }
});

test("lesson-grounded replacements and diagram interpretations grade independent fixtures", () => {
  const data = expandQuestionData(raw as unknown as SubjectData);
  const pool = poolModule(data.tests["module-5"], "module-5", data.multi?.["module-5"], data.blanks?.["module-5"]);
  const cases = [
    ["Measuring the cost", "quantitative", "functional"],
    ["In the class analogy", "in", "out"],
    ["Grice's", "quality", "manner"],
    ["Call graphs", "usage", "location"],
    ["Agreement with the potential impact", "commitment", "validation"],
    ["dashed line with a hollow triangle", "realisation", "triggers"],
    ["E-Learning Service is realized", "and ODMS", "alone"],
  ];
  for (const [stem, right, wrong] of cases) {
    const q = pool.tf.find(q => q.kind === "tf" && q.prompt.includes(stem))!;
    expect(q, stem).toBeDefined();
    expect(grade(q, { text: right }).points, right).toBe(1);
    expect(grade(q, { text: wrong }).points, wrong).toBe(0);
  }
  const eLearning = pool.mc.find(q => q.kind === "mc" && q.prompt.startsWith("In the academic diagram, LMS"))!;
  expect(grade(eLearning, { choice: "ODMS" }).points).toBe(1);
  expect(grade(eLearning, { choice: "SIS" }).points).toBe(0);
  const recipient = pool.mc.find(q => q.kind === "mc" && q.prompt.startsWith("A cashier processes"))!;
  expect(grade(recipient, { choice: "The student payment record" }).points).toBe(1);
});

test("overflowing Module 5 tables are named keyboard-focusable regions", () => {
  const parts = readNotes("msys-50", "module-5");
  const html = parts.map(p => p.sections.map(s => s.html).join("")).join("");
  const wrappers = [...html.matchAll(/<div class="tbl"[^>]*>/g)].map(m => m[0]);
  expect(wrappers.length).toBeGreaterThan(10);
  for (const wrapper of wrappers) {
    expect(wrapper).toContain('tabindex="0"');
    expect(wrapper).toContain('role="region"');
    expect(wrapper).toContain('aria-label="');
  }
});
