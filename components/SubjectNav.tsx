import Link from "next/link";
import type { SubjectMeta } from "@/lib/types";

export type View = "notes" | "flashcards";
type Active = { module?: string; view?: View; test?: boolean; scores?: boolean; battle?: boolean };

/** Section tabs (Module 1 · 2 · 3 · Test · Scores), plus Notes / Flashcards inside a module. */
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
        <Link href={`${base}/test`} aria-current={active.test ? "page" : undefined}>Test</Link>
        <Link href={`${base}/scores`} aria-current={active.scores ? "page" : undefined}>Scores</Link>
        <Link href={`${base}/battle`} aria-current={active.battle ? "page" : undefined}>Battle</Link>
      </nav>

      {mod && (
        <>
          <div className="mod-head">
            <div className="eyebrow">Module {mod.num}</div>
            <h2>{mod.title}</h2>
            <p>{mod.parts.join(" · ")}</p>
          </div>
          <nav className="subnav" aria-label={`Module ${mod.num} views`}>
            <Link href={`${base}/${mod.slug}`} aria-current={active.view === "notes" ? "page" : undefined}>Notes</Link>
            <Link href={`${base}/${mod.slug}/flashcards`} aria-current={active.view === "flashcards" ? "page" : undefined}>Flashcards</Link>
          </nav>
        </>
      )}
    </>
  );
}
