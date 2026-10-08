"use client";

import { useEffect, useState } from "react";
import { useConvexConnectionState, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { BATTLE_TYPES, DEFAULT_BATTLE_SETTINGS, moduleCounts, validModuleCounts, type BattleSettings } from "@/lib/battleSettings";

type Identity = { token: string; name: string };
type Answer = string | string[];
const identityKey = "mags-battle-player", partyKey = "mags-battle-party";
const formatAnswer = (a: Answer | null | undefined) => Array.isArray(a) ? a.join(" · ") || "No answer" : a || "No answer";
const describe = (s: BattleSettings) => `${s.moduleCounts ? Object.entries(s.moduleCounts).map(([m, n]) => `Module ${m.slice(1)}: ${n}`).join(" · ") : s.mode === "mixed" ? "Modules 1–3" : `Module ${s.mode.slice(1)}`} · ${s.count} questions total · ${s.seconds}s · ${s.capacity} players max`;

function Settings({ value, onChange, disabled }: { value: BattleSettings; onChange: (v: BattleSettings) => void; disabled: boolean }) {
  const counts = moduleCounts(value);
  const updateCounts = (next: typeof counts) => onChange({ ...value, mode: "mixed", moduleCounts: next, count: Object.values(next).reduce((a, b) => a + b, 0) });
  return <div className="party-settings">
    <fieldset className="party-modules" disabled={disabled}><legend>Modules and question counts</legend><p className="inst">Select the modules you want, then enter how many questions from each.</p>{(["M1", "M2", "M3"] as const).map(m => <div className="party-module" key={m}>
      <label className="party-module-toggle"><input type="checkbox" checked={counts[m] !== undefined} onChange={e => { const next = { ...counts }; if (e.target.checked) next[m] = 5; else delete next[m]; updateCounts(next); }} />Module {m.slice(1)}</label>
      {counts[m] !== undefined && <label className="party-module-count">Questions<input aria-label={`Module ${m.slice(1)} question count`} type="number" min={1} max={20} step={1} required value={counts[m] || ""} onChange={e => updateCounts({ ...counts, [m]: e.target.value === "" ? 0 : Number(e.target.value) })} /></label>}
    </div>)}<p className="party-total" role="status">{Object.values(counts).reduce((a, b) => a + b, 0)} questions total</p><p className="inst">1–20 per module. Unchecked modules won’t appear in the game.</p>{!validModuleCounts(value) && <p className="battle-error">Select a module and enter 1–20 questions for each. Your total must cover all selected question types.</p>}</fieldset>
    <div className="party-setting-grid">
      <label>Time per question<select disabled={disabled} value={value.seconds} onChange={e => onChange({ ...value, seconds: Number(e.target.value) })}>{[30, 60, 90, 120].map(n => <option key={n} value={n}>{n} seconds</option>)}</select></label>
      <label>Player limit<select disabled={disabled} value={value.capacity} onChange={e => onChange({ ...value, capacity: Number(e.target.value) })}>{Array.from({ length: 11 }, (_, i) => i + 2).map(n => <option key={n} value={n}>{n === 2 ? "2 · 1v1" : `${n} · group battle`}</option>)}</select></label>
    </div>
    <fieldset className="party-types" disabled={disabled}><legend>Question types</legend>{BATTLE_TYPES.map(t => <label key={t.key}><input type="checkbox" checked={value.types.includes(t.key)} onChange={e => {
      const types = e.target.checked ? [...value.types, t.key] : value.types.filter(x => x !== t.key);
      onChange({ ...value, mode: "mixed", moduleCounts: counts, types, count: Object.values(counts).reduce((a, b) => a + b, 0) });
    }} />{t.label}</label>)}</fieldset>
  </div>;
}

export default function Battle() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return <div className="chart-card battle"><h3>Battle is getting ready</h3><p>The multiplayer backend isn’t connected to this deployment yet. Notes, tests, and your saved scores still work.</p></div>;
  return <Arena />;
}

function Arena() {
  const register = useMutation(api.battle.register), create = useMutation(api.parties.create), requestJoin = useMutation(api.parties.requestJoin);
  const moderate = useMutation(api.parties.moderate), configure = useMutation(api.parties.configure), act = useMutation(api.parties.act);
  const connection = useConvexConnectionState();
  const [identity, setIdentity] = useState<Identity | null>(null), [name, setName] = useState(""), [editingName, setEditingName] = useState(false);
  const [partyId, setPartyId] = useState<Id<"parties"> | null>(null), [title, setTitle] = useState("Study battle");
  const [settings, setSettings] = useState<BattleSettings>(DEFAULT_BATTLE_SETTINGS), [editingSettings, setEditingSettings] = useState(false);
  const [answer, setAnswer] = useState<Answer>(""), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [weekly, setWeekly] = useState(false), [now, setNow] = useState(0), [mounted, setMounted] = useState(false);
  const party = useQuery(api.parties.get, identity && partyId ? { token: identity.token, partyId } : "skip");
  const lobbies = useQuery(api.parties.discover, identity && !partyId ? { token: identity.token } : "skip");
  const leaders = useQuery(api.battle.leaderboard, { weekly });

  useEffect(() => {
    setMounted(true); setNow(Date.now());
    try {
      const stored = JSON.parse(localStorage.getItem(identityKey) || "null") as Identity | null;
      if (stored && /^[a-f0-9]{64}$/.test(stored.token) && typeof stored.name === "string") {
        setIdentity(stored); setName(stored.name);
        const saved = localStorage.getItem(partyKey);
        if (saved && /^[a-z0-9]{32}$/.test(saved)) setPartyId(saved as Id<"parties">);
      }
    } catch { /* Fresh identity if stored data is malformed. */ }
  }, []);
  useEffect(() => { setAnswer(""); }, [partyId, party?.index]);
  useEffect(() => {
    if (party?.phase !== "question") return;
    setNow(Date.now()); const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [party?.phase, party?.deadline]);
  const remember = (id: Id<"parties"> | null) => {
    setPartyId(id); setEditingSettings(false); setError("");
    try { if (id) localStorage.setItem(partyKey, id); else localStorage.removeItem(partyKey); } catch { /* Keep playing in memory. */ }
    const url = new URL(window.location.href); url.searchParams.delete("room"); window.history.replaceState(null, "", url);
  };
  const perform = async (fn: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true); setError("");
    try { await fn(); } catch (e) { setError(e instanceof ConvexError ? String(e.data) : "Couldn’t connect. Check your internet and try again."); } finally { setBusy(false); }
  };
  const saveName = () => perform(async () => {
    const token = identity?.token ?? Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, "0")).join("");
    const saved = await register({ token, name }), next = { token, name: saved.name };
    setIdentity(next); setName(saved.name); setEditingName(false);
    try { localStorage.setItem(identityKey, JSON.stringify(next)); } catch { setError("Browser storage is unavailable. Keep this tab open to retain your identity."); }
  });
  const action = (action: "ready" | "start" | "answer" | "next" | "leave") => perform(async () => {
    if (!identity || !partyId) return;
    await act({ token: identity.token, partyId, action, index: party?.index, revision: party?.revision, ...(action === "answer" ? { answer } : {}) });
    if (action === "leave") remember(null);
  });
  const me = party?.roster.find(m => m.id === party.me);
  const active = party?.roster.filter(m => m.status === "approved") ?? [];
  const pending = party?.roster.filter(m => m.status === "pending") ?? [];
  const q = party?.question;
  const seconds = party ? Math.min(party.settings.seconds, Math.max(0, Math.ceil((party.deadline - now) / 1000))) : 0;
  const currentAnswer = party?.yourAnswer ?? answer;
  const complete = q?.kind === "match" ? Array.isArray(currentAnswer) && currentAnswer.length === q.rows.length && currentAnswer.every(Boolean) : q?.kind === "multi" ? Array.isArray(currentAnswer) && currentAnswer.length > 0 : typeof currentAnswer === "string" && !!currentAnswer.trim();
  const locked = !!me?.answered || busy || seconds === 0;
  const toggle = (option: string) => { const values = Array.isArray(answer) ? answer : []; setAnswer(values.includes(option) ? values.filter(x => x !== option) : [...values, option]); };
  const winners = active.length ? active.filter(m => m.score === Math.max(...active.map(m => m.score))) : [];

  return <div className="battle">
    {mounted && !connection.isWebSocketConnected && <p className="battle-status" role="status">Connecting… Your game resumes when the connection returns.</p>}
    {error && <p className="battle-error" role="alert">{error}</p>}
    {!identity || editingName ? <section className="chart-card"><h3>Choose your nickname</h3><p className="inst">A nickname is required to create or request to join a party. No account needed.</p><form className="battle-form" onSubmit={e => { e.preventDefault(); saveName(); }}><label>Nickname<input value={name} onChange={e => setName(e.target.value)} maxLength={24} required autoComplete="nickname" /></label><button className="btn primary" disabled={busy}>Enter arena</button></form></section>
      : !partyId ? <>
        <section className="chart-card"><div className="battle-heading"><h3>Playing as {identity.name}</h3><button className="hist-review-btn" onClick={() => setEditingName(true)}>Edit nickname</button></div><p className="inst">Fastest correct answer wins 1 point per question. Everyone locks an answer before the reveal, or the timer ends. Exact timing ties share the point. Multiple-answer and matching questions must be fully correct.</p><label>Party name<input value={title} onChange={e => setTitle(e.target.value)} maxLength={60} required /></label><Settings value={settings} onChange={setSettings} disabled={busy} /><button className="btn primary" disabled={busy || !settings.types.length || !validModuleCounts(settings) || !title.trim()} onClick={() => perform(async () => remember(await create({ token: identity.token, title, settings })))}>Create party</button></section>
        <section className="chart-card"><h3>Open parties</h3><p className="inst">Visible to people on this website. No room code—request to join, then wait for the party leader to approve you.</p>{lobbies === undefined ? <p>Loading parties…</p> : !lobbies.length ? <p>No open parties. Create one for your classmates!</p> : <div className="party-lobbies">{lobbies.map(p => <article key={p.id}><div><h4>{p.title}</h4><p>{p.host} · {p.joined}/{p.settings.capacity} approved</p><p className="inst">{describe(p.settings)}</p><p className="inst">{BATTLE_TYPES.filter(t => p.settings.types.includes(t.key)).map(t => t.label).join(" · ")}</p></div><button className="btn" disabled={busy || p.joined >= p.settings.capacity} onClick={() => perform(async () => remember(await requestJoin({ token: identity.token, partyId: p.id })))}>Request to join</button></article>)}</div>}</section>
      </> : party === undefined ? <section className="chart-card"><p role="status">Loading party…</p><button className="btn" onClick={() => remember(null)}>Back to arena</button></section> : !party ? <section className="chart-card"><h3>Party unavailable</h3><button className="btn" onClick={() => remember(null)}>Back to arena</button></section> : <section className="chart-card">
        <div className="battle-heading"><div><span className="eyebrow">{party.host ? "You are the party leader" : `Leader: ${party.hostName}`}</span><h3>{party.title}</h3><p className="inst">{describe(party.settings)}</p></div><button className="btn" disabled={busy} onClick={() => {
          if (["question", "reveal"].includes(party.phase) && !window.confirm(party.host ? "Leave and end the game for everyone? No leaderboard result will be recorded." : "Leave the game? You won’t earn any more round points. With fewer than two players, the game ends.")) return;
          action("leave");
        }}>Leave party</button></div>
        {party.status === "pending" && <p className="battle-status" role="status">Waiting for the leader to approve your request.</p>}
        {party.status === "rejected" && <p className="battle-error">The leader declined or removed you from this party. You can choose a different lobby.</p>}
        {party.status === "left" && <p className="inst">You left this game. Return to the arena to join another party.</p>}
        <div className="party-roster">{party.roster.filter(m => m.status !== "pending").map(m => <div className={m.id === party.me ? "is-you" : ""} key={m.id}><span>{m.host ? "Leader" : "Player"}{m.id === party.me ? " · you" : ""}{m.status === "left" ? " · left" : ""}</span><b>{m.name}</b><strong>{m.score}</strong><small>{party.phase === "lobby" ? m.ready ? "Ready ✓" : "Not ready" : m.answered ? "Answer locked" : "Thinking…"}</small>{party.host && party.phase === "lobby" && !m.host && <button className="hist-delete-btn" disabled={busy} onClick={() => perform(async () => moderate({ token: identity.token, partyId, memberId: m.id, approve: false }))}>Remove</button>}</div>)}</div>
        {party.phase === "lobby" && party.host && <>
          <h4>Join requests</h4>{!pending.length ? <p className="inst">No pending requests. Your lobby is listed on everyone’s Battle page.</p> : pending.map(m => <div className="party-request" key={m.id}><b>{m.name}</b><button className="btn primary" disabled={busy || active.length >= party.settings.capacity} onClick={() => perform(async () => moderate({ token: identity.token, partyId, memberId: m.id, approve: true }))}>Approve {m.name}</button><button className="btn" disabled={busy} onClick={() => perform(async () => moderate({ token: identity.token, partyId, memberId: m.id, approve: false }))}>Decline {m.name}</button></div>)}
          {!editingSettings ? <button className="btn" disabled={busy} onClick={() => { setSettings({ ...party.settings, moduleCounts: moduleCounts(party.settings) }); setEditingSettings(true); }}>Edit game settings</button> : <><Settings value={settings} onChange={setSettings} disabled={busy} /><div className="module-links"><button className="btn primary" disabled={busy || !settings.types.length || !validModuleCounts(settings)} onClick={() => perform(async () => { await configure({ token: identity.token, partyId, settings }); setEditingSettings(false); })}>Save settings</button><button className="btn" onClick={() => setEditingSettings(false)}>Cancel settings edit</button></div><p className="inst">Saving settings asks approved players to press Ready again.</p></>}
          <button className="btn primary" disabled={busy || !party.readyToStart || editingSettings} onClick={() => action("start")}>Start game</button><p className="inst">Approve at least one opponent and wait for everyone to be ready. Only you can start the game.</p>
        </>}
        {party.phase === "lobby" && !party.host && party.status === "approved" && <><p className="inst">{BATTLE_TYPES.filter(t => party.settings.types.includes(t.key)).map(t => t.label).join(" · ")}</p><button className="btn primary" disabled={busy || me?.ready} onClick={() => action("ready")}>{me?.ready ? "Ready · waiting for the leader" : "Ready to play"}</button></>}
        {party.phase === "cancelled" && <p className="inst">The leader ended the party, it expired, or fewer than two players remained. No leaderboard result is recorded.</p>}
        {party.phase === "question" && q && party.status === "approved" && <>
          <div className="battle-heading"><span className="eyebrow">Question {party.index + 1}/{party.total} · Module {q.module.slice(1)} · {BATTLE_TYPES.find(t => t.key === q.kind)?.label}</span><span role="timer" aria-label={`${seconds} seconds remaining`}>{seconds}s</span></div>
          <div className="battle-prompt" dangerouslySetInnerHTML={{ __html: q.prompt }} />
          {q.kind === "tf" ? <label>Type ! if true, or replace the underlined term<input disabled={locked} value={typeof currentAnswer === "string" ? currentAnswer : ""} onChange={e => setAnswer(e.target.value)} maxLength={150} autoComplete="off" /></label>
            : q.kind === "match" ? <div className="party-matching">{q.rows.map((row, i) => <label key={i}><span dangerouslySetInnerHTML={{ __html: row }} /><select disabled={locked} value={Array.isArray(currentAnswer) ? currentAnswer[i] ?? "" : ""} onChange={e => { const picks = Array.isArray(answer) ? [...answer] : q.rows.map(() => ""); picks[i] = e.target.value; setAnswer(picks); }}><option value="">Choose a term</option>{q.options.map(o => <option key={o} value={o}>{o}</option>)}</select></label>)}</div>
              : <fieldset className="battle-options" disabled={locked}><legend className="sr-only">{q.kind === "multi" ? "Select every correct answer" : "Choose your answer"}</legend>{q.options.map(o => <label key={o}><input type={q.kind === "multi" ? "checkbox" : "radio"} name="party-answer" checked={q.kind === "multi" ? Array.isArray(currentAnswer) && currentAnswer.includes(o) : currentAnswer === o} onChange={() => q.kind === "multi" ? toggle(o) : setAnswer(o)} /><span>{o}</span></label>)}</fieldset>}
          {q.kind === "multi" && <p className="inst">Select every correct option. No partial credit in speed battles.</p>}
          <button className="btn primary" disabled={locked || !complete} onClick={() => action("answer")}>{me?.answered ? "Answer locked · waiting for everyone" : seconds === 0 ? "Time up · revealing answers" : "Lock answer"}</button><p className="inst">{active.filter(m => m.answered).length}/{active.length} answers locked. Timing uses when the server receives your answer; connection speed can affect close races.</p>
        </>}
        {(party.phase === "reveal" || party.phase === "finished") && party.result && q && <>
          <h4 className="battle-outcome">{party.phase === "finished" ? winners.length > 1 ? `Draw: ${winners.map(m => m.name).join(", ")}` : `${winners[0]?.name ?? "Nobody"} wins the game!` : party.result.players.some(p => p.points) ? `${party.result.players.filter(p => p.points).map(p => p.name).join(" & ")} won this round!` : "No correct answers this round"}</h4>
          <div className="battle-prompt" dangerouslySetInnerHTML={{ __html: q.prompt }} />
          <div className="battle-result">{q.rows.length ? q.rows.map((row, i) => <p key={i}><span dangerouslySetInnerHTML={{ __html: row }} /> → <b>{party.result!.correct[i]}</b></p>) : <p><b>Correct answer:</b> {party.result.correct.join(" · ")}</p>}<p>{party.result.explanation}</p>{party.result.source && <p className="inst">Source: {party.result.source}</p>}{party.result.players.map(p => <p key={p.id} className={p.correct ? "battle-right" : "battle-wrong"}><b>{p.name}</b>: {formatAnswer(p.answer)} · {p.correct ? "Correct" : "Incorrect / no answer"} · {p.milliseconds === null ? "No submission" : `${(p.milliseconds / 1000).toFixed(2)}s`} · +{p.points}{p.correct && !p.points ? " (another correct answer arrived first)" : ""}</p>)}</div>
          {party.phase === "reveal" && (party.host ? <button className="btn primary" disabled={busy} onClick={() => action("next")}>Next question</button> : <p className="inst">Waiting for the party leader to start the next question.</p>)}
          {party.phase === "finished" && <><p className="inst">Final result saved to the leaderboard. Accuracy counts all your correct answers—even when another player was faster.</p><button className="btn primary" onClick={() => remember(null)}>Back to arena</button><details className="battle-review"><summary>Review your answers</summary>{party.review?.map((q, i) => <article key={i}><h4>{i + 1}. <span dangerouslySetInnerHTML={{ __html: q.prompt }} /></h4>{q.rows.length ? q.rows.map((row, j) => <p key={j}><span dangerouslySetInnerHTML={{ __html: row }} /> → {q.correct[j]}</p>) : <p>Correct: {q.correct.join(" · ")}</p>}<p>Your answer: {formatAnswer(q.yourAnswer)} · {q.ok ? "Correct" : "Incorrect"} · +{q.points}</p><p>{q.explanation}</p></article>)}</details></>}
        </>}
      </section>}
    <section className="chart-card"><div className="battle-heading"><h3>Leaderboard</h3><div className="battle-period"><button className="btn" aria-pressed={!weekly} onClick={() => setWeekly(false)}>All time</button><button className="btn" aria-pressed={weekly} onClick={() => setWeekly(true)}>This week</button></div></div><p className="inst">Ranked by game wins · completed games only{weekly ? " · week starts Monday, UTC" : ""}. Nicknames are public and unverified.</p>{leaders === undefined ? <p>Loading rankings…</p> : !leaders.length ? <p>No completed battles yet. Be the first!</p> : <div className="tbl"><table className="hist"><thead><tr><th>Player</th><th>Wins</th><th>Draws</th><th>Played</th><th>Accuracy</th></tr></thead><tbody>{leaders.map((p, i) => <tr key={p.id}><td>{i + 1}. {p.name}</td><td>{p.wins}</td><td>{p.draws}</td><td>{p.matches}</td><td>{p.accuracy}%</td></tr>)}</tbody></table></div>}</section>
    <p className="inst">Identity stays in this browser. Clearing storage starts a new profile. Players need separate browsers or devices. Existing solo quizzes and scores are unchanged.</p>
  </div>;
}
