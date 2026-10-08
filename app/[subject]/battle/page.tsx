import { notFound } from "next/navigation";
import SubjectNav from "@/components/SubjectNav";
import Battle from "@/components/Battle";
import { SUBJECTS, getSubject } from "@/lib/subjects";

export const dynamicParams = false;
export const metadata = { title: "Quiz Battle" };
export function generateStaticParams() { return SUBJECTS.map((s) => ({ subject: s.slug })); }

export default async function BattlePage({ params }: { params: Promise<{ subject: string }> }) {
  const subject = getSubject((await params).subject);
  if (!subject || subject.slug !== "msys-50") notFound();
  return <><SubjectNav subject={subject} active={{ battle: true }} /><div className="mod-head"><div className="eyebrow">MSYS 50 · Party arena</div><h2>Quiz battle</h2><p>1v1 or a group fight. Find a party, get approved, and play with your leader’s chosen scoring rules.</p></div><Battle /></>;
}
