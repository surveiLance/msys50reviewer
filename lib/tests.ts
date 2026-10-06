import type { Section, SubjectData, SubjectMeta, TestSet } from "./types";
import { countFor, countMidterm } from "./questions";

export type TestInfo = {
  slug: string; // "module-2" or "midterm" → /[subject]/test/[slug]
  kind: "module" | "midterm";
  title: string; // "Module 2 test"
  subtitle: string; // module title, or the exam date
  questions: number;
  points: number;
  sets: number;
  /** "52 to 81 points" when sets differ in size */
  range?: string;
};

const isScenarios = (s: Section) => s.kind === "mc" && /scenario/i.test(s.title);

/**
 * Every module test includes case scenarios. Some sets (Module 2) don't have their own,
 * so they borrow the module's scenario section from the set that does.
 */
export function withScenarios(sets: Record<string, TestSet>): Record<string, TestSet> {
  const scen = Object.values(sets).flatMap((t) => t.secs).find(isScenarios);
  if (!scen) return sets;
  return Object.fromEntries(
    Object.entries(sets).map(([k, t]) => [k, t.secs.some(isScenarios) ? t : { ...t, secs: [...t.secs, scen] }]),
  );
}

/** Every test a subject offers: one per module, plus the midterm. */
export function listTests(subject: SubjectMeta, data: SubjectData): TestInfo[] {
  const tests: TestInfo[] = subject.modules.map((m) => {
    const sets = withScenarios(data.tests[m.slug] || {});
    const keys = Object.keys(sets);
    const counts = keys.map((k) => countFor(sets[k]));
    const c = counts[keys.indexOf(data.defaultSet[m.slug] || keys[0])] || { questions: 0, points: 0 };
    const lo = Math.min(...counts.map((x) => x.points)), hi = Math.max(...counts.map((x) => x.points));
    return {
      slug: m.slug, kind: "module", title: `Module ${m.num} test`, subtitle: m.title,
      questions: c.questions, points: c.points, sets: keys.length, range: lo !== hi ? `${lo} to ${hi} points` : undefined,
    };
  });
  if (subject.exam) {
    const c = countMidterm(data.midterm);
    tests.push({ slug: "midterm", kind: "midterm", title: `${subject.exam.title} test`, subtitle: `All modules · real exam ${subject.exam.when}`, questions: c.questions, points: c.points, sets: 0 });
  }
  return tests;
}
