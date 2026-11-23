import type { LandingProduct } from "@/lib/landing/types";

/**
 * Scent finder matching, in plain terms:
 *
 *   1. Only perfumes for who it is for are considered (the chosen gender, or Unisex).
 *      "Both" considers every perfume.
 *   2. Of those, the one that has the most of the visitor's picked scents wins.
 *      Scents are ticked per perfume in the admin (Scents).
 *   3. On a tie, a perfume made for exactly that choice beats a Unisex one (for "Both",
 *      Unisex wins), and then the one listed first in the shop.
 *
 * A second perfume is offered as "you may also like" when it matches at least one picked
 * scent and at most one fewer than the winner.
 */

export type FinderAnswers = {
  who: "men" | "women" | "both";
  /** Picked scent ids. */
  scents: string[];
};

export type FinderMatch = {
  product: LandingProduct;
  /** The picked scents this perfume has, in the order of its own scent list. */
  matched: LandingProduct["scent"]["scents"];
};

/** 2 = made for exactly this choice, 1 = Unisex (fits too), 0 = not for this choice. */
function fit(product: LandingProduct, who: FinderAnswers["who"]) {
  if (who === "both") return product.tags.includes("Unisex") ? 2 : 1;
  const wanted = who === "men" ? "Men" : "Women";
  if (product.tags.includes(wanted)) return 2;
  if (product.tags.includes("Unisex")) return 1;
  return 0;
}

export function recommend(products: LandingProduct[], answers: FinderAnswers): FinderMatch[] {
  const picked = new Set(answers.scents);
  const ranked = products
    .map((product, index) => ({
      product,
      index,
      fit: fit(product, answers.who),
      matched: product.scent.scents.filter((scent) => picked.has(scent.id)),
    }))
    .sort((a, b) => b.matched.length - a.matched.length || b.fit - a.fit || a.index - b.index);

  // Keep to perfumes for who it is for, unless none are.
  const suitable = ranked.filter((entry) => entry.fit > 0);
  const pool = suitable.length > 0 ? suitable : ranked;
  if (pool.length === 0) return [];

  const [best, second] = pool;
  const result: FinderMatch[] = [{ product: best.product, matched: best.matched }];
  if (second && second.matched.length > 0 && second.matched.length >= best.matched.length - 1) {
    result.push({ product: second.product, matched: second.matched });
  }
  return result;
}
