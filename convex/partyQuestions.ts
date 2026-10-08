import type { Infer } from "convex/values";
import { ConvexError } from "convex/values";
import { questionShape, settingsType } from "./partyTypes";
import raw from "../content/msys-50/data.json";
import type { SubjectData } from "../lib/types";
import { norm } from "../lib/quiz";

const data = raw as unknown as SubjectData;
export type PartyQuestion = Infer<typeof questionShape>;
export type PartySettings = Infer<typeof settingsType>;
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const base = (kind: PartyQuestion["kind"], module: string, prompt: string, options: string[], correct: string[], explanation = "", source = ""): PartyQuestion => ({ kind, module, prompt, options, correct, explanation, source, rows: [], accept: [] });
export function questionBank(): PartyQuestion[] {
  const bank: PartyQuestion[] = [];
  for (const module of ["M1", "M2", "M3"]) {
    const slug = `module-${module.slice(1)}`;
    for (const q of data.scenarios[module] ?? []) bank.push(base("scenario", module, q.q, q.o, [q.a], q.w));
    const seen = new Set<string>();
    for (const set of Object.values(data.tests[slug] ?? {})) {
      for (const q of set.mtf) {
        if (seen.has(q.s)) continue;
        seen.add(q.s);
        const answer = q.t ? "!" : q.d ?? q.a?.[0] ?? "";
        bank.push({ ...base("tf", module, q.s, [], [answer], q.t ? "The statement is true." : `Replace the underlined term with ${answer}.`, q.r), accept: q.t ? ["!"] : q.a ?? [answer] });
        bank.push(base("tf2", module, q.s.replace(/<\/?u>/g, ""), ["True", "False"], [q.t ? "True" : "False"], q.t ? "The statement is true." : `The statement is false. The correct replacement is ${answer}.`, q.r));
      }
      for (const sec of set.secs) {
        if (sec.kind === "mc") {
          for (const q of sec.items ?? []) bank.push(base("mc", module, q.q, q.o, [q.a], q.w));
        } else {
          const items = sec.items;
          bank.push({ ...base("match", module, sec.inst, sec.kind === "letter" ? [...items.map(q => q[0]), ...(sec.extra ?? [])] : sec.opts, [], "Match each description with its correct term.", `${module.slice(1)} notes`), rows: items.map(q => sec.kind === "letter" ? q[1] : q[0]), correct: items.map(q => sec.kind === "letter" ? q[0] : q[1]) });
        }
      }
    }
    for (const q of data.multi?.[slug] ?? []) bank.push(base("multi", module, q.q, q.o, q.a, q.w, q.r));
    for (const q of data.blanks?.[slug] ?? []) bank.push(base("blank", module, q.s, q.bank, [q.a], q.w, q.r));
  }
  // Repeated sections across original sets should not inflate the battle bank.
  const seen = new Set<string>();
  return bank.filter(q => {
    const key = `${q.kind}:${q.module}:${q.prompt}:${q.rows.join("|")}`;
    if (seen.has(key) || !q.correct.length || q.correct.some(a => !a)) return false;
    seen.add(key); return true;
  });
}
export function validateSettings(s: PartySettings) {
  if (!s.types.length || new Set(s.types).size !== s.types.length) throw new ConvexError("Choose at least one question type, without duplicates.");
  if (![5, 10, 15, 20].includes(s.count) || ![30, 60, 90, 120].includes(s.seconds) || !Number.isInteger(s.capacity) || s.capacity < 2 || s.capacity > 12) throw new ConvexError("Choose 5–20 questions, 30–120 seconds, and 2–12 players from the settings.");
  if (s.types.length > s.count) throw new ConvexError("Choose at least as many questions as question types.");
}
export function selectQuestions(s: PartySettings): PartyQuestion[] {
  validateSettings(s);
  const pool = shuffle(questionBank().filter(q => (s.mode === "mixed" || q.module === s.mode) && s.types.includes(q.kind)));
  const chosen: PartyQuestion[] = [];
  const seen = new Set<string>();
  const fingerprint = (q: PartyQuestion) => q.prompt.replace(/<[^>]*>/g, "").toLowerCase().replace(/\s+/g, " ").trim() + q.rows.join("|");
  const take = (candidates: PartyQuestion[]) => {
    const q = candidates.find(q => !seen.has(fingerprint(q)));
    if (q) { chosen.push(q); seen.add(fingerprint(q)); }
    return !!q;
  };
  // Cover each selected type; distribute the rest across types and modules.
  for (const type of shuffle(s.types)) if (!take(pool.filter(q => q.kind === type))) throw new ConvexError(`No ${type} questions available for this module. Change the selected types.`);
  while (chosen.length < s.count) {
    const remaining = pool.filter(q => !seen.has(fingerprint(q)));
    if (!remaining.length) throw new ConvexError("Not enough distinct questions. Choose a shorter game or more types.");
    remaining.sort((a, b) => {
      const weight = (q: PartyQuestion) => chosen.filter(x => x.kind === q.kind).length * 3 + chosen.filter(x => x.module === q.module).length;
      return weight(a) - weight(b);
    });
    take(remaining);
  }
  return shuffle(chosen).map(q => {
    if (q.kind === "match") {
      const indices = shuffle(q.rows.map((_, i) => i)).slice(0, 3);
      return { ...q, options: shuffle([...new Set(q.options)]), rows: indices.map(i => q.rows[i]), correct: indices.map(i => q.correct[i]) };
    }
    return { ...q, options: q.kind === "tf2" ? q.options : shuffle(q.options) };
  });
}
export function isCorrect(q: PartyQuestion, answer: string | string[]): boolean {
  if (q.kind === "tf") return typeof answer === "string" && (q.correct[0] === "!" ? answer.trim() === "!" : answer.trim() !== "!" && q.accept.some(a => norm(a) === norm(answer)));
  if (q.kind === "multi") return Array.isArray(answer) && new Set(answer).size === answer.length && answer.length === q.correct.length && q.correct.every(a => answer.includes(a));
  if (q.kind === "match") return Array.isArray(answer) && answer.length === q.correct.length && q.correct.every((a, i) => answer[i] === a);
  return typeof answer === "string" && answer === q.correct[0];
}
