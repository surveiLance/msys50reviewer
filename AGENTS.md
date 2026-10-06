# AGENTS.md — handoff for the next coding agent

Read this first. It explains what MAGS is, what the owner wants, where the study material lives, how the code is organized, and exactly where the last session stopped.

## What this is

**MAGS** is a study reviewer website for **MSYS 50: Enterprise Architecture**, built by a student (repo owner: GitHub `surveiLance`) for their classmates. Next.js 15 App Router, TypeScript, no backend. Planned deploy target: Vercel (with Vercel Web Analytics already wired in). Repo: `github.com/surveiLance/msys50reviewer` (private), branch `main`.

- **Scope: Modules 1–3 only.** The midterm covers Modules 1–3. `docs/source/year-3-notes.*` also contains Module 4 — **ignore Module 4**; do not add it.
- Real midterm: Thursday, October 8, 8:00–9:15 PM (rooms in `lib/subjects.ts`).
- The original content (notes, flashcards, test banks) was generated earlier in a Claude chat artifact from the professor's slides and the owner's class notes. The owner **likes the notes content** — don't rewrite it. They did **not** like the old "Claude chat" visual style (grid paper, highlighter underlines, monospace caps labels); that has been replaced.

## Run, build, ship

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # must pass before every push
```

- Commit and push each logical change (the owner asked for this). Commit messages so far use conventional prefixes (`feat(...)`, `style:`, `chore:`, `content(...)`).
- `node_modules/`, `.next/` are ignored. `.claude/` is a local preview config — don't commit it.

## The source material

| Path | What |
|---|---|
| `docs/source/year-3-notes.pdf` | The owner's own class notes (32 pages). Modules 1–3 are in scope; Module 4 (from line ~862 of the .txt) is **not**. |
| `docs/source/year-3-notes.txt` | Plain-text extraction of the PDF (`pdftotext -layout`). Diagrams are images in the PDF and are not in the text. |
| `content/msys-50/module-1.html` … `module-3.html` | The finished notes shown on the site: pre-rendered HTML with inline SVG diagrams, fold-out guide questions, scenario cards. Anchors per part: `#p-1-1`, `#p-2-3`, etc. |
| `content/msys-50/clues.html` | "Scenario clue sheet" shown before the midterm test. |
| `content/msys-50/data.json` | Flashcards, module test sets, midterm question pools and scenarios. Shape is `SubjectData` in `lib/types.ts`. |

Module outline (from `lib/subjects.ts`):
- **Module 1 — Overview, Drivers, and Complexity of EA**: 1.1 Overview of EA · 1.2 EA Drivers · 1.3 The Complexity of EA
- **Module 2 — Governance, Alignment, and IT Initiatives**: 2.1 EA and Other Governance Instruments · 2.2 The Problem of Business and IT Alignment · 2.3 The IT Initiative
- **Module 3 — Architectural Complexity and Description**: 3.1 Architectural Complexity and Domains · 3.2 Describing Enterprise Architectures

### data.json shape (short version)
- `cards[module]`: `[part, front, back]`
- `tests[module][setKey]`: `{ desc, mtf: MtfItem[], secs: Section[] }`. Module 1 and 3 have one set; Module 2 has five (labels in `setLabels`).
  - `MtfItem`: `{ s: statement HTML with <u>underlined part</u>, t?: true (statement is true), a?: accepted replacements, d?: shown answer, r?: source like "2.1 slide 4", m?: "M1" }`
  - `Section`: `letter` (term ↔ description matching), `pick` (items + fixed option list), `mc` (multiple choice; `items` or `draw` from `scenarios`)
- `pools.M1..M3`: true/false banks for the midterm. `scenarios.M1..M3`: case-scenario MC banks (15/16/15).
- `midterm`: draw spec — 40 true/false (14/13/13), 10-item key-term matching, 10 "Classify It", 10 "Connect the Modules", 15 case scenarios (5 per module).
- Every answer was validated to be among its options; every false statement has an underline and accepted replacements.

## What the owner asked for (current direction)

Most recent requests, in their words where useful:
1. **Tests like Canvas**: one question at a time, **can't go back** to a previous question, nothing is marked until you submit.
2. **Professor's modified true or false**: *type `!` if true; if false, type the correct answer* (the word replacing the underlined part). Only `!` counts as "true".
3. **One "Test" tab**: choose Module 1, 2, 3, or the Midterm. Matching uses **dropdowns**, multiple choice uses radio buttons.
4. **New design**, not the old Claude-chat look; no highlighter underline.
5. **Light/dark mode and colors chosen by each person.**
6. **After a module's notes**, offer that module's test or the midterm at the bottom.
7. Keep it **as easy to understand as possible** — the owner felt earlier versions put "a lot in front of" them.
8. Scenario-based questions must stay in. Every module test now includes them (see "Where the last session stopped").

## Architecture

```
app/
  layout.tsx                    Header (inline MAGS logo in accent color, Appearance menu), font, theme script
  globals.css                   Whole design system (tokens → shell → notes → flashcards → tests → scores)
  icon.svg, apple-icon.tsx      Favicon (amber MA/GS mark) and iOS home-screen PNG
  page.tsx                      Home: subject list
  [subject]/page.tsx            Subject overview: 3-step how-to, module cards, exam card
  [subject]/[module]/page.tsx   Notes via NotesReader (one part at a time) + NextStep box on the last part
  [subject]/[module]/flashcards Flashcards (+ NextStep)
  [subject]/test/page.tsx       Test hub: list of tests
  [subject]/test/[test]/page.tsx  One test: "module-1".."module-3" or "midterm" (midterm adds clue-sheet fold-out)
  [subject]/scores/page.tsx     My Scores
components/
  Quiz.tsx         Canvas-style test: setup → forward-only questions → results + review
  SubjectNav.tsx   Tabs: Module 1 · 2 · 3 · Test · Scores; Notes/Flashcards switch inside a module
  NextStep.tsx     End-of-notes/flashcards box: Module N test · Midterm test · flashcards/notes
  Appearance.tsx   Auto/Light/Dark + 5 accent swatches; saved in localStorage (mags-theme, mags-accent)
  ScoresView.tsx   Tiles, "focus next", strength by module (bars), midterm trend, attempt history
  RecordStrip.tsx  Best/last score line used on several pages
  NotesReader.tsx  Notes: part tabs (1.1 · 1.2 · 1.3), one part shown at a time, numbered sections,
                   sticky "you are here" bar + outline (phones/narrow), outline rail in the left margin (≥1320px),
                   card groups (.check/.areas with 3+ cards) become swipe rows on phones (≤700px)
  Flashcards.tsx
lib/
  notes.ts         readNotes(): splits module-N.html into parts (h2) and sections (h3) at build time
  questions.ts     Builds Canvas-style questions from data.json: kinds "tf" | "mc" | "match"; grade(); notesHref()
  tests.ts         listTests(): one test per module + midterm, with question/point counts
  scores.ts        Attempt history in localStorage (key scores-<subject>); recordAttempt, moduleAccuracy
  subjects.ts, types.ts, quiz.ts (shuffle/sample/norm/load/save), content.ts
next.config.mjs    Redirects old URLs: /:subject/:module/test → /:subject/test/:module, /:subject/midterm → /:subject/test/midterm
```

Key behaviors:
- **Scoring is in points**: true/false and MC = 1 point; a matching question = 1 point per dropdown.
- **Progress is saved** after every answer (`run2-<storageKey>` in localStorage); reloading offers Resume. Midterm timer is computed from a saved deadline and auto-submits at 0.
- **No accounts**: scores live in each person's browser only. The Scores page says so.
- **Focus mode**: while a test runs, `body.quiz-on` hides tabs, module header, footer, and `.hide-in-quiz` elements.
- Theme: `html[data-theme]` (absent = follow device) and `html[data-accent]` (absent = blue). Tokens for every theme × accent are at the top of `globals.css`. An inline script in `<head>` applies the saved choice before paint.

## Where the last session stopped

Everything is committed and pushed; `npm run build` passes.

**Verified in the browser (phone width):**
- Test hub; Module 1 and Module 2 setup screens (no duplicate title; per-set counts)
- A full Module 2 test end to end: 25 true/false (`!` saved, nothing marked early, no back button), 3 matching questions with dropdowns, 16 case scenarios with radio buttons, Submit, results, Wrong/All review (matching review shows each row), attempt saved to Scores
- Midterm: old `/msys-50/midterm` redirects; timed mode starts at 74:59; tabs and clue sheet hide during the test; Submit now; results with per-module breakdown; attempt saved
- Appearance menu: Dark + Purple applied and still applied after reload
- "Done reviewing Module N?" box at the end of notes, with correct links

**Decided for consistency:** every module test includes case scenarios. Module 2 sets without their own get the Set 4 scenario section (`withScenarios` in `lib/tests.ts`), so Module 2 sets are now 34–81 points.

**Notes reader (added after the owner said the notes felt like an endless wall of text):** verified at 880px (sticky bar tracks section and progress, Outline popover jumps between parts and sections), 375px (swipe rows with "n / N" counter, no sideways page scroll), and 1440px dark (rail highlights the current section). Deep links still work: `#p-2-1` opens that part, `#a-bsc` opens the part containing it. The notes body is memoized (`PartBody`) so scroll updates don't re-render the HTML; keep it that way or the swipe rows get wiped.

**Still worth checking:**
- Untimed midterm, and the timer auto-submitting at 0 (try a short `timerMinutes`)
- Each accent in light and dark (contrast, especially amber in light mode)
- Flashcards page in the new design and its end-of-page box
- Scores page with real data in the new design
- Desktop width

**History note:** commit `710186d` doesn't build on its own (it removed a component still imported at that point); later commits are fine. Not worth rewriting pushed history.

## Ideas the owner may want next (ask first)
- Deploy to Vercel and enable Analytics, then share the link with classmates.
