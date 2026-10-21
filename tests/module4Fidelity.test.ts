import { expect, test } from "vitest";
import { createHash } from "node:crypto";
import { readNotes } from "../lib/notes";
import raw from "../content/msys-50/data.json";
import { expandQuestionData } from "../content/msys-50/fresh";
import { poolModule, poolAlternativeModule, poolEssentialModule, type Pool } from "../lib/questions";
import { questionBank, questionKey } from "../convex/partyQuestions";
import type { SubjectData } from "../lib/types";

// These assertions consume the parsed material delivered to NotesReader/NotesPeek.
// They catch lost intersections and arrow directions, not editorial wording changes.
const parts = readNotes("msys-50", "module-4");
const html = parts.map(p => p.intro + p.sections.map(s => s.html).join("")).join("");
function figure(id: string) {
  const found = html.match(new RegExp(`<figure[^>]*id="${id}"[^>]*>[\\s\\S]*?</figure>`))?.[0];
  expect(found, `Reader must receive ${id}`).toBeDefined();
  return found!;
}
function edges(markup: string) {
  return [...markup.matchAll(/<path\b[^>]*data-from="([^"]+)"[^>]*data-to="([^"]+)"[^>]*>/g)].map(m => ({ from: m[1], to: m[2], tag: m[0] }));
}
const text = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

test("reader and notes-peek retain every Module 4 review destination and guide answer", () => {
  expect(parts.map(p => [p.id, p.sections.map(s => s.id)])).toEqual([
    ["p-4-1", ["p-4-1-s1", "p-4-1-s2", "p-4-1-s3", "p-4-1-s4", "p-4-1-s5"]],
    ["p-4-2", ["p-4-2-s1", "p-4-2-s2", "p-4-2-s3", "p-4-2-s4", "p-4-2-s5"]],
    ["p-4-3", Array.from({ length: 10 }, (_, i) => `p-4-3-s${i + 1}`)],
  ]);
  expect([...html.matchAll(/<details class="qa">/g)]).toHaveLength(22);
  expect([...html.matchAll(/<div class="qa-a">/g)]).toHaveLength(22);
});

test("MDA exposes mappings both ways between adjacent models, with accessible examples", () => {
  const mda = figure("m4-mda-mappings");
  expect(mda).toMatch(/<svg[^>]*role="img"[^>]*aria-labelledby=/);
  const links = edges(mda);
  expect(links.map(e => [e.from, e.to])).toEqual([["CIM", "PIM"], ["PIM", "PSM"]]);
  for (const { tag } of links) {
    expect(tag).toMatch(/marker-start="url\(#/);
    expect(tag).toMatch(/marker-end="url\(#/);
  }
  // Supplied slide 17 distinguishes workflow-engine independence from a Java model.
  expect(text(mda)).toContain("BPMN");
  expect(text(mda)).toContain("WS-BPEL");
  expect(text(mda)).toContain("Java");
});

test("Zachman's academic example preserves all six question intersections per perspective", () => {
  const grid = figure("m4-zachman-grid");
  const rows = [...grid.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m => [...m[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g)].map(c => text(c[1])));
  expect(rows).toHaveLength(7);
  expect(rows[0].slice(1)).toEqual(["What? Data", "How? Function", "Where? Network", "Who? People", "When? Time", "Why? Motivation"]);
  expect(rows.slice(1).every(r => r.length === 7 && r.every(Boolean))).toBe(true);
  expect(rows.slice(1).map(r => r[0])).toEqual(["Planner Scope", "Owner Business concepts", "Designer System logic", "Builder Tech physics", "Technician Components", "User Operations"]);
});

test("TOGAF overview retains the slide's business framing and nested supporting components", () => {
  const overview = figure("m4-togaf-components");
  expect(overview).toMatch(/<svg[^>]*role="img"[^>]*aria-labelledby=/);
  const labels = text(overview);
  for (const phrase of ["Business Vision and Drivers", "Business Capabilities", "ADM Guidelines and Techniques", "Architecture Content Framework", "TOGAF Reference Models"]) expect(labels).toContain(phrase);
});

test("ADM is a closed A-H cycle with two-way Requirements Management spokes and Preliminary link", () => {
  const adm = figure("m4-adm-cycle");
  const links = edges(adm);
  const cycle = links.filter(e => /^[A-H]$/.test(e.from) && /^[A-H]$/.test(e.to));
  expect(cycle.map(e => `${e.from}-${e.to}`)).toEqual(["A-B", "B-C", "C-D", "D-E", "E-F", "F-G", "G-H", "H-A"]);
  for (const { tag } of cycle) expect(tag).toMatch(/marker-end="url\(#/);
  const spokes = links.filter(e => e.from === "Requirements");
  expect(spokes.map(e => e.to).sort()).toEqual(["A", "B", "C", "D", "E", "F", "G", "H"]);
  const preliminary = links.find(e => e.from === "Preliminary" && e.to === "A");
  expect(preliminary).toBeDefined();
  for (const { tag } of [...spokes, preliminary!]) {
    expect(tag).toMatch(/marker-start="url\(#/);
    expect(tag).toMatch(/marker-end="url\(#/);
  }
});

test("CSVLOD matrix associates each artifact with the correct focus and planning category", () => {
  const matrix = figure("m4-csvlod-matrix");
  const body = matrix.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? "";
  const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m => [...m[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g)].map(c => text(c[1])));
  expect(rows.map(r => r.map(c => c.split(" — ")[0]))).toEqual([
    ["Business-focused", "Considerations", "Visions", "Outlines"],
    ["IT-focused", "Standards", "Landscapes", "Designs"],
  ]);
  const headings = [...matrix.matchAll(/<th scope="col">([\s\S]*?)<\/th>/g)].map(m => text(m[1]));
  expect(headings).toEqual(["How? Focus / audience", "Rules", "Structures", "Changes"]);
});

test("the fidelity pass preserves the identities used by saved quiz rotation and known-card progress", () => {
  const data = expandQuestionData(raw as unknown as SubjectData);
  const pool = poolModule(data.tests["module-4"], "module-4", data.multi?.["module-4"], data.blanks?.["module-4"]);
  const ids = (p: Pool) => Object.values(p).flat().map(q => q.id).sort();
  const hash = (items: unknown) => createHash("sha256").update(JSON.stringify(items)).digest("hex");
  // Captured from the pre-edit banks at 25d90ba; exclude shuffled options and editable explanations.
  // These identities are an explicit compatibility contract, not a prose snapshot.
  expect({
    original: hash(ids(pool)),
    alternative: hash(ids(poolAlternativeModule(data.alternative?.["module-4"], "module-4"))),
    essential: hash(ids(poolEssentialModule(data.essentials?.["module-4"], "module-4"))),
    matchingRows: hash(pool.match.flatMap(q => q.kind === "match" ? q.rows.map(r => q.id + ":" + r.prompt + ":" + r.answer) : []).sort()),
    cardOrder: hash(data.cards["module-4"].map(c => c.slice(0, 2))),
    battle: hash(questionBank().filter(q => q.module === "M4").map(questionKey).sort()),
  }).toEqual({
    original: "58f27d186667509285070a1bdfbc86f5a85cf406847eb8019d1ed43241e24055",
    alternative: "2b7a375ebcfded09d581f20f1cb963f2c127382462226d159559394288b2e44a",
    essential: "672486291e40cf02d485f77ce7f31e4f56fd656c1ca393fd563adc8b13eae3f9",
    matchingRows: "6bf4206c16829fe1ae8f6fa45694b9daf1fef5e60123331eb2ae668bb8797ffa",
    cardOrder: "ea56cdac853634d2785f473a05e23ffd6f9b890aef32be1fa40dea5973f373af",
    battle: "fc788b208452305e58007f67e4a7f309dd5ab243b3decafb80f061ca881240af",
  });
});

test("generated subtype quiz answers match all 24 classifications in the supplied lecture", () => {
  const data = expandQuestionData(raw as unknown as SubjectData);
  const pool = poolModule(data.tests["module-4"], "module-4", data.multi?.["module-4"], data.blanks?.["module-4"]);
  const groups: [string, string[]][] = [
    ["Considerations", ["Principles", "Policies", "Conceptual Data Models", "Analytical Reports", "Direction Statements"]],
    ["Standards", ["Technology Reference Models", "Guidelines", "Patterns", "IT Principles", "Logical Data Models"]],
    ["Visions", ["Business Capability Models", "Roadmaps", "Target States", "Value Chains", "Context Diagrams"]],
    ["Landscapes", ["Landscape Diagrams", "Inventories", "Enterprise Systems Portfolios", "IT Roadmaps"]],
    ["Outlines", ["Solution Overviews", "Options Assessments", "Initiative Proposals"]],
    ["Designs", ["Solution Designs", "Preliminary Solution Designs"]],
  ];
  for (const [parent, terms] of groups) for (const term of terms) {
    const q = pool.mc.find(q => q.prompt.startsWith(`In CSVLOD, which general type contains ${term},`));
    expect(q?.kind).toBe("mc");
    if (q?.kind === "mc") { expect(q.answer, term).toBe(parent); expect(q.options).toContain(parent); }
  }
});
