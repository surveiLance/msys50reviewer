import type { PartySettings } from "../convex/partyQuestions";
export type BattleSettings = PartySettings;
export const BATTLE_TYPES: { key: BattleSettings["types"][number]; label: string }[] = [
  { key: "scenario", label: "Case scenarios" }, { key: "mc", label: "Multiple choice" },
  { key: "tf2", label: "True or false" }, { key: "tf", label: "Modified true or false" },
  { key: "multi", label: "Multiple answer" }, { key: "blank", label: "Fill in the blank" }, { key: "match", label: "Matching" },
];
export const DEFAULT_BATTLE_SETTINGS: BattleSettings = { mode: "mixed", types: ["scenario"], count: 10, seconds: 60, capacity: 8 };
