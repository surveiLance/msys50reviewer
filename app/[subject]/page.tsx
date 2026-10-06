import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav, { STEPS } from "@/components/SubjectNav";
import RecordStrip from "@/components/RecordStrip";
import { SUBJECTS, getSubject } from "@/lib/subjects";

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
      <header className="top">
        <div className="eyebrow">{subject.code}</div>
        <h1>{subject.title} <span>Reviewer</span></h1>
        <p className="lede">{subject.blurb}</p>
      </header>
      <SubjectNav subject={subject} active={{}} />

      <ol className="howto" aria-label="How to use this reviewer">
        <li><b>Study each module</b><span>Read the notes, drill the flashcards, then take the practice test.</span></li>
        {subject.exam && <li><b>Take the mock {subject.exam.title.toLowerCase()}</b><span>All modules mixed, timed or untimed, with new questions every time.</span></li>}
        <li><b>Check My Scores</b><span>See your progress and which module to review next.</span></li>
      </ol>

      <div className="module-grid">
        {subject.modules.map((m) => (
          <article key={m.slug} className="module-card">
            <span className="eyebrow">Module {m.num}</span>
            <h2 className="module-title">{m.title}</h2>
            <ul className="module-parts">{m.parts.map((p) => <li key={p}>{p}</li>)}</ul>
            <div className="module-rec"><span>Practice test</span><RecordStrip subject={subject.slug} kind="practice" module={m.slug} compact /></div>
            <div className="module-links">
              {STEPS.map((st, i) => (
                <Link key={st.view} href={`${base}/${m.slug}${st.path}`} className={"btn" + (i === 0 ? " primary" : "")}>
                  <span className="step-n">{i + 1}</span>{st.label}
                </Link>
              ))}
            </div>
          </article>
        ))}
        {subject.exam && (
          <article className="module-card exam-card">
            <span className="eyebrow">{subject.exam.title}</span>
            <h2 className="module-title">{subject.exam.when}</h2>
            <ul className="module-parts">{subject.exam.rooms.map((r) => <li key={r}>{r}</li>)}</ul>
            <div className="module-rec"><span>Mock exam</span><RecordStrip subject={subject.slug} kind="midterm" compact /></div>
            <div className="module-links">
              <Link href={`${base}/midterm`} className="btn primary">Take the mock {subject.exam.title.toLowerCase()}</Link>
              <Link href={`${base}/scores`} className="btn">My scores</Link>
            </div>
          </article>
        )}
      </div>
    </>
  );
}
