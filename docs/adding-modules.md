# Adding later course modules

The subject now has three stable sections: Modules, Test, and Battle. Scores and attempt reviews live at `/msys-50/test/scores`; `/msys-50/scores` permanently redirects there. Browser storage keys have not changed.

## Publish a new module when its materials are ready

1. Add its validated notes HTML under `content/msys-50/module-N.html` and its cards/question sets to the shared subject data. Module 4 uses `content/msys-50/module4.ts`, merged by `expandQuestionData()` for both solo quizzes and Convex. Preserve old content and question IDs.
2. Add the module to `SUBJECTS` in `lib/subjects.ts`, with its number, title, parts, and `period: "finals"`. Do not add placeholder modules to this array before their files are ready: static generation reads their notes.
3. The Modules hub, module switcher, notes/flashcards routes, module test routes, Test hub, and score breakdowns use the registry and will include it automatically. Module tests with no questions are omitted from the Test hub.
4. Keep `exam.modules` set to Modules 1–3. `examData()` scopes all midterm banks to this list, including alternatives and scenarios. Adding a later module must not change the old midterm's coverage or saved runs.
5. Run tests and the production build before publishing. `tests/studyStructure.test.ts` verifies the isolation with a synthetic Module 4.

## Module 4 and future coverage

Module 4 (Architecture Approaches, TOGAF, CSVLOD) is available under Finals modules. It has its own quiz and Battle module quota. Existing Battle defaults and older mixed lobbies remain Modules 1–3; hosts opt into Module 4 explicitly. Deploy Convex before publishing the frontend that exposes the new quota.

The owner expects finals in late November; the exact date and complete coverage are not confirmed. A cumulative finals exam needs a separately specified exam bank, route, and storage key when coverage is known. Future Battle modules require matching frontend controls and server validators/banks.
