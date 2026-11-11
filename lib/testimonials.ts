import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import type { StoreTestimonial, Testimonial } from "@/lib/testimonial-types";

export type { StoreTestimonial, Testimonial } from "@/lib/testimonial-types";
export {
  MAX_TESTIMONIAL_NAME,
  MAX_TESTIMONIAL_PLACE,
  MAX_TESTIMONIAL_QUOTE,
} from "@/lib/testimonial-types";

function toTestimonial(row: {
  id: string;
  name: string;
  place: string | null;
  quoteId: string;
  quoteEn: string | null;
  published: boolean;
  position: number;
  updatedAt: Date;
}): Testimonial {
  return {
    id: row.id,
    name: row.name,
    place: row.place ?? "",
    quoteId: row.quoteId,
    quoteEn: row.quoteEn ?? "",
    published: row.published,
    position: row.position,
    updatedAt: row.updatedAt.toISOString(),
  };
}

const order = [{ position: "asc" as const }, { createdAt: "asc" as const }];

export async function listTestimonials() {
  const rows = await prisma.testimonial.findMany({ orderBy: order });
  return rows.map(toTestimonial);
}

/** Published testimonials for the storefront. Empty if the table is unavailable. */
export async function getStoreTestimonials(locale: Locale): Promise<StoreTestimonial[]> {
  try {
    const rows = await prisma.testimonial.findMany({ where: { published: true }, orderBy: order });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      place: row.place ?? "",
      // English falls back to the Indonesian quote when no translation was entered.
      quote: (locale === "en" ? row.quoteEn || row.quoteId : row.quoteId).trim(),
    }));
  } catch (error) {
    console.error("Could not load testimonials", error);
    return [];
  }
}
