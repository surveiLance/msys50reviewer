"use client";

import React from "react";

export type MapNode = { id: string; label: string; icon: string; x: number; y: number; detail?: string; tone?: "on" | "dim" | "warn" };
export function SceneMap({ nodes, links, onSelect, label, running = false }: { nodes: MapNode[]; links: [string, string, string?][]; onSelect?: (id: string) => void; label: string; running?: boolean }) {
  return <div className={`xp-map ${running ? "is-running" : ""}`} role="group" aria-label={label}>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="xp-wires">
      {links.map(([from, to, text], i) => { const a = nodes.find(n => n.id === from)!; const b = nodes.find(n => n.id === to)!; return <g key={`${from}-${to}-${i}`}><path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} /><circle r="1.2" cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} />{text && <title>{text}</title>}</g>; })}
    </svg>
    {nodes.map(n => <button type="button" key={n.id} className={`xp-place ${n.tone || ""}`} style={{ left: `${n.x}%`, top: `${n.y}%` }} onClick={() => onSelect?.(n.id)} disabled={!onSelect} aria-label={`${n.label}${n.detail ? `: ${n.detail}` : ""}`}>
      <span className="xp-building" aria-hidden="true"><Glyph name={n.icon} /></span><b>{n.label}</b>{n.detail && <small>{n.detail}</small>}
    </button>)}
  </div>;
}

export function Glyph({ name }: { name: string }) {
  const shapes: Record<string, React.ReactNode> = {
    person: <><circle cx="24" cy="12" r="7" /><path d="M10 42v-7a14 14 0 0 1 28 0v7M24 27v15" /></>,
    office: <><path d="M7 43V15L24 5l17 10v28ZM15 43V31h18v12M16 18h1m14 0h1M16 25h1m14 0h1" /></>,
    data: <><ellipse cx="24" cy="10" rx="16" ry="6" /><path d="M8 10v27c0 8 32 8 32 0V10M8 23c0 8 32 8 32 0" /></>,
    app: <><rect x="5" y="6" width="38" height="32" rx="4" /><path d="M5 15h38M16 43h16M24 38v5M12 11h1m5 0h1" /></>,
    goal: <><circle cx="24" cy="24" r="18" /><circle cx="24" cy="24" r="10" /><path d="m24 24 17-17M34 7h7v7" /></>,
    gear: <><circle cx="24" cy="24" r="13" /><circle cx="24" cy="24" r="5" /><path d="M24 3v8m0 26v8M3 24h8m26 0h8M9 9l6 6m18 18 6 6M9 39l6-6M33 15l6-6" /></>,
    document: <><path d="M10 4h20l9 10v30H10ZM30 4v11h9M17 23h15M17 30h15M17 37h10" /></>,
    shield: <><path d="m24 4 17 7v12c0 10-9 17-17 21C16 40 7 33 7 23V11Z" /><path d="m16 23 6 6 12-13" /></>,
    clock: <><circle cx="24" cy="24" r="19" /><path d="M24 10v14l10 7" /></>,
    tool: <><path d="M30 5a13 13 0 0 0-15 17L4 33l11 11 11-12A13 13 0 0 0 43 17l-9 9-11-11Z" /></>,
  };
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name] ?? shapes.office}</svg>;
}

export function Choices({ label, options, value, onChange }: { label: string; options: string[]; value: number; onChange: (i: number) => void }) {
  return <div className="xp-choices" role="group" aria-label={label}>{options.map((o, i) => <button type="button" key={o} aria-pressed={value === i} onClick={() => onChange(i)}>{o}</button>)}</div>;
}
export function Outcome({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="xp-outcome" role="status" aria-live="polite"><span className="xp-spark" aria-hidden="true">↳</span><div><h4>{title}</h4><p>{children}</p></div></div>;
}
