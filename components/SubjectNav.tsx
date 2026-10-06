import Link from "next/link";
import type { SubjectMeta } from "@/lib/types";

type Active = { module?: string; view?: "notes" | "flashcards" | "test"; exam?: boolean; scores?: boolean };

/** Module tabs (Module 1 · 2 · 3 · Midterm · My Scores) plus the Notes / Flashcards / Practice test switch. */
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
          <Link href={`${base}/midterm`} aria-current={active.exam ? "page" : undefined}>{subject.exam.title}</Link>
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
          <nav className="subnav" aria-label={`Module ${mod.num} views`}>
            <Link href={`${base}/${mod.slug}`} aria-current={active.view === "notes" ? "page" : undefined}>Notes</Link>
            <Link href={`${base}/${mod.slug}/flashcards`} aria-current={active.view === "flashcards" ? "page" : undefined}>Flashcards</Link>
            <Link href={`${base}/${mod.slug}/test`} aria-current={active.view === "test" ? "page" : undefined}>Practice test</Link>
          </nav>
        </>
      )}
    </>
  );
}
