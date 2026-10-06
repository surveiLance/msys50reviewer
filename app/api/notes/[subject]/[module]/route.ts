import { NextResponse } from "next/server";
import { SUBJECTS } from "@/lib/subjects";
import { readNotes } from "@/lib/notes";

// Built once at deploy time: the "Review in notes" window loads a module's notes from here.
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.flatMap((s) => s.modules.map((m) => ({ subject: s.slug, module: m.slug })));
}

export async function GET(_req: Request, { params }: { params: Promise<{ subject: string; module: string }> }) {
  const { subject, module } = await params;
  return NextResponse.json(readNotes(subject, module));
}
