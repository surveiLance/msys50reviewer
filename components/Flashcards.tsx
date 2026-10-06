"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Card } from "@/lib/types";
import { load, save, shuffle } from "@/lib/quiz";

export default function Flashcards({ cards, storageKey }: { cards: Card[]; storageKey: string }) {
  const parts = useMemo(() => Array.from(new Set(cards.map((c) => c[0]))), [cards]);
  const [filter, setFilter] = useState<string>("all");
  const [hideKnown, setHideKnown] = useState(false);
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [known, setKnown] = useState<Record<number, boolean>>({});
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [backIndex, setBackIndex] = useState<number | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setKnown(load(storageKey, {})), [storageKey]);

  const deck = useMemo(
    () => order.filter((i) => (filter === "all" || cards[i][0] === filter) && !(hideKnown && known[i])),
    [order, filter, hideKnown, known, cards],
  );
  const safePos = deck.length ? Math.min(pos, deck.length - 1) : 0;
  const current = deck.length ? deck[safePos] : null;

  // Swap the back face only after the flip-back animation, so the next answer never flashes.
  useEffect(() => {
    if (!flipped) {
      const t = setTimeout(() => setBackIndex(current), 220);
      return () => clearTimeout(t);
    }
    setBackIndex(current);
  }, [current, flipped]);

  const go = (d: number) => {
    if (!deck.length) return;
    setFlipped(false);
    setPos((p) => (Math.min(p, deck.length - 1) + d + deck.length) % deck.length);
  };
  const toggleKnown = () => {
    if (current === null) return;
    const next = { ...known, [current]: !known[current] };
    setKnown(next);
    save(storageKey, next);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " " && e.target !== cardRef.current) {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const knownCount = Object.values(known).filter(Boolean).length;
  const count = deck.length ? `${safePos + 1} / ${deck.length}` : "";

  return (
    <div>
      <div className="bar fc-filters">
        <button className="chip" aria-pressed={filter === "all"} onClick={() => { setFilter("all"); setPos(0); setFlipped(false); }}>All</button>
        {parts.map((p) => (
          <button key={p} className="chip" aria-pressed={filter === p} onClick={() => { setFilter(p); setPos(0); setFlipped(false); }}>{p}</button>
        ))}
        <span className="spacer" />
        <button className="chip" aria-pressed={hideKnown} onClick={() => { setHideKnown((h) => !h); setPos(0); setFlipped(false); }}>Hide known</button>
      </div>

      <button ref={cardRef} className={"fc" + (flipped ? " flipped" : "")} aria-label="Flashcard, tap to flip" onClick={() => setFlipped((f) => !f)}>
        <div className="fc-inner">
          <div className="face front">
            <div className="meta"><span>{current === null ? "Done" : "Part " + cards[current][0]}</span><span className="count">{count}</span></div>
            {current === null
              ? <div className="front-t">All cards in this set are marked known.</div>
              : <div className="front-t" dangerouslySetInnerHTML={{ __html: cards[current][1] }} />}
            <div className="hint">Tap or press Space to flip</div>
          </div>
          <div className="face back">
            <div className="meta"><span>Answer</span><span className="count">{count}</span></div>
            {backIndex === null
              ? <div className="back-t">Turn off Hide known or reset.</div>
              : <div className="back-t" dangerouslySetInnerHTML={{ __html: cards[backIndex][2] }} />}
          </div>
        </div>
      </button>

      <div className="progress"><i style={{ width: deck.length ? `${((safePos + 1) / deck.length) * 100}%` : "100%" }} /></div>
      <div className="fc-nav">
        <button className="btn" onClick={() => go(-1)}>← Prev</button>
        <button className="btn known" aria-pressed={current !== null && !!known[current]} onClick={toggleKnown}>
          {current !== null && known[current] ? "Known ✓" : "Mark known"}
        </button>
        <button className="btn primary" onClick={() => go(1)}>Next →</button>
      </div>
      <div className="fc-nav">
        <button className="btn" onClick={() => { setOrder(shuffle(order)); setPos(0); setFlipped(false); }}>Shuffle</button>
        <button className="btn" onClick={() => { setKnown({}); save(storageKey, {}); setPos(0); }}>Reset known</button>
      </div>
      <p className="count" style={{ marginTop: 12 }}>{knownCount} of {cards.length} cards marked known</p>
    </div>
  );
}
