import type { BlankItem, McItem, MidtermSpec, MtfItem, MultiItem, Section, TestSet } from "./types";
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
  | { kind: "match"; id: string; section: string; inst: string; rows: { prompt: string; answer: string }[]; options: string[] }
  // Mixed style (Canvas "classic" quiz types):
  | { kind: "tf2"; id: string; section: string; prompt: string; isTrue: boolean; underlined?: string; fix?: string; source?: string; mod?: string }
  | { kind: "multi"; id: string; section: string; prompt: string; options: string[]; correct: string[]; why?: string; source?: string; mod?: string }
  | { kind: "blank"; id: string; section: string; prompt: string; bank: string[]; answer: string; why?: string; source?: string; mod?: string };

export type Answer = { text?: string; choice?: string; picks?: string[]; checks?: string[] };

export type Graded = {
  points: number;
  max: number;
  answered: boolean;
  /** match: per-row correctness */
  rows?: boolean[];
};

export const TF_SECTION = "Modified true or false";
export const TRUE_MARK = "!";

export const MULTI_POINTS = 2;
export const points = (q: Question) => (q.kind === "match" ? q.rows.length : q.kind === "multi" ? MULTI_POINTS : 1);

/** The Canvas-style type name shown in each question's header. */
export const typeLabel = (q: Question) =>
  ({ tf: "Modified True or False", tf2: "True or False", mc: "Multiple Choice", multi: "Multiple Answer", blank: "Fill in the Blank", match: "Matching" })[q.kind];

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
  if (q.kind === "tf2") {
    const answered = a?.choice === "True" || a?.choice === "False";
    return { points: answered && (a!.choice === "True") === q.isTrue ? 1 : 0, max: 1, answered };
  }
  if (q.kind === "blank") return { points: a?.choice === q.answer ? 1 : 0, max: 1, answered: !!a?.choice };
  if (q.kind === "multi") {
    // Canvas partial credit: each correct box earns, each wrong box costs; never below zero.
    const sel = a?.checks || [];
    const right = sel.filter((x) => q.correct.includes(x)).length;
    const wrong = sel.length - right;
    const pts = Math.max(0, (right - wrong) / q.correct.length) * MULTI_POINTS;
    return { points: Math.round(pts * 100) / 100, max: MULTI_POINTS, answered: sel.length > 0 };
  }
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

/* ---------- Mixed style: True or False, Multiple Choice, Multiple Answer, Fill in the Blank ---------- */

/** A modified true-or-false statement read as a plain True/False question. */
function tf2(it: MtfItem): Question {
  const underlined = it.s.match(/<u>(.*?)<\/u>/)?.[1];
  return {
    kind: "tf2", id: "t2:" + it.s, section: "True or False", prompt: it.s.replace(/<\/?u>/g, ""),
    isTrue: !!it.t, underlined, fix: it.t ? undefined : it.d || it.a?.[0], source: it.r, mod: it.m,
  };
}
const multiQ = (x: MultiItem, mod?: string): Question => ({
  kind: "multi", id: "ma:" + x.q, section: "Multiple Answer", prompt: x.q, options: shuffle(x.o), correct: x.a, why: x.w, source: x.r, mod,
});
const blankQ = (x: BlankItem, mod?: string): Question => ({
  kind: "blank", id: "fb:" + x.s, section: "Fill in the Blank", prompt: x.s, bank: shuffle(x.bank), answer: x.a, why: x.w, source: x.r, mod,
});

export type MixedPool = { tf2: Question[]; mc: Question[]; multi: Question[]; blank: Question[] };

const modTagOf = (slug: string) => slug.replace(/^module-(\d+)$/, "M$1");

export function mixedPoolModule(sets: Record<string, TestSet>, module: string, multi: MultiItem[] = [], blanks: BlankItem[] = []): MixedPool {
  const mod = modTagOf(module);
  const single = quickPoolModule(sets, mod);
  return {
    tf2: dedupeQs(Object.values(sets).flatMap((t) => t.mtf.map(tf2))).map((q) => (q.kind === "tf2" && !q.mod ? { ...q, mod } : q)),
    mc: single.filter((q) => q.kind === "mc"),
    multi: multi.map((x) => multiQ(x, mod)),
    blank: blanks.map((x) => blankQ(x, mod)),
  };
}

export function mixedPoolMidterm(
  spec: MidtermSpec, pools: Record<string, MtfItem[]>, scenarios: Record<string, McItem[]>,
  multi: Record<string, MultiItem[]> = {}, blanks: Record<string, BlankItem[]> = {},
): MixedPool {
  const single = quickPoolMidterm(spec, pools, scenarios);
  return {
    tf2: dedupeQs(Object.values(pools).flatMap((items) => items.map(tf2))),
    mc: single.filter((q) => q.kind === "mc"),
    multi: Object.entries(multi).flatMap(([m, xs]) => xs.map((x) => multiQ(x, modTagOf(m)))),
    blank: Object.entries(blanks).flatMap(([m, xs]) => xs.map((x) => blankQ(x, modTagOf(m)))),
  };
}

/** How many of each type a mixed round has: Quick 10 is fixed; others split the points like a Canvas quiz. */
export function mixedCounts(target: number, quick: boolean) {
  if (quick) return { tf2: 4, mc: 3, multi: 2, blank: 1 };
  return {
    tf2: Math.round(target * 0.3),
    mc: Math.round(target * 0.25),
    multi: Math.max(1, Math.round((target * 0.3) / MULTI_POINTS)),
    blank: Math.max(1, Math.round(target * 0.15)),
  };
}

/** A mixed round: unseen questions first within each type, all types shuffled together. */
export function pickMixed(pool: MixedPool, counts: ReturnType<typeof mixedCounts>, seen: string[]) {
  let nextSeen = seen.slice();
  let restarted = false;
  const qs: Question[] = [];
  (Object.keys(counts) as (keyof MixedPool)[]).forEach((k) => {
    const r = pickRound(pool[k], nextSeen, Math.min(counts[k], pool[k].length));
    if (r.restarted) {
      restarted = true;
      // Forget only this type's history; keep the others.
      const ids = new Set(pool[k].map((q) => q.id));
      nextSeen = [...nextSeen.filter((id) => !ids.has(id)), ...r.seen];
    } else nextSeen = r.seen;
    qs.push(...r.qs);
  });
  return { qs: shuffle(qs), seen: nextSeen, restarted };
}

export function mixedSize(pool: MixedPool) {
  return pool.tf2.length + pool.mc.length + pool.multi.length + pool.blank.length;
}
