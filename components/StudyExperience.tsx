"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { NotePart } from "@/lib/notes";
import { storiesForModule, storyForSection, studyLocation, type SceneKind } from "@/lib/studyStories";
import NotesReader from "./NotesReader";
import Module5Learning from "./Module5Learning";
import { AlignmentScene, BranchScene, CampusScene, CityScene, DependencyScene, InitiativeScene, LensScene, ToolsScene } from "./StudyScenesFoundation";
import { AdmScene, AnalysisScene, ArtifactScene, CoverageScene, MdaScene, ServicesScene, SoaScene, ZachmanScene, ZoomScene } from "./StudyScenesMethods";

function Scene({ kind }: { kind: SceneKind }) {
  const scenes: Record<SceneKind, React.ComponentType> = { campus: CampusScene, alignment: AlignmentScene, city: CityScene, tools: ToolsScene, branches: BranchScene, initiatives: InitiativeScene, dependencies: DependencyScene, lenses: LensScene, zachman: ZachmanScene, mda: MdaScene, soa: SoaScene, adm: AdmScene, artifacts: ArtifactScene, analysis: AnalysisScene, zoom: ZoomScene, coverage: CoverageScene, services: ServicesScene };
  const Component = scenes[kind];
  return <Component />;
}

export default function StudyExperience({ moduleNum, parts, children }: { moduleNum: number; parts: NotePart[]; children?: React.ReactNode }) {
  const stories = storiesForModule(moduleNum);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"explore" | "notes" | "guided">("explore");
  const title = useRef<HTMLHeadingElement>(null);
  const initial = useRef(true);
  const story = stories[index];

  useEffect(() => {
    const fromHash = () => {
      const next = studyLocation(moduleNum, parts, location.hash);
      setIndex(next.index); setMode(next.mode);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    window.addEventListener("popstate", fromHash);
    return () => { window.removeEventListener("hashchange", fromHash); window.removeEventListener("popstate", fromHash); };
  }, [moduleNum, parts]);

  useEffect(() => {
    if (initial.current) { initial.current = false; return; }
    if (mode !== "explore") return;
    title.current?.focus({ preventScroll: true });
    title.current?.scrollIntoView({ block: "start" });
  }, [index, mode]);

  const explore = useCallback((part: string, section?: string) => {
    const found = storyForSection(moduleNum, part, section);
    if (!found) return;
    const all = storiesForModule(moduleNum);
    setIndex(all.findIndex(s => s.id === found.id));
    history.pushState(null, "", `#explore-${found.id}`);
    setMode("explore");
  }, [moduleNum]);
  const choose = (i: number) => { setIndex(i); setMode("explore"); history.pushState(null, "", `#explore-${stories[i].id}`); };
  const openNotes = () => { history.pushState(null, "", `#p-${story.part.replace(".", "-")}-s${story.section}`); setMode("notes"); };

  if (mode === "notes") return <><div className="xp-return"><button className="btn primary" onClick={() => choose(studyLocation(moduleNum, parts, location.hash).index)}>← Learn by doing</button><span>Full notes · use “Explore this idea” beside any section</span></div><NotesReader parts={parts} moduleNum={moduleNum} onExplore={explore}>{children}</NotesReader></>;
  if (mode === "guided") return <><div className="xp-return"><button className="btn" onClick={() => choose(index)}>← Interactive examples</button></div><Module5Learning parts={parts} focusOnMount>{children}</Module5Learning></>;
  const localStories = stories.filter(s => s.part === story.part);
  return <section className="experience" aria-label={`Module ${moduleNum} learn by doing`}>
    <header className="xp-header"><div><span className="eyebrow">Module {moduleNum} · Learn by doing</span><h2>Make the idea click.</h2><p>Try a change. Follow what happens.</p></div><button className="btn" onClick={openNotes}>Full notes &amp; guide answers</button></header>
    <nav className="xp-parts" aria-label={`Module ${moduleNum} learning parts`}>{parts.map(p => <button key={p.id} aria-current={p.num === story.part ? "page" : undefined} onClick={() => choose(stories.findIndex(s => s.part === p.num))}><b>{p.num}</b><span>{p.title.replace(/&amp;/g, "&").replace(/<[^>]+>/g, "")}</span></button>)}</nav>
    {localStories.length > 1 && <nav className="xp-topics" aria-label="Choose an interactive example">{localStories.map(s => <button key={s.id} aria-current={s.id === story.id ? "step" : undefined} onClick={() => choose(stories.findIndex(item => item.id === s.id))}>{s.title}</button>)}</nav>}
    <article className="xp-stage" id={`explore-${story.id}`} key={story.id}>
      <div className="xp-stage-heading"><span className="eyebrow">Explore {story.part}</span><h3 ref={title} tabIndex={-1}>{story.title}</h3><p>{story.invitation}</p></div>
      <div className="xp-playground"><Scene kind={story.kind} /></div>
      <div className="xp-takeaway"><small>The idea to take with you</small><p>{story.takeaway}</p></div>
      <footer className="xp-footer"><button className="xp-text-button" onClick={openNotes}>All details from this lesson ↗</button><div><button className="btn" disabled={index === 0} onClick={() => choose(index - 1)}>← Previous</button>{index < stories.length - 1 ? <button className="btn primary" onClick={() => choose(index + 1)}>Next example →</button> : <button className="btn primary" onClick={openNotes}>Open complete lesson →</button>}</div></footer>
    </article>
    <p className="xp-boundary">Original learning examples grounded in your notes. Use the complete lesson for every list, source diagram, and guide answer.</p>
    {moduleNum === 5 && <button className="xp-text-button" onClick={() => { history.pushState(null, "", location.pathname); setMode("guided"); }}>More step-by-step explanations for Module 5 →</button>}
    {children}
  </section>;
}
