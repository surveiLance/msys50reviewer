import Link from "next/link";
import type { SubjectMeta } from "@/lib/types";
import type { View } from "./SubjectNav";

/** End of a module's notes or flashcards: take this module's test, the midterm, or switch study mode. */
export default function NextStep({ subject, module, view }: { subject: SubjectMeta; module: string; view: View }) {
  const base = `/${subject.slug}`;
  const m = subject.modules.find((x) => x.slug === module);
  if (!m) return null;
  return (
    <section className="whats-next" aria-labelledby="whats-next-h">
      <h3 id="whats-next-h">{view === "notes" ? `Done reviewing Module ${m.num}?` : "Ready to test yourself?"}</h3>
      <p>Check what stuck with a test, Canvas-style.</p>
      <div className="next-grid">
        <Link href={`${base}/test/${m.slug}`} className="next-opt main">
          <b>Take the Module {m.num} test →</b>
          <span>Only this module</span>
        </Link>
        {subject.exam && (
          <Link href={`${base}/test/midterm`} className="next-opt">
            <b>Take the {subject.exam.title.toLowerCase()} test →</b>
            <span>Every module, mixed</span>
          </Link>
        )}
        {view === "notes" ? (
          <Link href={`${base}/${m.slug}/flashcards`} className="next-opt">
            <b>Practice with flashcards</b>
            <span>Drill this module&apos;s key terms</span>
          </Link>
        ) : (
          <Link href={`${base}/${m.slug}`} className="next-opt">
            <b>Back to the notes</b>
            <span>Module {m.num}: {m.title}</span>
          </Link>
        )}
      </div>
    </section>
  );
}
