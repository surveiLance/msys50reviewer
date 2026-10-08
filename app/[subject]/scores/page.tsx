import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav from "@/components/SubjectNav";
import ScoresView from "@/components/ScoresView";
import { SUBJECTS, getSubject } from "@/lib/subjects";

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subject: s.slug }));
}

type P = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const s = getSubject((await params).subject);
  return { title: s ? `${s.code} My scores` : "My scores" };
}

export default async function ScoresPage({ params }: P) {
  const subject = getSubject((await params).subject);
  if (!subject) notFound();
  return (
    <>
      <SubjectNav subject={subject} active={{ scores: true }} />
      <div className="mod-head">
        <div className="eyebrow">{subject.code} · Progress</div>
        <h2>My scores</h2>
        <p>See your progress, revisit answers from completed tests, and find where to focus next.</p>
      </div>
      <div className="sub">
        <ScoresView subject={subject} />
      </div>
    </>
  );
}
