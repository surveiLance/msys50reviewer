import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav from "@/components/SubjectNav";
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

      <div className="module-grid">
        {subject.modules.map((m) => (
          <article key={m.slug} className="module-card">
            <span className="eyebrow">Module {m.num}</span>
            <h2 className="module-title">{m.title}</h2>
            <ul className="module-parts">{m.parts.map((p) => <li key={p}>{p}</li>)}</ul>
            <div className="module-links">
              <Link href={`${base}/${m.slug}`} className="btn primary">Notes</Link>
              <Link href={`${base}/${m.slug}/flashcards`} className="btn">Flashcards</Link>
              <Link href={`${base}/${m.slug}/test`} className="btn">Practice test</Link>
            </div>
          </article>
        ))}
        {subject.exam && (
          <article className="module-card exam-card">
            <span className="eyebrow">{subject.exam.title}</span>
            <h2 className="module-title">{subject.exam.when}</h2>
            <ul className="module-parts">{subject.exam.rooms.map((r) => <li key={r}>{r}</li>)}</ul>
            <div className="module-links">
              <Link href={`${base}/midterm`} className="btn primary">Take the mock {subject.exam.title.toLowerCase()}</Link>
            </div>
          </article>
        )}
      </div>
    </>
  );
}
