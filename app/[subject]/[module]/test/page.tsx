import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav from "@/components/SubjectNav";
import NextStep from "@/components/NextStep";
import PracticeTest from "@/components/PracticeTest";
import { SUBJECTS, getSubject, getSubjectData } from "@/lib/subjects";

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.flatMap((s) => s.modules.map((m) => ({ subject: s.slug, module: m.slug })));
}

type P = { params: Promise<{ subject: string; module: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { subject, module: modSlug } = await params;
  const s = getSubject(subject);
  const m = s?.modules.find((x) => x.slug === modSlug);
  return { title: s && m ? `${s.code} Module ${m.num} Practice Test` : "Practice Test" };
}

export default async function TestPage({ params }: P) {
  const { subject: sSlug, module: mSlug } = await params;
  const subject = getSubject(sSlug);
  const mod = subject?.modules.find((m) => m.slug === mSlug);
  const data = getSubjectData(sSlug);
  if (!subject || !mod || !data) notFound();
  const sets = data.tests[mod.slug] || {};
  const order = Object.keys(sets);
  const labels = data.setLabels[mod.slug] || Object.fromEntries(order.map((k) => [k, order.length > 1 ? `Set ${k}` : "Slide-based"]));
  return (
    <>
      <SubjectNav subject={subject} active={{ module: mod.slug, view: "test" }} />
      <div className="sub">
        <PracticeTest
          subject={subject.slug}
          module={mod.slug}
          sets={sets}
          order={order}
          labels={labels}
          defaultSet={data.defaultSet[mod.slug] || order[0]}
          storageKey={`test-${subject.slug}-${mod.slug}`}
        />
      </div>
      <NextStep subject={subject} module={mod.slug} view="test" />
    </>
  );
}
