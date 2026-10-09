import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav from "@/components/SubjectNav";
import RecordStrip from "@/components/RecordStrip";
import { SUBJECTS, getSubject, getSubjectData } from "@/lib/subjects";
import { listTests } from "@/lib/tests";
import { studyGroups } from "@/lib/studyStructure";

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subject: s.slug }));
}

type P = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const s = getSubject((await params).subject);
  return { title: s ? `${s.code} Tests` : "Tests" };
}

/** Test hub: pick a module test or the midterm. */
export default async function TestsPage({ params }: P) {
  const slug = (await params).subject;
  const subject = getSubject(slug);
  const data = getSubjectData(slug);
  if (!subject || !data) notFound();
  const tests = listTests(subject, data);
  return (
    <>
      <SubjectNav subject={subject} active={{ test: true }} />
      <div className="mod-head">
        <div className="eyebrow">{subject.code} · Practice</div>
        <h1 className="study-page-title">Practice tests</h1>
        <p>Choose a module below, then pick your question types and length. Finished tests appear in Scores &amp; history above.</p>
      </div>
      {studyGroups(subject).map(group => {
        const items = tests.filter(t => t.kind === "module" && group.modules.some(m => m.slug === t.slug));
        if (!items.length) return null;
        return <section className="study-section" key={group.id} aria-labelledby={`tests-${group.id}`}>
          <h2 id={`tests-${group.id}`}>{group.title}</h2>
      <div className="test-list">
        {items.map((t) => (
          <Link key={t.slug} href={`/${subject.slug}/test/${t.slug}`} className={"test-item" + (t.kind === "midterm" ? " exam" : "")}>
            <b>{t.title}</b>
            <span className="meta">{t.subtitle}</span>
            <span className="meta">
              {t.bank} original questions{t.alternativeBank ? ` · ${t.alternativeBank} alternative` : ""}{t.scenarioBank ? ` · ${t.scenarioBank} scenarios` : ""} · pick a set, types, and length
            </span>
            <RecordStrip subject={subject.slug} kind={t.kind === "midterm" ? "midterm" : "practice"} module={t.kind === "module" ? t.slug : undefined} compact />
            <span className="go">Start →</span>
          </Link>
        ))}
      </div>
        </section>;
      })}
      {tests.some(t => t.kind === "midterm") && <section className="study-section" aria-labelledby="review-exams"><h2 id="review-exams">Review exams</h2><p className="inst">Revisit earlier coverage without mixing in newer modules.</p><div className="test-list">{tests.filter(t => t.kind === "midterm").map(t => <Link key={t.slug} href={`/${subject.slug}/test/${t.slug}`} className="test-item exam"><b>{t.title}</b><span className="meta">{t.subtitle}</span><span className="meta">{t.bank} questions · original, alternative, and scenario practice</span><RecordStrip subject={subject.slug} kind="midterm" compact /><span className="go">Start →</span></Link>)}</div></section>}
      {subject.finals && !subject.modules.some(m => m.period === "finals") && <aside className="study-upcoming"><span className="study-badge">Coming next</span><h2>Finals quizzes</h2><p>Module 4 and later quizzes will appear here when ready.</p><p className="inst">{subject.finals.when}. Coverage and lessons are not published yet.</p></aside>}
    </>
  );
}
