import type { FinalsCase } from "./finalsCaseBuilder";

export const module6FinalsVariety: FinalsCase[] = [
  {
    format: "best",
    title: "Marrowgate Exhibitions · a change forced by clients",
    context: [
      "Marrowgate Exhibitions prepares bids to design and install museum displays. A new generation of design tools lets some competing firms show a custom preview during the first sales meeting. Marrowgate still sketches by hand, and its estimates remain accurate, but three museums have revised their bid process to require previews before inviting any firm to tender. The general manager tells the board that the technology has yet to affect Marrowgate because none of its staff use it.",
      "The board can fund one quarter of investigation. It wants to retain its accuracy advantage, and no client has prescribed the tool that should generate a preview. The architect has to identify what has changed and recommend what evidence the company needs before buying anything. A buying decision will wait until after the next set of bids.",
    ],
    task: "Which recommendation best identifies the immediate disruption and tests Marrowgate’s response?",
    source: "6.1 slides 4–5",
    choices: [
      { text: "Measure preview capability as an internal efficiency issue by timing the existing production team after projects are awarded.", correct: false, reason: "Measuring completed projects would miss the changed eligibility requirement that determines whether Marrowgate gets invited to bid." },
      { text: "Treat preview delivery as a changed market expectation and pilot alternative ways to meet it before bids close.", correct: true, reason: "The changed invitation criteria already affect Marrowgate’s access to work, and testing preview methods directly addresses the new requirement." },
      { text: "Benchmark the competitors’ preferred tool and use the test to decide whether its technology is mature enough for internal rollout.", correct: false, reason: "Tool maturity alone cannot show how Marrowgate can meet the new preview requirement while preserving estimate accuracy." },
      { text: "Monitor adoption among Marrowgate’s own designers and start planning a response once they begin bringing preview tools into projects.", correct: false, reason: "The museums have changed their process already, so waiting for internal adoption leaves the active market constraint unaddressed." },
    ],
  },
  {
    format: "best",
    title: "Lattice Access · the response that arrives first",
    context: [
      "Lattice Access makes software that describes public-service forms aloud. Its kiosk pilot reads the first line as soon as the model produces it, then reads the rest as it streams in. The service target is to begin speaking within a fixed time after the visitor selects a form. Typical requests include a long form and several pages of instructions. A supplier’s brain-inspired silicon accelerator reports better latency per generated token for a short prompt on a different model.",
      "The supplier uses that result to promise a faster start at every kiosk. Lattice has enough borrowed equipment for one morning of comparison before its purchasing committee meets. Both candidates can produce the same descriptions in a desktop test, so the committee wants the measurement that directly tests the claimed improvement under kiosk conditions.",
    ],
    task: "Which comparison should Lattice run before it revises the response-time estimate?",
    source: "6.1 slides 6–7",
    choices: [
      { text: "Compare time from form selection to the start of playback with realistic forms and the same end-to-end setup.", correct: true, reason: "End-to-end time to the start of speech measures the kiosk’s service target and captures delays before the first output is usable." },
      { text: "Compare the average interval between generated tokens once the first line has finished streaming.", correct: false, reason: "Steady generation speed describes the later stream while the service target concerns the wait before that stream starts." },
      { text: "Compare how many complete descriptions each system can generate during a busy morning with synthetic prompts.", correct: false, reason: "Aggregate throughput can favor a system that completes more requests while an individual visitor still waits longer for speech to start." },
      { text: "Compare the time to generate each entire description with realistic forms and use the faster total to predict the earlier start.", correct: false, reason: "Total completion time combines startup and output generation, so it cannot isolate when visitors first hear the kiosk." },
    ],
  },
  {
    format: "best",
    title: "Hawthorn Modeling · a proposal to connect two processors",
    context: [
      "Hawthorn Modeling licenses industrial simulation software and is investigating whether it can offer a future quantum computation service. In a demonstration, a supplier connected two processing units and showed that its control software could schedule independent exercises on both. Its contract proposal states that the connection doubles the number of protected logical qubits usable within one job. Hawthorn’s intended workload would require one computation to use logical resources on both units together.",
      "The demonstrations reported the physical qubits installed in each unit and showed a logical memory test on one unit in isolation. The investment committee has separated the connectivity milestone from its decision to depend on the larger logical capacity. It asks the architect what additional result would test the precise claim in the proposal before it earmarks development resources.",
    ],
    task: "Which piece of evidence would most directly support the claimed usable capacity?",
    source: "6.1 slides 9–10",
    choices: [
      { text: "A longer single-unit memory test showing that protected information can remain stable for the required runtime.", correct: false, reason: "A longer isolated test speaks to memory fidelity on one unit and leaves the shared logical capacity claim unresolved." },
      { text: "An inventory confirming the combined physical count and showing that the two units carry identical hardware.", correct: false, reason: "The combined hardware count does not establish how many protected logical qubits can work together on one computation." },
      { text: "A throughput test showing that simultaneous independent exercises finish twice as quickly as running them sequentially.", correct: false, reason: "Parallel jobs demonstrate scheduling capacity without showing that one job can use protected logical resources across units." },
      { text: "A workload-representative demonstration of one computation using the claimed protected logical resources on both units.", correct: true, reason: "A shared logical demonstration tests the proposal’s precise claim under the cross-unit workload requirement." },
    ],
  },
  {
    format: "best",
    title: "Vellum Returns · two outputs in one preview",
    context: [
      "Vellum Returns handles damaged-item claims for online stationery shops. Its proposed tool first estimates whether a newly reported defect is likely to recur in other items from the same shipment. A second learned component takes the estimate and the inspection report and writes a letter for the account manager to edit and send. The supplier markets both components as generative because the buyer sees a letter at the end.",
      "The operations director wants to approve or replace each component independently. Analysts already have confirmed repeat defects for the previous eighteen months, and account managers have gathered letters that accurately stated the inspection results. Procurement needs a description of each component’s task and an acceptance test that would reveal which part needs repair if the letter sounds convincing but carries a bad estimate.",
    ],
    task: "How should procurement classify and separately evaluate the two learned components?",
    source: "6.1 slides 12 and 15",
    choices: [
      { text: "Classify both as predictive and evaluate both against actual repeat defects, since each helps the account manager decide.", correct: false, reason: "The letter component creates text and can misrepresent an otherwise accurate estimate, a failure repeat-defect labels alone would miss." },
      { text: "Classify both as generative and grade letter quality against customer correspondence for defects that later recurred.", correct: false, reason: "A letter-quality review cannot establish whether the first component’s likelihood estimates match observed repeat defects." },
      { text: "Test the predictive estimate against defect outcomes and the generative letter for fidelity to the estimate and inspection record.", correct: true, reason: "Separate tests expose an inaccurate forecast and a misleading draft as distinct failures in the same workflow." },
      { text: "Treat the estimate as generative because it is newly produced and the letter as predictive because it describes a likely outcome.", correct: false, reason: "The techniques are distinguished by estimating an outcome or creating content, regardless of whether the resulting letter discusses probabilities." },
    ],
  },
  {
    format: "best",
    title: "Rookline Fabrics · two paths to the same sensor reading",
    context: [
      "Rookline Fabrics rents fabric-cutting equipment to independent workshops. Each machine sends a diagnostic panel with the current vibration, load, and temperature. A learned service returns one of three maintenance recommendations. A competing supplier says its service can make better choices because it also considers how the readings changed over the last hour. Neither supplier exposes its internal design, and both advertise the same number of supported machine models.",
      "The maintenance manager can replay saved panels and histories in a test account. She wants to test whether the recommendation actually depends on the past for an otherwise identical current panel. A longer trial will separately check whether the recommendations are useful. The architect must pick a controlled comparison that answers the narrower question at this stage.",
    ],
    task: "Which comparison most directly tests for limited-memory behavior?",
    source: "6.1 slide 14",
    choices: [
      { text: "Replay an identical current panel with different histories while holding other test conditions fixed, and look for a consistent difference in recommendations.", correct: true, reason: "A repeatable change when only the history varies is evidence that prior observations influence the recommendation." },
      { text: "Hold the history constant, change the current readings, and check whether a different recommendation appears.", correct: false, reason: "Sensitivity to current readings is compatible with both reactive behavior and use of previous observations." },
      { text: "Compare recommendations across machine models using their usual current readings and saved histories.", correct: false, reason: "Varying the machine and current panel along with the history makes it impossible to isolate the effect of past observations." },
      { text: "Check which service can reproduce the list of its last three recommendations in the operator dashboard.", correct: false, reason: "A visible history feature shows that records can be displayed while leaving their influence on the recommendation untested." },
    ],
  },
  {
    format: "best",
    title: "Opal Print Cooperative · next year’s gateway budget",
    context: [
      "Opal Print Cooperative operates two encrypted gateways that use public-key schemes identified by its security team as quantum-vulnerable. The larger gateway carries prices that become public within forty-eight hours and can be upgraded independently by Opal’s staff. The smaller gateway carries unpublished illustrations and agreement terms that remain confidential for twelve years. Three distributors must coordinate with Opal before that gateway can change, and their approved update cycles make its migration slow.",
      "The cooperative can inventory both gateways now, but it can fund only one detailed migration plan this quarter. The finance lead favors whichever gateway processes more records. Opal’s board asks for a priority tied specifically to the risk that someone could keep captured traffic and attempt to read it many years later.",
    ],
    task: "Which first planning decision most directly addresses the board’s stated risk?",
    source: "6.1 slide 16",
    choices: [
      { text: "Start with the larger price gateway because traffic volume is the strongest measure of harm from decryption in ten years.", correct: false, reason: "Most of the price traffic loses its confidentiality value after two days, even if a much greater volume can be collected." },
      { text: "Start with the illustration gateway because the information stays sensitive longer and the distributor dependencies lengthen migration.", correct: true, reason: "The prospect of future disclosure matters most for long-lived secrets whose protections take longer to replace." },
      { text: "Start with the price gateway because a quick independent upgrade provides more assurance for the cooperative’s confidential illustrations.", correct: false, reason: "An upgrade on the separate price gateway leaves the long-lived illustration traffic exposed to the same collection risk." },
      { text: "Use the quarter to forecast the first capable quantum machine, then schedule both gateways against the predicted date.", correct: false, reason: "A forecast cannot protect already captured records, and work can begin using the known confidentiality periods and vendor lead times." },
    ],
  },
  {
    format: "select",
    title: "Ferncourt Publishing · editing the classifier handoff",
    context: [
      "Ferncourt Publishing has commissioned a neural network to send support tickets to one of three editorial teams. Its handoff pack shows five input units, three hidden layers of five units each, and three output scores. The pack says this example is modeled after the lecture figure. Ferncourt has separately recorded how supervisors routed thousands of old tickets, and it plans to use those records during development.",
      "The handoff pack has been mixed with notes from a future version that might add two more teams. For the current version the output scores go to a separate rule that picks the highest score. The service architect must edit the document before it is used to explain how the current network trains and routes newly submitted tickets. No changes to the network are authorized yet.",
    ],
    task: "Select every accurate line for the current handoff pack.",
    source: "6.1 slide 13; 6.2 slide 4",
    choices: [
      { text: "During an ordinary forward pass the input feeds the hidden layers in order, and their final layer feeds the three output scores.", correct: true, reason: "The lecture figure represents adjacent-layer data flow from input to hidden layers and then to output." },
      { text: "Training can adjust weights and biases using the old tickets and recorded routing labels.", correct: true, reason: "The labeled examples provide feedback that training can use to update learned parameters." },
      { text: "A newly submitted ticket can produce three scores before any supervisor supplies its correct destination.", correct: true, reason: "Inference uses the learned parameters to produce scores for new inputs without needing the answer in advance." },
      { text: "Adding two teams would leave three output scores sufficient because this network already has five input units.", correct: false, reason: "For a design with one score per candidate team, the current three outputs tie to the three teams independently of input width." },
    ],
  },
  {
    format: "select",
    title: "Cedarsteps Grocers · a better number at the wrong handoff",
    context: [
      "Cedarsteps Grocers is trying a service that predicts how many refrigerated orders each store should prepare. The trial cut the time for central staff to create forecasts, and head office wants to cite that result as a cost saving. Store supervisors report that forecasts arrive after their morning shifts are assigned, so they spend an extra hour rearranging prep schedules. An outside pickup partner has also stopped accepting amended estimates after noon.",
      "Cedarsteps will repeat the trial across four stores before making a purchasing decision. Its sponsor asks for evidence about total work and whether the service can support the partner’s changed cutoff. The existing forecast spreadsheet continues to run during both trials, so a useful comparison is possible without forcing a store to keep a weak process.",
    ],
    task: "Select every action that would produce relevant evidence on whether to adopt the forecasting service.",
    source: "6.1 slides 4–5 and 15",
    choices: [
      { text: "Compare central forecast preparation time alone because only work performed by the forecasting team counts as an operational effect.", correct: false, reason: "The extra work shifted to stores changes net process efficiency and would disappear from a central-only measure." },
      { text: "Measure total effort across central forecasting and store verification with both methods.", correct: true, reason: "Measuring both teams shows whether the service saves work overall or moves it downstream." },
      { text: "Try releasing forecasts before store shifts are assigned and check whether stores can send updates before the partner’s cutoff.", correct: true, reason: "The trial would test whether the forecasts fit the stores’ staffing process and the partner’s revised deadline." },
      { text: "Extend the purchasing trial only after the pickup partner commits to accepting updates after noon again.", correct: false, reason: "The current cutoff is a real constraint the four-store trial can evaluate with the existing spreadsheet as a fallback." },
    ],
  },
  {
    format: "select",
    title: "Stonefin Audio · when the chip label changes",
    context: [
      "Stonefin Audio builds museum listening stations whose software recognizes a limited set of visitor requests. The existing stations run a trained neural network on a conventional processor. A supplier has offered two independent upgrades. A software release keeps the current processor and installs a network with twice as many hidden layers. A hardware release supplies a silicon design built around neuron-like units with processing close to memory and can run a version of the original recognition model.",
      "Stonefin has agreed to try an upgrade at two galleries that record station energy use. It can keep one current station as a baseline, and it has no performance results from the new units yet. The architect must correct the proposal’s terminology before the trial is submitted for approval.",
    ],
    task: "Select every technically justified statement for the procurement draft.",
    source: "6.1 slides 6–7 and 13",
    choices: [
      { text: "The current station’s use of a trained neural network establishes that its hardware is neuromorphic.", correct: false, reason: "Neural networks can run on conventional processors, so the application’s model does not establish the chip architecture." },
      { text: "The proposed neuron-inspired silicon design can qualify as neuromorphic even when its application uses the same recognition task as the current station.", correct: true, reason: "Neuromorphic describes the hardware’s organization, so changing the architecture need not change the application task." },
      { text: "The extra hidden layers make the existing processor neuromorphic when it runs the proposed software release.", correct: false, reason: "Doubling the hidden layers changes the model while leaving the conventional processor’s physical organization unchanged." },
      { text: "The new silicon design’s memory arrangement establishes lower energy for Stonefin’s complete station before any workload test.", correct: false, reason: "Reducing some data movement can help, but the energy of the deployed station still depends on its complete workload and integration." },
    ],
  },
  {
    format: "best",
    title: "Bayside Captioning · what the router actually does",
    context: [
      "Bayside Captioning helps archivists tag recorded community meetings. In a trial, staff upload an audio recording and a typed agenda. The candidate model uses both to propose searchable topic labels. A development diagram also shows a router that sends parts of an input to selected groups of internal components. The router applies even when testers submit just a typed agenda. A purchasing colleague has entered these as two descriptions of the same feature.",
      "Bayside may later want to add video. It wants the approval memo to tell future teams what has been tested at the input boundary and what is merely a description of internal design. The trial includes silent video files, but nobody has submitted them to this model yet.",
    ],
    task: "Which description should Bayside use in its approval memo?",
    source: "6.2 slide 5",
    choices: [
      { text: "The router establishes multimodal capability on its own because choosing different components means handling different input formats.", correct: false, reason: "Internal routing can occur for a single input format and gives no evidence about what formats the model accepts." },
      { text: "Audio and text use establishes a mixture-of-experts design because each input type must have its own expert group.", correct: false, reason: "The trial shows that two types of information are used, while the internal routing diagram is the evidence for a mixture of experts." },
      { text: "The trial demonstrates audio and text multimodality, the diagram describes a mixture of experts, and video support needs its own test.", correct: true, reason: "Input capability and internal routing describe different properties, and the audio and text trial does not cover video." },
      { text: "The service is text-only because its topic labels are text, and the router could establish multimodality if it later emits video.", correct: false, reason: "Multimodal input can support a text-only output, and producing a video would be an output property independently of routing." },
    ],
  },
  {
    format: "best",
    title: "Bramble Permits · an equal percentage on the dashboard",
    context: [
      "Bramble Permits runs a service that helps food-stall operators identify which forms to file. It tested two versions of an assistant on the same 200 requests. Version A returned 160 correct answers, 8 invented answers, and 32 abstentions. Version B returned 180 correct answers, 4 invented answers, and 16 abstentions. In real use, abstentions go to advisers. An unsupported answer is more costly to the business because it can send the operator to the wrong office.",
      "The dashboard publishes only the lecture measure, wrong divided by wrong plus abstained, and shows a tie. Both versions cost the same and meet the privacy and response-time requirements. The project owner asks whether the tie should rule out preferring either version for the monitored pilot.",
    ],
    task: "Which interpretation of the results should guide the pilot choice?",
    source: "6.2 slide 7",
    choices: [
      { text: "Choose A because its larger number of abstentions means a lower rate of invented answers in the full pilot.", correct: false, reason: "A actually invented eight answers in 200 requests compared with four in 200 for B, so its overall wrong-answer rate is higher." },
      { text: "Choose B because its halved number of wrong answers makes the course hallucination measure half as large.", correct: false, reason: "Both the numerator and denominator halve from A to B, leaving the course measure at 20% for both." },
      { text: "Choose B because it gives more correct answers, fewer invented answers, and fewer adviser handoffs at the same course measure.", correct: true, reason: "The common 20% describes the share of non-correct outcomes that are wrong and hides the reduction in both kinds of non-correct outcome." },
      { text: "Defer the choice because equal course measures imply the same rate of wrong answers among requests that received a reply.", correct: false, reason: "The course measure excludes correct answers from its denominator, unlike a rate calculated among all answered requests." },
    ],
  },
  {
    format: "best",
    title: "Morrow Lift Services · a robot moves beyond the demo floor",
    context: [
      "Morrow Lift Services wants a mobile robot to carry sealed replacement parts from its workshop to a nearby testing bay. The vendor demonstrated that the non-humanoid machine could navigate a wide, empty course quickly. Morrow’s site has narrower corridors, passing technicians, and a lift whose queue changes throughout the day. The service manager proposes accepting the vendor’s travel-time figure as evidence that the robot will meet the new route’s ninety-second target.",
      "The company can book a supervised test route for two afternoons. It needs evidence about reliable part deliveries during ordinary operations and a procedure for handing the job back to a porter if the robot is unable to finish. The vendor can configure route settings for the trial but has agreed to defer any deployment decision until the test ends.",
    ],
    task: "Which acceptance test best addresses the proposed physical AI deployment?",
    source: "6.2 slides 10–11",
    choices: [
      { text: "Measure the robot’s maximum speed in the empty corridor and reserve a time allowance derived from the vendor’s demo.", correct: false, reason: "A speed test on an empty corridor cannot account for actual building interactions or the handoff when a delivery fails." },
      { text: "Log end-to-end delivery times and incomplete trips on the real route under representative supervised conditions, including porter intervention.", correct: true, reason: "The route-specific trial tests the task and environmental variation that matter to Morrow’s timing and fallback requirements." },
      { text: "Use a list of unrelated objects the robot can move to test whether it has enough general ability for the new building.", correct: false, reason: "Performance on other objects leaves the actual route, narrow corridors, delays, and delivery recovery untested." },
      { text: "Have porters measure the route during busy hours and compare their times with the machine’s showing on the vendor’s straight course.", correct: false, reason: "The porter timings could provide a useful baseline but a result from different conditions cannot predict the machine’s performance on this route." },
    ],
  },
  {
    format: "best",
    title: "Inkburrow Design · weights for a client-facing service",
    context: [
      "Inkburrow Design uses a model to sort and label archival illustrations for its own staff. A research group publishes weights that Inkburrow can download and modify on its own machines. The accompanying terms authorize internal evaluation and explicitly require different written permission for client-facing use. Inkburrow’s existing pilot needs no new staff during limited office hours. A proposed expansion would give clients access during evenings and weekends.",
      "The sales manager says the weights and the successful local pilot make the expansion ready to approve without a subscription cost. The board wants to keep unpublished illustrations under its control, including client commissions the firm has agreed to store privately. It asks the architect to identify which additional information is necessary before self-hosting can be approved for the client portal.",
    ],
    task: "Which recommendation should the architect place before the board?",
    source: "6.2 slide 12",
    choices: [
      { text: "Approve on the internal evaluation terms because clients will only see labels and never receive a copy of the weights.", correct: false, reason: "The explicit client-facing use condition still applies when clients see only the system’s outputs." },
      { text: "Use unmodified weights for the portal so the group’s permission for internal testing can extend to client use.", correct: false, reason: "The stated restriction is on the audience for the service, which using unmodified weights would leave unchanged." },
      { text: "Request client-facing terms and approve on their receipt using the internal pilot’s current operating budget.", correct: false, reason: "Written permission would settle use rights while leaving extended availability, maintenance, and data-handling costs unevaluated." },
      { text: "Obtain client-facing permission and compare the full cost and controls for extended hosting, support, and handling client data.", correct: true, reason: "Deployment rights, operational capacity, security, and data control all matter even when weights are free to download." },
    ],
  },
  {
    format: "best",
    title: "Gannet Tender Services · whether expertise travels",
    context: [
      "Gannet Tender Services reviews procurement documents for small councils. A model achieved excellent results on its test of established tender rules. The vendor then added refreshed practice examples for each council and demonstrated similar results on several local contract templates. Gannet’s board asks whether the system can carry what it learns into unfamiliar kinds of work without being manually prepared for every new task.",
      "The team can commission an independent assessment with access to specialists from several domains. The assessment is meant to examine breadth of capability, and a separate later review will deal with what actions the model may take. The vendor suggests spending the full assessment budget on more tender questions of increasing difficulty so the board has a larger sample.",
    ],
    task: "Which assessment design most directly tests the board’s question about breadth?",
    source: "6.2 slides 15–16",
    choices: [
      { text: "Measure performance on progressively harder tender documents to identify where expertise in procurement stops improving.", correct: false, reason: "Increasing difficulty within procurement measures depth in the familiar domain while leaving transfer to other domains untested." },
      { text: "Ask specialists to define unfamiliar tasks across different domains and evaluate the model’s ability to solve them without task-specific manual preparation.", correct: true, reason: "Testing unfamiliar problems across domains targets breadth and generalization, the capabilities that results on tenders alone cannot establish." },
      { text: "Prepare the model for each new domain with fresh practice cases, then use its average test score as evidence of unaided transfer.", correct: false, reason: "Manual preparation for each task confounds the board’s question about whether the model can adapt without that assistance." },
      { text: "Give the model more authority over live tender work and infer wider ability if it completes the same workflow independently.", correct: false, reason: "Autonomy on familiar work does not establish breadth and is a separate deployment decision." },
    ],
  },
  {
    format: "best",
    title: "Hazeltrack Media · capacity that must survive a delay",
    context: [
      "Hazeltrack Media processes caption drafts in overnight batches. Finance expects the workload to grow when two signed contracts begin, and it wants enough capacity to maintain the morning delivery promise. The fastest accelerator candidate meets the target in a lab but requires more cooling than Hazeltrack’s current site can supply. A second candidate met the deadline on recent samples and fits the site, though its performance at the expected higher volume is still uncertain.",
      "The preferred supplier will reserve its hardware only if Hazeltrack pays a large nonrefundable deposit. An independent supplier can lend the second candidate for a month, and Hazeltrack can still send overflow batches to a service it already uses under approved terms. The architect must recommend a step that preserves continuity while improving the capacity forecast.",
    ],
    task: "Which immediate recommendation best fits the contracts and infrastructure constraints?",
    source: "6.2 slides 8–9 and 17",
    choices: [
      { text: "Reserve the fastest candidate and assume the lab throughput will apply when the company installs it at its current site.", correct: false, reason: "Lab throughput depends on the required infrastructure, and the current cooling limit makes that performance unavailable as stated." },
      { text: "Buy enough of the second candidate based on recent samples and cancel overflow capacity to fund the purchase.", correct: false, reason: "The expected workload has yet to be tested, so cancelling overflow would remove the fallback before the risk is resolved." },
      { text: "Defer both candidates and treat the current overflow service as proof that all projected batches will meet the new deadline.", correct: false, reason: "Existing overflow can bridge the test period but its use on current workloads does not demonstrate capacity at the projected volume." },
      { text: "Borrow and test the second candidate at forecast demand, verify cooling and fallback capacity, and defer the deposit until results warrant it.", correct: true, reason: "The month-long test resolves relevant capacity and infrastructure uncertainty while the overflow service keeps the delivery plan adaptable." },
    ],
  },
  {
    format: "select",
    title: "Plover Venues · turning suggestions into calendar updates",
    context: [
      "Plover Venues tests an assistant that reads room availability and suggests alternative spaces when two teams request the same time. The trial used copies of calendars, and staff made any changes themselves. Management now proposes giving the assistant access to live bookings so it can create temporary room holds. Moving a confirmed booking can inconvenience paying clients and remains a decision assigned to an events manager.",
      "The scheduling system can give different permissions for reading calendars, creating a hold, and moving a booking. It can also retain a history tied to service accounts. The vendor provides general model documentation but cannot explain why specific rooms were suggested on several trials. Plover wants to open a pilot while preserving visibility into what changes and who approves it.",
    ],
    task: "Select every control appropriate to the pilot’s intended scope.",
    source: "6.2 slides 8–9 and 17",
    choices: [
      { text: "Give the assistant only the room data it needs and the ability to create the temporary holds authorized for the pilot.", correct: true, reason: "The booking system supports permissions that let Plover limit access and actions to the defined workflow." },
      { text: "Require the events manager to approve moves of confirmed bookings before any change takes effect.", correct: true, reason: "Human approval preserves the assigned decision authority at the step with consequences for clients." },
      { text: "Log booking actions with the service account and retain enough information for staff to review what changed.", correct: true, reason: "Action records are useful even when the model’s internal reasoning is hard to explain." },
      { text: "Give the assistant the events manager’s full role and rely on the model documentation for traceability.", correct: false, reason: "General documentation does not provide a record of individual changes, and the full role exceeds the pilot’s assigned authority." },
    ],
  },
  {
    format: "select",
    title: "Willowframe Learning · demonstrations that resemble testimony",
    context: [
      "Willowframe Learning creates tutorials on how to ask for municipal services. It plans to show generic examples of people describing a missed waste collection and similar problems. A production team generated a clip of a speaker whose face and voice resemble a well-known local advocate. The advocate never made the statement. A second clip uses a fictional performer, but realistic street footage in the background makes it look like a real local incident.",
      "Staff will publish the lessons in a player and offer individual clips as downloads to trainers. The communications lead asks the architecture group which features of the content and its distribution matter for the review. Public access is part of the project, and no sign-in is required to watch the clips.",
    ],
    task: "Select every conclusion that applies the lecture’s ethical concerns to the case.",
    source: "6.2 slides 13–14",
    choices: [
      { text: "The first clip raises a deepfake concern because it could falsely attribute speech to an identifiable person.", correct: true, reason: "A resemblance in both face and voice can impersonate the advocate even when the clip is for education." },
      { text: "The fictional performer removes the ethical concern from the second clip because no real speaker is being impersonated.", correct: false, reason: "Viewers can still mistake a fabricated event for something that actually happened, which is a separate authenticity concern." },
      { text: "Labels attached to the clips should travel with downloaded copies because viewers may see them outside the original lesson.", correct: true, reason: "Persistent disclosure addresses the risk that a realistic simulation could be mistaken for a recording when separated from its lesson context." },
      { text: "A warning posted only at the player entrance is sufficient evidence that trainers can distinguish real and synthetic clips in the downloads.", correct: false, reason: "A downloaded clip can circulate without the player’s entrance notice, defeating its role in helping viewers identify a simulation." },
    ],
  },
  {
    format: "select",
    title: "Starling Tiles · from a predicted finish to a reproducible result",
    context: [
      "Starling Tiles is evaluating a system for identifying surface finishes that retain their color under steady light. One component ranks candidate finishes using historical tests. A robotic station prepares a limited number of samples and records their measured color change. The system recently suggested a promising finish, and it produced a clear draft report based on the station’s measurements. A project lead wants to include the finding in a proposal for a larger production trial.",
      "The research manager has approved a week for checking the evidence before that proposal is filed. Starling kept the rankings, preparation logs, and underlying measurements. The manager wants the proposal to explain which stages AI assisted and what the next independent test must establish before anyone relies on the claim at manufacturing scale.",
    ],
    task: "Select every conclusion that should appear in the proposal.",
    source: "6.2 slides 10–11 and 17",
    choices: [
      { text: "Describe the ranking as a way of selecting candidates for testing and preserve the measured results as distinct evidence.", correct: true, reason: "Predictive ranking directs experimentation, while recorded sample measurements provide evidence about actual performance under the tested conditions." },
      { text: "Keep the preparation logs and report which conditions the station actually tested.", correct: true, reason: "Automating trials still leaves a need to document the procedure so that the result can be checked and reproduced." },
      { text: "Have a reviewer check the automatically drafted report against the station’s underlying measurements.", correct: true, reason: "Research automation can help write a report while leaving people responsible for verifying what the data supports." },
      { text: "Repeat the measurement under conditions representative of manufacturing before making a production-scale performance claim.", correct: true, reason: "Success on a limited set of samples establishes evidence for the tested workflow, with transfer to production still requiring confirmation." },
    ],
  },
];
