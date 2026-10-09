import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav from "@/components/SubjectNav";
import RecordStrip from "@/components/RecordStrip";
import { SUBJECTS, getSubject } from "@/lib/subjects";
import { studyGroups } from "@/lib/studyStructure";

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subject: s.slug }));
}

type P = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const s = getSubject((await params).subject);
  return { title: s ? `${s.code} ${s.title}` : "Subject" };
}

export default async function SubjectPage({ params }: P) {
  const subject = getSubject((await params).subject);
  if (!subject) notFound();
  const base = `/${subject.slug}`;
  return (
    <>
      <SubjectNav subject={subject} active={{ modules: true }} />
      <header className="top">
        <div className="eyebrow">{subject.code}</div>
        <h1>{subject.title}</h1>
        <p className="lede">{subject.blurb}</p>
      </header>

      <nav className="study-shortcuts" aria-label="Study shortcuts">
        <a href="#available-modules"><b>Study a module</b><span>Notes and flashcards ↓</span></a>
        <Link href={`${base}/test`}><b>Practice tests</b><span>Choose a module or review exam →</span></Link>
        <Link href={`${base}/test/scores`}><b>Scores &amp; history</b><span>Review your completed attempts →</span></Link>
      </nav>
      <div id="available-modules" className="study-modules">
      {studyGroups(subject).filter(group => group.modules.length).map(group => <section className="study-section" key={group.id} aria-labelledby={`group-${group.id}`}>
        <div className="study-section-heading"><div><span className="eyebrow">{group.id === "midterm" ? "Foundation · still available" : "Next chapter"}</span><h2 id={`group-${group.id}`}>{group.title}</h2></div><span className="study-badge">{group.modules.length} modules available</span></div>
        <p className="inst">{group.id === "midterm" ? "Keep your Modules 1–3 notes, flashcards, and practice here. Your saved progress stays with you." : "Review the newer lessons here, one module at a time."}</p>
        <div className="module-grid">
        {group.modules.map((m) => (
          <article key={m.slug} className="module-card">
            <span className="eyebrow">Module {m.num}</span>
            <h3 className="module-title">{m.title}</h3>
            <ul className="module-parts">{m.parts.map((p) => <li key={p}>{p}</li>)}</ul>
            <div className="module-rec"><span>Module test</span><RecordStrip subject={subject.slug} kind="practice" module={m.slug} compact /></div>
            <div className="module-links">
              <Link href={`${base}/${m.slug}`} className="btn primary">Notes</Link>
              <Link href={`${base}/${m.slug}/flashcards`} className="btn">Flashcards</Link>
              <Link href={`${base}/test/${m.slug}`} className="btn">Test</Link>
            </div>
          </article>
        ))}
        </div>
      </section>)}
      </div>
      {subject.finals && !subject.modules.some(m => m.period === "finals") && <section className="study-upcoming" aria-labelledby="finals-heading">
        <span className="study-badge">Coming next · not available yet</span><h2 id="finals-heading">Finals preparation</h2><p className="inst">{subject.finals.when}</p><p>{subject.finals.description}</p>
        <p className="inst">Module 4 and later lessons will have their own Notes, Flashcards, and Test links when ready. Nothing to unlock or sign up for.</p>
      </section>}
      {subject.exam && <aside className="study-exam"><div><h2>Revisit the midterm</h2><p className="inst">Modules 1–3 mixed · kept separate from future finals coverage.</p></div><Link href={`${base}/test/midterm`} className="btn">Midterm practice →</Link></aside>}
    </>
  );
}
