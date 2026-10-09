import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav from "@/components/SubjectNav";
import ScoresView from "@/components/ScoresView";
import { SUBJECTS, getSubject } from "@/lib/subjects";

export const dynamicParams = false;
export function generateStaticParams() { return SUBJECTS.map(s => ({ subject: s.slug })); }
type P = { params: Promise<{ subject: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const subject = getSubject((await params).subject);
  return { title: subject ? `${subject.code} Scores & history` : "Scores & history" };
}
export default async function ScoresPage({ params }: P) {
  const subject = getSubject((await params).subject);
  if (!subject) notFound();
  return <><SubjectNav subject={subject} active={{ scores: true }} />
    <div className="mod-head"><div className="eyebrow">{subject.code} · Test progress</div><h1 className="study-page-title">Scores &amp; history</h1><p>Your completed tests, saved answers, and progress—all in one place. Scores remain saved in this browser.</p></div>
    <div className="sub"><ScoresView subject={subject} /></div>
  </>;
}
