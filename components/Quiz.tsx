"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AlternativeQuestion, BlankItem, McItem, MidtermSpec, MtfItem, MultiItem, TestSet } from "@/lib/types";
import { load, save } from "@/lib/quiz";
import {
  type Answer, type Graded, type QType, type Question, MULTI_POINTS, QTYPES, TRUE_MARK, grade, pickTypes, points,
  poolAlternativeMidterm, poolAlternativeModule, poolMidterm, poolModule,
  poolSize, roundCounts, roundPoints, totalPoints, typeLabel,
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
  // midterm
  midterm?: MidtermSpec;
  pools?: Record<string, MtfItem[]>;
  scenarios?: Record<string, McItem[]>;
  /** every module's test sets, for the midterm's matching questions */
  tests?: Record<string, Record<string, TestSet>>;
  timerMinutes?: number;
  /** Multiple Answer and Fill in the Blank questions for every module. */
  multi?: Record<string, MultiItem[]>;
  blanks?: Record<string, BlankItem[]>;
  /** Independently authored, past-quiz-style questions for each module. */
  alternative?: Record<string, AlternativeQuestion[]>;
  /** Every module slug in the subject, for "Review in notes" on questions without a source. */
  modules: string[];
};

/** Saved after every answer so a refresh offers Resume. Questions are forward-only, so idx only grows. */
type Run = {
  v: 3;
  qs: Question[];
  answers: Answer[];
  idx: number;
  startedAt: number;
  deadline: number | null;
  timed?: boolean;
  label?: string;
  /** Study mode: lock and explain each answer before moving forward. */
  feedback?: boolean;
  /** Whether the current answer has been checked in study mode. */
  revealed?: boolean;
  questionSet?: QuestionSet;
};

type LengthKey = "quick" | "short" | "medium" | "long";
type QuestionSet = "original" | "alternative";
/** The real midterm's size, for scaling the timer of shorter rounds. */
const EXAM_POINTS = 85;
const ALL_TYPES = QTYPES.map((t) => t.key);

const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const fmtPts = (n: number) => String(Math.round(n * 100) / 100);
const estMinutes = (pts: number) => Math.max(5, Math.round((pts * 0.7) / 5) * 5);
const baseId = (id: string) => id.replace(/^(tf|t2):/, "st:");

function QuestionFeedback({ q, a, g, onReview }: { q: Question; a: Answer; g: Graded; onReview: () => void }) {
  const full = g.points === g.max;
  const result = full ? "Correct" : g.points > 0 ? "Partly correct" : "Not quite";
  return (
    <div className={"qz-feedback " + (full ? "ok" : g.points > 0 ? "partial" : "bad")} role="status" aria-live="polite">
      <h4>{result} · {fmtPts(g.points)} / {g.max} pt{g.max === 1 ? "" : "s"}</h4>
      {q.kind === "match" ? (
        <ul className="qz-rv-rows">
          {q.rows.map((row, i) => {
            const pick = a.picks?.[i] || "No answer";
            const ok = g.rows?.[i];
            return (
              <li key={i} className={ok ? "is-right" : "is-wrong"}>
                <span dangerouslySetInnerHTML={{ __html: row.prompt }} />
                <span className="qz-rv-line">
                  <span className={"y" + (ok ? " ok" : "")}>{pick}</span>
                  {!ok && <> · Correct: <span className="c">{row.answer}</span></>}
                </span>
              </li>
            );
          })}
        </ul>
      ) : q.kind === "multi" ? (
        <>
          <ul className="qz-rv-rows">
            {q.options.map((option) => {
              const chose = (a.checks || []).includes(option);
              const right = q.correct.includes(option);
              return (
                <li key={option} className={right ? "is-right" : chose ? "is-wrong" : "is-off"}>
                  <span>{option}</span>
                  <span className="qz-rv-line">
                    {right ? (chose ? "✓ Correct, and you checked it" : "Correct, but you missed it") : (chose ? "✗ Not correct, but you checked it" : "Not correct")}
                  </span>
                </li>
              );
            })}
          </ul>
          {q.why && <p className="qz-why">{q.why}</p>}
        </>
      ) : q.kind === "tf2" ? (
        <>
          <p className="qz-rv-line">Your answer: <span className={"y" + (full ? " ok" : "")}>{a.choice || "No answer"}</span> · Correct: <span className="c">{q.isTrue ? "True" : "False"}</span></p>
          {!q.isTrue && q.underlined && q.fix && <p className="qz-why">It&apos;s false: &ldquo;{q.underlined}&rdquo; should be &ldquo;{q.fix}&rdquo;.</p>}
          {q.why && <p className="qz-why">{q.why}</p>}
        </>
      ) : q.kind === "blank" ? (
        <>
          <p className="qz-rv-line">Your answer: <span className={"y" + (full ? " ok" : "")}>{a.choice || "No answer"}</span> · Correct: <span className="c">{q.answer}</span></p>
          {q.why && <p className="qz-why">{q.why}</p>}
        </>
      ) : (
        <>
          <p className="qz-rv-line">
            Your answer: <span className={"y" + (full ? " ok" : "")}>{(q.kind === "tf" ? a.text?.trim() : a.choice) || "No answer"}</span>
            {" · "}Correct: <span className="c">{q.answer}</span>
          </p>
          {q.kind === "tf" && q.isTrue && <p className="qz-why">The statement is true, so <b>{TRUE_MARK}</b> is the answer.</p>}
          {q.kind === "tf" && !q.isTrue && <p className="qz-why">Replace the underlined part with &ldquo;{q.answer}&rdquo;.</p>}
          {q.kind === "mc" && q.why && <p className="qz-why">{q.why}</p>}
        </>
      )}
      {q.kind !== "match" && (
        <p className="qz-src">
          {q.source && <span>Source: {q.source}</span>}
          <button className="qz-peek" onClick={onReview}>Review in notes</button>
        </p>
      )}
    </div>
  );
}

export default function Quiz(props: Props) {
  const { subject, storageKey, kind } = props;
  const midterm = kind === "midterm";
  const runKey = `run3-${storageKey}`;
  const lengths: { key: LengthKey; label: string; points: number }[] = [
    { key: "quick", label: "Quick 10", points: 0 },
    { key: "short", label: "Short", points: 20 },
    { key: "medium", label: "Medium", points: 40 },
    midterm ? { key: "long", label: "Full exam", points: EXAM_POINTS } : { key: "long", label: "Long", points: 60 },
  ];

  const [phase, setPhase] = useState<"setup" | "run" | "done">("setup");
  const [run, setRun] = useState<Run | null>(null);
  const [saved, setSaved] = useState<Run | null>(null);
  const [timed, setTimed] = useState(true);
  const [instantFeedback, setInstantFeedback] = useState(false);
  const [now, setNow] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [recordedAt, setRecordedAt] = useState<number | null>(null);
  const [length, setLength] = useState<LengthKey>(midterm ? "long" : "quick");
  const [questionSet, setQuestionSet] = useState<QuestionSet>("original");
  const [types, setTypes] = useState<QType[]>(ALL_TYPES);
  const [seen, setSeen] = useState<string[]>([]);
  const [restarted, setRestarted] = useState(false);
  // "Review in notes" window: a whole question, or one row of a matching question.
  const [peek, setPeek] = useState<{ q: Question; a?: Answer } | null>(null);
  const closePeek = useCallback(() => setPeek(null), []);
  const peekRow = (q: Question & { kind: "match" }, ri: number) =>
    setPeek({ q: { kind: "mc", id: `${q.id}:${ri}`, section: q.section, prompt: q.rows[ri].prompt, options: [], answer: q.rows[ri].answer } });

  useEffect(() => {
    const r = load<Run | null>(runKey, null);
    if (r && r.v === 3 && Array.isArray(r.qs) && r.qs.length) setSaved(r);
    const len = load<string | null>(`${storageKey}-len`, null);
    if (len === "quick" || len === "short" || len === "medium" || len === "long") setLength(len);
    const ts = load<string[] | null>(`types-${subject}`, null);
    if (Array.isArray(ts)) setTypes(ALL_TYPES.filter((t) => ts.includes(t)));
    setInstantFeedback(load<boolean>(`feedback-${subject}`, false));
    const set = load<string | null>(`${storageKey}-question-set`, null);
    if (set === "alternative" && Object.values(props.alternative || {}).some((items) => items.length)) setQuestionSet("alternative");
  }, [runKey, storageKey, subject, props.alternative]);

  // Focus mode: only the test is on screen while it runs.
  useEffect(() => {
    document.body.classList.toggle("quiz-on", phase === "run");
    return () => document.body.classList.remove("quiz-on");
  }, [phase]);

  useEffect(() => {
    if (phase === "run" && run) save(runKey, run);
  }, [phase, run, runKey]);

  const toTop = () => setTimeout(() => window.scrollTo({ top: 0 }), 0);

  // The original bank remains untouched; the alternative bank has its own questions and seen history.
  const originalPool = useMemo(
    () =>
      midterm
        ? poolMidterm(props.midterm!, props.pools || {}, props.scenarios || {}, props.tests || {}, props.multi, props.blanks)
        : poolModule(props.sets || {}, props.module || "", props.multi?.[props.module || ""], props.blanks?.[props.module || ""]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [midterm, props.sets, props.midterm, props.multi, props.blanks],
  );
  const alternativePool = useMemo(
    () => midterm
      ? poolAlternativeMidterm(props.alternative)
      : poolAlternativeModule(props.alternative?.[props.module || ""], props.module || ""),
    [midterm, props.alternative, props.module],
  );
  const hasAlternative = poolSize(alternativePool, ALL_TYPES) > 0;
  const pool = questionSet === "alternative" && hasAlternative ? alternativePool : originalPool;
  const seenKey = questionSet === "alternative" ? `${storageKey}-alternative-seen1` : `${storageKey}-seen3`;
  useEffect(() => setSeen(load<string[]>(seenKey, [])), [seenKey]);
  const sizes = useMemo(
    () =>
      lengths.map((l) => {
        const counts = roundCounts(pool, types, l.points, l.key === "quick");
        const questions = (Object.values(counts) as number[]).reduce((a, b) => a + b, 0);
        return { ...l, counts, questions, pts: roundPoints(pool, counts) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool, types, midterm],
  );
  // Hide lengths that can't be bigger than the one before (a small bank caps them all).
  const shownSizes = sizes.filter((l, i) => i === 0 || l.questions > sizes[i - 1].questions);
  const size = shownSizes.find((x) => x.key === length) || shownSizes[shownSizes.length - 1];
  const bank = poolSize(pool, types);
  const availableTypes = ALL_TYPES.filter((type) => pool[type].length);
  const activeTypes = types.filter((type) => pool[type].length);
  const seenCount = useMemo(() => {
    const ids = new Set(types.flatMap((t) => pool[t].map((q) => baseId(q.id))));
    return seen.filter((id) => ids.has(id)).length;
  }, [seen, pool, types]);
  // A shorter timed midterm gets proportionally less time.
  const minutes = props.timerMinutes ? Math.max(5, Math.ceil((props.timerMinutes * size.pts) / EXAM_POINTS)) : 0;

  const toggleType = (t: QType) => {
    const next = types.includes(t) ? types.filter((x) => x !== t) : ALL_TYPES.filter((x) => x === t || types.includes(x));
    setTypes(next);
    save(`types-${subject}`, next); // remembered for every test in this subject
  };
  const typeSummary = activeTypes.length === availableTypes.length ? "All available types" : `${activeTypes.length} type${activeTypes.length === 1 ? "" : "s"}`;
  const chooseQuestionSet = (next: QuestionSet) => {
    setQuestionSet(next);
    setSeen(load<string[]>(next === "alternative" ? `${storageKey}-alternative-seen1` : `${storageKey}-seen3`, []));
    save(`${storageKey}-question-set`, next);
  };

  const start = () => {
    if (!size.questions) return;
    const r = pickTypes(pool, size.counts, seen);
    setSeen(r.seen);
    setRestarted(r.restarted);
    save(seenKey, r.seen);
    save(`${storageKey}-len`, size.key);
    const t = Date.now();
    setRun({
      v: 3, qs: r.qs, answers: r.qs.map(() => ({})), idx: 0, startedAt: t,
      deadline: midterm && timed && minutes ? t + minutes * 60_000 : null,
      timed: midterm ? timed : undefined, label: `${questionSet === "alternative" ? "Alternative set" : "Original set"} · ${size.label} · ${typeSummary}`,
      feedback: instantFeedback, revealed: false,
      questionSet,
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
    setQuestionSet(saved.questionSet || "original");
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
      const key = typeLabel(q);
      const p = parts.get(key) || [0, 0];
      p[0] += graded[i].points;
      p[1] += graded[i].max;
      parts.set(key, p);
      if (q.kind !== "match" && q.mod) {
        byModule[q.mod] = byModule[q.mod] || [0, 0];
        byModule[q.mod][0] += graded[i].points;
        byModule[q.mod][1] += graded[i].max;
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
      if (r.feedback && r.revealed) return r;
      const answers = r.answers.slice();
      answers[r.idx] = { ...answers[r.idx], ...patch };
      return { ...r, answers };
    });
  const next = () => {
    if (!run) return;
    if (run.idx >= run.qs.length - 1) submit();
    else {
      setRun({ ...run, idx: run.idx + 1, revealed: false });
      toTop();
    }
  };
  const checkOrNext = () => {
    if (!run) return;
    if (run.feedback && !run.revealed) setRun({ ...run, revealed: true });
    else next();
  };
  const submitEarly = () => {
    if (!run) return;
    const rest = run.qs.length - run.idx - 1;
    if (window.confirm(`Submit now? ${rest ? `The ${rest} question${rest === 1 ? "" : "s"} after this one will count as wrong.` : ""}`.trim())) submit();
  };

  // ================= SETUP =================
  if (phase === "setup") {
    const has = (t: QType) => activeTypes.includes(t);
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
          {hasAlternative && (
            <div>
              <h4 className="qz-h">Question set</h4>
              <div className="qz-set-tabs" role="tablist" aria-label="Question set">
                <button role="tab" aria-selected={questionSet === "original"} onClick={() => chooseQuestionSet("original")}>
                  <b>Original set</b>
                  <span>Your existing bank and progress</span>
                </button>
                <button role="tab" aria-selected={questionSet === "alternative"} onClick={() => chooseQuestionSet("alternative")}>
                  <b>Alternative set</b>
                  <span>New past-quiz-style questions</span>
                </button>
              </div>
              <p className="qz-set-note">
                {questionSet === "alternative"
                  ? `${poolSize(alternativePool, ALL_TYPES)} independently written questions based on the lessons. Each concept appears in one format.`
                  : "The question bank you've already been using. Nothing here was reset or removed."}
              </p>
            </div>
          )}
          <div>
            <div className="qz-h-row">
              <h4 className="qz-h">Question types</h4>
              {types.length < ALL_TYPES.length && (
                <button className="qz-peek" onClick={() => { setTypes(ALL_TYPES); save(`types-${subject}`, ALL_TYPES); }}>Select all</button>
              )}
            </div>
            <div className="qz-types">
              {QTYPES.map((t) => {
                const n = pool[t.key].length;
                return (
                  <label key={t.key} className={"qz-type" + (n ? "" : " off")}>
                    <input type="checkbox" checked={has(t.key) && n > 0} disabled={!n} onChange={() => toggleType(t.key)} />
                    <span><b>{t.label}</b><small>{n ? t.hint : "None for this test yet"}</small></span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="qz-h">How long?</h4>
            <div className={`qz-modes n${shownSizes.length}`} role="radiogroup" aria-label="Test length">
              {shownSizes.map((l) => (
                <button key={l.key} className="qz-mode" role="radio" aria-checked={size.key === l.key} onClick={() => setLength(l.key)} disabled={!l.questions}>
                  <b>{l.key === "quick" ? l.label : `${l.label} · ${l.pts} pts`}</b>
                  <span>{l.questions} questions{midterm && timed ? "" : ` · about ${estMinutes(l.pts)} min`}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="qz-h">When should answers appear?</h4>
            <div className="qz-modes" role="radiogroup" aria-label="Answer feedback">
              <button
                className="qz-mode" role="radio" aria-checked={!instantFeedback}
                onClick={() => { setInstantFeedback(false); save(`feedback-${subject}`, false); }}
              >
                <b>After submitting</b>
                <span>Exam mode. Nothing is marked while the test is running.</span>
              </button>
              <button
                className="qz-mode" role="radio" aria-checked={instantFeedback}
                onClick={() => { setInstantFeedback(true); save(`feedback-${subject}`, true); }}
              >
                <b>After each question</b>
                <span>Study mode. Check the answer and explanation before continuing.</span>
              </button>
            </div>
          </div>

          {activeTypes.length > 0 && (
            <ul className="qz-rules">
              <li>One question at a time. <b>Once you go to the next question, you can&apos;t go back.</b></li>
              {has("tf") && <li>Modified true or false: type <code>{TRUE_MARK}</code> if true. If false, type the word that should replace the underlined part.</li>}
              {has("multi") && <li>Multiple answer: check <b>every</b> correct option. Right boxes earn points, wrong boxes take points away.</li>}
              {has("blank") && <li>Fill in the blank: tap a word from the word bank to put it in the blank.</li>}
              {has("match") && <li>Matching: pick an answer from each dropdown.</li>}
              <li>{instantFeedback ? "Each answer locks and is explained when you check it." : "Your score and the correct answers appear after you submit."}</li>
            </ul>
          )}

          {midterm && (
            <div className="qz-modes" role="radiogroup" aria-label="Timer">
              <button className="qz-mode" role="radio" aria-checked={timed} onClick={() => setTimed(true)}>
                <b>Timed · {minutes} min</b>
                <span>{size.key === "long" ? "Like the real exam." : "Scaled to this length."} Submits when time runs out.</span>
              </button>
              <button className="qz-mode" role="radio" aria-checked={!timed} onClick={() => setTimed(false)}>
                <b>Untimed</b>
                <span>Take as long as you need.</span>
              </button>
            </div>
          )}

          {activeTypes.length > 0 ? (
            <p className="qz-note">
              Every round picks questions you haven&apos;t seen yet{midterm ? ", from every module" : questionSet === "alternative" ? ", from this alternative set" : ", from all of this module's question sets"}.
              {seenCount > 0 ? ` You've practiced ${seenCount} of ${bank} questions.` : ` ${bank} questions to rotate through.`}
            </p>
          ) : (
            <p className="qz-note">Check at least one question type to start.</p>
          )}

          <button className="btn primary qz-start" onClick={start} disabled={!size.questions}>Start test</button>
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
    const sections = [...new Set(run.qs.map((q) => typeLabel(q)))].map((s) => {
      const ix = items.filter((x) => typeLabel(x.q) === s);
      return { s, c: ix.reduce((a, x) => a + x.g.points, 0), t: ix.reduce((a, x) => a + x.g.max, 0) };
    });
    const mods = [...new Set(run.qs.flatMap((q) => (q.kind !== "match" && q.mod ? [q.mod] : [])))].sort().map((m) => {
      const ix = items.filter((x) => x.q.kind !== "match" && x.q.mod === m);
      return { m, c: ix.reduce((a, x) => a + x.g.points, 0), t: ix.reduce((a, x) => a + x.g.max, 0) };
    });
    const msg =
      p >= 80 ? "Great work." :
      p >= 60 ? "Getting there." :
      "Every round helps. Check the answers below, then try another round.";
    const retryWrong = () => {
      if (!wrong.length) return;
      const qs = wrong.map(({ q, g }) =>
        q.kind === "match" ? { ...q, rows: q.rows.filter((_, i) => !g.rows?.[i]) } : q,
      );
      const t = Date.now();
      setRun({
        v: 3, qs, answers: qs.map(() => ({})), idx: 0, startedAt: t,
        deadline: null, timed: midterm ? false : undefined,
        label: `Retry wrong answers · ${qs.length} question${qs.length === 1 ? "" : "s"}`,
        feedback: run.feedback, revealed: false,
        questionSet: run.questionSet,
      });
      setTimeUp(false);
      setShowAll(false);
      setRestarted(false);
      setPhase("run");
      toTop();
    };

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
          <p className="qz-note">
            {restarted
              ? "You've been through every question of at least one type, so those started over."
              : `You've practiced ${seenCount} of ${bank} questions. The next round picks ones you haven't seen.`}
          </p>
          {midterm && mods.length > 0 && (
            <div className="qz-breakdown">
              {mods.map(({ m, c, t }) => (
                <div key={m}><span>Module {m.slice(1)}</span><b>{pct(c, t)}%</b><em>{fmtPts(c)}/{t}</em></div>
              ))}
            </div>
          )}
          {sections.length > 1 && (
            <details className="qz-more">
              <summary>Score by question type</summary>
              <div className="qz-breakdown">
                {sections.map(({ s, c, t }) => (
                  <div key={s}><span>{s}</span><b>{pct(c, t)}%</b><em>{fmtPts(c)}/{t}</em></div>
                ))}
              </div>
            </details>
          )}
          <div className="qz-actions">
            {wrong.length > 0 && <button className="btn primary" onClick={retryWrong}>Retry wrong answers ({wrong.length}) →</button>}
            <button className={"btn" + (wrong.length ? "" : " primary")} onClick={start}>Another round →</button>
            <button className="btn" onClick={() => { setRun(null); setPhase("setup"); toTop(); }}>Change settings</button>
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
                        {q.why && <p className="qz-why">{q.why}</p>}
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
  const checked = !!(run.feedback && run.revealed);

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
                disabled={checked}
                onChange={(e) => update({ text: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); checkOrNext(); } }}
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
                    <input type="radio" name={`q-${run.idx}`} checked={a.choice === o} disabled={checked} onChange={() => update({ choice: o })} />
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
                    <input type="radio" name={`q-${run.idx}`} checked={a.choice === o} disabled={checked} onChange={() => update({ choice: o })} />
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
                        disabled={checked}
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
                    disabled={checked}
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
                    <button key={w} type="button" className="qz-chip" aria-pressed={a.choice === w} disabled={checked} onClick={() => update({ choice: w })}>{w}</button>
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
                      disabled={checked}
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
          {checked && <QuestionFeedback q={q} a={a} g={g} onReview={() => setPeek({ q, a })} />}
        </div>
        <div className="qz-foot">
          <p>
            {checked
              ? isLast ? "Answer checked. Submit when you're ready." : "Answer checked. Continue when you're ready."
              : unanswered
              ? "Not answered yet. If you move on, it counts as wrong."
              : blankRows
                ? `${blankRows} dropdown${blankRows === 1 ? "" : "s"} still blank.`
                : isLast ? "That's the last question." : "You can't come back to this question."}
          </p>
          <button className="btn primary" onClick={checkOrNext}>
            {run.feedback && !run.revealed ? "Check answer" : isLast ? "Submit test" : "Next →"}
          </button>
        </div>
      </article>
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
