# Reviewers

Study reviewers by subject: notes, flashcards, practice tests, and mock exams. Starts with **MSYS 50: Enterprise Architecture** (Modules 1–3 and a mock midterm).

Built with Next.js (App Router) and Vercel Web Analytics.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Run `npm run build` once before deploying to catch any errors.

## Deploy to Vercel

1. Push this folder to a new GitHub repo.
2. In Vercel, choose **Add New → Project**, import the repo, and deploy (no settings needed).
3. Open the project in Vercel → **Analytics** → **Enable**.

Or, without GitHub: `npx vercel` from this folder, then enable Analytics the same way.

## Analytics

Every view has its own URL, so Vercel's Analytics shows usage per subject, module, and view:

| Page | URL |
|---|---|
| Subject overview | `/msys-50` |
| Module notes | `/msys-50/module-1` |
| Flashcards | `/msys-50/module-1/flashcards` |
| Practice test | `/msys-50/module-1/test` |
| Mock midterm | `/msys-50/midterm` |

Filter by path prefix (e.g., `/msys-50`) to see one subject.

## Project layout

```
app/
  page.tsx                         Home: list of subjects
  [subject]/page.tsx               Subject overview
  [subject]/[module]/page.tsx      Notes
  [subject]/[module]/flashcards/   Flashcards
  [subject]/[module]/test/         Practice test(s)
  [subject]/midterm/               Mock exam
components/                        Flashcards, PracticeTest, NotesBody, SubjectNav
content/<subject>/
  module-N.html                    Notes (pre-built HTML with diagrams)
  clues.html                       Scenario clue sheet for the mock exam
  data.json                        Flashcards, tests, question pools, scenarios
lib/subjects.ts                    Subject registry (titles, modules, exam info)
```

## Add a subject

1. Create `content/<slug>/` with `module-N.html` files and a `data.json` that follows `lib/types.ts` (`SubjectData`).
2. Add the subject to `SUBJECTS` and `DATA` in `lib/subjects.ts`.

Routes, navigation, and analytics pages are generated automatically.

## Data format (data.json)

- `cards[module]`: `[part, front, back]`
- `tests[module][setKey]`: `{ desc, mtf: MtfItem[], secs: Section[] }`
  - MtfItem: `{ s, t?: true, a?: accepted[], d?: shown answer, r?: source, m?: module tag }`
  - Section kinds: `letter` (matching with lettered choices), `pick` (dropdown of fixed options), `mc` (multiple choice with optional `w` explanation)
- `pools` / `scenarios`: question banks the mock exam draws from on every retake
- `midterm`: which pools to draw from and how many items

Content is an unofficial study aid built from class slides and notes.
