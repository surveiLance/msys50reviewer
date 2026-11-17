# Finals Practice Implementation Plan

> **For agentic workers:** Use executing-plans for the integrated work, and dispatching-parallel-agents for independent Module 4/5 question authoring.

**Goal:** Ship a balanced, source-grounded Modules 4–6 finals practice exam.
**Architecture:** Keep Quiz as the single answer/review engine. Add a scoped pool and balanced picker; register finals separately and save its own attempts.
**Tech Stack:** Next.js 15, React, TypeScript, Vitest; no new dependencies.
**Spec:** docs/superpowers/specs/2026-11-18-finals-practice-design.md

## Global Constraints
- Coverage exactly module-4, module-5, module-6. Archived midterm stays Modules 1–3.
- Long case bodies 120–170 words with lesson references and explanations for every statement.
- Defaults: Long company cases, both supported formats, untimed; 10/20/30 questions, practice pacing only.
- Preserve unrelated local changes and existing progress.

## Review Focus
- Module balancing even when only one format is checked or a module bank is exhausted.
- Existing module/midterm attempts retain their score identities; finals contributes tagged module performance.
- Stored filters from other tests do not produce an empty finals default.
- Resume and retry retain final coverage and identity; timer survives reload and auto-submits.
- Long prompt and answer feedback remain usable on phones and keyboard.

### Task 1: Content
Files: finalsModule4Cases.ts, finalsModule5Cases.ts, finals.ts in content/msys-50.
- [x] Author 20 distinct cases for each of Modules 4 and 5 using audits; verify all options/explanations and length.
- [x] Assemble the 60-case bank with stable module tags; keep source data immutable.

### Task 2: Scoped pools and round selection
Files: lib/finals.ts, tests/finals.test.ts.
- [x] Write tests for finals registration, exclusion of earlier modules, 10-per-module full rounds, seen-history exhaustion, selected formats, valid answers, and unchanged midterm.
- [x] Run tests red, implement module-scoped pools and balanced selection, then verify green.
- [x] Ensure question types and saved histories remain distinct.

### Task 3: Quiz and history integration
Files: lib/types.ts, lib/tests.ts, lib/subjects.ts; app subject/test routes; Quiz, ScoresView, NextStep.
- [x] Add explicit finals metadata and route with 10/20/30 question lengths and optional practice timer.
- [x] Save kind finals; include tagged finals performance in moduleAccuracy; test old and new identities.
- [x] Surface finals hub card, source links, per-module results, and complete answer history.

### Task 4: Verify and ship
- [x] Run full test suite, production build and diff checks.
- [x] Review source claims and implementation with fresh reviewer; address material findings.
- [x] Browser-test setup, long case radio/checkbox grading, notes review and resume. Full browser submission stalled on the preview confirmation; automated history tests cover persistence. Phone check is recorded separately if available.
- [ ] Update audit/handoff, commit and push only task files; verify live deployment.
