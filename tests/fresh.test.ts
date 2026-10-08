import { expect, test } from "vitest";
import raw from "../content/msys-50/data.json";
import { expandQuestionData, freshBanks } from "../content/msys-50/fresh";
import type { SubjectData } from "../lib/types";
import { questionBank, questionKey, selectQuestions } from "../convex/partyQuestions";
import { poolModule, poolMidterm, poolScenarioMidterm } from "../lib/questions";

test("new authored questions have valid answers, explanations, sources, and no out-of-scope modules", () => {
  expect(Object.keys(freshBanks)).toEqual(["module-1", "module-2", "module-3"]);
  const prompts = new Set<string>();
  let count = 0;
  for (const bank of Object.values(freshBanks)) {
    for (const q of bank.scenarios) {
      expect(new Set(q.o).size).toBe(q.o.length); expect(q.o).toContain(q.a); expect(q.w).toBeTruthy(); expect(q.r).toBeTruthy();
      expect(prompts.has(q.q)).toBe(false); prompts.add(q.q); count++;
    }
    for (const q of bank.tf) { expect(q.r).toBeTruthy(); if (!q.t) { expect(q.s).toMatch(/<u>.+<\/u>/); expect(q.a).toContain(q.d); } count++; }
    for (const q of bank.multi) { expect(q.a.length).toBeGreaterThan(1); expect(q.a.length).toBeLessThan(q.o.length); q.a.forEach(a => expect(q.o).toContain(a)); expect(q.w).toBeTruthy(); count++; }
    for (const q of bank.blanks) { expect(q.s).toContain("___"); expect(q.bank).toContain(q.a); expect(q.w).toBeTruthy(); count++; }
    expect(bank.matching.items.length).toBeGreaterThanOrEqual(5); count++;
  }
  expect(count).toBe(72);
});
test("expanded banks reach module, midterm, scenario and battle pools without replacing originals", () => {
  const original = raw as unknown as SubjectData, data = expandQuestionData(original);
  expect(data.cards).toBe(original.cards);
  for (const [slug, bank] of Object.entries(freshBanks)) {
    expect(data.tests[slug]["1"]).toBe(original.tests[slug]["1"]);
    const pool = poolModule(data.tests[slug], slug, data.multi?.[slug], data.blanks?.[slug]);
    expect(pool.mc.some(q => q.prompt === bank.scenarios[0].q)).toBe(true);
  }
  const midterm = poolMidterm(data.midterm, data.pools, data.scenarios, data.tests, data.multi, data.blanks);
  const scenarios = poolScenarioMidterm(data.scenarios);
  const battle = questionBank();
  for (const bank of Object.values(freshBanks)) for (const q of bank.scenarios) {
    expect(midterm.mc.some(item => item.prompt === q.q)).toBe(true);
    expect(scenarios.mc.some(item => item.prompt === q.q)).toBe(true);
    expect(battle.some(item => item.kind === "scenario" && item.prompt === q.q && item.source === q.r)).toBe(true);
  }
  expect(battle.some(q => q.explanation && q.prompt === "Once an enterprise approves a future-state architecture, its architecture work is complete.")).toBe(true);
});
test("battle avoids recent questions across scenario/MC types and still respects exact module counts", () => {
  const settings = { mode: "mixed" as const, types: ["scenario" as const], count: 15, seconds: 60, capacity: 4, moduleCounts: { M1: 5, M2: 5, M3: 5 } };
  const first = selectQuestions(settings);
  const previous = first.map(questionKey);
  const second = selectQuestions(settings, previous);
  expect(second.some(q => previous.includes(questionKey(q)))).toBe(false);
  for (const module of ["M1", "M2", "M3"]) expect(second.filter(q => q.module === module)).toHaveLength(5);
  const mc = selectQuestions({ ...settings, types: ["mc"] }, previous);
  expect(mc.some(q => previous.includes(questionKey(q)))).toBe(false);
  const matching = selectQuestions({ ...settings, count: 3, types: ["match"], moduleCounts: { M1: 1, M2: 1, M3: 1 } });
  expect(matching.every(q => q.rotationKey && q.rows.length === 3)).toBe(true);
});
