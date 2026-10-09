import Link from "next/link";
import type { SubjectMeta } from "@/lib/types";
import ModuleSwitcher from "./ModuleSwitcher";

export type View = "notes" | "flashcards";
type Active = { modules?: boolean; module?: string; view?: View; test?: boolean; scores?: boolean; battle?: boolean };

/** Stable top-level sections; the number of modules no longer crowds navigation. */
export default function SubjectNav({ subject, active }: { subject: SubjectMeta; active: Active }) {
  const base = `/${subject.slug}`;
  const mod = subject.modules.find((m) => m.slug === active.module);
  return (
    <>
      <nav className="tabs" aria-label={`${subject.code} sections`}>
        <Link href={base} aria-current={active.modules ? "page" : mod ? "location" : undefined}>Modules</Link>
        <Link href={`${base}/test`} aria-current={active.test || active.scores ? "location" : undefined}>Test</Link>
        <Link href={`${base}/battle`} aria-current={active.battle ? "page" : undefined}>Battle</Link>
      </nav>
      {(active.test || active.scores) && <nav className="subnav test-tools hide-in-quiz" aria-label={`${subject.code} test tools`}>
        <Link href={`${base}/test`} aria-current={active.test && !active.scores ? "page" : undefined}>Practice tests</Link>
        <Link href={`${base}/test/scores`} aria-current={active.scores ? "page" : undefined}>Scores &amp; history</Link>
      </nav>}

      {mod && (
        <>
          <ModuleSwitcher subject={subject.slug} modules={subject.modules} current={mod.slug} />
          <div className="mod-head">
            <div className="eyebrow">Module {mod.num}</div>
            <h1 className="study-page-title">{mod.title}</h1>
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
