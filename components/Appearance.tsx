"use client";

import { useEffect, useRef, useState } from "react";

const THEMES = [
  { key: "auto", label: "Auto" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
] as const;

// Swatch colors are the light-mode accents; each theme has its own tuned shades in globals.css.
export const ACCENTS = [
  { key: "blue", label: "Blue", color: "#2563EB" },
  { key: "teal", label: "Teal", color: "#0F766E" },
  { key: "purple", label: "Purple", color: "#7C3AED" },
  { key: "rose", label: "Rose", color: "#E11D48" },
  { key: "amber", label: "Amber", color: "#F59E0B" },
] as const;

type Theme = (typeof THEMES)[number]["key"];
type Accent = (typeof ACCENTS)[number]["key"];

/** Runs in <head> before first paint so a saved theme never flashes. */
export const APPEARANCE_SCRIPT = `try{var d=document.documentElement,t=localStorage.getItem("mags-theme"),a=localStorage.getItem("mags-accent");if(t==="light"||t==="dark")d.dataset.theme=t;if(a)d.dataset.accent=a}catch(e){}`;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* private mode: the choice just won't persist */
  }
}

/** Header button: light / dark / follow the device, plus an accent color. Saved per browser. */
export default function Appearance() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("auto");
  const [accent, setAccent] = useState<Accent>("blue");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = read("mags-theme");
    const a = read("mags-accent");
    if (t === "light" || t === "dark") setTheme(t);
    if (a && ACCENTS.some((x) => x.key === a)) setAccent(a as Accent);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pickTheme = (t: Theme) => {
    setTheme(t);
    const d = document.documentElement;
    if (t === "auto") delete d.dataset.theme;
    else d.dataset.theme = t;
    write("mags-theme", t === "auto" ? null : t);
  };
  const pickAccent = (a: Accent) => {
    setAccent(a);
    document.documentElement.dataset.accent = a;
    write("mags-accent", a);
  };

  return (
    <div className="appear" ref={ref}>
      <button className="appear-btn" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((o) => !o)}>
        <i aria-hidden /> <span className="lg">Appearance</span><span className="sm">Theme</span>
      </button>
      {open && (
        <div className="appear-pop" role="dialog" aria-label="Appearance">
          <h4>Mode</h4>
          <div className="seg">
            {THEMES.map((t) => (
              <button key={t.key} aria-pressed={theme === t.key} onClick={() => pickTheme(t.key)}>{t.label}</button>
            ))}
          </div>
          <h4>Color</h4>
          <div className="swatches">
            {ACCENTS.map((a) => (
              <button key={a.key} aria-pressed={accent === a.key} aria-label={a.label} title={a.label} style={{ background: a.color }} onClick={() => pickAccent(a.key)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
