import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav from "@/components/SubjectNav";
import Flashcards from "@/components/Flashcards";
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
  return { title: s && m ? `${s.code} Module ${m.num} Flashcards` : "Flashcards" };
}

export default async function FlashcardsPage({ params }: P) {
  const { subject: sSlug, module: mSlug } = await params;
  const subject = getSubject(sSlug);
  const mod = subject?.modules.find((m) => m.slug === mSlug);
  const data = getSubjectData(sSlug);
  if (!subject || !mod || !data) notFound();
  return (
    <>
      <SubjectNav subject={subject} active={{ module: mod.slug, view: "flashcards" }} />
      <div className="sub">
        <Flashcards cards={data.cards[mod.slug] || []} storageKey={`known-${subject.slug}-${mod.slug}`} />
      </div>
    </>
  );
}
