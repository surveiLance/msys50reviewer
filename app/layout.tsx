import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Appearance, { APPEARANCE_SCRIPT } from "@/components/Appearance";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: { default: "MAGS", template: "%s · MAGS" },
  description: "Study notes, flashcards, and tests by subject.",
};

/** The MAGS mark, drawn in the reader's chosen accent color. Same shapes as app/icon.svg. */
function Logo() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="14" fill="var(--accent)" />
      <g fill="none" stroke="var(--on-accent)" strokeWidth="5.5" strokeLinecap="square">
        <path d="M8.75 26.25v-17.5l8.75 8.75 8.75-8.75v17.5" />
        <path d="M37.75 26.25v-17.5h17.5v17.5M37.75 17.5h17.5" />
        <path d="M26.25 37.75H8.75v17.5h17.5V46.5h-7" />
        <path d="M55.25 37.75h-17.5v8.75h17.5v8.75h-17.5" />
      </g>
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The appearance script sets data-theme / data-accent before React hydrates.
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_SCRIPT }} />
      </head>
      <body>
        <header className="site-head">
          <div className="wrap site-head-in">
            <Link href="/" className="brand" aria-label="MAGS home">
              <Logo />
              MAGS
            </Link>
            <Link href="/msys-50" className="site-link">MSYS 50</Link>
            <span className="head-spacer" />
            <Appearance />
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="wrap site-foot">
          An unofficial study aid built from class slides and notes. When something here differs from your professor&apos;s materials, follow the professor.
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
