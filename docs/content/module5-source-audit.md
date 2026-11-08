# Module 5 source audit — November 8, 2026

Status: source inspection complete; Module 5 notes/data and solo/Battle integration implemented locally. Browser verification, independent review, and deployment are recorded separately below; this status alone is **not** proof of a production deployment.

## Scope and authority

- Supplied `ea-5.1.pdf` (21 slides), `ea-5.2.pdf` (14 slides), `ea-5.3.pdf` (13 slides).
- ONLY the Module 5 section of `✏️ YEAR 3 NOTES (3).pdf`: begins on PDF page 48 after the preceding module's material, continues through page 62. Do not ingest the earlier Module 4 maturity-model notes at the top of page 48.
- All 18 user-supplied guide questions: 9 for 5.1, 5 for 5.2, 4 for 5.3.
- Required-reading references are retained as references, **not verified textbook coverage**. The subsequently supplied 204-page ebook advertisement contains front matter and unrelated hidden text, not the assigned readings; exclude it entirely.
- Preserve slide terminology. Label original explanations/examples separately from source statements. A class note that conflicts with a slide is not sufficient grounds for a graded claim.
- Do not publish source PDFs, slide screenshots, or a textbook copy. Use original explanations and accessible semantic redrawings.

## Part 5.1: Architecture Analysis & Modeling

Main-agent inspection: all 21 slides rendered and viewed; corresponding class-note pages 48–54 rendered and viewed. Text extraction alone misses the figures on slides 5, 9, 13, and 18.

| Slide | Material to retain | Notes destination |
|---|---|---|
| 1–3 | Course/part title and four-topic outline; no independent quiz facts | Part introduction |
| 4 | Integrated enterprise perspective; description language must support suitable abstraction and integration; model-based analysis; model value realized through decision-making and informed design changes | Describing architecture |
| 5 | Functional/quantitative and analytical/simulation are **two different classification axes**, not four competing categories | Analysis techniques + two-axis diagram |
| 6 | Functional insight, change impact, correctness validation; not measurements of speed/cost | Functional vs quantitative |
| 7 | Quantitative: alternative-design optimization, change-impact assessment, capacity planning; performance/reliability/cost metrics | Functional vs quantitative |
| 8 | Model as abstract, unambiguous conception of selected real-world aspects; enterprise products/processes/applications/infrastructure AND relationships; goal-driven; architect selects relevant aspects | Model and purpose |
| 9 | Communication; introduce, agree on, commit to knowledge representation; three input/output streams and top-level knowledge goals/guidelines | Transformation figure + explanation |
| 10 | All six modeling activities, individually explained | Basic activities |
| 11 | Introduce, refine, abandon, abstract, translate; document modeling actions | Actions vs activities |
| 12 | All twelve modeling guidelines, individually explained | Modeling guidelines |
| 13 | All four Grice maxims AND all subpoints embedded in image | Grice's Maxims |
| 14 | All seven pre-modeling questions | Before modeling checklist |
| 15 | All six selection/focus guidelines | What to capture |
| 16 | Key concepts/relations first at high abstraction; limited predefined levels; levels depend on goals; levels consistent | Abstraction |
| 17 | All six structural dimensions AND associated structures | Structural dimensions |
| 18 | All eight structuring principles; both layered claims example and phase-grouping example | Structuring models + accessible diagrams |
| 19 | Diagnose breakdowns using readability and effect | Modeling breakdowns |
| 20 | All five readability problems | Readability vs effect |
| 21 | All eight effect problems | Readability vs effect |

### Figure fidelity: slide 5

- Vertical axis: Quantitative at top, Functional at bottom.
- Horizontal axis: Analytical at left, Simulation at right.
- Explain that the first axis asks **what kind of question/result**, while the second asks **how analysis is performed**. Do not equate analytical with quantitative.
- Simulation/analytical explanations beyond these labels must be marked plain-language clarification, not invented lecture quotations.

### Figure fidelity: slide 9

- Top input: Knowledge goals & Guidelines → Modelling Process.
- Input/output stream 1: Knowledge / Agreements / Commitments → process → Knowledge / Agreements / Commitments.
- Stream 2: **(Model)** → process → **Model**.
- Stream 3: Way of Modelling → process → Way of Modelling.
- Class-note clarification on page 50: parentheses indicate the initial model may not exist yet. Iterative before/after modeling sessions change more than a drawing.
- Do not redraw this as an irreversible three-stage waterfall, or as model-in/model-out alone.

### Enumerations that must survive simplification

**Activities (6):** establish scope/purpose/focus; select viewpoint(s); create/structure model; visualize; use; maintain.

**Actions:** introduce; refine; abandon; abstract; translate; document modeling actions. The slide lists documenting alongside the other actions; do not omit it over a terminology debate. Distinguish activity stages from edits/transformations to model content. Use class-note zoom-in/zoom-out explanation for refine/abstract; ordinary explanations for the remaining names must not pretend to be detailed textbook definitions.

**Modeling guidelines (12):** answer questions; distinguish model from visualizations; iterate; model for dynamics; economical models; economical views; recognizable concepts; recognizable structures; internal consistency; consistency between related models; correctness/completeness as needed; orthogonal concerns.

**Grice maxims (4):**
- Quantity: information sufficient for the goal, not excessive.
- Quality: do not model what is believed false or lacks adequate evidence.
- Relevance: include what relates to the modeling goal.
- Manner: avoid obscurity, avoid ambiguity, be brief (avoid unnecessary concepts/relations), be orderly.

**Before modeling (7):** clear stakeholder; explicit objective; model useful to that objective; clear boundaries; as-is vs to-be specified; information obtainable; realistic expectations of architect's role.

**What to capture (6):** goal-matched design viewpoints; focus; omit secondary matters/exceptions; willing to abandon elements; discuss stable intermediate versions with stakeholders; start from one element. Explain that purposeful omission must not remove goal-critical information, rather than teaching 'always ignore every exception'.

**Structural dimensions (6):**
- Functionality → functional decomposition.
- Time → temporal structure, data flow, control flow.
- Usage → dependencies, call graphs.
- Location → physical distribution.
- Data structure → type/class hierarchies.
- Work → implementation units, module structure.

**Structuring principles (8):** self-explanatory model; separate internal/external behavior; layers; group by phase; group by product/service; group by information used; group by physical distribution; group by independent parts.

**Readability problems (5):** not understood; understood incorrectly; no intuitive structure; unclear structure/notation; distracting visualization.

**Effect problems (8):** lacks status; true but unwanted message; irrelevant; superfluous statements; too complex; too vague; insufficiently complete; untrue.

### Figure fidelity: slide 18

Top example (layers):
- Business processes: Handle claim contains Register → Accept → Adjudicate → Pay.
- Application services: Document storage service, Customer administration service, Claim administration service, Printing service, Payment service.
- Application components: Document management system, CRM system, Home & Away policy administration, Home & Away financial application.
- Component realization links (corrected after independent 600-dpi inspection of crossed lines): Document management system → Document storage service AND Printing service; CRM system → Customer administration service; Home & Away policy administration → Claim administration service only; Home & Away financial application → Payment service.
- Visible service-use arrows: Document storage service → Register; Customer administration service → Register; Claim administration service → Accept only; Printing service → Adjudicate AND Pay; Payment service → Pay.
- Retain the distinction between process, service, and implementing component; do not collapse the service row into software components.

Bottom example (phases):
- Damage occurred → Register → Accept → Adjudicate → Pay.
- Managing Customer Relations groups Register.
- Claims Processing groups Accept and Adjudicate.
- Financial Handling groups Pay.
- Labels explain structuring choices; no insurance-industry claim beyond this illustrative model is implied.

### Class-note additions and caution

- Pages 48–49 emphasize decision usefulness, functional behavior/characteristics, quantitative KPIs/statistical data, and that not every nonfunctional requirement is quantitative (e.g., intuitive interface).
- Do not teach that quantitative analysis must always use statistics, or that simulation cannot be functional. The slides' independent axes govern this distinction.
- Page 50: refine as zoom-in; abstract as zoom-out; iterative sessions and optional initial model.
- Page 51: dynamics/flexibility; economy without missing essential information; concerns handled separately, even for the same stakeholder. Do not make this an absolute ban on connected, multi-concern architecture models.
- Pages 53–54 label readability 'center' and effect 'recipient'; likely transcription of **sender**, not a defined architecture term. Use communication sender/recipient as an explanatory analogy, not a quiz term 'center'.
- Page 54 appends 'UPDATES' to 'lacks status' and describes nonresponse. The slide says **lacks status**. Preserve that phrase and distinguish uncertain interpretation; do not test 'status = progress updates' as fact.
- Page 54 true-but-unwanted-message examples: high costs, threatened positions/downsizing. These illustrate resistance even when a message is understood and true. Do not conflate with falsehood/readability.

## Part 5.2: Views and Viewpoints

Independent source audit: every slide rendered/viewed, image tables checked at 200 dpi, corresponding class-note pages 54–58 viewed. No web or purported textbook content used.

| Slide | Complete content / required destination |
|---|---|
| 1–3 | Course/part cover and outline: views/viewpoints/visualizations, choosing, guidelines, categories |
| 4 | View = what stakeholder sees; viewpoint = where looking from, including concepts/models/analysis techniques/visualizations. Building blocks ↔ toolbox → specialized lenses; arrows corrupted in extracted text |
| 5 | Eight stakeholder groups: upper-level management, middle-level management, end-user, architect, operational manager, project manager, system developer, system administrators |
| 6 | Image-only Model/View/Visualisation diagram, four labeled directional arrows and viewpoint guidance below; details below |
| 7 | Choose viewpoints using two criteria: purpose and content |
| 8 | Designing for designers, sketch to detailed design; deciding for managers/decisions; informing for stakeholders, understanding/commitment/convincing adversaries |
| 9 | Details = one layer/one aspect; coherence = multiple layers OR multiple aspects; overview = multiple layers AND multiple aspects. Include software engineer/UML class, operational manager/processes/services, architect/decision maker/CEO examples |
| 10 | Image-only independent purpose/content classification with stakeholder examples; details below |
| 11 | Entire image-only purpose table, including every stakeholder/purpose/example cell |
| 12 | Entire image-only abstraction table, including additions beyond slide 9 |
| 13 | Five guidelines: scoping, creation of views, validation, obtaining commitment, informing; representations vs impact explicitly distinguished |
| 14 | Six viewpoint categories/groups and all supplied examples; do not invent the unlisted “etc.” |

### Figure fidelity: slide 6

| From | To | Label |
|---|---|---|
| Model | View | select / derive |
| View | Model | update |
| View | Visualisation | visualise |
| Visualisation | View | update |

A Viewpoint bar below guides both transformations via two unlabeled upward arrows; Architect and Stakeholder enter it from opposite sides. Interpret guidance as an explanation, not a source-labeled extra relation. Do not remove update arrows, conflate view with visualization, place viewpoint last in a serial pipeline, or invent cardinalities.

### Classification diagram: slide 10

- Purpose sectors: Designing (architect, software developer, business process designer), Deciding (product manager, CIO, CEO), Informing (customer, employee, others).
- Content bands from inner to outer: Details, Coherence, Overview.
- These are independent classifications, not one-to-one Designing=Details/Deciding=Coherence/Informing=Overview pairs, maturity levels, or a required sequence.

### Full purpose table: slide 11

The source's first header is blank; label it 'Purpose category' in the accessible redraw. Remove only layout-induced word-break hyphens.

| Purpose category | Typical stakeholders | Purpose | Examples |
|---|---|---|---|
| Designing | Architect, software developer, business process designer | Navigate, design, support design decisions, compare alternatives | UML diagram, BPMN diagram, flowchart, ER diagram |
| Deciding | Manager, CIO, CEO | Decision making | Cross-reference table, landscape map, list, report |
| Informing | Employee, customer, others | Explain, convince, obtain commitment | Animation, cartoon, process illustration, chart |

### Full abstraction table: slide 12

The source's first header is blank; label it 'Content / abstraction level' in the redraw.

| Content level | Typical stakeholders | Purpose | Examples |
|---|---|---|---|
| Details | Software engineer, process owner | Design, manage | UML class diagram, Testbed process diagram |
| Coherence | Operational managers | Analyse dependencies, impact of change | Views expressing relations like 'use', 'realise', and 'assign' |
| Overview | Enterprise architect, CIO, CEO | Change management | Landscape map |

Source typography prints 'impact of-' at the end of a line followed by 'change'; use the clearly intended 'impact of change', not a spelling quiz. Testbed is an example name only: do not invent its definition. Keep the source's historical use/realise/assign wording, and accept British/American spelling where typed. A landscape map can be BOTH Deciding purpose and Overview content. Examples are typical, not exclusive; a picture's format alone cannot uniquely determine its purpose.

### Guidelines and categories

**Guidelines (5):**
- Scoping: select viewpoints/subdomains and constraints.
- Creation of views: select contents, possibly from a larger model.
- Validation: stakeholder agreement with representation.
- Obtaining commitment: stakeholder agreement with potential impact.
- Informing: disseminate to other stakeholders.

**Categories/groups (6):**
- Basic design: Introductory, organization, application usage.
- Motivation: Stakeholder, goal realization.
- Strategy: Capability Map, Resource Map.
- Implementation and migration: Project, migration.
- Combined viewpoints (no examples supplied).
- ArchiMate and TOGAF viewpoints (no examples supplied).

### Class-note additions and reconciliations

- Pages 54–55 label stakeholder roles 'common viewpoints'. Prefer 'stakeholder groups whose concerns shape viewpoints'. Notes say system manager/system administration; slide 5 says system developer/system administrators. Use slide list for exact answers, not invented equivalence.
- Page 55 emphasizes starting from stakeholders. Do not claim their views necessarily exhaust all organization detail. Notes' 'designing = very limited scope' is not a universal purpose definition; purpose and content remain independent.
- Page 56 illustrations use Business/Applications/Technology rows and IT/Marketing/HR columns. These department labels are **class-note illustrative dimensions, not the formal ArchiMate aspect taxonomy**.
- Details image highlights Technology × IT; the prose offers Business × IT and Applications × IT as other single-cell examples. Do not combine two layers and still call it Details.
- Coherence image illustrates a Technology-row strip and HR-column strip; teach the class's alternatives: one layer across multiple aspects OR multiple layers in one aspect. Overview spans multiple of both; it need not cover every cell or meet an invented numeric majority threshold.
- Page 57 reproduces slides 10–12; all those image contents vanish from text extraction. Originals used for table verification.
- Pages 57–58: scoping starts with stakeholder, chooses viewpoint and relevant content; validation is iterative; signatures/documentation can record commitment; consistent artifacts can combine across viewpoint categories/TOGAF and ArchiMate. Do not require signatures universally or conflate an artifact framework with a modeling language.

### Assessment exclusions / precision

No Testbed internals, exact model/view cardinalities, compulsory purpose↔content pairing, majority threshold for Overview, arbitrary exhaustive category subtypes, or universal signature rule. Exact Deciding audiences vary harmlessly between product manager (slide 10) and manager (slide 11); cite context if testing that level of detail.

## Part 5.3: Language for Enterprise Modeling

Independent visual audit complete for all 13 slides and class-note pages 58–62. Full findings follow. Product authoring/coverage links remain pending.

### Detailed Part 5.3 inspection

Read-only audit completed 2026-11-08. No repository/product files were changed. This document is a factual authoring map, not finished reviewer prose.

## Sources and inspection scope

- Primary supplied slides: `/Users/lance/Downloads/ea-5.3.pdf`, 13 PDF pages/slides, title metadata `ea-5.3v2`. All 13 pages were rendered and inspected visually, and compared with `/private/tmp/mags-module5.ZVdkWo/5.3.txt`.
- Class notes: `/Users/lance/Downloads/✏️ YEAR 3 NOTES (3).pdf`, only the Module 5.3 portion beginning on PDF page 58 and continuing through page 62. Page 58 above the Module 5.3 heading belongs to Module 5.2 and is outside this audit. Text counterpart: `/private/tmp/mags-module5.ZVdkWo/year3.txt`, line 1844 onward.
- High resolution crops were used for slides 9 and 10 and the exceptional ODMS connector. The figures embedded in the class notes were also inspected.
- The separately uploaded/fake textbook was not used. References to Lankhorst below report what the slides themselves cite; they do not claim the book was consulted.
- Rendered source images are under `/private/tmp/mags-audit53/rendered/`. `slide-01.png` through `slide-13.png` cover all slides; `notes-58.png` through `notes-62.png` cover the relevant notes pages. `crop-9.png`, `crop-10.png`, and `crop-10-odms-arrow.png` preserve the detailed checks.

## Main authoring cautions

1. Most information on slides 7, 9, and 10 is an image and is absent from the slide text extraction. Do not treat the extracted text as complete coverage.
2. The class notes' heading `Core Concepts of ArchiMate Application` is narrower than the actual slide 9 title, `Core Concepts of the ArchiMate Language`. The diagram is a general conceptual template for a layer, not specifically an application-layer example.
3. The notes' `SUBJECT-VERB-AGREEMENT` mnemonic is a mistake if it is intended to name the three structural aspects. Use **subject - verb - object** as an informal analogy: active structure - behavior - passive structure. Grammatical subject-verb agreement is a different concept.
4. The class notes' `RECEIVER of action` is only an informal shortcut for passive structure. Explain it as **the thing or information that behavior acts on/accesses**, rather than asserting that every recipient of a service is a passive structure element. A person/system receiving a service may still be active structure.
5. Slide 11's step 2 is **Determine purpose, scope, and viewpoint**. The notes shorten it to selecting an appropriate viewpoint and omit purpose/scope. Preserve the complete slide sequence.
6. The academic lifecycle example contains a connector anomaly: `Identity & Access Service` to `Onsite Digital Facilities Management & Load Balancing System (ODMS)` has a **solid line and filled triangular arrowhead**, whereas the neighboring service-to-application lines have open arrowheads. Under the legend on slide 8 the former looks like **Triggers**, not **Serves**. The 600 dpi crop confirms the filled head. Do not silently redraw that connector as a serving relation or use its relationship name as a scored quiz fact. It is safe to say the two are connected in the model and to flag the diagram's notation.
7. Slide 9 contains solid connectors with black circles at both ends and a filled-diamond connector; these are not introduced in slide 8's six-item common-relations list. Preserve their visible form if reproducing the diagram. Avoid confidently naming them in a quiz solely from these supplied materials. The filled-diamond relation is consistent with composition and the circle-ended connections with assignment, but those names are interpretation, not labels supplied on slide 9.
8. Do not turn the reference-only expanded topics on slides 12-13 into detailed substantive coverage without a real supplied source. No ArchiSurance scenario details are given beyond its being fictitious and an insurance company.

## Per-slide factual map

### Slide 1 - course cover

- Text: `MSYS 50: Enterprise Architecture`.
- Decorative architecture photograph/orange panel; no examinable content beyond course identification.

### Slide 2 - module cover

- Module 5.3 is **Language for Enterprise Modeling**.
- No additional concepts or diagram.

### Slide 3 - outline

- ArchiMate for EA.
- Service Orientation and Layering.
- Language Concepts and Usage.
- Three outline topics, not three architecture layers.

### Slide 4 - ArchiMate: A Modeling Language for EA

- Developed by **The Open Group**.
- Formal, notation-based language.
- Supports different abstraction layers.
- Class notes PDF p.58 repeats these points and adds the informal emphasis `technical!`.
- Safe interpretation for understandable notes: ArchiMate supplies a formal notation for describing EA across abstraction layers. Do not equate ArchiMate with the Archi software tool: slide 10 says the example was made using **Archi**, while slide 4 names the **ArchiMate language**.

### Slide 5 - Service Orientation and Layering

- Service concept has a central role.
- A service is a **unit of functionality** an entity makes available to its environment, with value to certain entities in that environment.
- Granularity may be discerned.
- This leads to a layered view of EA models, forming a stack of layers.
- The class notes repeat these points across pp.58-59.
- For prose, retain both halves of the definition: externally available functionality and value to entities in the environment. Do not reduce a service to simply a software program or a task.

### Slide 6 - Basic Architecture Layers

| Layer | Slide's function | Slide's realization/detail |
|---|---|---|
| Business | Offers products/services to customers | Realized by business processes |
| Application | Supports business layer through application services | Realized by software application components |
| Technology | Supplies infrastructural services needed by applications | No additional implementation bullet on this slide |

- Class notes p.59 repeat this complete set.
- Avoid conflating the three basic layers with the alternating service/implementation bands in slide 7. Each architectural level can have a service view and an implementation view.

### Slide 7 - Layered View

Text bullets:

- Services serve as links between layers.
- **Service layers**: green swatch.
- **Implementation layers**: pale yellow swatch; realize services.
- **Internal services**: within a layer.

Image inventory, top to bottom:

1. `Customers` - pale yellow, includes a stick-person icon.
2. `Business services` - green.
3. `Business processes` - pale yellow.
4. `Application services` - green.
5. `Application components` - pale yellow.
6. `Infrastructural services` - green.
7. `Technical infrastructure` - pale yellow.

Every adjacent pair is linked by three representative upward arrows. These are schematic repeated arrows, not named organizations, systems, or individual services:

- Business services -> Customers: solid open arrowheads (services provide functionality to customers).
- Business processes -> Business services: dashed lines with hollow triangle arrowheads (realization).
- Application services -> Business processes: solid open arrowheads.
- Application components -> Application services: dashed hollow-triangle realization arrows.
- Infrastructural services -> Application components: solid open arrowheads.
- Technical infrastructure -> Infrastructural services: dashed hollow-triangle realization arrows.

The application-components band is expanded by two dashed diagonal guide lines into a tan inset on the right. Those diagonal guides mean **zoom/decomposition**, not a separately named ArchiMate relation in the legend. The inset contains, top to bottom:

1. `Primary application components` - pale yellow.
2. `Internal application services` - green.
3. `Supporting application components` - pale yellow.

- Supporting application components -> Internal application services: three dashed hollow-triangle arrows (realization).
- Internal application services -> Primary application components: three solid open arrows (serving/providing functionality).
- The point of the inset: services can connect implementation parts **inside** an architectural layer, not only connect separate business/application/technology levels.
- Image source printed on slide: Lankhorst, *Enterprise Architecture at Work: Modelling, Communication and Analysis*, 4e, 2017.
- Class notes p.59 add `Can zoom in - deciding granularity` and `Service layers ... more abstract`. These additions fit the visible inset and the service-vs-implementation separation.
- Important diagram-only content missing from extraction: all seven stack labels; all three inset labels; arrow styles/directions; green/yellow legend; application-layer zoom.

### Slide 8 - Core Concept Elements

Text and samples:

- Examples include **business process, business actor, application component, equipment**, etc.
- These are categorized under business, application, technology, physical, etc.
- The sample `Business Process` is a rounded yellow rectangle with the process-arrow glyph in its upper right.
- The sample `Application component` is a blue-green rectangle with the small component glyph.
- A generic `Service` is illustrated as a rounded blue rectangle with a small horizontal capsule glyph.
- The sample colors are presentation colors; do not infer a universal fixed palette from this single slide. The academic example uses yellow business, cyan application, green technology/physical.

The six **common relations**, in exactly the slide's displayed order:

| Name on slide | Visible line/glyph | Supported wording |
|---|---|---|
| Association (generic) | Solid line with no arrowhead | Generic association |
| Realizes | Dashed line, hollow triangular arrowhead | Realizes |
| Serves (provides functionality to) | Solid line, open non-triangular arrowhead | Provides functionality to |
| Flow | Dashed line, filled triangular arrowhead | Flow |
| Triggers | Solid line, filled triangular arrowhead | Triggers |
| Access | Dashed/dotted line, open non-triangular arrowhead | Access |

- The display points arrows to the right; source/target in a real model depends on how the relation is drawn.
- The text alone does not define every relation's semantics. If elaborating, make plain that realizations connect implementation to a service, serving means provision of functionality, flow represents transfer, triggering represents causal/temporal progression, access concerns a passive object; the first two are directly reinforced by slides 6-7/10, while the fuller glosses for flow/triggering/access are explanatory descriptions of the relation names and notation, not additional printed definitions.
- Class notes pp.59-60 reproduce all samples and the relation legend.

### Slide 9 - Core Concepts of the ArchiMate Language

This is the highest-risk image omission in the extracted text: there is almost no extracted content apart from the title/source.

The diagram has **two abstraction rows** and **three aspect columns**:

| Row | Passive structure column | Behaviour column | Active structure column |
|---|---|---|---|
| External | No external passive box is shown | `Service` | `Interface` |
| Internal | `Passive structure element` | `Behaviour element` | `Active structure element` |

- `External` and `Internal` are row labels at left.
- Bottom labels: `Passive structure`, `Behaviour`, `Active structure`.
- Service and Behaviour element are rounded pale-yellow rectangles (behavior aspect).
- Interface and Active structure element are pale-cyan rectangles (active structure aspect).
- Passive structure element is a pale-green rectangle with a horizontal header-style line.
- Service has a capsule glyph; Interface has a small lollipop-like glyph at upper right.
- The full diagram is a conceptual pattern that can be instantiated for a layer. It is not the complete three-layer stack.

Every visible connector:

1. **Behaviour element -> Service**: upward dashed line ending in a hollow triangle at Service. Matches **Realizes** in slide 8. Internal behavior realizes the external service.
2. **Service -> Behaviour element**: downward solid line ending in an open arrowhead at Behaviour element. Matches **Serves** in slide 8. This separately permits one service to provide functionality to behavior; do not confuse it with the upward realization line.
3. **Service <-> Interface**: horizontal solid line with a filled black circle at each endpoint. No arrowhead/direction shown. This notation is not named in slide 8.
4. **Interface -> Active structure element**: downward solid line with an open arrowhead at Active structure element. Matches the **Serves** visual in slide 8.
5. **Interface -- Active structure element**: a second downward solid line, separate from #4, ending in a **filled diamond at the Active structure element end**. Consistent with an active structure composed of interfaces, but the supplied slide does not label it `composition`.
6. **Behaviour element <-> Active structure element**: horizontal solid line with a filled black circle at each endpoint. No arrowhead/direction shown; notation not named in slide 8.
7. **Passive structure element <-> Service**: dotted connector that leaves passive structure, bends upward and right, and has open arrowheads at **both** the passive structure and the Service end. It is the access-style pattern in slide 8; the visible diagram allows the access directions represented by the two heads. Do not call it a flow.
8. **Passive structure element <-> Behaviour element**: horizontal dotted connector, with open arrowheads at both ends. Again an access-style connector.
9. **Behaviour element -> Behaviour element**: solid loop at lower left returning with a filled triangular head into the behavior box's bottom. Matches **Triggers**.
10. **Behaviour element -> Behaviour element**: separate dashed loop around the solid loop, returning with a filled triangular head into the bottom. Matches **Flow**.

There is **no** drawn direct link between passive and active structure, and **no** external passive box. A simplified rewrite must not invent either.

Class notes p.60:

- Heading is `Core Concepts of ArchiMate Application`; use slide's more accurate general-language title when authoring.
- Note says this is only one layer of the layered view.
- Note says it shows how the upper layer avails of the service.
- The diagram actually includes more than upward-layer use: internal aspects and interface/service exposure, realization, access, and behavior-to-behavior relations. Preserve that broader purpose.
- Printed slide source is Lankhorst, *Enterprise Architecture at Work: Modelling, Communication and Analysis*, 4e, 2017.

### Slide 10 - Academic Lifecycle Management for an Academic Institution Using Archi

The three large gray containers are labeled:

1. `BUSINESS PROCESS LIFECYCLE LAYER`
2. `APPLICATION LAYER`
3. `TECHNOLOGY & PHYSICAL LAYER`

There are **21 named elements**, in addition to the three container labels. All 21 labels are readable; none needs guessing.

#### Full element inventory

Business process lifecycle layer: **8 elements**, yellow:

- `Admissions Officer` - rectangular active-structure item, small role-style icon.
- `Academic Faculty` - rectangular active-structure item, same role-style icon.
- `1. Apply & Register` - rounded process, process-arrow glyph.
- `2. Enroll & Schedule` - rounded process, process-arrow glyph.
- `3. Deliver & Assess` - rounded process, process-arrow glyph.
- `4. Award Degree` - rounded process, process-arrow glyph.
- `Student Record` - passive object box, separated header line.
- `Course & Grades` - passive object box, separated header line. It is singular **Course**, not Courses.

Application layer: **5 elements**, cyan:

- `Student Registration Service` - rounded service, capsule glyph.
- `E-Learning Service` - rounded service, capsule glyph.
- `Student Information System (SIS)` - application-component rectangle with two small left-hand tabs.
- `Onsite Digital Facilities Management & Load Balancing System (ODMS)` - application-component rectangle with left tabs. Preserve the full label; do not expand ODMS as something else.
- `Learning Management System (LMS)` - application-component rectangle with left tabs.

Technology & physical layer: **8 elements**, green:

- `Database Storage Service` - rounded service, capsule glyph.
- `Identity & Access Service` - rounded service, capsule glyph.
- `Cloud-Based Services` - rounded service, capsule glyph; plural **Services**.
- `RDBMS Server Cluster` - rectangular item, small monitor/computer glyph.
- `Account Identity Server` - rectangular item, small monitor/computer glyph.
- `Cloud Management Portal` - rectangular item, small cube glyph.
- `Main Data Center` - rectangular item, small factory/facility-like glyph.
- `Amazon Web Services` - rounded item with a **service capsule glyph**, even though its name is a provider's brand. Describe it as the named item in the example; avoid asserting that its depicted notation is a node or an actor.

Do not call the business role-style icons stick-person actors; the model uses different glyphs than the Customers actor in slide 7. Broadly classifying the named people/roles as active structure is safe; distinguishing role vs actor by name alone is not.

#### Complete connector inventory

There are **27 drawn connectors** in the lifecycle figure. Connector categories below use the legend where it applies, and explicitly flag the exceptional symbol.

Business assignment-style links (black source dot, downward filled arrowhead):

1. Admissions Officer -> 1. Apply & Register.
2. Academic Faculty -> 3. Deliver & Assess.

Process sequence, solid filled-head triggering arrows:

3. 1. Apply & Register -> 2. Enroll & Schedule.
4. 2. Enroll & Schedule -> 3. Deliver & Assess.
5. 3. Deliver & Assess -> 4. Award Degree.

Passive-object accesses, dotted lines with open arrowhead at object:

6. 2. Enroll & Schedule -> Student Record (long upward/right diagonal).
7. 3. Deliver & Assess -> Student Record (short upward/right diagonal).
8. 4. Award Degree -> Student Record (vertical upward).
9. 2. Enroll & Schedule -> Course & Grades (long downward/right diagonal).
10. 3. Deliver & Assess -> Course & Grades (short vertical downward).
11. 4. Award Degree -> Course & Grades (short vertical downward from the lower-left region of Award Degree).

- No visible object-access connector starts at Apply & Register.
- These arrows point **toward the object**. Do not invent read/write labels printed nowhere in the model, or claim both directions as slide facts.

Application-service provision to business processes, solid open-head serving arrows:

12. Student Registration Service -> 1. Apply & Register (vertical).
13. Student Registration Service -> 2. Enroll & Schedule (steep diagonal).
14. Student Registration Service -> 3. Deliver & Assess (diagonal).
15. E-Learning Service -> 3. Deliver & Assess (vertical).

- Student Registration Service is shown serving **three** business processes, not just registration.
- E-Learning Service is shown serving Deliver & Assess, not the entire four-step chain.

Application components realizing application services, dashed lines with hollow-triangle heads at service:

16. Student Information System (SIS) -> Student Registration Service.
17. Onsite Digital Facilities Management & Load Balancing System (ODMS) -> E-Learning Service.
18. Learning Management System (LMS) -> E-Learning Service.

- E-Learning Service has **two** realizing components: ODMS and LMS.
- There is no line from ODMS to Student Registration Service.

Technology services connected to application components:

19. Database Storage Service -> Student Information System (SIS): solid open-head serving arrow.
20. Identity & Access Service -> Onsite Digital Facilities Management & Load Balancing System (ODMS): solid **filled-head** arrow. The source symbol differs from the open serving arrowheads at #19/#21 and matches `Triggers` in slide 8. Treat the intended semantic label as an ambiguity/error in the source illustration. The endpoints are clear.
21. Cloud-Based Services -> Learning Management System (LMS): solid open-head serving arrow.

Technology implementation realizing services, dashed lines with hollow-triangle heads at service:

22. RDBMS Server Cluster -> Database Storage Service.
23. Account Identity Server -> Identity & Access Service.
24. Cloud Management Portal -> Cloud-Based Services.

Other lower-level provision links, solid open-head arrows:

25. Main Data Center -> RDBMS Server Cluster.
26. Main Data Center -> Account Identity Server.
27. Amazon Web Services -> Cloud Management Portal.

#### Interpretive walk-through grounded in the diagram

- At the business level, Admissions Officer is assigned to Apply & Register; Academic Faculty to Deliver & Assess; the lifecycle runs through the four numbered processes to Award Degree.
- Enroll & Schedule, Deliver & Assess, and Award Degree each access the Student Record and Course & Grades objects.
- Student Registration Service supports the first three processes and is realized by SIS. E-Learning Service supports Deliver & Assess and is realized by both ODMS and LMS.
- Database Storage Service connects to SIS and is realized by the RDBMS Server Cluster. Identity & Access Service connects to ODMS and is realized by the Account Identity Server, with the arrowhead caveat above. Cloud-Based Services supports LMS and is realized by the Cloud Management Portal.
- Main Data Center connects upward to both the RDBMS Server Cluster and Account Identity Server. Amazon Web Services connects upward to Cloud Management Portal.
- The example illustrates traceability across business, application, and technology/physical levels. Do not invent causal claims such as “AWS stores all student records” or “the admissions officer runs the LMS”; those are not drawn.

Class notes p.61 reproduce this figure and add an internal/external teaching analogy:

- Internal = implementation.
- Active structure = subject; actor/system; what performs the interaction.
- Behavior = verb, action or task; what they do in the interaction.
- Passive structure = what they interact with; notes call it receiver of action; examples `student records; mouse`.
- A sentence about tuition payment being processed by a system is unfinished (`...; i`); do not reproduce the fragment.
- Behavior example says payment is processed by cashier / picked up. A clearer original example is: **cashier (active structure) processes a payment (behavior) using the student payment record (passive structure)**. This is an explanatory analogy, not a new element in slide 10.
- The notes' mouse example is not a reliable formal element-type test: an item can be classified differently depending on what is being modeled. Prefer the diagram's Student Record and Course & Grades for passive-structure questions.
- Replace subject-verb-agreement with subject-verb-object as noted above.

Class notes p.62 complete the external analogy:

- Interface = where we interact with the system; examples cashier window / payment portal system.
- Service = what is availed; example tuition payment.
- To reduce ambiguity, describe **a payment portal's user-facing interface** rather than asserting an entire payment portal system is necessarily an Interface. The notes use the system phrase loosely.
- Service and Interface are both external-facing, but answer different questions: what functionality is provided vs where/how it is exposed. This contrast is directly supported by slide 9 and the class-note examples.

### Slide 11 - Language Concepts

- Core modeling elements are based on **layering**, **internal/external abstraction**, and **active-behavior-passive structures**.
- Use these elements with **viewpoints**.
- Four ordered steps, visually connected left to right:
  1. Identify stakeholders and concerns.
  2. Determine purpose, scope, and viewpoint.
  3. Use relevant concepts: elements, relations, rules.
  4. Construct the model.
- Class notes p.62 repeat this with the abbreviated step 2 “Select appropriate viewpoint.” Preserve the broader slide version.
- Safe quiz points: identifying a missing/misordered step; deciding that concepts should be chosen relative to the viewpoint; recognizing the three organizing dimensions.

### Slide 12 - Reference Details

- Expanded/focused concept groups listed: **composite, motivation, strategy, business layer, application layer, physical, implementation & migration, relations**.
- These help identify relevant elements, relations, and rules relative to a viewpoint.
- Reference printed: Lankhorst Sections **5.4-5.12**, pp. **78-107**.
- Additional reference: **The ArchiMate Specification Reference Cards**, with displayed link text **ArchiMate 3.1**.
- Technology is not explicitly named in this slide's expanded-topic list, even though it is a basic layer on slide 6. Do not rewrite the list as though technology were printed here; do not infer technology is absent from ArchiMate.
- The class notes do not include this slide's reference details.
- This is a pointer for further reading, not supplied definitions of the expanded concept groups. Do not quiz invented specifics of those groups.

### Slide 13 - Modeling Example

- Case study: **ArchiSurance**.
- It is a **fictitious insurance company**.
- Reference printed: Lankhorst Sections **5.15-5.18**, pp. **112-121**.
- No ArchiSurance model, actors, applications, products, organization structure, merger history, or scenario details appear on this slide.
- Class notes omit this slide.

## Coverage recommendations for the author

### High-confidence notes/flashcard/test coverage

- ArchiMate's origin, formality, notation basis, abstraction support.
- Service definition, granularity, layered stack, value to the environment.
- Three basic architecture layers and their roles/realizations.
- Alternating services/implementation in slide 7; all labels in the stack; internal application-service zoom.
- Six common relationship names and visibly distinct notations, especially Realizes vs Serves, Flow vs Triggers, and Access vs Flow.
- External service/interface vs internal behavior/active/passive structure; subject-verb-object teaching analogy.
- All 21 academic lifecycle element labels, their layer/group, four-step process sequence, service/component realization pairs, clearly depicted service-to-business links, and clearly depicted object accesses.
- The four-step viewpoint-to-model construction sequence, retaining purpose and scope.
- Reference-only identification of ArchiSurance as fictitious insurance company, if desired, without padding question banks with bibliography trivia.

### Avoid or qualify in scored questions

- Formal names for slide 9's black-circle/diamond relations unless independently sourced and explained in the finished notes.
- Calling slide 9 only “application concepts.”
- Calling subject-verb-agreement a structure-aspect triad.
- Calling every recipient of an action/service a passive structure element.
- Exact relation type for Identity & Access Service -> ODMS, given the source arrow mismatch.
- Specific read/write semantics of academic object accesses: arrows are visible but no read/write labels are printed.
- Definitive type of Cloud Management Portal or Amazon Web Services based only on their everyday names; the drawn glyphs and naming can diverge.
- Unprovided ArchiSurance case details and definitions from textbook sections only referenced by slides.
- Treating current ArchiMate version as 3.1: 3.1 is the version named in this source, not a checked claim about the current latest standard.

## Verification record

- All source slides 1-13 visually inspected at 120 dpi.
- Slides 7-10 also rendered at 300 dpi.
- Slide 9 central diagram inspected as a crop at 250 dpi.
- Slide 10 full model inspected at 300 dpi; upper process links separately enlarged at 500 dpi; exceptional Identity & Access -> ODMS filled arrowhead confirmed at 600 dpi.
- Notes PDF pages 58-62 visually inspected at 130 dpi, limited to Module 5.3 on p.58.
- Every academic-model text label is readable. No illegible label was completed by guesswork.
- No usable textbook contents were consulted and no repository files were edited.


## Required-reading limitations

- 5.1: Chapter 9 opening–9.2, printed pp. 215–218; 7.2–7.3, pp. 142–162.
- 5.2: Chapter 8 opening–8.1.2 excluding 8.1.1, pp. 171–174; opening of 8.2, pp. 176–177; 8.4.1, pp. 184–213.
- 5.3: Chapter 5 opening–5.3, pp. 73–78; 5.13–5.14, pp. 107–112.
- These ranges were supplied by the owner. Do not repair apparent heading/range ambiguity by inventing the missing reading content. Quiz practices are based on the supplied slides/class notes only.

## Implementation coverage destinations

`content/msys-50/module-5.html` is parsed by `readNotes` into three parts. Figures use original semantic tables/edge maps rather than uncaptioned slide images; all table scroll containers have accessible names and keyboard focus. All 18 guide answers are individually expandable and support Show all answers.

| Source | Reader destination | Flashcard / graded-practice coverage |
|---|---|---|
| 5.1/4 | p-5-1-s1 | Decision value, abstraction/integration MTF, multi, decision-use scenario |
| 5.1/5–7 | p-5-1-s2, m5-analysis | Independent axes, functional correctness vs quantitative metrics, optimization/capacity/change scenarios |
| 5.1/8–9 | p-5-1-s3, m5-transformation | Goal-driven model; all three transformation streams, optional initial model, workshop scenario |
| 5.1/10 | p-5-1-s4 | All six activities: individual cards, concept MC, matching; representative word-bank blank |
| 5.1/11 | p-5-1-s5 | All named actions: individual cards/MC/matching, refine scenario, typed refine/abstract distinction |
| 5.1/12 | p-5-1-s6 | All twelve guidelines: individual cards/MC/matching and application/alternative questions |
| 5.1/13 | p-5-1-s7 | All four maxims and nested points: individual cards/MC, quality and manner cases, Manner multi |
| 5.1/14–15 | p-5-1-s8 | All seven checks and six capture guidelines: individual cards/MC/matching; as-is/to-be and relevance scenarios |
| 5.1/16–17 | p-5-1-s9 | Four abstraction practices card/multi; all six dimensions individual cards/MC/matching, typed Usage, Work blank |
| 5.1/18 | p-5-1-s10, m5-claims-layers, m5-claims-phases | All eight principles individual cards/MC/matching; claim-phase and component-service cards; exact links retained in notes |
| 5.1/19–21 | p-5-1-s11 | All five readability/eight effect problems in cards and notes; targeted readability/effect/true-unwanted scenarios and multi; uncertain status interpretation not graded |
| 5.1 guides | p-5-1-s12 | All nine supplied questions answered |
| 5.2/4,6 | p-5-2-s1, m5-views | Model/view/viewpoint/visualization card, all forward and update links multi/MTF, concern-selection scenario |
| 5.2/5 | p-5-2-s2 | All eight roles in card; representative multi, no invented formal role taxonomy |
| 5.2/7–12 | p-5-2-s3, m5-purpose, m5-content | Both complete source tables in notes, individual purpose/content cards/MC/matching, example multis and blank, independent-criteria scenarios |
| 5.2 class-note grid | p-5-2-s4 | One cell/strip/area interpretation card, OR/AND scenarios, illustrative-departments caution question |
| 5.2/13 | p-5-2-s5 | All five guidelines cards/MC/matching; typed impact distinction, independent representation/commitment scenarios, dissemination case |
| 5.2/14 | p-5-2-s6 | All six category/group labels and supplied examples cards/MC/matching, category pairing multi, coherent-combination scenario |
| 5.2 guides | p-5-2-s7 | All five supplied questions answered |
| 5.3/4–6 | p-5-3-s1 | Service definition card; language/tool MTF; three layer roles cards/MC/matching |
| 5.3/7 | p-5-3-s2, m5-service-stack | All stack and inset labels/links in notes; internal-service card/scenario/MTF; serving-vs-realization scenarios/multi |
| 5.3/8 | p-5-3-s3 | Six relation names/glyphs in notes/cards/MC/matching; independent typed/alternative notation checks |
| 5.3/9 | p-5-3-s4, m5-core | Full 2×3 layout and all ten source connectors retained; all five concepts cards/MC/matching; service/interface and passive-object scenarios |
| 5.3/10 | p-5-3-s5, m5-academic | All 21 names and 27 connections retained in layer/link maps; role/object/realization/service chains in cards; tested cases support actual diagram links, not external institution assumptions |
| 5.3/11 | p-5-3-s6 | All organizing dimensions and four full steps in notes/cards; exact missing purpose/scope step and stakeholder-first questions |
| 5.3/12–13 | p-5-3-s7 | Reference groups retained, ArchiSurance identification card/MTF, evidence-boundary questions; no unseen detailed case claims |
| 5.3 guides | p-5-3-s8 | All four supplied questions answered |

### Bank size and honest counting

- 106 flashcards.
- Original practice: 30 authored MTF statements; 91 concept MC; 30 scenario MC; 18 multiple-answer; 15 word-bank blanks; 15 matching groups.
- Alternative practice: 12 separately authored mixed questions.
- MTF statements also produce plain TF variants through the existing builder. Those variants are **not counted as newly authored statements or distinct concepts**.
- Concept/blank/matching exercises intentionally revisit the lesson's same definitions in selectable formats. The 30 scenario prompts and alternative bank add applications, not merely shuffled options. Counts do not imply that every prompt assesses a different concept.

### Deliberate non-graded / limited items

- Missing textbook-only details; unexplained Testbed internals; exact model/view cardinalities; purpose/content exclusivity; all-elements Overview; mandatory signatures; unlisted exhaustive viewpoint taxonomies.
- Uncertain 'lacks status = updates' interpretation, class-note 'center' term, mistaken subject–verb–agreement mnemonic, department columns as formal ArchiMate aspects.
- Formal names of the core figure's circle-ended/diamond relations, the academic Identity & Access → ODMS relation-type anomaly, and invented read/write access labels.
- Provider brand names are kept as depicted labels, not inferred element types or real infrastructure assertions.

### Verification record

- Baseline: 53 passing tests. New tests observed failing for missing notes, missing bank/metadata/Battle questions, and inaccessible overflow wrappers before fixes.
- Focused Module 5 tests validate parsed part navigation, 18 guide answers, usable question types and option integrity, independent grading fixtures, archived-midterm exclusion, old bank preservation, and all seven M5 party draw types.
- A validated Convex API test exercises host creation/admission/readiness/start for M5 as well as M4, and verifies no answer leakage to the player-facing question.
- Vitest path alias added so tests consume the real subject registry; no mocks replace metadata/content.
- Production build initially failed because sandbox DNS could not fetch the existing Google font. A network-authorized retry passed, with 32 generated routes. No dependency change was needed.
- Independent source/code review caught two misread links in the 5.1 claims image; a 600-dpi check established Document management system → Printing realization and Claim administration → Accept only. Notes/card/audit corrected together and pinned through a delivered-table regression fixture.
- Review also found correct typed variants being rejected. Bounded aliases for the optional initial model, within-layer services, ODMS realization, and Archi tool now pass independently in solo and Battle. Two stems were repaired so replacing their underlined spans yields grammatical true statements. All three new regression tests were observed failing before fixes; full suite **63/63** and production build pass afterward.
- Browser verification on disposable local origin: all part switches and 18 guide answers, 106-card answer flip, full 10-question study-mode round (intentional wrong first answer; 9/10 final), per-question explanations, NotesPeek to the correct section, saved attempt history. No user run was overwritten.
- Responsive evidence: default actual width 832px; desktop actual 1706px; narrow actual 487px despite requested 390. No page-width overflow; academic tables contained horizontal overflow and keyboard arrows moved scrollLeft to 50. Viewport-overridden narrow screenshot had a browser capture artifact; do not claim a visual 390px verification. Light/amber and dark/blue notes inspected at default width.
