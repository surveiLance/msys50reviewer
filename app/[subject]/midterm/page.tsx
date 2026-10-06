import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav from "@/components/SubjectNav";
import Quiz from "@/components/Quiz";
import { SUBJECTS, getSubject, getSubjectData } from "@/lib/subjects";
import { readContent } from "@/lib/content";

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.filter((s) => s.exam).map((s) => ({ subject: s.slug }));
}

type P = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const s = getSubject((await params).subject);
  return { title: s ? `${s.code} Mock ${s.exam?.title ?? "Exam"}` : "Mock Exam" };
}

export default async function MidtermPage({ params }: P) {
  const sSlug = (await params).subject;
  const subject = getSubject(sSlug);
  const data = getSubjectData(sSlug);
  if (!subject || !subject.exam || !data) notFound();
  const exam = subject.exam;
  // The clue sheet brings its own heading; the fold-out supplies one instead.
  const clues = readContent(subject.slug, "clues.html").replace(/^<h3[^>]*>.*?<\/h3>/, "");
  return (
    <>
      <SubjectNav subject={subject} active={{ exam: true }} />
      <div className="mod-head">
        <h2>Mock {exam.title.toLowerCase()}</h2>
        <p>The real exam: <b>{exam.when}</b> · {exam.rooms.join(" · ")}</p>
      </div>
      <div className="sub">
        <Quiz
          mode="exam"
          subject={subject.slug}
          midterm={data.midterm}
          pools={data.pools}
          scenarios={data.scenarios}
          storageKey={`mid-${subject.slug}`}
          timerMinutes={exam.minutes}
          examName={`Mock ${exam.title.toLowerCase()}`}
        />
      </div>
      {clues && (
        <details className="fold hide-in-quiz">
          <summary>
            <b>Scenario clue sheet</b>
            <span>Tips for spotting the concept hidden in a case scenario. Worth a read before you start.</span>
          </summary>
          <div className="sub fold-body" dangerouslySetInnerHTML={{ __html: clues }} />
        </details>
      )}
    </>
  );
}
