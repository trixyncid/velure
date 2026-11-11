/**
 * Atelier roles.
 * - owner: everything an admin can do, plus removing people and setting anyone's password.
 * - admin: manages the catalog and can add people.
 * - user:  no atelier access (Better Auth default).
 */
export const ROLES = ["owner", "admin", "user"] as const;
export type Role = (typeof ROLES)[number];

type RoleCarrier = { role?: string | string[] | null };

function rolesOf(user: RoleCarrier) {
  const raw = Array.isArray(user.role) ? user.role : (user.role ?? "").split(",");
  return raw.map((role) => role.trim()).filter(Boolean);
}

export function hasRole(user: RoleCarrier, role: Role) {
  return rolesOf(user).includes(role);
}

export function isOwner(user: RoleCarrier) {
  return hasRole(user, "owner");
}

/** Owners and admins may enter the atelier. */
export function isStaff(user: RoleCarrier) {
  return isOwner(user) || hasRole(user, "admin");
}

export function roleLabel(role: string) {
  const roles = rolesOf({ role });
  if (roles.includes("owner")) return "Owner";
  if (roles.includes("admin")) return "Admin";
  return "No access";
}
