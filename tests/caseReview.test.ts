import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import CaseReview, { caseTitle } from "../components/CaseReview";
import { getSubjectData } from "../lib/subjects";
import type { AttemptReviewItem } from "../lib/scores";

test("all finals case snapshots render statement feedback without repeating the case or citations", () => {
  const bank = Object.values(getSubjectData("msys-50")!.finalCases!).flat();
  expect(bank).toHaveLength(114);
  for (const q of bank) {
    if (q.kind !== "mc" && q.kind !== "multi") throw new Error("Expected a long case");
    const item: AttemptReviewItem = {
      type: q.kind === "mc" && q.caseFormat === "best" ? "Best answer" : q.kind, prompt: q.prompt, explanation: q.why, source: q.source,
      your: [q.options[0]], correct: q.kind === "mc" ? [q.answer] : q.correct,
      points: 0, max: q.kind === "mc" ? 1 : 2,
    };
    expect(caseTitle(item), q.source).toBeTruthy();
    const html = renderToStaticMarkup(createElement(CaseReview, { item, showContext: true }));
    expect(html, q.source).toContain('<details class="case-context">');
    expect(html.match(/class="case-reason"/g), q.source).toHaveLength(q.kind === "mc" && !q.caseFormat ? 3 : 4);
    if (item.type === "Best answer") {
      expect(html).toContain('case-verdict right">Best answer');
      expect(html).toContain('<details class="case-other-options">');
      expect(html).not.toContain("Correct · missed");
    }
    expect(html.match(/<summary>Source<\/summary>/g), q.source).toHaveLength(1);
    expect(html, q.source).not.toMatch(/(?:\[|\()\d+\.\d+ slides?/i);
  }
});
