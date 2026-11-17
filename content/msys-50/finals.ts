import type { AlternativeQuestion, McItem, MultiItem, SubjectData } from "../../lib/types";
import { module4FinalsCombinations, module4FinalsCheckboxes } from "./finalsModule4Cases";
import { module5FinalsCombinations, module5FinalsCheckboxes } from "./finalsModule5Cases";
import { module6CombinationCases, module6CheckboxCases } from "./module6Cases";

function caseBank(combinations: (McItem & { w: string; r: string })[], checkboxes: (MultiItem & { w: string; r: string })[]): AlternativeQuestion[] {
  return [
    ...combinations.map(q => ({ kind: "mc" as const, prompt: q.q, options: q.o, answer: q.a, why: q.w, source: q.r })),
    ...checkboxes.map(q => ({ kind: "multi" as const, prompt: q.q, options: q.o, correct: q.a, why: q.w, source: q.r })),
  ];
}

/** Independent finals content; coverage is controlled by subject.finals.modules. */
export function withFinals(data: SubjectData): SubjectData {
  return { ...data, finalCases: {
    ...data.finalCases,
    "module-4": caseBank(module4FinalsCombinations, module4FinalsCheckboxes),
    "module-5": caseBank(module5FinalsCombinations, module5FinalsCheckboxes),
    "module-6": caseBank(module6CombinationCases, module6CheckboxCases),
  } };
}
