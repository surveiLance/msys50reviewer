import type { NotePart, NoteSection } from "./notes";
import type { Answer, Question } from "./questions";

export const plainText = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();

const STOP = new Set(
  "the and for that with are this from which what into its can not all each does when than then them they their there these those been being have has had was were will would should could about also only more most such some other over under your you our who whom whose how why where very just like make made uses used use one two three four five many much any both either neither of to in on at by as is it be or an a if so do".split(" "),
);
const words = (s: string) => (s.toLowerCase().match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) || []).filter((w) => w.length > 2 && !STOP.has(w));

/** Words worth highlighting in the notes: the correct answer (and, for true statements, the underlined part). */
export function highlightTerms(q: Question, a?: Answer): string[] {
  if (q.kind === "tf") {
    const u = q.prompt.match(/<u>(.*?)<\/u>/)?.[1];
    return [q.isTrue ? u : q.answer, ...(q.isTrue ? [] : q.accept)].filter((x): x is string => !!x && x !== "!").map(plainText);
  }
  if (q.kind === "tf2") return [q.isTrue ? q.underlined : q.fix].filter((x): x is string => !!x).map(plainText);
  if (q.kind === "mc" || q.kind === "blank") return [q.answer].map(plainText);
  if (q.kind === "multi") return q.correct.map(plainText);
  return q.rows.filter((r, i) => a?.picks?.[i] !== r.answer).map((r) => plainText(r.answer));
}

/** Which modules (and part) a question points at. Questions without a source search more widely. */
export function peekTarget(q: Question, fallbackModule: string | undefined, allModules: string[]) {
  const src = q.kind !== "match" ? q.source?.match(/^(\d+)\.(\d+)/) : null;
  if (src) return { modules: [`module-${src[1]}`], partId: `p-${src[1]}-${src[2]}` };
  const num = q.kind !== "match" ? q.mod?.match(/^M(\d+)$/)?.[1] : undefined;
  if (num) return { modules: [`module-${num}`], partId: undefined };
  if (fallbackModule) return { modules: [fallbackModule], partId: undefined };
  return { modules: allModules, partId: undefined };
}

export type Peek = { module: string; part: NotePart; section: NoteSection | null; index: number };

/**
 * The notes section that best matches a question: words from the question count once,
 * words from the correct answer count three times. Searches the given part first.
 */
export function findSection(notes: Record<string, NotePart[]>, q: Question, a: Answer | undefined, partId?: string): Peek | null {
  const query = new Map<string, number>();
  const add = (text: string, w: number) => words(text).forEach((t) => query.set(t, Math.max(query.get(t) || 0, w)));
  if (q.kind === "match") {
    q.rows.forEach((r, i) => a?.picks?.[i] !== r.answer && (add(r.prompt, 1), add(r.answer, 3)));
  } else {
    add(plainText(q.prompt), 1);
    highlightTerms(q, a).forEach((t) => add(t, 3));
  }
  let best: Peek | null = null;
  let bestScore = -1;
  for (const [module, parts] of Object.entries(notes)) {
    for (const part of parts) {
      const inPart = partId && part.id === partId ? 2 : partId ? 0 : 1; // prefer the cited part
      part.sections.forEach((section, index) => {
        if (/guide questions/i.test(section.title)) return; // Q&A lists match everything; skip them
        const text = " " + words(plainText(section.title + " " + section.html)).join(" ") + " ";
        let score = 0;
        query.forEach((w, t) => text.includes(` ${t} `) && (score += w));
        score = score * (inPart ? inPart : 0.5);
        if (score > bestScore) {
          bestScore = score;
          best = { module, part, section, index };
        }
      });
    }
  }
  return best;
}
