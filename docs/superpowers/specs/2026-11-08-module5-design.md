# Module 5: understandable, source-complete reviewer

## Intent

The owner has a Module 5 quiz and found the previous reviewer difficult to understand and incomplete for the real quiz. Add Module 5 to the existing MAGS subject, using the supplied three slide decks and **only Module 5** of the updated class notes. Accuracy and inspectable coverage take precedence over speed, artificial question counts, or replacing the interface.

## Source boundary

Authoritative lesson inputs are `ea-5.1.pdf`, `ea-5.2.pdf`, `ea-5.3.pdf`, and the Module 5 section beginning on page 48 of `✏️ YEAR 3 NOTES (3).pdf`. Source PDFs remain local and uncommitted. User-supplied guide questions total **18**, split **9/5/4**. The later uploaded ebook advertisement is excluded. Assigned Lankhorst reading ranges may be listed, but their contents must not be presented as verified or reconstructed from memory.

## Approach

Use existing Next.js/TypeScript notes HTML, flashcard data, question builders, saved attempts, and Convex Battle architecture. No dependencies, redesign, accounts, score migration, or new finals exam.

The selected source approach is slides + Module 5 class notes. Builder recommendation for presentation: two levels together—brief plain-language explanation, followed by full source-grounded detail and an example. Alternatives are (a) a terse cram sheet, which risks repeating the omissions, or (b) a dense slide transcript, which repeats the readability problem. A cram summary can appear inside the full notes but cannot replace them.

## Content requirements

- Each of Parts 5.1–5.3 uses the current part navigation and a manageable section outline; every substantive slide has a destination in `docs/content/module5-source-audit.md`.
- Preserve all enumerations and nested distinctions, including all Grice subpoints, modeling guidelines, structural dimensions, breakdown causes, stakeholder-role examples, purpose/content classifications, viewpoint tables, relation names/notation, and diagram labels.
- Redraw diagrams as accessible code-native figures/tables, with captions and source-slide references; do not substitute decorative image generation for semantic diagrams. Provide textual equivalents and contained horizontal scrolling where needed.
- Preserve slide examples and label newly invented practice examples explicitly. Make complex examples explainable in parts, not merely a large unexplained diagram.
- Class-note shorthand must be reconciled with slides and ambiguities surfaced. Do not silently turn ambiguous notes into graded facts. Preserve unusual example notation and describe the uncertainty rather than fixing the professor's diagram without disclosure.
- Explain each guide answer directly in the relevant section and provide all 18 answers in fold-outs.
- Flashcards and questions must cover the material broadly, not just the guide-question headlines. Include source references and useful wrong-answer explanations. Practice scenarios must test applications of the lesson, not add external facts.
- Every modified true-or-false item, true or false, has a meaningful underlined span. The replacement must fit exactly that span. Accepted variants must include ordinary abbreviations, numeric formats, and equivalent wording where unambiguous; don't rely on optional words such as “about”.
- Use existing six solo types and seven Battle types, with independent variations rather than claiming TF/MTF duplicates are new content.

## Integration boundaries

- Add `module-5` to subject metadata as a finals-period module, title **Architecture Analysis, Views, and Modeling Languages**, with the source part titles.
- Add a pure `withModule5(data: SubjectData): SubjectData` merge after `withModule4` in `expandQuestionData`; retain all earlier bank values and IDs.
- Add Module 5 Battle selection and optional M5 quota/schema field without changing defaults/old mixed lobbies (Modules 1–3).
- Archived midterm stays **Modules 1–3**, through explicit `exam.modules` filtering. Do not infer finals coverage or an exam date.
- Preserve saved scores, question history, in-progress tests, player identities, matches, and lobbies. Existing optional fields stay compatible.
- A Convex production deployment and frontend deployment are separate completion checks, not implied by a Git push.

## Verification / acceptance

1. Per-slide source audit includes image-only details and all Module 5 note pages; a coverage map links facts/topics to notes, flashcards, and questions, with explicit non-quizzed/uncertain items.
2. Automated integration tests exercise Module 5 loading, parsed parts/sections, guide links, correct grading, valid choices, all selected solo/Battle types, M5 quotas, and midterm exclusion.
3. Compatibility tests verify earlier banks/identities remain intact. No source PDFs or unrelated local package/portfolio changes enter commits.
4. Review new question statements, underlines, distractors, and answer variants against the actual lesson. Unknown claims are omitted from grading rather than guessed.
5. Full `npm test`, `npm run build`, desktop/narrow/light/dark browser checks, notes-peek, and a disposable short quiz round before claiming completion. Report actual widths tested and any remaining deployment/access limits.

## Scope confirmation

The owner confirmed “Yes, proceed with all of that” to notes, 18 guides, slide-based diagrams/tables, flashcards, solo tests and Battle, with textbook readings marked unverified. They chose a new branch in this checkout rather than a separate worktree. Implement directly, with a final independent review; preserve unrelated dirty files.
