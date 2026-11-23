"use server";

import { Gender } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_DISCOUNT,
  MAX_NAME_LENGTH,
  MAX_PRICE,
  MAX_PHOTOGRAPHS,
  MAX_CHARACTER_LENGTH,
  MAX_NOTES_PER_TIER,
  MAX_NOTE_LENGTH,
  isGenderValue,
  parseNotesInput,
} from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import {
  MAX_MEDIA_BYTES,
  deleteMedia,
  isMediaContentType,
  isMediaKey,
} from "@/lib/spaces";

type ImageInput = {
  fileKey: string;
  fileType: string;
  fileSize: number;
};

type SaveResult = { ok: true; id: string } | { ok: false; error: string };

function refreshCatalog(id?: string) {
  // The storefront reads the catalog too.
  revalidatePath("/[lang]", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/perfumes");
  if (id) revalidatePath(`/admin/perfumes/${id}`);
}

async function removeStoredImage(key: string) {
  if (!isMediaKey(key)) return;
  try {
    await deleteMedia(key);
  } catch (error) {
    console.error(error);
  }
}

function readImages(images: ImageInput[]): { images: ImageInput[] } | { error: string } {
  if (images.length > MAX_PHOTOGRAPHS) {
    return { error: `Use up to ${MAX_PHOTOGRAPHS} photographs.` };
  }

  const seen = new Set<string>();
  for (const image of images) {
    if (!isMediaKey(image.fileKey) || seen.has(image.fileKey)) {
      return { error: "One of the photographs could not be saved." };
    }
    if (!isMediaContentType(image.fileType)) {
      return { error: "Use a JPEG, PNG, WebP, AVIF, or GIF image." };
    }
    if (!Number.isFinite(image.fileSize) || image.fileSize <= 0 || image.fileSize > MAX_MEDIA_BYTES) {
      return { error: "One of the photographs is too large." };
    }
    seen.add(image.fileKey);
  }

  return { images };
}

/** Cleans one tier of notes; returns null when it breaks a limit. */
function readNotes(notes: string[] | undefined) {
  const clean = parseNotesInput((notes ?? []).join(","));
  if (clean.length > MAX_NOTES_PER_TIER || clean.some((note) => note.length > MAX_NOTE_LENGTH)) return null;
  return clean;
}

export async function saveFragrance(input: {
  id?: string;
  name: string;
  description: string;
  genders: string[];
  price: number | null;
  discount: number | null;
  bestSeller: boolean;
  scentIds?: string[];
  character?: string;
  topNotes?: string[];
  middleNotes?: string[];
  baseNotes?: string[];
  images: ImageInput[];
}): Promise<SaveResult> {
  const session = await requireAdmin();
  const name = input.name.replace(/\s+/g, " ").trim();
  const description = input.description.trim();
  const genders = [...new Set(input.genders)].filter(isGenderValue);

  if (!name || name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: "Enter a name for this fragrance." };
  }
  if (genders.length === 0) {
    return { ok: false, error: "Choose who this fragrance is for." };
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { ok: false, error: "Shorten the description." };
  }

  const price = input.price;
  if (price !== null && (!Number.isInteger(price) || price <= 0 || price > MAX_PRICE)) {
    return { ok: false, error: "Enter the price in whole Rupiah, or leave it empty." };
  }
  const discount = input.discount || null;
  if (discount !== null && (!Number.isInteger(discount) || discount < 0 || discount > MAX_DISCOUNT)) {
    return { ok: false, error: `Use a discount between 0 and ${MAX_DISCOUNT}%.` };
  }
  if (discount !== null && price === null) {
    return { ok: false, error: "Add a price before setting a discount." };
  }
  const bestSeller = input.bestSeller === true;

  // Keep only scents that still exist (one may have been deleted meanwhile).
  const wantedScents = [...new Set(input.scentIds ?? [])].filter((id) => typeof id === "string" && id.length <= 64);
  const scentIds = wantedScents.length
    ? (await prisma.scent.findMany({ where: { id: { in: wantedScents } }, select: { id: true } })).map(
        (scent) => scent.id,
      )
    : [];
  const character = (input.character ?? "").replace(/\s+/g, " ").trim();
  if (character.length > MAX_CHARACTER_LENGTH) {
    return { ok: false, error: "Shorten the scent character." };
  }
  const topNotes = readNotes(input.topNotes);
  const middleNotes = readNotes(input.middleNotes);
  const baseNotes = readNotes(input.baseNotes);
  if (!topNotes || !middleNotes || !baseNotes) {
    return {
      ok: false,
      error: `Use up to ${MAX_NOTES_PER_TIER} notes per layer, each ${MAX_NOTE_LENGTH} characters or fewer.`,
    };
  }
  const scent = { character: character || null, topNotes, middleNotes, baseNotes };
  const scents = scentIds.map((scentId) => ({ id: scentId }));

  const photographs = readImages(input.images);
  if ("error" in photographs) return { ok: false, error: photographs.error };

  const id = input.id?.trim() || crypto.randomUUID();
  const existing = input.id
    ? await prisma.perfume.findUnique({
        where: { id },
        include: { images: true },
      })
    : null;

  if (input.id && !existing) {
    return { ok: false, error: "This fragrance is no longer in the catalog." };
  }

  const removed =
    existing?.images.filter(
      (image) => !photographs.images.some((next) => next.fileKey === image.fileKey),
    ) ?? [];

  const stamp = Date.now();
  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.perfume.update({
        where: { id },
        data: {
          name,
          description: description || null,
          gender: genders as Gender[],
          price,
          discount,
          bestSeller,
          ...scent,
          scents: { set: scents },
          updatedById: session.user.id,
        },
      });
      await tx.perfumeImage.deleteMany({ where: { perfumeId: id } });
    } else {
      await tx.perfume.create({
        data: {
          id,
          name,
          description: description || null,
          gender: genders as Gender[],
          price,
          discount,
          bestSeller,
          ...scent,
          scents: { connect: scents },
          createdById: session.user.id,
          updatedById: session.user.id,
        },
      });
    }

    if (photographs.images.length > 0) {
      await tx.perfumeImage.createMany({
        data: photographs.images.map((image, index) => ({
          id: crypto.randomUUID(),
          perfumeId: id,
          fileKey: image.fileKey,
          fileSize: image.fileSize,
          fileType: image.fileType,
          createdAt: new Date(stamp + index),
          updatedAt: new Date(stamp + index),
        })),
      });
    }
  });

  await Promise.all(removed.map((image) => removeStoredImage(image.fileKey)));
  refreshCatalog(id);
  return { ok: true, id };
}

export async function deleteFragrance(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  const perfume = await prisma.perfume.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!perfume) return { ok: false, error: "This fragrance is no longer in the catalog." };

  await prisma.perfume.delete({ where: { id } });
  await Promise.all(perfume.images.map((image) => removeStoredImage(image.fileKey)));
  refreshCatalog();
  return { ok: true };
}
