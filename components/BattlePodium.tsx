import { podiumPlaces, type PodiumPlayer } from "@/lib/battlePodium";

export default function BattlePodium({ players }: { players: PodiumPlayer[] }) {
  const places = podiumPlaces(players);
  if (!places.length) return null;
  return <section className="battle-podium" aria-label="Final match podium">
    <div className="podium-title"><span aria-hidden="true">🏆</span><h3>Match podium</h3><p className="inst">{places[0].names.length > 1 ? "A shared victory! Equal scores share the same place." : "Well played, everyone!"}</p></div>
    <div className="podium-steps">{places.map(p => <div className={`podium-place podium-place-${p.rank}`} key={p.rank}>
      <span className="podium-medal" aria-hidden="true">{["🥇", "🥈", "🥉"][p.rank - 1]}</span>
      <span className="podium-label">{["1st", "2nd", "3rd"][p.rank - 1]} place{p.names.length > 1 ? " · tied" : ""}</span>
      <div className="podium-names">{p.names.map(name => <b key={name}>{name}</b>)}</div>
      <strong className="podium-score">{p.score}<small> {p.score === 1 ? "point" : "points"}</small></strong>
    </div>)}</div>
  </section>;
}
