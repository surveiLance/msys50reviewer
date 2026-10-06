import Link from "next/link";
import type { SubjectMeta } from "@/lib/types";
import { STEPS, type View } from "./SubjectNav";

/** "Next step" link at the end of a module view: notes → flashcards → practice test → next module (or the mock exam). */
export default function NextStep({ subject, module, view }: { subject: SubjectMeta; module: string; view: View }) {
  const base = `/${subject.slug}`;
  const mi = subject.modules.findIndex((m) => m.slug === module);
  const si = STEPS.findIndex((s) => s.view === view);
  let href: string, label: string, hint: string;
  if (si < STEPS.length - 1) {
    const s = STEPS[si + 1];
    href = `${base}/${module}${s.path}`;
    label = `Step ${si + 2}: ${s.label}`;
    hint = view === "notes" ? "Drill the key terms from these notes." : "Test yourself on this module.";
  } else if (mi < subject.modules.length - 1) {
    const m = subject.modules[mi + 1];
    href = `${base}/${m.slug}`;
    label = `Module ${m.num}: ${m.title}`;
    hint = "On to the next module's notes.";
  } else if (subject.exam) {
    href = `${base}/midterm`;
    label = `Mock ${subject.exam.title.toLowerCase()}`;
    hint = "You've covered every module. Try the full mock exam.";
  } else {
    return null;
  }
  return (
    <Link href={href} className="next-step">
      <span className="eyebrow">Next</span>
      <b>{label} →</b>
      <span>{hint}</span>
    </Link>
  );
}
