"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const [error, setError] = useState(notice ?? "");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const emailInput = form.elements.namedItem("email");
    const passwordInput = form.elements.namedItem("password");
    if (!(emailInput instanceof HTMLInputElement) || !(passwordInput instanceof HTMLInputElement)) {
      return;
    }
    const email = emailInput.value
      .replace(/[\u200b\u200c\u200d\ufeff]/g, "")
      .trim()
      .toLowerCase()
      .replace(/\.+$/, "");
    const password = passwordInput.value;

    setPending(true);
    setError("");

    const result = await authClient.signIn.email({ email, password });
    if (result.error) {
      setError(result.error.message || "Could not sign in.");
      setPending(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-5" autoComplete="off" noValidate>
      <div>
        <label htmlFor="email" className="text-[12px] tracking-[0.16em] text-muted uppercase">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="text"
          inputMode="email"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue="atelier@velure.local"
          required
          className="mt-2 w-full border-b border-line bg-transparent py-3 text-sm outline-none"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="text-[12px] tracking-[0.16em] text-muted uppercase"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="mt-2 w-full border-b border-line bg-transparent py-3 text-sm outline-none"
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-sale">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full bg-ink py-3 text-[12px] tracking-[0.2em] text-white uppercase disabled:opacity-60"
      >
        {pending ? "Signing in" : "Enter atelier"}
      </button>
    </form>
  );
}
