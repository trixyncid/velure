/**
 * Visual themes for the landing page, keyed by product slug (the slugified CMS name).
 *
 * Everything here is presentation only. Product content (name, description, price,
 * gender, images) always comes from the CMS. `character` and `genderTag` are used
 * only when the CMS has nothing for that product yet.
 *
 * A perfume the admin adds later simply gets DEFAULT_THEME until an entry is added here.
 */

export type GenderTag = "Men" | "Women" | "Unisex";

export type PerfumeTheme = {
  /** The perfume's colour: tints its photo frame and the craft stills. */
  liquidColor: string;
  /** Accent for UI details. */
  accentColor: string;
  /** The two essence colours in the no-WebGL craft stills. */
  lightColor: string;
  lightColor2: string;
  /** Fallbacks, used only when the CMS has no value. */
  genderTag?: GenderTag;
  character?: string;
};

export const DEFAULT_THEME: PerfumeTheme = {
  liquidColor: "#c9a35c",
  accentColor: "#d7c4a4",
  lightColor: "#8fa8ff",
  lightColor2: "#ffd9a8",
};

export const perfumeThemes: Record<string, PerfumeTheme> = {
  "midnight-rose-voltage": {
    liquidColor: "#b3122f",
    accentColor: "#ff4d6d",
    lightColor: "#e0183c",
    lightColor2: "#3d7bff",
    genderTag: "Unisex",
    character: "Fresh Fruity, Soft Floral Rose, Sweet Vanilla & Woody",
  },
  "midnight-fantasy": {
    liquidColor: "#a02a7a",
    accentColor: "#ff7ab8",
    lightColor: "#8a3ad6",
    lightColor2: "#ff5c9a",
    genderTag: "Women",
    character: "Sweet Fruity, Fresh Tropical, Floral & Warm Vanilla",
  },
  "midnight-citrus": {
    liquidColor: "#e08a1c",
    accentColor: "#ffb84a",
    lightColor: "#ffb347",
    lightColor2: "#ffe08a",
    genderTag: "Men",
    character: "Fresh Citrus, Warm Spicy, Woody & Sweet Vanilla",
  },
  "midnight-elegance": {
    liquidColor: "#6b3d16",
    accentColor: "#c08a4a",
    lightColor: "#1f6b4c",
    lightColor2: "#d49a55",
    genderTag: "Men",
    character: "Warm Spicy, Woody, Leathery & Fresh Masculine",
  },
  "midnight-temptation": {
    liquidColor: "#c2183f",
    accentColor: "#ff5a7a",
    lightColor: "#5f8fc4",
    lightColor2: "#e02a55",
    genderTag: "Men",
    character: "Fresh Spicy, Sweet Fruity, Amber & Warm Woody",
  },
  "midnight-sin": {
    liquidColor: "#3b2012",
    accentColor: "#f2a7b8",
    lightColor: "#f29bb2",
    lightColor2: "#c98a52",
    genderTag: "Women",
    character: "Sweet Gourmand, Fruity Floral, Warm Coffee & Vanilla",
  },
  "midnight-reserve": {
    liquidColor: "#e3cf96",
    accentColor: "#f1dfae",
    lightColor: "#a892e6",
    lightColor2: "#f3e2b0",
    genderTag: "Men",
    character: "Aromatic, Fresh, Warm Sweet Vanilla & Woody",
  },
};

export function themeFor(slug: string): PerfumeTheme {
  return perfumeThemes[slug] ?? DEFAULT_THEME;
}
