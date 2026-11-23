import type { NoteTier, ScentNotes } from "@/lib/landing/types";

/**
 * Reads structured scent details out of the CMS description field.
 *
 * The admin can write labelled lines anywhere in the description, for example:
 *
 *   Karakter Aroma: Warm Spicy, Woody & Leathery
 *   Top Notes: Bergamot, Grapefruit
 *   Middle Notes: Leather, Pine
 *   Base Notes: Oakmoss, Amber
 *   Ukuran: Eau de Parfum 30ml
 *
 * A label may also sit on its own line, followed by a bulleted list. Everything
 * that is not a labelled line stays as the prose description.
 */

type Field = NoteTier | "character" | "size";

const LABELS: { field: Field; pattern: RegExp }[] = [
  { field: "top", pattern: /^(top|head|nada\s+atas|aroma\s+atas|not\s+atas)(\s+notes?)?$/i },
  {
    field: "middle",
    pattern: /^(middle|mid|heart|nada\s+tengah|aroma\s+tengah|not\s+tengah)(\s+notes?)?$/i,
  },
  { field: "base", pattern: /^(base|bottom|nada\s+dasar|aroma\s+dasar|not\s+dasar)(\s+notes?)?$/i },
  { field: "character", pattern: /^(karakter(\s+aroma)?|character|scent\s+character)$/i },
  { field: "size", pattern: /^(ukuran|size|volume|isi)$/i },
];

const BULLET = /^\s*(?:[-*•·▪◦–—]|\d+[.)])\s+/;

function matchLabel(text: string): Field | null {
  const cleaned = text.replace(/[*_#]/g, "").trim();
  return LABELS.find((label) => label.pattern.test(cleaned))?.field ?? null;
}

/** Splits "Bergamot, Grapefruit & Pine" (string, bullets or array) into clean note names. */
export function parseNoteList(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join("\n") : value;
  const seen = new Set<string>();
  const notes: string[] = [];
  for (const part of raw.split(/[,;|•·▪◦\n/]+|\s+&\s+|\s+dan\s+|\s+and\s+/i)) {
    const note = part
      .replace(BULLET, "")
      .replace(/^[\s\-–—*]+|[\s.]+$/g, "")
      .trim();
    const key = note.toLowerCase();
    if (!note || note.length > 48 || seen.has(key)) continue;
    seen.add(key);
    notes.push(note);
  }
  return notes;
}

export type ParsedDescription = {
  prose: string;
  character: string;
  size: string | null;
  notes: ScentNotes;
};

export function parseDescription(description: string | null | undefined): ParsedDescription {
  const collected: Record<Field, string[]> = { top: [], middle: [], base: [], character: [], size: [] };
  const prose: string[] = [];
  let open: Field | null = null;

  for (const line of (description ?? "").replace(/\r/g, "").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      open = null;
      prose.push("");
      continue;
    }

    // "Label: value" or "Label - value" on one line.
    const inline = trimmed.replace(BULLET, "").match(/^([^:=]{2,28}?)\s*(?::|=|\s[-–—]\s)\s*(.*)$/);
    const inlineField = inline ? matchLabel(inline[1]) : null;
    if (inline && inlineField) {
      if (inline[2].trim()) collected[inlineField].push(inline[2].trim());
      open = inlineField;
      continue;
    }

    // A bare label on its own line opens a list.
    const bare = matchLabel(trimmed.replace(BULLET, ""));
    if (bare) {
      open = bare;
      continue;
    }

    // Bulleted lines directly under a label belong to it.
    if (open && BULLET.test(line)) {
      collected[open].push(trimmed.replace(BULLET, ""));
      continue;
    }

    open = null;
    prose.push(trimmed);
  }

  return {
    prose: prose.join("\n").replace(/\n{3,}/g, "\n\n").trim(),
    character: collected.character.join(", ").trim(),
    size: collected.size.join(" ").trim() || null,
    notes: {
      top: parseNoteList(collected.top),
      middle: parseNoteList(collected.middle),
      base: parseNoteList(collected.base),
    },
  };
}

/** First sentences of a description, cut on a sentence or word boundary. */
export function excerpt(text: string, max = 180) {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const sentence = cut.lastIndexOf(". ");
  if (sentence > max * 0.5) return cut.slice(0, sentence + 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}
