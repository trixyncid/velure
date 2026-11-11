/** Client-safe testimonial limits and types. Queries live in lib/testimonials.ts. */

export const MAX_TESTIMONIAL_NAME = 80;
export const MAX_TESTIMONIAL_PLACE = 80;
export const MAX_TESTIMONIAL_QUOTE = 600;

export type Testimonial = {
  id: string;
  name: string;
  place: string;
  quoteId: string;
  quoteEn: string;
  published: boolean;
  position: number;
  updatedAt: string;
};

/** What the storefront carousel needs, already in the visitor's language. */
export type StoreTestimonial = {
  id: string;
  name: string;
  place: string;
  quote: string;
};
