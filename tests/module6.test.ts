import { expect, test } from "vitest";
import { findSection } from "../lib/peek";
import { readNotes } from "../lib/notes";
import { poolAlternativeModule, poolModule } from "../lib/questions";
import { examData } from "../lib/studyStructure";
import { getSubject, getSubjectData } from "../lib/subjects";
import { listTests } from "../lib/tests";

const slug = "module-6";
const subject = getSubject("msys-50")!;
const data = getSubjectData("msys-50")!;

test("Module 6 has both parts, all guide answers and a source-accurate network", () => {
  const parts = readNotes(subject.slug, slug);
  expect(parts.map(p => p.num)).toEqual(["6.1", "6.2"]);
  expect(parts.map(p => p.sections.at(-1)?.html.match(/<details class="qa">/g)?.length)).toEqual([8, 10]);
  const svg = parts[0].sections.find(s => s.html.includes('id="m6-neural-network"'))!.html;
  expect([...svg.matchAll(/<circle cx="(\d+)"/g)].map(match => match[1]).reduce<Record<string, number>>((counts, x) => ({ ...counts, [x]: (counts[x] ?? 0) + 1 }), {})).toEqual({ 62: 5, 194: 5, 326: 5, 458: 5, 590: 3 });
  expect(svg.match(/<line /g)?.length).toBe(90);
});

test("both question banks are playable without expanding archived exam coverage", () => {
  const quick = poolModule(data.tests[slug], slug, data.multi?.[slug], data.blanks?.[slug]);
  expect(Object.values(quick).every(questions => questions.length > 0)).toBe(true);
  const cases = poolAlternativeModule(data.alternative?.[slug], slug);
  for (const bank of [cases.mc, cases.multi]) {
    expect(bank).toHaveLength(10);
    for (const part of ["6.1", "6.2"]) expect(bank.filter(q => q.source?.startsWith(part))).toHaveLength(5);
    for (const q of bank) {
      if (q.kind !== "mc" && q.kind !== "multi") throw new Error("Unexpected long case type");
      expect(q.prompt.replace(/<ol.*$/s, "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).length).toBeGreaterThanOrEqual(120);
      expect(new Set(q.options).size).toBe(q.options.length);
      for (const answer of q.kind === "mc" ? [q.answer] : q.correct) expect(q.options).toContain(answer);
    }
  }
  expect(listTests(subject, data).find(t => t.slug === slug)?.alternativeBank).toBe(20);
  expect(examData(subject, data).alternative?.[slug]).toBeUndefined();
});

test("long case feedback favors the cited lecture sections over incidental words in the company story", () => {
  const parts = readNotes(subject.slug, slug);
  const cases = poolAlternativeModule(data.alternative?.[slug], slug);
  const q = cases.multi.find(question => question.source === "6.2 slides 4–5 and 8")!;
  const peek = findSection({ [slug]: parts }, q, undefined, "p-6-2");
  expect(peek?.part.num).toBe("6.2");
  expect([0, 1, 3]).toContain(peek?.index);
});
