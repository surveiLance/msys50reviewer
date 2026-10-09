import type { SubjectData, SubjectMeta } from "./types";
import msys50 from "@/content/msys-50/data.json";
import msys50Alternative from "@/content/msys-50/alternative.json";
import { expandQuestionData } from "@/content/msys-50/fresh";

/**
 * Subject registry. To add a subject:
 * 1. Create /content/<slug>/ with module-N.html notes and data.json.
 * 2. Add an entry here and to DATA below.
 */
export const SUBJECTS: SubjectMeta[] = [
  {
    slug: "msys-50",
    code: "MSYS 50",
    title: "Enterprise Architecture",
    blurb: "Your course study hub: find a module, review its notes and flashcards, then test yourself. More lessons will be added as the course progresses.",
    modules: [
      { slug: "module-1", num: 1, title: "Overview, Drivers, and Complexity of EA", parts: ["1.1 Overview of EA", "1.2 EA Drivers", "1.3 The Complexity of EA"] },
      { slug: "module-2", num: 2, title: "Governance, Alignment, and IT Initiatives", parts: ["2.1 EA and Other Governance Instruments", "2.2 The Problem of Business and IT Alignment", "2.3 The IT Initiative"] },
      { slug: "module-3", num: 3, title: "Architectural Complexity and Description", parts: ["3.1 Architectural Complexity and Domains", "3.2 Describing Enterprise Architectures"] },
    ],
    exam: {
      title: "Midterm",
      when: "Thursday, October 8, 8:00–9:15 PM",
      rooms: ["Section D: F-227", "Section E: F-228", "Section F: CTC-214", "Section G1: CTC-215"],
      minutes: 75,
      modules: ["module-1", "module-2", "module-3"],
    },
    finals: { when: "Late November · exact date to be confirmed", description: "The next modules will appear here as their lesson materials and quizzes are added. Finals coverage will be confirmed separately." },
  },
];

const DATA: Record<string, SubjectData> = {
  "msys-50": expandQuestionData({ ...msys50, alternative: msys50Alternative } as unknown as SubjectData),
};

export function getSubject(slug: string): SubjectMeta | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

export function getSubjectData(slug: string): SubjectData | undefined {
  return DATA[slug];
}
