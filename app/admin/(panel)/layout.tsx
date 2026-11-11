import { AdminShell } from "@/components/admin/admin-shell";
import { isOwnerUser, requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <AdminShell
      name={session.user.name}
      email={session.user.email}
      role={isOwnerUser(session.user) ? "Owner" : "Admin"}
    >
      {children}
    </AdminShell>
  );
}
