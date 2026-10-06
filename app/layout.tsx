import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Reviewers", template: "%s · Reviewers" },
  description: "Study notes, flashcards, and practice tests by subject.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,500..800&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@500&display=swap"
        />
      </head>
      <body>
        <header className="site-head">
          <div className="wrap site-head-in">
            <Link href="/" className="brand">Reviewers</Link>
            <Link href="/msys-50" className="site-link">MSYS 50</Link>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="wrap site-foot">
          An unofficial study aid built from class slides and notes. When something here differs from your professor's materials, follow the professor.
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
