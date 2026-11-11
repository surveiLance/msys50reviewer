"use client";

import React, { useState } from "react";
import { artifactSubtypes } from "@/content/msys-50/module4";
import { analysisResult, enrollmentTrace } from "@/lib/studyStories";
import { Choices, Glyph, Outcome, SceneMap } from "./StudyCanvas";

export function ZachmanScene() {
  const [q, setQ] = useState(0);
  const [perspective, setPerspective] = useState(0);
  const questions = ["What?", "How?", "Where?", "Who?", "When?", "Why?"];
  const owner = ["Enrollment records & degree requirements", "Admissions & grading processes", "Campus layout & online portals", "Departments & faculty/student roles", "Timetables & exam periods", "Strategic goals & educational policies"];
  const builder = ["SQL tables & data dictionaries", "Specific software modules", "Network configurations & server racks", "SSO & directory groups", "System timing & batch schedules", "Implementation strategies & technology standards"];
  return <><Choices label="Choose the artifact question" options={questions} value={q} onChange={setQ} /><Choices label="Choose a perspective from the academic example" options={["Owner · business concepts", "Builder · technology"]} value={perspective} onChange={setPerspective} /><div className="xp-document"><div className="xp-document-tab">Zachman · one intersection</div><Glyph name="document" /><h4>{(perspective === 0 ? owner : builder)[q]}</h4><div className="xp-stamps"><span>{questions[q]} · {["Data", "Function", "Network", "People", "Time", "Motivation"][q]}</span><span>{perspective === 0 ? "Owner" : "Builder"}</span></div></div><Outcome title="Two coordinates, one description">Change the question or the perspective; a different kind of artifact becomes relevant. These two perspectives sample the supplied academic example. The full notes keep the different source row sets distinct.</Outcome></>;
}

export function MdaScene() {
  const [level, setLevel] = useState(0);
  return <><Choices label="Choose the MDA abstraction level" options={["CIM · business need", "PIM · solution logic", "PSM · chosen platform"]} value={level} onChange={setLevel} /><SceneMap nodes={[
    { id: "person", label: level === 0 ? "Student needs a place" : "Application request", icon: level === 0 ? "person" : "document", x: 20, y: 40 },
    { id: "work", label: level === 0 ? "Admit eligible students" : "Check → decide → notify", icon: "gear", x: 50, y: 70 },
    { id: "result", label: level === 2 ? "Java-platform model" : level === 1 ? "No platform chosen" : "Business requirements", icon: level === 2 ? "app" : "goal", x: 80, y: 40, tone: "on" },
  ]} links={[["person", "work"], ["work", "result"]]} label="Original admissions analogy for MDA abstraction levels" /><Outcome title={["Describe the problem", "Describe platform-independent solution logic", "Add platform-specific detail"][level]}>{["CIM captures domain/business context and requirements without committing to a computational implementation.", "PIM describes solution logic without choosing a particular platform or workflow engine.", "PSM describes the solution for a chosen platform. Mappings provide rules and techniques for translating models."][level]} This is an original admissions example; MDA alone is too IT-centric to cover EA.</Outcome></>;
}

export function SoaScene() {
  const [inside, setInside] = useState(false);
  return <><button className="xp-action" onClick={() => setInside(!inside)}>{inside ? "Look from the consumer’s side" : "Open the implementation behind the service"}</button><div className="xp-service-door"><div className="xp-consumer"><Glyph name="person" /><b>Request a capability</b></div><span className="xp-link-label">uses →</span><div className="xp-door"><Glyph name="shield" /><b>Defined service interface</b><small>Agreed behavior / contract</small></div><div className={`xp-behind ${inside ? "revealed" : ""}`}><Glyph name={inside ? "gear" : "shield"} /><b>{inside ? "Implementation" : "Behind the contract"}</b><small>{inside ? "Internal components perform the work" : "Consumer need not know the internals"}</small></div></div><Outcome title={inside ? "Keep the promise stable when internals change" : "Expose useful capability through a defined contract"}>Service orientation supports reuse and looser coupling. The consumer relies on the defined service; the implementation still has to fulfill it. It does not eliminate all dependencies.</Outcome></>;
}

const phases = [
  ["A", "Architecture Vision", "Set vision, scope, stakeholders, limitations, and approvals."],
  ["B", "Business Architecture", "Develop the business architecture based on the vision."],
  ["C", "Information Systems Architectures", "Develop both Data and Application architectures."],
  ["D", "Technology Architecture", "Develop the infrastructure and technology architecture."],
  ["E", "Opportunities and Solutions", "Identify solution opportunities and delivery vehicles; start implementation planning."],
  ["F", "Migration Planning", "Plan the transition from baseline to target."],
  ["G", "Implementation Governance", "Oversee implementation conformance to architecture."],
  ["H", "Architecture Change Management", "Manage changes to the architecture."],
];
export function AdmScene() {
  const [phase, setPhase] = useState(0);
  return <><button className="xp-preliminary" aria-pressed={phase === 8} onClick={() => setPhase(8)}>Before the orbit: Preliminary → prepare capability & tailor the framework</button><div className="xp-orbit" role="group" aria-label="Explore ADM phases"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="37" />{phases.map((_, i) => <path key={i} d={`M50 50 L${50 + 37 * Math.sin(i * Math.PI / 4)} ${50 - 37 * Math.cos(i * Math.PI / 4)}`} />)}</svg><div className="xp-orbit-center"><Glyph name="document" /><b>Requirements<br />Management</b><small>Throughout</small></div>{phases.map(([letter, name], i) => <button key={letter} aria-label={`${letter} · ${name}`} aria-pressed={phase === i} style={{ left: `${50 + 37 * Math.sin(i * Math.PI / 4)}%`, top: `${50 - 37 * Math.cos(i * Math.PI / 4)}%` }} onClick={() => setPhase(i)}>{letter}</button>)}</div><Outcome title={phase === 8 ? "Preliminary" : `${phases[phase][0]} · ${phases[phase][1]}`}>{phase === 8 ? "Establish architecture capability and customize the framework before applying the cycle." : phases[phase][2]} You can revisit phases and tailor iterations; the spokes represent ongoing requirements work.</Outcome></>;
}

const types = [["Considerations", "Standards"], ["Visions", "Landscapes"], ["Outlines", "Designs"]];
export function ArtifactScene() {
  const [decision, setDecision] = useState(0);
  const [audience, setAudience] = useState(0);
  const [document, setDocument] = useState(0);
  const type = types[decision][audience];
  const documents = artifactSubtypes.filter(a => a[1] === type);
  const current = documents[Math.min(document, documents.length - 1)];
  const choose = (change: () => void) => { change(); setDocument(0); };
  return <><Choices label="Which decision are the artifacts for?" options={["Set the rules", "Understand the big picture", "Plan one change"]} value={decision} onChange={i => choose(() => setDecision(i))} /><Choices label="How is it described and used?" options={["Shared business language", "Technical IT language"]} value={audience} onChange={i => choose(() => setAudience(i))} /><div className="xp-artifact-desk"><div className="xp-desk-label"><Glyph name={decision === 0 ? "shield" : decision === 1 ? "office" : "tool"} /><div><small>{["Rules", "Structures", "Changes"][decision]} · {audience === 0 ? "Business-focused" : "IT-focused"}</small><h4>{type}</h4><span>{audience === 0 ? "Dual · business + IT understanding" : "IT-focused · not dual"}</span></div></div><div className="xp-file-tabs" role="group" aria-label={`${type} subtypes`}>{documents.map(([name], i) => <button key={name} aria-pressed={document === i} onClick={() => setDocument(i)}><Glyph name="document" /><span>{name}</span></button>)}</div><div className="xp-open-file" role="status"><small>{current[2] ?? "Popularity not labeled on the slide"} · 4.3 slide {current[4]}</small><h4>{current[0]}</h4><p>{current[3]}.</p></div></div><Outcome title="Remember the decision, then the document">{decision === 0 ? "Rules guide consistent decisions." : decision === 1 ? "Structures describe high-level elements and relationships." : "Changes concern concrete incremental initiatives."} {type === "Visions" ? "Visions generally look 3–5 years ahead, but its Context Diagrams describe current flows. Purpose and audience matter too." : type === "Landscapes" ? "Landscapes often describe current IT, but IT Roadmaps describe technical future plans." : type === "Designs" ? "Both Solution Designs and Preliminary Solution Designs concern approved solutions; detail distinguishes them." : "Select each folder to explore its subtypes."}</Outcome></>;
}

export function AnalysisScene() {
  const [result, setResult] = useState(0);
  const [approach, setApproach] = useState(0);
  const [eligible, setEligible] = useState(true);
  const [progress, setProgress] = useState(0);
  const trace = enrollmentTrace(eligible);
  const complete = progress === trace.steps.length;
  const minutes = trace.durations.slice(0, progress).reduce((a, b) => a + b, 0);
  return <>
    <div className="xp-experiment-controls"><span className="xp-step-label">1 · What do you want to know?</span><Choices label="Result sought" options={["Can the process work?", "How long does it take?"]} value={result} onChange={i => { setResult(i); setProgress(0); }} /><span className="xp-step-label">2 · How will you investigate?</span><Choices label="Analysis approach" options={["Reason from the model", "Run the model"]} value={approach} onChange={i => { setApproach(i); setProgress(0); }} /></div>
    <div className="xp-switches"><button role="switch" aria-checked={eligible} onClick={() => { setEligible(!eligible); setProgress(0); }}><i aria-hidden="true" />Applicant meets eligibility rules <b>{eligible ? "Yes" : "No"}</b></button></div>
    <div className="xp-experiment">
      <div className="xp-track" aria-label="Illustrative enrollment model">{["Apply", "Check eligibility", "Confirm"].map((step, i) => <React.Fragment key={step}>{i > 0 && <i aria-hidden="true">→</i>}<span className={progress > i ? "visited" : ""}><Glyph name={["document", "shield", "person"][i]} /><b>{step}</b><small>{[2, 3, 1][i]} min wait*</small></span></React.Fragment>)}{progress > 0 && approach === 1 && <div className="xp-traveler" style={{ left: `${12 + (progress - 1) * 38}%` }} aria-hidden="true">●</div>}</div>
      <div className="xp-instrument"><Glyph name={result === 0 ? "shield" : "clock"} /><b>{result === 0 ? complete ? trace.confirmed ? "Confirmation reached ✓" : "Stopped as the rule requires" : "Can confirmation be reached?" : `${minutes} illustrative minutes waiting`}</b><span>{progress === 0 ? "Toy model · fixed assumptions" : approach === 0 ? result === 1 ? `${trace.durations.join(" + ")} = ${minutes} minutes waiting` : eligible ? "Eligibility holds, so the confirmation path is available." : "Eligibility fails, so this path cannot reach confirmation." : `${trace.steps[progress - 1]} ${complete ? "· model run finished" : "· next, follow the next modeled step"}`}</span></div>
      <button className="xp-action" onClick={() => setProgress(complete ? 0 : approach === 0 ? trace.steps.length : progress + 1)}>{complete ? "Reset the experiment" : approach === 0 ? "Inspect the reasoning" : progress === 0 ? "Try a modeled applicant" : "Advance modeled applicant →"}</button>
    </div>
    <Outcome title={`${result === 0 ? "Functional" : "Quantitative"} · ${approach === 0 ? "Analytical" : "Simulation"}`}>{progress > 0 ? analysisResult(result === 0 ? "functional" : "quantitative", approach === 0 ? "analytical" : "simulation", eligible).result : "Choose the question and approach, then try the experiment."} {result === 0 ? "This is about behavior/correctness. Correct behavior includes refusing an ineligible applicant." : "This is about a numerical property, such as performance; reliability and cost are other examples."}</Outcome>
    <p className="xp-small">*Original toy model. The fixed 2/3/1-minute waits are invented to explain the approaches. They are not real enrollment measurements or performance predictions. A real model requires validated assumptions.</p>
  </>;
}

export function ZoomScene() {
  const [detail, setDetail] = useState(false);
  return <><Choices label="Change the level of detail" options={["Zoom out · abstract", "Zoom in · refine"]} value={detail ? 1 : 0} onChange={i => setDetail(i === 1)} /><div className={`xp-zoom ${detail ? "expanded" : ""}`}><div className="xp-zoom-parent"><Glyph name="office" /><b>Enrollment</b></div>{detail && <div className="xp-zoom-children">{["Apply", "Check eligibility", "Approve", "Confirm"].map((step, i) => <span key={step}><i>{i + 1}</i><b>{step}</b></span>)}</div>}</div><Outcome title={detail ? "Refinement opens up the relevant detail" : "Abstraction preserves the big idea"}>{detail ? "The high-level activity is decomposed into a more detailed sequence. Whether this detail helps depends on the question." : "The whole sequence is represented as Enrollment. This is a simpler level of description, not a claim that the work vanished."} Modeling activities describe the work you do; actions describe changes to the model.</Outcome></>;
}

export function CoverageScene() {
  const [scope, setScope] = useState(0);
  const nodes = [
    { id: "business-work", label: "Business work", icon: "person", x: 24, y: 18 },
    { id: "business-info", label: "Business information", icon: "document", x: 76, y: 18 },
    { id: "app-work", label: "Application behavior", icon: "app", x: 24, y: 50 },
    { id: "app-info", label: "Application information", icon: "data", x: 76, y: 50 },
    { id: "tech-work", label: "Technology behavior", icon: "gear", x: 24, y: 82 },
    { id: "tech-info", label: "Technology information", icon: "data", x: 76, y: 82 },
  ];
  const lit = scope === 0 ? ["app-work"] : scope === 1 ? ["business-work", "app-work", "tech-work"] : nodes.map(n => n.id);
  return <><Choices label="Expand the spotlight coverage" options={["One layer, one aspect", "Follow one aspect across layers", "Connect several layers and aspects"]} value={scope} onChange={setScope} /><SceneMap nodes={nodes.map(n => ({ ...n, tone: lit.includes(n.id) ? "on" as const : "dim" as const }))} links={scope === 0 ? [] : scope === 1 ? [["business-work", "app-work"], ["app-work", "tech-work"]] : [["business-work", "app-work"], ["app-work", "tech-work"], ["business-info", "app-info"], ["app-info", "tech-info"], ["app-work", "app-info"]]} label={`${["Details", "Coherence", "Overview"][scope]} spotlight example`} /><Outcome title={["Details", "Coherence", "Overview"][scope]}>{["Keep to one layer and one aspect.", "Expand one dimension. This example follows one aspect across layers; multiple aspects within one layer also count as Coherence.", "Broaden both dimensions: multiple layers and multiple aspects. You do not have to include every possible element."][scope]} The labels here are illustrative; the complete notes retain the source distinction.</Outcome></>;
}

export function ServicesScene() {
  const [side, setSide] = useState(0);
  return <><Choices label="Follow a service relationship" options={["What implements it?", "Who uses it?", "See both connections"]} value={side} onChange={setSide} /><SceneMap nodes={[
    { id: "sis", label: "SIS", icon: "app", x: 20, y: 30, detail: "Application component", tone: side === 1 ? "dim" : "on" },
    { id: "service", label: "Student Registration", icon: "gear", x: 50, y: 72, detail: "Application service", tone: "on" },
    { id: "work", label: "Enroll & Schedule", icon: "person", x: 80, y: 30, detail: "Business process", tone: side === 0 ? "dim" : "on" },
  ]} links={side === 0 ? [["sis", "service", "realizes"]] : side === 1 ? [["service", "work", "serves"]] : [["sis", "service", "realizes"], ["service", "work", "serves"]]} label="Academic model realization and serving relationships" /><div className="xp-relation-labels">{side !== 1 && <span>SIS <b>realizes →</b> Student Registration Service</span>}{side !== 0 && <span>Student Registration Service <b>serves →</b> Enroll &amp; Schedule</span>}</div><Outcome title={side === 0 ? "Realizes = fulfills / implements" : side === 1 ? "Serves = provides functionality to" : "One service, two different relationships"}>These links are from the supplied academic model. They express architectural relationships rather than a timeline. Active structure performs behavior; passive structure is what behavior accesses or acts on.</Outcome></>;
}
