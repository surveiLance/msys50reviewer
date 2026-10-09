import { expect, test } from "vitest";
import { examData, examModules, studyGroups } from "../lib/studyStructure";
import { listTests } from "../lib/tests";
import raw from "../content/msys-50/data.json";
import type { SubjectData, SubjectMeta } from "../lib/types";

const subject: SubjectMeta = { slug: "msys-50", code: "MSYS 50", title: "EA", blurb: "", modules: [1, 2, 3, 4].map(num => ({ slug: `module-${num}`, num, title: `Lesson ${num}`, parts: [], period: num === 4 ? "finals" : "midterm" })), exam: { title: "Midterm", when: "Past", rooms: [], minutes: 75, modules: ["module-1", "module-2", "module-3"] } };
test("future modules join the finals section without expanding main navigation", () => {
  const groups = studyGroups(subject);
  expect(groups[0].modules.map(m => m.num)).toEqual([4]);
  expect(groups[1].modules.map(m => m.num)).toEqual([1, 2, 3]);
  expect(examModules(subject)).toEqual(["module-1", "module-2", "module-3"]);
});
test("midterm banks exclude future lessons and preserve original source data", () => {
  const data: SubjectData = { ...raw as unknown as SubjectData, pools: { ...raw.pools, M4: [{ s: "Future statement", t: true, m: "M4" }] }, scenarios: { ...raw.scenarios, M4: [{ q: "Future case", o: ["A", "B"], a: "A" }] }, tests: { ...raw.tests as unknown as SubjectData["tests"], "module-4": { "1": { desc: "New lesson", mtf: [{ s: "Future statement", t: true, m: "M4" }], secs: [] } } } };
  const scoped = examData(subject, data);
  expect(scoped.pools.M4).toBeUndefined(); expect(scoped.scenarios.M4).toBeUndefined(); expect(scoped.tests["module-4"]).toBeUndefined();
  expect(data.pools.M4).toHaveLength(1);
  const tests = listTests(subject, data);
  expect(tests.some(t => t.slug === "module-4")).toBe(true);
  expect(tests.find(t => t.slug === "midterm")?.bank).toBe(listTests(subject, raw as unknown as SubjectData).find(t => t.slug === "midterm")?.bank);
});
