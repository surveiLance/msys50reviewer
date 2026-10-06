import Link from "next/link";
import { SUBJECTS } from "@/lib/subjects";

export default function Home() {
  return (
    <>
      <header className="top">
        <div className="eyebrow">Study reviewers</div>
        <h1>Pick a <span>subject</span></h1>
        <p className="lede">Notes, flashcards, and practice tests built from class slides, guide questions, and lecture notes.</p>
      </header>
      <div className="subject-grid">
        {SUBJECTS.map((s) => (
          <Link key={s.slug} href={`/${s.slug}`} className="subject-card">
            <span className="eyebrow">{s.code}</span>
            <span className="subject-title">{s.title}</span>
            <span className="subject-blurb">{s.blurb}</span>
            <span className="subject-meta">{s.modules.length} modules{s.exam ? ` · ${s.exam.title}: ${s.exam.when}` : ""}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
