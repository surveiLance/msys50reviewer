import { readContent } from "./content";

export type NoteSection = { id: string; title: string; html: string };
export type NotePart = { id: string; num: string; title: string; intro: string; sections: NoteSection[] };

/**
 * Splits a module's pre-built notes HTML into parts (h2, e.g. "1.1") and sections (h3),
 * so the reader can show one part at a time with an outline that tracks where you are.
 * Expects `<h2 id="p-1-1"><span class="tag">PART 1.1</span>Title</h2>` and plain `<h3>`s.
 */
export function readNotes(subject: string, module: string): NotePart[] {
  const html = readContent(subject, `${module}.html`)
    .replace(/<nav class="partnav"[\s\S]*?<\/nav>/, ""); // replaced by the reader's own part tabs
  const h2 = /<h2 id="([^"]+)"><span class="tag">PART ([\d.]+)<\/span>([\s\S]*?)<\/h2>/g;
  const heads = [...html.matchAll(h2)];
  return heads.map((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index ?? html.length : html.length;
    const chunk = html.slice(start, end);
    const pieces = chunk.split(/<h3>/);
    const intro = pieces.shift() || "";
    const sections = pieces.map((p, si) => {
      const close = p.indexOf("</h3>");
      return { id: `${m[1]}-s${si + 1}`, title: p.slice(0, close).trim(), html: p.slice(close + 5) };
    });
    return { id: m[1], num: m[2], title: m[3].trim(), intro, sections };
  });
}

