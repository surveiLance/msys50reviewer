import { load, save } from "./quiz";

export type AttemptReviewRow = {
  prompt: string;
  your: string;
  correct: string;
  ok: boolean;
};

/** A compact question snapshot so a completed attempt can be reviewed later. */
export type AttemptReviewItem = {
  type: string;
  section?: string;
  prompt: string;
  your?: string[];
  correct?: string[];
  explanation?: string;
  source?: string;
  module?: string;
  points: number;
  max: number;
  rows?: AttemptReviewRow[];
};

/** One checked test. Saved in this browser only. */
export type Attempt = {
  id: string;
  at: number; // epoch ms when checked
  kind: "practice" | "midterm";
  module?: string; // practice: module slug
  set?: string; // practice: set label
  score: number;
  max: number;
  answered: number;
  seconds?: number; // time from start to check
  timed?: boolean;
  /** Module tag ("M1") → [correct, total], for items tied to a single module. */
  byModule: Record<string, [number, number]>;
  /** Per test part: [label, correct, total]. */
  parts: [string, number, number][];
  /** Question-level snapshot. Older attempts predate this field. */
  review?: AttemptReviewItem[];
};

const key = (subject: string) => `scores-${subject}`;
export const SCORES_EVENT = "scores-changed";

export function loadAttempts(subject: string): Attempt[] {
  const a = load<Attempt[]>(key(subject), []);
  return Array.isArray(a) ? a : [];
}

export function recordAttempt(subject: string, a: Omit<Attempt, "id" | "at">): void {
  const all = loadAttempts(subject);
  all.push({ ...a, id: Math.random().toString(36).slice(2, 10), at: Date.now() });
  const kept = all.slice(-200);
  // Keep every score summary, but limit bulky question snapshots to protect localStorage.
  kept.slice(0, -50).forEach((attempt) => delete attempt.review);
  save(key(subject), kept);
  window.dispatchEvent(new Event(SCORES_EVENT));
}

export function clearAttempts(subject: string): void {
  save(key(subject), []);
  window.dispatchEvent(new Event(SCORES_EVENT));
}

export const pct = (score: number, max: number) => (max ? Math.round((score / max) * 100) : 0);

/** "M2" ↔ "module-2" */
export const modTag = (num: number) => `M${num}`;

/**
 * Accuracy for one module from the most recent attempts that touched it:
 * module tests count whole; midterm tests count only that module's tagged items.
 */
export function moduleAccuracy(attempts: Attempt[], slug: string, num: number, recent = 5) {
  const tag = modTag(num);
  const hits = attempts
    .filter((a) => (a.kind === "practice" && a.module === slug) || (a.kind === "midterm" && a.byModule[tag]))
    .slice(-recent);
  let c = 0, t = 0;
  for (const a of hits) {
    const [x, y] = a.kind === "practice" ? [a.score, a.max] : a.byModule[tag];
    c += x;
    t += y;
  }
  return { correct: c, total: t, attempts: hits.length, pct: pct(c, t) };
}

export function fmtDuration(s?: number): string {
  if (s == null) return "—";
  const m = Math.floor(s / 60);
  return m ? `${m}m ${s % 60}s` : `${s}s`;
}

export function fmtDate(ms: number): string {
  return new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
