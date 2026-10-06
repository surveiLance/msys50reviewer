"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { McItem, MidtermSpec, MtfItem, TestSet } from "@/lib/types";
import { load, save } from "@/lib/quiz";
import { type Answer, type Question, buildExam, buildPractice, grade, notesHref, practicePool } from "@/lib/questions";
import { pct, recordAttempt } from "@/lib/scores";
import RecordStrip from "./RecordStrip";

type Props = {
  subject: string;
  storageKey: string;
  /** practice: instant feedback after each question. exam: feedback at the end, timer, question grid. */
  mode: "practice" | "exam";
  // practice
  module?: string;
  sets?: Record<string, TestSet>;
  setLabels?: Record<string, string>;
  // exam
  midterm?: MidtermSpec;
  pools?: Record<string, MtfItem[]>;
  scenarios?: Record<string, McItem[]>;
  timerMinutes?: number;
  examName?: string;
};

/** Saved after every change so a refresh (or a trip to the notes) never loses progress. */
type Run = {
  v: 1;
  qs: Question[];
  answers: Answer[];
  flags: boolean[];
  idx: number;
  startedAt: number;
  deadline: number | null;
  label?: string;
  timed?: boolean;
};

const LENGTHS = [
  { key: "quick", n: 10, label: "Quick", hint: "About 5 minutes" },
  { key: "standard", n: 25, label: "Standard", hint: "About 12 minutes" },
  { key: "all", n: null, label: "Everything", hint: "" },
] as const;

const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const LETTERS = "ABCDEFGH";

export default function Quiz(props: Props) {
  const { mode, subject, storageKey } = props;
  const exam = mode === "exam";
  const runKey = `run-${storageKey}`;
  const examName = props.examName || "Mock exam";

  const [phase, setPhase] = useState<"setup" | "run" | "done">("setup");
  const [run, setRun] = useState<Run | null>(null);
  const [saved, setSaved] = useState<Run | null>(null);
  const [length, setLength] = useState<(typeof LENGTHS)[number]["key"]>("quick");
  const [source, setSource] = useState("all");
  const [gridOpen, setGridOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [timeUp, setTimeUp] = useState(false);
  const recorded = useRef<number | null>(null);

  const setKeys = Object.keys(props.sets || {});
  const poolSize = useMemo(() => (props.sets ? practicePool(props.sets, source).length : 0), [props.sets, source]);

  // Restore an unfinished run and the last-used options.
  useEffect(() => {
    const r = load<Run | null>(runKey, null);
    if (r && r.v === 1 && Array.isArray(r.qs) && r.qs.length) setSaved(r);
    const opts = load<{ length?: string; source?: string }>(`${storageKey}-opts`, {});
    if (opts.length && LENGTHS.some((l) => l.key === opts.length)) setLength(opts.length as typeof length);
    if (opts.source && (opts.source === "all" || props.sets?.[opts.source])) setSource(opts.source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey]);

  // Focus mode: hide page chrome while a test is running.
  useEffect(() => {
    document.body.classList.toggle("quiz-on", phase === "run");
    return () => document.body.classList.remove("quiz-on");
  }, [phase]);

  useEffect(() => {
    if (phase === "run" && run) save(runKey, run);
  }, [phase, run, runKey]);

  // Scroll after the next paint, once focus mode has shown or hidden the page chrome.
  const scrollTop = () => setTimeout(() => window.scrollTo({ top: 0 }), 0);

  const start = (timed = false) => {
    let qs: Question[];
    let label: string | undefined;
    if (exam) {
      qs = buildExam(props.midterm!, props.pools || {}, props.scenarios || {});
    } else {
      const L = LENGTHS.find((l) => l.key === length)!;
      qs = buildPractice(props.sets || {}, source, L.n, props.module);
      label = `${L.label} · ${qs.length}` + (source !== "all" && setKeys.length > 1 ? ` · ${props.setLabels?.[source] || `Set ${source}`}` : "");
      save(`${storageKey}-opts`, { length, source });
    }
    const t = Date.now();
    const r: Run = {
      v: 1, qs, answers: qs.map(() => ({})), flags: qs.map(() => false), idx: 0, startedAt: t,
      deadline: exam && timed && props.timerMinutes ? t + props.timerMinutes * 60_000 : null, label, timed: exam ? timed : undefined,
    };
    recorded.current = null;
    setTimeUp(false);
    setRun(r);
    setSaved(null);
    setPhase("run");
    scrollTop();
  };

  const resume = () => {
    if (!saved) return;
    recorded.current = null;
    setRun(saved);
    setSaved(null);
    setPhase("run");
    scrollTop();
  };
  const discard = () => {
    save(runKey, null);
    setSaved(null);
  };

  const finish = useCallback(() => {
    save(runKey, null);
    setGridOpen(false);
    setPhase("done");
    scrollTop();
  }, [runKey]);

  // Exam timer: computed from the deadline, so it stays right across refreshes.
  useEffect(() => {
    if (phase !== "run" || !run?.deadline) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase, run?.deadline]);
  const left = run?.deadline ? Math.max(0, Math.round((run.deadline - now) / 1000)) : null;
  useEffect(() => {
    if (phase === "run" && left === 0) {
      setTimeUp(true);
      finish();
    }
  }, [left, phase, finish]);

  const graded = useMemo(() => (run ? run.qs.map((q, i) => grade(q, run.answers[i])) : []), [run]);

  // Save the attempt once when results appear.
  useEffect(() => {
    if (phase !== "done" || !run || recorded.current === run.startedAt) return;
    recorded.current = run.startedAt;
    const answered = graded.filter((g) => g.answered).length;
    if (!answered) return;
    const parts = new Map<string, [number, number]>();
    const byModule: Record<string, [number, number]> = {};
    run.qs.forEach((q, i) => {
      const p = parts.get(q.part) || [0, 0];
      p[1]++;
      if (graded[i].ok) p[0]++;
      parts.set(q.part, p);
      if (q.mod) {
        byModule[q.mod] = byModule[q.mod] || [0, 0];
        byModule[q.mod][1]++;
        if (graded[i].ok) byModule[q.mod][0]++;
      }
    });
    recordAttempt(subject, {
      kind: exam ? "midterm" : "practice",
      module: props.module,
      set: run.label,
      score: graded.filter((g) => g.ok).length,
      max: run.qs.length,
      answered,
      seconds: Math.round(((run.deadline && timeUp ? run.deadline : Date.now()) - run.startedAt) / 1000),
      timed: run.timed,
      byModule,
      parts: [...parts].map(([k, [c, t]]) => [k, c, t]),
    });
  }, [phase, run, graded, subject, exam, props.module, timeUp]);

  // ---------- answering ----------
  const update = (patch: Partial<Answer>, i = run?.idx ?? 0) =>
    setRun((r) => {
      if (!r) return r;
      const answers = r.answers.slice();
      answers[i] = { ...answers[i], ...patch };
      return { ...r, answers };
    });
  const go = (i: number) => {
    setRun((r) => (r ? { ...r, idx: Math.max(0, Math.min(r.qs.length - 1, i)) } : r));
    setGridOpen(false);
    scrollTop();
  };

  const q = run?.qs[run.idx];
  const a = run?.answers[run.idx] || {};
  const g = q ? graded[run!.idx] : null;
  const locked = !exam && !!a.checked;
  const isLast = run ? run.idx === run.qs.length - 1 : false;
  const answeredCount = graded.filter((x) => x.answered).length;

  const pickTf = (v: "true" | "false") => {
    if (locked) return;
    // Practice: "True" is a complete answer, so check it right away. "False" still needs the replacement.
    update({ tf: v, checked: !exam && v === "true" ? true : a.checked });
  };
  const pickChoice = (o: string) => {
    if (locked) return;
    update({ choice: o, checked: !exam ? true : undefined });
  };
  const checkNow = () => update({ checked: true });
  const next = () => {
    if (isLast) {
      if (exam) setGridOpen(true);
      else finish();
    } else go(run!.idx + 1);
  };
  const endEarly = () => {
    const blank = run!.qs.length - answeredCount;
    const msg = blank
      ? `End now? ${blank} unanswered question${blank === 1 ? "" : "s"} will count as wrong.`
      : "Finish and see your results?";
    if (window.confirm(msg)) finish();
  };

  // Keyboard: 1–5 or A–E pick, T/F for true/false, Enter checks or moves on, arrows move.
  useEffect(() => {
    if (phase !== "run" || !q) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const typing = (e.target as HTMLElement)?.tagName === "INPUT";
      if (e.key === "Enter") {
        if (!exam && q.kind === "tf" && a.tf === "false" && !a.checked) checkNow();
        else if (exam || a.checked) next();
        e.preventDefault();
        return;
      }
      if (typing) return;
      if (e.key === "ArrowRight") return run!.idx < run!.qs.length - 1 && go(run!.idx + 1);
      if (e.key === "ArrowLeft") return go(run!.idx - 1);
      const k = e.key.toLowerCase();
      if (q.kind === "tf") {
        if (k === "t") pickTf("true");
        if (k === "f") { pickTf("false"); e.preventDefault(); }
      } else {
        const n = /^[1-8]$/.test(k) ? +k - 1 : LETTERS.toLowerCase().indexOf(k);
        if (n >= 0 && n < q.options.length) pickChoice(q.options[n]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ================= SETUP =================
  if (phase === "setup") {
    return (
      <div className="qz">
        {saved && (
          <div className="qz-resume">
            <div>
              <b>You have an unfinished test</b>
              <span>
                {saved.answers.filter((x) => x.tf || x.choice).length} of {saved.qs.length} answered
                {saved.deadline ? ` · ${Math.max(0, Math.floor((saved.deadline - Date.now()) / 60000))} min left` : ""}
              </span>
            </div>
            <button className="btn primary" onClick={resume}>Resume</button>
            <button className="btn" onClick={discard}>Discard</button>
          </div>
        )}

        {exam ? (
          <div className="qz-setup">
            <h3>Ready for the {examName.toLowerCase()}?</h3>
            <ul className="qz-facts">
              <li><b>{props.midterm ? props.midterm.mtf.reduce((s, d) => s + d.n, 0) + props.midterm.secs.reduce((s, x) => s + (x.kind === "mc" && x.draw ? x.draw.reduce((y, d) => y + d.n, 0) : x.items?.length ?? 0), 0) : 0} questions</b> from every module, new ones each time</li>
              <li>One question at a time. You can go back, skip, and flag questions to revisit.</li>
              <li>Answers are revealed at the end, like the real exam.</li>
            </ul>
            <div className="qz-choices two">
              <button className="qz-opt" onClick={() => start(true)}>
                <b>Timed · {props.timerMinutes} min</b>
                <span>Like the real exam. Submits when time runs out.</span>
              </button>
              <button className="qz-opt" onClick={() => start(false)}>
                <b>Untimed</b>
                <span>Take as long as you need.</span>
              </button>
            </div>
            <RecordStrip subject={subject} kind="midterm" />
          </div>
        ) : (
          <div className="qz-setup">
            <h3>How many questions?</h3>
            <p className="qz-sub">One question at a time. You&apos;ll see the answer right after each one.</p>
            <div className="qz-choices" role="radiogroup" aria-label="Test length">
              {LENGTHS.map((L) => {
                const n = L.n ? Math.min(L.n, poolSize) : poolSize;
                if (L.n && L.n >= poolSize && L.key !== "quick") return null;
                return (
                  <button key={L.key} className="qz-opt" role="radio" aria-checked={length === L.key} onClick={() => setLength(L.key)}>
                    <b>{L.label} · {n}</b>
                    <span>{L.hint || `About ${Math.max(5, Math.round((n * 0.5) / 5) * 5)} minutes`}</span>
                  </button>
                );
              })}
            </div>
            {setKeys.length > 1 && (
              <details className="qz-more">
                <summary>More options</summary>
                <p className="qz-sub">Questions come from:</p>
                <div className="qz-sources">
                  <button className="chip" aria-pressed={source === "all"} onClick={() => setSource("all")}>All sets, mixed</button>
                  {setKeys.map((k) => (
                    <button key={k} className="chip" aria-pressed={source === k} onClick={() => setSource(k)}>{props.setLabels?.[k] || `Set ${k}`}</button>
                  ))}
                </div>
                {source !== "all" && props.sets?.[source]?.desc && <p className="qz-sub">{props.sets[source].desc}</p>}
              </details>
            )}
            <button className="btn primary qz-start" onClick={() => start()}>Start</button>
            <RecordStrip subject={subject} kind="practice" module={props.module} />
          </div>
        )}
      </div>
    );
  }

  // ================= RESULTS =================
  if (phase === "done" && run) {
    const score = graded.filter((x) => x.ok).length;
    const p = pct(score, run.qs.length);
    const missed = run.qs.map((qq, i) => ({ q: qq, g: graded[i], i })).filter((x) => !x.g.ok);
    const wrong = missed.filter((x) => x.g.answered);
    const blank = missed.filter((x) => !x.g.answered);
    const reviewItem = ({ q: mq, g: mg, i }: (typeof missed)[number]) => {
      const href = notesHref(subject, mq, props.module);
      return (
        <li key={i}>
          <span className="qz-part">Question {i + 1} · {mq.part}</span>
          <div className="qz-rprompt" dangerouslySetInnerHTML={{ __html: mq.prompt }} />
          {mg.answered && <p className="qz-your">You answered: {mg.your}</p>}
          <p className="qz-right">
            Correct answer: <b>{mq.answer}</b>
            {mq.kind === "tf" && !mq.isTrue && mg.partial ? " (you were right that it's false)" : ""}
          </p>
          {mq.kind === "choice" && mq.why && <p className="qz-why">{mq.why}</p>}
          {(mq.source || href) && (
            <p className="qz-src">
              {mq.source && <span>Source: {mq.source}</span>}
              {href && <Link href={href} target="_blank">Review in notes ↗</Link>}
            </p>
          )}
        </li>
      );
    };
    const skipped = run.qs.length - answeredCount;
    const parts = [...new Set(run.qs.map((x) => x.part))].map((part) => {
      const idx = run.qs.map((x, i) => (x.part === part ? i : -1)).filter((i) => i >= 0);
      return { part, c: idx.filter((i) => graded[i].ok).length, t: idx.length };
    });
    const mods = [...new Set(run.qs.map((x) => x.mod).filter(Boolean) as string[])].sort().map((m) => {
      const idx = run.qs.map((x, i) => (x.mod === m ? i : -1)).filter((i) => i >= 0);
      return { m, c: idx.filter((i) => graded[i].ok).length, t: idx.length };
    });
    const msg = p >= 80 ? "Great work." : p >= 60 ? "Getting there." : "Keep going. Review the ones you missed below.";
    return (
      <div className="qz">
        <div className="qz-result">
          {timeUp && <p className="qz-timeup">Time&apos;s up. Your answers were submitted.</p>}
          <div className="qz-big">
            <b>{p}%</b>
            <span>{score} of {run.qs.length} correct{skipped ? ` · ${skipped} skipped` : ""}</span>
          </div>
          <p className="qz-msg">{msg}</p>
          {exam && mods.length > 0 && (
            <div className="qz-breakdown">
              {mods.map(({ m, c, t }) => (
                <div key={m}><span>Module {m.slice(1)}</span><b>{pct(c, t)}%</b><em>{c}/{t}</em></div>
              ))}
            </div>
          )}
          {parts.length > 1 && (
            <details className="qz-more">
              <summary>Score by question type</summary>
              <div className="qz-breakdown">
                {parts.map(({ part, c, t }) => (
                  <div key={part}><span>{part}</span><b>{pct(c, t)}%</b><em>{c}/{t}</em></div>
                ))}
              </div>
            </details>
          )}
          <div className="qz-actions">
            <button className="btn primary" onClick={() => { setRun(null); setPhase("setup"); scrollTop(); }}>
              {exam ? "Take another" : "New test"}
            </button>
            <Link className="btn" href={`/${subject}/scores`}>My scores</Link>
          </div>
        </div>

        {wrong.length > 0 && (
          <section className="qz-review">
            <h3>Review {wrong.length === 1 ? "the one you got wrong" : `the ${wrong.length} you got wrong`}</h3>
            <ol>{wrong.map(reviewItem)}</ol>
          </section>
        )}
        {blank.length > 0 && (
          <details className="qz-more qz-review">
            <summary>Show the {blank.length} you skipped</summary>
            <ol>{blank.map(reviewItem)}</ol>
          </details>
        )}
      </div>
    );
  }

  // ================= RUNNING =================
  if (!run || !q || !g) return null;
  const showFeedback = !exam && a.checked;
  const href = notesHref(subject, q, props.module);

  return (
    <div className="qz qz-running">
      <div className="qz-bar">
        <div className="qz-bar-row">
          <span className="qz-count"><span className="lg">Question </span><b>{run.idx + 1}</b> of {run.qs.length}</span>
          {left !== null && (
            <span className={"qz-clock" + (left < 300 ? " low" : "")} role="timer">{fmtClock(left)}</span>
          )}
          {exam && <button className="qz-link" onClick={() => setGridOpen((o) => !o)} aria-expanded={gridOpen}>All questions</button>}
          <button className="qz-link" onClick={endEarly}>{exam ? "Finish" : "End"}</button>
        </div>
        <div className="qz-progress" aria-hidden><i style={{ width: `${((exam ? answeredCount : run.idx + (a.checked ? 1 : 0)) / run.qs.length) * 100}%` }} /></div>
      </div>

      {gridOpen && (
        <div className="qz-grid-panel">
          <p className="qz-sub">
            {answeredCount} of {run.qs.length} answered
            {run.flags.some(Boolean) ? ` · ${run.flags.filter(Boolean).length} flagged` : ""}. Tap a number to jump to it.
          </p>
          <div className="qz-grid">
            {run.qs.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={(graded[i].answered ? "done " : "") + (run.flags[i] ? "flag " : "") + (i === run.idx ? "cur" : "")}
                aria-label={`Question ${i + 1}${graded[i].answered ? ", answered" : ""}${run.flags[i] ? ", flagged" : ""}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="qz-actions">
            <button className="btn primary" onClick={endEarly}>Finish and see results</button>
            <button className="btn" onClick={() => setGridOpen(false)}>Keep going</button>
          </div>
        </div>
      )}

      <article className="qz-card" key={run.idx}>
        <span className="qz-part">{q.part}</span>
        <p className="qz-ask">{q.kind === "tf" ? "Is this statement true? If it's false, fix the underlined part." : q.ask}</p>
        <div className="qz-prompt" dangerouslySetInnerHTML={{ __html: q.prompt }} />

        {q.kind === "tf" ? (
          <>
            <div className="qz-choices two">
              {(["true", "false"] as const).map((v) => {
                const chosen = a.tf === v;
                // Colors judge the True/False call itself; the message below covers the replacement word.
                const state = showFeedback && chosen ? ((v === "true") === q.isTrue ? "right" : "wrong") : "";
                return (
                  <button key={v} className={`qz-ans ${state}`} aria-pressed={chosen} disabled={locked} onClick={() => pickTf(v)}>
                    <kbd>{v === "true" ? "T" : "F"}</kbd>{v === "true" ? "True" : "False"}
                  </button>
                );
              })}
            </div>
            {a.tf === "false" && (
              <div className="qz-fix">
                <label htmlFor={`fix-${run.idx}`}>Replace the underlined part with:</label>
                <div className="qz-fix-row">
                  <input
                    id={`fix-${run.idx}`}
                    value={a.text || ""}
                    onChange={(e) => update({ text: e.target.value })}
                    disabled={locked}
                    autoFocus
                    autoComplete="off" autoCapitalize="off" spellCheck={false}
                    placeholder="Type the correct word or phrase"
                  />
                  {!exam && !a.checked && <button className="btn primary" onClick={checkNow}>Check</button>}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="qz-choices">
            {q.options.map((o, i) => {
              const chosen = a.choice === o;
              const state = showFeedback ? (o === q.answer ? "right" : chosen ? "wrong" : "dim") : "";
              return (
                <button key={o} className={`qz-ans ${state}`} aria-pressed={chosen} disabled={locked} onClick={() => pickChoice(o)}>
                  <kbd>{LETTERS[i]}</kbd><span dangerouslySetInnerHTML={{ __html: o }} />
                </button>
              );
            })}
          </div>
        )}

        {showFeedback && (
          <div className={`qz-fb ${g.ok ? "ok" : "bad"}`} role="status">
            <b>{g.ok ? "✓ Correct" : g.partial ? "Almost: it is false, but that's not the replacement" : "✗ Not quite"}</b>
            {!g.ok && <p>Answer: <strong>{q.answer}</strong></p>}
            {q.kind === "tf" && g.ok && !q.isTrue && q.accept.length > 1 && <p>Also accepted: {q.accept.filter((x) => x !== q.answer).join(", ")}</p>}
            {q.kind === "choice" && q.why && <p>{q.why}</p>}
            {(q.source || href) && (
              <p className="qz-src">
                {q.source && <span>Source: {q.source}</span>}
                {href && <Link href={href} target="_blank">Review in notes ↗</Link>}
              </p>
            )}
          </div>
        )}
      </article>

      <div className="qz-nav">
        <button className="btn" onClick={() => go(run.idx - 1)} disabled={run.idx === 0}>← Back</button>
        {exam && (
          <button
            className={"btn qz-flag" + (run.flags[run.idx] ? " on" : "")}
            aria-pressed={run.flags[run.idx]}
            onClick={() => setRun((r) => (r ? { ...r, flags: r.flags.map((f, i) => (i === r.idx ? !f : f)) } : r))}
          >
            {run.flags[run.idx] ? "⚑ Flagged" : "⚐ Flag"}
          </button>
        )}
        <button
          className="btn primary"
          onClick={next}
          disabled={!exam && !a.checked}
        >
          {isLast
              ? exam ? "Review & finish" : "See results"
              : exam && !g.answered ? "Skip →" : "Next →"}
        </button>
      </div>
      {!exam && !a.checked && (
        <p className="qz-hint">Not sure? <button className="qz-link" onClick={() => { update({ checked: true }); }}>Show the answer</button></p>
      )}
    </div>
  );
}
