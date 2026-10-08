"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { scoringInfo } from "@/lib/battleScoring";

export default function BattleLeaderboard() {
  const [tab, setTab] = useState("rankings"), [weekly, setWeekly] = useState(false);
  const leaders = useQuery(api.battle.leaderboard, { weekly });
  const matches = useQuery(api.matches.history, tab === "history" ? {} : "skip");
  return <details className="chart-card arena-leaderboard"><summary>Leaderboard</summary>
    <div className="battle-period" role="tablist" aria-label="Leaderboard views">{[["rankings", "Rankings"], ["history", "Match history"]].map(([key, label]) => <button key={key} id={`battle-tab-${key}`} role="tab" aria-selected={tab === key} aria-controls={`battle-panel-${key}`} className="btn" onClick={() => setTab(key)}>{label}</button>)}</div>
    {tab === "rankings" ? <div role="tabpanel" id="battle-panel-rankings" aria-labelledby="battle-tab-rankings">
      <div className="battle-heading"><h3>Most wins</h3><div className="battle-period"><button className="btn" aria-pressed={!weekly} onClick={() => setWeekly(false)}>All time</button><button className="btn" aria-pressed={weekly} onClick={() => setWeekly(true)}>This week</button></div></div>
      <p className="inst">Ranked only by game wins · equal wins share a rank · completed games only{weekly ? " · week starts Monday, UTC" : ""}. Nicknames are public and unverified.</p>
      {leaders === undefined ? <p>Loading rankings…</p> : !leaders.length ? <p>No completed battles yet. Be the first!</p> : <div className="tbl"><table className="hist"><thead><tr><th>Player</th><th>Wins</th><th>Draws</th><th>Played</th></tr></thead><tbody>{leaders.map(p => <tr key={p.id}><td>{p.rank}. {p.name}</td><td>{p.wins}</td><td>{p.draws}</td><td>{p.matches}</td></tr>)}</tbody></table></div>}
    </div> : <div role="tabpanel" id="battle-panel-history" aria-labelledby="battle-tab-history">
      <h3>Recent matches</h3><p className="inst">The latest 30 completed party battles, newest first. Cancelled games don’t count. Scores are public; the leader’s hidden-results setting also applies here.</p>
      {matches === undefined ? <p>Loading matches…</p> : !matches.length ? <p>No completed party battles yet.</p> : <div className="battle-match-list">{matches.map(m => <details className="battle-match" key={m.id}><summary><b>{m.title}</b><span>{m.winners.length > 1 ? `Draw: ${m.winners.join(" & ")}` : `${m.winners[0] ?? "Nobody"} won`}</span></summary>
        <p className="inst">{m.completedAt ? new Date(m.completedAt).toLocaleString() : "Earlier match · completion time unavailable"} · {m.total} questions · {scoringInfo(m.scoring).label}</p>
        {m.resultsHidden && <p className="inst">Individual answer stats were hidden by the leader.</p>}
        <div className="tbl"><table className="hist"><thead><tr><th>Player</th><th>Points</th>{!m.resultsHidden && <><th>Correct</th><th>Wrong</th><th>No answer</th><th>Avg. time</th></>}</tr></thead><tbody>{m.players.map(p => <tr key={p.name}><td>{p.left ? "Left · " : `${p.rank}. `}{p.name}</td><td>{p.score}</td>{p.stats && <><td>{p.stats.correct}</td><td>{p.stats.wrong}</td><td>{p.stats.unanswered}</td><td>{p.stats.averageMs === null ? "—" : `${(p.stats.averageMs / 1000).toFixed(2)}s`}</td></>}</tr>)}</tbody></table></div>
        {!m.resultsHidden && <p className="inst">Average time includes submitted answers only, measured at the server. Earlier matches may not have timing data.</p>}
      </details>)}</div>}
    </div>}
  </details>;
}
