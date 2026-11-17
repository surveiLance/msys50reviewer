import type { McItem, MultiItem } from "../../lib/types";

type Explained = { w: string; r: string };
type Case = { name: string; context: [string, string]; decision: string; source: string };
type Statement = { text: string; correct: boolean; reason: string };

// Original fictional company situations, not lecture examples or recalled exam items.
const roman = ["I", "II", "III"];
const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function stem(specification: Case) {
  return `<p><strong>${escape(specification.name)}</strong> · Original fictional case</p>${specification.context.map(p => `<p>${escape(p)}</p>`).join("")}<p><strong>${escape(specification.decision)}</strong></p>`;
}

function label(indices: readonly number[]) {
  if (indices.length === 0) return "None of the statements are correct.";
  if (indices.length === 3) return "All three statements are correct.";
  if (indices.length === 1) return `Only statement ${roman[indices[0]]} is correct.`;
  return `Only statements ${roman[indices[0]]} and ${roman[indices[1]]} are correct.`;
}

function combination(specification: Case, statements: [Statement, Statement, Statement], distractors: [number[], number[], number[]]): McItem & Explained {
  const a = label(statements.flatMap((s, i) => s.correct ? [i] : []));
  return {
    q: `${stem(specification)}<ol type="I">${statements.map(s => `<li>${escape(s.text)}</li>`).join("")}</ol>`,
    o: [a, ...distractors.map(label)], a,
    w: statements.map((s, i) => `${roman[i]}. ${s.correct ? "Correct." : "Incorrect."} ${s.reason} [${specification.source}]`).join("\n"),
    r: specification.source,
  };
}

function checkbox(specification: Case, statements: [Statement, Statement, Statement, Statement]): MultiItem & Explained {
  return {
    q: stem(specification), o: statements.map(s => s.text), a: statements.filter(s => s.correct).map(s => s.text),
    w: statements.map(s => `“${s.text}” ${s.correct ? "Correct." : "Incorrect."} ${s.reason} [${specification.source}]`).join("\n"),
    r: specification.source,
  };
}

export const module4FinalsCombinations: (McItem & Explained)[] = [
  combination({
    name: "Cedar Quay Grocers · sorting a merger archive",
    context: [
      "Cedar Quay Grocers has acquired a regional wholesaler and inherited hundreds of documents. The owners describe why next-day delivery matters, operations managers describe who approves substitutions, and developers describe the physical database tables used to record orders. The acquisition committee wants to find missing descriptions before deciding whether to combine ordering systems. Its immediate concern is that executives and engineers keep using the word customer for different things. The repository manager proposes a Zachman grid to organize the material.",
      "A consultant then proposes treating every grid position as a delivery task, starting at the upper left and moving right before proceeding downward. Funding would be released only after every cell was filled. The architecture lead must advise whether this use of the grid helps the merger decision, while preserving the distinction between an enterprise perspective and the subject of a description.",
    ],
    decision: "Which statements should the architecture lead endorse?",
    source: "4.1 slides 8–13",
  }, [
    { text: "The approval-responsibility description concerns Who, while a description of delivery goals concerns Why.", correct: true, reason: "Approval responsibilities concern people, and the reason next-day delivery matters concerns motivation; the questions classify different product abstractions." },
    { text: "Descriptions should be located by both their perspective and their product abstraction, with decision-critical gaps prioritized.", correct: true, reason: "The owner goals and developer tables differ in perspective as well as content. The merger needs useful missing descriptions, consistent with pragmatic adoption." },
    { text: "Zachman requires completing cells from left to right as a project delivery sequence.", correct: false, reason: "The proposed funding sequence confuses a classification structure with a method. The grid does not prescribe that order or mandatory immediate completion." },
  ], [[0], [1, 2], [0, 1, 2]]),

  combination({
    name: "Tamarind Claims · three models with different commitments",
    context: [
      "Tamarind Claims processes equipment warranties for several manufacturers. Business analysts first record eligibility rules, claimant responsibilities, and the information needed to decide a claim, without proposing a computing solution. Designers then create a workflow model that can be discussed independently of any workflow engine. A delivery team later produces a model for the Java platform selected for the first implementation. The manufacturers expect their rules to evolve, so the team records translation rules linking the models rather than treating them as unrelated drawings.",
      "During review, a developer proposes calling every model platform-specific because all three are stored in the same diagramming application. Another reviewer says that a platform change must erase the business model because model mappings can only move downward. You must classify the models by their commitments and explain how the lecture depicts the mappings.",
    ],
    decision: "Which statements accurately assess Tamarind's models?",
    source: "4.1 slides 16–17",
  }, [
    { text: "The business requirements form a CIM, the engine-independent workflow a PIM, and the Java-platform model a PSM.", correct: true, reason: "The classification follows what each model commits to: business/domain requirements, platform-independent solution logic, then a selected platform." },
    { text: "The shared diagramming application makes the engine-independent workflow a PSM.", correct: false, reason: "The workflow is explicitly independent of its execution engine. The authoring tool does not supply a platform commitment within the modeled solution." },
    { text: "The lecture depicts mappings only from CIM to PIM to PSM, so reverse translation is excluded.", correct: false, reason: "The slide retains mappings in both directions between adjacent abstraction levels. Tamarind can maintain relationships when platform or business decisions change." },
  ], [[1], [0, 1], []]),

  combination({
    name: "Blue Orchard Tickets · replacing a pricing engine",
    context: [
      "Blue Orchard Tickets sells admission through its website, venue counters, and partner travel agencies. All channels request a price through a published service interface that specifies the inputs and the promised response. The pricing team wants to replace its internal discount algorithm because weekend promotions have become difficult to maintain. It plans to preserve the external behavior agreed with the channels, including how an unavailable offer is reported. None of the partner agencies has access to the internal source code.",
      "The operations director also sees an opportunity to combine reservation, pricing, and payment services into different booking processes for festivals and permanent venues. A project sponsor worries that service orientation only applies to software modules and cannot help explain the business process. The architect must assess the proposed separation and reuse without promising that an unchanged interface automatically resolves every operational concern.",
    ],
    decision: "Which statements follow from the service-oriented approach described?",
    source: "4.1 slides 18–19",
  }, [
    { text: "Separating agreed external behavior from the discount implementation supports replacing the internal algorithm.", correct: true, reason: "Consumers request the published pricing behavior. Preserving that agreement reduces their dependence on the pricing team's internal implementation." },
    { text: "Reservation, pricing, and payment can be composed and reused in different booking processes.", correct: true, reason: "The festival and permanent-venue workflows can consume reusable services rather than each recreating all functionality, matching composition and reuse benefits." },
    { text: "Service concepts can describe both business functionality and software functionality.", correct: true, reason: "The business booking process and its software services fit the lecture's business-and-software scope; SOA is not restricted to code organization." },
  ], [[0], [0, 1], [1, 2]]),

  combination({
    name: "Ironfern Utilities · an architecture office without owners",
    context: [
      "Ironfern Utilities has bought a repository and hired two architects, but nobody has assigned approval responsibilities or the skills needed to maintain its architecture practice. Its documents also mix reusable industry patterns with diagrams specific to its own substations. The head of planning asks for a clear distinction between establishing the practice, conducting architecture work, organizing its content, and placing reusable material in a broader context. The team is using the four components in the supplied TOGAF lesson as its reference.",
      "A vendor proposes naming the missing-role exercise Architecture Content Framework and calling the generic-to-specific collection ADM. It also advertises Requirements Management as a fifth main component that takes over once all four others have finished. You must review these proposed labels before Ironfern configures its repository and responsibility matrix, because the labels will shape training and ownership decisions.",
    ],
    decision: "Which of the vendor's proposed statements are accurate?",
    source: "4.2 slides 5–8, 11–12",
  }, [
    { text: "Architecture Content Framework is the component that establishes the office's roles, responsibilities, and skills.", correct: false, reason: "Ironfern's missing roles and skills belong to the Architecture Capability Framework. The Content Framework instead organizes architectural content." },
    { text: "ADM is the component that supplies foundation-to-enterprise-specific architecture context.", correct: false, reason: "The generic-to-specific context belongs to the Enterprise Continuum. ADM instead supplies the iterative method for developing and evolving architecture." },
    { text: "Requirements Management is a fifth main component that begins only after the other components finish.", correct: false, reason: "The lesson names four main components. Requirements Management is central within ADM and connected throughout its phase cycle, so it is neither fifth nor deferred." },
  ], [[0], [0, 2], [0, 1, 2]]),

  combination({
    name: "Mossbridge Transit · domain questions during a ticket upgrade",
    context: [
      "Mossbridge Transit wants a single ticket across ferries and buses. Its approved vision calls for simpler transfers, but the architects still need to define transfer approval responsibilities, shared passenger records, how the ticketing and refund applications interact, and the infrastructure supporting them. These descriptions need coordinated owners because an incorrect passenger identifier can affect refunds even when the network is available. The planning manager proposes organizing the work using TOGAF's four architectural domains and the ADM phase map from class.",
      "An old internal checklist places application architecture in Phase D because software is technology. A second checklist puts both Data and Application in Phase C. The architects must resolve this difference using the supplied phase diagram before assigning the work. They also need to explain which domain covers operating processes, so the business team remains involved rather than delegating the whole upgrade to infrastructure staff.",
    ],
    decision: "Which statements correctly classify the required work?",
    source: "4.2 slides 9, 11–12",
  }, [
    { text: "Application interactions belong in Phase D, while Phase C concerns only data records.", correct: false, reason: "The supplied diagram puts Data and Application together in Phase C, Information Systems Architectures. Phase D develops Technology Architecture." },
    { text: "Transfer approval responsibilities and operating processes belong to the Business domain.", correct: true, reason: "The case asks who governs and performs transfer work. Strategy, governance, organization, and processes are Business-domain concerns." },
    { text: "The shared records and application interactions require Data and Application descriptions, while supporting infrastructure belongs to Technology.", correct: true, reason: "Identifiers are data assets, ticket/refund interactions describe applications, and their hosting/network capabilities concern infrastructure. Distinguishing domains preserves their dependencies." },
  ], [[0], [1], [0, 1, 2]]),

  combination({
    name: "Glasshaven Foods · an iteration after a supplier failure",
    context: [
      "Glasshaven Foods originally scoped an architecture iteration around warehouse replenishment at one plant. The work used an existing application catalog and detailed the next year's changes. Halfway through planning, a key supplier closes, requiring a new purchasing arrangement across three plants. The sponsor wants to revisit scope, detail, planning horizon, and which existing artifacts can be reused. Finance agrees that the architecture should remain useful to the changed business problem rather than preserve a schedule merely because it was approved earlier.",
      "The method coordinator argues that returning to earlier decisions invalidates ADM and that Requirements Management should be postponed until Phase H. The architecture lead instead proposes tailoring the iteration while keeping requirements connected to business, data, application, technology, and implementation decisions. Your assignment is to assess these positions using the lecture's characterization of ADM rather than interpreting the circular drawing as a rigid one-pass contract.",
    ],
    decision: "Which statements support Glasshaven's revised approach?",
    source: "4.2 slides 10–12",
  }, [
    { text: "The changed supplier arrangement justifies revisiting coverage, detail, time horizon, and reusable architectural assets.", correct: true, reason: "The problem expands from one plant to three and changes the planning assumptions. These are the four decisions the lecture revisits at each iteration." },
    { text: "Requirements Management should wait until Phase H because new requirements are architecture changes.", correct: false, reason: "The new supplier needs affect several ongoing architecture decisions. Requirements Management remains central throughout; Phase H does not monopolize requirements." },
    { text: "Tailoring and revisiting ADM can be consistent with the method rather than proof that it has failed.", correct: true, reason: "The lecture describes ADM as iterative and customizable. Adjusting the work to a changed business problem is consistent with that characterization." },
  ], [[0], [1, 2], [0, 1, 2]]),

  combination({
    name: "Kestrel Harbor Insurance · a misleading folder order",
    context: [
      "Kestrel Harbor Insurance has six folders called Considerations, Standards, Visions, Landscapes, Outlines, and Designs. Staff assume the folder order tells them when each document must be created. One proposed file sets a business-wide rule about explaining coverage decisions; another gives engineers reusable technical implementation prescriptions. A third compares the value and operational impact of a specific proposed claims initiative. The architecture librarian wants to classify these files using the CSVLOD dimensions rather than the date each file was written.",
      "A project manager suggests that every new initiative must pass through all six folders and that moving between Rules and Changes is simply changing the intended audience. The librarian must correct the procedure before teams add more files. The decision concerns what an artifact describes and how it communicates, with the distinction between business-facing and IT-facing work preserved even when both documents refer to the same claims system.",
    ],
    decision: "Which statements correctly interpret the CSVLOD grid?",
    source: "4.3 slides 5–11",
  }, [
    { text: "The grid's six cells prescribe a mandatory sequence from Considerations through Designs for each initiative.", correct: false, reason: "Folder order is not a process. The grid crosses artifact subject categories with business/IT focus; it does not mandate six sequential deliverables." },
    { text: "The shared business rule is a Consideration, the technical prescription a Standard, and the initiative value description an Outline.", correct: true, reason: "The first two are Rules with different focus. The proposed initiative is a business-focused Change, so its value and impact description belongs to Outlines." },
    { text: "Moving from Rules to Changes changes only the business-versus-IT focus dimension.", correct: false, reason: "Rules versus Changes is the What dimension. Business versus IT is the other dimension, and either focus can apply to both Rules and Changes." },
  ], [[0], [0, 1], []]),

  combination({
    name: "Marigold Clinics · documents used at two tables",
    context: [
      "Marigold Clinics is planning to share appointment services across its branches. Executives and architects discuss a short set of organization-wide planning principles in the same language. They also use a capability view to agree which patient services should improve over several years, and a business-readable overview to consider one proposed appointment initiative. Separately, engineers maintain implementation prescriptions and detailed specifications for an already approved connector. The sponsor wants to understand why some artifacts are described as dual and others are not.",
      "The repository owner suggests labeling every file dual because any employee can open the shared drive. The architecture lead disagrees: access permissions do not establish the artifact's intended focus or shared meaning. You must recommend a classification that preserves collaboration between business and IT while recognizing that specialist technical material serves a different immediate use, even if executives occasionally read it during a review meeting.",
    ],
    decision: "Which statements correctly apply the lesson's dual-artifact distinction?",
    source: "4.3 slides 12, 14, 16, 20, 22",
  }, [
    { text: "The shared planning principles are Considerations and can support conceptual consistency between business and IT.", correct: true, reason: "The principles communicate global rules through shared business-and-IT meaning, matching the dual role and conceptual-consistency purpose of Considerations." },
    { text: "The capability view and business-readable initiative overview can be dual Visions and Outlines respectively.", correct: true, reason: "Both business and IT use the capability structure and initiative value view for planning. Their subjects distinguish Structures from Changes without removing their shared audience." },
    { text: "Technical implementation prescriptions and approved connector specifications remain IT-focused Standards and Designs despite shared-drive access.", correct: true, reason: "The prescriptions and technical build details serve specialist implementation needs. Accessibility alone does not make the lesson's non-dual IT-focused types dual." },
  ], [[0], [0, 1], [1, 2]]),

  combination({
    name: "Redwood Span Logistics · two future plans",
    context: [
      "Redwood Span Logistics has two plans with similar dates but different purposes. The first shows when investments will improve shipment visibility, customer exception handling, and regional delivery capabilities over the next four years. Business leaders and architects use it to connect investment decisions with desired outcomes. The second shows technical platform replacements and database upgrades, with engineering dependencies, but deliberately does not describe direct business value. Infrastructure specialists use it to coordinate technical evolution rather than to secure approval for a single customer-service initiative.",
      "A records manager wants to place both plans under Visions because both describe the future. Another suggests rejecting the second plan as a Landscape because Landscapes often describe the current state. You must distinguish the Roadmaps and IT Roadmaps subtypes by purpose and audience, and explain why a shared time direction is insufficient to settle the classification.",
    ],
    decision: "Which statements should Redwood's records manager accept?",
    source: "4.3 slides 16–19",
  }, [
    { text: "The capability-investment plan fits Roadmaps under Visions because it connects planned initiatives with direct business value.", correct: true, reason: "The first plan communicates capability outcomes jointly to business and IT. That business-focused purpose matches Visions' Roadmaps." },
    { text: "Both plans must be Visions because future orientation overrides their purpose and audience.", correct: false, reason: "The second plan is purely technical. Landscapes include IT Roadmaps, so future orientation alone does not move it into the business-focused Structures cell." },
    { text: "The platform-upgrade plan can be an IT Roadmap under Landscapes even though it describes future technical evolution.", correct: true, reason: "The lecture explicitly lists technical IT Roadmaps under Landscapes. 'Often current' does not mean that every Landscape must depict only the present." },
  ], [[0], [1, 2], [0, 1, 2]]),

  combination({
    name: "Willow Gauge Manufacturing · the meaning of preliminary",
    context: [
      "Willow Gauge Manufacturing has approved a project to connect factory calibration equipment with its quality system. The architecture team first supplies a higher-level technical and functional design to coordinate interfaces and responsibilities. Engineers will then develop detailed specifications for implementation during the next eight months. Elsewhere in the portfolio, a manager has only an early business idea for a supplier portal, with no project approval and a short justification describing possible benefits. Both items appear in the same monthly planning meeting.",
      "A new analyst labels the unapproved portal idea Preliminary Solution Design and says the approved calibration project's higher-level design must be a business Outline because it contains fewer technical details than the final specification. The analyst also claims only the detailed design can concern an approved solution. You must review all three claims using the distinction between Designs subtypes and early initiative ideas.",
    ],
    decision: "Which of the analyst's proposed statements are accurate?",
    source: "4.3 slides 20–23",
  }, [
    { text: "The portal idea is a Preliminary Solution Design simply because it precedes project approval.", correct: false, reason: "Preliminary Solution Designs concern approved solutions. The portal is an early business idea and justification, which instead fits an Initiative Proposal under Outlines." },
    { text: "A higher-level technical design for the approved calibration project becomes an Outline because its final details are still missing.", correct: false, reason: "The calibration artifact remains a technical and functional description for an approved solution. Its level of detail identifies Preliminary Solution Design, not a business-focused Outline." },
    { text: "Only Solution Designs, and never Preliminary Solution Designs, describe approved solutions.", correct: false, reason: "Both Designs subtypes concern approved solutions. They differ in detail, not in whether approval has occurred, so this claim reverses the key distinction." },
  ], [[0], [1, 2], [0, 1, 2]]),
];

export const module4FinalsCheckboxes: (MultiItem & Explained)[] = [
  checkbox({
    name: "Sable Peak Rentals · a small team and an enormous grid",
    context: [
      "Sable Peak Rentals has three architects and a short deadline to advise on opening a second distribution center. Executives need to understand which locations and responsibilities would change; designers need to understand the logical information and functions supporting reservations. Many existing diagrams can be reused, although some address only the current depot. The team wants Zachman to reveal which descriptions exist and which decision-critical views are missing, rather than replace its separate planning and delivery practices.",
      "A sponsor has seen two lecture illustrations with different row sets and asks whether one must be a mistake. The architecture lead also worries that relationships between grid cells will still require explicit thought. You are preparing a recommendation about the grid's practical value and limits, including whether completing every possible cell is a sensible prerequisite for making the distribution-center decision under the stated staffing and time constraints.",
    ],
    decision: "Select all recommendations supported by the case and lesson.",
    source: "4.1 slides 8–13",
  }, [
    { text: "Classify the existing descriptions by perspective and question before deciding which gaps need work.", correct: true, reason: "The executive and designer concerns differ, while locations, people, data, and functions answer different questions. Crossing both dimensions makes the gaps meaningful." },
    { text: "Prioritize the cells needed for the second-center decision instead of requiring immediate completion of every cell.", correct: true, reason: "Three architects and a short decision deadline make usefulness the relevant criterion. Slide 13 supports a minimum viable, decision-critical start." },
    { text: "Treat the grid as sufficient specification of every relationship between descriptions.", correct: false, reason: "The lead's concern is valid: weakly specified cross-cell relationships are a stated limitation. Organizing views does not automatically reconcile them." },
    { text: "Keep the five-row slide-10 illustration distinct from the six-perspective academic example on slide 11.", correct: true, reason: "The supplied illustrations have different row sets. A faithful use distinguishes the depictions rather than silently declaring one incorrect or merging them." },
  ]),

  checkbox({
    name: "Pebble Arc Finance · preserving business meaning during migration",
    context: [
      "Pebble Arc Finance is replacing the workflow engine behind its internal loan-review process. Its business analysts maintain a model of review obligations and the information required from applicants. Designers maintain a process description independent of any particular engine, while implementers maintain a model tied to the selected execution platform. Translation rules connect these descriptions, and a proposed platform change reveals that one implementation shortcut does not preserve an important review obligation. The sponsor asks the team to make the mismatch visible before migration.",
      "The delivery manager proposes updating only the platform-specific model and assuming all higher-level meanings remain correct. The architect instead wants to inspect the mappings and trace the obligation through the models. You must identify the justified actions while keeping MDA's abstraction levels distinct from a complete description of the enterprise's strategy, organization, and other concerns beyond software development and deployment.",
    ],
    decision: "Select all actions consistent with the lecture's MDA treatment.",
    source: "4.1 slides 15–17",
  }, [
    { text: "Use the business-obligation model as a CIM reference when assessing whether the migration preserves requirements.", correct: true, reason: "The business obligation describes the problem without committing to computation. A CIM provides relevant meaning against which the platform shortcut can be checked." },
    { text: "Inspect the translation rules between adjacent models rather than assuming that changing the PSM preserves every obligation.", correct: true, reason: "The shortcut already exposes a mismatch. Mappings are rules and techniques for translation, so their adequacy needs review when a platform decision changes." },
    { text: "Treat the engine-independent process as a PSM once its diagram is stored beside the platform-specific model.", correct: false, reason: "The process remains a PIM because it is independent of an execution platform. Repository location does not change the abstraction or commitments of its contents." },
    { text: "Declare the enterprise's entire architecture complete once its CIM, PIM, and PSM files are present.", correct: false, reason: "The team is addressing a software migration. The lecture cautions that MDA is too IT-centric to cover all EA alone, and file presence cannot establish enterprise-wide completeness." },
  ]),

  checkbox({
    name: "Northwind Lantern Events · composing a booking service",
    context: [
      "Northwind Lantern Events runs exhibitions in several cities. Its booking process currently duplicates capacity checks, reservation handling, and payment confirmation in each city application. The team proposes reusable services with defined external behavior so different event processes can consume them. A capacity provider plans to change how it stores seat allocations, while preserving the behavior agreed with consumers. Business managers want to discuss the booking responsibilities without learning the provider's storage algorithm, and engineers want to reduce repeated integration work.",
      "The supplier argues that a service interface eliminates the need to agree what the service actually does. A second team wants each consuming application to read the provider's internal tables directly so it can imitate the algorithm. Your review must distinguish the service concept's benefits from these proposals, using the case's need for external agreements, reuse, and separation between provided functionality and internal implementation.",
    ],
    decision: "Select all conclusions that fit the proposed service-oriented architecture.",
    source: "4.1 slides 18–19",
  }, [
    { text: "Defined capacity and reservation services can be reused in more than one city's booking process.", correct: true, reason: "The current applications duplicate the same functionality. Shared provided services support reuse and composition across different consuming processes." },
    { text: "Promote loose coupling by having consumers depend on agreed service behavior rather than imitate the provider's storage algorithm.", correct: true, reason: "The planned storage change illustrates why separating external behavior from internal implementation matters. Direct dependence on internal tables undermines that separation." },
    { text: "Agreeing external behavior is unnecessary once the provider publishes a technical endpoint address.", correct: false, reason: "An address does not describe the capacity check or promised response. The case requires an agreement about provided functionality for consumers to use the service meaningfully." },
    { text: "Restrict the service model to software because business booking responsibilities cannot be expressed as provided services.", correct: false, reason: "The lesson applies service principles across business and software domains. Managers can discuss provided booking functionality without knowing storage details." },
  ]),

  checkbox({
    name: "Aster Vale Waterworks · moving from vision to operation",
    context: [
      "Aster Vale Waterworks has agreed a target architecture for meter readings and customer billing. The remaining work includes identifying practical solution opportunities and delivery vehicles, arranging the transition from today's fragmented systems, overseeing implementation against architecture decisions, and handling later changes once the new architecture is in use. The sponsor wants these responsibilities distinguished because the migration planner and implementation reviewer have been issuing conflicting instructions to the delivery team. Nobody disputes the target vision, but the route to it still needs coordination.",
      "The architecture office prepares an ADM responsibility chart using the supplied phase map. It also records a requirement that meter corrections must remain traceable, which affects migration, build decisions, and operation. You are asked to validate the phase assignments and ensure the continuing requirement is managed across them, rather than placing all architecture work into one final sign-off activity after the system has gone live.",
    ],
    decision: "Select all assignments matching the ADM phase map.",
    source: "4.2 slides 11–12",
  }, [
    { text: "Use Phase E for initial solution opportunities and delivery vehicles, then Phase F for the baseline-to-target migration plan.", correct: true, reason: "The case separates identifying workable delivery choices from sequencing the transition. These correspond to Opportunities and Solutions, then Migration Planning." },
    { text: "Assign architectural oversight during implementation to Phase G.", correct: true, reason: "The implementation reviewer needs Implementation Governance, which is G. It supplies architectural oversight while the delivery work occurs." },
    { text: "Use Phase H to manage subsequent architecture changes.", correct: true, reason: "The later operational changes are the Architecture Change Management concern described for H, rather than the initial migration plan in F." },
    { text: "Keep the correction-traceability requirement connected to the affected phases through Requirements Management.", correct: true, reason: "Traceability affects migration, implementation, and operation. The central Requirements Management activity maintains such concerns throughout the cycle." },
  ]),

  checkbox({
    name: "Silver Bracken Retail · common meaning and technical consistency",
    context: [
      "Silver Bracken Retail has inconsistent interpretations of customer consent across its stores and online team. Business and IT leaders want shared high-level principles and a simple conceptual view of the important entities and relationships. Engineers also need a common representation of the technologies used and implementation-level prescriptions for configuring them. Previous projects improvised these technical choices independently, making integrations difficult to support. The architecture team plans to maintain reusable global guidance rather than produce a separate prescription for each approved project.",
      "A repository administrator wants one Standards folder for all four artifacts because all of them influence decisions. The business sponsor worries that this will hide the shared organizational meaning behind specialist terminology. Your task is to distinguish Considerations from Standards and select the appropriate subtypes, while preserving the fact that global prescriptions can be updated periodically without becoming temporary descriptions of one initiative.",
    ],
    decision: "Select all classifications that meet Silver Bracken's needs.",
    source: "4.3 slides 6, 12–15",
  }, [
    { text: "Use Principles and Conceptual Data Models under Considerations for shared planning meaning and business-critical entities.", correct: true, reason: "The leaders need business-understandable global rules and conceptual relationships. Both named subtypes are Considerations and support shared business-and-IT context." },
    { text: "Use Technology Reference Models and Guidelines under Standards for the technology representation and implementation prescriptions.", correct: true, reason: "The technology view and configuration guidance serve technical consistency. Slide 15 lists both subtypes under Standards and labels both Essential." },
    { text: "Classify the shared conceptual entity model as a Logical Data Model under Standards because it mentions data.", correct: false, reason: "The case explicitly asks for simple business-level conceptual meaning, not a logical or physical technical model. Mentioning data alone does not determine the subtype." },
    { text: "Reclassify every periodically revised global prescription as a temporary Changes artifact.", correct: false, reason: "The guidance remains global and reusable. Rules are permanent in character but periodically updated; revisions do not by themselves turn them into initiative-specific Changes." },
  ]),

  checkbox({
    name: "Coral Reed Tourism · a business planning wall",
    context: [
      "Coral Reed Tourism wants to align its technology spending with a four-year move into accessible travel packages. Its leadership workshop needs a hierarchy of business capabilities, a plan of initiatives with direct business value, a picture of the desired long-term organization, and a high-level view of current booking flows. Business managers and architects will use the same wall of diagrams to identify gaps between current operations and desired outcomes. The diagrams are deliberately brief and understandable without implementation details.",
      "An engineer proposes moving the current-flow diagram to Landscapes solely because it depicts today's operations. The workshop facilitator wants classification to follow the lecture's named subtypes and the diagrams' purpose, rather than a simple present-versus-future rule. You must select appropriate Visions subtypes while avoiding an unrelated technical data model that would not answer the workshop's business planning questions at the intended level.",
    ],
    decision: "Select all subtype recommendations supported by the lecture.",
    source: "4.3 slides 16–17; 4.3 slide 15",
  }, [
    { text: "Use Business Capability Models for the capability hierarchy and Roadmaps for initiatives with direct business value.", correct: true, reason: "The first two needs match the lecture's two Essential Visions subtypes. They support shared planning of what the business needs and how initiatives contribute." },
    { text: "Use Target States for the desired long-term organizational picture.", correct: true, reason: "The requested future organizational description matches the Target States subtype under Visions, rather than technical implementation detail." },
    { text: "Keep an appropriate Context Diagram under Visions even when it depicts current operational flows.", correct: true, reason: "Slide 17 explicitly lists current-flow Context Diagrams under Visions. Its stated business planning use supports that classification despite its present orientation." },
    { text: "Replace the business planning wall with a Logical Data Model because all graphical artifacts are Visions.", correct: false, reason: "A graphic format does not determine the cell. Logical Data Models are a Standards subtype and would not replace the requested capability and business-outcome views." },
  ]),

  checkbox({
    name: "Briar Cove Health Supply · finding reusable assets",
    context: [
      "Briar Cove Health Supply has acquired several small distributors. Its architects suspect that teams are buying duplicate applications because nobody can see the existing technical assets. The immediate exercise is to draw the system connections, catalog applications and their essential properties, and map major systems to the business capabilities they support. Infrastructure staff also need a technical upgrade plan for aging platforms. These artifacts will support specialist decisions about reuse and technical evolution, rather than describe the value of one proposed business initiative.",
      "A procurement manager wants to classify the whole collection as Outlines because acquisition integration will cause changes. The architecture team instead wants to distinguish the structures being documented from future project proposals that might use them. Your task is to select the Landscape subtypes that match the actual descriptions and explain why their maintenance can improve reuse and reduce duplication without making the artifacts detailed project specifications.",
    ],
    decision: "Select all appropriate Landscape subtype assignments.",
    source: "4.3 slides 18–19",
  }, [
    { text: "Use Landscape Diagrams for technical system connections and Inventories for the asset catalog.", correct: true, reason: "Boxes-and-arrows system structure matches Landscape Diagrams; a catalog of assets and essential properties matches Inventories. Both address the missing technical visibility." },
    { text: "Classify the system-to-capability mapping as a Business Capability Model solely because it mentions business capabilities.", correct: false, reason: "The required high-level mapping of important systems to capabilities fits Enterprise Systems Portfolios under Landscapes. Mentioning capabilities does not turn the technical asset mapping into the capability hierarchy described by Business Capability Models." },
    { text: "Use IT Roadmaps for the purely technical platform-upgrade plan.", correct: true, reason: "The future upgrade plan coordinates technical evolution. IT Roadmaps are explicitly included in Landscapes despite the type often representing current structures." },
    { text: "Treat the technical catalog as an Outline solely because an acquisition prompted its creation.", correct: false, reason: "The artifact describes available assets, not a business-readable initiative's value and impact. The event prompting its creation does not replace its actual subject and focus." },
  ]),

  checkbox({
    name: "Elm Terrace Publishing · choosing a subscription initiative",
    context: [
      "Elm Terrace Publishing is considering a subscription service to be delivered over the next eighteen months. Business leaders first want a high-level description of the proposed solution and its effect on editorial and customer-service work. They also want two delivery alternatives compared before funding a particular approach. A separate editor has suggested an early idea for school bundles and written a short justification, but no one has approved that initiative. The meeting is about business value, impact, and investment choices rather than instructions for developers.",
      "A technical lead volunteers to replace the entire meeting pack with database schemas and connector settings because those are more precise. The sponsor asks the architect to keep the material appropriate to the decision and its audience. You must select the Outlines subtypes for the three needs and judge whether detailed technical specifications can substitute for the business-readable descriptions the leadership team actually requested.",
    ],
    decision: "Select all appropriate recommendations for the investment meeting.",
    source: "4.3 slides 20–23",
  }, [
    { text: "Prepare a Solution Overview explaining the proposed subscription solution and its business impact.", correct: true, reason: "The first decision needs a high-level proposed solution understandable to business leaders, exactly the purpose of this Essential Outlines subtype." },
    { text: "Use an Options Assessment to evaluate the two delivery alternatives for the subscription initiative.", correct: true, reason: "The comparison concerns alternatives for a specific initiative. Options Assessments are a Common Outlines subtype, not detailed approved-project build specifications." },
    { text: "Treat the early school-bundle idea and justification as an Initiative Proposal.", correct: true, reason: "The unapproved early idea matches the Initiative Proposals subtype under Outlines. Approval and technical design detail have not yet been established." },
    { text: "Substitute developer schemas for every Outline because technical precision alone meets the business investment need.", correct: false, reason: "The meeting needs value and operational impact in business-readable terms. Technical build detail has a different immediate audience and cannot by itself answer those investment questions." },
  ]),

  checkbox({
    name: "Hearthline Fabrication · handing an approved project to builders",
    context: [
      "Hearthline Fabrication has approved a nine-month project connecting shop-floor inspection devices to its defect-management application. Project teams need a higher-level technical and functional design to coordinate the solution, followed by detailed specifications for interfaces, behavior, and implementation. The business case and options comparison were completed before approval. Engineers now need actionable build direction, and the architecture lead wants to improve delivery quality by keeping the approved solution's design consistent across device and application teams rather than reopening its investment justification.",
      "The delivery coordinator suggests labeling the higher-level technical design Preliminary Solution Design and the detailed specification Solution Design. A manager objects that preliminary always means unapproved and that all project-specific documents must remain permanently maintained structures. You must assess the suggested labels and lifecycle using the lecture's Designs subtypes and its distinction between relatively stable Structures and purpose-specific temporary Changes artifacts.",
    ],
    decision: "Select all conclusions that fit Hearthline's situation.",
    source: "4.3 slides 7–8, 22–23",
  }, [
    { text: "Both requested artifacts can belong to Designs because both provide technical and functional direction for an approved solution.", correct: true, reason: "The case concerns build direction after approval. Designs are IT-focused Changes, and both named subtypes concern approved solutions." },
    { text: "The coordinator's proposed labels distinguish higher-level Preliminary Solution Design from detailed Solution Design.", correct: true, reason: "The key difference is detail. Neither the word preliminary nor the higher abstraction removes the inspection project's approved status." },
    { text: "Treat the approved solution's technical Designs as dual merely because business leaders approved the investment.", correct: false, reason: "Approval does not change the artifact's focus. Device and application builders need specialist detail; the lecture classifies Designs as IT-focused and non-dual, with project delivery quality as their purpose." },
    { text: "Classify the project-specific design descriptions as permanent Structures simply because the solution will remain in service.", correct: false, reason: "A lasting system and a design artifact serving a particular change are different. The lecture treats Changes as temporary, discarded after their specific purpose, rather than continuously maintained Structures." },
  ]),

  checkbox({
    name: "Pinewake Cooperative · choosing a manageable artifact set",
    context: [
      "Pinewake Cooperative is starting an architecture practice with a small team. It has chosen useful artifacts spanning all six CSVLOD types, including global principles, technical implementation guidance, business capability planning, technical system views, business initiative overviews, and approved-project designs. The director wants to add documents only when they help an actual decision. A consultant instead recommends producing every subtype immediately and measures progress by the number of empty templates converted into files, even when no team has identified a use for them.",
      "The director asks you to interpret the lecture's popularity groups and pragmatic usage guidance. The discussion specifically concerns Technology Reference Models, Guidelines, Options Assessments, and Preliminary Solution Designs, whose labels are stated in the supplied lesson. You must advise whether those popularity labels establish a compulsory local checklist, while avoiding unsupported assumptions about how many organizations use an artifact based on Pinewake's own small repository.",
    ],
    decision: "Select all statements supported by the lesson's popularity and usage guidance.",
    source: "4.3 slides 15, 21, 23–24",
  }, [
    { text: "Technology Reference Models and Guidelines are both labeled Essential in the lesson.", correct: true, reason: "Slide 15 labels both Standards subtypes Essential. The category records prevalence, with Essential meaning more than half of practices in the lesson's account." },
    { text: "Options Assessments are labeled Common, while Preliminary Solution Designs are labeled Uncommon.", correct: true, reason: "These are the explicit labels on slides 21 and 23 respectively. They distinguish reported popularity without deciding whether Pinewake needs either artifact." },
    { text: "Select useful subtypes pragmatically; the lesson's typical 10–15 does not require every practice to create all 24.", correct: true, reason: "The director's decision-based selection matches slide 24. Typical usage and popularity groups describe practice rather than impose a template-completion quota." },
    { text: "A subtype's Essential label makes it compulsory for Pinewake even if it has no useful planning purpose there.", correct: false, reason: "Essential is a popularity category, not a universal local mandate. Pinewake should choose artifacts that support its needs rather than infer obligations from prevalence." },
  ]),
];
