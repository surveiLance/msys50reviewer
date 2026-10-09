# Adding later course modules

The subject now has three stable sections: Modules, Test, and Battle. Scores and attempt reviews live at `/msys-50/test/scores`; `/msys-50/scores` permanently redirects there. Browser storage keys have not changed.

## Publish a new module when its materials are ready

1. Add its validated notes HTML under `content/msys-50/module-N.html` and its cards/question sets to `content/msys-50/data.json`. Preserve old content and question IDs.
2. Add the module to `SUBJECTS` in `lib/subjects.ts`, with its number, title, parts, and `period: "finals"`. Do not add placeholder modules to this array before their files are ready: static generation reads their notes.
3. The Modules hub, module switcher, notes/flashcards routes, module test routes, Test hub, and score breakdowns use the registry and will include it automatically. Module tests with no questions are omitted from the Test hub.
4. Keep `exam.modules` set to Modules 1–3. `examData()` scopes all midterm banks to this list, including alternatives and scenarios. Adding a later module must not change the old midterm's coverage or saved runs.
5. Run tests and the production build before publishing. `tests/studyStructure.test.ts` verifies the isolation with a synthetic Module 4.

## Not published yet

The owner expects finals in late November; the exact date and coverage are not confirmed. The preparation panels are informational, not links to fabricated content. A cumulative finals exam needs a separately specified exam bank, route, and storage key when coverage is known. Battle currently remains limited to Modules 1–3; later battle coverage needs an explicit update to its settings and server validation.
