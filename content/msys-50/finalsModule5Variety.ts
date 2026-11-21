import type { FinalsCase } from "./finalsCaseBuilder";

export const module5FinalsVariety: FinalsCase[] = [
  {
    format: "best",
    title: "Tern Cold Chain · estimating spare cooling capacity",
    context: [
      "Tern Cold Chain stores temperature-sensitive goods for grocery chains. During scheduled maintenance, a depot can transfer pallets to a backup cooler. Each incoming pallet needs a scan at dispatch, a space on a shuttle, and a second scan on arrival. Several depots share the same shuttle, and holding pallets outside a cooler risks spoiling the shipment. Tern must choose whether to rent another shuttle or add an arrival scanner before the holiday delivery peak.",
      "The team has measured rates for all three steps. For its first comparison, it will calculate the maximum hourly transfer rate under each alternative from these fixed rates and compare the result with the expected peak. Testing whether the reservation rules can let the same pallet be dispatched twice is a separate review scheduled for next week.",
    ],
    task: "How should the team classify the initial review?",
    source: "5.1 slides 5–7",
    choices: [
      { text: "Functional simulation, because the review follows dispatch, transport, and arrival as separate steps.", correct: false, reason: "Using a sequence of steps in a calculation establishes neither a simulation run nor a correctness check." },
      { text: "Quantitative analysis by an analytical approach, deriving a capacity estimate from the rates of the three steps.", correct: true, reason: "The team calculates hourly capacity from modeled rates and compares numerical results against the projected peak." },
      { text: "Functional analysis by an analytical approach, because the review checks whether the depot can transfer pallets.", correct: false, reason: "The first comparison asks how many pallets each design handles per hour, while reservation correctness is evaluated separately." },
      { text: "Quantitative simulation, because the proposed designs are being evaluated before they go live.", correct: false, reason: "Both approaches can assess an unbuilt design, but this team plans to calculate from fixed rates without running a model." },
    ],
  },
  {
    format: "best",
    title: "Copperleaf Foods · tracking a shared lot number",
    context: [
      "Copperleaf Foods operates separate packaging, wholesale, and customer returns teams. All three store a production lot number, but packaging assigns the number, wholesale copies it into shipment records, and returns sometimes enters a shortened version by hand. When a supplier recalls a contaminated ingredient, the safety team needs to find all the records carrying that lot. Orders can reach returns from several channels, so the sequence of each sale is already handled in a different model.",
      "The enterprise architect has one page for a cross-team workshop. Participants know the applications by their local names and want to see which records share identifiers, which steps create or copy those records, and where the lot can lose its meaning. The application replacement itself is outside this workshop, and the architect can add detailed warehouse and vendor views later if the project needs them.",
    ],
    task: "How should the architect group the workshop model?",
    source: "5.1 slide 18",
    choices: [
      { text: "By phase, tracing receipt, packaging, dispatch, and returns in chronological order.", correct: false, reason: "A phase grouping emphasizes time, while the workshop must trace a lot identifier across several routes and teams." },
      { text: "By product or service, separating the wholesale and direct-to-customer offerings.", correct: false, reason: "The same lot information crosses offerings, so grouping by offerings would push the shared record into several disconnected sections." },
      { text: "By physical distribution, separating records according to the site hosting each system.", correct: false, reason: "The safety team's issue is how the lot number is created and copied, regardless of which site hosts the systems." },
      { text: "By information used, showing where the lot number is assigned, carried, and shortened.", correct: true, reason: "Organizing around shared information makes it possible to trace the identifier and locate the steps where its meaning can change." },
    ],
  },
  {
    format: "best",
    title: "Juniper Transit · marking the current and proposed states",
    context: [
      "Juniper Transit wants to replace paper vouchers issued after canceled intercity trips. The current process sends passengers to a counter, where an agent verifies a trip and writes a voucher. A proposed app would issue the voucher automatically when its trip-status feed reports the cancellation. Larger stations already have the feed, but smaller stops still report cancellations by telephone, and the app supplier has yet to demonstrate coverage there.",
      "At the funding meeting the operations chief must decide whether to pay for a pilot at fully connected stations or invest first in extending the feed. Her briefing has space for one page and she wants the existing phone procedure and the proposed automation to appear on it. A draft caption says the app currently issues vouchers everywhere. The architect has call logs for current practice and a specification for the proposed app.",
    ],
    task: "What is the best edit before the funding meeting?",
    source: "5.1 slides 12–15",
    choices: [
      { text: "Label separate current and proposed states, show the small-stop exception, and mark the coverage assumption for checking.", correct: true, reason: "The edit establishes as-is and to-be boundaries and keeps the evidence and outstanding coverage question visible for the funding choice." },
      { text: "Keep a single combined flow with different colors for telephone and app channels and describe both as existing operations.", correct: false, reason: "Channel colors clarify presentation but leave the unsupported statement about current app availability in place." },
      { text: "Omit smaller stops from the page and brief the board only on the connected-station pilot.", correct: false, reason: "Small stops determine whether the board should extend the feed first, making the exception relevant to the requested scope." },
      { text: "Replace the current flow with the supplier specification and label the page to-be.", correct: false, reason: "A to-be label clarifies the specification's status, but the board still needs the current phone procedure to compare its funding options." },
    ],
  },
  {
    format: "best",
    title: "Ridgewell Instruments · splitting a release",
    context: [
      "Ridgewell Instruments is replacing software used to calibrate factory sensors. One implementation package can be deployed on each test bench, a second contains shared calibration rules, and a third imports results into the company archive. The business capability map separately divides calibration into recording baseline readings, adjusting sensors, and checking tolerances. Each capability uses more than one package. The plant cannot stop all its benches at once, and a failed archive release must be reversible without interrupting bench tests.",
      "The release manager asks for a first diagram showing the units her engineers can independently assign, deliver, and roll back. The team already has a page listing capabilities and another mapping the sites and benches. A calendar with blackout dates will be added after the implementation packages are understood. Teams are assigned packages even if their changes support the same business capability.",
    ],
    task: "Which structural dimension best fits the first release diagram?",
    source: "5.1 slides 16–18",
    choices: [
      { text: "Functionality, organized around baseline readings, adjustments, and tolerance checks.", correct: false, reason: "Functional decomposition explains what calibration does, while the release manager needs independently managed implementation units." },
      { text: "Time, organized around blackout dates and the order of deployment.", correct: false, reason: "Time addresses the later calendar and sequence, whereas this diagram must first show what can be delivered or rolled back separately." },
      { text: "Work, organized around the test bench, shared rules, and archive import packages.", correct: true, reason: "The Work dimension covers implementation units and module structure, the boundaries the release manager needs for assignment and rollback." },
      { text: "Location, organized around which packages are installed at each plant and bench.", correct: false, reason: "Location tells staff where deployments sit but leaves the shared rules and archive package boundaries unclear." },
    ],
  },
  {
    format: "select",
    title: "Goodacre Co-op · diagnosing a repair queue",
    context: [
      "Goodacre Co-op provides refrigerators to neighborhood shops and repairs them under a service contract. It wants to redesign its repair assignment process after some shops waited a full day for a technician. The current model has separate pages for the repair workflow, the phones that receive calls, and the inventory application. It leaves out the link between technician assignments and spare-part reservations even though that handoff held up several visits. In a workshop, dispatchers explain that the branch closing time is also used to divert requests to a weekend queue.",
      "The program manager has an afternoon to prepare a usable model for the redesign group. She asks the architect to identify work that can reveal the causes of the delay, verify disputed details, and keep the existing pages consistent. She can interview dispatchers and review job timestamps, but funds for a replacement system have yet to be approved.",
    ],
    task: "Select all steps that support the stated modeling goal.",
    source: "5.1 slides 4, 10–12, 14–15",
    choices: [
      { text: "Introduce the link from technician assignment to spare-part reservation.", correct: true, reason: "The handoff contributed to delays, so adding its relationship connects the workflow and inventory information needed for the redesign." },
      { text: "Refine the assignment step to show the closing-time rule that diverts work to the weekend queue.", correct: true, reason: "The rule changes which queue receives a request, so a refinement adds relevant detail about a suspected delay." },
      { text: "Wait to maintain the workflow page until after the replacement system is approved.", correct: false, reason: "Maintenance and consistency apply to the current workflow as new knowledge emerges, even if no system purchase has been approved." },
      { text: "Use a stable interim version to check the handoffs with dispatchers and document the rationale for any changes.", correct: true, reason: "Reviewing stable intermediate versions verifies the handoffs, and documenting actions preserves what the review found and why the model changed." },
    ],
  },
  {
    format: "select",
    title: "Plover Energy · revising a confusing workshop model",
    context: [
      "Plover Energy supervises municipal charging stations. A workshop model is meant to show why a failed terminal sometimes remains listed as available in the public app. The pilot logs confirm that two monitoring applications both update availability, but the model uses the same label for them and draws unrelated backup-generator checks in the center of the page. The architect has also drawn a link from the terminal to a mobile payment service based solely on the vendor's sales presentation.",
      "During the workshop, a technician interprets the two monitoring applications as one. A field manager correctly explains the public listing issue, then requests more evidence before assigning responsibility. The architect has verified that the generator checks occur on a separate schedule and have no connection to availability updates. The draft can be revised before the workshop reconvenes, when participants will need the model to investigate the actual update path.",
    ],
    task: "Select all edits supported by Grice's Maxims and the recorded evidence.",
    source: "5.1 slides 12–13, 19–21",
    choices: [
      { text: "Keep the payment-service link as an observed fact because the vendor described it publicly.", correct: false, reason: "Quality requires adequate evidence, and a sales claim gives the team no confirmed observation of this link in Plover's operation." },
      { text: "Omit the unrelated generator checks from this workshop view.", correct: true, reason: "Relevance and Quantity support removing verified facts that do not help explain the stale availability listing." },
      { text: "Use one combined monitoring application in the model to make the draft briefer.", correct: false, reason: "Combining two independently verified writers would discard a distinction needed to investigate why an availability update persists." },
      { text: "Use distinct labels and arrange the two applications so readers can follow each update path.", correct: true, reason: "Distinct names and orderly paths address Manner by removing the ambiguity the technician reported." },
    ],
  },
  {
    format: "best",
    title: "Fennel Market · coaching counter staff",
    context: [
      "Fennel Market is changing how staff record cash refunds at store counters. The business process owner has already chosen the design and tested it in a pilot. Counter staff must now understand what to do when a customer presents an undamaged item without the printed receipt. The explanation will show the new business process steps and branches within that process only. Supporting software, data structures, and infrastructure are discussed in a separate systems induction.",
      "The trainer uses a flowchart because counter staff can follow it during a role-play. The training group may ask for larger text and a different layout, but it has no decision to make about which refund rule to adopt. The training director needs the view classified by purpose and breadth so it can be stored under the right tags in the modeling repository.",
    ],
    task: "Which pair of tags fits the training view?",
    source: "5.2 slides 7–12",
    choices: [
      { text: "Designing purpose and Details content.", correct: false, reason: "The single business-layer process aspect fits Details, but the flowchart is used to explain an approved process to staff." },
      { text: "Informing purpose and Coherence content.", correct: false, reason: "Coaching staff fits Informing, but steps and branches within one process aspect do not expand its layer or aspect coverage." },
      { text: "Informing purpose and Details content.", correct: true, reason: "The flowchart supports staff understanding, and its coverage stays within one layer and one aspect." },
      { text: "Deciding purpose and Details content.", correct: false, reason: "Counter staff are learning the selected rule, so the training view has no management decision to support." },
    ],
  },
  {
    format: "best",
    title: "Sable Water · one layer, several aspects",
    context: [
      "Sable Water distributes drinking water to five towns. Its service director is choosing between two ways of authorizing emergency tanker requests. She needs to know which employees perform the authorization, what authorization steps each proposal requires, and which request records the employees work with. The architect explicitly limits this view to the business layer because both proposals will use the same applications and infrastructure during the pilot. The view connects the business performers, behavior, and information for each proposal.",
      "The technical coordinator calls it Details because the delivery is restricted to one layer, while a director calls it Overview because it includes all five towns. The program's modeling template asks for the actual content breadth, regardless of the number of locations, and a separate purpose label. The next meeting will choose the authorization approach used in the pilot.",
    ],
    task: "How should the architecture team classify the view?",
    source: "5.2 slides 7–12",
    choices: [
      { text: "Deciding purpose and Details content, because the pilot keeps technical layers out of scope.", correct: false, reason: "One layer alone cannot establish Details when the view spans performers, behavior, and information aspects." },
      { text: "Deciding purpose and Coherence content, because the choice uses several aspects within one layer.", correct: true, reason: "The director will compare alternatives and choose a pilot rule using a business-layer view that connects multiple aspects." },
      { text: "Deciding purpose and Overview content, because the same authorization models cover all towns.", correct: false, reason: "The number of towns does not supply another architecture layer, which Overview requires alongside multiple aspects." },
      { text: "Designing purpose and Coherence content, because authorization rules concern business process design.", correct: false, reason: "The content fits Coherence, but this meeting selects among finished proposals for the pilot." },
    ],
  },
  {
    format: "best",
    title: "Morrow Publishing · correcting a diagram without changing the model",
    context: [
      "Morrow Publishing is preparing for its catalogue team's move to a new warehouse. The underlying architecture model correctly records that both the wholesale and consumer sales channels depend on the same stock update service. A view prepared for warehouse supervisors includes both dependencies. In the exported diagram, the line from wholesale crosses another line and appears to end on the returns system. The accompanying table displays exactly the same selected content, and supervisors reading that table can identify both dependencies correctly.",
      "A developer proposes editing the underlying service relationships so the diagram becomes easier to lay out. The warehouse leads have signed off on the table and want to keep the selected content. The architect can change positions and paths in the diagram without changing any element or relation. There is time for a single correction before new supervisors receive the packet.",
    ],
    task: "What change should the architect make?",
    source: "5.2 slides 4–6",
    choices: [
      { text: "Change the underlying dependency so wholesale uses the returns system shown in the diagram.", correct: false, reason: "This would change the architecture to match a misleading visual route even though the table and underlying relationship already agree." },
      { text: "Remove the wholesale dependency from the selected view and retain it in the full model.", correct: false, reason: "Removing the relationship changes the approved content and leaves the supervisors without a dependency they need to understand." },
      { text: "Change the viewpoint to a migration-focused lens and derive a fresh selection of content.", correct: false, reason: "A new lens changes how content is selected even though the warehouse leads already approved the relevant selection." },
      { text: "Redraw the misleading line in the visualization, retaining the two dependencies in the view.", correct: true, reason: "The problem lies in how selected content appears, so the team can reroute the line without revising the view or model." },
    ],
  },
  {
    format: "best",
    title: "Branta Media · scheduling a transition",
    context: [
      "Branta Media owns several independent newsrooms that publish through different content systems. It has approved a shared publishing platform, but four outlets must keep their existing systems through local election coverage. Project leads are debating the order of the remaining moves and need to see intermediate states where old and new platforms operate together. The company already has an organization diagram, a capability map comparing the outlets, and a diagram explaining why it chose the new platform.",
      "The rollout director asks for a viewpoint suited to reviewing the baseline, the transition stages, and the common destination across all outlets. The next workshop will focus on what has to coexist at each stage so an outlet can keep publishing. Detailed application design, the rationale for approval, and management reporting lines have their own working groups and established diagrams.",
    ],
    task: "Which named viewpoint example best matches the rollout director's request?",
    source: "5.2 slide 14",
    choices: [
      { text: "Migration, from implementation and migration viewpoints.", correct: true, reason: "The workshop tracks the move from the existing systems through coexistence stages to an agreed destination, which fits Migration." },
      { text: "Goal realization, from motivation viewpoints.", correct: false, reason: "Connecting the platform to the reasons for choosing it would repeat existing rationale and leave the transition sequence unaddressed." },
      { text: "Capability Map, from strategy viewpoints.", correct: false, reason: "A capability map can compare what newsrooms can do, but the director needs the successive states of the publishing architecture." },
      { text: "Organization, from basic design viewpoints.", correct: false, reason: "Reporting lines and organizational responsibilities do not explain when each outlet can move between publishing platforms." },
    ],
  },
  {
    format: "select",
    title: "Thicket Rail · briefing the new depot",
    context: [
      "Thicket Rail is opening a repair depot. Its blueprint already links maintenance activities, staff assignments, customer handoffs, and the applications on which those activities depend. The architect makes an induction view to explain the approved depot operations. It selects several linked layers and aspects but leaves payroll and staff hiring outside its boundary. The architect and trainers choose a diagram and an annotated handout to communicate that selection to supervisors on their first day.",
      "A reviewer asks whether the supervisors' presentations can be updated independently of the architectural content. The training team also questions whether the induction view stops qualifying at its current breadth if it omits payroll. The supervisors are expected to explain the approved arrangements to their teams after the session. They will not be voting on the blueprint or proposing a different design during induction.",
    ],
    task: "Select all conclusions the architect can justify.",
    source: "5.2 slides 4–6, 7–12",
    choices: [
      { text: "The view serves Informing since its purpose is to help new supervisors understand approved operations.", correct: true, reason: "The stated goal is to explain an existing decision and help supervisors communicate it to their teams." },
      { text: "The view qualifies as Overview even though payroll and hiring are left outside the boundary.", correct: true, reason: "The selection includes multiple layers and multiple aspects, and Overview can omit content outside the stakeholder concern." },
      { text: "The diagram and annotated handout can present the same selected architecture in different ways.", correct: true, reason: "The view is the selected content, and the diagram and annotated handout can present it in two forms." },
      { text: "The architect and trainers can both contribute to the viewpoint that guides selection and presentation.", correct: true, reason: "The lesson places both architect and stakeholder inputs at the viewpoint, which guides deriving a view and visualizing it." },
    ],
  },
  {
    format: "select",
    title: "Redfin Workshop Supply · checking the pilot representation",
    context: [
      "Redfin Workshop Supply plans to let retail stores reserve replacements from regional warehouses. The pilot view says stock clerks release special orders. Two stores report that duty managers release them, but the regional warehouse denies ever receiving duty-manager approvals. The operations lead explains that they may be discussing two different order classes. The view was intended to cover the pilot only, and the architect has meeting notes recording agreement to that scope.",
      "The store teams say they would support the pilot if duty managers can keep their current authority. Their view of the operational impact depends on confirming the release rules. A project coordinator wants to file the meeting as final validation and send the diagram to the induction trainer immediately as a confirmed guide. The architect can check both order classes on the warehouse system and review the corrected representation with the teams.",
    ],
    task: "Select all assessments justified by the viewpoint guidelines.",
    source: "5.2 slide 13",
    choices: [
      { text: "The scope agreement validates the release-role representation.", correct: false, reason: "Agreeing on the pilot boundary sets scope, while the teams still disagree about who performs a step inside that boundary." },
      { text: "Checking the order classes and reviewing a corrected view with the teams would address validation.", correct: true, reason: "Validation asks whether stakeholders agree with the representation, which requires resolving the conflicting release-role accounts." },
      { text: "The teams' conditional statement establishes commitment to any pilot impact the view eventually shows.", correct: false, reason: "The teams' willingness is contingent on preserving current authority, so their statement cannot establish agreement to yet-unconfirmed impacts." },
      { text: "Sending the current diagram to training would validate the release rules by disseminating them.", correct: false, reason: "Distribution is Informing, while agreement on the depicted order classes and release roles requires further review." },
    ],
  },
  {
    format: "best",
    title: "Hornbeam Garages · modeling two customer channels",
    context: [
      "Hornbeam Garages lets drivers check whether their vehicles are ready to collect. A driver can check the repair status at a kiosk or ask at the reception counter. Both channels provide the same result from the same repair-status record. Behind the scenes, mechanics post completed work and service advisors resolve any discrepancies. Hornbeam will replace the kiosks over the summer, but the reception counter and the promised status check will be available throughout the change.",
      "The architect must prepare a small ArchiMate model for branch managers choosing signage for the transition. They need to see which customer-facing functionality continues and which point of interaction will change. The scheduled kiosk installation and the internal work of checking the record are shown separately in the rollout plan. The new signage must help drivers find the remaining channel during installation.",
    ],
    task: "How should the customer-facing portion of the model represent the status check?",
    source: "5.3 slides 5, 9",
    choices: [
      { text: "Show one repair-status check service exposed through the kiosk screen and the reception counter interface.", correct: true, reason: "Drivers receive the same functionality in either channel, while each interface provides a distinct place to interact." },
      { text: "Show two repair-status services, each defined by the point where drivers receive it.", correct: false, reason: "The case distinguishes where drivers access the status check, and the functionality they receive is the same in both channels." },
      { text: "Show the status check as an interface and the kiosk screen and counter as two services.", correct: false, reason: "The status check is the functionality offered, while the screen and counter are the points where that functionality is exposed." },
      { text: "Show record access as the sole service and the record as the interface that each driver uses.", correct: false, reason: "The record supports the internal work, while drivers use the screen or counter to obtain the offered status check." },
    ],
  },
  {
    format: "best",
    title: "Falcon Mill · a signal and a shipment file",
    context: [
      "Falcon Mill sells bulk flour to bakeries. When a load has passed its moisture check, the release process starts the packing process for that load. On a separate route, the packing application transfers the lot manifest to the dispatch application so it has the file before a pickup. Dispatch already operates on a fixed schedule, and receiving the file does not start that schedule. The release-to-packing link and the manifest transfer appear side by side on the same architecture view.",
      "A trainee used a solid filled-triangle arrow for both links. At the next review, managers need to tell immediately what starts a process and what transfers information. The architect must keep the established meanings and mark the two links using the notation in the supplied lesson.",
    ],
    task: "Which notation correctly represents both links?",
    source: "5.3 slide 8",
    choices: [
      { text: "Use dashed filled triangles for both the release signal and the manifest file transfer.", correct: false, reason: "The dashed filled head fits the file transfer, while the release signal that starts packing requires the solid Triggers arrow." },
      { text: "Use a solid filled triangle for the release signal and a dashed open head for the file transfer.", correct: false, reason: "The first glyph represents Triggers, but the second is Access to a passive element rather than the movement of the manifest between applications." },
      { text: "Use a solid filled triangle for the release signal and a dashed filled triangle for the file transfer.", correct: true, reason: "The release starts packing, so it uses Triggers, and the manifest moves between applications, so it uses Flow." },
      { text: "Use a solid open head for the release signal and a dashed filled triangle for the file transfer.", correct: false, reason: "The transfer glyph fits Flow, but the solid open head is Serves and does not depict release starting the next process." },
    ],
  },
  {
    format: "best",
    title: "Linnet Office Works · handing off architecture files",
    context: [
      "Linnet Office Works is outsourcing maintenance of its furniture installation systems. The outgoing team models the installation process, the scheduling software that supports it, and supporting infrastructure. Its working files were created using Archi. The supplier uses different drawing software, but its architects can interpret the ArchiMate symbols and model the same relationships at the levels used in Linnet's files. The business owner wants the handoff to preserve what the architecture says, including the links between layers.",
      "The draft acceptance checklist verifies that converted diagrams look similar to the original exports. During a sample conversion, a software-to-service realization became a generic association even though the picture still looked familiar. Linnet can ask for a second export and a shared legend before acceptance. It has no contract requirement to mandate either party's choice of tool.",
    ],
    task: "Which acceptance condition best preserves Linnet's architecture description?",
    source: "5.3 slides 4, 6, 8, 10",
    choices: [
      { text: "Require the supplier to use Archi and accept any relationships the tool draws successfully.", correct: false, reason: "Archi is the tool, so its use alone cannot establish that the required ArchiMate relationships survived conversion." },
      { text: "Accept a similar diagram if all original element labels and colors survived conversion.", correct: false, reason: "Matching labels and colors leaves the changed realization relation unresolved, and the business owner needs its meaning preserved." },
      { text: "Require every file to use one level of abstraction so the two drawing tools have fewer differences to reconcile.", correct: false, reason: "ArchiMate supports multiple abstraction layers, and flattening the files would hide cross-layer links needed by Linnet." },
      { text: "Check that the exported model preserves the ArchiMate element types and relationships at the required levels of abstraction.", correct: true, reason: "The modeling language carries the meaning across tools, so checking types and relations would catch the altered realization." },
    ],
  },
  {
    format: "best",
    title: "Baywell Learning · tracing a cloud maintenance window",
    context: [
      "Baywell Learning runs evening courses for employers and is planning infrastructure maintenance during a quiet week. Its enterprise architect uses the lecture's academic lifecycle figure as a reference and has verified that Baywell uses the same chain for online delivery. The Cloud Management Portal realizes Cloud-Based Services, which serves the LMS. The LMS is one of two components realizing E-Learning Service, which serves Deliver & Assess. The registration team uses a separate service realized by the SIS.",
      "The infrastructure lead wants a first notification based on the links that are actually in the model. Support staff have suggested telling all customers that student records are stored by the cloud portal. The architect has no inventory evidence for that assertion and has not checked whether the other e-learning component could carry traffic during the window.",
    ],
    task: "What should the architect put in the first maintenance notification?",
    source: "5.3 slides 6–7, 10",
    choices: [
      { text: "Notify the registration team first because enrolment depends on the same cloud-to-LMS chain.", correct: false, reason: "The stated chain reaches Deliver & Assess through E-Learning Service, while registration is shown on a separate SIS chain." },
      { text: "Notify the Deliver & Assess owner about the LMS dependency and verify what the second e-learning component can handle.", correct: true, reason: "The model traces the LMS dependency to Deliver & Assess, and two realizing components give no automatic guarantee about failover." },
      { text: "Notify all customers that their student records become inaccessible during cloud maintenance.", correct: false, reason: "The cloud chain shows a service dependency and gives no evidence about universal student-record storage or accessibility." },
      { text: "Notify only the infrastructure team because cloud maintenance ends at the boundary of the technology layer.", correct: false, reason: "The chain passes through technology, application, and business, so the LMS dependency gives the course owner a reason to investigate." },
    ],
  },
  {
    format: "select",
    title: "Starling Tool Hire · designing a model before a branch move",
    context: [
      "Starling Tool Hire is moving its busiest branch two blocks away. The branch supervisor needs to understand who can release equipment when the usual desk is closed. The facilities manager needs to see which application functions rely on equipment installed in the old premises. The blueprint for the new building exists, but staff coverage still depends on the order of work. One analyst has imported every device icon into a drawing file before talking to the two managers.",
      "The architect has one workshop to decide which questions the model will answer and prepare a first draft. A manager suggests treating the equipment inventory as the final model because it is already available. The workshop can agree separate boundaries for the desk-coverage and premises-dependency concerns, then trace their connections where those concerns intersect.",
    ],
    task: "Select all actions that follow the lesson's modeling sequence.",
    source: "5.3 slide 11",
    choices: [
      { text: "Confirm the supervisor's and facilities manager's concerns before settling what the model should show.", correct: true, reason: "Stakeholders and concerns come first, and equipment release and premises dependencies give the team two concrete questions." },
      { text: "Choose the language elements and rules from the inventory, then use them to set the scope and choose a viewpoint.", correct: false, reason: "The lesson sets purpose, scope, and viewpoint before choosing relevant elements, relations, and rules." },
      { text: "Define the purpose, scope, and viewpoint appropriate to each concern before selecting language concepts.", correct: true, reason: "This follows the second step and keeps the desk-coverage and premises-dependency decisions in scope for the relevant model content." },
      { text: "From the viewpoints, choose relevant layer, internal or external abstraction, and structure or behavior concepts before constructing the draft.", correct: true, reason: "The lesson uses layer, internal or external abstraction, and active, behavior, and passive perspectives to select relevant modeling concepts." },
    ],
  },
  {
    format: "select",
    title: "Hazel Credentialing · following a certification record",
    context: [
      "Hazel Credentialing certifies independent mechanics. It is adopting a modeling pattern similar to the academic lifecycle example from the lecture. In Hazel's model, an enrollment officer handles Sign Up, while an assessor performs Assess Skills. The lifecycle is Sign Up, Book Workshop, Assess Skills, and Issue Certificate in that order. Book Workshop, Assess Skills, and Issue Certificate show connections to the Candidate Record. The team has yet to document which of these actions reads or writes the record.",
      "Hazel will hand the model to developers designing a new certificate portal. The developers ask whether the drawing already proves what the early sign-up step does with the Candidate Record. They also need to distinguish the assessor, the assessment work, and the information it uses before they decide what extra modeling is needed.",
    ],
    task: "Select all conclusions supported by Hazel's model and the lecture pattern.",
    source: "5.3 slides 8–10",
    choices: [
      { text: "In Assess Skills, the assessor performs the behavior and the Candidate Record is passive structure.", correct: true, reason: "The assessor carries out the assessment work, while the record is information used by that behavior." },
      { text: "The lifecycle order is enough to infer a missing Sign Up access link to the Candidate Record.", correct: false, reason: "Triggering progression and object access represent different relations, so lifecycle order does not establish access by the first process." },
      { text: "A connection from an assessment process to the record by itself establishes that the process writes the record.", correct: false, reason: "The stated connections identify which processes access the record and provide no evidence about which operation each process performs." },
      { text: "The lifecycle progression and the three record accesses should remain visible as different kinds of connection.", correct: true, reason: "The academic lifecycle distinguishes triggering links between processes from accesses connecting processes to shared information." },
    ],
  },
];
