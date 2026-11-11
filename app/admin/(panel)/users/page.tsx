import type { Metadata } from "next";
import { headers } from "next/headers";
import { PeopleManager } from "@/components/admin/people-manager";
import { PageHeader } from "@/components/admin/ui";
import { auth } from "@/lib/auth";
import { isOwnerUser, requireAdmin } from "@/lib/session";
import type { Person } from "./actions";

export const metadata: Metadata = {
  title: "People",
};

export default async function UsersPage() {
  const session = await requireAdmin();
  const owner = isOwnerUser(session.user);
  let people: Person[] = [];
  let loadError = "";

  try {
    const result = await auth.api.listUsers({
      headers: await headers(),
      query: {
        limit: 100,
        sortBy: "name",
        sortDirection: "asc",
      },
    });
    people = result.users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ?? "user",
      banned: Boolean(user.banned),
      createdAt: new Date(user.createdAt).toISOString(),
    }));
  } catch (error) {
    console.error(error);
    loadError = "The directory could not be loaded.";
  }

  return (
    <>
      <PageHeader
        eyebrow="Atelier"
        title="People"
        lede={
          owner
            ? "Add someone who can sign in, set a new password for any account, or remove someone’s access."
            : "Add someone who can sign in. Only the owner can change passwords or remove people."
        }
      />
      <PeopleManager
        currentUserId={session.user.id}
        canManage={owner}
        people={people}
        loadError={loadError}
      />
    </>
  );
}
