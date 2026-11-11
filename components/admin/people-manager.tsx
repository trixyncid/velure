"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAtelierUser,
  deleteAtelierUser,
  setAtelierPassword,
  type Person,
} from "@/app/admin/(panel)/users/actions";
import { useToast } from "@/components/admin/toast";
import { Field, buttonClass, inputClass, labelClass } from "@/components/admin/ui";
import { isOwner, roleLabel } from "@/lib/roles";

function formatJoined(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function PeopleManager({
  currentUserId,
  canManage,
  people,
  loadError,
}: {
  currentUserId: string;
  /** Owners can change passwords and remove people. */
  canManage: boolean;
  people: Person[];
  loadError?: string;
}) {
  const router = useRouter();
  const notify = useToast();
  const panelRef = useRef<HTMLElement>(null);
  const [directory, setDirectory] = useState(people);
  const [knownPeople, setKnownPeople] = useState(people);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"create" | "password">("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const announcedError = useRef<string | null>(null);

  useEffect(() => {
    if (!loadError || announcedError.current === loadError) return;
    announcedError.current = loadError;
    notify({ tone: "error", title: "Directory unavailable", message: loadError });
  }, [loadError, notify]);

  if (knownPeople !== people) {
    setKnownPeople(people);
    setDirectory(people);
  }

  const selected = directory.find((person) => person.id === selectedId) ?? null;
  const filtered = directory.filter((person) => {
    const haystack = `${person.name} ${person.email}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  function openPassword(person: Person) {
    setMode("password");
    setSelectedId(person.id);
    setShowPassword(false);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panelRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  function openCreate() {
    setMode("create");
    setShowPassword(false);
  }

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = valueOf(form, "name");
    const email = valueOf(form, "email");
    const password = valueOf(form, "password");
    const confirm = valueOf(form, "confirm");

    if (password !== confirm) {
      notify({
        tone: "error",
        title: "Could not add this person",
        message: "Those passwords do not match.",
      });
      return;
    }

    setPending(true);
    const result = await createAtelierUser({ name, email, password });
    setPending(false);

    if (!result.ok || !result.user) {
      notify({
        tone: "error",
        title: "Could not add this person",
        message: result.ok ? "Try again in a moment." : result.error,
      });
      return;
    }

    setDirectory((current) =>
      [...current.filter((person) => person.id !== result.user!.id), result.user!].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    );
    form.reset();
    notify({
      tone: "success",
      title: "Person added",
      message: `${result.user.name} can now sign in to the atelier.`,
    });
    router.refresh();
  }

  async function onRemove(person: Person) {
    setRemovingId(person.id);
    const result = await deleteAtelierUser({ userId: person.id });
    setRemovingId(null);
    setConfirmingId(null);

    if (!result.ok) {
      notify({ tone: "error", title: "Could not remove this person", message: result.error });
      return;
    }

    setDirectory((current) => current.filter((entry) => entry.id !== person.id));
    if (selectedId === person.id) {
      setSelectedId(null);
      setMode("create");
    }
    notify({
      tone: "success",
      title: "Person removed",
      message:
        result.reassigned > 0
          ? `${person.name} can no longer sign in. Their ${result.reassigned} ${
              result.reassigned === 1 ? "fragrance stays" : "fragrances stay"
            } in the catalog under your name.`
          : `${person.name} can no longer sign in.`,
    });
    router.refresh();
  }

  async function onPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = event.currentTarget;
    const password = valueOf(form, "password");
    const confirm = valueOf(form, "confirm");

    if (password !== confirm) {
      notify({
        tone: "error",
        title: "Could not update the password",
        message: "Those passwords do not match.",
      });
      return;
    }

    setPending(true);
    const result = await setAtelierPassword({ userId: selected.id, password });
    setPending(false);

    if (!result.ok) {
      notify({ tone: "error", title: "Could not update the password", message: result.error });
      return;
    }

    form.reset();
    const own = selected.id === currentUserId;
    notify({
      tone: "success",
      title: "Password updated",
      message: own
        ? "Your password is updated. This session stays signed in."
        : `Password updated for ${selected.name}. Their current sessions stay signed in.`,
    });
  }

  return (
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="order-2 border border-line bg-white lg:order-1">
        <div className="flex items-end justify-between gap-4 border-b border-line px-5 py-4 md:px-6">
          <p className="text-[12px] tracking-[0.16em] text-muted uppercase">
            {directory.length} {directory.length === 1 ? "person" : "people"}
          </p>
          {directory.length > 0 ? (
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              aria-label="Search people"
              className="w-36 border-b border-line bg-transparent py-1 text-sm outline-none placeholder:text-muted/60 sm:w-48"
            />
          ) : null}
        </div>

        {loadError ? (
          <p role="alert" className="px-5 py-8 text-sm text-sale md:px-6">
            {loadError}
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-10 text-sm leading-6 text-muted md:px-6">
            {directory.length === 0
              ? "No one can sign in yet."
              : "No one matches that search."}
          </p>
        ) : (
          <ul>
            {filtered.map((person) => {
              const active = mode === "password" && person.id === selectedId;
              const initial = person.name.trim().charAt(0).toUpperCase() || "V";
              const isSelf = person.id === currentUserId;
              const confirming = confirmingId === person.id;
              const removing = removingId === person.id;
              return (
                <li
                  key={person.id}
                  className={`border-b border-line last:border-b-0 ${
                    confirming ? "bg-sale/[0.04]" : active ? "bg-ivory" : ""
                  }`}
                >
                  <div className="flex items-center gap-4 px-5 py-4 md:px-6">
                    <span
                      aria-hidden
                      className="grid size-11 shrink-0 place-items-center bg-ivory font-serif text-xl text-ink"
                    >
                      {initial}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex min-w-0 items-center gap-2 text-sm text-ink">
                        <span className="truncate">{person.name}</span>
                        {isOwner(person) ? (
                          <span className="shrink-0 bg-ink px-1.5 py-0.5 text-[10px] tracking-[0.14em] text-white uppercase">
                            Owner
                          </span>
                        ) : null}
                        {isSelf ? (
                          <span className="shrink-0 text-[11px] tracking-[0.14em] text-muted uppercase">
                            You
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted">{person.email}</p>
                      <p className="mt-1 text-[11px] tracking-[0.12em] text-muted uppercase">
                        {person.banned ? "Suspended" : roleLabel(person.role)} · Joined{" "}
                        {formatJoined(person.createdAt)}
                      </p>
                    </div>
                    {canManage ? (
                      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-5">
                        <button
                          type="button"
                          onClick={() => openPassword(person)}
                          aria-pressed={active}
                          disabled={removing}
                          className="text-[11px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-ink disabled:opacity-50"
                        >
                          Change password
                        </button>
                        {isSelf ? null : (
                          <button
                            type="button"
                            onClick={() => setConfirmingId(confirming ? null : person.id)}
                            aria-expanded={confirming}
                            aria-controls={`remove-${person.id}`}
                            disabled={removing}
                            className="text-[11px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-sale disabled:opacity-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                  {canManage && confirming ? (
                    <div
                      id={`remove-${person.id}`}
                      role="group"
                      aria-label={`Confirm removing ${person.name}`}
                      className="flex flex-col gap-4 border-t border-sale/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
                    >
                      <p className="text-sm leading-6 text-ink">
                        Remove <span className="font-medium">{person.name}</span>? They are signed
                        out and can no longer enter the atelier. Fragrances they added stay in the
                        catalog.
                      </p>
                      <div className="flex shrink-0 gap-3">
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          disabled={removing}
                          className="inline-flex items-center justify-center border border-line bg-white px-4 py-2.5 text-[11px] tracking-[0.16em] text-ink uppercase transition-colors hover:border-ink disabled:opacity-60"
                        >
                          Keep
                        </button>
                        <button
                          type="button"
                          onClick={() => void onRemove(person)}
                          disabled={removing}
                          className="inline-flex items-center justify-center bg-sale px-4 py-2.5 text-[11px] tracking-[0.16em] text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                          {removing ? "Removing" : "Remove"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <aside ref={panelRef} className="order-1 border border-line bg-white p-6 lg:sticky lg:top-8 lg:order-2 md:p-7">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-3xl text-ink">
            {mode === "create" ? "Add a person" : "New password"}
          </h2>
          {canManage && mode === "password" ? (
            <button
              type="button"
              onClick={openCreate}
              className="text-[11px] tracking-[0.14em] text-muted uppercase hover:text-ink"
            >
              Add someone
            </button>
          ) : null}
        </div>

        {!canManage || mode === "create" ? (
          <form onSubmit={onCreate} className="mt-6 space-y-5">
            <p className="text-sm leading-6 text-muted">
              They will sign in to the atelier as an admin with this email and password.
              {canManage ? null : " Ask the owner to change a password or remove someone."}
            </p>
            <Field id="person-name" label="Name">
              <input
                id="person-name"
                name="name"
                required
                autoComplete="off"
                disabled={pending}
                className={inputClass}
              />
            </Field>
            <Field id="person-email" label="Email">
              <input
                id="person-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="off"
                required
                disabled={pending}
                className={inputClass}
              />
            </Field>
            <PasswordFields show={showPassword} onToggle={() => setShowPassword((value) => !value)} pending={pending} />
            <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
              {pending ? "Adding" : "Add person"}
            </button>
          </form>
        ) : (
          <form onSubmit={onPassword} className="mt-6 space-y-5">
            {selected ? (
              <p className="text-sm leading-6 text-muted">
                Set a new password for <span className="text-ink">{selected.name}</span>. Their
                open sessions stay signed in.
              </p>
            ) : (
              <p className="text-sm leading-6 text-muted">Choose a person from the directory.</p>
            )}
            <PasswordFields show={showPassword} onToggle={() => setShowPassword((value) => !value)} pending={pending || !selected} />
            <button type="submit" disabled={pending || !selected} className={`${buttonClass} w-full`}>
              {pending ? "Updating" : "Update password"}
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}

function PasswordFields({
  show,
  onToggle,
  pending,
}: {
  show: boolean;
  onToggle: () => void;
  pending: boolean;
}) {
  return (
    <>
      <Field id="atelier-password" label="Password" hint="At least 8 characters.">
        <input
          id="atelier-password"
          name="password"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          disabled={pending}
          aria-describedby="atelier-password-hint"
          className={inputClass}
        />
      </Field>
      <div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="atelier-confirm" className={labelClass}>
            Confirm
          </label>
          <button
            type="button"
            onClick={onToggle}
            className="text-[11px] tracking-[0.14em] text-muted uppercase hover:text-ink"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <input
          id="atelier-confirm"
          name="confirm"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          disabled={pending}
          className={inputClass}
        />
      </div>
    </>
  );
}

function valueOf(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement ? field.value : "";
}
