# MAGS

Study reviewers by subject: notes, flashcards, and Canvas-style tests. Starts with **MSYS 50: Enterprise Architecture** (Modules 1–3 and a midterm test).

Built with Next.js (App Router) and Vercel Web Analytics. No accounts or backend: scores, test progress, and theme choices are saved in each visitor's browser.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run build` before deploying to catch errors.

## Deploy to Vercel

1. In Vercel, choose **Add New → Project**, import this repo, and deploy (no settings needed).
2. Open the project → **Analytics** → **Enable**.

## Pages

Every view has its own URL, so Vercel Analytics shows usage per page:

| Page | URL |
|---|---|
| Subject overview | `/msys-50` |
| Module notes | `/msys-50/module-1` |
| Flashcards | `/msys-50/module-1/flashcards` |
| Test hub (pick a test) | `/msys-50/test` |
| A module test | `/msys-50/test/module-1` |
| Midterm test | `/msys-50/test/midterm` |
| My scores | `/msys-50/scores` |

Old links (`/msys-50/module-1/test`, `/msys-50/midterm`) redirect to the new test pages.

## How tests work

- Pick the **question types** (checkboxes) and a **length** (Quick 10, Short, Medium, Long; the midterm's longest is the full 85-point exam).
  - Modified true or false: type `!` if true, or the word that should replace the underlined part
  - True or false, Multiple choice (includes case scenarios)
  - Multiple answer: checkboxes, 2 points, partial credit (right boxes earn, wrong boxes cost, never below zero)
  - Fill in the blank: tap a word from the word bank
  - Matching: a dropdown per item (5 per round)
- One question at a time, Canvas-style: no going back, nothing marked until you submit.
- Each round picks questions you haven't seen yet; results offer "Another round".
- "Review in notes" on a wrong answer opens the matching notes section in a window.
- The midterm draws from every module and can be timed (scaled to the round's length; auto-submits).
- Progress is saved after every answer; reloading offers Resume.

## Project layout

```
app/
  layout.tsx                     Header, logo, Appearance menu, font
  globals.css                    Design system: theme × accent tokens, then each area of the site
  [subject]/page.tsx             Subject overview
  [subject]/[module]/            Notes; flashcards/ for flashcards
  [subject]/test/                Test hub; [test]/ for one test
  [subject]/scores/              My scores
components/                      Quiz, Flashcards, NotesBody, SubjectNav, NextStep, Appearance, ScoresView, RecordStrip
content/<subject>/
  module-N.html                  Notes (pre-built HTML with diagrams)
  clues.html                     Scenario clue sheet for the midterm test
  data.json                      Flashcards, test sets, midterm pools and scenarios
lib/
  questions.ts                   Turns data.json into Canvas-style questions and grades them
  tests.ts                       The list of tests per subject
  scores.ts                      Saved attempts (localStorage)
  subjects.ts                    Subject registry (titles, modules, exam info)
docs/source/                     The class notes the reviewer was built from
```

## Add a subject

1. Create `content/<slug>/` with `module-N.html` files and a `data.json` that follows `lib/types.ts` (`SubjectData`).
2. Add the subject to `SUBJECTS` and `DATA` in `lib/subjects.ts`.

Routes, navigation, tests, and analytics pages are generated automatically.

## Data format (data.json)

- `cards[module]`: `[part, front, back]`
- `tests[module][setKey]`: `{ desc, mtf: MtfItem[], secs: Section[] }`
  - MtfItem: `{ s, t?: true, a?: accepted[], d?: shown answer, r?: source, m?: module tag }`
  - Section kinds: `letter` (term ↔ description matching), `pick` (dropdown of fixed options), `mc` (multiple choice with optional `w` explanation)
- `pools` / `scenarios`: question banks the midterm test draws from on every attempt
- `midterm`: which pools to draw from and how many items

Content is an unofficial study aid built from class slides and notes. When something differs from the professor's materials, follow the professor.
