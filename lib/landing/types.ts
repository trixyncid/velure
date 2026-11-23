import type { PerfumeTheme } from "@/config/perfume-themes";
import type { Category, Product } from "@/lib/content";

export type NoteTier = "top" | "middle" | "base";
export type ScentNotes = Record<NoteTier, string[]>;

/** A CMS perfume, enriched for the landing page. Built on the server in lib/landing/products.ts. */
export type LandingProduct = Product & {
  /** URL-safe name, used for ?product= deep links and theme lookup. */
  slug: string;
  /** Description with the labelled lines (notes, character, size) removed. */
  prose: string;
  /** "Karakter Aroma", from the CMS description or the theme fallback. */
  character: string;
  notes: ScentNotes;
  /** e.g. "Eau de Parfum · 30ml" when the description states a size, otherwise null. */
  size: string | null;
  /** Gender tags from the CMS, or the theme fallback when the CMS has none. */
  tags: Category[];
  theme: PerfumeTheme;
};
