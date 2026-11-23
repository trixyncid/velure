export const genders = [
  { value: "FEMALE", label: "Women" },
  { value: "MALE", label: "Men" },
  { value: "UNISEX", label: "Unisex" },
] as const;

export type GenderValue = (typeof genders)[number]["value"];

export const MAX_CHARACTER_LENGTH = 160;
export const MAX_NOTES_PER_TIER = 12;
export const MAX_NOTE_LENGTH = 40;

/** "Bergamot, Grapefruit" → ["Bergamot", "Grapefruit"]: trimmed, de-duplicated, order kept. */
export function parseNotesInput(value: string) {
  const seen = new Set<string>();
  const notes: string[] = [];
  for (const part of value.split(/[,;\n]/)) {
    const note = part.replace(/\s+/g, " ").trim();
    const key = note.toLowerCase();
    if (!note || seen.has(key)) continue;
    seen.add(key);
    notes.push(note);
  }
  return notes;
}

export const MAX_PHOTOGRAPHS = 8;
export const MAX_NAME_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 4000;
/** Prices are whole Rupiah. */
export const MAX_PRICE = 1_000_000_000;
export const MAX_DISCOUNT = 90;

export type Photograph = {
  fileKey: string;
  fileType: string;
  fileSize: number;
  url: string | null;
};

export type Fragrance = {
  id: string;
  name: string;
  description: string;
  genders: GenderValue[];
  /** Whole Rupiah, or null when the price is shared on request. */
  price: number | null;
  /** Percent off the price, 0–90. */
  discount: number | null;
  bestSeller: boolean;
  /** Scent profile: how it smells, for the shop's detail view and scent finder. */
  /** The scents it has (Scent ids), for the shop's scent finder. */
  scentIds: string[];
  character: string;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  updatedAt: string;
  images: Photograph[];
};

export function genderLabel(value: string) {
  return genders.find((gender) => gender.value === value)?.label ?? value;
}

export function isGenderValue(value: string): value is GenderValue {
  return genders.some((gender) => gender.value === value);
}

/** Price after the percentage discount, rounded to whole Rupiah. */
export function salePrice(price: number, discount: number | null) {
  if (!discount || discount <= 0) return price;
  return Math.round((price * (100 - discount)) / 100);
}
