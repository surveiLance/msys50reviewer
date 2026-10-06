import Link from "next/link";
import type { SubjectMeta } from "@/lib/types";

export type View = "notes" | "flashcards" | "test";
type Active = { module?: string; view?: View; exam?: boolean; scores?: boolean };

/** The three study steps inside a module, in the order we suggest doing them. */
export const STEPS: { view: View; label: string; short: string; path: string }[] = [
  { view: "notes", label: "Notes", short: "Notes", path: "" },
  { view: "flashcards", label: "Flashcards", short: "Flashcards", path: "/flashcards" },
  { view: "test", label: "Practice test", short: "Test", path: "/test" },
];

/** Section tabs (Module 1 · 2 · 3 · Midterm · My Scores) plus the numbered study steps inside a module. */
export default function SubjectNav({ subject, active }: { subject: SubjectMeta; active: Active }) {
  const base = `/${subject.slug}`;
  const mod = subject.modules.find((m) => m.slug === active.module);
  return (
    <>
      <nav className="tabs" aria-label={`${subject.code} sections`}>
        {subject.modules.map((m) => (
          <Link key={m.slug} href={`${base}/${m.slug}`} aria-current={m.slug === active.module ? "page" : undefined}>
            <span className="lg">Module </span><span className="sm">M</span>{m.num}
          </Link>
        ))}
        {subject.exam && (
          <Link href={`${base}/midterm`} className="tab-exam" aria-current={active.exam ? "page" : undefined}>{subject.exam.title}</Link>
        )}
        <Link href={`${base}/scores`} aria-current={active.scores ? "page" : undefined}>
          <span className="lg">My </span>Scores
        </Link>
      </nav>

      {mod && (
        <>
          <div className="mod-head">
            <div className="eyebrow">{subject.code} · Module {mod.num}</div>
            <h2>{mod.title}</h2>
            <p>{mod.parts.join(" · ")}</p>
          </div>
          <nav className="subnav steps" aria-label={`Module ${mod.num} study steps`}>
            {STEPS.map((s, i) => (
              <Link key={s.view} href={`${base}/${mod.slug}${s.path}`} aria-current={active.view === s.view ? "page" : undefined}>
                <span className="step-n">{i + 1}</span><span className="lg">{s.label}</span><span className="sm">{s.short}</span>
              </Link>
            ))}
          </nav>
        </>
      )}
    </>
  );
}
