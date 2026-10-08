import type { SubjectData, SubjectMeta } from "./types";
import { QTYPES, poolAlternativeMidterm, poolAlternativeModule, poolMidterm, poolModule, poolScenarioMidterm, poolSize } from "./questions";

export type TestInfo = {
  slug: string; // "module-2" or "midterm" → /[subject]/test/[slug]
  kind: "module" | "midterm";
  title: string; // "Module 2 test"
  subtitle: string; // module title, or the exam date
  /** how many questions the test can draw from, across every question type */
  bank: number;
  /** independently authored questions in the optional alternative set */
  alternativeBank?: number;
  /** lesson-validated cases available in the midterm's scenario-only set */
  scenarioBank?: number;
};

const ALL = QTYPES.map((t) => t.key);

/** Every test a subject offers: one per module, plus the midterm. */
export function listTests(subject: SubjectMeta, data: SubjectData): TestInfo[] {
  const tests: TestInfo[] = subject.modules.map((m) => ({
    slug: m.slug,
    kind: "module",
    title: `Module ${m.num} test`,
    subtitle: m.title,
    bank: poolSize(poolModule(data.tests[m.slug] || {}, m.slug, data.multi?.[m.slug], data.blanks?.[m.slug]), ALL),
    alternativeBank: poolSize(poolAlternativeModule(data.alternative?.[m.slug], m.slug), ALL),
  }));
  if (subject.exam) {
    tests.push({
      slug: "midterm",
      kind: "midterm",
      title: `${subject.exam.title} test`,
      subtitle: `All modules · real exam ${subject.exam.when}`,
      bank: poolSize(poolMidterm(data.midterm, data.pools, data.scenarios, data.tests, data.multi, data.blanks), ALL),
      alternativeBank: poolSize(poolAlternativeMidterm(data.alternative), ALL),
      scenarioBank: poolSize(poolScenarioMidterm(data.scenarios), ALL),
    });
  }
  return tests;
}
