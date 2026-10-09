import type { SubjectData, SubjectMeta } from "./types";

export function studyGroups(subject: SubjectMeta) {
  return (["finals", "midterm"] as const).map(id => ({ id,
    title: id === "finals" ? "Finals modules" : "Midterm modules",
    modules: subject.modules.filter(m => (m.period ?? "midterm") === id),
  }));
}

export function examModules(subject: SubjectMeta) {
  return subject.exam?.modules ?? subject.modules.filter(m => (m.period ?? "midterm") === "midterm").map(m => m.slug);
}

/** Keep archived midterm practice separate from later lessons and question banks. */
export function examData(subject: SubjectMeta, data: SubjectData): SubjectData {
  const slugs = new Set(examModules(subject)), tags = new Set([...slugs].map(slug => slug.replace(/^module-/, "M")));
  const select = <T,>(record: Record<string, T> | undefined, allowed: Set<string>) => Object.fromEntries(Object.entries(record ?? {}).filter(([key]) => allowed.has(key)));
  return { ...data, tests: select(data.tests, slugs), pools: select(data.pools, tags), scenarios: select(data.scenarios, tags),
    multi: select(data.multi, slugs), blanks: select(data.blanks, slugs), alternative: select(data.alternative, slugs) };
}
