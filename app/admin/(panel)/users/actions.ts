"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireOwner } from "@/lib/session";

export type Person = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
};

type ActionResult = { ok: true; user?: Person } | { ok: false; error: string };

function normalizeEmail(value: string) {
  const trimmed = value.replace(/[\u200b\u200c\u200d\ufeff]/g, "").trim();
  const wrapped = trimmed.match(/<([^>]+)>/);
  return (wrapped?.[1] ?? trimmed).trim().toLowerCase().replace(/\.+$/, "");
}

function failure(error: unknown, fallback: string) {
  if (isAPIError(error)) {
    const message = error.message || fallback;
    if (message.toLowerCase().includes("already exists")) {
      return "Someone already uses that email.";
    }
    if (message.toLowerCase().includes("too short")) {
      return "Use at least 8 characters.";
    }
    return message;
  }
  console.error(error);
  return fallback;
}

function toPerson(user: {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  createdAt: Date | string;
}): Person {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? "user",
    banned: Boolean(user.banned),
    createdAt: new Date(user.createdAt).toISOString(),
  };
}

export async function createAtelierUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<ActionResult> {
  await requireAdmin();

  const name = input.name.replace(/\s+/g, " ").trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (name.length < 1 || name.length > 80) {
    return { ok: false, error: "Enter a name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Use at least 8 characters." };
  }
  if (password.length > 128) {
    return { ok: false, error: "Use a shorter password." };
  }

  try {
    // Created without a role (Better Auth only lets owners pass one), then given
    // "admin" here. New people are always admins; there is one owner.
    const result = await auth.api.createUser({
      headers: await headers(),
      body: { name, email, password },
    });
    const user = await prisma.user.update({
      where: { id: result.user.id },
      data: { role: "admin" },
    });
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { ok: true, user: toPerson(user) };
  } catch (error) {
    return { ok: false, error: failure(error, "Could not add this person.") };
  }
}

export async function setAtelierPassword(input: {
  userId: string;
  password: string;
}): Promise<ActionResult> {
  if (!(await requireOwner())) {
    return { ok: false, error: "Only the owner can change passwords." };
  }

  const userId = input.userId.trim();
  const password = input.password;
  if (!userId) return { ok: false, error: "Choose a person first." };
  if (password.length < 8) return { ok: false, error: "Use at least 8 characters." };
  if (password.length > 128) return { ok: false, error: "Use a shorter password." };

  try {
    await auth.api.setUserPassword({
      headers: await headers(),
      body: { userId, newPassword: password },
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: failure(error, "Could not update the password.") };
  }
}

/**
 * Removes a person's access. Fragrances they created or last edited are handed to the
 * admin doing the removal first: the schema cascades perfume deletes from users, so
 * removing the person directly would silently delete those fragrances too.
 */
export async function deleteAtelierUser(input: {
  userId: string;
}): Promise<{ ok: true; reassigned: number } | { ok: false; error: string }> {
  const session = await requireOwner();
  if (!session) return { ok: false, error: "Only the owner can remove people." };
  const userId = input.userId.trim();

  if (!userId) return { ok: false, error: "Choose a person first." };
  if (userId === session.user.id) {
    return { ok: false, error: "You can't remove your own account while signed in." };
  }

  const person = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!person) return { ok: false, error: "This person is no longer in the directory." };

  try {
    const [created, updated] = await prisma.$transaction([
      prisma.perfume.updateMany({
        where: { createdById: userId },
        data: { createdById: session.user.id },
      }),
      prisma.perfume.updateMany({
        where: { updatedById: userId },
        data: { updatedById: session.user.id },
      }),
    ]);

    await auth.api.removeUser({
      headers: await headers(),
      body: { userId },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { ok: true, reassigned: Math.max(created.count, updated.count) };
  } catch (error) {
    return { ok: false, error: failure(error, "Could not remove this person.") };
  }
}
