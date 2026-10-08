export type BattleScoring = "correct" | "fastest" | "ranked";
export const SCORING_OPTIONS: { key: BattleScoring; label: string; description: string }[] = [
  { key: "correct", label: "Every correct answer", description: "Everyone with a fully correct answer gets 1 point. Speed doesn't matter." },
  { key: "fastest", label: "Fastest correct only", description: "Only the fastest fully correct answer gets 1 point. Exact timing ties share the point." },
  { key: "ranked", label: "Speed-ranked points", description: "Every fully correct answer scores. With 3 players: first correct gets 3 points, second gets 2, third gets 1. Wrong or missing answers get 0; exact timing ties get equal points." },
];
export function scoringInfo(mode?: BattleScoring) {
  return SCORING_OPTIONS.find(s => s.key === (mode ?? "fastest"))!;
}
export function roundPoints(mode: BattleScoring | undefined, at: number, correctTimes: number[], playerCount: number): number {
  if ((mode ?? "fastest") === "correct") return 1;
  if (mode === "ranked") return playerCount - correctTimes.filter(time => time < at).length;
  return Number(at === Math.min(...correctTimes));
}
