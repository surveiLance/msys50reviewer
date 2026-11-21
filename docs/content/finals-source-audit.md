# Finals practice audit — November 18, 2026

## Confirmed scope

The owner explicitly confirmed **Modules 4–6**. The practice route is `/msys-50/test/finals`; its saved run, selected formats, seen history, score kind, and history label are separate from the Modules 1–3 midterm. No official duration or number of questions has been supplied.

## Sources and boundaries

Use the supplied lesson decks and class notes, with the existing Module 4, 5, and 6 source audits. The textbook upload remains unusable as verification. Original PDFs and slide screenshots are not published. Every long scenario is fictional and cites the lesson; it is not a recalled professor exam question.

- **Module 4:** 20 new cases (10 combinations, 10 select-all). Covers framework purpose and limits; Zachman perspectives/questions; CIM/PIM/PSM and bidirectional mappings; SOA; TOGAF components vs domains; ADM iteration, tailoring, phases, and central Requirements Management; CSVLOD dimensions, duality, lifecycle, subtype choice and popularity. Contexts are 137–150 words, 155–170 including title and task. Excludes Analytical Reports popularity, the overlapping 25% boundary, disputed Phase D wording, and unsupported claims that every subtype is compulsory.
- **Module 5:** 20 new cases (10 combinations, 10 select-all); part coverage 7/7/6. Covers independent analysis axes, activities vs actions, Grice, model selection and communication, stakeholder viewpoints and independent purpose/content coverage, validation vs commitment, layered services, core concepts, relation symbols, and language selection. Contexts are 133–148 words, 148–163 including title and task. Excludes ambiguous figure connectors, unseen reading contents and unverified extension definitions.
- **Module 6:** the existing 20 long cases (10 combinations, 10 select-all), evenly split between 6.1 and 6.2. Reused with its audited sources rather than paraphrasing the same questions to inflate the bank. Benchmark/status discrepancies excluded from grading as recorded in `module6-source-audit.md`.

The original 60 passages meet 120–170 words before the statements. Each statement-combination item has three Roman-numbered statements and four distinct choices covering only one, subsets, none, or all. Select-all items have four choices with nonempty correct sets. Every statement is explained separately.

The November 21 expansion added 54 original cases across the three modules, each with two paragraphs of company context, a specific decision, and one explanation per option. The bank now has 114 cases, including 36 single best answers, 30 statement combinations, and 48 select-all questions. The original case IDs remain stable for saved rounds and question history.

## Delivery

- Default: long cases, both supported formats, untimed. Choose 10, 20, or 30 questions.
- A full 30-question round has 10 from each module when the selected formats have enough items. Shorter rounds differ by at most one question per module. If a bank is too small, redistribute unused places.
- Prioritize module balance, then unseen questions within the selected types. Multiple-choice draws mix best-answer cases and statement combinations when available. Correct answer positions rotate. Question history is separate for concept and long-case practice. Once exhausted, oldest items return first.
- Suggested pacing is two minutes per case (or one per concept question), explicitly labelled practice pacing. The timer is optional and not represented as the official exam duration.
- Existing forward-only answers, on-demand feedback, resume, wrong-answer retry, per-module breakdown, and history use the shared quiz engine.
- Source review now uses the Module 4–6 slide-to-section mapping before keyword overlap so long company context does not drown out the actual citation.
- Long snapshots exposed a browser-storage failure before the old 50-review pruning threshold. Reproduced with real case snapshots and a 5 MiB quota. History now also uses a 1,000,000 UTF-16-code-unit budget, trimming oldest answer details while preserving summaries, and retries quota failures. It retains the most recent details it can store; an actual failure to save is reported in quiz results.

## Verification

Independent content/implementation review found the storage issue above and no other actionable source/selection/identity issue. Tests cover full-round balance, single-format selection, exhausted history, sparse banks, duplicate true/false exclusion, valid case options, source references, word counts, confirmed route metadata, midterm isolation, module-strength attribution, citation-based notes review, and repeated full exams under a simulated storage quota.

Browser checks cover setup, long combination correctness (including a none-correct answer), select-all partial credit, source lesson review and checked-answer resume. The browser tool stalled on the early-submit confirmation during the end-to-end history check; automated history/retention tests cover persistence. Do not claim a completed browser submission from that check.
