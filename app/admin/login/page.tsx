import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getSession, isAdminUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Atelier sign in",
};

const notices: Record<string, string> = {
  forbidden: "This account does not have atelier access.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session && isAdminUser(session.user)) redirect("/admin");

  const { error } = await searchParams;

  return (
    <main id="main" className="grid min-h-screen place-items-center bg-ivory px-5 py-16">
      <div className="w-full max-w-md bg-white px-8 py-12 shadow-[0_24px_80px_rgba(28,25,21,0.06)] md:px-12">
        <p className="text-[11px] tracking-[0.32em] text-muted uppercase">Velure</p>
        <h1 className="mt-3 font-serif text-5xl text-ink">Atelier</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Sign in to manage the house. Public registration is closed.
        </p>
        <LoginForm notice={error ? notices[error] : undefined} />
      </div>
    </main>
  );
}
