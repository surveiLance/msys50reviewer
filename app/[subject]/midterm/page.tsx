import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav from "@/components/SubjectNav";
import PracticeTest from "@/components/PracticeTest";
import RecordStrip from "@/components/RecordStrip";
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
  const mtfCount = data.midterm.mtf.reduce((a, d) => a + d.n, 0);
  const secCount = data.midterm.secs.reduce((a, s) => a + (s.kind === "mc" && s.draw ? s.draw.reduce((x, d) => x + d.n, 0) : (s.items?.length ?? 0)), 0);
  // The clue sheet brings its own heading; the fold-out supplies one instead.
  const clues = readContent(subject.slug, "clues.html").replace(/^<h3[^>]*>.*?<\/h3>/, "");
  return (
    <>
      <SubjectNav subject={subject} active={{ exam: true }} />
      <div className="mod-head">
        <div className="eyebrow">Mock exam</div>
        <h2>Mock {exam.title}</h2>
        <p>Practice the real thing: every module, mixed. The actual exam is <b>{exam.when}</b> ({exam.rooms.join(" · ")}).</p>
      </div>
      <div className="mid-facts">
        <div><b>{mtfCount + secCount} items</b><span>{mtfCount} true or false, plus matching, multiple choice, and case scenarios</span></div>
        <div><b>{exam.minutes} minutes</b><span>If you choose timed: 60 minutes plus a 15-minute buffer, like the real exam</span></div>
        <div><b>New every time</b><span>Questions are drawn fresh from all modules, so retakes stay useful</span></div>
      </div>
      <RecordStrip subject={subject.slug} kind="midterm" />
      {clues && (
        <details className="fold">
          <summary>
            <span className="eyebrow">Read before you start</span>
            <b>Scenario clue sheet</b>
          </summary>
          <div className="sub fold-body" dangerouslySetInnerHTML={{ __html: clues }} />
        </details>
      )}
      <div className="sub">
        <PracticeTest
          subject={subject.slug}
          midterm={data.midterm}
          pools={data.pools}
          scenarios={data.scenarios}
          storageKey={`mid-${subject.slug}`}
          timerMinutes={exam.minutes}
          showModules
        />
      </div>
    </>
  );
}
