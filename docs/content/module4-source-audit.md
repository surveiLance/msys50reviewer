# Module 4 source fidelity audit

Audited against the owner-supplied Part 4.1 (19 pages), Part 4.2 (12 pages), and Part 4.3 (24 pages) slides on October 21, 2026. Text extraction and rendered pages were both inspected. Title/outline pages provide context; substantive pages are listed below. Original PDFs are not published.

## Authority and boundaries

The supplied lecture is the authority for this quiz reviewer. Updated owner notes clarify examples but do not override contradictory slide labels. Peer lecture recaps are supplementary, not official quiz coverage. All diagrams are original redrawings, not slide screenshots. Explanations and invented scenarios are labeled separately from slide content. Modules 1-3 and archived midterm coverage remain unchanged.

## Part 4.1

| Slide(s) | Comparison and action |
| --- | --- |
| 4-5 | Core strategies, domain relations, change tracking, framework viewpoints/modeling techniques: existing meaning supported. Keep distinct from optional processes/deliverables/metrics. |
| 6-7 | Framework adoption does not guarantee success. Keep the distinction between Lankhorst's caution and Kotusev's stronger criticism, without presenting either as a universal ban. Popular frameworks include TOGAF; its detailed discussion remains in Part 4.2. |
| 8-9 | Zachman is an artifact classification structure, introduced in 1987. Roles and product abstractions intersect, not separate lists to memorize. |
| 10 | The diagram has five rows: Planner/contextual Scope, Owner/conceptual Enterprise model, Designer/logical System model, Builder/physical Technology model, Sub-contractor/Detailed representations (out of context). Previously omitted row-label distinctions are made explicit. |
| 11 | The academic example has six perspectives and six questions. Replace the incomplete two-column enrollment illustration with a paraphrased full matrix, retaining each intersection and labeling this as the academic example rather than slide 10's row set. |
| 12-13 | Pros/cons and pragmatic adoption supported. Keep the slide's two cons separate from the explanation that classification is not a delivery method. |
| 14 | TOGAF background is covered in Part 4.2; add an explicit link there rather than silently omitting it from 4.1. |
| 15-17 | MDA has three abstraction levels and mappings in both directions. Previous one-way figure lost reverse mappings and engine/platform examples. Restore both arrows and the business/domain requirements, BPMN/UML independence, Java and WS-BPEL examples. Slide 15's terse IT-centric wording is interpreted alongside the owner's notes; do not claim MDA alone covers all EA. |
| 18-19 | SOA definitions and benefits supported. Provider-as-consumer is an owner's-notes clarification, not wording attributed to the slides. Separate the original admissions scenario from source material. |

## Part 4.2

| Slide(s) | Comparison and action |
| --- | --- |
| 4-5 | Extensive/modular, compatible, incremental adoption/certification and four named components supported. |
| 6 | Restore the overview's business framing, Capability, ADM (with Guidelines and Techniques), Content, and Continuum/Tools (with Reference Models). Preserve grouping/overlap; do not invent a causal arrow sequence absent from the slide. |
| 7-8 | Capability roles/skills/processes and Continuum's generic-to-specific context supported. Explain the four closely related content domains without conflating them with the four components. |
| 9 | Four domains supported. The owner's notes' Phase D/application wording conflicts with the phase diagram; keep D = Technology and C = Data + Application. |
| 10 | Iteration's four decisions and customization supported. Do not replace the lesson's TOGAF 9.1 depiction with an unrelated newer edition. |
| 11-12 | Replace table-only presentation with an A-H cycle, Preliminary <-> A, and two-way connections from central Requirements Management to every lettered phase. Keep the explanatory phase table. Requirements Management is not a final phase. |

## Part 4.3

| Slide(s) | Comparison and action |
| --- | --- |
| 4-5 | Acronym and orthogonal What?/How? dimensions supported. |
| 6-8 | Rules: global/permanent/periodically updated; Structures: abstract/relatively stable/continuously updated; Changes: concrete/temporary, discarded after their specific purpose. Restore the last lifecycle detail and identify lecture examples explicitly. |
| 9-11 | Business/IT focus and six cell associations are supported. Make the axes and shared column/row grouping visually explicit while retaining an accessible semantic table. Axis arrows label dimensions, not a required process sequence. |
| 12-13 | Considerations: dual, context, conceptual consistency; all five subtypes supported. Analytical Reports has no prevalence label on slide 13: leave unstated. |
| 14-15 | Standards: not dual, reusable technical rules and benefits; five subtypes supported. Technology Reference Models and Guidelines are both Essential. |
| 16-17 | Visions: dual, 3-5 years, brief/informal/graphical; five subtypes supported. Preserve Context Diagrams under Visions despite current operational flows. |
| 18-19 | Landscapes: not dual, often current, strict technical diagrams, reuse/agility/legacy benefits; four subtypes supported. Do not turn 'often current' into 'always current': IT Roadmaps are future technical plans. |
| 20-21 | Outlines: dual, 1-2 years, business value/impact/ROI; three subtypes supported. Options Assessments are Common, not Essential. |
| 22-23 | Designs: short-term, project-team actionable, approved solutions; two subtypes differ in detail, not approval status. |
| 24 | The slide reports 24 subtypes and 8/8/8 prevalence totals, typically 10-15 used pragmatically. Preserve totals alongside the Analytical Reports label ambiguity; do not infer missing labels or mandate all 24. |

## Supplementary material

The eight-essential review and connected-usage explanation are supplementary, based on the already-linked Kotusev 2017 paper and BCS presentation. Keep them visibly distinguished from lecture claims. No maturity levels, quiz-scope guarantees, or administrative announcements are added.

## Study-bank reconciliation

Pending Task 2: audit existing flashcards, original/alternative/essential questions, generated subtype items, and Battle-shared content in place. No bank identity or saved-progress migration is planned.

## Notes verification

- New relationship checks failed first for the five missing/incomplete figure outputs, then passed after the redraws. The parser still returns 5/5/10 sections with unchanged review IDs and 22 guide answers.
- Desktop inspection: all three parts, diagrams and matrix; dark/blue and light/amber text, lines, and labels readable. The long Phase G label was reduced slightly after measuring inadequate circle padding.
- Narrow inspection: requested 390px; the in-app browser enforces an effective 520px minimum. At that width, document width stays 520px while Zachman, CSVLOD, and SVG regions scroll internally. Keyboard Right Arrow changes the grid's scroll position. This is not a claim of a verified 390px viewport.
- Expanded the slide-10 row distinction; navigated directly to existing part/section anchors; the Part 4.2 Show all answers control opens all three guide answers.
- Browser regression found during a disposable 127.0.0.1-origin blank-question run: Review in notes for CIM inserted two HTML `<mark>` elements into the SVG, leaving visible `Model ()`. Skipping SVG text in NotesPeek highlighting fixes this: after rebuilding, the same saved question produces zero SVG marks, the intact `Model (CIM)` label, and one HTML answer highlight. The existing localhost-origin unfinished practice run was not replaced.
- Full test suite and production build pass before the notes commit. Final independent review and live deployment verification remain for Task 2.
