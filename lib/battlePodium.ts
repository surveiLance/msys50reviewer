export type PodiumPlayer = { name: string; score: number };

/** Competition ranking: tied firsts share gold; the next player is third, not second. */
export function podiumPlaces(players: PodiumPlayer[]) {
  return [1, 2, 3].flatMap(rank => {
    const group = players.filter(p => 1 + players.filter(other => other.score > p.score).length === rank);
    return group.length ? [{ rank, score: group[0].score, names: group.map(p => p.name).sort((a, b) => a.localeCompare(b)) }] : [];
  });
}
