import type { SubjectData } from "./types";
import { pickTypes, poolAlternativeModule, poolModule, poolSize, QTYPES, type Pool, type QType, type Question } from "./questions";
import { shuffle } from "./quiz";

const TYPES = QTYPES.map(t => t.key);
const empty = (): Pool => ({ tf: [], tf2: [], mc: [], multi: [], blank: [], match: [] });

/** Only the explicit, confirmed coverage enters this exam. Never infer from all available lessons. */
export function finalsPool(data: SubjectData, modules: string[], cases: boolean): Pool {
  const out = empty();
  for (const module of new Set(modules)) {
    const pool = cases
      ? poolAlternativeModule(data.finalCases?.[module], module)
      : poolModule(data.tests[module] ?? {}, module, data.multi?.[module], data.blanks?.[module]);
    for (const type of TYPES) out[type].push(...pool[type].map(q => ({
      ...q,
      id: `finals:${module}:${q.id.replace(/^(tf|t2):/, "st:")}`,
      mod: module.replace(/^module-/, "M"),
      section: cases ? "Long company cases" : q.section,
    })));
  }
  return out;
}

/** Round-robin allocation caps small banks before redistributing unused places. */
export function finalsRoundCounts(pool: Pool, types: QType[], count: number) {
  const groups = new Map<string, Pool>();
  for (const type of new Set(types)) for (const q of pool[type]) {
    if (!q.mod) continue;
    if (!groups.has(q.mod)) groups.set(q.mod, empty());
    groups.get(q.mod)![type].push(q);
  }
  const quotas = new Map([...groups.keys()].map(module => [module, 0]));
  let left = Math.max(0, Math.min(Math.floor(count), poolSize(pool, types)));
  const order = shuffle([...groups.keys()]);
  while (left > 0) {
    let allocated = false;
    for (const mod of order) {
      if (!left) break;
      if (quotas.get(mod)! >= poolSize(groups.get(mod)!, types)) continue;
      quotas.set(mod, quotas.get(mod)! + 1);
      left--; allocated = true;
    }
    if (!allocated) break;
  }
  const allocations = [...groups].map(([mod, group]) => {
    const counts = Object.fromEntries(TYPES.map(type => [type, 0])) as Record<QType, number>;
    // Plan using unique IDs so a statement cannot be counted as both kinds of true/false.
    const used = new Set<string>();
    const selected = TYPES.filter(type => types.includes(type));
    while (used.size < quotas.get(mod)!) {
      let allocated = false;
      for (const type of selected) {
        if (used.size >= quotas.get(mod)!) break;
        const q = group[type].find(q => !used.has(q.id));
        if (q) { used.add(q.id); counts[type]++; allocated = true; }
      }
      if (!allocated) break;
    }
    return { mod, group, counts };
  });
  return { allocations, questions: [...quotas.values()].reduce((sum, n) => sum + n, 0) };
}

/** Balance covered modules first, then rotate unseen questions within each selected type. */
export function pickFinalsRound(pool: Pool, types: QType[], count: number, seen: string[]) {
  const { allocations } = finalsRoundCounts(pool, types, count);
  const qs: Question[] = [];
  let history = seen;
  let restarted = false;
  for (const { group, counts } of allocations) {
    const round = pickTypes(group, counts, history);
    qs.push(...round.qs);
    history = round.seen;
    restarted ||= round.restarted;
  }
  return { qs: shuffle(qs), seen: history, restarted };
}
