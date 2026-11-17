import type { McItem, MultiItem } from "../../lib/types";

type Explained = { w: string; r: string };

type Case = {
  name: string;
  context: [string, string];
  decision: string;
  source: string;
};

type Statement = {
  text: string;
  correct: boolean;
  reason: string;
};

const roman = ["I", "II", "III"];
const escape = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function stem({ name, context, decision }: Case) {
  return `<p><strong>${escape(name)}</strong></p>${context.map(p => `<p>${escape(p)}</p>`).join("")}<p><strong>${escape(decision)}</strong></p>`;
}

function combinationLabel(indices: readonly number[]) {
  if (indices.length === 0) return "None of the statements are correct.";
  if (indices.length === 3) return "All three statements are correct.";
  if (indices.length === 1) return `Only statement ${roman[indices[0]]} is correct.`;
  return `Only statements ${roman[indices[0]]} and ${roman[indices[1]]} are correct.`;
}

function combination(
  specification: Case,
  statements: [Statement, Statement, Statement],
  distractors: [number[], number[], number[]],
): McItem & Explained {
  const correct = statements.flatMap((statement, index) => statement.correct ? [index] : []);
  const a = combinationLabel(correct);
  return {
    q: `${stem(specification)}<ol type="I">${statements.map(s => `<li>${escape(s.text)}</li>`).join("")}</ol>`,
    o: [a, ...distractors.map(combinationLabel)],
    a,
    w: statements.map((s, index) => `${roman[index]}. ${s.correct ? "Correct." : "Incorrect."} ${s.reason}`).join("\n"),
    r: specification.source,
  };
}

function checkbox(specification: Case, statements: Statement[]): MultiItem & Explained {
  return {
    q: stem(specification),
    o: statements.map(s => s.text),
    a: statements.filter(s => s.correct).map(s => s.text),
    w: statements.map(s => `“${s.text}” ${s.correct ? "Correct." : "Incorrect."} ${s.reason}`).join("\n"),
    r: specification.source,
  };
}

export const module6CombinationCases: (McItem & Explained)[] = [
  combination({
    name: "Tern Parcel · a delayed delivery pilot",
    context: [
      "Tern Parcel runs overnight delivery for small merchants. A competitor now reprioritizes its routes when depot backlogs rise, and two large customers have asked Tern to match its faster exception handling before renewing. Tern’s own dispatch logs show that staff spend a quarter of each shift copying status updates from a scanner dashboard into the driver system. The operations team wants to try a forecasting service at one depot.",
      "The vendor predicts a sizable labor saving, but the scanner and driver systems use different parcel identifiers. Drivers also need a way to appeal a suggested stop change while their phones are offline. The board gives the architecture team six weeks to recommend where to pilot and what to measure before committing to a larger rollout.",
    ],
    decision: "Which findings belong in the architecture team’s recommendation?",
    source: "6.1 slides 4–5",
  }, [
    { text: "Customer renewal pressure and a competitor’s faster service both give Tern a reason to monitor the technology.", correct: true, reason: "The renewal condition is external pressure, and the competitor’s faster exception handling makes competitive advantage relevant." },
    { text: "The pilot should measure time spent on manual status entry and test how the two systems will exchange parcel records.", correct: true, reason: "Manual copying gives Tern an efficiency measure. Conflicting identifiers are an integration problem a vendor forecast cannot resolve." },
    { text: "Tern can plan its rollout without reviewing dispatch work because the forecasting service runs separately from the scanners.", correct: false, reason: "The service still uses operational data, and its recommendations change dispatch work for drivers, including the offline appeal path." },
  ], [[0], [1, 2], [0, 1, 2]]),

  combination({
    name: "Copperleaf Controls · two unusual hardware proposals",
    context: [
      "Copperleaf Controls makes compact sensors for factories. The next version has to recognize a small set of machine vibration patterns at the edge and operate for a full shift on a fixed battery budget. One supplier proposes a silicon accelerator organized around artificial neurons and synapse-like connections, with memory and computation located close together. Another supplier proposes a remote processor that represents information as qubits and performs operations based on quantum mechanics.",
      "An investor heard that both proposals belong to emerging computing and suggests treating them as interchangeable providers on the architecture roadmap. The two suppliers have yet to show comparable results on Copperleaf’s battery, latency, or accuracy tests. The product architect must classify both proposals and decide how to evaluate them.",
    ],
    decision: "Which statements should the architect include when presenting the two proposals?",
    source: "6.1 slides 5–10",
  }, [
    { text: "The silicon proposal is neuromorphic, and the remote qubit processor is quantum.", correct: true, reason: "Neuron- and synapse-inspired architecture identifies the silicon design. Qubits and quantum-mechanical operations identify the second design." },
    { text: "Because both proposals use an unconventional architecture, tests of one provider are transferable to the other.", correct: false, reason: "The designs use different computing principles and have different workloads and constraints, so the product tests must evaluate each proposal on its own merits." },
    { text: "A silicon implementation no longer counts as neuromorphic once it runs on a battery.", correct: false, reason: "Neuromorphic describes the architecture, and silicon is one of the lecture’s branches. Battery power does not determine the classification." },
  ], [[1], [0, 1], []]),

  combination({
    name: "Alder Simulations · the quantum readiness briefing",
    context: [
      "Alder Simulations is deciding whether its five-year research plan should depend on a quantum service. One provider reports many physical qubits and a limited logical demonstration, while another reports good logical memory on a smaller experiment. Neither has demonstrated that Alder’s full job, which needs both reliable operations and storage of an intermediate quantum state, can run at the required scale. The finance director has proposed comparing only the total number of physical qubits.",
      "The research team can fund a small feasibility study this year. Committing the full project would require the architect to say which evidence the vendors must produce first and which dimensions might improve independently. Alder wants to avoid choosing by whichever press release has the largest headline number.",
    ],
    decision: "Which readiness criteria should Alder require?",
    source: "6.1 slides 9–10",
  }, [
    { text: "Ask how many usable logical qubits can be sustained for the intended workload.", correct: true, reason: "Alder needs scalable, reliable logical capacity. A physical-qubit count alone does not establish the protected resources its job can use." },
    { text: "Ask for separate evidence about processing fidelity and logical-memory fidelity.", correct: true, reason: "The job relies on both operations and storing intermediate state. The lecture lists magic-state capability and logical memory under fidelity." },
    { text: "Treat a strong result on one fidelity measure as partial evidence and ask whether the complete job can run.", correct: true, reason: "One narrow experiment cannot establish full fault-tolerant operation across the size and duration Alder needs." },
  ], [[0, 1], [0, 2], []]),

  combination({
    name: "Sandpiper Service Desk · a narrow chatbot",
    context: [
      "Sandpiper Software tests a support chatbot that answers questions about one product. The chatbot reads the last six messages in the current session to distinguish a billing question from a setup question. It can write reassuring phrases, but the pilot provides no evidence that it knows how the customer feels. When users ask it to handle unrelated tasks, the system routes them to a person, and it never observes or reports any internal subjective state.",
      "A department head wants the procurement memo to call the pilot a self-aware general intelligence because it remembers the conversation and responds politely. Your assignment is to correct the memo using the lecture’s separate classifications for AI capability and functionality, using evidence from the pilot.",
    ],
    decision: "Which of the proposed statements can Sandpiper substantiate?",
    source: "6.1 slide 14",
  }, [
    { text: "Professional-sounding responses establish Artificial General Intelligence.", correct: false, reason: "Evidence of competence is confined to one product, which supports a narrow task capability. Polite phrasing does not demonstrate transferable problem-solving." },
    { text: "Reading prior messages in the session matches the definition of a purely reactive system without memory.", correct: false, reason: "The chatbot uses recent context to choose an answer. That fits the limited-memory distinction in the lecture." },
    { text: "A reassuring phrase is sufficient evidence of self-awareness or an understanding of the customer’s emotions.", correct: false, reason: "The pilot records generated language. It supplies no evidence of self-awareness or the Theory of Mind functionality." },
  ], [[0], [0, 1], [0, 1, 2]]),

  combination({
    name: "Breakwater Energy · an archive with a long lifetime",
    context: [
      "Breakwater Energy expects the design files for a new facility to remain confidential for twenty years. The technical team currently encrypts traffic to and from its archival service and plans to keep the service’s encryption choices for another five years. A security exercise assumes that an adversary may save encrypted traffic today, keep a copy, and attempt to decrypt it if large, sufficiently reliable quantum computers become available.",
      "The executive sponsor asks whether the company can simply revisit the issue once the first practical attack becomes public. Breakwater has a limited migration budget and several vendor products, some of which require long lead times to update. You have been asked to identify where the enterprise architecture should focus first.",
    ],
    decision: "Which recommendations follow from the archive’s confidentiality requirement?",
    source: "6.1 slides 9 and 16",
  }, [
    { text: "Treat the future exposure of long-lived records as a concern in present planning.", correct: true, reason: "The data must remain secret for decades. Capture today followed by later decryption is the harvest-now, decrypt-later risk." },
    { text: "Wait for a confirmed attack before identifying which vendor products rely on vulnerable cryptography.", correct: false, reason: "The vendor lead times make a late inventory costly. A phased review should start with data lifetimes and cryptographic dependencies." },
    { text: "Plan to adopt applicable post-quantum standards in stages, starting with the most exposed, long-lived uses.", correct: true, reason: "That sequence addresses the archive’s confidentiality horizon and gives the architecture team room to plan integration and migration." },
  ], [[0], [0, 1], [0, 1, 2]]),

  combination({
    name: "North Shoal Tools · models for warehouses and headquarters",
    context: [
      "North Shoal Tools wants warehouse staff to look up a short list of inventory procedures while the internet link is unavailable. Headquarters also wants a separate assistant to summarize lengthy contracts and work with scanned images. An on-device candidate fits the scanners’ memory budget and handles the warehouse’s text-only lookup in a pilot. A larger hosted candidate passes the contract and image evaluation, but its operating cost and ability to send documents off the premises need separate approval.",
      "The procurement lead proposes a single size-based rule. She says the larger model’s parameter count proves it is the better choice for both workflows. You must assess the candidates against the stated needs and explain what parameter count and multimodal capability actually tell the procurement team.",
    ],
    decision: "Which conclusions are supported by North Shoal’s evaluation?",
    source: "6.2 slides 4–5",
  }, [
    { text: "The warehouse pilot supports an edge deployment for that workflow because its lookup task is narrow and connectivity is unreliable.", correct: true, reason: "The small model passed the warehouse evaluation within local memory limits, so it meets the relevant offline requirement." },
    { text: "The candidate that can work with contract text and scanned images demonstrates multimodal input capability in the pilot.", correct: true, reason: "The inputs span two distinct modalities, text and images. The two capabilities were tested separately from model size." },
    { text: "Parameter count settles the procurement decision even before workload, cost, and data-location checks.", correct: false, reason: "Parameter count describes learned variables. It cannot by itself show compliance with the offline, document-handling, or budget constraints." },
  ], [[0], [1, 2], [0, 1, 2]]),

  combination({
    name: "Harborline Mobility · the help desk refuses more often",
    context: [
      "Harborline Mobility is considering an assistant for handling vehicle warranty questions. On the same 100 cases, the first version gave 72 correct answers, invented confident but wrong answers in 14 cases, and abstained in 14. A conservative version gave 70 correct answers, invented wrong answers in 6 cases, and abstained in 24. Every abstention goes to a human examiner who can check the warranty documents, but examiners already face a busy queue.",
      "The product lead says the conservative version’s reported hallucination rate makes it the clear winner under every service metric. Management plans to use the lecture’s formula for hallucination rate and asks the EA team to assess the tradeoff before piloting either version on a second vehicle product line.",
    ],
    decision: "Which statements correctly describe the results and the service decision?",
    source: "6.2 slide 7",
  }, [
    { text: "Under the lecture’s formula, the first version has a 50% hallucination rate and the conservative version has a 20% rate.", correct: true, reason: "The first version has 14 wrong answers out of 28 wrong or abstained. The conservative version has 6 wrong out of 30 wrong or abstained." },
    { text: "The conservative version is more accurate on all 100 evaluated cases.", correct: false, reason: "With the same total, accuracy falls from 72 correct answers to 70. Fewer invented responses and higher accuracy are different measures." },
    { text: "The drop in confident errors comes with additional referrals, so queue capacity matters.", correct: true, reason: "Abstentions rise from 14 to 24 and each one needs a human examiner. The lower rate alone cannot settle service quality." },
  ], [[0], [0, 1], [0, 1, 2]]),

  combination({
    name: "Juniper Instruments · self-hosting or vendor hosting",
    context: [
      "Juniper Instruments wants researchers to test an AI assistant on internal troubleshooting manuals. Some manuals describe customer equipment in confidence. The hosted supplier charges per request and offers a managed interface that the service-desk staff already know. The alternative makes weights available under a license Juniper still needs to review and could be run on the company’s own infrastructure. Its researchers want to experiment with configuration and deployment.",
      "Finance asks whether either option is demonstrably cheaper during the trial. IT warns that the self-managed option would also need hardware, access policies, maintenance, and a usable employee interface. The architect is preparing a pilot recommendation with data handling and staffing constraints as prominent as the procurement price.",
    ],
    decision: "Which points should guide the project’s comparison?",
    source: "6.2 slides 8, 12 and 14",
  }, [
    { text: "Running a suitable model in Juniper’s environment may give the team more direct control over where the manuals are processed.", correct: true, reason: "The self-managed deployment makes deployment location a design choice. The benefit depends on actual data flows and controls." },
    { text: "The self-managed option transfers operating work to Juniper, so the pilot should estimate staffing, usability, and infrastructure costs.", correct: true, reason: "Researchers’ ability to experiment and the help desk’s ability to use the system are different concerns. Operating and integration costs matter alongside any license or request fees." },
    { text: "Juniper should inspect the license before assuming it can modify, deploy, or redistribute the model as desired.", correct: true, reason: "Availability of weights does not establish broad rights. License review is directly relevant to Juniper’s intended deployment and experiments." },
  ], [[0], [0, 1], [1, 2]]),

  combination({
    name: "Meadowbound Exchange · a claim of safe AGI",
    context: [
      "Meadowbound Exchange tested a new assistant that rewrites customer correspondence and sorts internal tickets. It performs well on both, but independent teams have yet to test whether it can learn and solve unfamiliar problems in unrelated domains. The assistant also lacks an evaluation of long-term effects and fails to explain when a person's intervention is needed. Its supplier calls it safe AGI and suggests using the label in the company’s digital roadmap.",
      "The architecture board is responsible for a limited trial and wants to separate what the pilot demonstrates from what the supplier predicts. The board also asks whether the claim that a future system benefits humanity follows from the successful completion of two workplace tasks.",
    ],
    decision: "Which proposed statements belong in the board’s assessment?",
    source: "6.2 slides 15–17",
  }, [
    { text: "Success on two evaluated workflows definitively establishes AGI.", correct: false, reason: "The evaluation offers no evidence of broad competence on unfamiliar problems across domains, which is central to the cited description of AGI." },
    { text: "“Safe” AGI expresses an aim of benefiting humanity, and the two workflow scores do not establish that outcome.", correct: true, reason: "The lecture frames safety as a goal. Narrow performance results supply neither safety evidence nor an agreed test of AGI." },
    { text: "Any architecture update should wait until there is a universal, final AGI benchmark.", correct: false, reason: "The board already has a useful limited pilot and immediate workflow and oversight decisions. The lecture asks how AGI could be measured without prescribing a universal readiness threshold." },
  ], [[0], [1, 2], []]),

  combination({
    name: "Wrenfield Manufacturing · challenges for the architecture roadmap",
    context: [
      "Wrenfield Manufacturing wants to introduce AI inspection in two factories. An edge pilot may avoid sending product images to a hosted service, but the factories use different cameras and lack a shared data-retention practice. A software team also proposes a hosted assistant to draft maintenance instructions, which will still need technician review before publication. The workforce team expects these changes to shift some duties from manual review to model evaluation and escalation.",
      "The steering committee can sponsor one quarter of preparation. It asks the enterprise architect to update the roadmap with infrastructure reviews and changes to operating roles. The plan must account for shifts in vendor pricing and the evolving threat to long-lived encrypted records.",
    ],
    decision: "Which findings should be accepted in the roadmap review?",
    source: "6.2 slides 6, 8–9, 14 and 17",
  }, [
    { text: "The technology layer can be left outside the review because the pilots rely on AI software.", correct: false, reason: "Cameras, edge and cloud infrastructure, data flows, and legacy dependencies are technology-layer concerns the pilots already expose." },
    { text: "An image pilot that preserves data on site eliminates the need to plan who handles escalations and model failures.", correct: false, reason: "Local processing can address a data-location issue, but people still need to review exceptions and errors." },
    { text: "The roadmap can assume vendor market conditions and cryptographic risks will be fixed for its entire duration.", correct: false, reason: "The case identifies cloud dependencies and long-lived records. The lecture asks planners to account for uncertainty in the AI market and the looming quantum threat." },
  ], [[0], [0, 2], [0, 1, 2]]),
];

export const module6CheckboxCases: (MultiItem & Explained)[] = [
  checkbox({
    name: "Silverpath Retail · a forecasting and catalog rollout",
    context: [
      "Silverpath Retail’s online team wants to forecast returns by product category before a warehouse expansion. It has historical orders, shipment delays, refunds, and a definition of whether each order was returned. The brand team requests new descriptions for product listings that preserve details such as warranty terms from the approved catalog. Both teams want a pilot before the expansion budget is reviewed.",
      "The proposal on your desk combines the two requests under a single label and asks that they use the same evaluation measures. You have to recommend which technique fits each task and how the team should check that the outputs are useful in the existing decision process.",
    ],
    decision: "Select all technically appropriate recommendations.",
    source: "6.1 slides 12 and 15",
  }, [
    { text: "Use predictive AI to estimate likely returns from historical order patterns.", correct: true, reason: "The first request concerns a future outcome that can be evaluated against actual returns." },
    { text: "Use generative AI to draft new descriptions and have staff verify catalog facts.", correct: true, reason: "Writing new copy is a generation task. Verification supports the brand team’s constraint about accurate product details." },
    { text: "Use the same forecast error metric as the sole evaluation of both tasks.", correct: false, reason: "Forecast error can compare predicted and actual returns. It does not establish that draft descriptions faithfully describe warranty or product information." },
    { text: "Classify both jobs as predictive solely because both consume historical business data.", correct: false, reason: "The classification concerns what each system does with the data. Silverpath needs a forecast in one workflow and new text in the other." },
  ]),

  checkbox({
    name: "Bluefen Process Controls · why a classifier improved",
    context: [
      "Bluefen Process Controls tested a neural network to distinguish normal and unusual vibration recordings. During training, historical recordings with known labels are supplied to a model that receives numeric features, passes signals through intermediate layers, and produces class scores. On an early run it misclassified recordings from a less common machine type. After training on a more representative set, the fresh evaluation improved.",
      "Operations will use the trained model in monitoring, with a technician reviewing flagged recordings. Its manager asks whether the new result came from changing the input sensor, from model training, or from storing the correct label in the live interface. You are presenting which parts of the model can explain the improvement.",
    ],
    decision: "Select all statements that accurately describe the neural network and its use.",
    source: "6.1 slides 12–13; 6.2 slide 4",
  }, [
    { text: "During training, the network can adjust connection weights based on the difference between its predictions and the desired outputs.", correct: true, reason: "The supplied labeled training data provide a target against which an error can be calculated. Weights are learned parameters." },
    { text: "Intermediate layers transform incoming signals before class scores are produced at the output.", correct: true, reason: "That is the forward flow from input through hidden layers to output shown in the lecture." },
    { text: "Every new recording necessarily changes the model’s parameters during operational use.", correct: false, reason: "Inference runs the learned model on new data. Parameter updates require a training process, which the live interface was not specified to run." },
    { text: "The improved result alone proves that Bluefen changed its vibration sensor.", correct: false, reason: "The case describes a change in representative training examples and gives no evidence of a sensor change." },
  ]),

  checkbox({
    name: "Hearthridge Engineering · a budget for research platforms",
    context: [
      "Hearthridge Engineering is comparing three proposed research platforms for a constrained innovation budget. Proposal A groups many artificial neuron-and-synapse units on silicon. Proposal B uses living neural tissue as part of an experimental computing setup and its supplier promises access only through a research program. Proposal C organizes computation around qubits and advertises an error-correction roadmap.",
      "The company makes ordinary industrial controllers and must keep its production line certified. The board wants the architecture team to identify where each technology belongs in the roadmap, why the research platforms should be piloted separately from product commitments, and which differences matter. A manager has suggested calling all three quantum because none is a conventional workstation design.",
    ],
    decision: "Select all conclusions supported by the descriptions and lecture.",
    source: "6.1 slides 6–10",
  }, [
    { text: "A is silicon neuromorphic and B is the wetware branch discussed in the lecture.", correct: true, reason: "Both use neural inspiration. A implements it in silicon while B is the research example using living material." },
    { text: "C is quantum, and relevant evidence includes logical scale and fidelity.", correct: true, reason: "Qubits and error correction identify the quantum proposal. Useful logical capacity and reliability are separate challenges." },
    { text: "Hearthridge should base a certified production commitment on B’s research availability alone.", correct: false, reason: "Access through a research program provides no evidence that the system can meet production reliability, availability, or integration requirements." },
    { text: "Artificial neurons in A identify it as a quantum processor.", correct: false, reason: "Artificial neurons and synapses describe the silicon’s neuromorphic organization. The case assigns qubits to C." },
  ]),

  checkbox({
    name: "Hillcross Glass · classifying inspection automation",
    context: [
      "Hillcross Glass is upgrading a quality-control station. Unit P scores each picture independently and resets its working state after every frame. It rejects only three specific visual defects and sends all unexpected images to an inspector. Unit Q has the same narrow quality-control goal but uses images from the previous few seconds to stabilize judgments when the conveyor briefly vibrates.",
      "The production director argues that Q has crossed from narrow AI to general intelligence because it uses history. An employee also says the system understands how an inspector feels because its interface can display a sympathetic message after a rejection. Your scope is to describe each unit’s observed functionality and capability accurately for a procurement memo.",
    ],
    decision: "Select all statements the architecture memo should retain.",
    source: "6.1 slide 14",
  }, [
    { text: "P fits the reactive-machine description because its decisions use the current picture and no prior frames.", correct: true, reason: "The defining evidence is that P resets after each frame and behaves independently on the present input." },
    { text: "Q fits limited-memory functionality for this task because it uses recent pictures in its decision.", correct: true, reason: "For Q, recent observations are relevant to the current classification, which distinguishes it from P." },
    { text: "Q’s recent observations establish general intelligence across unfamiliar domains.", correct: false, reason: "The use of history changes functionality. The inspection task still supplies narrow evidence about capability." },
    { text: "A scripted sympathetic message establishes Theory of Mind AI.", correct: false, reason: "A displayed phrase alone provides no evidence of understanding human emotions or social cues." },
  ]),

  checkbox({
    name: "Quiet Cove Financial · deciding when to prepare for quantum risk",
    context: [
      "Quiet Cove Financial holds contract negotiations that must stay confidential for many years. Recently it acquired a subsidiary whose secure file exchange depends on a separate vendor. The inventory of cryptographic dependencies is incomplete, customers connect to both systems, and the vendor’s migration projects usually take several releases. The team is not aware of a present-day compromise of its encryption.",
      "The finance director wants the same migration date for every workload. The security architect proposes starting with the most sensitive long-lived records and planning around upgrade dependencies. You must brief the risk committee on how the threat can matter before an attacker has access to a sufficiently capable quantum computer, and why priorities can differ across systems.",
    ],
    decision: "Select all findings that should drive the committee’s funding decision.",
    source: "6.1 slides 9 and 16",
  }, [
    { text: "Long-lived confidential data deserves earlier consideration because encrypted material could be saved today for later decryption.", correct: true, reason: "The useful life of the information creates harvest-now, decrypt-later exposure even during the preparation period." },
    { text: "Quiet Cove should inventory cryptographic dependencies and vendor update lead times before sequencing its migration.", correct: true, reason: "Two systems and a separate vendor introduce integration and migration dependencies. Inventory makes the phased plan workable." },
    { text: "A reported physical-qubit count on its own establishes when all deployed cryptography will fail.", correct: false, reason: "Logical scale, fidelity, the algorithm, and the target cryptographic scheme all matter. The lecture does not establish a single date for every system." },
    { text: "Present uncertainty about the date rules out budgeting now for long-lived data.", correct: false, reason: "The exposure depends on data lifetime and migration lead time. Uncertainty strengthens the reason to plan and track dependencies now." },
  ]),

  checkbox({
    name: "Eastmere Foods · failure modes in a multilingual assistant",
    context: [
      "Eastmere Foods is testing a policy assistant for customer contacts in several countries. The company has reliable written policies for a subset of markets, with new documents for another region still awaiting approval. During testing, one configuration answers missing policy questions with a confidently invented eligibility rule. Another configuration asks for verification in those cases and sends them to an employee.",
      "The team expects a mix of supported and unsupported requests in production. It seeks to cut invented claims without creating an unmanageable escalation queue. It has a two-week pilot window and can log outcomes for a fixed review set, but has to agree what to count before the first test.",
    ],
    decision: "Select all measures and actions that are appropriate for this pilot.",
    source: "6.2 slides 7–8",
  }, [
    { text: "Record correct answers, incorrect answers, and abstentions separately on the same review set.", correct: true, reason: "Separate outcomes reveal whether a change reduces fabricated answers by refusing more often or improves how often valid questions receive correct answers." },
    { text: "Treat the confidently invented eligibility rule as a hallucination in the lecture’s terminology.", correct: true, reason: "The first configuration presents an unsupported wrong rule as fact." },
    { text: "Treat verification requests as equivalent to fabricated policy rules when reporting hallucinations.", correct: false, reason: "An abstention or escalation expresses insufficient support. A hallucination invents an answer. The outcomes are different in the lecture’s formula." },
    { text: "Use the escalation logs to check the impact on employee workload as well as model reliability.", correct: true, reason: "More abstentions may lower fabricated claims while shifting work to people. Eastmere needs to assess both effects." },
  ]),

  checkbox({
    name: "Norvale Transit · an assistant for photos and field reports",
    context: [
      "Norvale Transit wants an assistant to triage maintenance requests containing photographs and text. Some workers can connect only during shift changes, and security policy puts the storage location of identifiable images under review. One candidate processes plain text locally. Another hosted candidate correctly combines the photographed equipment tag with a written fault report and suggests a maintenance category. A sales representative also calls the second candidate a mixture of experts.",
      "The architecture lead must recommend what evidence still belongs in the pilot decision. The first trial shows that image and text inputs matter to the real task, but it has yet to establish acceptable connectivity, access controls, or deployment expense at every depot.",
    ],
    decision: "Select all sound recommendations about multimodality and deployment.",
    source: "6.2 slides 4–5 and 8",
  }, [
    { text: "Evaluate the hosted model’s text-plus-image behavior directly because the pilot has confirmed that both input forms matter.", correct: true, reason: "Multimodality describes operating across input or output modalities. The candidate demonstrated two relevant input forms." },
    { text: "Assume mixture of experts proves the model supports image input.", correct: false, reason: "MoE describes an architectural design using specialized components. Modalities must be established by the candidate’s demonstrated capabilities." },
    { text: "Compare local and hosted options against depot connectivity, data handling, task quality, and operating costs.", correct: true, reason: "Norvale’s requirements extend beyond parameter count. The differing options must be evaluated against the real operating context." },
    { text: "Treat a larger hosted model as a guaranteed fit even when a depot cannot maintain its connection.", correct: false, reason: "The hosted system depends on the network. A size label does not address the field connectivity requirement." },
  ]),

  checkbox({
    name: "Pinewater Claims · governance and the workforce",
    context: [
      "Pinewater Claims wants an AI assistant to help agents prepare routine correspondence. The supplied case materials often contain identification and financial details. Some executives want to reduce agent headcount immediately, while the service team anticipates more time spent checking draft facts and handling difficult cases. Marketing asks whether computer-generated voices could be used for public announcements. A contractor proposes that the assistant send correspondence automatically after a confidence score passes a threshold.",
      "Pinewater has yet to set acceptable disclosures for synthetic media or decide who reviews high-impact communications. You have been asked to identify the issues the architecture and governance teams must address before proposing a limited deployment.",
    ],
    decision: "Select all issues the pilot should explicitly address.",
    source: "6.2 slides 8, 14 and 17",
  }, [
    { text: "Inventory which case records are sent to the assistant and how access, storage, and confidentiality are handled.", correct: true, reason: "Sensitive information appears in the input. Privacy and confidentiality are named ethical concerns and need operational controls." },
    { text: "Estimate how drafting, verification, and escalation duties will change before assuming the workforce effect.", correct: true, reason: "The draft may save time, but verification and escalations can shift duties. The lecture calls out job security and future workforce profiles." },
    { text: "Review authenticity, disclosure, and misuse concerns before adopting public synthetic voices.", correct: true, reason: "Generated voices raise the lecture’s deepfake and reality-versus-digital concerns. Identifying synthetic media helps people understand what they are hearing." },
    { text: "Approve automatic communications as ethically safe whenever the system reports high confidence.", correct: false, reason: "Confidence alone cannot establish accuracy or consent. The case needs defined authority, review, and escalation for consequential communications." },
  ]),

  checkbox({
    name: "Crestbank Labs · selecting an AI research pilot",
    context: [
      "Crestbank Labs hopes to reduce the time spent repeating materials-screening experiments. One vendor offers a model that estimates which candidates are worth testing based on prior result records. Another proposes a robot to run a narrow sequence of repetitive measurements when staff are out of the lab. Neither vendor has shown the equipment in Crestbank’s building, and researchers still need to review predictions and validate experimental findings.",
      "The lab director has a fixed pilot budget and cannot replace the existing record system this year. The architecture team must decide how to connect the proposals to the current workflow and what would count as evidence of progress. The director wants the committee to avoid drawing sweeping conclusions from a successful demonstration on one workflow.",
    ],
    decision: "Select all conclusions that belong in the research pilot proposal.",
    source: "6.2 slides 6, 10–11 and 17",
  }, [
    { text: "The model’s candidate rankings are predictions to validate through experiments.", correct: true, reason: "Selecting candidates based on prior results is a predictive scientific application. Experimental confirmation remains part of Crestbank’s process." },
    { text: "The robot changes the physical workflow and needs checks against the lab’s instruments and record system.", correct: true, reason: "Robotics is physical automation. Running measurements still requires integration with Crestbank’s scheduled work, equipment, and records." },
    { text: "A successful narrow demonstration establishes that the vendor has achieved general intelligence.", correct: false, reason: "The demonstration covers repeated measurements or rankings in a specific scientific task. It does not show learning and problem-solving across unfamiliar domains." },
    { text: "The pilot can track time saved, successful integration, and the quality of validated results.", correct: true, reason: "Those measures connect the scientific tools to value, outcomes, and architecture constraints the lab can observe." },
  ]),

  checkbox({
    name: "Baybriar Systems · a platform renewal under uncertainty",
    context: [
      "Baybriar Systems is renewing the infrastructure contract for an internal document assistant. Its hosted provider may require a multi-year commitment, and running equivalent inference on hardware Baybriar controls would add energy and maintenance expense. The purchasing team has concerns about having only one hardware supplier. Several offices already depend on the tool for document drafts, while an older encrypted archive still contains records whose confidentiality must outlast the current contract.",
      "The board wants a renewal plan that accounts for changing AI economics, environmental demand, workforce needs, and preparation for a future quantum-era migration. The architecture team has to say which decisions can be revisited and what dependencies to check now, while the new contract is still negotiable.",
    ],
    decision: "Select all items that belong in Baybriar’s architecture plan.",
    source: "6.2 slides 6, 9, 12 and 17; 6.1 slide 16",
  }, [
    { text: "Compare infrastructure sourcing, operating costs, and energy implications across the credible options.", correct: true, reason: "The lecture ties AI infrastructure to data-center demand, dedicated compute hardware, and reliance on suppliers. Baybriar has different tradeoffs with hosted and local operation." },
    { text: "Design the operating process and staffing plan around review responsibilities and the AI system’s actual use.", correct: true, reason: "People already rely on the drafting tool, so the technology choice also affects work design, coverage, and escalation." },
    { text: "Map the archive’s cryptographic dependencies while considering the renewal and transition plan.", correct: true, reason: "Baybriar’s confidentiality requirement lasts beyond the current contract, so the quantum risk belongs in the technology-layer roadmap." },
    { text: "Treat today’s market price and model-evaluation results as certain throughout the full commitment.", correct: false, reason: "The lecture raises uncertainty about AI market conditions and changing technology capabilities. A renewal decision should account for that uncertainty." },
  ]),
];
