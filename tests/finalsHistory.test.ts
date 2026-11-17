import { afterEach, expect, test, vi } from "vitest";
import { getSubjectData } from "../lib/subjects";
import { finalsPool, pickFinalsRound } from "../lib/finals";
import { loadAttempts, recordAttempt, type AttemptReviewItem } from "../lib/scores";

afterEach(() => vi.unstubAllGlobals());

test.each([500_000, 2_000_000])("full finals scores persist when other progress uses %i code units", (otherSize) => {
  const memory = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      const next = new Map(memory).set(key, value);
      const bytes = [...next].reduce((sum, [key, value]) => sum + 2 * (key.length + value.length), 0);
      if (bytes > 5 * 1024 * 1024) throw new DOMException("Storage full", "QuotaExceededError");
      memory.set(key, value);
    },
  });
  vi.stubGlobal("window", new EventTarget());
  // Existing run/progress keys share the same browser quota.
  localStorage.setItem("other-progress", "x".repeat(otherSize));
  const pool = finalsPool(getSubjectData("msys-50")!, ["module-4", "module-5", "module-6"], true);
  const questions = pickFinalsRound(pool, ["mc", "multi"], 30, []).qs;
  const review = questions.map<AttemptReviewItem>(q => {
    if (q.kind !== "mc" && q.kind !== "multi") throw new Error("Unexpected case type");
    return { type: q.kind, prompt: q.prompt, your: [q.options[0]], correct: q.kind === "mc" ? [q.answer] : q.correct, explanation: q.why, source: q.source, module: q.mod, points: 0, max: 2 };
  });
  for (let i = 0; i < 60; i++) recordAttempt("finals-test", {
    kind: "finals", score: i, max: 60, answered: 60, byModule: {}, parts: [], review,
  });
  const saved = loadAttempts("finals-test");
  expect(saved).toHaveLength(60);
  expect(saved.map(attempt => attempt.score)).toEqual(Array.from({ length: 60 }, (_, i) => i));
  expect(saved.at(-1)?.review).toHaveLength(30);
  expect(saved[0].review).toBeUndefined();
});
