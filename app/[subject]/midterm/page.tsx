import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav from "@/components/SubjectNav";
import PracticeTest from "@/components/PracticeTest";
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
  const clues = readContent(subject.slug, "clues.html");
  return (
    <>
      <SubjectNav subject={subject} active={{ exam: true }} />
      <div className="mod-head">
        <div className="eyebrow">Mock exam</div>
        <h2>{exam.title} Practice</h2>
        <p><b>{exam.when}.</b> {exam.rooms.join(" · ")}. This mock mixes every module.</p>
      </div>
      <div className="mid-facts">
        <div><b>{mtfCount + secCount} items</b><span>{mtfCount} true or false, plus matching, multiple choice, and case scenarios</span></div>
        <div><b>{exam.minutes} minutes</b><span>Optional timer: the real exam is 60 minutes plus a 15-minute buffer</span></div>
        <div><b>New each retake</b><span>True-or-false items and scenarios are drawn fresh from all modules</span></div>
      </div>
      {clues && <div className="sub" dangerouslySetInnerHTML={{ __html: clues }} />}
      <div className="sub">
        <PracticeTest
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
