import type { McItem, MidtermSpec, MtfItem, Section, TestSet } from "./types";
import { norm, sample, shuffle } from "./quiz";

/**
 * One question, one screen. Every test format in data.json becomes one of two kinds:
 * - "tf": modified true or false (tap True/False; if False, type the replacement)
 * - "choice": tap one option (multiple choice, and matching turned into per-item choices)
 */
export type Question =
  | {
      kind: "tf";
      id: string;
      part: string;
      prompt: string; // HTML; the underlined part is the one to replace
      isTrue: boolean;
      accept: string[];
      answer: string; // shown answer: "True" or the replacement
      source?: string; // e.g. "2.1 slide 4"
      mod?: string; // "M2"
    }
  | {
      kind: "choice";
      id: string;
      part: string;
      ask: string; // one-line instruction shown above the prompt
      prompt: string; // HTML
      options: string[];
      answer: string;
      why?: string;
      source?: string;
      mod?: string;
    };

export type Answer = { tf?: "true" | "false"; text?: string; choice?: string; checked?: boolean };

export type Graded = { ok: boolean; answered: boolean; partial: boolean; your: string };

const TF_PART = "True or false";

function tf(it: MtfItem): Question {
  return {
    kind: "tf",
    id: "tf:" + it.s,
    part: TF_PART,
    prompt: it.s,
    isTrue: !!it.t,
    accept: it.a || [],
    answer: it.t ? "True" : it.d || (it.a || [])[0] || "",
    source: it.r,
    mod: it.m,
  };
}

/** Turns a test section into choice questions. Matching becomes "which term does this describe?" so options stay short. */
function fromSection(sec: Section, scenarios?: Record<string, McItem[]>): Question[] {
  const part = sec.title.replace(/^Matching:\s*/, "");
  if (sec.kind === "letter") {
    const terms = sec.items.map((x) => x[0]);
    return sec.items.map(([term, desc]) => ({
      kind: "choice",
      id: `m:${term}:${desc}`,
      part,
      ask: "Which one does this describe?",
      prompt: desc,
      options: shuffle([term, ...sample(terms.filter((t) => t !== term), 3)]),
      answer: term,
    }));
  }
  if (sec.kind === "pick") {
    // Options keep their given order: they're often a sequence (1–5) or a fixed pair.
    return sec.items.map(([prompt, answer]) => ({
      kind: "choice",
      id: `p:${prompt}:${answer}`,
      part,
      ask: sec.inst,
      prompt,
      options: sec.opts,
      answer,
    }));
  }
  const items: (McItem & { mod?: string })[] =
    sec.items ?? (sec.draw || []).flatMap((d) => sample(scenarios?.[d.pool] || [], d.n).map((x) => ({ ...x, mod: d.pool })));
  return items.map((x) => ({
    kind: "choice",
    id: `c:${x.q}`,
    part,
    ask: /scenario/i.test(part) ? "What concept does this scenario show?" : "Choose the best answer.",
    prompt: x.q,
    options: shuffle(x.o),
    answer: x.a,
    why: x.w,
    mod: x.mod,
  }));
}

function dedupe(qs: Question[]): Question[] {
  const seen = new Set<string>();
  return qs.filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)));
}

/** Every unique question in the chosen sets. */
export function practicePool(sets: Record<string, TestSet>, source: string): Question[] {
  const chosen = source === "all" ? Object.values(sets) : [sets[source]].filter(Boolean);
  return dedupe(chosen.flatMap((t) => [...t.mtf.map(tf), ...t.secs.flatMap((s) => fromSection(s))]));
}

/** A practice run: a shuffled mix of types, `n` long (or everything). */
export function buildPractice(sets: Record<string, TestSet>, source: string, n: number | null, mod?: string): Question[] {
  const pool = shuffle(practicePool(sets, source));
  return (n ? pool.slice(0, n) : pool).map((q) => (q.mod || !mod ? q : { ...q, mod }));
}

/** A mock exam: drawn fresh each time, grouped by part like a paper exam. */
export function buildExam(spec: MidtermSpec, pools: Record<string, MtfItem[]>, scenarios: Record<string, McItem[]>): Question[] {
  const tfs = shuffle(spec.mtf.flatMap((d) => sample(pools[d.pool] || [], d.n))).map(tf);
  return [...tfs, ...spec.secs.flatMap((s) => shuffle(fromSection(s, scenarios)))];
}

export function grade(q: Question, a: Answer | undefined): Graded {
  if (q.kind === "choice") {
    const answered = !!a?.choice;
    return { ok: a?.choice === q.answer, answered, partial: false, your: a?.choice || "" };
  }
  if (!a?.tf) return { ok: false, answered: false, partial: false, your: "" };
  if (a.tf === "true") return { ok: q.isTrue, answered: true, partial: false, your: "True" };
  const text = (a.text || "").trim();
  const your = text ? `False → ${text}` : "False (no replacement)";
  if (q.isTrue) return { ok: false, answered: true, partial: false, your };
  const ok = q.accept.some((x) => norm(x) === norm(text));
  return { ok, answered: true, partial: !ok, your };
}

/** "2.1 slide 4" → notes anchor for part 2.1. Falls back to the module's notes. */
export function notesHref(subject: string, q: Question, fallbackModule?: string): string | null {
  const m = q.source?.match(/^(\d+)\.(\d+)/);
  if (m) return `/${subject}/module-${m[1]}#p-${m[1]}-${m[2]}`;
  const num = q.mod?.match(/^M(\d+)$/)?.[1];
  if (num) return `/${subject}/module-${num}`;
  return fallbackModule ? `/${subject}/${fallbackModule}` : null;
}
