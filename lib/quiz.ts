export function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function sample<T>(a: T[], n: number): T[] {
  return shuffle(a).slice(0, n);
}

/** Loose answer matching: case, punctuation, "&" vs "and", "6 to 12" vs "6-12". */
export function norm(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/–|—/g, "-")
    .replace(/\bto\b/g, "-")
    .replace(/[^a-z0-9]/g, "");
}

export const LETTERS = "ABCDEFGHIJKLMNOP".split("");
export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: ignore */
  }
}
