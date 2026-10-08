import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav from "@/components/SubjectNav";
import RecordStrip from "@/components/RecordStrip";
import { SUBJECTS, getSubject, getSubjectData } from "@/lib/subjects";
import { listTests } from "@/lib/tests";

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
        <h2>Take a test</h2>
        <p>Pick a module, or the midterm for every module mixed. Choose the question types and length; tests work like Canvas, one question at a time.</p>
      </div>
      <div className="test-list">
        {tests.map((t) => (
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
    </>
  );
}
