import type { AlternativeQuestion, BlankItem, McItem, MidtermSpec, MtfItem, MultiItem, Section, TestSet } from "./types";
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
  | { kind: "tf2"; id: string; section: string; prompt: string; isTrue: boolean; underlined?: string; fix?: string; why?: string; source?: string; mod?: string }
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
    source: x.r,
    mod: x.mod,
  }));
}

export function totalPoints(qs: Question[]) {
  return qs.reduce((s, q) => s + points(q), 0);
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


/* ---------- Quick rounds: 10 single questions at a time, rotating through everything ---------- */

const mcQ = (x: McItem, section: string, mod?: string): Question => ({
  kind: "mc", id: `c:${x.q}`, section, prompt: x.q, options: shuffle(x.o), answer: x.a, why: x.w, source: x.r, mod,
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

const modTagOf = (slug: string) => slug.replace(/^module-(\d+)$/, "M$1");

/* ---------- Rounds built from the question types a student checks ---------- */

export type QType = "tf" | "tf2" | "mc" | "multi" | "blank" | "match";
export const QTYPES: { key: QType; label: string; hint: string }[] = [
  { key: "tf", label: "Modified true or false", hint: `Type ${TRUE_MARK} or the correct word` },
  { key: "tf2", label: "True or false", hint: "Pick True or False" },
  { key: "mc", label: "Multiple choice", hint: "Includes case scenarios" },
  { key: "multi", label: "Multiple answer", hint: "Checkboxes, partial credit" },
  { key: "blank", label: "Fill in the blank", hint: "Word bank" },
  { key: "match", label: "Matching", hint: "Dropdowns" },
];
export type Pool = Record<QType, Question[]>;

const emptyPool = (): Pool => ({ tf: [], tf2: [], mc: [], multi: [], blank: [], match: [] });

/** Converts independently authored alternatives without cloning one fact into multiple question types. */
function alternativePool(items: AlternativeQuestion[], module: string): Pool {
  const pool = emptyPool();
  const mod = modTagOf(module);
  items.forEach((item, i) => {
    const id = `alt:${module}:${item.kind}:${i}`;
    if (item.kind === "tf2") pool.tf2.push({ ...item, id, section: "Alternative set", mod });
    if (item.kind === "mc") pool.mc.push({ ...item, id, section: "Alternative set", options: shuffle(item.options), mod });
    if (item.kind === "multi") pool.multi.push({ ...item, id, section: "Alternative set", options: shuffle(item.options), mod });
    if (item.kind === "blank") pool.blank.push({ ...item, id, section: "Alternative set", bank: shuffle(item.bank), mod });
  });
  return pool;
}

export function poolAlternativeModule(items: AlternativeQuestion[] = [], module: string): Pool {
  return alternativePool(items, module);
}

export function poolAlternativeMidterm(items: Record<string, AlternativeQuestion[]> = {}): Pool {
  const out = emptyPool();
  Object.entries(items).forEach(([module, questions]) => {
    const pool = alternativePool(questions, module);
    (Object.keys(out) as QType[]).forEach((type) => out[type].push(...pool[type]));
  });
  return out;
}

/** Midterm-only practice containing every lesson-validated case scenario. */
export function poolScenarioMidterm(scenarios: Record<string, McItem[]> = {}): Pool {
  const out = emptyPool();
  out.mc = Object.entries(scenarios).flatMap(([module, items]) =>
    items.map((item, i) => ({
      ...mcQ(item, "Scenario practice", module),
      id: `scenario:${module}:${i}`,
    })),
  );
  return out;
}

/** Matching questions show at most this many rows per round, so one can't take over a short test. */
export const MATCH_ROWS = 5;

/** Every question a module can draw from, by type (all of its question sets). */
export function poolModule(sets: Record<string, TestSet>, module: string, multi: MultiItem[] = [], blanks: BlankItem[] = []): Pool {
  const mod = modTagOf(module);
  const mtf = Object.values(sets).flatMap((t) => t.mtf);
  const single = quickPoolModule(sets, mod);
  const tag = (q: Question): Question => (q.kind !== "match" && !q.mod ? { ...q, mod } : q);
  return {
    tf: dedupeQs(mtf.map(tf)).map(tag),
    tf2: dedupeQs(mtf.map(tf2)).map(tag),
    mc: single.filter((q) => q.kind === "mc"),
    multi: multi.map((x) => multiQ(x, mod)),
    blank: blanks.map((x) => blankQ(x, mod)),
    match: dedupeQs(Object.values(sets).flatMap((t) => t.secs.filter((x) => x.kind !== "mc").flatMap((x) => fromSection(x)))),
  };
}

/** Every question the midterm can draw from: all modules' banks plus the midterm's own sections. */
export function poolMidterm(
  spec: MidtermSpec, pools: Record<string, MtfItem[]>, scenarios: Record<string, McItem[]>,
  tests: Record<string, Record<string, TestSet>>, multi: Record<string, MultiItem[]> = {}, blanks: Record<string, BlankItem[]> = {},
): Pool {
  const mtf = Object.values(pools).flat();
  return {
    tf: dedupeQs(mtf.map(tf)),
    tf2: dedupeQs(mtf.map(tf2)),
    mc: quickPoolMidterm(spec, pools, scenarios).filter((q) => q.kind === "mc"),
    multi: Object.entries(multi).flatMap(([m, xs]) => xs.map((x) => multiQ(x, modTagOf(m)))),
    blank: Object.entries(blanks).flatMap(([m, xs]) => xs.map((x) => blankQ(x, modTagOf(m)))),
    match: dedupeQs([
      ...spec.secs.filter((x) => x.kind !== "mc").flatMap((x) => fromSection(x)),
      ...Object.values(tests).flatMap((sets) => Object.values(sets).flatMap((t) => t.secs.filter((x) => x.kind !== "mc").flatMap((x) => fromSection(x)))),
    ]),
  };
}

/** Unique questions across the chosen types (a statement used as both kinds of true or false counts once). */
export const poolSize = (pool: Pool, types: QType[]) =>
  new Set(types.flatMap((t) => pool[t].map((q) => q.id.replace(/^(tf|t2):/, "st:")))).size;

// How much of a round each type gets (normalized over the checked types), and its points per question.
const WEIGHT: Record<QType, number> = { tf: 0.3, tf2: 0.3, mc: 0.25, multi: 0.3, blank: 0.15, match: 0.2 };
const PTS: Record<QType, number> = { tf: 1, tf2: 1, mc: 1, multi: MULTI_POINTS, blank: 1, match: MATCH_ROWS };

/**
 * How many questions of each checked type a round gets: Quick rounds are 10 questions,
 * other rounds aim for `target` points. Every checked type gets at least one question.
 */
export function roundCounts(pool: Pool, types: QType[], target: number, quick: boolean): Record<QType, number> {
  const sel = types.filter((t) => pool[t].length);
  const counts = { tf: 0, tf2: 0, mc: 0, multi: 0, blank: 0, match: 0 } as Record<QType, number>;
  if (!sel.length) return counts;
  const total = sel.reduce((s, t) => s + WEIGHT[t], 0);
  if (quick) {
    const raw = sel.map((t) => ({ t, x: (WEIGHT[t] / total) * 10 }));
    raw.forEach(({ t, x }) => (counts[t] = Math.max(1, Math.floor(x))));
    let left = 10 - sel.reduce((s, t) => s + counts[t], 0);
    raw.sort((a, b) => (b.x % 1) - (a.x % 1));
    for (let i = 0; left > 0 && i < raw.length * 3; i++) {
      const t = raw[i % raw.length].t;
      if (counts[t] < pool[t].length) counts[t]++, left--;
    }
  } else {
    sel.forEach((t) => (counts[t] = Math.max(1, Math.round((target * WEIGHT[t]) / total / PTS[t]))));
  }
  sel.forEach((t) => (counts[t] = Math.min(counts[t], pool[t].length)));
  return counts;
}

export const roundPoints = (pool: Pool, counts: Record<QType, number>) =>
  (Object.keys(counts) as QType[]).reduce((s, t) => s + counts[t] * (t === "match" ? Math.min(MATCH_ROWS, avgRows(pool.match)) : PTS[t]), 0);
const avgRows = (qs: Question[]) => (qs.length ? Math.round(qs.reduce((s, q) => s + (q.kind === "match" ? q.rows.length : 0), 0) / qs.length) : MATCH_ROWS);

/** Modified and plain true or false share a statement; treat them as one for "seen" and within a round. */
const baseId = (id: string) => id.replace(/^(tf|t2):/, "st:");

/** Rotate across modules instead of clustering randomly in one module. */
function variedScenarioPick(qs: Question[], n: number): Question[] {
  const groups = new Map<string, Question[]>();
  shuffle(qs).forEach((q) => {
    const key = q.kind !== "match" && q.mod ? q.mod : "other";
    groups.set(key, [...(groups.get(key) || []), q]);
  });
  const picked: Question[] = [];
  while (picked.length < n && [...groups.values()].some((group) => group.length)) {
    shuffle([...groups.keys()]).forEach((key) => {
      const group = groups.get(key)!;
      if (picked.length < n && group.length) picked.push(group.pop()!);
    });
  }
  return picked;
}

/** Keep true/false-only rounds from becoming a long run of the same answer. */
function variedTruthPick(qs: Question[], n: number): Question[] {
  const truthQuestions = qs.filter((q) => (q.kind === "tf" || q.kind === "tf2") && q.isTrue);
  const falseQuestions = qs.filter((q) => (q.kind === "tf" || q.kind === "tf2") && !q.isTrue);
  if (!truthQuestions.length || !falseQuestions.length) return shuffle(qs).slice(0, n);
  const groups = [shuffle(truthQuestions), shuffle(falseQuestions)];
  if (Math.random() < 0.5) groups.reverse();
  const picked: Question[] = [];
  while (picked.length < n && groups.some((group) => group.length)) {
    groups.forEach((group) => {
      if (picked.length < n && group.length) picked.push(group.pop()!);
    });
  }
  return picked;
}

function variedPick(qs: Question[], n: number, type: QType): Question[] {
  if (type === "tf" || type === "tf2") return variedTruthPick(qs, n);
  return variedScenarioPick(qs, n);
}

/** Rotate correct MC choices through the available positions, then shuffle distractors. */
function varyAnswerPositions(qs: Question[]): Question[] {
  const positions = new Map<number, number[]>();
  return qs.map((q) => {
    if (q.kind !== "mc" || q.options.length < 2) return q;
    const answerIndex = q.options.indexOf(q.answer);
    if (answerIndex < 0) return q;
    let queue = positions.get(q.options.length) || [];
    if (!queue.length) queue = shuffle(q.options.map((_, i) => i));
    const target = queue.pop()!;
    positions.set(q.options.length, queue);
    const rest = q.options.slice();
    rest.splice(answerIndex, 1);
    const options = shuffle(rest);
    options.splice(target, 0, q.answer);
    return { ...q, options };
  });
}

function varyTruthOrder(qs: Question[]): Question[] {
  return qs.every((q) => q.kind === "tf" || q.kind === "tf2") ? variedTruthPick(qs, qs.length) : qs;
}

/**
 * Builds a round: unseen questions first within each type, never the same statement twice,
 * Previously practiced questions rotate oldest-first once fresh questions run out.
 * Matching rows rotate independently, rather than re-randomizing the same handful of rows.
 */
export function pickTypes(pool: Pool, counts: Record<QType, number>, seen: string[]) {
  // Keep a unique, oldest-to-newest history, including histories from earlier versions.
  let nextSeen = [...new Set(seen.map(baseId))];
  const remember = (ids: string[]) => {
    const selected = new Set(ids);
    nextSeen = [...nextSeen.filter(id => !selected.has(id)), ...ids];
  };
  const used = new Set<string>();
  let restarted = false;
  const qs: Question[] = [];
  (Object.keys(counts) as QType[]).forEach((t) => {
    const n = counts[t];
    if (!n) return;
    const seenSet = new Set(nextSeen);
    const avail = pool[t].filter((q) => !used.has(baseId(q.id)));
    let fresh = variedPick(avail.filter((q) => !seenSet.has(baseId(q.id))), n, t);
    if (fresh.length < n) {
      // Exhaustion should not reset the bank and immediately repeat the last round.
      restarted = true;
      const have = new Set(fresh.map((q) => baseId(q.id)));
      const oldest = avail.filter(q => !have.has(baseId(q.id))).sort((a, b) => nextSeen.indexOf(baseId(a.id)) - nextSeen.indexOf(baseId(b.id)));
      fresh = [...fresh, ...oldest.slice(0, n - fresh.length)];
    }
    fresh.forEach((q) => {
      used.add(baseId(q.id));
      remember([baseId(q.id)]);
      if (q.kind === "match") {
        const rowId = (row: typeof q.rows[number]) => `row:${q.id}:${row.prompt}`;
        const rows = shuffle(q.rows).sort((a, b) => nextSeen.indexOf(rowId(a)) - nextSeen.indexOf(rowId(b))).slice(0, MATCH_ROWS);
        remember(rows.map(rowId));
        qs.push({ ...q, rows: shuffle(rows) });
      } else qs.push(q);
    });
  });
  return { qs: varyAnswerPositions(varyTruthOrder(shuffle(qs))), seen: nextSeen, restarted };
}
