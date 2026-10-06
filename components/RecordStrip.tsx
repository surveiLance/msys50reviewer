"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SCORES_EVENT, loadAttempts, pct, type Attempt } from "@/lib/scores";

/** Small "your record" line: attempts, best, and latest score for the midterm or one module's practice tests. */
export default function RecordStrip({ subject, kind, module, compact }: { subject: string; kind: Attempt["kind"]; module?: string; compact?: boolean }) {
  const [list, setList] = useState<Attempt[] | null>(null);

  useEffect(() => {
    const read = () => setList(loadAttempts(subject).filter((a) => a.kind === kind && (!module || a.module === module)));
    read();
    window.addEventListener(SCORES_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(SCORES_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, [subject, kind, module]);

  if (!list) return null;
  if (!list.length) {
    return compact ? <span className="rec-none">Not tried yet</span> : null;
  }
  const best = Math.max(...list.map((a) => pct(a.score, a.max)));
  const last = list[list.length - 1];
  if (compact) {
    return <span className="rec-compact">Best {best}% · Last {pct(last.score, last.max)}%</span>;
  }
  return (
    <div className="rec-strip">
      <div><b>{list.length}</b><span>attempt{list.length === 1 ? "" : "s"}</span></div>
      <div><b>{best}%</b><span>best</span></div>
      <div><b>{pct(last.score, last.max)}%</b><span>latest</span></div>
      <Link href={`/${subject}/scores`}>See all scores →</Link>
    </div>
  );
}
