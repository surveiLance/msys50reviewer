"use client";

import { useEffect, useRef, useState } from "react";
import type { NotePart } from "@/lib/notes";
import type { Answer, Question } from "@/lib/questions";
import { type Peek, findSection, highlightTerms, peekTarget, plainText } from "@/lib/peek";

const cache = new Map<string, Promise<NotePart[]>>();
const loadModule = (subject: string, module: string) => {
  const key = `${subject}/${module}`;
  if (!cache.has(key)) cache.set(key, fetch(`/api/notes/${key}`).then((r) => (r.ok ? r.json() : [])));
  return cache.get(key)!;
};

/** Wraps each occurrence of the terms in <mark>, inside text only (never inside tags). */
function markTerms(root: HTMLElement, terms: string[]) {
  const list = terms.map((t) => t.trim()).filter((t) => t.length >= 3);
  if (!list.length) return;
  const re = new RegExp(`(${list.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) {
    const n = walker.currentNode as Text;
    if (!n.parentElement?.closest("mark")) nodes.push(n);
  }
  for (const node of nodes) {
    const text = node.nodeValue || "";
    if (!re.test(text)) continue;
    re.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of text.matchAll(re)) {
      frag.append(text.slice(last, m.index), Object.assign(document.createElement("mark"), { className: "peek-hl", textContent: m[0] }));
      last = (m.index ?? 0) + m[0].length;
    }
    frag.append(text.slice(last));
    node.replaceWith(frag);
  }
}

/** "Review in notes" without leaving the results: the best-matching notes section in a window, with a link to the full notes. */
export default function NotesPeek({
  subject, question, answer, fallbackModule, allModules, onClose,
}: {
  subject: string;
  question: Question;
  answer?: Answer;
  fallbackModule?: string;
  allModules: string[];
  onClose: () => void;
}) {
  const [peek, setPeek] = useState<Peek | null | "loading">("loading");
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let live = true;
    const { modules, partId } = peekTarget(question, fallbackModule, allModules);
    Promise.all(modules.map((m) => loadModule(subject, m).then((p) => [m, p] as const)))
      .then((pairs) => live && setPeek(findSection(Object.fromEntries(pairs), question, answer, partId)))
      .catch(() => live && setPeek(null));
    return () => {
      live = false;
    };
  }, [subject, question, answer, fallbackModule, allModules]);

  // Highlight the answer in the shown notes and bring the first match into view.
  useEffect(() => {
    if (!peek || peek === "loading" || !bodyRef.current) return;
    markTerms(bodyRef.current, highlightTerms(question, answer));
    bodyRef.current.querySelector(".peek-hl")?.scrollIntoView({ block: "center" });
  }, [peek, question, answer]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const ready = peek && peek !== "loading" ? peek : null;
  const href = ready ? `/${subject}/${ready.module}#${ready.section?.id || ready.part.id}` : null;

  return (
    <div className="peek-back" onClick={onClose}>
      <div className="peek" role="dialog" aria-modal="true" aria-labelledby="peek-title" onClick={(e) => e.stopPropagation()}>
        <header className="peek-head">
          <div>
            <span className="eyebrow">From your notes</span>
            <b id="peek-title">
              {ready
                ? `${ready.part.num} · ${ready.section ? plainText(ready.section.title) : plainText(ready.part.title)}`
                : peek === "loading" ? "Finding the right section…" : "Couldn't load the notes"}
            </b>
          </div>
          <button ref={closeRef} className="peek-x" onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="peek-body sub notes" ref={bodyRef}>
          {peek === "loading" && <p className="muted">Loading…</p>}
          {peek === null && <p className="muted">Check your connection, or open the notes page instead.</p>}
          {ready && (
            <>
              {ready.section ? (
                <div dangerouslySetInnerHTML={{ __html: ready.section.html }} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: ready.part.intro }} />
              )}
            </>
          )}
        </div>
        <footer className="peek-foot">
          {href && <a className="btn primary" href={href} target="_blank" rel="noopener">Open in notes ↗</a>}
          <button className="btn" onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  );
}
