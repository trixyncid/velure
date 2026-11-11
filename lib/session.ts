import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type AuthSession } from "@/lib/auth";
import { isOwner, isStaff } from "@/lib/roles";

type SessionUser = {
  id: string;
  role?: string | string[] | null;
  banned?: boolean | null;
};

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

/** ADMIN_USER_IDS get every permission in Better Auth, so the app treats them as owners. */
function inAllowList(userId: string) {
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .includes(userId);
}

export function isAdminUser(user: SessionUser) {
  if (user.banned) return false;
  return inAllowList(user.id) || isStaff(user);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!isAdminUser(session.user)) {
    await auth.api.signOut({ headers: await headers() });
    redirect("/admin/login?error=forbidden");
  }
  return session;
}

export async function requireAdminApi() {
  const session = await getSession();
  if (!session || !isAdminUser(session.user)) return null;
  return session satisfies AuthSession;
}

export function isOwnerUser(user: SessionUser) {
  return !user.banned && (inAllowList(user.id) || isOwner(user));
}

/** For owner-only server actions. Returns null when the signed-in person is not the owner. */
export async function requireOwner() {
  const session = await requireAdmin();
  return isOwnerUser(session.user) ? session : null;
}
