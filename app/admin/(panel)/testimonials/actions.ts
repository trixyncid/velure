"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import {
  MAX_TESTIMONIAL_NAME,
  MAX_TESTIMONIAL_PLACE,
  MAX_TESTIMONIAL_QUOTE,
  listTestimonials,
  type Testimonial,
} from "@/lib/testimonials";

type Result = { ok: true; testimonials: Testimonial[] } | { ok: false; error: string };

function refresh() {
  revalidatePath("/[lang]", "layout");
  revalidatePath("/admin/testimonials");
  revalidatePath("/admin");
}

const clean = (value: string) => value.replace(/\s+/g, " ").trim();

export async function saveTestimonial(input: {
  id?: string;
  name: string;
  place: string;
  quoteId: string;
  quoteEn: string;
  published: boolean;
}): Promise<Result> {
  await requireAdmin();
  const name = clean(input.name);
  const place = clean(input.place);
  const quoteId = input.quoteId.trim();
  const quoteEn = input.quoteEn.trim();

  if (!name || name.length > MAX_TESTIMONIAL_NAME) return { ok: false, error: "Enter the customer's name." };
  if (place.length > MAX_TESTIMONIAL_PLACE) return { ok: false, error: "Shorten the city." };
  if (!quoteId) return { ok: false, error: "Enter the quote in Indonesian." };
  if (quoteId.length > MAX_TESTIMONIAL_QUOTE || quoteEn.length > MAX_TESTIMONIAL_QUOTE) {
    return { ok: false, error: `Keep each quote under ${MAX_TESTIMONIAL_QUOTE} characters.` };
  }

  const data = {
    name,
    place: place || null,
    quoteId,
    quoteEn: quoteEn || null,
    published: input.published === true,
  };

  if (input.id) {
    const existing = await prisma.testimonial.findUnique({ where: { id: input.id } });
    if (!existing) return { ok: false, error: "This testimonial no longer exists." };
    await prisma.testimonial.update({ where: { id: input.id }, data });
  } else {
    const last = await prisma.testimonial.aggregate({ _max: { position: true } });
    await prisma.testimonial.create({
      data: { id: crypto.randomUUID(), position: (last._max.position ?? -1) + 1, ...data },
    });
  }

  refresh();
  return { ok: true, testimonials: await listTestimonials() };
}

export async function setTestimonialPublished(id: string, published: boolean): Promise<Result> {
  await requireAdmin();
  const result = await prisma.testimonial.updateMany({ where: { id }, data: { published } });
  if (result.count === 0) return { ok: false, error: "This testimonial no longer exists." };
  refresh();
  return { ok: true, testimonials: await listTestimonials() };
}

/** Swaps a testimonial with its neighbour, then renumbers so positions stay 0..n. */
export async function moveTestimonial(id: string, direction: -1 | 1): Promise<Result> {
  await requireAdmin();
  const list = await listTestimonials();
  const index = list.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0) return { ok: false, error: "This testimonial no longer exists." };
  if (target < 0 || target >= list.length) return { ok: true, testimonials: list };

  const ordered = [...list];
  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  await prisma.$transaction(
    ordered.map((item, position) =>
      prisma.testimonial.update({ where: { id: item.id }, data: { position } }),
    ),
  );
  refresh();
  return { ok: true, testimonials: await listTestimonials() };
}

export async function deleteTestimonial(id: string): Promise<Result> {
  await requireAdmin();
  const result = await prisma.testimonial.deleteMany({ where: { id } });
  if (result.count === 0) return { ok: false, error: "This testimonial no longer exists." };
  refresh();
  return { ok: true, testimonials: await listTestimonials() };
}
