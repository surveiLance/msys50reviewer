import { expect, test } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readNotes } from "../lib/notes";
import Module5Learning from "../components/Module5Learning";
import { AdditionalVisual, additionalLessons } from "../components/Module5AdditionalLessons";

test("Module 5 starts with an actionable visual lesson rather than the full text wall", () => {
  const html = renderToStaticMarkup(createElement(Module5Learning, { parts: readNotes("msys-50", "module-5") }));
  expect(html).toContain("Learn 5.1 step by step");
  expect(html).toContain("Full notes &amp; guide answers");
  expect(html).toContain("Why model anything?");
  expect(html).toContain("visual-enrollment");
  expect(html).toMatch(/<h3[^>]*tabindex="-1"/);
  expect(html).not.toContain('id="m5-purpose"');
});

test("every additional guided idea has a working full-notes destination and an answer explanation", () => {
  const parts = readNotes("msys-50", "module-5");
  for (const part of ["5.2", "5.3"] as const) {
    const notes = parts.find(p => p.num === part)!;
    for (const lesson of additionalLessons[part]) {
      expect(notes.sections[lesson.section - 1]?.html.trim()).toBeTruthy();
      expect(lesson.options[lesson.correct]).toBeTruthy();
      expect(lesson.why.length).toBeGreaterThan(20);
    }
  }
  const coverage = renderToStaticMarkup(createElement(AdditionalVisual, { part: "5.2", step: 2 }));
  expect(coverage).toContain("One layer and one aspect highlighted");
  const trace = renderToStaticMarkup(createElement(AdditionalVisual, { part: "5.3", step: 3 }));
  expect(trace).toContain("RDBMS Server Cluster"); expect(trace).toContain("Database Storage Service");
  expect(trace).toContain("realizes"); expect(trace).toContain("serves");
});
