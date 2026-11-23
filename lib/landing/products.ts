import { themeFor } from "@/config/perfume-themes";
import type { Product } from "@/lib/content";
import { parseDescription } from "@/lib/landing/notes";
import type { LandingProduct } from "@/lib/landing/types";

export function slugify(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Turns the storefront catalog into landing products: adds a slug, resolves the scent
 * profile (admin fields first, then the description), and attaches the visual theme. Pure and
 * serialisable, so the result can be passed from the server to client components.
 */
export function toLandingProducts(products: Product[]): LandingProduct[] {
  const used = new Set<string>();
  return products.map((product) => {
    const base = slugify(product.name) || "parfum";
    let slug = base;
    // Two perfumes with the same name still need distinct deep links.
    if (used.has(slug)) slug = `${base}-${product.id.slice(0, 6)}`;
    used.add(slug);

    const theme = themeFor(base);
    const parsed = parseDescription(product.description);
    return {
      ...product,
      slug,
      prose: parsed.prose,
      // The admin's scent profile wins; labelled lines in the description and the theme
      // config remain as fallbacks for perfumes that have not been filled in yet.
      character: product.scent.character || parsed.character || theme.character || "",
      notes: {
        top: product.scent.notes.top.length > 0 ? product.scent.notes.top : parsed.notes.top,
        middle: product.scent.notes.middle.length > 0 ? product.scent.notes.middle : parsed.notes.middle,
        base: product.scent.notes.base.length > 0 ? product.scent.notes.base : parsed.notes.base,
      },
      size: parsed.size,
      tags: product.categories.length > 0 ? product.categories : theme.genderTag ? [theme.genderTag] : [],
      theme,
    };
  });
}
