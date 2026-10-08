import type { PartySettings } from "../convex/partyQuestions";
export type BattleSettings = PartySettings;
export const BATTLE_TYPES: { key: BattleSettings["types"][number]; label: string }[] = [
  { key: "scenario", label: "Case scenarios" }, { key: "mc", label: "Multiple choice" },
  { key: "tf2", label: "True or false" }, { key: "tf", label: "Modified true or false" },
  { key: "multi", label: "Multiple answer" }, { key: "blank", label: "Fill in the blank" }, { key: "match", label: "Matching" },
];
export function moduleCounts(s: BattleSettings): NonNullable<BattleSettings["moduleCounts"]> {
  if (s.moduleCounts) return s.moduleCounts;
  if (s.mode !== "mixed") return { [s.mode]: s.count };
  return { M1: Math.ceil(s.count / 3), M2: Math.floor((s.count + 1) / 3), M3: Math.floor(s.count / 3) };
}
export function validModuleCounts(s: BattleSettings) {
  const counts = Object.values(moduleCounts(s));
  return counts.length > 0 && counts.every(n => Number.isInteger(n) && n >= 1 && n <= 20) && counts.reduce((a, b) => a + b, 0) >= s.types.length;
}
export const DEFAULT_BATTLE_SETTINGS: BattleSettings = { mode: "mixed", types: ["scenario"], count: 10, moduleCounts: { M1: 4, M2: 3, M3: 3 }, seconds: 60, capacity: 8 };
