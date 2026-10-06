import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubjectNav from "@/components/SubjectNav";
import NotesBody from "@/components/NotesBody";
import { SUBJECTS, getSubject } from "@/lib/subjects";
import { readContent } from "@/lib/content";

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.flatMap((s) => s.modules.map((m) => ({ subject: s.slug, module: m.slug })));
}

type P = { params: Promise<{ subject: string; module: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { subject, module: modSlug } = await params;
  const s = getSubject(subject);
  const m = s?.modules.find((x) => x.slug === modSlug);
  return { title: s && m ? `${s.code} Module ${m.num} Notes` : "Notes" };
}

export default async function NotesPage({ params }: P) {
  const { subject: sSlug, module: mSlug } = await params;
  const subject = getSubject(sSlug);
  const mod = subject?.modules.find((m) => m.slug === mSlug);
  if (!subject || !mod) notFound();
  const html = readContent(subject.slug, `${mod.slug}.html`);
  return (
    <>
      <SubjectNav subject={subject} active={{ module: mod.slug, view: "notes" }} />
      <NotesBody html={html} />
    </>
  );
}
