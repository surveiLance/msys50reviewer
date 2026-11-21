import type { AlternativeQuestion } from "../../lib/types";

export type FinalsCase = {
  format: "best" | "select";
  title: string;
  context: [string, string];
  task: string;
  source: string;
  choices: { text: string; correct: boolean; reason: string }[];
};

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function buildFinalsCases(cases: FinalsCase[]): AlternativeQuestion[] {
  return cases.map(item => {
    const correct = item.choices.filter(choice => choice.correct).map(choice => choice.text);
    const expected = item.format === "best" ? correct.length === 1 : correct.length > 0;
    if (!expected || item.choices.length !== 4 || new Set(item.choices.map(choice => choice.text)).size !== 4) {
      throw new Error(`Invalid answer choices for ${item.title}`);
    }
    const paragraphs = item.context.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("");
    const base = {
      prompt: `<p><strong>${escapeHtml(item.title)}</strong></p>${paragraphs}<p><strong>${escapeHtml(item.task)}</strong></p>`,
      options: item.choices.map(choice => choice.text),
      why: item.choices.map(choice => `“${choice.text}” ${choice.correct ? "Correct." : "Incorrect."} ${choice.reason}`).join("\n"),
      source: item.source,
    };
    return item.format === "best"
      ? { ...base, kind: "mc", caseFormat: "best", answer: correct[0] }
      : { ...base, kind: "multi", correct };
  });
}
