import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav from "@/components/SubjectNav";
import Quiz from "@/components/Quiz";
import { SUBJECTS, getSubject, getSubjectData } from "@/lib/subjects";
import { readContent } from "@/lib/content";
import { listTests } from "@/lib/tests";

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.flatMap((s) => {
    const data = getSubjectData(s.slug);
    return data ? listTests(s, data).map((t) => ({ subject: s.slug, test: t.slug })) : [];
  });
}

type P = { params: Promise<{ subject: string; test: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { subject: sSlug, test } = await params;
  const s = getSubject(sSlug);
  const data = getSubjectData(sSlug);
  const t = s && data ? listTests(s, data).find((x) => x.slug === test) : undefined;
  return { title: s && t ? `${s.code} ${t.title}` : "Test" };
}

export default async function TestPage({ params }: P) {
  const { subject: sSlug, test } = await params;
  const subject = getSubject(sSlug);
  const data = getSubjectData(sSlug);
  if (!subject || !data) notFound();
  const info = listTests(subject, data).find((t) => t.slug === test);
  if (!info) notFound();

  if (info.kind === "midterm") {
    // The clue sheet brings its own heading; the fold-out supplies one instead.
    const clues = readContent(subject.slug, "clues.html").replace(/^<h3[^>]*>.*?<\/h3>/, "");
    return (
      <>
        <SubjectNav subject={subject} active={{ test: true }} />
        <div className="mod-head">
          <h2>{info.title}</h2>
          <p>{info.subtitle}</p>
        </div>
        <div className="sub">
          <Quiz
            kind="midterm"
            title={info.title}
            subject={subject.slug}
            storageKey={`mid-${subject.slug}`}
            midterm={data.midterm}
            pools={data.pools}
            scenarios={data.scenarios}
            tests={data.tests}
            timerMinutes={subject.exam?.minutes}
            modules={subject.modules.map((m) => m.slug)}
          multi={data.multi}
          blanks={data.blanks}
          />
        </div>
        {clues && (
          <details className="fold hide-in-quiz">
            <summary>
              <b>Scenario clue sheet</b>
              <span>Tips for spotting the concept hidden in a case scenario. Read it before you start.</span>
            </summary>
            <div className="sub fold-body" dangerouslySetInnerHTML={{ __html: clues }} />
          </details>
        )}
      </>
    );
  }

  const sets = data.tests[info.slug] || {};
  return (
    <>
      <SubjectNav subject={subject} active={{ test: true }} />
      <div className="mod-head">
        <h2>{info.title}</h2>
        <p>{info.subtitle}</p>
      </div>
      <div className="sub">
        <Quiz
          kind="module"
          title={info.title}
          subject={subject.slug}
          storageKey={`test-${subject.slug}-${info.slug}`}
          module={info.slug}
          sets={sets}
          modules={subject.modules.map((m) => m.slug)}
          multi={data.multi}
          blanks={data.blanks}
        />
      </div>
    </>
  );
}
