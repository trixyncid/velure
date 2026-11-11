"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { ToastProvider } from "@/components/admin/toast";
import {
  IconClose,
  IconFragrance,
  IconMenu,
  IconOverview,
  IconPeople,
  IconQuote,
} from "@/components/icons";

const nav = [
  { href: "/admin", label: "Overview", icon: IconOverview },
  { href: "/admin/perfumes", label: "Fragrances", icon: IconFragrance },
  { href: "/admin/testimonials", label: "Testimonials", icon: IconQuote },
  { href: "/admin/users", label: "People", icon: IconPeople },
] as const;

function isCurrent(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Sidebar({
  name,
  email,
  role,
  onNavigate,
}: {
  name: string;
  email: string;
  role: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="px-6 pt-8 pb-6">
        <Link href="/admin" onClick={onNavigate} className="block">
          <span className="font-serif text-[22px] tracking-[0.28em] text-ink">VELURE</span>
          <span className="mt-1 block text-[11px] tracking-[0.28em] text-muted uppercase">
            Atelier
          </span>
        </Link>
        <Link
          href="/"
          onClick={onNavigate}
          className="mt-5 inline-block text-[11px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-ink"
        >
          View the house
        </Link>
      </div>

      <nav aria-label="Atelier" className="flex-1 px-3">
        <ul className="space-y-1">
          {nav.map((item) => {
            const active = isCurrent(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 border-l-2 px-4 py-3 text-[12px] tracking-[0.18em] uppercase transition-colors ${
                    active
                      ? "border-gold bg-ivory text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  <Icon className="size-[18px]" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line px-6 py-5">
        <p className="truncate text-sm text-ink">{name}</p>
        <p className="mt-1 truncate text-xs text-muted">{email}</p>
        <p className="mt-2 text-[10px] tracking-[0.18em] text-gold uppercase">{role}</p>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

export function AdminShell({
  name,
  email,
  role,
  children,
}: {
  name: string;
  email: string;
  /** Display label, e.g. "Owner" or "Admin". */
  role: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuPath(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <ToastProvider>
    <div className="min-h-screen bg-ivory text-foreground lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="sticky top-0 hidden h-screen border-r border-line lg:block">
        <Sidebar name={name} email={email} role={role} />
      </div>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            className="grid size-10 place-items-center"
            aria-expanded={open}
            aria-controls="atelier-nav"
            onClick={() => setMenuPath(pathname)}
          >
            <IconMenu className="size-5" />
            <span className="sr-only">Open navigation</span>
          </button>
          <Link href="/admin" className="font-serif text-[18px] tracking-[0.22em] text-ink">
            VELURE
          </Link>
          <SignOutButton />
        </header>

        <main id="main" className="px-5 py-8 md:px-10 md:py-12">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/30"
            aria-label="Close navigation"
            onClick={() => setMenuPath(null)}
          />
          <div
            id="atelier-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Atelier navigation"
            className="animate-menu relative flex h-full w-[min(100%,280px)] flex-col border-r border-line shadow-[0_24px_80px_rgba(28,25,21,0.12)]"
          >
            <button
              ref={closeRef}
              type="button"
              className="absolute top-5 right-4 z-10 grid size-10 place-items-center"
              onClick={() => setMenuPath(null)}
            >
              <IconClose className="size-5" />
              <span className="sr-only">Close navigation</span>
            </button>
            <Sidebar name={name} email={email} role={role} onNavigate={() => setMenuPath(null)} />
          </div>
        </div>
      ) : null}
    </div>
    </ToastProvider>
  );
}
