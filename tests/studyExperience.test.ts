import { expect, test } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import NotesReader from "../components/NotesReader";
import StudyExperience from "../components/StudyExperience";
import { readNotes } from "../lib/notes";
import { analysisResult, enrollmentTrace, operatingModel, storiesForModule, storyForSection, studyLocation } from "../lib/studyStories";

test("branch behavior derives all four operating models without confusing integration and standardization", () => {
  expect(operatingModel(false, false)).toBe("Diversification");
  expect(operatingModel(true, false)).toBe("Replication");
  expect(operatingModel(false, true)).toBe("Coordination");
  expect(operatingModel(true, true)).toBe("Unification");
});

test("changing the analysis approach does not silently change the question being answered", () => {
  expect(analysisResult("functional", "analytical").result).toBe("Check whether an eligible application can reach confirmation.");
  expect(analysisResult("functional", "simulation").result).toBe("Run an eligible applicant through the modeled steps; observe whether confirmation is reached.");
  expect(analysisResult("quantitative", "analytical").result).toBe("Derive a waiting-time result from the model and its assumptions.");
  expect(analysisResult("quantitative", "simulation").result).toBe("Run modeled applicants and observe their waiting times.");
});

test("every module part has a visual entry and all source links lead to a real notes section", () => {
  for (let n = 1; n <= 5; n++) {
    const parts = readNotes("msys-50", `module-${n}`);
    const stories = storiesForModule(n);
    for (const part of parts) expect(stories.some(s => s.part === part.num)).toBe(true);
    for (const story of stories) {
      const part = parts.find(p => p.num === story.part)!;
      expect(part.sections[story.section - 1]?.html.trim()).toBeTruthy();
    }
  }
});

test("full-notes exploration stays in the current part and finds the analysis example for its section", () => {
  expect(storyForSection(5, "5.1", "p-5-1-s2")?.id).toBe("analysis");
  expect(storyForSection(4, "4.3", "p-4-3-s8")?.id).toBe("artifacts");
  expect(storyForSection(3, "3.2", "p-3-2-s10")?.part).toBe("3.2");
  expect(storyForSection(5, "9.9", "p-9-9-s1")).toBeUndefined();
});

test("source deep links remember the right visual example for returning from full notes", () => {
  const notes = readNotes("msys-50", "module-5");
  const location = studyLocation(5, notes, "#p-5-3-s5");
  expect(location.mode).toBe("notes");
  expect(storiesForModule(5)[location.index].id).toBe("service-trace");
  expect(studyLocation(5, notes, "#explore-analysis")).toEqual({ mode: "explore", index: 0 });
  expect(studyLocation(5, notes, "#bad%encoding").mode).toBe("notes");
});

test("opened note headings can receive keyboard focus when the previous view is removed", () => {
  const html = renderToStaticMarkup(createElement(NotesReader, { parts: readNotes("msys-50", "module-5"), moduleNum: 5 }));
  expect(html).toMatch(/<h3[^>]*id="p-5-1-s2"[^>]*tabindex="-1"/);
});

test("the teaching simulation stops at failed eligibility instead of falsely confirming the applicant", () => {
  expect(enrollmentTrace(true)).toEqual({ steps: ["Apply", "Check eligibility", "Confirm"], durations: [2, 3, 1], confirmed: true });
  expect(enrollmentTrace(false)).toEqual({ steps: ["Apply", "Check eligibility"], durations: [2, 3], confirmed: false });
});

test("the functional explanation follows the chosen applicant rather than assuming everyone is eligible", () => {
  expect(analysisResult("functional", "simulation", false).result).toBe("Run an ineligible applicant through the modeled steps; observe whether the eligibility rule prevents confirmation.");
});

test("a direct link to the first visual example has a real scroll target on the initial page", () => {
  const html = renderToStaticMarkup(createElement(StudyExperience, { parts: readNotes("msys-50", "module-5"), moduleNum: 5 }));
  expect(html.includes('id="explore-analysis"')).toBe(true);
});
