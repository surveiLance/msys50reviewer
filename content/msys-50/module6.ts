import type { AlternativeQuestion, BlankItem, Card, McItem, MtfItem, MultiItem, SubjectData, TestSet } from "../../lib/types";
import { module6CheckboxCases, module6CombinationCases } from "./module6Cases";

const facts: [string, string, string][] = [
  ["6.1", "Emerging versus disruptive?", "Emerging describes maturity or adoption. Disruptive describes an effect large enough to change established practices, markets, or expectations."],
  ["6.1", "Why should enterprise architects track emerging technologies?", "Look for competitive advantage, external pressure, and operating improvements. Assess integration with existing data, software, infrastructure, and staff."],
  ["6.1", "Neuromorphic versus quantum computing?", "Neuromorphic systems borrow from neural and synaptic organization. Quantum systems compute with controlled quantum states. Their advantages depend on the workload."],
  ["6.1", "What does integrating processing and memory help avoid?", "Moving data back and forth. Brain-inspired silicon systems can use this design to improve efficiency on suitable tasks."],
  ["6.1", "What are Hala Point, NorthPole, and SpiNNaker2 examples of?", "Brain-inspired silicon systems. Hala Point groups Loihi 2 processors, NorthPole embeds memory with its cores, and SpiNNaker2 scales across many processor cores."],
  ["6.1", "NorthPole: time per generated token versus time to first token?", "One measures latency for generation after it is underway; the other measures the wait before the first token. They cannot be substituted in benchmark comparisons."],
  ["6.1", "What is wetware in this lesson?", "Experimental computing using living neural tissue. Its operating lifetime and energy comparisons matter when assessing viability."],
  ["6.1", "Physical versus logical qubit?", "Physical qubits are hardware. Logical qubits encode and protect quantum information using error correction, often with multiple physical qubits."],
  ["6.1", "Scale versus fidelity?", "Scale asks how many useful qubits can work together. Fidelity asks how faithfully the state or operation matches the intended one."],
  ["6.1", "Why compare logical-memory and magic-state results separately?", "Memory preserves quantum information. Magic-state resources help implement certain operations. A high score on one experiment does not establish the other."],
  ["6.1", "How does the lesson define AI?", "Technology that simulates human capabilities such as learning, comprehension, problem solving, decision-making, creativity, and autonomy."],
  ["6.1", "How does an artificial neuron transform inputs?", "Multiply each input by its weight, add them and the bias, and apply an activation function. Outputs can become the next layer’s inputs."],
  ["6.1", "Generative AI versus AI agent?", "Generative AI produces content. An agent can act toward a goal, including using tools if permitted. One system can do both."],
  ["6.1", "Narrow AI, AGI, and superintelligence?", "Narrow AI is specialized. AGI would work and adapt across many domains. Superintelligence is the idea of broadly exceeding human capability."],
  ["6.1", "What two AI techniques does the lesson emphasize?", "Generative AI creates content; predictive AI forecasts, classifies, or scores outcomes. A workflow can use both."],
  ["6.1", "What are the four functionality categories in the lecture?", "Reactive machines respond to the current state. Limited-memory systems use earlier observations. Theory-of-mind systems would understand others’ intentions and emotions; self-aware systems would possess self-awareness."],
  ["6.1", "What is harvest now, decrypt later?", "Someone could store encrypted data now, hoping to read it later with a capable quantum computer. Data that must stay private for years merits early planning."],
  ["6.1", "What should a quantum readiness review start with?", "Find systems that use at-risk public-key cryptography, check data lifetimes and vendor dependencies, and plan a standards-based migration in stages."],
  ["6.2", "What is an AI model?", "A trained program that uses learned patterns to produce a prediction, decision, or other output on new inputs."],
  ["6.2", "Training versus inference?", "Training adjusts internal parameters, such as weights. Inference uses learned values to respond to a new input."],
  ["6.2", "When might a smaller language model make sense?", "When a suitable smaller model meets task needs with less compute, such as local use on a device. Compare actual performance, cost, privacy, and latency."],
  ["6.2", "Multimodal versus mixture of experts?", "Multimodal describes the kinds of information supported, like text and images. Mixture of experts describes routing work among internal components."],
  ["6.2", "Hallucination versus abstention?", "A hallucination gives an unsupported claim as fact. An abstention declines to answer."],
  ["6.2", "What is the hallucination fraction on slide 7?", "Wrong answers divided by wrong answers plus abstentions. Accuracy in the lecture example is correct answers divided by all test prompts."],
  ["6.2", "Why can fewer wrong answers mean less coverage?", "A cautious system may decline more often, including on some prompts it could have answered correctly. Track wrong, abstained, and correct separately."],
  ["6.2", "What makes an AI agent a different security concern?", "It can take actions that affect other systems. Limit its access, record actions, and require approval for consequential decisions."],
  ["6.2", "What external dependencies does AI infrastructure introduce?", "Compute and accelerator supply, electricity and cooling, service capacity, and vendor reliance; use these when comparing placement and continuity plans."],
  ["6.2", "What does a robot or medical benchmark establish?", "Evidence of performance in the tested task and conditions. Check those conditions before inferring broad competence or readiness for real workflows."],
  ["6.2", "Why are open models relevant to EA?", "They can give more choice over cost, data control, and experiments. Check what the license allows and budget for hosting, security, updates, and support."],
  ["6.2", "What are the lecture’s six AI ethics areas?", "Privacy and confidentiality; job security; deepfakes; blurred boundaries between real and digital content; military applications; and biocomputing."],
  ["6.2", "What is safe AGI?", "Broadly capable AI developed and used to benefit humanity, with attention to harms, testing, oversight, and the ability to stop unsafe use."],
  ["6.2", "What are depth and breadth in the AGI discussion?", "Depth is how well a system performs; breadth is how widely it can perform across tasks. A strong single-task benchmark does not demonstrate both."],
  ["6.2", "What does AI change for enterprise architecture?", "Review technology needs and dependencies, reconsider workflows and staffing, time investments, and retain fallback options. Pilot with measures and a human handoff."],
];
const cards: Card[] = facts;
const truth = (s: string, w: string, r: string): MtfItem => ({ s, t: true, w, r });
const fix = (s: string, a: string[], w: string, r: string): MtfItem => ({ s, a, d: a[0], w, r });
const statements = [
  truth("A technology can disrupt an organization <u>before that organization adopts it</u>.", "Competitors, partners, and customers can change expectations and processes first.", "6.1 slide 4"),
  truth("A <u>conventional computer</u> can run an artificial neural network.", "The model and its hardware implementation are separate choices.", "6.1 slides 6, 13"),
  fix("Qubits encoded and protected via error correction are <u>physical</u> qubits.", ["logical"], "Physical qubits are the underlying hardware.", "6.1 slide 9"),
  fix("In a neural network, the parameters that multiply individual inputs are the <u>biases</u>.", ["weights", "input weights"], "The bias is added to the weighted sum.", "6.1 slide 13"),
  truth("High logical-memory fidelity alone <u>does not demonstrate</u> the same fidelity for every quantum operation.", "The memory and operation benchmarks test different things.", "6.1 slides 9–10"),
  truth("Some data captured now <u>may still be sensitive</u> when decryption becomes possible.", "Data lifetime and migration time determine when planning should start.", "6.1 slide 16"),
  fix("A system that estimates which deliveries will arrive late is using <u>generative</u> AI.", ["predictive"], "The model predicts an outcome; it does not create a new piece of content.", "6.1 slide 15"),
  fix("A trained model predicting the queue for a new support ticket is performing <u>training</u>.", ["inference", "prediction"], "Inference uses existing learned parameters to make a prediction.", "6.2 slide 4"),
  fix("An assistant working with both text and pictures demonstrates <u>mixture of experts</u> capability.", ["multimodal", "multimodality"], "MoE is about internal routing, whereas multimodality describes the kinds of data.", "6.2 slide 5"),
  truth("A model can become more cautious <u>without increasing its overall accuracy</u>.", "Switching a wrong answer to abstention changes neither the number correct nor total prompts.", "6.2 slide 7"),
  fix("When an assistant declines to answer a prompt, the outcome is labeled <u>hallucination</u>.", ["abstention"], "It has not asserted an unsupported answer.", "6.2 slide 7"),
  truth("Running a model yourself still requires <u>security, updates, and operating capacity</u>.", "Control over deployment comes with ongoing responsibilities.", "6.2 slide 12"),
  truth("Strong performance on one task is <u>insufficient</u> evidence of AGI.", "Generality requires evidence across different tasks and domains.", "6.2 slides 15–16"),
  truth("A model that can answer questions can create additional risk if it also has <u>permission to change records</u>.", "Tool access and authority can turn one model error into a real action.", "6.2 slide 8"),
];
const mc = (q: string, a: string, distractors: string[], w: string, r: string): McItem => ({ q, a, o: [a, ...distractors], w, r });
const shortCases = [
  mc("A bus operator sees platforms promising live arrival times. Its systems cannot yet exchange location data. What is the useful EA response?", "Review the service pressure and identify data and application changes needed before piloting.", ["Wait until every competitor uses the same platform.", "Buy new processors before defining the service.", "Replace the business objective with a speed benchmark."], "Competitive pressure and integration needs matter together.", "6.1 slides 4–5"),
  mc("A lab argues that a memory result settles whether its system can run a long fault-tolerant algorithm. What is missing?", "Evidence about reliable operations and enough scale for the workload", ["Only the developer's job title", "Only more examples of memory tests", "Evidence that biological tissue can stay alive"], "Memory fidelity is one result. The proposed algorithm also needs enough reliable operations and usable logical qubits.", "6.1 slides 9–10"),
  mc("A network multiplies two inputs by their weights and adds a bias. What comes next at that node?", "Apply an activation function.", ["Give each result a new training label.", "Discard the inputs to learn a new weight immediately.", "Convert the network into a quantum circuit."], "The activation transforms the weighted result into the node's output.", "6.1 slide 13"),
  mc("Two tests report lower latency, one per generated token and one to the first token. What is the fair comparison?", "Measure both systems on the same workload using the same definition of latency.", ["Assume either measure can substitute for the other.", "Rank them by the larger multiplier.", "Use parameter count instead of a latency measurement."], "The two timings capture different stages of generation.", "6.1 slide 7"),
  mc("An assistant gets 64 of 100 correct, declines 24, and gets 12 wrong. What is the slide's hallucination fraction?", "12 / (12 + 24)", ["12 / 100", "24 / (12 + 24)", "64 / 100"], "The lecture divides wrong by wrong plus abstained. Wrong as a share of all prompts is a separate metric.", "6.2 slide 7"),
  mc("A claims assistant is accurate on FAQs but occasionally proposes unsupported decisions. What is a reasonable rollout?", "Use it on verified FAQs and send uncertain or consequential cases to a person.", ["Authorize automatic approval of every claim.", "Measure correct answers only; ignore wrong ones.", "Select a larger model and skip workflow testing."], "Handoffs and risk limits support a bounded pilot without assuming general competence.", "6.2 slides 7–8, 17"),
  mc("A field team works offline with photos and notes. What should architects check first?", "Whether a model that handles both formats can run within the device's limits.", ["Whether mixture of experts guarantees offline use.", "Whether a text-only model has the highest overall score.", "Whether the model has the largest number of parameters."], "Modality and deployment requirements are separate filters.", "6.2 slide 5"),
  mc("HR wants internal data to stay on its own infrastructure and plans to evaluate an open model. What should it budget for?", "Hosting, security, updates, and staff time to run the service.", ["No operating expenses because weights are available.", "Only the licensing cost, regardless of deployment.", "Automatic proof of compliance without checking the license."], "Local control is useful when deployed correctly and supported in practice.", "6.2 slide 12"),
];
const multi: MultiItem[] = [
  { q: "What can affect the value of a disruptive technology for a particular enterprise?", o: ["Effects on customers and suppliers", "Integration with present systems", "The organization's operating needs", "Whether every company adopts exactly the same product"], a: ["Effects on customers and suppliers", "Integration with present systems", "The organization's operating needs"], w: "Adoption should account for external pressure, operational benefit, and technical fit.", r: "6.1 slides 4–5" },
  { q: "Which actions fit a quantum-readiness plan?", o: ["Inventory at-risk public-key uses", "Prioritize information with a long sensitivity period", "Check whether vendors can support migration", "Wait for public proof of decryption before planning"], a: ["Inventory at-risk public-key uses", "Prioritize information with a long sensitivity period", "Check whether vendors can support migration"], w: "Migration takes time, and long-lived information can be captured before an attacker has the ability to decrypt it.", r: "6.1 slide 16" },
  { q: "What should an architect assess when allowing an AI system to take action?", o: ["Access to tools and records", "Who authorizes consequential actions", "What can be logged and reviewed", "Whether a high benchmark eliminates the need for controls"], a: ["Access to tools and records", "Who authorizes consequential actions", "What can be logged and reviewed"], w: "An agent may affect other systems, so permissions, approvals, and logging are important.", r: "6.2 slide 8" },
  { q: "Which metrics together distinguish answer reliability from coverage?", o: ["Correct outcomes", "Wrong answers", "Abstentions", "Vendor parameter count"], a: ["Correct outcomes", "Wrong answers", "Abstentions"], w: "Count all three outcome categories; model size does not distinguish them.", r: "6.2 slide 7" },
];
const blanks: BlankItem[] = [
  { s: "The ___ measures how closely the achieved quantum state or operation matches the intended one.", bank: ["fidelity", "qubit count", "throughput", "coverage"], a: "fidelity", w: "Scale and fidelity describe different constraints.", r: "6.1 slides 9–10" },
  { s: "A small language model deployed on the device that collects inputs can work at the ___.", bank: ["edge", "bias", "output layer", "synapse"], a: "edge", w: "The edge is near the source or site of use.", r: "6.2 slide 5" },
  { s: "A synthesized recording impersonating a manager raises the ethical issue of ___.", bank: ["deepfakes", "qubit fidelity", "abstention", "edge inference"], a: "deepfakes", w: "Synthetic media can impersonate a real person and deceive a listener.", r: "6.2 slide 14" },
  { s: "DeepMind's proposal distinguishes performance level, called depth, from the range of tasks, called ___.", bank: ["breadth", "abstention", "latency", "autonomy"], a: "breadth", w: "Handling a broad range of tasks and handling any one task well are separate.", r: "6.2 slide 15" },
];
const conceptSet: TestSet = {
  desc: "Module 6: emerging technologies, AI, and readiness",
  mtf: statements,
  secs: [
    { kind: "mc", title: "Short application questions", inst: "Use the facts in the situation to make a choice.", items: shortCases },
    { kind: "letter", title: "Read the clue", inst: "Match each concept to its use or meaning.", items: [
      ["Neuromorphic computing", "Brain-inspired processor organization"],
      ["Logical qubit", "Protected unit of quantum information"],
      ["Activation", "Transforms a weighted sum plus bias"],
      ["Parameters", "Internal values adjusted in training"],
      ["Multimodal", "Works with more than one type of information"],
      ["Mixture of experts", "Routes inputs to selected internal components"],
      ["Abstention", "Declines to answer"],
      ["Deepfake", "Synthetic media that can impersonate a person"],
    ] },
  ],
};
const longCases: AlternativeQuestion[] = [
  ...module6CombinationCases.map(q => ({ kind: "mc" as const, prompt: q.q, options: q.o, answer: q.a, why: q.w, source: q.r })),
  ...module6CheckboxCases.map(q => ({ kind: "multi" as const, prompt: q.q, options: q.o, correct: q.a, why: q.w, source: q.r })),
];

export function withModule6(data: SubjectData): SubjectData {
  const slug = "module-6";
  return {
    ...data,
    cards: { ...data.cards, [slug]: cards },
    tests: { ...data.tests, [slug]: { "1": conceptSet } },
    defaultSet: { ...data.defaultSet, [slug]: "1" },
    setLabels: { ...data.setLabels, [slug]: { "1": "Concept review" } },
    multi: { ...data.multi, [slug]: multi },
    blanks: { ...data.blanks, [slug]: blanks },
    alternative: { ...data.alternative, [slug]: longCases },
  };
}
