"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MAX_SCENTS, MAX_SCENT_NAME, listScents, type ScentRecord } from "@/lib/scent";
import { requireAdmin } from "@/lib/session";

type Result = { ok: true; scents: ScentRecord[] } | { ok: false; error: string };

const clean = (value: string) => value.replace(/\s+/g, " ").trim();

async function done(): Promise<Result> {
  revalidatePath("/[lang]", "layout");
  revalidatePath("/admin/scent");
  revalidatePath("/admin/perfumes", "layout");
  return { ok: true, scents: await listScents() };
}

export async function saveScent(input: { id?: string; nameId: string; nameEn: string }): Promise<Result> {
  await requireAdmin();
  const nameId = clean(input.nameId);
  const nameEn = clean(input.nameEn);

  if (!nameId) return { ok: false, error: "Enter the scent's name in Indonesian." };
  if (nameId.length > MAX_SCENT_NAME || nameEn.length > MAX_SCENT_NAME) {
    return { ok: false, error: `Keep each name under ${MAX_SCENT_NAME} characters.` };
  }
  const duplicate = await prisma.scent.findFirst({
    where: { nameId: { equals: nameId, mode: "insensitive" }, ...(input.id ? { NOT: { id: input.id } } : {}) },
    select: { id: true },
  });
  if (duplicate) return { ok: false, error: `“${nameId}” is already in the list.` };

  const data = { nameId, nameEn: nameEn || null };
  if (input.id) {
    const result = await prisma.scent.updateMany({ where: { id: input.id }, data });
    if (result.count === 0) return { ok: false, error: "This scent no longer exists." };
  } else {
    if ((await prisma.scent.count()) >= MAX_SCENTS) {
      return { ok: false, error: `Use up to ${MAX_SCENTS} scents; a longer list is hard to choose from.` };
    }
    const last = await prisma.scent.aggregate({ _max: { position: true } });
    await prisma.scent.create({
      data: { id: crypto.randomUUID(), position: (last._max.position ?? -1) + 1, ...data },
    });
  }
  return done();
}

export async function deleteScent(id: string): Promise<Result> {
  await requireAdmin();
  // Fragrances ticked with it simply lose that tick (cascade).
  const result = await prisma.scent.deleteMany({ where: { id } });
  if (result.count === 0) return { ok: false, error: "This scent no longer exists." };
  return done();
}

export async function moveScent(id: string, direction: -1 | 1): Promise<Result> {
  await requireAdmin();
  const list = await listScents();
  const index = list.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0) return { ok: false, error: "This scent no longer exists." };
  if (target < 0 || target >= list.length) return { ok: true, scents: list };
  const ordered = [...list];
  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  await prisma.$transaction(
    ordered.map((item, position) => prisma.scent.update({ where: { id: item.id }, data: { position } })),
  );
  return done();
}
