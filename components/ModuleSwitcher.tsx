"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ModuleMeta } from "@/lib/types";

export default function ModuleSwitcher({ subject, modules, current }: { subject: string; modules: ModuleMeta[]; current: string }) {
  const router = useRouter();
  return <div className="module-switcher hide-in-quiz">
    <Link href={`/${subject}`}>← All modules</Link>
    <label>Jump to module<select value={current} onChange={e => router.push(`/${subject}/${e.target.value}`)}>{modules.map(m => <option key={m.slug} value={m.slug}>Module {m.num} · {m.title}</option>)}</select></label>
  </div>;
}
