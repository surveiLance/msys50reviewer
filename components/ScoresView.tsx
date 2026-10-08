"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SubjectMeta } from "@/lib/types";
import {
  SCORES_EVENT, clearAttempts, fmtDate, fmtDuration, loadAttempts, moduleAccuracy, pct, type Attempt,
} from "@/lib/scores";

const TREND_MAX = 12;

function level(p: number) {
  if (p >= 80) return { key: "good", icon: "✓", label: "Strong" };
  if (p >= 60) return { key: "warn", icon: "~", label: "Getting there" };
  return { key: "bad", icon: "!", label: "Review this" };
}

export default function ScoresView({ subject }: { subject: SubjectMeta }) {
  const [all, setAll] = useState<Attempt[] | null>(null);
  const [reviewing, setReviewing] = useState<Attempt | null>(null);
  const base = `/${subject.slug}`;
  const examName = subject.exam ? `${subject.exam.title} test` : "Exam";

  useEffect(() => {
    const read = () => setAll(loadAttempts(subject.slug));
    read();
    window.addEventListener(SCORES_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(SCORES_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, [subject.slug]);

  useEffect(() => {
    if (!reviewing) return;
    const close = (e: KeyboardEvent) => { if (e.key === "Escape") setReviewing(null); };
    document.body.classList.add("history-open");
    window.addEventListener("keydown", close);
    return () => {
      document.body.classList.remove("history-open");
      window.removeEventListener("keydown", close);
    };
  }, [reviewing]);

  if (!all) return <p className="inst">Loading your scores…</p>;

  if (!all.length) {
    return (
      <div className="empty">
        <h3>No scores yet</h3>
        <p>Every time you submit a test, your score lands here so you can see how you&apos;re improving and which module needs more work.</p>
        <div className="module-links">
          <Link className="btn primary" href={`${base}/test`}>Take a test</Link>
        </div>
      </div>
    );
  }

  const mids = all.filter((a) => a.kind === "midterm");
  const practice = all.filter((a) => a.kind === "practice");
  const midPcts = mids.map((a) => pct(a.score, a.max));
  const trend = mids.slice(-TREND_MAX);
  const firstShown = mids.length - trend.length;

  const mods = subject.modules.map((m) => ({ m, ...moduleAccuracy(all, m.slug, m.num) }));
  const tried = mods.filter((x) => x.total > 0);
  const weakest = tried.length ? tried.reduce((a, b) => (b.pct < a.pct ? b : a)) : null;
  const modName = (slug?: string) => {
    const m = subject.modules.find((x) => x.slug === slug);
    return m ? `Module ${m.num}` : "Module";
  };

  const reset = () => {
    if (window.confirm("Delete all your saved scores for this subject? This can't be undone.")) clearAttempts(subject.slug);
  };

  return (
    <div className="scores">
      <div className="tiles">
        <div className="tile">
          <span className="eyebrow">{examName} · best</span>
          <b>{mids.length ? `${Math.max(...midPcts)}%` : "—"}</b>
          <span>{mids.length ? `out of ${mids.length} attempt${mids.length === 1 ? "" : "s"}` : "Not taken yet"}</span>
        </div>
        <div className="tile">
          <span className="eyebrow">{examName} · latest</span>
          <b>{mids.length ? `${midPcts[midPcts.length - 1]}%` : "—"}</b>
          <span>
            {mids.length > 1
              ? (() => {
                  const d = midPcts[midPcts.length - 1] - midPcts[midPcts.length - 2];
                  return d === 0 ? "Same as the time before" : `${d > 0 ? "▲ up" : "▼ down"} ${Math.abs(d)} points from last time`;
                })()
              : mids.length ? "Take it again to see your trend" : <Link href={`${base}/test/midterm`}>Take it now →</Link>}
          </span>
        </div>
        <div className="tile">
          <span className="eyebrow">Module tests</span>
          <b>{practice.length}</b>
          <span>taken across {new Set(practice.map((a) => a.module)).size} of {subject.modules.length} modules</span>
        </div>
      </div>

      {weakest && weakest.pct < 80 && (
        <div className="focus">
          <span className="eyebrow">Focus next</span>
          <p><b>Module {weakest.m.num}: {weakest.m.title}</b> is your weakest area at <b>{weakest.pct}%</b>.</p>
          <div className="module-links">
            <Link className="btn primary" href={`${base}/${weakest.m.slug}`}>Review the notes</Link>
            <Link className="btn" href={`${base}/${weakest.m.slug}/flashcards`}>Flashcards</Link>
            <Link className="btn" href={`${base}/test/${weakest.m.slug}`}>Module {weakest.m.num} test</Link>
          </div>
        </div>
      )}

      <section className="chart-card">
        <h3>Strength by module</h3>
        <p className="inst">Your accuracy on each module over your last 5 tests that covered it: module tests count in full, and the midterm counts the questions tied to that module.</p>
        <div className="hbars">
          {mods.map(({ m, total, correct, attempts, pct: p }) => {
            const lv = level(p);
            return (
              <div className="hbar" key={m.slug}>
                <div className="hbar-k">
                  <Link href={`${base}/${m.slug}`}>Module {m.num}</Link>
                  <span>{m.title}</span>
                </div>
                {total ? (
                  <>
                    <div className="hbar-track" role="img" aria-label={`Module ${m.num}: ${p}% (${correct} of ${total} items)`} title={`${correct} of ${total} items · ${attempts} test${attempts === 1 ? "" : "s"}`}>
                      <i style={{ width: `${p}%` }} />
                    </div>
                    <div className="hbar-v">
                      <b>{p}%</b>
                      <span className={`lvl ${lv.key}`}><span aria-hidden>{lv.icon}</span> {lv.label}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="hbar-track empty-track" />
                    <div className="hbar-v"><Link href={`${base}/test/${m.slug}`} className="lvl none">Not tested yet →</Link></div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {mids.length > 0 && (
        <section className="chart-card">
          <h3>{examName} scores over time</h3>
          <p className="inst">
            {mids.length > TREND_MAX ? `Your last ${TREND_MAX} of ${mids.length} attempts.` : "Each bar is one attempt, oldest on the left."} Hover or tap a bar for details.
          </p>
          <div className="vchart" role="list">
            <div className="vgrid" aria-hidden>
              {[100, 75, 50, 25].map((g) => <span key={g} style={{ bottom: `${g}%` }}><em>{g}%</em></span>)}
            </div>
            {trend.map((a, i) => {
              const p = pct(a.score, a.max);
              return (
                <div className="vcol" key={a.id} role="listitem" tabIndex={0} aria-label={`Attempt ${firstShown + i + 1}: ${p}%, ${a.score} of ${a.max}, ${fmtDate(a.at)}`}>
                  <div className="vbar" style={{ height: `${Math.max(p, 1)}%` }}>
                    <b>{p}</b>
                  </div>
                  <span className="vx">#{firstShown + i + 1}</span>
                  <div className="vtip" role="tooltip">
                    <b>{p}% · {a.score}/{a.max}</b>
                    <span>{fmtDate(a.at)}</span>
                    <span>{a.timed ? "Timed" : "Untimed"} · {fmtDuration(a.seconds)}</span>
                    {Object.keys(a.byModule).sort().map((k) => <span key={k}>{k}: {a.byModule[k][0]}/{a.byModule[k][1]}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="chart-card">
        <h3>Every attempt</h3>
        <p className="inst">Open a saved attempt to compare every response with the correct answer and explanation.</p>
        <div className="tbl">
          <table className="hist">
            <thead>
              <tr><th>Test</th><th>Score</th></tr>
            </thead>
            <tbody>
              {all.slice().reverse().map((a) => (
                <tr key={a.id}>
                  <td>
                    <b>{a.kind === "midterm" ? examName : `${modName(a.module)} test`}</b>
                    {a.set ? <span className="muted"> · {a.set}</span> : null}
                    <span className="hist-meta">
                      {fmtDate(a.at)} · {fmtDuration(a.seconds)}
                      {a.kind === "midterm" ? (a.timed ? " · timed" : " · untimed") : ""}
                      {a.answered < a.max ? ` · ${a.max - a.answered} left blank` : ""}
                    </span>
                    {a.review?.length ? (
                      <button className="hist-review-btn" type="button" onClick={() => setReviewing(a)}>Review answers →</button>
                    ) : (
                      <span className="hist-old">Summary only · completed before answer history was added</span>
                    )}
                  </td>
                  <td className="hist-score"><b>{pct(a.score, a.max)}%</b><span className="hist-meta">{a.score} of {a.max}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="scores-foot">
        <p className="inst">Scores are saved in this browser only. They won&apos;t follow you to another device, and clearing your browser data erases them.</p>
        <button className="btn danger" type="button" onClick={reset}>Delete all scores</button>
      </div>

      {reviewing && (
        <div className="hist-back" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setReviewing(null); }}>
          <section className="hist-dialog" role="dialog" aria-modal="true" aria-labelledby="hist-title">
            <header className="hist-dialog-head">
              <div>
                <span className="eyebrow">{fmtDate(reviewing.at)} · {fmtDuration(reviewing.seconds)}</span>
                <h3 id="hist-title">{reviewing.kind === "midterm" ? examName : `${modName(reviewing.module)} test`} · {pct(reviewing.score, reviewing.max)}%</h3>
                {reviewing.set && <p>{reviewing.set}</p>}
              </div>
              <button className="peek-x" type="button" aria-label="Close answer history" onClick={() => setReviewing(null)}>×</button>
            </header>
            <div className="hist-dialog-body">
              <ol className="qz-rv hist-answers">
                {reviewing.review!.map((item, i) => {
                  const full = item.points === item.max;
                  return (
                    <li key={i} className={full ? "ok" : ""}>
                      <div className="qz-rv-top">
                        <span>Question {i + 1} · {item.type}{item.module ? ` · Module ${item.module.slice(1)}` : ""}</span>
                        <b>{item.points} / {item.max} pt{item.max === 1 ? "" : "s"}</b>
                      </div>
                      <div className="qz-rv-prompt" dangerouslySetInnerHTML={{ __html: item.prompt }} />
                      {item.rows ? (
                        <ul className="qz-rv-rows">
                          {item.rows.map((row, ri) => (
                            <li key={ri} className={row.ok ? "is-right" : "is-wrong"}>
                              <span dangerouslySetInnerHTML={{ __html: row.prompt }} />
                              <span className="qz-rv-line">Your answer: <span className={"y" + (row.ok ? " ok" : "")}>{row.your}</span>{!row.ok && <> · Correct: <span className="c">{row.correct}</span></>}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <>
                          <p className="qz-rv-line">Your answer: <span className={"y" + (full ? " ok" : "")}>{item.your?.join(" · ") || "No answer"}</span></p>
                          {!full && <p className="qz-rv-line">Correct answer: <span className="c">{item.correct?.join(" · ")}</span></p>}
                        </>
                      )}
                      {item.explanation && <p className="qz-why">{item.explanation}</p>}
                      {item.source && <p className="qz-src"><span>Source: {item.source}</span></p>}
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
