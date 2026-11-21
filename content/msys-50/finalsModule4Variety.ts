import type { FinalsCase } from "./finalsCaseBuilder";

export const module4FinalsVariety: FinalsCase[] = [
  {
    format: "best",
    title: "Cinnabar Cold Chain · measuring framework adoption",
    context: [
      "Cinnabar Cold Chain wants fewer spoiled deliveries after an acquisition doubled its service territory. The dispatch team can show routes and depot hours, while facilities keeps a separate register of available refrigeration equipment. Both groups use the same architecture template and report full compliance. The busiest depot still accepts trucks at times when its backup cold room is unavailable, and neither team owns the consequences of a change to the other team's schedule. The architecture office has one month to demonstrate a result before its pilot budget is renewed.",
      "The chief operating officer asks for a pilot that can explain which dispatch decisions rely on facilities data and show how those decisions are kept accurate when either team changes its plans. The consultant who supplied the template offers a second template and a dashboard for counting completed pages.",
    ],
    task: "Which pilot acceptance criterion would best address the chief operating officer's request?",
    source: "4.1 slides 4–7",
    choices: [
      { text: "Measure completion of the new dispatch and facilities templates against the consultant's quality checklist.", correct: false, reason: "Completed templates document progress, but the current compliant templates already coexist with an unmanaged dependency." },
      { text: "Trace depot availability to dispatch decisions and demonstrate how both owners coordinate an actual schedule revision.", correct: true, reason: "The demonstration establishes a cross-domain relationship and verifies that related changes are tracked and carried out methodically." },
      { text: "Consolidate dispatch and facilities descriptions into one repository and measure how quickly each team can enter a revision.", correct: false, reason: "A shared repository supports access while leaving the ownership and downstream effects of a revision unresolved." },
      { text: "Select the established framework with the most detailed coverage of logistics assets and use its adoption as the pilot result.", correct: false, reason: "Detailed framework coverage can help organize the effort, while the pilot needs evidence that the specific dependency is managed." },
    ],
  },
  {
    format: "best",
    title: "Juniper Auction House · which view explains the deadline",
    context: [
      "Juniper Auction House runs monthly sales through local rooms and an online marketplace. Its sales director wants every branch to follow one business calendar for reserving lots, closing bids, and confirming deposits. The current documentation describes which rooms hold an auction and how staff manually reconcile late deposits. Engineers have also prepared a diagram showing the jobs in the booking application and a database table for storing their execution times. None of these descriptions tells branch managers when the business considers a lot reserved or releases it back for another bidder.",
      "At a planning workshop, the director and branch managers agree on an organization-wide timetable of business events that will apply to in-person and online sales. The timetable defines when events must occur, while the application team will separately decide how to enforce them.",
    ],
    task: "Where should the agreed business timetable be classified in Zachman's perspective-by-question grid?",
    source: "4.1 slides 8–11",
    choices: [
      { text: "Designer × When", correct: false, reason: "A logical description of the application's timed behavior would fit the Designer perspective, while the managers are defining business events." },
      { text: "Owner × How", correct: false, reason: "An Owner × How description would explain the branch's workflow, while the timetable specifies deadlines and business events." },
      { text: "Planner × Where", correct: false, reason: "Planner × Where could locate the sales rooms in enterprise scope, while the agreed timetable applies across those locations." },
      { text: "Owner × When", correct: true, reason: "The branch managers' timetable describes business-level events and deadlines, placing it at the Owner perspective and the When abstraction." },
    ],
  },
  {
    format: "best",
    title: "Alon Freight Exchange · choosing what to standardize first",
    context: [
      "Alon Freight Exchange matches unused truck space with small exporters. Operations has already agreed on eligibility rules and service promises, and software architects can describe the screens and decision steps that will support those rules. Two carriers want to test the new process this quarter, but one hosts its own workflow engine and the other restricts deployments to a managed cloud runtime. Procurement cannot select a common execution platform until both carriers complete their trials. It still needs a single model against which it can compare the cases shown at both demonstrations.",
      "One carrier lends Alon a modeling application that can save its model as a diagram. The head of testing wants that diagram to describe how the proposed software decides what to do when a shipment is too large, when space disappears, and when two requests arrive together.",
    ],
    task: "Which model should Alon make the shared reference for the vendor demonstrations?",
    source: "4.1 slides 15–17",
    choices: [
      { text: "A PIM specifying the decision and workflow logic while leaving both execution platforms open", correct: true, reason: "Alon needs shared software logic that can be realized on different platforms, which is the PIM's level of commitment." },
      { text: "A CIM that records shipment terms, eligibility, and the operational promises agreed with exporters", correct: false, reason: "The CIM explains requirements and domain meaning, while Alon now needs a model of how proposed software makes its decisions." },
      { text: "A PSM written for the managed cloud runtime because the lending carrier's tool produced the diagram", correct: false, reason: "The authoring tool says nothing about platform commitments in the model, and choosing one carrier's runtime would break the common baseline." },
      { text: "A PSM that treats the two tested runtimes as implementation decisions within the common model", correct: false, reason: "A model that binds behavior to particular runtimes would hide the distinction between features both pilots must demonstrate and their platform realizations." },
    ],
  },
  {
    format: "best",
    title: "Maharlika Equipment Care · what an overnight confirmation promises",
    context: [
      "Maharlika Equipment Care repairs food trucks under monthly service agreements. A roadside partner accepts repair requests overnight and needs the same booking outcome as Maharlika's call center, even though customers describe breakdowns in different ways through the two channels. The booking software sometimes schedules a local shop and sometimes asks a mobile team to take the job. Maharlika plans to change that assignment logic when a new branch opens. The partner also needs to distinguish a guaranteed response before morning from an acknowledgment that still requires confirmation.",
      "The partner agreement currently promises only access to a technical endpoint. During a trial, a partner agent told a driver that a repair was confirmed when the system had only accepted a request for review. The service manager can revise the agreement and training before the branch opens.",
    ],
    task: "Which revision best specifies the external behavior the roadside partner needs?",
    source: "4.1 slides 18–19",
    choices: [
      { text: "Document the assignment rule for choosing between a local shop and the mobile team, including the new branch's dispatch priority.", correct: false, reason: "The dispatch priority describes provider implementation, while the partner needs to know which response it can promise to the driver." },
      { text: "Give the partner access to the internal work queues so agents can infer arrival windows from each shop's assignments.", correct: false, reason: "Access to internal queues couples the partner's promise to routing details that Maharlika plans to change." },
      { text: "Define eligible requests and explain the returned outcomes, including when a response commits Maharlika to a response window.", correct: true, reason: "The revision specifies what the service provides and tells the consumer how to act on each possible response." },
      { text: "Publish separate endpoint addresses for the call center and partner so each channel can adopt its own meaning for confirmation.", correct: false, reason: "Separate addresses leave the guaranteed response undefined and permit inconsistent interpretation across channels." },
    ],
  },
  {
    format: "select",
    title: "Harana Laundry Services · making three views agree",
    context: [
      "Harana Laundry Services collects linen from boutique hotels. Following a contract dispute, managers describe a rule that gives hotels until 10 a.m. to request a missed collection. The operations lead draws a route chart showing the hotels and laundries that can handle a second collection. A technology builder documents the time field and interface used to reject requests. Support staff report that the system's recorded timestamp sometimes differs from the timestamp on the customer's receipt. The quality team has already used a Zachman grid to locate the three descriptions.",
      "The company wants a review packet that will let managers and builders resolve the disagreement and later identify which view to revisit when the guarantee changes. The packet can include traceability notes alongside the original views. Their diagramming license expires next month, and a supervisor suggests reclassifying every description filed under the same complaint as a single artifact.",
    ],
    task: "Select all recommendations that support the work the quality team needs to do.",
    source: "4.1 slides 8–13",
    choices: [
      { text: "File the route chart under Where when its purpose is to show the locations and route distribution.", correct: true, reason: "The chart's principal subject is where collections and processing can occur, even though managers are using it to resolve a timing dispute." },
      { text: "File the contract's time limit and the interface field in the same perspective because they concern the same complaint.", correct: false, reason: "The contract expresses a business rule while the interface field is a technological realization, so the views need distinct perspectives." },
      { text: "Record how the business deadline relates to the timestamp the implementation evaluates.", correct: true, reason: "Explicit tracing addresses Harana's discrepancy because the grid itself does not specify how descriptions in different cells relate." },
      { text: "Keep the grid when switching diagramming tools while carrying over the perspective and question of each description.", correct: true, reason: "Zachman's classification is independent of tools, and a new tool does not change what each artifact describes." },
    ],
  },
  {
    format: "select",
    title: "Kaway Market Services · auditing a model vocabulary",
    context: [
      "Kaway Market Services collects stall fees for night markets. It has agreed to test a simplified digital filing process with one market before deciding whether any vendor should take over payment collection. The management group has a description of permit obligations and the collector's responsibilities that avoids software details. The software designer has a process model that assigns validation and reconciliation steps to logical components without selecting a runtime. A supplier presents its implementation model and shows how a proprietary queue library handles retries when connectivity returns.",
      "Kaway's contract also asks for evidence that proposed software changes can be traced back to the shared model. The city liaison must separately settle who may waive late fees and how appeals will be heard. The supplier proposes accepting the three models as the company's entire enterprise architecture after the trial.",
    ],
    task: "Select all recommendations consistent with using MDA to review the supplier's deliverables.",
    source: "4.1 slides 15–17",
    choices: [
      { text: "Require vendors to produce the same platform-specific queue design so the project can count as vendor-neutral.", correct: false, reason: "Vendor neutrality is supported by maintaining a common abstraction and mapping to platforms, while the proprietary retry design is a platform commitment." },
      { text: "Use the platform-specific retry model as a replacement for the market's technology-neutral permit obligations.", correct: false, reason: "The retry model specifies a realization on one platform and cannot replace the CIM's business obligations and responsibilities." },
      { text: "Treat the three software-focused models as sufficient evidence that the appeals and governance arrangements have been resolved.", correct: false, reason: "MDA helps specify and deploy software, while the case's unresolved authority and appeals decisions need wider enterprise architecture work." },
      { text: "Review the mapping in both directions when a vendor-specific behavior has to be traced back to the shared model.", correct: true, reason: "The lesson depicts bidirectional model mappings, which help the reviewer inspect how a platform decision relates to the platform-independent description." },
    ],
  },
  {
    format: "best",
    title: "Ilog Metering Cooperative · drawing a boundary for the pilot",
    context: [
      "Ilog Metering Cooperative serves three municipalities that use different schedules for reading water meters. Its small architecture team already has defined responsibilities and an agreed review process. The mayor of one municipality wants to start a shared billing initiative before the next budget year, but the other two can only lend staff for a pilot. A supplier has submitted rough prices for a replacement platform. The board has yet to agree whether the first initiative covers billing, reading schedules, or both, and the community office says tenants should be consulted because they receive billing notices.",
      "The sponsor wants the team to set a direction, describe the boundary of the first effort and its limitations, identify representatives from the affected groups, and ask the board to approve that scope before separate domain work begins.",
    ],
    task: "Which ADM activity best fits the sponsor's immediate request?",
    source: "4.2 slides 11–12",
    choices: [
      { text: "Phase A — Architecture Vision", correct: true, reason: "The sponsor wants a vision, agreed scope and limitations, stakeholder identification, and approval for the effort." },
      { text: "Preliminary Phase — establish and tailor the architecture capability", correct: false, reason: "Ilog already has a team and review process, while the open decisions concern authorization and scope for this initiative." },
      { text: "Phase B — Business Architecture", correct: false, reason: "Developing the detailed business architecture depends on knowing which billing and reading concerns belong in the approved vision." },
      { text: "Phase E — Opportunities and Solutions", correct: false, reason: "Vendor price information can inform the discussion, while delivery vehicles and initial implementation planning are beyond the decision at hand." },
    ],
  },
  {
    format: "best",
    title: "Dagos Port Systems · what can travel to another terminal",
    context: [
      "Dagos Port Systems wants a regional operator to reuse some of its drawings and reference material while planning a new terminal. Its library includes universal networking models, a standard design for generic appointment scheduling, a framework for documentation checks used at cargo terminals, and a drawing of the access gates and local exceptions at Dagos's own east terminal. The regional operator already has an established development method and wants to browse the material without changing its project stages. It needs to know where to look first for shared approaches to cargo checks.",
      "The repository team proposes four ways to index the documents. The operator asks for an index that captures how broadly a document applies and lets it find industry material without mistaking Dagos's site-specific exceptions for reusable recommendations.",
    ],
    task: "Which indexing plan best serves the operator?",
    source: "4.2 slides 5–8",
    choices: [
      { text: "Use ADM to index foundational and site-specific assets as successive implementation phases.", correct: false, reason: "ADM describes the work of developing and evolving an architecture, while Dagos needs to distinguish architecture assets by breadth of applicability." },
      { text: "Use the Capability Framework to rank assets by whether an individual, a team, or a regional operator currently maintains them.", correct: false, reason: "Organizational responsibilities matter to architecture capability, while the operator needs to find material with the right scope of reuse." },
      { text: "Use the Enterprise Continuum to distinguish foundation, common-system, industry, and enterprise-specific material.", correct: true, reason: "The generic-to-specific classification lets the operator find cargo-industry checks and recognize the local gate drawing as enterprise-specific." },
      { text: "Use the Content Framework to tag the assets by domain and infer how reusable each is from whether it belongs to the technology domain.", correct: false, reason: "Domain describes the aspect of architecture being modeled, so a foundation model and a one-site design can both concern technology." },
    ],
  },
  {
    format: "best",
    title: "Salin Diagnostic Network · the meaning of a canceled appointment",
    context: [
      "Salin Diagnostic Network is implementing a new patient scheduling model across six diagnostic centers. The centers agree on the business process for canceling appointments. In the third center's pilot, however, two applications currently use different definitions of a canceled reservation. The finance team treats a refunded reservation as canceled, while a scheduling application releases a slot even if a refund is still pending. A warehouse team offers to increase server capacity because the duplicate appointments became apparent during a busy morning, and the software vendor offers to apply a patch to one screen.",
      "The architecture team needs to describe a shared model of appointment and refund information and specify which applications own or exchange each status. The pilot's scope and vision are approved, and an infrastructure review has already ruled out a capacity problem.",
    ],
    task: "Which ADM phase provides the primary home for the architecture work the team now needs?",
    source: "4.2 slides 9, 11–12",
    choices: [
      { text: "Phase B — Business Architecture, to restate the agreed cancellation policy and assign business owners", correct: false, reason: "The business process is agreed, while the case asks for definitions of information assets and responsibilities of the applications handling them." },
      { text: "Phase C — Information Systems Architectures, to develop the shared data definitions and application interactions together", correct: true, reason: "Phase C develops Data and Application architectures, both of which are needed to align statuses and exchanges across the centers." },
      { text: "Phase D — Technology Architecture, because exchanged appointment statuses travel through deployed software", correct: false, reason: "Phase D covers supporting infrastructure and technology capabilities, while the identified problem lies in data meaning and application interactions." },
      { text: "Phase G — Implementation Governance, to check the proposed vendor patch against the approved architecture", correct: false, reason: "Implementation oversight may follow, but the architecture to govern the patch must first specify the shared definitions and interactions." },
    ],
  },
  {
    format: "best",
    title: "Lanipao Food Processing · checking a shortcut during rollout",
    context: [
      "Lanipao Food Processing approved a target architecture for recording inspections across two plants. Its migration plan places the newest production line on the shared record system first because that plant can spare a weekend for cutover. During installation, the partner proposes keeping line-level access rules in a local application despite the target architecture calling for a shared service. The partner says the shortcut protects the installation date and can be removed later. Plant managers are willing to keep the original schedule only if the rollout conforms to the approved architecture or the appropriate governing body reviews the departure.",
      "The project manager can still make day-to-day installation decisions. The architecture lead has been asked to examine the contractor's proposal against the approved target and decide what architectural action the rollout needs before the release.",
    ],
    task: "Which ADM activity best describes the architecture lead's immediate responsibility?",
    source: "4.2 slides 11–12",
    choices: [
      { text: "Phase F — Migration Planning, by redrawing the baseline-to-target sequence before evaluating the shortcut", correct: false, reason: "The rollout sequence is set, and the immediate decision is whether the implementation conforms to the approved target." },
      { text: "Phase H — Architecture Change Management, by treating the installer's proposed departure as an agreed change to the operating architecture", correct: false, reason: "The proposal is a deviation raised during delivery and requires oversight before Lanipao can accept it." },
      { text: "Phase E — Opportunities and Solutions, by treating the choice of where to keep access rules as an initial selection of delivery vehicles", correct: false, reason: "The initiative is already in installation, so the proposed departure is an implementation issue rather than early selection of delivery vehicles." },
      { text: "Phase G — Implementation Governance, by reviewing the proposed departure before the rollout proceeds", correct: true, reason: "Implementation Governance provides architectural oversight of the contractor's active delivery work." },
    ],
  },
  {
    format: "select",
    title: "Bituin Farm Finance · keeping an exception visible",
    context: [
      "Bituin Farm Finance is replacing the spreadsheets used by field offices to record equipment loans. The approved vision initially assumed that all borrowers would receive one monthly statement. Business architects discover that agency-funded loans are governed by an agreement allowing partner agencies to ask for separate statements. The data team is already defining customer and agency relationships, while application architects are sketching how the statement generator will obtain addresses and funding history. A contractor is due to bid on implementation, and the program office wants a stable set of requirements for that bid.",
      "The business analyst asks how to carry the exception into the work already in progress and how to handle any revisions that designers discover. The program office can update its working record before the contract is signed.",
    ],
    task: "Select all practices that fit the lecture's ADM treatment of this requirement.",
    source: "4.2 slides 9–12",
    choices: [
      { text: "Keep the exception in Requirements Management as the business and information systems architectures are developed.", correct: true, reason: "The exception matters to both business procedures and the data and application work, and the central activity connects to both phases." },
      { text: "Freeze Requirements Management once the requirement has been sent to Phase C and track newly discovered limitations only in the vendor's proposal.", correct: false, reason: "The diagram shows two-way connections, allowing findings from the affected phases to feed back into the ongoing requirement work." },
      { text: "Use the Phase C discoveries about agency relationships to clarify the shared requirement before the contractor bids.", correct: true, reason: "Findings from Data and Application work can inform the same central requirement that those architects are implementing." },
      { text: "Move the statement-generator application to Phase D so the central activity can handle both technology and the partner's business exception together.", correct: false, reason: "Application architecture belongs in Phase C, and Requirements Management can reach each affected phase without reassigning domain ownership." },
    ],
  },
  {
    format: "select",
    title: "Talisay Ferry Works · stitching together an existing practice",
    context: [
      "Talisay Ferry Works is formalizing architecture work across two repair yards. Its engineers already use an artifact classification grid to find diagrams, and its union agreement limits who may approve changes affecting shifts. The company wants to introduce ADM for the work of developing and governing architectures while preserving its existing repository and the formal approval process. A supervisor suggests declining TOGAF entirely because adopting it would require retiring every local tool. The architecture lead sees a potential hybrid but wants to explain where the company's architecture practice, method guidance, and reference assets belong in the framework.",
      "The team also operates a shared collection of generic technical examples used by both yards. At the next budget meeting it will present an adoption plan showing what it can introduce this financial year.",
    ],
    task: "Select all recommendations that Talisay can defend using the lesson's description of TOGAF.",
    source: "4.2 slides 4–8, 10",
    choices: [
      { text: "Introduce TOGAF incrementally while using the existing grid to classify descriptions and ADM to guide architecture work.", correct: true, reason: "TOGAF is modular and compatible with other approaches, so the grid and ADM can serve distinct purposes in the hybrid." },
      { text: "Define the roles and approval responsibilities for the architecture practice under the Architecture Capability Framework.", correct: true, reason: "The Capability Framework addresses how the practice is established and operated, including its people, responsibilities, and processes." },
      { text: "Use the Enterprise Continuum context when distinguishing shared reference assets from descriptions specific to one yard.", correct: true, reason: "The Continuum places architectural assets from generic to specific, and the overview groups reference models alongside it." },
      { text: "Treat ADM Guidelines and Techniques as part of the method guidance when explaining how the yards will conduct architecture work.", correct: true, reason: "The TOGAF overview places Guidelines and Techniques within ADM, making it the right place to connect method guidance to execution." },
    ],
  },
  {
    format: "best",
    title: "Sierra Glassworks · a briefing before a decision",
    context: [
      "Sierra Glassworks supplies custom windows to builders. Its board hears at trade meetings that several competitors are using digital measuring tools and automated quoting. Two department heads want to introduce tools immediately, but sales staff say builders still revise measurements after an initial order. The board asks the architecture team to examine how the technology is changing, what a plausible adoption could mean for sales and production, and which organizational risks deserve attention. It specifically wants a short assessment intelligible to executives who do not work with the quoting system.",
      "The team has neither identified a specific investment candidate nor agreed what any store must do. Its first deliverable should inform strategic discussion before policy or project decisions. Procurement can collect product specifications separately if a proposal goes forward.",
    ],
    task: "Which CSVLOD subtype best matches the requested deliverable?",
    source: "4.3 slides 12–15, 20–21",
    choices: [
      { text: "An Initiative Proposal under Outlines", correct: false, reason: "An Initiative Proposal offers an early justification for a specific initiative, while the board has commissioned a wider assessment of trends and their impact." },
      { text: "A Technology Reference Model under Standards", correct: false, reason: "A Technology Reference Model represents technologies used in the organization, while the briefing addresses possible effects of a developing trend." },
      { text: "An Analytical Report under Considerations", correct: true, reason: "The requested executive-level analysis of technology trends and their organizational effects fits an Analytical Report." },
      { text: "A Direction Statement under Considerations", correct: false, reason: "A Direction Statement communicates a major decision, which the board is still considering." },
    ],
  },
  {
    format: "best",
    title: "Balangay Seed Exchange · explaining where value is added",
    context: [
      "Balangay Seed Exchange sells calibrated starter packs to farming cooperatives. Intake staff record growers' requests, a lab checks seed quality, packaging combines eligible varieties, and local coordinators show customers how to use the packs. The general manager wants a one-page view for a workshop on why cooperatives renew despite cheaper alternatives. Each group can supply a list of handoffs or a departmental capability chart, but the manager wants to show how activities such as quality testing and planting advice contribute to reliable yields and repeat orders.",
      "The workshop will bring together managers and IT planners. It will use the present operation to test assumptions about sources of business value before the teams choose any future investments. The deliverable should be readable by participants who have never used the firm's inventory system.",
    ],
    task: "Which artifact would best frame the workshop discussion?",
    source: "4.3 slides 16–19",
    choices: [
      { text: "A Value Chain under Visions that connects each activity with the contribution it makes to customers", correct: true, reason: "A Value Chain explains how activities add value, which is the manager's question about reliable yields and renewals." },
      { text: "A Context Diagram under Visions that displays the main operational handoffs from intake through distribution", correct: false, reason: "A Context Diagram can illustrate current flows, but handoffs alone do not explain how the activities increase value for customers." },
      { text: "A Business Capability Model under Visions showing a hierarchy of the exchange's capabilities", correct: false, reason: "A capability hierarchy describes what the exchange can do, while the workshop asks how the work creates value." },
      { text: "An Enterprise Systems Portfolio under Landscapes mapping software to the exchange's business capabilities", correct: false, reason: "A systems portfolio focuses on important applications and their relationship to capabilities, while the requested analysis concerns the value produced by operating activities." },
    ],
  },
  {
    format: "best",
    title: "Kisap Parcel Exchange · solving the same design problem twice",
    context: [
      "Kisap Parcel Exchange receives package status updates from couriers and stores the last reported state for customers. Different external partners sometimes send the same event twice or deliver updates out of order, and three teams have independently built inconsistent responses. The architecture office is preparing material for engineers who will design new partner connections next year. It wants to capture a reusable way of arranging components to recognize duplicate events and handle late updates, with examples showing the conditions under which the approach applies.",
      "Existing teams use different approved messaging products, and the office wants the approach to work across them. It will commission project-specific implementation diagrams and product configuration instructions separately. A new engineers' portal will point each team to the reusable architectural material.",
    ],
    task: "Which CSVLOD subtype best fits the material for the engineers' portal?",
    source: "4.3 slides 14–15, 22–23",
    choices: [
      { text: "A Technology Reference Model under Standards that shows the approved messaging products across teams", correct: false, reason: "A reference model can show available technologies, while the portal needs a reusable solution to a recurring design problem across products." },
      { text: "Implementation Guidelines under Standards prescribing the exact configuration for the busiest messaging product", correct: false, reason: "Product-specific implementation prescriptions address one product, while the requested arrangement should transfer across products." },
      { text: "A Solution Design under Designs specifying how an approved partner project uses the existing components", correct: false, reason: "A Solution Design specifies a particular approved implementation, while the portal material will guide multiple future projects." },
      { text: "A Pattern under Standards recording a reusable design for receiving and interpreting partner events", correct: true, reason: "The duplicate and late event behavior is a recurring technical design problem, and the component arrangement is a reusable solution to it." },
    ],
  },
  {
    format: "best",
    title: "Patag Guest Lodges · taking a selected proposal to the board",
    context: [
      "Patag Guest Lodges manages four properties that currently take deposits through separate reservation tools. A small working group has already evaluated retaining those tools with manual reconciliation or introducing a shared online deposit service. Members recommend the shared service, but the board still needs to decide whether to fund it in the next budget cycle. The group has estimates of the desk staff time saved, a rough sequence explaining the new guest experience, and a view of what happens to payment exceptions during holidays.",
      "The chief financial officer wants a short document showing the proposed solution and its effects on guests, lodge staff, and reconciliations. She has already read the alternatives comparison and asks the group to explain the recommended initiative in terms the board can use to make its investment decision.",
    ],
    task: "Which artifact should the group prepare for the board?",
    source: "4.3 slides 20–23",
    choices: [
      { text: "An Options Assessment emphasizing another comparison between the manual and shared-service approaches", correct: false, reason: "The options have already been compared, and the board now requests a business-readable description of the recommended solution and its impact." },
      { text: "A Solution Overview describing the shared service at a high level and showing its business impact", correct: true, reason: "A Solution Overview presents a specific proposed solution in terms the board can use for an investment decision." },
      { text: "An Initiative Proposal that records the idea of a shared service and briefly explains why the group should investigate it", correct: false, reason: "The case has moved past initial idea justification and needs a description of the particular solution selected for the funding decision." },
      { text: "A Preliminary Solution Design explaining the approved components and proposed interfaces to the implementation team", correct: false, reason: "The board has yet to approve the initiative and requires a business view, while a Preliminary Solution Design concerns an approved solution and a technical audience." },
    ],
  },
  {
    format: "select",
    title: "Bantay Municipal Records · choosing what kind of direction to issue",
    context: [
      "Bantay Municipal Records is a service company that processes local governments' requests for archived paperwork. After two towns complained about unclear charges, executives draft three communications. The first asks business and technology teams to favor explanations applicants can understand whenever teams change the service. The second says that every office must send a fee notice before collecting payment. The third tells all offices that Bantay has decided to move the phone assistance operation to one city next year. Office managers and system owners both need to read the communications.",
      "The communications team wants separate labels so staff can tell which document helps compare future decisions, which imposes a requirement today, and which announces a corporate decision. It has also been asked to keep technical setup instructions out of these three documents.",
    ],
    task: "Select all classifications that follow from the purpose of the proposed documents.",
    source: "4.3 slides 12–15",
    choices: [
      { text: "Classify the decision-making advice on clear explanations as a Principle under Considerations.", correct: true, reason: "The advice helps business and IT teams make future choices without imposing a specific action in every situation." },
      { text: "Classify the mandatory pre-payment notice as a Policy under Considerations.", correct: true, reason: "The fee notice is a compulsory prescription governing how all offices carry out a business activity." },
      { text: "Classify the announcement of the approved operating decision as a Direction Statement under Considerations.", correct: true, reason: "The purpose of the communication is to convey a major organization-wide decision that leaders have already made." },
      { text: "Classify the notice requirement as implementation Guidelines under Standards because the payment system must support it.", correct: false, reason: "A business rule remains a Policy even when the system must enforce it, while Guidelines address technical implementation." },
    ],
  },
  {
    format: "select",
    title: "Amihan Med Supply · handing useful knowledge to the next team",
    context: [
      "Amihan Med Supply has finished a project to route orders through a new distribution center. The project design describes temporary cutover steps, specific service connections, and the checks performed before commissioning. The new center's service connections are now part of the permanent operating environment. Another project will need to find those connections when it adds a warehouse, and the engineering practice is considering making one tested configuration rule mandatory for future implementations across the company. The design included both facts but covered only the original project.",
      "The repository manager updates the architecture collection after each go-live. The manager asks what should remain actively maintained and how to carry project learning into the next initiative, while the original project will follow its ordinary records policy.",
    ],
    task: "Select all recommendations consistent with the purposes and lifecycles of CSVLOD artifacts.",
    source: "4.3 slides 6–8, 14–15, 18–19, 22–23",
    choices: [
      { text: "Preserve the whole cutover design as an active Standard because the deployed distribution center will remain in service.", correct: false, reason: "The original design serves a specific change, while a Standard captures global technical rules that remain applicable across initiatives." },
      { text: "Update the Landscape Diagram with the actual service connections so the next warehouse project can see the current environment.", correct: true, reason: "A Landscape Diagram depicts live technical structures and can be maintained as later initiatives change those connections." },
      { text: "Stop maintaining the live technical structure once it has been recorded in the finished project's design.", correct: false, reason: "The project description serves a temporary purpose, while Structures are relatively stable and should be updated as the environment changes." },
      { text: "Publish the tested configuration rule as implementation Guidelines if the practice adopts it for future projects.", correct: true, reason: "A technical prescription made reusable across initiatives fits Guidelines, even if it first appeared in a project design." },
    ],
  },
];
