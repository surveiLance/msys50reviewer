import type { McItem, MidtermSpec, MtfItem, Section, TestSet } from "./types";
import { norm, sample, shuffle } from "./quiz";

/**
 * Canvas-style questions, one per screen:
 * - "tf": modified true or false. Type "!" if true; if false, type the word that replaces the underlined part.
 * - "mc": multiple choice (radio buttons).
 * - "match": several statements, each with a dropdown (one point per dropdown).
 */
export type Question =
  | { kind: "tf"; id: string; section: string; prompt: string; isTrue: boolean; accept: string[]; answer: string; source?: string; mod?: string }
  | { kind: "mc"; id: string; section: string; prompt: string; options: string[]; answer: string; why?: string; source?: string; mod?: string }
  | { kind: "match"; id: string; section: string; inst: string; rows: { prompt: string; answer: string }[]; options: string[] };

export type Answer = { text?: string; choice?: string; picks?: string[] };

export type Graded = {
  points: number;
  max: number;
  answered: boolean;
  /** match: per-row correctness */
  rows?: boolean[];
};

export const TF_SECTION = "Modified true or false";
export const TRUE_MARK = "!";

export const points = (q: Question) => (q.kind === "match" ? q.rows.length : 1);

function tf(it: MtfItem): Question {
  return {
    kind: "tf",
    id: "tf:" + it.s,
    section: TF_SECTION,
    prompt: it.s,
    isTrue: !!it.t,
    accept: it.a || [],
    answer: it.t ? TRUE_MARK : it.d || (it.a || [])[0] || "",
    source: it.r,
    mod: it.m,
  };
}

function fromSection(sec: Section, scenarios?: Record<string, McItem[]>): Question[] {
  const section = sec.title.replace(/^Matching:\s*/, "");
  if (sec.kind === "letter") {
    // Each description gets a dropdown of the terms.
    return [{
      kind: "match",
      id: `m:${sec.title}`,
      section,
      inst: "Choose the term each description refers to.",
      rows: shuffle(sec.items.map(([term, desc]) => ({ prompt: desc, answer: term }))),
      options: [...sec.items.map((x) => x[0])].sort((a, b) => a.localeCompare(b)),
    }];
  }
  if (sec.kind === "pick") {
    return [{
      kind: "match",
      id: `p:${sec.title}`,
      section,
      inst: sec.inst,
      rows: shuffle(sec.items.map(([prompt, answer]) => ({ prompt, answer }))),
      options: sec.opts, // kept in order: often a sequence (1–5) or a fixed pair
    }];
  }
  const items: (McItem & { mod?: string })[] =
    sec.items ?? (sec.draw || []).flatMap((d) => sample(scenarios?.[d.pool] || [], d.n).map((x) => ({ ...x, mod: d.pool })));
  return shuffle(items).map((x) => ({
    kind: "mc",
    id: `c:${x.q}`,
    section,
    prompt: x.q,
    options: shuffle(x.o),
    answer: x.a,
    why: x.w,
    mod: x.mod,
  }));
}

/** A module test: one set, laid out like a paper exam (true or false first, then each section in order). */
export function buildModuleTest(set: TestSet, mod: string): Question[] {
  const qs = [...shuffle(set.mtf).map(tf), ...set.secs.flatMap((s) => fromSection(s))];
  return qs.map((q) => (q.kind !== "match" && !q.mod ? { ...q, mod } : q));
}

/** The midterm test: drawn fresh from every module each time. */
export function buildMidterm(spec: MidtermSpec, pools: Record<string, MtfItem[]>, scenarios: Record<string, McItem[]>): Question[] {
  const tfs = shuffle(spec.mtf.flatMap((d) => sample(pools[d.pool] || [], d.n))).map(tf);
  return [...tfs, ...spec.secs.flatMap((s) => fromSection(s, scenarios))];
}

export function totalPoints(qs: Question[]) {
  return qs.reduce((s, q) => s + points(q), 0);
}

export function countFor(set: TestSet) {
  const qs = set.mtf.length + set.secs.reduce((s, x) => s + (x.kind === "mc" ? x.items?.length ?? 0 : 1), 0);
  const pts = set.mtf.length + set.secs.reduce((s, x) => s + (x.items?.length ?? 0), 0);
  return { questions: qs, points: pts };
}

export function countMidterm(spec: MidtermSpec) {
  const tfn = spec.mtf.reduce((s, d) => s + d.n, 0);
  let qs = tfn, pts = tfn;
  for (const s of spec.secs) {
    const n = s.kind === "mc" && s.draw ? s.draw.reduce((a, d) => a + d.n, 0) : s.items?.length ?? 0;
    qs += s.kind === "mc" ? n : 1;
    pts += n;
  }
  return { questions: qs, points: pts };
}

export function grade(q: Question, a: Answer | undefined): Graded {
  if (q.kind === "mc") {
    return { points: a?.choice === q.answer ? 1 : 0, max: 1, answered: !!a?.choice };
  }
  if (q.kind === "match") {
    const rows = q.rows.map((r, i) => a?.picks?.[i] === r.answer);
    return { points: rows.filter(Boolean).length, max: q.rows.length, answered: !!a?.picks?.some(Boolean), rows };
  }
  const raw = (a?.text || "").trim();
  if (!raw) return { points: 0, max: 1, answered: false };
  const ok = q.isTrue ? raw === TRUE_MARK : raw !== TRUE_MARK && q.accept.some((x) => norm(x) === norm(raw));
  return { points: ok ? 1 : 0, max: 1, answered: true };
}

/** "2.1 slide 4" → the notes section for part 2.1. Falls back to the module's notes. */
export function notesHref(subject: string, q: Question, fallbackModule?: string): string | null {
  if (q.kind === "match") return fallbackModule ? `/${subject}/${fallbackModule}` : null;
  const m = q.source?.match(/^(\d+)\.(\d+)/);
  if (m) return `/${subject}/module-${m[1]}#p-${m[1]}-${m[2]}`;
  const num = q.mod?.match(/^M(\d+)$/)?.[1];
  if (num) return `/${subject}/module-${num}`;
  return fallbackModule ? `/${subject}/${fallbackModule}` : null;
}
