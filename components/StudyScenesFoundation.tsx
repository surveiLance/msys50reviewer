"use client";

import React, { useState } from "react";
import { operatingModel } from "@/lib/studyStories";
import { Choices, Glyph, Outcome, SceneMap, type MapNode } from "./StudyCanvas";

export function CampusScene() {
  const [connected, setConnected] = useState(false);
  const [focus, setFocus] = useState("student");
  const nodes: MapNode[] = [
    { id: "student", label: "Student", icon: "person", x: 50, y: 17 },
    { id: "registrar", label: "Registrar", icon: "office", x: 19, y: 52 },
    { id: "finance", label: "Finance", icon: "office", x: 81, y: 52 },
    { id: "portal", label: "Student portal", icon: "app", x: 50, y: 82 },
  ].map(n => ({ ...n, tone: n.id === focus ? "on" as const : undefined }));
  const details: Record<string, string> = { student: "Wants to enroll without repeating the same information.", registrar: "Needs to verify eligibility and course availability.", finance: "Needs to verify payment status.", portal: "Must support the business work and its information needs." };
  return <><button className="xp-action" onClick={() => setConnected(!connected)}>{connected ? "Hide the enterprise connections" : "Bring business and IT together"}</button><SceneMap nodes={nodes} links={connected ? [["student", "registrar"], ["registrar", "finance"], ["finance", "portal"], ["portal", "registrar"]] : []} onSelect={setFocus} label="Enrollment campus connections" running={connected} /><Outcome title={connected ? "Now discuss the whole experience" : "Working offices can still make a broken experience"}>{details[focus]} {connected ? "EA makes relationships discussable; drawing a link alone does not fix the underlying process." : "Tap an office to hear its concern. Then connect the perspectives."}</Outcome></>;
}

export function AlignmentScene() {
  const [issue, setIssue] = useState(0);
  const nodes: MapNode[] = [
    { id: "bs", label: "Business strategy", icon: "goal", x: 24, y: 23, detail: "Online enrollment" },
    { id: "its", label: "IT strategy", icon: "goal", x: 76, y: 23, detail: issue === 0 ? "Hardware savings only" : "Online services" },
    { id: "bi", label: "Business operations", icon: "office", x: 24, y: 77, detail: "Approval work" },
    { id: "iti", label: "IT infrastructure", icon: "data", x: 76, y: 77, detail: issue === 1 ? "Cannot support the plan" : "Portal platform" },
  ];
  return <><Choices label="Choose an alignment mismatch" options={["Business and IT want different things", "IT’s foundations cannot support its plan"]} value={issue} onChange={setIssue} /><SceneMap nodes={nodes.map(n => ({ ...n, tone: (issue === 0 ? ["bs", "its"] : ["its", "iti"]).includes(n.id) ? "warn" : "dim" }))} links={issue === 0 ? [["bs", "its"]] : [["its", "iti"]]} label="Strategic Alignment Model links" /><Outcome title={issue === 0 ? "Repair functional integration" : "Repair strategic fit"}>{issue === 0 ? "The mismatch crosses business and IT. Their strategic directions need to fit together." : "The mismatch crosses strategy and infrastructure on the IT side. The foundations must support the intended strategy."} These names belong to SAM.</Outcome></>;
}

export function CityScene() {
  const [change, setChange] = useState(0);
  return <><Choices label="Choose a campus change" options={["Keep everything as-is", "Upgrade one connection", "Close everything and rebuild"]} value={change} onChange={setChange} /><div className={`xp-city change-${change}`} role="img" aria-label={change === 2 ? "All campus buildings closed for the proposed rebuild" : "Campus stays active while one connection is upgraded"}><div className="xp-road" /><div className="xp-road cross" /><div className="xp-bus" aria-hidden="true">▰</div>{["Library", "Classes", "Admissions", "IT"].map((name, i) => <div className={`xp-city-building b-${i}`} key={name}><Glyph name={i === 3 ? "app" : "office"} /><b>{name}</b><small>{change === 2 ? "Closed" : i === 3 && change === 1 ? "Upgrading" : "Operating"}</small></div>)}</div><Outcome title={["The city keeps moving", "One change, with its neighbors considered", "The thought experiment breaks down"][change]}>{["Waiting does not make new needs disappear. EA must account for evolution.", "Like city planning, EA works with incremental modifications while operations continue. Consider the neighboring systems and people.", "An enterprise cannot simply stop being a living socio-technical system. The lesson warns against planning it like a building that is designed once and then built."][change]}</Outcome></>;
}

const tools = [
  ["Is our strategy working?", "Balanced Scorecard", "Check Customer, Financial, Internal Business Processes, and Learning & Growth. EA is particularly useful in the last two.", "goal"],
  ["What business should we be able to do?", "Canvas → Business Architecture", "Sketch the business model, then plan capabilities: what the organization must do before choosing how to deliver it.", "office"],
  ["How can quality improve?", "EFQM / ISO 9001", "EFQM compares broad excellence with best practice. ISO 9001 sets criteria for a certifiable quality management system.", "shield"],
  ["Is IT controlled properly?", "COBIT", "IT governance links business risks, control needs, and technical issues. EA contributes structures and processes.", "shield"],
  ["Are IT services supported well?", "ITIL", "The supplied lesson describes delivery/support best practices. EA supplies the picture of IT assets, infrastructure, and processes.", "tool"],
  ["How mature is software development?", "CMMI", "Assess software engineering process maturity. This is a different question from governing IT as a whole.", "gear"],
];
export function ToolsScene() {
  const [i, setI] = useState(0);
  return <><Choices label="Choose a management problem" options={tools.map(t => t[0])} value={i} onChange={setI} /><div className="xp-tool-reveal"><Glyph name={tools[i][3]} /><span>Open the right tool</span><h4>{tools[i][1]}</h4><div className="xp-shared-base">EA · connected business + IT context</div></div><Outcome title="Why this tool?">{tools[i][2]}</Outcome></>;
}

export function BranchScene() {
  const [same, setSame] = useState(false);
  const [shared, setShared] = useState(false);
  const model = operatingModel(same, shared);
  const descriptions: Record<string, string> = { Diversification: "Different processes, separate data: diverse, independent units.", Replication: "Same processes, separate data: repeat a similar operation across independent units.", Coordination: "Different processes, shared data: diverse units coordinate through shared information.", Unification: "Same processes, shared data: similar, interdependent units operate together." };
  return <><div className="xp-switches"><button role="switch" aria-checked={same} onClick={() => setSame(!same)}><i aria-hidden="true" />Same process at every branch <b>{same ? "On" : "Off"}</b></button><button role="switch" aria-checked={shared} onClick={() => setShared(!shared)}><i aria-hidden="true" />Shared data across branches <b>{shared ? "On" : "Off"}</b></button></div><div className="xp-result-pill"><small>Your operating model</small><strong>{model}</strong></div><div className="xp-branches" aria-label="Branch behavior preview"><div className="xp-shop-row">{[0, 1, 2].map(n => <div className="xp-shop" key={n}><Glyph name="office" /><b>Branch {n + 1}</b><span className="xp-recipe" aria-label={same ? "Same process" : "Different process"}>{same ? "● → ◆ → ■" : ["● → ◆", "■ → ● → ◆", "◆ → ■"][n]}</span>{!shared && <small>Own records</small>}</div>)}</div>{shared && <div className="xp-shared-record"><span aria-hidden="true">↖ ↑ ↗</span><Glyph name="data" /><b>Shared records</b></div>}</div><Outcome title={model}>{descriptions[model]} Try toggling just one setting and see which property changes.</Outcome></>;
}

const requests = [
  ["Core enrollment must keep working", "Fundamental", "Needed for core business regardless of current strategy. Top-down.", "shield"],
  ["Support our new international-recruitment strategy", "Strategic", "Tied to the current strategy; if it changes, the system may lose its purpose. Top-down.", "goal"],
  ["One department needs a manuscript formatter", "Local", "A departmental need proposed bottom-up, reviewed for organization-wide importance.", "office"],
  ["An unexpected regulation requires action now", "Urgent", "An unplanned need forces action. Local and Urgent are the two bottom-up types in the lesson.", "clock"],
  ["Replace obsolete servers; add no new business feature", "Architectural", "Improves the IT landscape itself. Proposed by architects; no direct new business functionality.", "gear"],
];
export function InitiativeScene() {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  return <><Choices label="Incoming request" options={["Core system", "New strategy", "Department tool", "Surprise deadline", "Old servers"]} value={i} onChange={n => { setI(n); setOpen(false); }} /><button className={`xp-envelope ${open ? "opened" : ""}`} aria-expanded={open} onClick={() => setOpen(!open)}><Glyph name={requests[i][3]} /><span>Request {i + 1}</span><b>{requests[i][0]}</b><small>{open ? "Close request" : "Open to inspect the reason →"}</small></button>{open && <Outcome title={`${requests[i][1]} initiative`}>{requests[i][2]}</Outcome>}<p className="xp-small">A complete pitch also needs business need, goals, scope, business case, sponsors, and budget. These simplified requests isolate one classification clue.</p></>;
}

export function DependencyScene() {
  const [broken, setBroken] = useState(false);
  const [selected, setSelected] = useState("db");
  return <><button className="xp-action" onClick={() => setBroken(!broken)}>{broken ? "Restore the database" : "What if the database becomes unavailable?"}</button><SceneMap nodes={[
    { id: "db", label: "Database", icon: "data", x: 18, y: 55, tone: broken ? "warn" : "on" },
    { id: "app", label: "Enrollment app", icon: "app", x: 50, y: 28, tone: broken ? "warn" : undefined },
    { id: "work", label: "Enroll students", icon: "person", x: 82, y: 55, tone: broken ? "warn" : undefined },
  ]} links={[["db", "app"], ["app", "work"]]} onSelect={setSelected} label="Cross-domain dependency example" running={!broken} /><Outcome title={broken ? "The effect can cross domains" : "Tap a part, then test a change"}>{selected === "db" ? "Technical/data foundations support the application." : selected === "app" ? "The application connects the technical platform to business work." : "Business activity depends on supporting application functionality."} {broken ? "In this simplified example, enrollment may be affected. Real impact depends on actual dependencies, redundancy, and fallback processes." : "Naming the parts is only half the job: keep their relationships."}</Outcome></>;
}

export function LensScene() {
  const [role, setRole] = useState(0);
  const names = ["Dean", "Teacher", "IT specialist"];
  const concerns = ["Can we serve the expected number of students?", "Can I access my class and grades?", "Which systems and infrastructure support this?"];
  const visible = [["student", "budget", "classes"], ["student", "classes", "app"], ["app", "data", "classes"]][role];
  const nodes: MapNode[] = [
    { id: "student", label: "Students", icon: "person", x: 20, y: 22 },
    { id: "classes", label: "Classes", icon: "office", x: 50, y: 48 },
    { id: "budget", label: "Budget", icon: "document", x: 80, y: 22 },
    { id: "app", label: "Learning app", icon: "app", x: 20, y: 80 },
    { id: "data", label: "Infrastructure", icon: "data", x: 80, y: 80 },
  ];
  return <><Choices label="Choose whose concern to explore" options={names} value={role} onChange={setRole} /><div className="xp-speech"><Glyph name="person" /><div><small>{names[role]}’s question</small><b>“{concerns[role]}”</b></div></div><SceneMap nodes={nodes.map(n => ({ ...n, tone: visible.includes(n.id) ? "on" : "dim" }))} links={[["student", "classes"], ["budget", "classes"], ["app", "classes"], ["data", "app"]]} label={`${names[role]} view highlights relevant campus elements`} /><Outcome title="The lens changes; the underlying campus stays connected">Bright objects are the selected view. Faded objects are still part of the enterprise. These are original teaching selections, not fixed formal viewpoint definitions.</Outcome></>;
}
