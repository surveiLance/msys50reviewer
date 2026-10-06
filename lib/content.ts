import fs from "node:fs";
import path from "node:path";

/** Reads a pre-rendered HTML fragment from /content at build time. */
export function readContent(subject: string, file: string): string {
  const p = path.join(process.cwd(), "content", subject, file);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}
