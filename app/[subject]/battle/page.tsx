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
  return <><SubjectNav subject={subject} active={{ battle: true }} /><div className="mod-head"><div className="eyebrow">MSYS 50 · Play with friends</div><h2>Quiz battle</h2><p>Choose your nickname, find your friend’s party, and request to join. No room code needed.</p></div><Battle /></>;
}
