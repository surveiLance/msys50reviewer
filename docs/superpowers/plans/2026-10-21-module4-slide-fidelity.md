# Module 4 Slide Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Module 4's wording and diagrams faithful to the supplied slides without resetting study progress or replacing question banks.

**Architecture:** Retain the static HTML notes and existing parser. Use original, accessible SVG diagrams and semantic tables, with source references and clearly separated explanatory examples. Correct study-bank content only where a comparison with the supplied material establishes a mismatch.

**Tech Stack:** Next.js 15, TypeScript, HTML/SVG, CSS, Vitest.

**Spec:** The user-approved in-chat design: slide terminology first; preserve diagram labels, arrows, grouping, and relationships; separate lesson content from explanations/examples; reconcile flashcards and tests without resetting progress. This is a bounded correction, so no separate design document is required.

## Global Constraints

- Only Modules 1-4 are in scope; leave Modules 1-3 unchanged and keep the archived midterm restricted to Modules 1-3.
- Preserve the three part IDs and existing section ordering/counts (5, 5, 10), so generated review anchors remain stable.
- Preserve question-bank order, identities, storage keys, and existing saved attempts. Fix incorrect wording/answers in place rather than recreating banks.
- Preserve `NotesReader`'s memoized `PartBody` and existing themes; no new dependency or general quiz-flow redesign.
- Do not publish original PDFs. References are the supplied `/Users/lance/Downloads/ea-4.1.pdf`, `ea-4.2.pdf`, `ea-4.3.pdf`, and updated class notes; slide wording takes priority over conflicting secondhand summaries.
- Keep the Analytical Reports popularity label explicitly unstated; do not infer it or introduce unverified quiz coverage/maturity claims.
- Preserve unrelated package-file changes, `.claude/`, and `docs/portfolio/`. Build before pushing, as required by AGENTS.md.

## Review Focus

- Phone widths: dense grids stay legible through contained horizontal scrolling, without page-wide overflow.
- Light/dark and accent changes: labels, arrows, and grouping remain distinguishable without relying solely on color.
- Source variations: distinguish slide 10's Zachman depiction from slide 11's six-perspective example instead of silently combining labels.
- Existing saved runs: stable question IDs/order prevent newly generated rounds or corrections from invalidating stored answers/history.
- Notes peek/deep links: SVG text and new examples must not disrupt existing part/section anchors or guide-question filtering.

---

### Task 1: Restore slide-faithful notes and diagrams

**Files:**
- Modify: `content/msys-50/module-4.html`
- Modify: `app/globals.css` (scoped diagram styles only if existing styles are insufficient)
- Create: `tests/module4Fidelity.test.ts`
- Create: `docs/content/module4-source-audit.md` (page-by-page audit and correction evidence; no PDF reproduction)

**Interfaces:**
- Consumes: `readNotes("msys-50", "module-4")` returning `NotePart[]`; current notes' part and section anchors.
- Produces: the same parsed parts/sections, with figures named `m4-zachman-grid`, `m4-mda-mappings`, `m4-togaf-components`, `m4-adm-cycle`, and `m4-csvlod-matrix`; source-audit findings for Task 2.

- [ ] **Step 1: Complete the source comparison.** Render and inspect every relevant slide in Parts 4.1-4.3, not text extraction alone. Record omissions, contradictions, and intentional illustrative additions in the audit. Preserve slide-number references and ambiguity notes.
- [ ] **Step 2: Write regression tests before changing the notes.** In `tests/module4Fidelity.test.ts`, use `readNotes` and file reads to assert exact part IDs and section counts; figure presence and accessible names; MDA's two directions of mapping; all eight ADM phases plus Preliminary and central Requirements Management; CSVLOD's correct row/column mappings; 22 retained guide-question answers. The missing-figure assertions must fail on the current notes.
- [ ] **Step 3: Run `npm test -- tests/module4Fidelity.test.ts`.** Expected: assertion failures for the absent/corrected figures, not import/runtime errors.
- [ ] **Step 4: Correct the notes without moving section boundaries.** Show Zachman's perspective-by-question grid and distinguish the two slide depictions. Replace the one-way MDA graphic with CIM/PIM/PSM, bidirectional mappings, and the supplied examples. Add TOGAF's component grouping and an ADM cycle preserving center-to-phase connections and phase order. Present CSVLOD as a labeled six-cell matrix with existing subtype details retained. Label plain-language explanations and invented examples separately; correct any additional omissions established in Step 1.
- [ ] **Step 5: Run `npm test`.** Expected: the full suite, including fidelity and existing Module 4 parsing/scope tests, passes.
- [ ] **Step 6: Inspect browser rendering.** At desktop and phone widths, visit all three parts in light and dark modes. Check contained scrolling, readable text/arrows, section navigation, guide answers, and a notes-peek deep link. Save screenshots for the handoff; fix any clipping before finishing.
- [ ] **Step 7: Run `npm run build`, then commit only Task 1 files.** Expected: exit 0; commit `content(module4): restore slide-faithful notes and diagrams`. Do not push until the final review is complete.

### Task 2: Reconcile study banks and verify the complete change

**Files:**
- Modify if evidence requires: `content/msys-50/module4.ts`, `content/msys-50/essential4.ts`
- Modify: `tests/module4Fidelity.test.ts`
- Modify: `docs/content/module4-source-audit.md`

**Interfaces:**
- Consumes: Task 1's source-audit findings; existing `withModule4` merge, `artifactSubtypes`, `poolModule`, `poolEssentialModule`, and Battle `questionBank()`.
- Produces: the same banks and question identities, with source-verified corrections and an audit of all Module 4 flashcards, questions, answers, and explanations.

- [ ] **Step 1: Audit all Module 4 bank entries against the source material and corrected notes.** Include original, alternative, essential, generated subtype, and Battle-shared material. Record exact entry identifiers and source pages for any error. Do not change correct entries merely to reword them.
- [ ] **Step 2: For each verified mismatch, write a failing regression assertion against the real expanded pool before correcting it.** Assert the expected answer/explanation and valid option membership. Add compatibility assertions comparing pre-change and post-change question IDs/order, part anchors, and Modules 1-3 scope. If no bank error is established, record that result and do not fabricate a content change or failing test.
- [ ] **Step 3: Run the affected fidelity tests, observe the expected mismatch failures, then correct only those bank entries in place.** Preserve all bank counts and storage keys. Clarify evidence-supported MDA mappings and Zachman row distinctions in cards without inserting/reordering entries.
- [ ] **Step 4: Run `npm test` and `npm run build`.** Expected: exit 0 for both; every Module 4 answer remains gradeable, Battle draws still work, and archived midterm tests still exclude Module 4.
- [ ] **Step 5: Obtain one independent whole-change review.** Review source fidelity, diagram connections, responsive accessibility, stable identities, and the five Review Focus conditions. Address Important/Critical findings with regression tests; report any deferred minor findings.
- [ ] **Step 6: Commit the verified reconciliation and audit, then push the logical changes as authorized by AGENTS.md.** Expected: push succeeds without staging unrelated files. Deploy Convex only if shared bank content changed; verify the intended production target before doing so. Verify the Vercel deployment is Ready and inspect the live notes before claiming they are live.
