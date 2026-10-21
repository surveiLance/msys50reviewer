import { expect, test } from "vitest";
import raw from "../content/msys-50/data.json";
import { expandQuestionData } from "../content/msys-50/fresh";
import { poolModule, modifiedPrompt } from "../lib/questions";
import type { SubjectData } from "../lib/types";

test("every modified true-or-false prompt identifies the text being evaluated", () => {
  const data = expandQuestionData(raw as unknown as SubjectData);
  const missing = Object.entries(data.tests).flatMap(([module, sets]) =>
    poolModule(sets, module).tf.filter(q => q.kind === "tf" && !/<u>\S[\s\S]*?<\/u>/.test(q.prompt)).map(q => q.id));
  expect(missing).toEqual([]);
});

test("saved prompts gain emphasis without changing wording or existing underlines", () => {
  const saved = "Zachman classifies artifacts using perspectives and product abstractions.";
  expect(modifiedPrompt(saved)).toBe("Zachman classifies artifacts using <u>perspectives and product abstractions</u>.");
  expect(modifiedPrompt(modifiedPrompt(saved))).toBe(modifiedPrompt(saved));
  expect(modifiedPrompt("Why addresses <u>network locations</u>.")).toBe("Why addresses <u>network locations</u>.");
});
