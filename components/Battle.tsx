"use client";

import { useEffect, useState } from "react";
import { useConvexConnectionState, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";

type Identity = { token: string; name: string };
const identityKey = "mags-battle-player";
const roomKey = "mags-battle-room";
type Mode = "mixed" | "M1" | "M2" | "M3";

export default function Battle() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return <div className="chart-card battle"><h3>Battle is getting ready</h3><p>The multiplayer backend isn’t connected to this deployment yet. Notes, tests, and your saved scores still work.</p></div>;
  return <ConnectedBattle />;
}

function ConnectedBattle() {
  const register = useMutation(api.battle.register);
  const create = useMutation(api.battle.create);
  const join = useMutation(api.battle.join);
  const act = useMutation(api.battle.act);
  const connection = useConvexConnectionState();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [code, setCode] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<Mode>("mixed");
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [weekly, setWeekly] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [mounted, setMounted] = useState(false);
  const room = useQuery(api.battle.getRoom, identity && roomCode ? { token: identity.token, code: roomCode } : "skip");
  const leaders = useQuery(api.battle.leaderboard, { weekly });

  useEffect(() => {
    setMounted(true);
    try {
      const stored = JSON.parse(localStorage.getItem(identityKey) || "null") as Identity | null;
      if (stored && /^[a-f0-9]{64}$/.test(stored.token)) { setIdentity(stored); setName(stored.name); }
      const incoming = new URLSearchParams(window.location.search).get("room");
      const savedRoom = localStorage.getItem(roomKey);
      if (incoming) {
        const incomingCode = incoming.toUpperCase().slice(0, 6);
        setCode(incomingCode);
        if (stored && savedRoom === incomingCode) setRoomCode(savedRoom);
      } else if (stored && savedRoom) setRoomCode(savedRoom);
    } catch { /* Fresh identity when storage is unavailable or malformed. */ }
  }, []);
  useEffect(() => { setSelected(null); }, [roomCode, room?.index]);
  useEffect(() => {
    if (room?.phase !== "question") return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [room?.phase, room?.deadline]);

  const rememberRoom = (next: string) => {
    setRoomCode(next); setNotice("");
    try { if (next) localStorage.setItem(roomKey, next); else localStorage.removeItem(roomKey); } catch { /* Keep playing in memory. */ }
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("room", next); else url.searchParams.delete("room");
    window.history.replaceState(null, "", url);
  };
  const perform = async (fn: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try { await fn(); } catch (e) {
      setError(e instanceof ConvexError ? String(e.data) : "Couldn’t connect. Check your internet and try again.");
    } finally { setBusy(false); }
  };
  const saveName = () => perform(async () => {
    const token = identity?.token ?? Array.from(crypto.getRandomValues(new Uint8Array(32)), (v) => v.toString(16).padStart(2, "0")).join("");
    const saved = await register({ token, name });
    const next = { token, name: saved.name };
    setIdentity(next); setName(saved.name); setEditingName(false);
    try { localStorage.setItem(identityKey, JSON.stringify(next)); } catch { setNotice("Your browser can’t save your identity. Keep this tab open to retain your player profile."); }
  });
  const action = (action: "ready" | "answer" | "next" | "leave") => perform(async () => {
    if (!identity) return;
    await act({ token: identity.token, code: roomCode, action, index: room?.index, ...(action === "answer" && selected !== null ? { answer: selected } : {}) });
    if (action === "leave") rememberRoom("");
  });
  const mine = room?.side === "owner" ? room.owner : room?.guest;
  const other = room?.side === "owner" ? room.guest : room?.owner;
  const seconds = room ? Math.min(60, Math.max(0, Math.ceil((room.deadline - now) / 1000))) : 0;
  const answerText = (value: number | null | undefined) => room?.question?.options.find((o) => o.value === value)?.text ?? "No answer";
  const copyLink = () => perform(async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?room=${roomCode}`); setNotice("Invite link copied."); }
    catch { setNotice(`Share room code ${roomCode} with your opponent.`); }
  });

  return <div className="battle">
    {mounted && !connection.isWebSocketConnected && <p className="battle-status" role="status">Connecting… Your battle will resume when the connection returns.</p>}
    {error && <p className="battle-error" role="alert">{error}</p>}
    {notice && <p role="status" className="inst">{notice}</p>}
    {!identity || editingName ? <section className="chart-card">
      <h3>Choose your nickname</h3><p className="inst">No account needed. Your nickname is public on the leaderboard.</p>
      <form onSubmit={(e) => { e.preventDefault(); saveName(); }} className="battle-form">
        <label>Nickname<input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoComplete="nickname" required /></label>
        <button className="btn primary" disabled={busy}>Enter arena</button>
      </form>
    </section> : !roomCode ? <section className="chart-card">
      <div className="battle-heading"><h3>Playing as {identity.name}</h3><button type="button" className="hist-review-btn" onClick={() => setEditingName(true)}>Edit nickname</button></div>
      <p className="inst">10 scenario questions · 60 seconds each · 1 point per correct answer. No speed bonus.</p>
      <div className="battle-lobby-grid">
        <div><h4>Side 1 · create a room</h4><label>Question pool<select value={mode} onChange={(e) => setMode(e.target.value as Mode)}><option value="mixed">Mixed Modules 1–3</option><option value="M1">Module 1</option><option value="M2">Module 2</option><option value="M3">Module 3</option></select></label><button className="btn primary" disabled={busy} onClick={() => perform(async () => rememberRoom(await create({ token: identity.token, mode })))}>Create room</button></div>
        <form onSubmit={(e) => { e.preventDefault(); perform(async () => rememberRoom(await join({ token: identity.token, code }))); }}><h4>Side 2 · join a room</h4><label>Room code<input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))} minLength={6} maxLength={6} required placeholder="ABC234" autoCapitalize="characters" /></label><button className="btn" disabled={busy || code.length !== 6}>Join room</button></form>
      </div>
    </section> : room === undefined ? <section className="chart-card"><p role="status">Loading your room…</p><button className="btn" onClick={() => rememberRoom("")}>Back to arena</button></section> : !room ? <section className="chart-card"><h3>Room unavailable</h3><button className="btn" onClick={() => rememberRoom("")}>Back to arena</button></section> : <section className="chart-card">
      <div className="battle-heading"><div><span className="eyebrow">Room {room.code} · {room.mode === "mixed" ? "Modules 1–3" : `Module ${room.mode.slice(1)}`}</span><h3>{room.phase === "lobby" ? "Ready to battle?" : room.phase === "finished" ? "Battle complete" : room.phase === "cancelled" ? "Battle ended" : `Question ${room.index + 1} of ${room.total}`}</h3></div><button className="btn" disabled={busy} onClick={() => { if (["question", "reveal"].includes(room.phase) && !window.confirm("Leave this battle? It will end for both players, without recording a leaderboard result.")) return; action("leave"); }}>Leave room</button></div>
      <div className="battle-versus">
        <div className={room.side === "owner" ? "is-you" : ""}><span>Side 1{room.side === "owner" ? " · you" : ""}</span><b>{room.owner.name}</b><strong>{room.owner.score ?? "—"}</strong><small>{room.phase === "lobby" ? (room.owner.ready ? "Ready ✓" : "Not ready") : room.owner.answered ? "Answer locked" : "Thinking…"}</small></div>
        <span className="battle-vs">VS</span>
        <div className={room.side === "guest" ? "is-you" : ""}><span>Side 2{room.side === "guest" ? " · you" : ""}</span><b>{room.guest?.name ?? "Waiting for opponent"}</b><strong>{room.guest?.score ?? "—"}</strong><small>{!room.guest ? "Share the room code" : room.phase === "lobby" ? (room.guest.ready ? "Ready ✓" : "Not ready") : room.guest.answered ? "Answer locked" : "Thinking…"}</small></div>
      </div>
      {room.phase === "lobby" && <><div className="module-links"><button className="btn" onClick={copyLink} disabled={busy}>Copy invite link</button><button className="btn primary" disabled={busy || !room.guest || mine?.ready} onClick={() => action("ready")}>{mine?.ready ? "Ready · waiting for opponent" : "Ready to battle"}</button></div><p className="inst">Both players must be ready. You’ll see the correct answer and explanation once both answers are locked, or time runs out.</p></>}
      {room.phase === "cancelled" && <p className="inst">A player left, the host replaced the room, or the room expired. This battle won’t affect the leaderboard.</p>}
      {room.phase === "question" && room.question && <>
        <div className="battle-heading"><span className="eyebrow">Module {room.question.module.slice(1)}</span><span role="timer" aria-label={`${seconds} seconds remaining`}>{seconds}s left</span></div>
        <h4 className="battle-prompt">{room.question.prompt}</h4>
        <fieldset className="battle-options" disabled={busy || mine?.answered || seconds === 0}><legend className="sr-only">Choose your answer</legend>{room.question.options.map((o) => <label key={o.value}><input type="radio" name="battle-answer" value={o.value} checked={(room.yourAnswer ?? selected) === o.value} onChange={() => setSelected(o.value)} /><span>{o.text}</span></label>)}</fieldset>
        <button className="btn primary" disabled={busy || selected === null || mine?.answered || seconds === 0} onClick={() => action("answer")}>{mine?.answered ? "Answer locked · waiting" : seconds === 0 ? "Time up · checking answers" : "Lock answer"}</button>
        <p className="inst">Answers can’t be changed after locking. {other?.answered ? "Your opponent has locked their answer." : "Your opponent is thinking."}</p>
      </>}
      {(room.phase === "reveal" || room.phase === "finished") && room.result && room.question && <>
        {room.phase === "finished" && <h4 className="battle-outcome">{mine?.score === other?.score ? "It’s a draw!" : (mine?.score ?? 0) > (other?.score ?? 0) ? "You won!" : `${other?.name} won!`}</h4>}
        <h4 className="battle-prompt">{room.question.prompt}</h4>
        <div className="battle-result"><p><b>Correct answer:</b> {answerText(room.result.correct)}</p><p className={room.result.ownerAnswer === room.result.correct ? "battle-right" : "battle-wrong"}>{room.owner.name}: {answerText(room.result.ownerAnswer)} {room.result.ownerAnswer === room.result.correct ? "✓ +1" : "✕ +0"}</p><p className={room.result.guestAnswer === room.result.correct ? "battle-right" : "battle-wrong"}>{room.guest?.name}: {answerText(room.result.guestAnswer)} {room.result.guestAnswer === room.result.correct ? "✓ +1" : "✕ +0"}</p><p>{room.result.explanation}</p></div>
        {room.phase === "reveal" && <button className="btn primary" disabled={busy || mine?.next} onClick={() => action("next")}>{mine?.next ? "Waiting for opponent…" : room.index + 1 === room.total ? "Finish battle" : "Next question"}</button>}
        {room.phase === "finished" && <><p className="inst">Result saved to the leaderboard. Both players can review all 10 questions below.</p><button className="btn primary" onClick={() => rememberRoom("")}>Play another battle</button><details className="battle-review"><summary>Review all questions</summary>{room.review?.map((q, i) => <article key={i}><h4>{i + 1}. {q.prompt}</h4><p><b>Correct:</b> {q.correct}</p><p>{room.owner.name}: {q.options[q.ownerAnswer] ?? "No answer"} · {room.guest?.name}: {q.options[q.guestAnswer] ?? "No answer"}</p><p>{q.explanation}</p></article>)}</details></>}
      </>}
    </section>}
    <section className="chart-card"><div className="battle-heading"><h3>Leaderboard</h3><div className="battle-period"><button className="btn" aria-pressed={!weekly} onClick={() => setWeekly(false)}>All time</button><button className="btn" aria-pressed={weekly} onClick={() => setWeekly(true)}>This week</button></div></div><p className="inst">Ranked by wins · completed battles only{weekly ? " · week starts Monday, UTC" : ""}. Nicknames aren’t verified; this is a friendly leaderboard.</p>
      {leaders === undefined ? <p>Loading rankings…</p> : !leaders.length ? <p>No completed battles yet. Be the first!</p> : <div className="tbl"><table className="hist"><thead><tr><th>Player</th><th>Wins</th><th>Draws</th><th>Played</th><th>Accuracy</th></tr></thead><tbody>{leaders.map((p, i) => <tr key={p.id}><td>{i + 1}. {p.name}</td><td>{p.wins}</td><td>{p.draws}</td><td>{p.matches}</td><td>{p.accuracy}%</td></tr>)}</tbody></table></div>}
    </section>
    <p className="inst">Your player identity stays in this browser. Clearing browser storage or using a new device starts a new profile. Two players need separate browsers or devices. Battle questions come from the existing Modules 1–3 scenario lessons; scores from solo tests remain separate.</p>
  </div>;
}
