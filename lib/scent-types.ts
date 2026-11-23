/** Scents for the scent finder, as the admin edits them. Safe to import in client code. */

export type ScentRecord = {
  id: string;
  nameId: string;
  nameEn: string;
  position: number;
  /** How many fragrances are ticked with it. */
  perfumes: number;
};

/** A scent as the storefront shows it, in one language. */
export type FinderScent = { id: string; name: string };

export const MAX_SCENTS = 40;
export const MAX_SCENT_NAME = 40;
