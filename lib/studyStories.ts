export type SceneKind = "campus" | "alignment" | "city" | "tools" | "branches" | "initiatives" | "dependencies" | "lenses" | "mda" | "zachman" | "soa" | "adm" | "artifacts" | "analysis" | "zoom" | "coverage" | "services";
export type StudyStory = { id: string; part: string; section: number; title: string; invitation: string; kind: SceneKind; takeaway: string };

const stories: Record<number, StudyStory[]> = {
  1: [
    { id: "whole-campus", part: "1.1", section: 1, title: "Connect a campus", invitation: "A student needs to enroll. The offices all work—but do they work together?", kind: "campus", takeaway: "EA connects business and IT perspectives so people can plan the whole enterprise, including current and future states." },
    { id: "alignment", part: "1.2", section: 2, title: "Find the broken connection", invitation: "The university promises online enrollment. Change the mismatch and follow the link that needs attention.", kind: "alignment", takeaway: "In SAM, business ↔ IT is functional integration. Strategy ↔ infrastructure is strategic fit. Other alignment models use their own meanings." },
    { id: "living-city", part: "1.3", section: 2, title: "Rebuild a living city", invitation: "Classes are still running. Can you improve the campus without pretending everything stops?", kind: "city", takeaway: "Organizations evolve while operating, like cities. Plan incremental changes and their connections; no final perfect blueprint ends the work." },
  ],
  2: [
    { id: "toolbelt", part: "2.1", section: 1, title: "Pick a tool for a real problem", invitation: "Six different problems land on your desk. Open one to see which management instrument helps.", kind: "tools", takeaway: "Management instruments answer different questions. EA supplies the connected business/IT context they need." },
    { id: "branch-world", part: "2.2", section: 2, title: "Build an operating model", invitation: "You run three branches. Change their process rules and data sharing; watch the operating model emerge.", kind: "branches", takeaway: "Standardization means doing work the same way. Integration means sharing data. They are independent choices." },
    { id: "request-desk", part: "2.3", section: 4, title: "Open the incoming requests", invitation: "Five requests sound like IT projects. Their reasons tell you which initiative type they represent.", kind: "initiatives", takeaway: "Classify by the need and origin, not by the technology. Real initiatives can overlap types when justified." },
  ],
  3: [
    { id: "ripple", part: "3.1", section: 3, title: "Pull one thread", invitation: "A database supports an app, which supports enrollment. Disable it and trace what may be affected.", kind: "dependencies", takeaway: "Compositionality identifies parts and relationships. Integration makes cross-domain dependencies visible so changes can be assessed." },
    { id: "stakeholder", part: "3.2", section: 6, title: "Stand in someone else’s shoes", invitation: "One campus. Three people. Select a person and see which parts answer their concern.", kind: "lenses", takeaway: "A viewpoint guides the selection. A view contains what is shown. Connected partial models collectively describe the enterprise." },
  ],
  4: [
    { id: "zachman", part: "4.1", section: 2, title: "File one artifact, not a whole matrix", invitation: "Read a document’s question and perspective. Those two clues locate it in Zachman.", kind: "zachman", takeaway: "Zachman classifies artifacts by perspective and product abstraction. It is not a step-by-step development method." },
    { id: "mda", part: "4.1", section: 3, title: "Turn a need into a platform design", invitation: "Walk from the business need to a platform-independent model, then a platform-specific model.", kind: "mda", takeaway: "CIM describes the business context; PIM models the solution independently of a platform; PSM adds platform-specific detail." },
    { id: "service-door", part: "4.1", section: 4, title: "Use a service through its doorway", invitation: "A student wants a result. Explore the service contract and the implementation behind it.", kind: "soa", takeaway: "SOA exposes capabilities as services through defined interfaces/contracts, supporting reuse and looser coupling—not merely a new screen." },
    { id: "adm", part: "4.2", section: 4, title: "Walk around ADM", invitation: "Tap a phase on the orbit. Keep your eye on what stays in the center.", kind: "adm", takeaway: "ADM is iterative and tailorable. Requirements Management connects throughout; it is not the step after H." },
    { id: "artifacts", part: "4.3", section: 1, title: "Visit the artifact desk", invitation: "Choose a decision, then its audience. Open the documents that help make it.", kind: "artifacts", takeaway: "Rules, Structures, Changes × business/IT focus produce six types. Dual artifacts support business and IT understanding. Pick useful subtypes rather than create all 24." },
  ],
  5: [
    { id: "analysis", part: "5.1", section: 2, title: "Run the enrollment experiment", invitation: "First choose what you want to find out. Then choose how to investigate it. They are separate decisions.", kind: "analysis", takeaway: "Functional/quantitative describes the result sought. Analytical/simulation describes the approach. Either approach can serve either result." },
    { id: "zoom", part: "5.1", section: 5, title: "Open up one process", invitation: "Zoom into enrollment to reveal steps. Zoom out when those details distract from the question.", kind: "zoom", takeaway: "Refinement adds relevant detail. Abstraction hides detail while retaining the essential meaning. Neither means making facts up." },
    { id: "viewpoint-lens", part: "5.2", section: 1, title: "Change the lens, keep the campus", invitation: "Try a different person’s question. A useful view changes while its underlying information stays consistent.", kind: "lenses", takeaway: "Model = architectural information. Viewpoint = the lens and conventions. View = selected content. Visualization = its presentation." },
    { id: "coverage", part: "5.2", section: 4, title: "Move a spotlight", invitation: "Illuminate one concern, connect that concern across layers, then broaden to multiple concerns.", kind: "coverage", takeaway: "Details: one layer and one aspect. Coherence expands one dimension. Overview expands both. Purpose is a separate choice." },
    { id: "service-trace", part: "5.3", section: 3, title: "See behind a service", invitation: "Uncover what implements a service, then follow who uses its functionality.", kind: "services", takeaway: "A component realizes a service; the service serves a consumer. These relationships describe responsibility and support, not chronological steps." },
  ],
};

export function storiesForModule(moduleNum: number): StudyStory[] { return stories[moduleNum] ?? []; }
export function studyLocation(moduleNum: number, parts: { id: string; num: string; intro: string; sections: { html: string }[] }[], hash: string): { mode: "explore" | "notes"; index: number } {
  let id = hash.replace(/^#/, "");
  try { id = decodeURIComponent(id); } catch { /* Unknown anchors must not crash learning navigation. */ }
  const all = storiesForModule(moduleNum);
  const direct = all.findIndex(s => id === `explore-${s.id}`);
  if (direct >= 0) return { mode: "explore", index: direct };
  if (!id) return { mode: "explore", index: 0 };
  const part = parts.find(p => id === p.id || id.startsWith(`${p.id}-s`) || (p.intro + p.sections.map(s => s.html).join("")).includes(`id="${id}"`));
  const anchorSection = part?.sections.findIndex(s => s.html.includes(`id="${id}"`)) ?? -1;
  const story = part && storyForSection(moduleNum, part.num, anchorSection >= 0 ? `${part.id}-s${anchorSection + 1}` : id);
  return { mode: "notes", index: story ? all.findIndex(s => s.id === story.id) : 0 };
}
export function storyForSection(moduleNum: number, part: string, sectionId?: string): StudyStory | undefined {
  const candidates = storiesForModule(moduleNum).filter(s => s.part === part);
  const section = Number(sectionId?.match(/-s(\d+)$/)?.[1] ?? 1);
  return candidates.filter(s => s.section <= section).at(-1) ?? candidates[0];
}
export function operatingModel(standardized: boolean, integrated: boolean): string {
  return integrated ? (standardized ? "Unification" : "Coordination") : (standardized ? "Replication" : "Diversification");
}
export function analysisResult(result: "functional" | "quantitative", approach: "analytical" | "simulation", eligible = true) {
  if (result === "functional" && !eligible) return { result: approach === "analytical" ? "Check whether the eligibility rule prevents an ineligible application from reaching confirmation." : "Run an ineligible applicant through the modeled steps; observe whether the eligibility rule prevents confirmation." };
  return { result: result === "functional"
    ? approach === "analytical" ? "Check whether an eligible application can reach confirmation." : "Run an eligible applicant through the modeled steps; observe whether confirmation is reached."
    : approach === "analytical" ? "Derive a waiting-time result from the model and its assumptions." : "Run modeled applicants and observe their waiting times." };
}
export function enrollmentTrace(eligible: boolean): { steps: string[]; durations: number[]; confirmed: boolean } {
  return eligible
    ? { steps: ["Apply", "Check eligibility", "Confirm"], durations: [2, 3, 1], confirmed: true }
    : { steps: ["Apply", "Check eligibility"], durations: [2, 3], confirmed: false };
}
