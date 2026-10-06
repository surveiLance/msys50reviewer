"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { McItem, MidtermSpec, MtfItem, Section, TestSet } from "@/lib/types";
import { LETTERS, ROMAN, load, norm, sample, save, shuffle } from "@/lib/quiz";
import { pct, recordAttempt } from "@/lib/scores";

/** `mod` = module tag ("M1") when the item belongs to one module. */
type Row = { prompt: string; options: { value: string; label: string }[]; answer: string; why?: string; mod?: string };
type BuiltSection = { kind: Section["kind"]; title: string; inst: string; rows: Row[]; choices?: string[] };
type Built = { desc: string; mtf: MtfItem[]; secs: BuiltSection[] };

type Props = {
  /** Subject slug; attempts are saved under it for the My Scores page. */
  subject: string;
  /** Module slug, for practice tests. */
  module?: string;
  sets?: Record<string, TestSet>;
  order?: string[];
  labels?: Record<string, string>;
  defaultSet?: string;
  storageKey: string;
  midterm?: MidtermSpec;
  pools?: Record<string, MtfItem[]>;
  scenarios?: Record<string, McItem[]>;
  timerMinutes?: number;
  showModules?: boolean;
};

function buildSection(sec: Section, scenarios?: Record<string, McItem[]>): BuiltSection {
  if (sec.kind === "letter") {
    const choices = shuffle(sec.items.map((x) => x[1]).concat(sec.extra || []));
    const opts = choices.map((_, i) => ({ value: LETTERS[i], label: LETTERS[i] }));
    const rows = shuffle(sec.items).map(([term, desc]) => ({ prompt: term, options: opts, answer: LETTERS[choices.indexOf(desc)] }));
    return { kind: sec.kind, title: sec.title, inst: sec.inst, rows, choices };
  }
  if (sec.kind === "pick") {
    const opts = sec.opts.map((o) => ({ value: o, label: o }));
    const rows = shuffle(sec.items).map(([p, a]) => ({ prompt: p, options: opts, answer: a }));
    return { kind: sec.kind, title: sec.title, inst: sec.inst, rows };
  }
  const items: (McItem & { mod?: string })[] =
    sec.items ?? (sec.draw || []).flatMap((d) => sample(scenarios?.[d.pool] || [], d.n).map((x) => ({ ...x, mod: d.pool })));
  const rows = shuffle(items).map((x) => ({
    prompt: x.q,
    options: shuffle(x.o).map((o) => ({ value: o, label: o })),
    answer: x.a,
    why: x.w,
    mod: x.mod,
  }));
  return { kind: "mc", title: sec.title, inst: sec.inst, rows };
}

function buildSet(p: Props, key: string): Built {
  if (p.midterm) {
    const m = p.midterm;
    const mtf = shuffle(m.mtf.flatMap((d) => sample(p.pools?.[d.pool] || [], d.n)));
    return { desc: m.desc, mtf, secs: m.secs.map((s) => buildSection(s, p.scenarios)) };
  }
  const t = p.sets![key];
  return { desc: t.desc, mtf: t.mtf, secs: t.secs.map((s) => buildSection(s, p.scenarios)) };
}

function gradeMtf(it: MtfItem, value: string): { ok: boolean; msg: string } {
  const n = norm(value);
  let ok: boolean;
  let msg: string;
  if (it.t) {
    ok = n === "true" || n === "t";
    msg = ok ? "Correct: TRUE" : "Answer: TRUE";
  } else {
    ok = (it.a || []).some((x) => norm(x) === n);
    msg = ok ? "Correct: " + it.d : n === "false" || n === "f" ? "It's false, but write the replacement. Answer: " + it.d : "Answer: " + it.d;
  }
  if (it.r) msg += "  ·  " + it.r;
  return { ok, msg };
}

function fmt(s: number) {
  const m = Math.floor(s / 60), x = s % 60;
  return `${m < 10 ? "0" : ""}${m}:${x < 10 ? "0" : ""}${x}`;
}

export default function PracticeTest(props: Props) {
  const order = props.order || ["1"];
  const [setKey, setSetKey] = useState(props.defaultSet || order[0]);
  const [attempt, setAttempt] = useState(0);
  const [built, setBuilt] = useState<Built | null>(null);
  const [mtfAns, setMtfAns] = useState<string[]>([]);
  const [selAns, setSelAns] = useState<string[][]>([]);
  const [checked, setChecked] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  // The mock exam opens on a start screen; practice tests start right away.
  const [started, setStarted] = useState(!props.midterm);
  const [timed, setTimed] = useState(false);
  const startedAt = useRef(0);
  const recorded = useRef(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const k = load<string>(props.storageKey + "-set", "");
    if (k && props.sets?.[k]) setSetKey(k);
  }, [props.storageKey, props.sets]);

  // Build after mount so shuffling never causes a server/client mismatch.
  useEffect(() => {
    const b = buildSet(props, setKey);
    setBuilt(b);
    setMtfAns(b.mtf.map(() => ""));
    setSelAns(b.secs.map((s) => s.rows.map(() => "")));
    setChecked(false);
    startedAt.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setKey, attempt]);

  useEffect(() => {
    if (left === null || left <= 0) return;
    const t = setTimeout(() => setLeft((l) => (l === null ? null : l - 1)), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const result = useMemo(() => {
    if (!built || !checked) return null;
    const mtf = built.mtf.map((it, i) => gradeMtf(it, mtfAns[i] || ""));
    const secs = built.secs.map((s, si) => s.rows.map((r, ri) => (selAns[si]?.[ri] || "") === r.answer));
    const mtfScore = mtf.filter((x) => x.ok).length;
    const secScores = secs.map((s) => s.filter(Boolean).length);
    const total = mtfScore + secScores.reduce((a, b) => a + b, 0);
    const max = built.mtf.length + built.secs.reduce((a, s) => a + s.rows.length, 0);
    const mods: Record<string, [number, number]> = {};
    built.mtf.forEach((it, i) => {
      if (!it.m) return;
      mods[it.m] = mods[it.m] || [0, 0];
      mods[it.m][1]++;
      if (mtf[i].ok) mods[it.m][0]++;
    });
    built.secs.forEach((s, si) => s.rows.forEach((r, ri) => {
      if (!r.mod) return;
      mods[r.mod] = mods[r.mod] || [0, 0];
      mods[r.mod][1]++;
      if (secs[si][ri]) mods[r.mod][0]++;
    }));
    return { mtf, secs, mtfScore, secScores, total, max, mods };
  }, [built, checked, mtfAns, selAns]);

  const answered = built
    ? mtfAns.filter((x) => x.trim()).length + selAns.reduce((a, s) => a + s.filter(Boolean).length, 0)
    : 0;
  const total = built ? built.mtf.length + built.secs.reduce((a, s) => a + s.rows.length, 0) : 0;

  // Save the first check of each attempt for the My Scores page.
  useEffect(() => {
    if (!result || !built || recorded.current === attempt || answered === 0) return;
    recorded.current = attempt;
    const isMid = !!props.midterm;
    recordAttempt(props.subject, {
      kind: isMid ? "midterm" : "practice",
      module: props.module,
      set: isMid ? undefined : props.order && props.order.length > 1 ? props.labels?.[setKey] || setKey : undefined,
      score: result.total,
      max: result.max,
      answered,
      seconds: Math.round((Date.now() - startedAt.current) / 1000),
      timed: isMid ? timed : undefined,
      byModule: result.mods,
      parts: [
        ["True or False", result.mtfScore, built.mtf.length],
        ...built.secs.map((s, i): [string, number, number] => [s.title, result.secScores[i], s.rows.length]),
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const switchSet = (k: string) => {
    setSetKey(k);
    save(props.storageKey + "-set", k);
    rootRef.current?.scrollIntoView({ block: "start" });
  };
  const retake = () => {
    setAttempt((a) => a + 1);
    setLeft(null);
    if (props.midterm) setStarted(false);
    rootRef.current?.scrollIntoView({ block: "start" });
  };
  const check = () => {
    if (answered === 0) {
      window.alert("Answer at least one item first.");
      return;
    }
    const blank = total - answered;
    if (!checked && blank > 0 && !window.confirm(`You left ${blank} item${blank === 1 ? "" : "s"} blank. Blanks count as wrong. Check anyway?`)) return;
    setChecked(true);
    setLeft(null);
  };
  const start = (withTimer: boolean) => {
    setTimed(withTimer);
    setStarted(true);
    startedAt.current = Date.now();
    setLeft(withTimer && props.timerMinutes ? props.timerMinutes * 60 : null);
    rootRef.current?.scrollIntoView({ block: "start" });
  };

  if (!built) return <div ref={rootRef}><p className="inst">Loading the test…</p></div>;

  if (!started) {
    return (
      <div ref={rootRef} className="start-card">
        <div className="eyebrow">Ready when you are</div>
        <h3>Start the mock exam</h3>
        <p>{total} items, new questions every time. Answer what you can, then press <b>Check answers</b> to see your score and save it to My Scores.</p>
        <div className="start-btns">
          <button className="btn primary" type="button" onClick={() => start(true)}>
            Timed · {props.timerMinutes} minutes
            <small>Like the real exam</small>
          </button>
          <button className="btn" type="button" onClick={() => start(false)}>
            Untimed
            <small>Take as long as you need</small>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="test-root">
      {order.length > 1 && (
        <div className="bar setbar">
          {order.map((k) => (
            <button key={k} className="chip" aria-pressed={k === setKey} onClick={() => switchSet(k)}>{props.labels?.[k] || k}</button>
          ))}
        </div>
      )}
      <p className="inst set-desc">{built.desc}</p>

      {timed && !checked && left !== null ? (
        <div className={"clock-pill" + (left === 0 ? " up" : left < 300 ? " low" : "")} role="timer" aria-live={left < 60 ? "polite" : "off"}>
          {left === 0 ? "Time's up — check your answers" : <>Time left <b>{fmt(left)}</b></>}
        </div>
      ) : null}

      <h2 style={{ marginTop: 6 }}><span className="tag">TEST I · {built.mtf.length} ITEMS</span>Modified True or False</h2>
      <p className="inst">Write <b>TRUE</b> if the statement is correct. If it is false, write the word or phrase that should replace the <u>underlined</u> part to make it true.</p>
      <ol className="items">
        {built.mtf.map((it, i) => (
          <li key={i}>
            <div>
              <div className="stmt">
                <span dangerouslySetInnerHTML={{ __html: it.s }} />
                {props.showModules && it.m ? <> <span className="pill">{it.m}</span></> : null}
              </div>
              <div className="ans-row">
                <input
                  className="ans"
                  value={mtfAns[i] || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMtfAns((a) => { const b = a.slice(); b[i] = e.target.value; return b; })}
                  autoComplete="off" autoCapitalize="off" spellCheck={false}
                  placeholder="TRUE or correct word" aria-label={`Answer for item ${i + 1}`}
                />
                <button className="tf-quick" type="button" onClick={() => setMtfAns((a) => { const b = a.slice(); b[i] = "TRUE"; return b; })}>TRUE</button>
              </div>
              {result && <div className={"fb " + (result.mtf[i].ok ? "ok" : "bad")}>{result.mtf[i].msg}</div>}
            </div>
          </li>
        ))}
      </ol>

      {built.secs.map((sec, si) => (
        <section key={si}>
          <h2><span className="tag">TEST {ROMAN[si + 1]} · {sec.rows.length} ITEMS</span>{sec.title}</h2>
          <p className="inst">{sec.inst}</p>
          {sec.choices && (
            <div className="choices">
              {sec.choices.map((c, i) => <div key={i}><b>{LETTERS[i]}</b><span>{c}</span></div>)}
            </div>
          )}
          <ol className="items">
            {sec.rows.map((r, ri) => {
              const val = selAns[si]?.[ri] || "";
              const ok = result ? result.secs[si][ri] : false;
              const select = (
                <select
                  className={sec.kind === "mc" ? "mc-sel" : undefined}
                  value={val}
                  aria-label={`Answer for item ${ri + 1}`}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelAns((a) => { const b = a.map((x) => x.slice()); b[si][ri] = e.target.value; return b; })}
                >
                  <option value="">{sec.kind === "letter" ? "—" : "Choose"}</option>
                  {r.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              );
              return (
                <li key={ri}>
                  <div>
                    {sec.kind === "mc"
                      ? <><div className="mc-q" dangerouslySetInnerHTML={{ __html: r.prompt }} />{select}</>
                      : <div className="m-row"><span className="t" dangerouslySetInnerHTML={{ __html: r.prompt }} />{select}</div>}
                    {result && (
                      <div className={"fb " + (ok ? "ok" : "bad")}>
                        {(ok ? "Correct" : "Answer: " + r.answer) + (r.why ? "  ·  " + r.why : "")}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <div className="scorebox">
        <div className="score">
          {result ? (
            <>
              {result.total} / {result.max} <span className="pct">{pct(result.total, result.max)}%</span>
              <small>{["I " + result.mtfScore + "/" + built.mtf.length, ...result.secScores.map((g, i) => ROMAN[i + 1] + " " + g + "/" + built.secs[i].rows.length)].join(" · ")}</small>
              {props.showModules && (
                <small>By module: {Object.keys(result.mods).sort().map((k) => `${k} ${result.mods[k][0]}/${result.mods[k][1]}`).join(" · ")}</small>
              )}
            </>
          ) : (
            <>{answered} / {total} <span className="pct">answered</span><small>Check whenever you&apos;re done</small></>
          )}
        </div>
        {result ? (
          <>
            <Link className="btn" href={`/${props.subject}/scores`}>My scores</Link>
            <button className="btn primary" onClick={retake}>{props.midterm ? "New mock exam" : "Retake"}</button>
          </>
        ) : (
          <button className="btn primary" onClick={check}>Check answers</button>
        )}
      </div>
    </div>
  );
}
