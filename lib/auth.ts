import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { adminAc, defaultAc, userAc } from "better-auth/plugins/admin/access";
import { prisma } from "@/lib/prisma";

function normalizeSignInEmail(value: string) {
  const trimmed = value.replace(/[\u200b\u200c\u200d\ufeff]/g, "").trim();
  const wrapped = trimmed.match(/<([^>]+)>/);
  return (wrapped?.[1] ?? trimmed).trim().toLowerCase().replace(/\.+$/, "");
}

function configuredAdminUserIds() {
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

const adminUserIds = configuredAdminUserIds();

/**
 * Better Auth enforces these on its own /api/auth/admin/* endpoints too, so an admin
 * can't bypass the UI to remove people or set passwords. Admins deliberately lack
 * "set-role": with it they could promote themselves to owner.
 */
const roles = {
  owner: adminAc,
  admin: defaultAc.newRole({
    user: ["create", "list", "get"],
    session: [],
  }),
  user: userAc,
};

export const auth = betterAuth({
  appName: "Velure",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
  },
  advanced: {
    database: {
      joins: true,
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      roles,
      adminRoles: ["owner", "admin"],
      ...(adminUserIds.length > 0 ? { adminUserIds } : {}),
    }),
    nextCookies(),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email" || !ctx.body || typeof ctx.body.email !== "string") {
        return;
      }
      ctx.body.email = normalizeSignInEmail(ctx.body.email);
    }),
  },
});

export type AuthSession = typeof auth.$Infer.Session;
