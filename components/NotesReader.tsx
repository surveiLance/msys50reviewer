"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { NotePart } from "@/lib/notes";

const plain = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();

/**
 * The part's notes HTML. Memoized so the scroll-driven "you are here" updates never
 * re-render it (which would undo the swipe rows and open fold-outs set up on the DOM).
 */
const PartBody = memo(function PartBody({ part, innerRef }: { part: NotePart; innerRef: React.Ref<HTMLElement> }) {
  return (
    <article className="sub notes part-body" ref={innerRef}>
      <h2 id={part.id}><span className="tag">Part {part.num}</span><span dangerouslySetInnerHTML={{ __html: part.title }} /></h2>
      <div dangerouslySetInnerHTML={{ __html: part.intro }} />
      {part.sections.map((s, j) => (
        <section key={s.id} className="nsec">
          <h3 id={s.id} data-sec>
            <span className="sec-n">{j + 1}</span>
            <span dangerouslySetInnerHTML={{ __html: s.title }} />
          </h3>
          <div dangerouslySetInnerHTML={{ __html: s.html }} />
        </section>
      ))}
    </article>
  );
});

/**
 * Notes, one part at a time:
 * - part tabs (1.1 · 1.2 · 1.3) at the top, and "Next part" at the bottom
 * - a sticky "you are here" bar (phones) / outline rail (wide screens) that follows the section you're reading
 * - numbered sections; card groups become swipeable rows on phones
 */
export default function NotesReader({ parts, moduleNum, children }: { parts: NotePart[]; moduleNum: number; children?: React.ReactNode }) {
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(0);
  const [progress, setProgress] = useState(0);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLElement>(null);
  const pendingScroll = useRef<string | null>(null);

  const part = parts[pi];

  // Which part does an id (part, section, or any anchor inside the notes) belong to?
  const partFor = useCallback(
    (id: string) => {
      const direct = parts.findIndex((p) => id === p.id || id.startsWith(p.id + "-s"));
      if (direct >= 0) return direct;
      return parts.findIndex((p) => (p.intro + p.sections.map((s) => s.html).join("")).includes(`id="${id}"`));
    },
    [parts],
  );

  const scrollToId = (id: string | null) => {
    const el = id ? document.getElementById(id) : null;
    if (el && !parts.some((p) => p.id === id)) el.scrollIntoView({ block: "start" });
    else rootRef.current?.scrollIntoView({ block: "start" });
  };

  // Deep links (#p-2-1, #a-bsc) open the right part; back/forward move between parts.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id) return;
      const i = partFor(id);
      if (i >= 0) {
        pendingScroll.current = id;
        setPi(i);
      }
    };
    fromHash();
    window.addEventListener("popstate", fromHash);
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.removeEventListener("popstate", fromHash);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [partFor]);

  // After a part renders: scroll where asked, wire up "Show all answers", and set up swipe rows.
  useEffect(() => {
    const id = pendingScroll.current;
    pendingScroll.current = null;
    if (id) requestAnimationFrame(() => scrollToId(id));
    const root = bodyRef.current;
    if (!root) return;
    const offs: (() => void)[] = [];
    root.querySelectorAll<HTMLButtonElement>(".qa-all").forEach((btn) => {
      const onClick = () => {
        const ds = Array.from(btn.parentElement?.querySelectorAll<HTMLDetailsElement>("details.qa") ?? []);
        const open = !ds.every((d) => d.open);
        ds.forEach((d) => (d.open = open));
        btn.textContent = open ? "Hide all answers" : "Show all answers";
      };
      btn.addEventListener("click", onClick);
      offs.push(() => btn.removeEventListener("click", onClick));
    });
    // Groups of 3+ cards scroll sideways on phones; a counter shows where you are in the row.
    root.querySelectorAll<HTMLElement>(".check, .areas").forEach((row) => {
      const n = row.children.length;
      if (n < 3 || row.nextElementSibling?.classList.contains("swipe-hint")) return;
      row.classList.add("swipe");
      const hint = document.createElement("div");
      hint.className = "swipe-hint";
      hint.setAttribute("aria-hidden", "true");
      row.after(hint);
      const update = () => {
        const w = (row.children[0] as HTMLElement)?.offsetWidth || 1;
        const at = Math.min(n, Math.round(row.scrollLeft / (w + 10)) + 1);
        hint.textContent = `${at} / ${n} · swipe for more`;
      };
      update();
      row.addEventListener("scroll", update, { passive: true });
      offs.push(() => row.removeEventListener("scroll", update));
    });
    return () => offs.forEach((off) => off());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pi]);

  // Track the section in view and how far through the part you are.
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const body = bodyRef.current;
      if (!body) return;
      // A section counts as "current" once its heading reaches the top third of the screen.
      const line = Math.max(150, window.innerHeight * 0.33);
      const heads = Array.from(body.querySelectorAll<HTMLElement>("h3[data-sec]"));
      let cur = 0;
      heads.forEach((h, i) => {
        if (h.getBoundingClientRect().top <= line) cur = i;
      });
      setSi(cur);
      const r = body.getBoundingClientRect();
      const total = r.height - window.innerHeight + line;
      setProgress(Math.max(0, Math.min(1, total > 0 ? (line - r.top) / total : 1)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pi]);

  const goPart = (i: number, sectionId?: string) => {
    setOutlineOpen(false);
    const target = sectionId || parts[i].id;
    history.pushState(null, "", `#${target}`);
    if (i === pi) {
      scrollToId(sectionId || null);
      return;
    }
    pendingScroll.current = sectionId || parts[i].id;
    setPi(i);
  };

  const sec = part.sections[si];
  const outline = (
    <ol className="ol-parts">
      {parts.map((p, i) => (
        <li key={p.id} className={i === pi ? "on" : ""}>
          <button className="ol-part" onClick={() => goPart(i)} aria-current={i === pi ? "true" : undefined}>
            <span>{p.num}</span>{plain(p.title)}
          </button>
          {i === pi && (
            <ol className="ol-secs">
              {p.sections.map((s, j) => (
                <li key={s.id}>
                  <button className={j === si ? "on" : j < si ? "done" : ""} onClick={() => goPart(i, s.id)} aria-current={j === si ? "location" : undefined}>
                    <span>{j < si ? "✓" : j + 1}</span>{plain(s.title)}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </li>
      ))}
    </ol>
  );

  return (
    <div className="reader" ref={rootRef}>
      <aside className="rail" aria-label={`Module ${moduleNum} outline`}>
        <div className="rail-in">
          <div className="rail-h">Module {moduleNum} outline</div>
          {outline}
          <div className="rail-prog" aria-hidden><i style={{ width: `${progress * 100}%` }} /></div>
          <span className="rail-pct">{Math.round(progress * 100)}% of part {part.num}</span>
        </div>
      </aside>

      <div className="reader-main">
        <nav className="part-tabs" aria-label="Parts">
          {parts.map((p, i) => (
            <button key={p.id} aria-current={i === pi ? "page" : undefined} onClick={() => goPart(i)}>
              <b>{p.num}</b><span>{plain(p.title)}</span>
            </button>
          ))}
        </nav>

        <div className="here">
          <button className="here-btn" onClick={() => setOutlineOpen((o) => !o)} aria-expanded={outlineOpen}>
            <span className="here-where">
              <small>Part {part.num} · Section {si + 1} of {part.sections.length}</small>
              <b>{sec ? plain(sec.title) : plain(part.title)}</b>
            </span>
            <span className="here-tog" aria-hidden>{outlineOpen ? "Close" : "Outline"}</span>
          </button>
          <div className="here-prog" aria-hidden><i style={{ width: `${progress * 100}%` }} /></div>
          {outlineOpen && <div className="here-pop">{outline}</div>}
        </div>

        <PartBody key={part.id} part={part} innerRef={bodyRef} />

        <nav className="part-next" aria-label="Part navigation">
          {pi > 0 ? (
            <button className="btn" onClick={() => goPart(pi - 1)}>
              <span>← Part {parts[pi - 1].num}</span>
            </button>
          ) : <span />}
          {pi < parts.length - 1 && (
            <button className="btn primary" onClick={() => goPart(pi + 1)}>
              <span>Next: {parts[pi + 1].num} {plain(parts[pi + 1].title)} →</span>
            </button>
          )}
        </nav>
        {pi === parts.length - 1 && children}
      </div>
    </div>
  );
}
