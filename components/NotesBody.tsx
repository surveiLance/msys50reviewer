"use client";

import { useEffect, useRef } from "react";

/** Renders pre-built notes HTML and wires up the "Show all answers" buttons. */
export default function NotesBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>(".qa-all"));
    const handlers = buttons.map((btn) => {
      const onClick = () => {
        const ds = Array.from(btn.parentElement?.querySelectorAll<HTMLDetailsElement>("details.qa") ?? []);
        const open = !ds.every((d) => d.open);
        ds.forEach((d) => (d.open = open));
        btn.textContent = open ? "Hide all answers" : "Show all answers";
      };
      btn.addEventListener("click", onClick);
      return () => btn.removeEventListener("click", onClick);
    });
    return () => handlers.forEach((off) => off());
  }, [html]);

  return <div ref={ref} className="sub notes" dangerouslySetInnerHTML={{ __html: html }} />;
}
