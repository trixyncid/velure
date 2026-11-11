"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        className="text-[12px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-ink"
      >
        Sign out
      </button>

      {/* Native modal: Esc cancels, focus stays inside, and returns to the button on close. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
        onClick={(event) => {
          // Clicking the backdrop (the dialog element itself) cancels.
          if (event.target === event.currentTarget && !pending) dialogRef.current?.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-0 text-left text-ink shadow-[0_30px_80px_-20px_rgba(28,25,21,0.45)] backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] open:animate-[toast-down_0.35s_cubic-bezier(0.22,1,0.36,1)]"
      >
        <div className="p-7">
          <p className="text-[10px] tracking-[0.2em] text-gold uppercase">Atelier</p>
          <h2 id={titleId} className="mt-2 font-serif text-[28px] leading-tight">
            Sign out?
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            You&apos;ll need your email and password to come back in. Unsaved changes on this page
            will be lost.
          </p>
          <div className="mt-7 flex gap-3">
            <button
              type="button"
              autoFocus
              disabled={pending}
              onClick={() => dialogRef.current?.close()}
              className="flex-1 border border-line bg-white px-4 py-3 text-[12px] tracking-[0.18em] uppercase transition-colors hover:border-ink disabled:opacity-60"
            >
              Stay
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => void signOut()}
              className="flex-1 bg-ink px-4 py-3 text-[12px] tracking-[0.18em] text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Signing out" : "Sign out"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
