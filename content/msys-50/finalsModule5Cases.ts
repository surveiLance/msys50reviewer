import type { McItem, MultiItem } from "../../lib/types";

type Explained = { w: string; r: string };
type Case = { name: string; context: [string, string]; decision: string; source: string };
type Statement = { text: string; correct: boolean; reason: string };

const roman = ["I", "II", "III"];
const escape = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const stem = ({ name, context, decision }: Case) => `<p><strong>${escape(name)}</strong></p>${context.map(p => `<p>${escape(p)}</p>`).join("")}<p><strong>${escape(decision)}</strong></p>`;
function label(indices: readonly number[]) {
  if (!indices.length) return "None of the statements are correct.";
  if (indices.length === 3) return "All three statements are correct.";
  if (indices.length === 1) return `Only statement ${roman[indices[0]]} is correct.`;
  return `Only statements ${roman[indices[0]]} and ${roman[indices[1]]} are correct.`;
}
function combination(c: Case, statements: [Statement, Statement, Statement], distractors: [number[], number[], number[]]): McItem & Explained {
  const a = label(statements.flatMap((s, index) => s.correct ? [index] : []));
  return { q: `${stem(c)}<ol type="I">${statements.map(s => `<li>${escape(s.text)}</li>`).join("")}</ol>`, o: [a, ...distractors.map(label)], a,
    w: statements.map((s, index) => `${roman[index]}. ${s.correct ? "Correct." : "Incorrect."} ${s.reason}`).join("\n"), r: c.source };
}
function checkbox(c: Case, statements: [Statement, Statement, Statement, Statement]): MultiItem & Explained {
  return { q: stem(c), o: statements.map(s => s.text), a: statements.filter(s => s.correct).map(s => s.text),
    w: statements.map(s => `“${s.text}” ${s.correct ? "Correct." : "Incorrect."} ${s.reason}`).join("\n"), r: c.source };
}

// Original fictional practice cases. These do not reproduce professor questions,
// extend reference-only readings, or grade unresolved source-diagram notation.
export const module5FinalsCombinations: (McItem & Explained)[] = [
  combination({
    name: "Mariner Foods · choosing an analysis",
    context: [
      "Mariner Foods must choose between two order-routing designs before its holiday rush. The current model links customer orders, approval rules, warehouse applications, and dispatch infrastructure. One analyst reasons directly from the model to check whether every accepted order has a permitted route to dispatch. A second analyst executes simulated order sequences to see whether a cancellation can reach packing after the order has been closed. Both investigations concern valid behavior rather than numerical service targets.",
      "Finance separately asks for estimated processing cost and the maximum hourly volume of each design. Those measurements have not yet been produced. The sponsor argues that simulation already makes the second investigation quantitative and that diagrams are valuable even if they do not change a decision. You must classify the work and identify what evidence the architecture recommendation still needs.",
    ], decision: "Which statements should appear in the recommendation?", source: "5.1 slides 4–7",
  }, [
    { text: "The first investigation seeks a functional result through an analytical approach.", correct: true, reason: "It reasons from the model about a permitted dispatch path. Correctness is a functional concern; reasoning from the model supplies the analytical approach (5.1 slides 5–6)." },
    { text: "The simulated cancellation investigation can also be functional.", correct: true, reason: "It checks valid behavior without measuring cost or capacity. Simulation and functional describe different axes, so they can apply together (5.1 slides 5–6)." },
    { text: "Finance’s cost and capacity questions still need quantitative evidence to support the design decision.", correct: true, reason: "Processing cost and hourly volume are numerical concerns. Quantitative analysis supports capacity planning and comparing designs, while model value is realized in informed decisions (5.1 slides 4, 7)." },
  ], [[0], [0, 1], []]),
  combination({
    name: "Pinebridge Rentals · rebuilding the shared model",
    context: [
      "Pinebridge Rentals acquired a smaller equipment company whose staff use different names for the same booking states. No shared architecture model exists yet. In a workshop, branch managers agree which steps belong inside the booking boundary and which supplier activities remain outside. The architect then chooses a process-oriented viewpoint, creates an initial structure, and prepares a drawing that managers can inspect. Several participants revise what they believe about when a reservation becomes binding.",
      "The next workshop removes a legacy fax step that no longer affects the booking decision and adds relevant detail to the deposit check. The facilitator records these changes and their reasons. A project manager says modeling could not have started without an input diagram and that the workshop’s only output is its final picture. You must assess that account before preparing the next session.",
    ], decision: "Which statements accurately describe the modeling work?", source: "5.1 slides 9–12",
  }, [
    { text: "Establishing scope and choosing a viewpoint are modeling activities; removing the fax step and refining the deposit check are modeling actions.", correct: true, reason: "The activities organize the modeling work, while abandon and refine change its content. The obsolete fax step and added deposit detail provide concrete examples (5.1 slides 10–11)." },
    { text: "The first workshop was invalid because the modeling transformation requires an existing model as input.", correct: false, reason: "The input model is optional. Pinebridge can begin from staff knowledge, goals, and modeling practice while creating its first shared model (5.1 slide 9; Module 5 class notes)." },
    { text: "Changes in shared knowledge and agreements are outputs alongside the model and way of modeling.", correct: true, reason: "The booking-state agreement and changed understanding illustrate the knowledge/agreement stream. The transformation includes those outputs rather than a drawing alone (5.1 slide 9)." },
  ], [[0], [1, 2], [0, 1, 2]]),
  combination({
    name: "Rowan Logistics · a persuasive but unreliable map",
    context: [
      "Rowan Logistics asks its architect to explain why weekend deliveries miss their promised dates. The presentation includes a detailed history of office furniture purchases, although those purchases do not affect dispatch. It also states that a supplier guarantees continuous availability, but neither the contract nor the supplier’s operating reports support that claim. Dispatch supervisors understand the individual labels but struggle to follow the map because the same abbreviation means a depot in one corner and a delivery event in another.",
      "The sponsor wants to keep the unsupported availability promise because it makes the proposal easier to sell. A designer suggests fixing only the color palette, while a manager proposes deleting every exceptional route to simplify the picture. Some exceptional routes are precisely where weekend failures occur. You must recommend changes that improve communication without removing the evidence needed for the investigation.",
    ], decision: "Which statement correctly applies the lesson’s communication guidance?", source: "5.1 slides 12–15, 20–21",
  }, [
    { text: "The furniture history satisfies Relevance because it is accurate information about the same enterprise.", correct: false, reason: "Accuracy does not make the history relevant to weekend delivery failures. Relevance concerns the modeling goal, while Quantity also discourages unnecessary detail (5.1 slide 13)." },
    { text: "The unsupported promise should be removed or qualified, and the ambiguous abbreviation should be clarified.", correct: true, reason: "Quality requires adequate evidence for the availability claim. Manner requires avoiding ambiguity, which the conflicting abbreviation violates (5.1 slide 13)." },
    { text: "Economical modeling requires deleting every exceptional route even when it explains a failure under investigation.", correct: false, reason: "Economy is relative to purpose. These routes are goal-critical evidence, so deleting them would make the model insufficiently complete (5.1 slides 12, 15, 21)." },
  ], [[0], [0, 1], [0, 1, 2]]),
  combination({
    name: "Cedar Instruments · six different organizing questions",
    context: [
      "Cedar Instruments is replacing its calibration platform across three factories. The team prepares six working sheets: a decomposition of calibration functions, the order of approval events, a call graph between software services, the physical placement of factory equipment, a hierarchy of measurement record types, and the software modules assigned to implementation teams. Each sheet answers a different question, and the architect wants their labels to make those differences visible during the planning workshop.",
      "An assistant classifies the call graph as Location because it contains remote calls. He labels the implementation-module sheet Time because teams have deadlines, and calls the record hierarchy Usage because employees use records. The architect must correct the classification before merging relevant relationships into the workshop materials. Factory placement, scheduling, and ownership remain separate facts even when the same component appears in several sheets.",
    ], decision: "Which proposed classifications are correct under the lesson’s structural dimensions?", source: "5.1 slides 16–18",
  }, [
    { text: "The software call graph belongs primarily to Location.", correct: false, reason: "Usage covers dependencies and call graphs. The separate factory-equipment placement sheet represents Location and physical distribution (5.1 slide 17)." },
    { text: "The implementation-module sheet belongs primarily to Time.", correct: false, reason: "Work covers implementation units and module structure. Deadlines do not change the subject of this sheet; the approval-event ordering represents Time (5.1 slide 17)." },
    { text: "The measurement-record type hierarchy belongs primarily to Usage.", correct: false, reason: "Data structure covers type/class hierarchies. The classification follows the represented structure, rather than the everyday fact that someone uses records (5.1 slide 17)." },
  ], [[0], [0, 1], [0, 1, 2]]),
  combination({
    name: "Harbor Glass · selecting what each audience sees",
    context: [
      "Harbor Glass maintains an architecture model containing business processes, applications, infrastructure, and their dependencies. The operations manager needs to inspect which application failures interrupt order confirmation. Developers need implementation details for one component. The architect selects different relevant contents from the shared model for the two audiences. For the operations meeting, a designer changes spacing and typography so the dependency view is easier to read, without changing any selected elements or relationships.",
      "During the meeting, the manager identifies a missing dependency and asks for the underlying information to be corrected. A coordinator calls the operations picture a viewpoint and says updates cannot travel back toward the shared model because the selection has already been visualized. You must clarify the artifacts and the allowed feedback path before the team records the correction and prepares the next meeting.",
    ], decision: "Which statements should guide the correction?", source: "5.2 slides 4–6",
  }, [
    { text: "The selected dependency content is a view; its revised typography is a change to its visualization.", correct: true, reason: "The view is selected architectural content for the manager’s concern. Typography changes how that content is presented without necessarily changing its meaning (5.2 slides 4, 6)." },
    { text: "A viewpoint is the specialized lens and toolbox guiding selection and presentation, rather than the finished picture alone.", correct: true, reason: "Harbor Glass needs different concepts and presentation choices for operations and developers. The viewpoint guides those choices; the resulting content is the view (5.2 slides 4–6)." },
    { text: "The source diagram forbids feedback from a view to the model.", correct: false, reason: "The diagram explicitly includes View → Model labeled update, as well as Visualization → View. The missing dependency can therefore prompt a model correction (5.2 slide 6)." },
  ], [[0], [1, 2], [0, 1, 2]]),
  combination({
    name: "Orchard Transit · purpose and coverage",
    context: [
      "Orchard Transit prepares three artifacts for a ticketing-system change. The first supports a developer comparing internal alternatives within one application layer and one aspect. The second traces one aspect across business, application, and technology layers so operational managers can judge the impact of a service outage. The third supports an investment decision and includes selected material from two layers and two aspects. None of the artifacts claims to include every part of the enterprise.",
      "A reviewer insists the third artifact cannot be an overview because technology details have been omitted. She also says the second must be Informing because it crosses layers, and that every Designing artifact must remain Details. The architecture lead asks you to classify the materials using the stated purpose and coverage, without assuming a classification from the audience’s title or the visual format.",
    ], decision: "Which statements apply the lesson’s two classification criteria correctly?", source: "5.2 slides 7–12",
  }, [
    { text: "The third artifact can have Deciding purpose and Overview content without covering every enterprise cell.", correct: true, reason: "Its investment decision supplies the purpose; multiple layers and multiple aspects supply Overview coverage. Overview does not require every layer or aspect (5.2 slides 7–12; Module 5 class notes)." },
    { text: "Crossing layers alone fixes the second artifact’s purpose as Informing.", correct: false, reason: "Crossing layers in one aspect supports Coherence content. Purpose remains a separate question; here the artifact supports an operational impact decision (5.2 slides 7–10)." },
    { text: "The first artifact’s one-layer, one-aspect coverage fits Details content.", correct: true, reason: "Its coverage meets the Details definition. Its use for comparing implementation alternatives also fits Designing purpose, but that pairing is contextual rather than compulsory (5.2 slides 8–12)." },
  ], [[0], [0, 1], [0, 1, 2]]),
  combination({
    name: "Willow Mutual · an accurate proposal nobody accepts",
    context: [
      "Willow Mutual models a proposed consolidation of regional claims teams. In a workshop, regional managers confirm that the proposed responsibilities and service dependencies accurately represent the plan. They explicitly reject its likely effect on local escalation times and the loss of regional authority. The architect records both their agreement about the representation and their disagreement about the consequences. The proposal has not yet received an implementation decision from the executive committee.",
      "A project coordinator wants to report unanimous commitment because everyone understood the same picture. She also wants to distribute it to customer-support teams who were absent, while a manager argues that dissemination would replace the need to discuss the objections. You are asked to label the completed and outstanding viewpoint activities accurately so that the next steering meeting does not mistake a checked representation for agreement to enact the change.",
    ], decision: "Which statement can the steering report substantiate?", source: "5.2 slide 13; 5.1 slides 19–21",
  }, [
    { text: "Agreement that the proposal is represented accurately is validation, while agreement with its potential impact is still missing.", correct: true, reason: "Managers checked the representation but rejected escalation and authority consequences. Validation and obtaining commitment are separate guidelines (5.2 slide 13)." },
    { text: "Understanding the picture establishes commitment even though managers explicitly reject its effects.", correct: false, reason: "The stated objection is evidence against commitment. An understood but unwanted message can also be an effect breakdown rather than a readability failure (5.2 slide 13; 5.1 slide 21)." },
    { text: "Distributing the view to absent teams resolves disagreement with the consolidation’s impact.", correct: false, reason: "Dissemination is Informing. It does not demonstrate that the regional managers accept the plan’s consequences (5.2 slide 13)." },
  ], [[1], [0, 1], [0, 1, 2]]),
  combination({
    name: "Granite Leasing · repairing a service chain",
    context: [
      "Granite Leasing offers customers an equipment-reservation service through its reservation process. That process uses an application availability service implemented by the fleet application. The fleet application relies on a database infrastructure service implemented by the company’s database cluster. In the workshop model, each of these pairs is represented separately so that managers can distinguish promised functionality from the implementation that delivers it. The team is deciding whether a replacement application can preserve the same exposed service.",
      "A new analyst reverses every arrow, explaining that consumers realize their providers because they pay for them. He also calls all seven bands of the lecture’s stack separate basic architecture layers and says a dashed implementation arrow means work occurs later. You must repair the relationship descriptions before the model is used to assess the replacement and its effect on reservation operations.",
    ], decision: "Which statements correctly describe Granite’s service chain?", source: "5.3 slides 5–8",
  }, [
    { text: "The fleet application realizes the availability service, which serves the reservation process.", correct: true, reason: "The application implements the exposed functionality, and that functionality supports business behavior. Those are realization and serving respectively (5.3 slides 6–8)." },
    { text: "The database cluster realizes the database infrastructure service, which serves the fleet application.", correct: true, reason: "Technical infrastructure implements an infrastructural service used by an application component. The direction runs toward the realized service or its consumer (5.3 slide 7)." },
    { text: "Service bands and implementation bands are distinctions within the layered stack, rather than seven independent basic architecture layers.", correct: true, reason: "The three basic layers are Business, Application, and Technology. The stack alternates exposed functionality and implementation; its arrows do not express a universal time sequence (5.3 slides 6–8)." },
  ], [[0], [0, 1], []]),
  combination({
    name: "Silverfern Clinics · what performs the work?",
    context: [
      "Silverfern Clinics models appointment confirmation using a deliberately simplified teaching example. A booking clerk checks availability and updates an appointment record. Patients receive a confirmation service through a counter window or an identified user-facing interface of the booking application. The entire application also contains scheduling logic, storage access, and administrative functions. The team wants to keep those implementation responsibilities distinct from the point at which functionality is exposed to a user.",
      "A reviewer labels every service recipient passive structure, calls the confirmation service an interface because customers encounter it, and treats the whole application as a window-shaped interface. Another reviewer wants to keep the lesson’s active, behavior, passive, and external categories clear without claiming this small analogy proves every legal relationship in the full language. You must choose the classification justified by the modeled roles.",
    ], decision: "Which statement correctly interprets the example?", source: "5.3 slides 5, 9; Module 5 class notes",
  }, [
    { text: "Patients must be passive structure simply because they receive confirmation functionality.", correct: false, reason: "Receiving a service does not automatically make a person a passive object. Passive structure is the information or thing accessed by behavior, such as the appointment record in this example (5.3 slide 9; class notes clarification)." },
    { text: "The clerk is active structure, checking availability is behavior, and the appointment record is passive structure.", correct: true, reason: "These roles match performer, action, and accessed information. The classification follows their role in the modeled interaction (5.3 slide 9)." },
    { text: "The confirmation service and the complete booking application should both be classified only as Interface.", correct: false, reason: "The service is exposed behavior. The interface is the exposure point, while the application has broader internal responsibilities and is not reduced to its user-facing interface (5.3 slides 5, 9; class notes)." },
  ], [[0], [0, 1], [0, 1, 2]]),
  combination({
    name: "Beacon Components · modeling before the question is known",
    context: [
      "Beacon Components plans a new architecture workshop for a warehouse expansion. The operational manager needs to understand which application dependencies could delay opening the new site. The project manager needs a coordinated transition plan. Before interviewing either person, an analyst downloads a language reference and begins placing every available symbol on one canvas. He says the full catalog must appear because otherwise the model cannot count as enterprise architecture. Neither manager has agreed what the canvas should help them decide.",
      "The architect proposes a dependency-focused view and a separately scoped transition view. The analyst objects that choosing relevant concepts is unnecessary once a modeling language has been selected, and that stating purpose and scope adds no value to an internal warehouse workshop. You must assess his proposed rules before the team spends its remaining workshop time constructing and polishing the model.",
    ], decision: "Which of the analyst’s rules is supported by the supplied lesson?", source: "5.3 slides 11–12",
  }, [
    { text: "Every available extended concept must appear before stakeholder concerns can be discussed.", correct: false, reason: "The source begins with stakeholder concerns, then purpose/scope/viewpoint, and then relevant concepts. Beacon’s opening-date and transition concerns should guide selection (5.3 slide 11)." },
    { text: "An internal warehouse workshop can skip determining purpose and scope when it selects its viewpoints.", correct: false, reason: "The complete second step determines purpose, scope, and viewpoint. Beacon’s managers have different questions, and the internal setting does not remove those choices (5.3 slide 11)." },
    { text: "Selecting a language makes relevance optional, so all focused groups should be added regardless of the managers’ concerns.", correct: false, reason: "The workflow chooses relevant elements, relationships, and rules in conjunction with viewpoints. The list of focused groups does not make the entire catalog mandatory (5.3 slides 11–12)." },
  ], [[0], [0, 1], [0, 1, 2]]),
];

export const module5FinalsCheckboxes: (MultiItem & Explained)[] = [
  checkbox({
    name: "Estuary Pumps · what the architecture must answer",
    context: [
      "Estuary Pumps is considering replacing its service-order platform. Executives need to know whether the new arrangement preserves mandatory approval behavior and whether operating costs will fit next year’s budget. Technicians need to understand how an approved order reaches the workshop. The first draft lists every installed application but omits business processes and dependencies. It also includes a decorative network inventory that no participant can connect to the replacement decision or the technicians’ handoff question.",
      "The architect has two weeks and reliable interviews with process owners, but no evidence for a proposed supplier’s reliability promise. The sponsor asks for an integrated description at a useful abstraction level, with explicit distinctions between confirmed information and open questions. You must select changes to make the model a basis for evaluating alternatives rather than a collection of unrelated facts.",
    ], decision: "Select all changes justified by the stated modeling goal.", source: "5.1 slides 4, 6–8, 12–15",
  }, [
    { text: "Connect relevant processes, applications, and dependencies at an abstraction level suited to the decision.", correct: true, reason: "The isolated inventory cannot answer approval or handoff questions. Integrated description and suitable abstraction connect the selected enterprise aspects for decision-making (5.1 slides 4, 8)." },
    { text: "Check approval correctness functionally and assess the budget question quantitatively.", correct: true, reason: "Preserving approval behavior is a functional concern; operating cost is a quantitative metric. Both contribute evidence for the replacement choice (5.1 slides 6–7)." },
    { text: "Treat the supplier’s unsupported reliability promise as established to complete the model.", correct: false, reason: "Completeness does not justify invented certainty. Quality says not to model claims lacking adequate evidence, so the promise should remain an explicit open question (5.1 slide 13)." },
    { text: "Require every installed technical detail in each technician view because an integrated model must show everything.", correct: false, reason: "Integration concerns relevant connections, not exhaustive presentation. Economical views and goal-relative completeness allow secondary inventory detail to be omitted (5.1 slides 4, 12, 15)." },
  ]),
  checkbox({
    name: "Maple Metering · purpose before picture format",
    context: [
      "Maple Metering is planning a change to the way factories submit consumption readings. Developers need to compare alternative approval flows before implementing the change. Executives need to choose between two investment proposals. Factory employees need an explanation of how their submission work will change. The architect proposes a flowchart for the developers, a landscape map for the executives, and an illustrated process explanation for employees. Each artifact is designed around the concern stated by its audience.",
      "A manager argues that the landscape map cannot be both Deciding and Overview because every artifact should have only one classification. Another says a flowchart always proves its purpose regardless of why anyone uses it. The architect asks you to review the proposed purposes and distinguish typical examples from compulsory rules before the team commissions polished materials for the three meetings.",
    ], decision: "Select all conclusions justified by the stated uses and the lesson’s tables.", source: "5.2 slides 7–12",
  }, [
    { text: "Comparing alternative approval designs fits Designing purpose, with a flowchart as a typical example.", correct: true, reason: "The developers are comparing implementation alternatives, a listed Designing use. The purpose table includes flowcharts without making the format an exclusive purpose rule (5.2 slides 8, 11)." },
    { text: "Choosing the investment proposal fits Deciding purpose, with a landscape map as a typical example.", correct: true, reason: "The executive meeting has a decision to make. Landscape maps appear in the Deciding examples, while their coverage still needs a separate content classification (5.2 slides 8, 11–12)." },
    { text: "Explaining changed work to employees fits Informing purpose.", correct: true, reason: "The employees need to understand the changed submission process. Explanation and process illustrations are listed under Informing (5.2 slides 8, 11)." },
    { text: "The investment map may also be Overview if its content spans multiple layers and multiple aspects.", correct: true, reason: "Purpose and content are independent, so Deciding and Overview can describe the same artifact. The map’s format alone does not establish its actual coverage (5.2 slides 7, 9–12)." },
  ]),
  checkbox({
    name: "Larch Publishing · keeping a model useful through change",
    context: [
      "Larch Publishing builds an architecture model for a subscription renewal change. The initial workshop identifies subscribers and support agents as stakeholders, specifies the future renewal objective, and limits the boundary to renewal and payment interactions. Editors ask to include unrelated manuscript-review details because those details are readily available. The architect keeps a stable draft for discussion, then adds payment-exception detail when agents explain that exceptions drive most renewal complaints.",
      "In the following week, the team creates a higher-level management view, translates a technical description into an agreed business vocabulary, and records why obsolete elements were removed. A project lead wants to freeze every representation after the first workshop because iteration might reveal errors. You must select practices that preserve a purposeful, maintainable model while keeping related representations aligned as the renewal proposal changes.",
    ], decision: "Select all practices supported by the lesson.", source: "5.1 slides 10–16",
  }, [
    { text: "Iterate with stakeholders and maintain related models consistently as the payment exception changes.", correct: true, reason: "Agents contributed goal-critical information after the first draft. Iteration, maintenance, and consistency between related models prevent the new detail from leaving contradictory representations (5.1 slides 10, 12, 15)." },
    { text: "Treat the higher-level view as abstraction and the added exception detail as refinement.", correct: true, reason: "The two edits respectively suppress and add relevant detail. The lesson’s action names and class-note zoom-out/zoom-in distinction support these descriptions (5.1 slide 11; class notes)." },
    { text: "Keep all manuscript-review detail because available information determines the modeling scope.", correct: false, reason: "The renewal objective and explicit boundary determine relevance. Readily available but unrelated information should not displace focus (5.1 slides 14–15)." },
    { text: "Stop documenting actions once the first visualization has been produced.", correct: false, reason: "Recording removal and translation decisions remains useful as the model evolves. Documenting modeling actions is itself named, and maintenance continues after visualization (5.1 slides 10–12)." },
  ]),
  checkbox({
    name: "Cove Packaging · understanding versus acceptance",
    context: [
      "Cove Packaging presents an architecture proposal that removes duplicate order entry. Operators correctly explain the proposed flow back to the architect and identify which application would become redundant. They nevertheless oppose the plan because it moves exception handling to an understaffed team. In a separate technical review, developers misread a dependency arrow as the chronological order of processing because the diagram has no legend and mixes several incompatible symbol conventions.",
      "The sponsor wants to solve both problems by increasing the font size and announcing that everyone approved the model. The architect must distinguish communication failures before choosing a remedy. The exception-handling objection is based on a consequence the operators understand, while the developers have misunderstood the representation itself. You must choose diagnoses that follow from those observations without inventing a universal definition of the slide’s phrase about lacking status.",
    ], decision: "Select all diagnoses justified by the evidence.", source: "5.1 slides 13, 19–21",
  }, [
    { text: "The operators’ rejection can be an effect problem even though they understand the representation.", correct: true, reason: "They accurately explain the proposal but reject its staffing consequence. The lesson includes true but unwanted messages among effect breakdowns (5.1 slide 21)." },
    { text: "The developers’ mistaken arrow reading is a readability problem requiring clearer notation.", correct: true, reason: "They understand the relation incorrectly because conventions are unclear. Both misunderstanding and unclear notation are listed readability problems (5.1 slide 20)." },
    { text: "Readable text proves that operators have accepted the proposal’s operational consequences.", correct: false, reason: "Understanding and acceptance are separate. Font changes cannot establish agreement with the understaffing consequence operators explicitly oppose (5.1 slides 19–21)." },
    { text: "Manner supports clarifying the legend and organizing the symbols consistently.", correct: true, reason: "Avoiding obscurity and ambiguity and being orderly directly address the developer review’s mixed conventions (5.1 slide 13)." },
  ]),
  checkbox({
    name: "Fieldstone Labs · three audiences, one model",
    context: [
      "Fieldstone Labs models a change to its instrument-maintenance service. The same underlying model includes maintenance requests, scheduling behavior, supporting applications, and infrastructure. An end-user wants to understand how to request urgent maintenance. A system administrator needs to see dependencies that affect recovery. An executive wants to compare two investment alternatives. The architect interviews each participant before selecting relevant content, then prepares a different presentation for each meeting.",
      "A coordinator suggests using one unchanged picture for everyone and calls the participants’ job titles complete viewpoints. She also proposes choosing the visual format before asking what each audience needs to decide or understand. The architect asks you to assess these suggestions and preserve a common source of architectural meaning while allowing different views and visualizations. The concern is usefulness to each audience, rather than maximizing the amount displayed at every meeting.",
    ], decision: "Select all statements that should guide the architect.", source: "5.2 slides 4–8, 13",
  }, [
    { text: "The stakeholder roles help identify concerns, but do not by themselves specify a complete viewpoint.", correct: true, reason: "Urgent requests, recovery dependencies, and investment alternatives are different concerns. The lesson’s stakeholder list is a starting point for choosing a lens and relevant content (5.2 slides 4–5)." },
    { text: "Different views can select or derive relevant content from the shared model.", correct: true, reason: "The model need not be replaced merely because each audience sees different selected information. Model → View is explicitly select/derive (5.2 slide 6)." },
    { text: "A viewpoint can guide both the content selection and how the selected content is visualized.", correct: true, reason: "The source’s viewpoint guidance connects to the model/view and view/visualization transformations. The three meetings can therefore use suitable lenses and presentations (5.2 slides 4, 6)." },
    { text: "A single shared model requires every audience to inspect its entire content in an identical picture.", correct: false, reason: "The distinction between model, view, and visualization permits tailored selection and presentation. Scoping and creation of views explicitly select relevant content (5.2 slides 6, 13)." },
  ]),
  checkbox({
    name: "Northbank Textiles · classifying workshop artifacts",
    context: [
      "Northbank Textiles uses a training grid to explain coverage choices. Its rows represent business, application, and technology layers, while its columns deliberately use IT, Marketing, and HR as classroom illustrative dimensions. One artifact contains a single cell. A second traces one column across several rows. A third includes selected cells from two rows and two columns to support a management investment decision. The team explicitly says this third artifact does not show every cell.",
      "A trainee proposes that any missing cell disqualifies Overview, that the department headings are the formal ArchiMate aspect taxonomy, and that a landscape map can have only one classification. Your task is to retain the lesson’s breadth distinction and the independence of purpose from content. The grid is a teaching aid for the workshop; it does not establish new normative definitions for the modeling language.",
    ], decision: "Select all conclusions supported by the supplied lesson and its classroom illustration.", source: "5.2 slides 7–12; Module 5 class notes",
  }, [
    { text: "The single-cell artifact illustrates Details coverage.", correct: true, reason: "One layer and one illustrative aspect dimension correspond to the single-cell Details explanation. This describes coverage, not a compulsory purpose (5.2 slide 9; class notes)." },
    { text: "The one-column, several-row artifact illustrates Coherence coverage.", correct: true, reason: "Coherence can span multiple layers in one aspect, or multiple aspects in one layer. Only one coverage dimension needs to expand (5.2 slide 9; class notes)." },
    { text: "The third artifact can illustrate Overview content and serve Deciding purpose.", correct: true, reason: "It spans multiple rows and columns and supports an investment decision. Overview need not include every cell, and content/purpose are independent (5.2 slides 7–12; class notes)." },
    { text: "IT, Marketing, and HR in this classroom grid establish the formal ArchiMate aspect taxonomy.", correct: false, reason: "The department headings are explicitly illustrative dimensions in the notes. The language’s core pattern instead distinguishes active structure, behavior, and passive structure (5.2 class notes; 5.3 slide 9)." },
  ]),
  checkbox({
    name: "Brookline Stores · the five viewpoint checks",
    context: [
      "Brookline Stores prepares a view of a warehouse-system replacement for branch managers. The architect first agrees the subdomains, constraints, and relevant viewpoint, then selects content from a broader enterprise model. Managers inspect the representation and confirm that the proposed system responsibilities are shown accurately. Several still refuse to support the operational impact because a replacement changes when branches can submit urgent orders. Those objections are documented for a later decision.",
      "The project office wants to mark the entire process approved because validation has occurred. It also plans to send the view to training staff who have not attended the workshops. No company policy requires signed approval for every view. You must identify the remaining activities and explain which agreements the team actually has, without converting an optional way to record commitment into a universal requirement of the lesson.",
    ], decision: "Select all accurate descriptions of Brookline’s position.", source: "5.2 slide 13; Module 5 class notes",
  }, [
    { text: "Selecting subdomains, constraints, and viewpoint is Scoping; selecting model content is Creation of views.", correct: true, reason: "These descriptions correspond to Brookline’s first two activities. They set boundaries and determine what the particular view includes (5.2 slide 13)." },
    { text: "Agreement with the representation is Validation, while agreement with potential impact still needs attention.", correct: true, reason: "The managers confirm accurate responsibilities but object to urgent-order consequences. The lesson separates Validation from Obtaining commitment (5.2 slide 13)." },
    { text: "Sending the view to training staff is Informing.", correct: true, reason: "Training staff are other stakeholders who have not yet seen the view. Disseminating it matches the Informing guideline (5.2 slide 13)." },
    { text: "Every view is invalid unless every stakeholder signs it, regardless of the organization’s needs.", correct: false, reason: "The notes offer signatures or documentation as ways to record commitment. They do not impose a universal signature condition, and validation concerns representation (5.2 slide 13; class notes)." },
  ]),
  checkbox({
    name: "Ashgrove Freight · a service inside the application layer",
    context: [
      "Ashgrove Freight has a primary dispatch application and a supporting identity application. The supporting component implements an internal identity service used by the dispatch component. Both components remain in the application layer. Separately, technical infrastructure implements a storage service that the dispatch component uses. The model keeps implementation components and exposed functionality distinct so the team can replace the identity implementation while preserving what the dispatch application needs.",
      "A reviewer claims an internal application service must move to the technology layer because all services link different layers. He also reverses the service-to-consumer arrow and proposes using the same line style for realization and serving. The architect asks you to correct the model using the lecture’s layered stack and its application-layer inset. This is an original fictional application of the pattern, rather than an additional element claimed to appear in the lecture figure.",
    ], decision: "Select all corrections supported by the layered pattern.", source: "5.3 slides 5–8",
  }, [
    { text: "The supporting identity component realizes the internal identity service.", correct: true, reason: "The component implements the exposed functionality. This matches the supporting-component → internal-service realization in the application-layer inset (5.3 slide 7)." },
    { text: "The internal identity service serves the primary dispatch component without requiring a layer change.", correct: true, reason: "The inset explicitly permits services within one layer. The serving direction points from provided functionality toward its consumer (5.3 slide 7)." },
    { text: "The technical infrastructure realizes storage functionality that serves the dispatch component.", correct: true, reason: "This preserves infrastructure implementation, infrastructure service, and application consumer as separate roles in the stack (5.3 slides 6–7)." },
    { text: "Realization and serving should use identical arrows because both indicate a dependency.", correct: false, reason: "The lecture distinguishes dashed hollow-triangle realization from solid open-head serving. Collapsing them loses the implementation-versus-provision distinction needed here (5.3 slides 7–8)." },
  ]),
  checkbox({
    name: "Dunlin Manufacturing · reading the legend",
    context: [
      "Dunlin Manufacturing documents a production-support change. In its original teaching model, a software component implements a scheduling service, the service provides functionality to a planning process, and the process accesses a work-order record. The team uses the lesson’s relation legend, rather than treating every arrow as a chronological step. A separate process progression has a solid line with a filled triangular head, while a transfer is drawn with a dashed line and a filled triangular head.",
      "The sponsor asks a reviewer to verify the selected notation before the picture is used in a training session. The reviewer has no license to rename unlabelled connectors from other lecture figures or to infer a complete metamodel from this simplified case. Your task is to check the explicitly introduced symbols and the implementation, consumer, and information roles stated here. The component and planning process are shown separately from the accessed record.",
    ], decision: "Select all checks that correctly apply the supplied legend.", source: "5.3 slides 7–9",
  }, [
    { text: "Component-to-scheduling-service realization uses a dashed line with a hollow triangular head toward the service.", correct: true, reason: "The component implements the service, and the relation’s line/head combination matches Realizes in the legend and stack (5.3 slides 7–8)." },
    { text: "The service-to-planning-process relation is serving, with a solid line and open non-triangular head.", correct: true, reason: "The service provides functionality to the process. That is the supplied wording and glyph for Serves (5.3 slide 8)." },
    { text: "A dashed filled-triangle transfer and a solid filled-triangle progression have the same named relation.", correct: false, reason: "The dashed glyph is Flow; the solid glyph is Triggers. The shared filled head does not erase the significant line-style distinction (5.3 slide 8)." },
    { text: "The work-order record is active structure because a process accesses it.", correct: false, reason: "The record is the accessed information, so it illustrates passive structure. The performing entity is active structure; accessing an object does not make that object a performer (5.3 slide 9)." },
  ]),
  checkbox({
    name: "Seabrook Utilities · selecting concepts for a decision",
    context: [
      "Seabrook Utilities wants to explain how a proposed field-service change affects customer support and application dependencies. The operational manager needs to understand service interruptions, while a project manager needs to discuss the planned transition. The architect first identifies these concerns, then agrees the purpose and scope of each view. Only after those choices does the team select relevant language elements, relationships, and rules and begin constructing the model for discussion.",
      "A consultant proposes adding every focused concept group and claims the lecture’s reference cards provide complete definitions for all extensions. Another participant wants to call the drawing software the modeling language and to copy details from a referenced case that the team has not been given. The architect asks you to identify what can be justified by the supplied lesson before expanding the materials used for the workshop.",
    ], decision: "Select all recommendations supported by the verified coverage.", source: "5.3 slides 4, 11–13; 5.2 slide 14",
  }, [
    { text: "Keep the stakeholder-to-purpose/scope/viewpoint-to-relevant-concepts-to-model sequence.", correct: true, reason: "Seabrook follows the complete source workflow. Its interruption and transition concerns determine which language elements serve each view (5.3 slide 11)." },
    { text: "Select applicable core or focused concepts for the viewpoint rather than requiring every group in each drawing.", correct: true, reason: "The lesson names expanded groups but directs the team to relevant elements, relationships, and rules. A transition concern may guide selection without making the entire catalog mandatory (5.3 slides 11–12; 5.2 slide 14)." },
    { text: "Treat ArchiMate and the Archi drawing tool as interchangeable names for the same thing.", correct: false, reason: "ArchiMate is the formal modeling language. Archi is the tool mentioned in the academic example; software used to draw a model is distinct from the language (5.3 slides 4, 10)." },
    { text: "Grade detailed extension or insurance-case claims merely because the slides reference cards and a reading.", correct: false, reason: "References do not supply their unseen contents. Slides 12–13 name groups and the fictitious insurance context without verifying detailed definitions or case requirements (5.3 slides 12–13)." },
  ]),
];
