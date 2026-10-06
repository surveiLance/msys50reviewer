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


/** Test lengths offered on the setup screen, in points. Lengths at or above a test's full size are dropped. */
export const LENGTHS = [
  { key: "quick", label: "Quick 10", points: 10 },
  { key: "short", label: "Short", points: 20 },
  { key: "medium", label: "Medium", points: 40 },
  { key: "full", label: "Full", points: Infinity },
] as const;
export type LengthKey = (typeof LENGTHS)[number]["key"];

/**
 * A shorter version of a built test with the same mix: every part shrinks by the same factor,
 * keeping at least one question per part and two dropdowns per matching question.
 * Questions are already shuffled, so taking the first ones is a random pick.
 */
export function shrink(qs: Question[], target: number): Question[] {
  const total = totalPoints(qs);
  if (!(target < total)) return qs;
  const f = target / total;
  const perSection = new Map<string, number>();
  qs.forEach((q) => q.kind !== "match" && perSection.set(q.section, (perSection.get(q.section) || 0) + 1));
  const keep = new Map([...perSection].map(([s, n]) => [s, Math.max(1, Math.round(n * f))]));
  const used = new Map<string, number>();
  return qs.flatMap((q): Question[] => {
    if (q.kind === "match") return [{ ...q, rows: q.rows.slice(0, Math.max(2, Math.round(q.rows.length * f))) }];
    const u = used.get(q.section) || 0;
    if (u >= (keep.get(q.section) || 0)) return [];
    used.set(q.section, u + 1);
    return [q];
  });
}

/* ---------- Quick rounds: 10 single questions at a time, rotating through everything ---------- */

const mcQ = (x: McItem, section: string, mod?: string): Question => ({
  kind: "mc", id: `c:${x.q}`, section, prompt: x.q, options: shuffle(x.o), answer: x.a, why: x.w, mod,
});

function dedupeQs(qs: Question[]): Question[] {
  const seen = new Set<string>();
  return qs.filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)));
}

/** Every single-point question in a module (all sets): true or false, multiple choice, and scenarios. */
export function quickPoolModule(sets: Record<string, TestSet>, mod: string): Question[] {
  return dedupeQs(Object.values(sets).flatMap((t) => [
    ...t.mtf.map(tf),
    ...t.secs.flatMap((sec) => (sec.kind === "mc" ? (sec.items || []).map((x) => mcQ(x, sec.title, mod)) : [])),
  ])).map((q) => (q.kind !== "match" && !q.mod ? { ...q, mod } : q));
}

/** Every single-point question the midterm can draw from. */
export function quickPoolMidterm(spec: MidtermSpec, pools: Record<string, MtfItem[]>, scenarios: Record<string, McItem[]>): Question[] {
  return dedupeQs([
    ...Object.values(pools).flatMap((items) => items.map(tf)),
    ...Object.entries(scenarios).flatMap(([pool, items]) => items.map((x) => mcQ(x, "Case Scenarios", pool))),
    ...spec.secs.flatMap((sec) => (sec.kind === "mc" && sec.items ? sec.items.map((x) => mcQ(x, sec.title)) : [])),
  ]);
}

/**
 * Picks a round of n questions, unseen ones first. Returns the round and the updated seen list;
 * once everything has been seen, the list starts over.
 */
export function pickRound(pool: Question[], seen: string[], n = 10): { qs: Question[]; seen: string[]; restarted: boolean } {
  const seenSet = new Set(seen);
  const fresh = shuffle(pool.filter((q) => !seenSet.has(q.id)));
  let restarted = false;
  let qs = fresh.slice(0, n);
  let nextSeen = [...seen, ...qs.map((q) => q.id)];
  if (qs.length < n) {
    // Everything has been seen: finish this round with a fresh pass and start counting again.
    restarted = true;
    const ids = new Set(qs.map((q) => q.id));
    const fill = shuffle(pool.filter((q) => !ids.has(q.id))).slice(0, n - qs.length);
    qs = [...qs, ...fill];
    nextSeen = fill.map((q) => q.id);
  }
  return { qs: shuffle(qs), seen: nextSeen, restarted };
}
