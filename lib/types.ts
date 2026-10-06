/** A modified true-or-false item. `t` = statement is true; otherwise `a` lists accepted replacements and `d` is the displayed answer. */
export type MtfItem = { s: string; t?: true; a?: string[]; d?: string; r?: string; m?: string };

export type McItem = { q: string; o: string[]; a: string; w?: string };

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
};

export type ModuleMeta = { slug: string; num: number; title: string; parts: string[] };

export type ExamMeta = {
  title: string;
  when: string;
  rooms: string[];
  minutes: number;
};

export type SubjectMeta = {
  slug: string;
  code: string;
  title: string;
  blurb: string;
  modules: ModuleMeta[];
  exam?: ExamMeta;
};
