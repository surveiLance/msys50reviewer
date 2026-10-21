import { expect, test } from "vitest";
import raw from "../content/msys-50/data.json";
import { expandQuestionData } from "../content/msys-50/fresh";
import { poolModule, modifiedPrompt, grade, type Question } from "../lib/questions";
import type { SubjectData } from "../lib/types";

test("every modified true-or-false prompt identifies the text being evaluated", () => {
  const data = expandQuestionData(raw as unknown as SubjectData);
  const missing = Object.entries(data.tests).flatMap(([module, sets]) =>
    poolModule(sets, module).tf.filter(q => q.kind === "tf" && !/<u>\S[\s\S]*?<\/u>/.test(q.prompt)).map(q => q.id));
  expect(missing).toEqual([]);
});

test("numeric replacements accept equivalent ranges but not different quantities or limits", () => {
  const q: Question = { kind: "tf", id: "saved", section: "", prompt: "Successful EA practices usually use <u>all 24</u> CSVLOD subtypes.", isTrue: false, accept: ["about 10–15"], answer: "about 10–15" };
  for (const text of ["10–15", "10-15", "10 to 15", "ten to fifteen", "about 10–15"]) expect(grade(q, { text }).points, text).toBe(1);
  for (const text of ["1015", "10", "15", "10–16", "!", "at least 10–15"]) expect(grade(q, { text }).points, text).toBe(0);
  const horizon = { ...q, accept: ["three to five"], answer: "three to five" };
  expect(grade(horizon, { text: "3–5" }).points).toBe(1);
  const limit = { ...q, accept: ["up to one year"], answer: "up to one year" };
  expect(grade(limit, { text: "up to 1 year" }).points).toBe(1);
  expect(grade(limit, { text: "1 year" }).points).toBe(0);
  const units = { ...q, accept: ["6–12 months"], answer: "6–12 months" };
  expect(grade(units, { text: "six to twelve months" }).points).toBe(1);
  expect(grade(units, { text: "6–12 years" }).points).toBe(0);
});

test("saved prompts gain emphasis without changing wording or existing underlines", () => {
  const saved = "Zachman classifies artifacts using perspectives and product abstractions.";
  expect(modifiedPrompt(saved)).toBe("Zachman classifies artifacts using <u>perspectives and product abstractions</u>.");
  expect(modifiedPrompt(modifiedPrompt(saved))).toBe(modifiedPrompt(saved));
  expect(modifiedPrompt("Why addresses <u>network locations</u>.")).toBe("Why addresses <u>network locations</u>.");
});
