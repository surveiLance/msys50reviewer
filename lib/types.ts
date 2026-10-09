/** A modified true-or-false item. `t` = statement is true; otherwise `a` lists accepted replacements and `d` is the displayed answer. */
export type MtfItem = { s: string; t?: true; a?: string[]; d?: string; r?: string; m?: string };

export type McItem = { q: string; o: string[]; a: string; w?: string; r?: string };

/** Multiple answer (checkboxes): `a` lists every correct option. `r` is a source like "2.1 notes". */
export type MultiItem = { q: string; o: string[]; a: string[]; w?: string; r?: string };

/** Fill in the blank with a word bank: `s` contains one "___". */
export type BlankItem = { s: string; bank: string[]; a: string; w?: string; r?: string };

/** A separately authored question for the alternative, past-quiz-style bank. */
export type AlternativeQuestion =
  | { kind: "tf2"; prompt: string; isTrue: boolean; underlined?: string; fix?: string; why: string; source: string }
  | { kind: "mc"; prompt: string; options: string[]; answer: string; why: string; source: string }
  | { kind: "multi"; prompt: string; options: string[]; correct: string[]; why: string; source: string }
  | { kind: "blank"; prompt: string; bank: string[]; answer: string; why: string; source: string };

export type Draw = { pool: string; n: number };

export type Section =
  | { kind: "letter"; title: string; inst: string; items: [string, string][]; extra?: string[] }
  | { kind: "pick"; title: string; inst: string; items: [string, string][]; opts: string[] }
  | { kind: "mc"; title: string; inst: string; items?: McItem[]; draw?: Draw[] };

export type TestSet = { desc: string; mtf: MtfItem[]; secs: Section[] };

export type MidtermSpec = { desc: string; mtf: Draw[]; secs: Section[] };

/** [part, front, back] — front/back may contain simple HTML entities. */
export type Card = [string, string, string];

export type SubjectData = {
  cards: Record<string, Card[]>;
  tests: Record<string, Record<string, TestSet>>;
  setLabels: Record<string, Record<string, string>>;
  defaultSet: Record<string, string>;
  pools: Record<string, MtfItem[]>;
  scenarios: Record<string, McItem[]>;
  midterm: MidtermSpec;
  /** Mixed-style questions per module (Multiple Answer, Fill in the Blank). */
  multi?: Record<string, MultiItem[]>;
  blanks?: Record<string, BlankItem[]>;
  /** Independent Canvas-style bank; does not replace or reset the original questions. */
  alternative?: Record<string, AlternativeQuestion[]>;
};

export type ModuleMeta = { slug: string; num: number; title: string; parts: string[]; period?: "midterm" | "finals" };

export type ExamMeta = {
  title: string;
  when: string;
  rooms: string[];
  minutes: number;
  /** Explicit coverage prevents future modules from entering an earlier exam's bank. */
  modules?: string[];
};

export type SubjectMeta = {
  slug: string;
  code: string;
  title: string;
  blurb: string;
  modules: ModuleMeta[];
  exam?: ExamMeta;
  finals?: { when: string; description: string };
};
