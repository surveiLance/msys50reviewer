"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { BlankItem, McItem, MidtermSpec, MtfItem, MultiItem, TestSet } from "@/lib/types";
import { load, save } from "@/lib/quiz";
import {
  type Answer, type LengthKey, type Question, LENGTHS, MULTI_POINTS, TRUE_MARK, buildMidterm, buildModuleTest, grade, mixedCounts,
  mixedPoolMidterm, mixedPoolModule, mixedSize, pickMixed, pickRound, points, quickPoolMidterm, quickPoolModule, shrink, totalPoints,
  typeLabel,
} from "@/lib/questions";
import { pct, recordAttempt } from "@/lib/scores";
import RecordStrip from "./RecordStrip";
import NotesPeek from "./NotesPeek";

type Props = {
  subject: string;
  storageKey: string;
  title: string; // "Module 2 test" / "Midterm test"
  kind: "module" | "midterm";
  // module test
  module?: string;
  sets?: Record<string, TestSet>;
  setLabels?: Record<string, string>;
  // midterm
  midterm?: MidtermSpec;
  pools?: Record<string, MtfItem[]>;
  scenarios?: Record<string, McItem[]>;
  timerMinutes?: number;
  /** Mixed-style questions (Multiple Answer, Fill in the Blank) for every module. */
  multi?: Record<string, MultiItem[]>;
  blanks?: Record<string, BlankItem[]>;
  /** Every module slug in the subject, for "Review in notes" on questions without a source. */
  modules: string[];
  /** For the setup screen (module tests recount from the chosen set). */
  questionCount: number;
  pointCount: number;
};

/** Saved after every answer so a refresh offers Resume. Questions are forward-only, so idx only grows. */
type Run = {
  v: 2;
  qs: Question[];
  answers: Answer[];
  idx: number;
  startedAt: number;
  deadline: number | null;
  timed?: boolean;
  label?: string;
  /** a Quick 10 round: results offer "Next 10" */
  quick?: boolean;
  /** a mixed-style round: results offer "Another round" */
  mixed?: boolean;
};

type Style = "modified" | "mixed";
/** Mixed rounds are sized in points like a Canvas quiz; "full" is the long round. */
const MIXED_LENGTHS: { key: LengthKey; label: string; points: number }[] = [
  { key: "quick", label: "Quick 10", points: 12 },
  { key: "short", label: "Short", points: 20 },
  { key: "medium", label: "Medium", points: 40 },
  { key: "full", label: "Long", points: 60 },
];
const fmtPts = (n: number) => String(Math.round(n * 100) / 100);

const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function Quiz(props: Props) {
  const { subject, storageKey, kind } = props;
  const midterm = kind === "midterm";
  const runKey = `run2-${storageKey}`;
  const setKeys = Object.keys(props.sets || {});

  const [phase, setPhase] = useState<"setup" | "run" | "done">("setup");
  const [run, setRun] = useState<Run | null>(null);
  const [saved, setSaved] = useState<Run | null>(null);
  const [timed, setTimed] = useState(true);
  const [setChoice, setSetChoice] = useState("next");
  const [lastSet, setLastSet] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [recordedAt, setRecordedAt] = useState<number | null>(null);
  const [length, setLength] = useState<LengthKey>(kind === "midterm" ? "full" : "quick");
  const [seen, setSeen] = useState<string[]>([]);
  const [restarted, setRestarted] = useState(false);
  const [style, setStyleState] = useState<Style>("modified");
  const [mseen, setMseen] = useState<string[]>([]);
  const setStyle = (st: Style) => {
    setStyleState(st);
    save(`style-${subject}`, st); // one choice per subject: classmates follow their own prof's format
  };
  // "Review in notes" window: a whole question, or one row of a matching question.
  const [peek, setPeek] = useState<{ q: Question; a?: Answer } | null>(null);
  const closePeek = useCallback(() => setPeek(null), []);
  const peekRow = (q: Question & { kind: "match" }, ri: number) =>
    setPeek({ q: { kind: "mc", id: `${q.id}:${ri}`, section: q.section, prompt: q.rows[ri].prompt, options: [], answer: q.rows[ri].answer } });

  useEffect(() => {
    const r = load<Run | null>(runKey, null);
    if (r && r.v === 2 && Array.isArray(r.qs) && r.qs.length) setSaved(r);
    setLastSet(load<string | null>(`${storageKey}-lastset`, null));
    setSeen(load<string[]>(`${storageKey}-seen`, []));
    setMseen(load<string[]>(`${storageKey}-mseen`, []));
    const st = load<string | null>(`style-${subject}`, null);
    if (st === "mixed" || st === "modified") setStyleState(st);
    const len = load<string | null>(`${storageKey}-len`, null);
    if (len && LENGTHS.some((l) => l.key === len)) setLength(len as LengthKey);
  }, [runKey, storageKey]);

  // Focus mode: only the test is on screen while it runs.
  useEffect(() => {
    document.body.classList.toggle("quiz-on", phase === "run");
    return () => document.body.classList.remove("quiz-on");
  }, [phase]);

  useEffect(() => {
    if (phase === "run" && run) save(runKey, run);
  }, [phase, run, runKey]);

  const toTop = () => setTimeout(() => window.scrollTo({ top: 0 }), 0);

  // With several sets, "next" rotates so retakes see different questions.
  const nextSet = setKeys.length ? setKeys[(Math.max(-1, setKeys.indexOf(lastSet || "")) + 1) % setKeys.length] : "";
  const chosenSet = setChoice === "next" ? nextSet : setChoice;
  const setName = (k: string) => props.setLabels?.[k] || `Set ${k}`;

  const build = useCallback(
    () =>
      midterm
        ? buildMidterm(props.midterm!, props.pools || {}, props.scenarios || {})
        : buildModuleTest(props.sets![chosenSet], (props.module || "").replace(/^module-(\d+)$/, "M$1")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [midterm, chosenSet],
  );
  const modTag = (props.module || "").replace(/^module-(\d+)$/, "M$1");
  // Quick rounds draw from every single-point question (all sets), rotating through unseen ones first.
  const quickPool = useMemo(
    () => (midterm ? quickPoolMidterm(props.midterm!, props.pools || {}, props.scenarios || {}) : quickPoolModule(props.sets || {}, modTag)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [midterm, props.sets, props.midterm],
  );
  // Sizes for each length choice (the question picks are random, the counts are not).
  const sizes = useMemo(() => {
    const full = build();
    const fullPts = totalPoints(full);
    return LENGTHS.filter((l) => l.points < fullPts || l.key === "full").map((l) => {
      if (l.key === "quick") return { ...l, questions: 10, pts: 10, fullPts };
      const qs = shrink(full, l.points);
      return { ...l, questions: qs.length, pts: totalPoints(qs), fullPts };
    });
  }, [build]);
  const mixedPool = useMemo(
    () =>
      midterm
        ? mixedPoolMidterm(props.midterm!, props.pools || {}, props.scenarios || {}, props.multi, props.blanks)
        : mixedPoolModule(props.sets || {}, props.module || "", props.multi?.[props.module || ""], props.blanks?.[props.module || ""]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [midterm, props.sets, props.midterm, props.multi, props.blanks],
  );
  const mixedSizes = useMemo(() => {
    const fullPts = sizes[sizes.length - 1].fullPts;
    return MIXED_LENGTHS.map((l) => {
      const c = mixedCounts(l.points, l.key === "quick");
      const n = { tf2: Math.min(c.tf2, mixedPool.tf2.length), mc: Math.min(c.mc, mixedPool.mc.length), multi: Math.min(c.multi, mixedPool.multi.length), blank: Math.min(c.blank, mixedPool.blank.length) };
      return { ...l, counts: n, questions: n.tf2 + n.mc + n.multi + n.blank, pts: n.tf2 + n.mc + n.multi * MULTI_POINTS + n.blank, fullPts };
    });
  }, [mixedPool, sizes]);
  const mixed = style === "mixed";
  const seenCount = Math.min(seen.length, quickPool.length);
  const mixedTotal = mixedSize(mixedPool);
  const mseenCount = Math.min(mseen.length, mixedTotal);
  const size = mixed
    ? mixedSizes.find((x) => x.key === length) || mixedSizes[0]
    : sizes.find((x) => x.key === length) || sizes[sizes.length - 1];
  // A shorter timed midterm gets proportionally less time.
  const minutes = props.timerMinutes ? Math.max(5, Math.ceil((props.timerMinutes * size.pts) / size.fullPts)) : 0;
  const estMinutes = (pts: number) => Math.max(5, Math.round((pts * 0.7) / 5) * 5);

  const startQuick = () => {
    const r = pickRound(quickPool, seen);
    setSeen(r.seen);
    setRestarted(r.restarted);
    save(`${storageKey}-seen`, r.seen);
    save(`${storageKey}-len`, "quick");
    const t = Date.now();
    const mins = midterm && timed && props.timerMinutes ? Math.max(5, Math.ceil((props.timerMinutes * 10) / size.fullPts)) : 0;
    setRun({
      v: 2, qs: r.qs, answers: r.qs.map(() => ({})), idx: 0, startedAt: t,
      deadline: mins ? t + mins * 60_000 : null, timed: midterm ? timed : undefined, label: "Quick 10", quick: true,
    });
    setNow(t);
    setTimeUp(false);
    setShowAll(false);
    setSaved(null);
    setPhase("run");
    toTop();
  };

  const startMixed = () => {
    const m = mixedSizes.find((x) => x.key === size.key) || mixedSizes[0];
    const r = pickMixed(mixedPool, m.counts, mseen);
    setMseen(r.seen);
    setRestarted(r.restarted);
    save(`${storageKey}-mseen`, r.seen);
    save(`${storageKey}-len`, m.key);
    const t = Date.now();
    const mins = midterm && timed && props.timerMinutes ? Math.max(5, Math.ceil((props.timerMinutes * m.pts) / m.fullPts)) : 0;
    setRun({
      v: 2, qs: r.qs, answers: r.qs.map(() => ({})), idx: 0, startedAt: t,
      deadline: mins ? t + mins * 60_000 : null, timed: midterm ? timed : undefined, label: `Mixed · ${m.label}`, mixed: true,
    });
    setNow(t);
    setTimeUp(false);
    setShowAll(false);
    setSaved(null);
    setPhase("run");
    toTop();
  };

  const start = () => {
    if (mixed) return startMixed();
    if (size.key === "quick") return startQuick();
    const qs = shrink(build(), size.points);
    const parts: string[] = [];
    if (size.key !== "full") parts.push(size.label);
    if (!midterm && setKeys.length > 1) {
      parts.push(setName(chosenSet));
      save(`${storageKey}-lastset`, chosenSet);
      setLastSet(chosenSet);
    }
    save(`${storageKey}-len`, size.key);
    const label = parts.length ? parts.join(" · ") : undefined;
    const t = Date.now();
    setRun({
      v: 2, qs, answers: qs.map(() => ({})), idx: 0, startedAt: t,
      deadline: midterm && timed && minutes ? t + minutes * 60_000 : null,
      timed: midterm ? timed : undefined, label,
    });
    setNow(t);
    setTimeUp(false);
    setShowAll(false);
    setSaved(null);
    setPhase("run");
    toTop();
  };

  const resume = () => {
    if (!saved) return;
    setRun(saved);
    setNow(Date.now());
    setSaved(null);
    setPhase("run");
    toTop();
  };
  const discard = () => {
    save(runKey, null);
    setSaved(null);
  };

  const submit = useCallback(() => {
    save(runKey, null);
    setPhase("done");
    toTop();
  }, [runKey]);

  // Timer from the deadline, so it stays right across refreshes. Submits at zero, like the real exam.
  useEffect(() => {
    if (phase !== "run" || !run?.deadline) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase, run?.deadline]);
  const left = run?.deadline && now ? Math.max(0, Math.round((run.deadline - now) / 1000)) : null;
  useEffect(() => {
    if (phase === "run" && left === 0) {
      setTimeUp(true);
      submit();
    }
  }, [left, phase, submit]);

  const graded = useMemo(() => (run ? run.qs.map((q, i) => grade(q, run.answers[i])) : []), [run]);

  // Save the attempt once, when results first appear.
  useEffect(() => {
    if (phase !== "done" || !run || recordedAt === run.startedAt) return;
    setRecordedAt(run.startedAt);
    const answeredPts = run.qs.reduce((s, q, i) => {
      const a = run.answers[i];
      if (q.kind === "match") return s + (a.picks || []).filter(Boolean).length;
      if (q.kind === "multi") return s + (graded[i].answered ? MULTI_POINTS : 0);
      return s + (graded[i].answered ? 1 : 0);
    }, 0);
    if (!answeredPts) return;
    const parts = new Map<string, [number, number]>();
    const byModule: Record<string, [number, number]> = {};
    run.qs.forEach((q, i) => {
      const p = parts.get(q.section) || [0, 0];
      p[0] += graded[i].points;
      p[1] += graded[i].max;
      parts.set(q.section, p);
      if (q.kind !== "match" && q.mod) {
        byModule[q.mod] = byModule[q.mod] || [0, 0];
        byModule[q.mod][0] += graded[i].points;
        byModule[q.mod][1] += 1;
      }
    });
    recordAttempt(subject, {
      kind: midterm ? "midterm" : "practice",
      module: props.module,
      set: run.label,
      score: graded.reduce((s, g) => s + g.points, 0),
      max: totalPoints(run.qs),
      answered: answeredPts,
      seconds: Math.round(((timeUp && run.deadline ? run.deadline : Date.now()) - run.startedAt) / 1000),
      timed: run.timed,
      byModule,
      parts: [...parts].map(([k, [c, t]]) => [k, c, t]),
    });
  }, [phase, run, graded, recordedAt, subject, midterm, props.module, timeUp]);

  const update = (patch: Partial<Answer>) =>
    setRun((r) => {
      if (!r) return r;
      const answers = r.answers.slice();
      answers[r.idx] = { ...answers[r.idx], ...patch };
      return { ...r, answers };
    });
  const next = () => {
    if (!run) return;
    if (run.idx >= run.qs.length - 1) submit();
    else {
      setRun({ ...run, idx: run.idx + 1 });
      toTop();
    }
  };
  const submitEarly = () => {
    if (!run) return;
    const rest = run.qs.length - run.idx - 1;
    if (window.confirm(`Submit now? ${rest ? `The ${rest} question${rest === 1 ? "" : "s"} after this one will count as wrong.` : ""}`.trim())) submit();
  };

  // ================= SETUP =================
  if (phase === "setup") {
    return (
      <div className="qz">
        {saved && (
          <div className="qz-resume">
            <div>
              <b>You have an unfinished test</b>
              <span>
                On question {saved.idx + 1} of {saved.qs.length}
                {saved.deadline ? ` · ${Math.max(0, Math.floor((saved.deadline - Date.now()) / 60000))} min left` : ""}
              </span>
            </div>
            <button className="btn primary" onClick={resume}>Resume</button>
            <button className="btn" onClick={discard}>Discard</button>
          </div>
        )}
        <div className="qz-panel">
          <div>
            <h4 className="qz-h">Test style</h4>
            <div className="qz-modes" role="radiogroup" aria-label="Test style">
              <button className="qz-mode" role="radio" aria-checked={!mixed} onClick={() => setStyle("modified")}>
                <b>Modified true or false</b>
                <span>Type {TRUE_MARK} or the fix · matching dropdowns · multiple choice</span>
              </button>
              <button className="qz-mode" role="radio" aria-checked={mixed} onClick={() => setStyle("mixed")}>
                <b>Mixed</b>
                <span>True or false · multiple choice · multiple answer · fill in the blank</span>
              </button>
            </div>
          </div>
          <div>
            <div className="qz-facts">
              <span>{size.questions} questions</span>
              <span>{size.pts} points</span>
              {midterm && <span>New questions each time</span>}
            </div>
          </div>
          <div>
            <h4 className="qz-h">How long?</h4>
            <div className={`qz-modes n${(mixed ? mixedSizes : sizes).length}`} role="radiogroup" aria-label="Test length">
              {(mixed ? mixedSizes : sizes).map((l) => (
                <button key={l.key} className="qz-mode" role="radio" aria-checked={size.key === l.key} onClick={() => setLength(l.key)}>
                  <b>{l.key === "quick" ? l.label : `${l.label} · ${l.pts} pts`}</b>
                  <span>
                    {l.key === "quick" && !mixed
                      ? "New questions every round"
                      : `${l.questions} questions${midterm && timed ? "" : ` · about ${estMinutes(l.pts)} min`}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <ul className="qz-rules">
            <li>One question at a time. <b>Once you go to the next question, you can&apos;t go back.</b></li>
            {mixed ? (
              <>
                <li>True or false and multiple choice: pick one.</li>
                <li>Multiple answer: check <b>every</b> correct option. Right boxes earn points, wrong boxes take points away.</li>
                <li>Fill in the blank: tap a word from the word bank to put it in the blank.</li>
              </>
            ) : (
              <>
                <li>Modified true or false: type <code>{TRUE_MARK}</code> if the statement is true. If it&apos;s false, type the word that should replace the underlined part.</li>
                <li>Matching: pick an answer from each dropdown.</li>
              </>
            )}
            <li>Your score and the correct answers appear after you submit.</li>
          </ul>

          {midterm && (
            <div className="qz-modes" role="radiogroup" aria-label="Timer">
              <button className="qz-mode" role="radio" aria-checked={timed} onClick={() => setTimed(true)}>
                <b>Timed · {minutes} min</b>
                <span>Like the real exam. Submits when time runs out.</span>
              </button>
              <button className="qz-mode" role="radio" aria-checked={!timed} onClick={() => setTimed(false)}>
                <b>Untimed</b>
                <span>Take as long as you need.</span>
              </button>
            </div>
          )}

          {mixed && (
            <p className="qz-note">
              Every round picks questions you haven&apos;t seen yet{midterm ? ", from every module" : ""}.
              {mseenCount > 0 ? ` You've practiced ${mseenCount} of ${mixedTotal} questions.` : ` ${mixedTotal} questions to rotate through.`}
            </p>
          )}
          {!mixed && size.key === "quick" && (
            <p className="qz-note">
              Quick rounds mix true or false, multiple choice, and scenarios from {midterm ? "every module" : "all of this module's question sets"}.
              {seenCount > 0 ? ` You've practiced ${seenCount} of ${quickPool.length} questions.` : ` ${quickPool.length} questions to rotate through.`}
            </p>
          )}

          {setKeys.length > 1 && !mixed && size.key !== "quick" && (
            <details className="qz-more">
              <summary>Question set: {setName(chosenSet)}</summary>
              <div className="qz-sources">
                <button className="chip" aria-pressed={setChoice === "next"} onClick={() => setSetChoice("next")}>Next in rotation</button>
                {setKeys.map((k) => (
                  <button key={k} className="chip" aria-pressed={setChoice === k} onClick={() => setSetChoice(k)}>{setName(k)}</button>
                ))}
              </div>
            </details>
          )}

          <button className="btn primary qz-start" onClick={start}>Start test</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <RecordStrip subject={subject} kind={midterm ? "midterm" : "practice"} module={props.module} />
        </div>
      </div>
    );
  }

  // ================= RESULTS =================
  if (phase === "done" && run) {
    const score = graded.reduce((s, g) => s + g.points, 0);
    const max = totalPoints(run.qs);
    const p = pct(score, max);
    const items = run.qs.map((q, i) => ({ q, g: graded[i], a: run.answers[i], i }));
    const wrong = items.filter((x) => x.g.points < x.g.max);
    const shown = showAll ? items : wrong;
    const sections = [...new Set(run.qs.map((q) => q.section))].map((s) => {
      const ix = items.filter((x) => x.q.section === s);
      return { s, c: ix.reduce((a, x) => a + x.g.points, 0), t: ix.reduce((a, x) => a + x.g.max, 0) };
    });
    const mods = [...new Set(run.qs.flatMap((q) => (q.kind !== "match" && q.mod ? [q.mod] : [])))].sort().map((m) => {
      const ix = items.filter((x) => x.q.kind !== "match" && x.q.mod === m);
      return { m, c: ix.reduce((a, x) => a + x.g.points, 0), t: ix.length };
    });
    const msg =
      p >= 80 ? "Great work." :
      p >= 60 ? "Getting there." :
      run.quick || run.mixed ? "Every round helps. Check the answers below, then try another round." :
      "Keep going. Check the answers below, then review the notes.";

    return (
      <div className="qz">
        <div className="qz-panel">
          {timeUp && <p className="qz-timeup">Time&apos;s up. Your test was submitted.</p>}
          <div className="eyebrow">{props.title}{run.label ? ` · ${run.label}` : ""}</div>
          <div className="qz-score">
            <b>{p}%</b>
            <span>{fmtPts(score)} of {max} points</span>
          </div>
          <p className="qz-msg">{msg}</p>
          {run.mixed && (
            <p className="qz-note">
              {restarted
                ? "You've been through every question of one type, so that type started over."
                : `You've practiced ${mseenCount} of ${mixedTotal} questions. The next round picks ones you haven't seen.`}
            </p>
          )}
          {run.quick && (
            <p className="qz-note">
              {restarted
                ? `You've been through all ${quickPool.length} questions, so the rotation started over.`
                : `You've practiced ${seenCount} of ${quickPool.length} questions. The next round picks ones you haven't seen.`}
            </p>
          )}
          {midterm && mods.length > 0 && (
            <div className="qz-breakdown">
              {mods.map(({ m, c, t }) => (
                <div key={m}><span>Module {m.slice(1)}</span><b>{pct(c, t)}%</b><em>{fmtPts(c)}/{t}</em></div>
              ))}
            </div>
          )}
          {sections.length > 1 && (
            <details className="qz-more">
              <summary>Score by part</summary>
              <div className="qz-breakdown">
                {sections.map(({ s, c, t }) => (
                  <div key={s}><span>{s}</span><b>{pct(c, t)}%</b><em>{fmtPts(c)}/{t}</em></div>
                ))}
              </div>
            </details>
          )}
          <div className="qz-actions">
            {run.mixed ? (
              <>
                <button className="btn primary" onClick={startMixed}>Another round →</button>
                <button className="btn" onClick={() => { setRun(null); setPhase("setup"); toTop(); }}>Change length</button>
              </>
            ) : run.quick ? (
              <>
                <button className="btn primary" onClick={startQuick}>Next 10 questions →</button>
                <button className="btn" onClick={() => { setRun(null); setPhase("setup"); toTop(); }}>Change length</button>
              </>
            ) : (
              <button className="btn primary" onClick={() => { setRun(null); setPhase("setup"); toTop(); }}>Retake</button>
            )}
            <Link className="btn" href={`/${subject}/test`}>Other tests</Link>
            <Link className="btn" href={`/${subject}/scores`}>My scores</Link>
          </div>
        </div>

        <section className="qz-review">
          <div className="qz-review-head">
            <h3>Your answers</h3>
            <div className="qz-sources">
              <button className="chip" aria-pressed={!showAll} onClick={() => setShowAll(false)}>Wrong ({wrong.length})</button>
              <button className="chip" aria-pressed={showAll} onClick={() => setShowAll(true)}>All ({items.length})</button>
            </div>
          </div>
          {shown.length === 0 ? (
            <p className="muted">Nothing wrong. Every answer was correct.</p>
          ) : (
            <ol className="qz-rv">
              {shown.map(({ q, g, a, i }) => {
                const full = g.points === g.max;
                return (
                  <li key={i} className={full ? "ok" : ""}>
                    <div className="qz-rv-top">
                      <span>Question {i + 1} · {typeLabel(q)}</span>
                      <b>{fmtPts(g.points)} / {g.max} pt{g.max === 1 ? "" : "s"}</b>
                    </div>
                    {q.kind === "match" ? (
                      <>
                        <p className="qz-why">{q.inst}</p>
                        <ul className="qz-rv-rows">
                          {q.rows.map((r, ri) => {
                            const pick = a.picks?.[ri] || "";
                            const ok = g.rows?.[ri];
                            return (
                              <li key={ri}>
                                <span>{r.prompt}</span>
                                <span className="qz-rv-line">
                                  <span className={"y" + (ok ? " ok" : "")}>{pick || "No answer"}</span>
                                  {!ok && <> · Correct: <span className="c">{r.answer}</span></>}
                                </span>
                                {!ok && <button className="qz-peek" onClick={() => peekRow(q, ri)}>Review</button>}
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    ) : q.kind === "multi" ? (
                      <>
                        <div className="qz-rv-prompt" dangerouslySetInnerHTML={{ __html: q.prompt }} />
                        <ul className="qz-rv-rows">
                          {q.options.map((o) => {
                            const chose = (a.checks || []).includes(o);
                            const right = q.correct.includes(o);
                            return (
                              <li key={o} className={right ? "is-right" : chose ? "is-wrong" : "is-off"}>
                                <span>{o}</span>
                                <span className="qz-rv-line">
                                  {right
                                    ? chose ? <span className="y ok">✓ Correct, and you checked it</span> : <span className="c">Correct, but you missed it</span>
                                    : chose ? <span className="y">✗ Not correct, but you checked it</span> : <span className="muted">Not correct</span>}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                        {q.why && <p className="qz-why">{q.why}</p>}
                      </>
                    ) : q.kind === "tf2" ? (
                      <>
                        <div className="qz-rv-prompt" dangerouslySetInnerHTML={{ __html: q.prompt }} />
                        <p className="qz-rv-line">
                          Your answer: <span className={"y" + (full ? " ok" : "")}>{a.choice || "No answer"}</span>
                          {!full && <> · Correct: <span className="c">{q.isTrue ? "True" : "False"}</span></>}
                        </p>
                        {!q.isTrue && q.underlined && q.fix && (
                          <p className="qz-why">It&apos;s false: &ldquo;{q.underlined}&rdquo; should be &ldquo;{q.fix}&rdquo;.</p>
                        )}
                      </>
                    ) : q.kind === "blank" ? (
                      <>
                        <div className="qz-rv-prompt" dangerouslySetInnerHTML={{ __html: q.prompt.replace("___", "______") }} />
                        <p className="qz-rv-line">
                          Your answer: <span className={"y" + (full ? " ok" : "")}>{a.choice || "No answer"}</span>
                          {!full && <> · Correct: <span className="c">{q.answer}</span></>}
                        </p>
                        {q.why && <p className="qz-why">{q.why}</p>}
                      </>
                    ) : (
                      <>
                        <div className="qz-rv-prompt" dangerouslySetInnerHTML={{ __html: q.prompt }} />
                        <p className="qz-rv-line">
                          Your answer: <span className={"y" + (full ? " ok" : "")}>{(q.kind === "tf" ? a.text?.trim() : a.choice) || "No answer"}</span>
                        </p>
                        {!full && (
                          <p className="qz-rv-line">
                            Correct answer: <span className="c">{q.answer}</span>
                            {q.kind === "tf" && q.isTrue ? " (the statement is true)" : ""}
                            {q.kind === "tf" && !q.isTrue && q.accept.length > 1 ? ` (also accepted: ${q.accept.filter((x) => x !== q.answer).join(", ")})` : ""}
                          </p>
                        )}
                        {q.kind === "mc" && q.why && <p className="qz-why">{q.why}</p>}
                      </>
                    )}
                    {q.kind !== "match" && (
                      <p className="qz-src">
                        {q.source && <span>Source: {q.source}</span>}
                        <button className="qz-peek" onClick={() => setPeek({ q, a })}>Review in notes</button>
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
        {peek && (
          <NotesPeek
            subject={subject}
            question={peek.q}
            answer={peek.a}
            fallbackModule={props.module}
            allModules={props.modules}
            onClose={closePeek}
          />
        )}
      </div>
    );
  }

  // ================= RUNNING =================
  if (!run) return null;
  const q = run.qs[run.idx];
  const a = run.answers[run.idx] || {};
  const g = graded[run.idx];
  const isLast = run.idx === run.qs.length - 1;
  const pts = points(q);
  const blankRows = q.kind === "match" ? q.rows.length - (a.picks || []).filter(Boolean).length : 0;
  const unanswered = !g.answered;

  return (
    <div className="qz">
      <div className="qz-top">
        <div className="qz-top-row">
          <span className="qz-title">{props.title}</span>
          {left !== null && <span className={"qz-clock" + (left < 300 ? " low" : "")} role="timer">{fmtClock(left)}</span>}
          <button className="qz-link" onClick={submitEarly}>Submit now</button>
        </div>
        <div className="qz-progress" aria-hidden><i style={{ width: `${(run.idx / run.qs.length) * 100}%` }} /></div>
      </div>

      <article className="qz-q" key={run.idx}>
        <div className="qz-q-head">
          <b>Question {run.idx + 1} <span>of {run.qs.length}</span></b>
          <span>{pts} pt{pts === 1 ? "" : "s"}</span>
        </div>
        <div className="qz-q-body">
          <span className="qz-section">
            {typeLabel(q)}
            {q.section.toLowerCase() !== typeLabel(q).toLowerCase() ? ` · ${q.section}` : ""}
          </span>
          {q.kind === "tf" && (
            <>
              <div className="qz-prompt" dangerouslySetInnerHTML={{ __html: q.prompt }} />
              <label className="qz-ask" htmlFor={`a-${run.idx}`}>
                Type <b>{TRUE_MARK}</b> if true. If false, type the word that should replace the underlined part.
              </label>
              <input
                id={`a-${run.idx}`}
                className="qz-input"
                value={a.text || ""}
                onChange={(e) => update({ text: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); next(); } }}
                autoFocus autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
                placeholder={`${TRUE_MARK}  or the correct word`}
              />
            </>
          )}
          {q.kind === "mc" && (
            <>
              <div className="qz-prompt" dangerouslySetInnerHTML={{ __html: q.prompt }} />
              <fieldset className="qz-radios">
                <legend className="qz-ask">Choose one.</legend>
                {q.options.map((o) => (
                  <label key={o} className="qz-radio">
                    <input type="radio" name={`q-${run.idx}`} checked={a.choice === o} onChange={() => update({ choice: o })} />
                    <span dangerouslySetInnerHTML={{ __html: o }} />
                  </label>
                ))}
              </fieldset>
            </>
          )}
          {q.kind === "tf2" && (
            <>
              <div className="qz-prompt" dangerouslySetInnerHTML={{ __html: q.prompt }} />
              <fieldset className="qz-radios">
                <legend className="qz-ask">True or false?</legend>
                {["True", "False"].map((o) => (
                  <label key={o} className="qz-radio">
                    <input type="radio" name={`q-${run.idx}`} checked={a.choice === o} onChange={() => update({ choice: o })} />
                    <span>{o}</span>
                  </label>
                ))}
              </fieldset>
            </>
          )}
          {q.kind === "multi" && (
            <>
              <div className="qz-prompt" dangerouslySetInnerHTML={{ __html: q.prompt }} />
              <fieldset className="qz-radios">
                <legend className="qz-ask">Select all that apply.</legend>
                {q.options.map((o) => {
                  const on = (a.checks || []).includes(o);
                  return (
                    <label key={o} className="qz-radio qz-check">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => update({ checks: on ? (a.checks || []).filter((x) => x !== o) : [...(a.checks || []), o] })}
                      />
                      <span dangerouslySetInnerHTML={{ __html: o }} />
                    </label>
                  );
                })}
              </fieldset>
            </>
          )}
          {q.kind === "blank" && (() => {
            const [before, after] = q.prompt.split("___");
            return (
              <>
                <p className="qz-prompt qz-blank-line">
                  <span dangerouslySetInnerHTML={{ __html: before }} />
                  <button
                    type="button"
                    className={"qz-slot" + (a.choice ? " filled" : "")}
                    onClick={() => a.choice && update({ choice: undefined })}
                    aria-label={a.choice ? `Blank: ${a.choice}. Tap to clear.` : "Blank, empty"}
                  >
                    {a.choice || "Answer"}
                  </button>
                  <span dangerouslySetInnerHTML={{ __html: after || "" }} />
                </p>
                <p className="qz-ask">Tap a word to put it in the blank{a.choice ? ", or tap the blank to clear it" : ""}.</p>
                <div className="qz-bank" role="group" aria-label="Word bank">
                  {q.bank.map((w) => (
                    <button key={w} type="button" className="qz-chip" aria-pressed={a.choice === w} onClick={() => update({ choice: w })}>{w}</button>
                  ))}
                </div>
              </>
            );
          })()}
          {q.kind === "match" && (
            <>
              <p className="qz-ask">{q.inst}</p>
              <div className="qz-match">
                {q.rows.map((r, ri) => (
                  <div className="qz-match-row" key={ri}>
                    <span dangerouslySetInnerHTML={{ __html: r.prompt }} />
                    <select
                      value={a.picks?.[ri] || ""}
                      aria-label={`Answer for: ${r.prompt.replace(/<[^>]+>/g, "")}`}
                      onChange={(e) => {
                        const picks = (a.picks || q.rows.map(() => "")).slice();
                        picks[ri] = e.target.value;
                        update({ picks });
                      }}
                    >
                      <option value="">[ Choose ]</option>
                      {q.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="qz-foot">
          <p>
            {unanswered
              ? "Not answered yet. If you move on, it counts as wrong."
              : blankRows
                ? `${blankRows} dropdown${blankRows === 1 ? "" : "s"} still blank.`
                : isLast ? "That's the last question." : "You can't come back to this question."}
          </p>
          <button className="btn primary" onClick={next}>{isLast ? "Submit test" : "Next →"}</button>
        </div>
      </article>
    </div>
  );
}
