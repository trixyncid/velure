"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteScent, moveScent, saveScent } from "@/app/admin/(panel)/scent/actions";
import { useToast } from "@/components/admin/toast";
import { Field, buttonClass, buttonGhostClass, inputClass } from "@/components/admin/ui";
import { MAX_SCENTS, MAX_SCENT_NAME, type ScentRecord } from "@/lib/scent-types";

type Draft = { id?: string; nameId: string; nameEn: string };
type Result = Awaited<ReturnType<typeof saveScent>>;

const emptyDraft: Draft = { nameId: "", nameEn: "" };

const textButton =
  "text-[11px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-ink disabled:opacity-40 disabled:hover:text-muted";

/** The list of scents visitors can pick in the scent finder: add, rename, reorder, delete. */
export function ScentManager({ scents }: { scents: ScentRecord[] }) {
  const router = useRouter();
  const notify = useToast();
  const [items, setItems] = useState(scents);
  const [known, setKnown] = useState(scents);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [pending, setPending] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  if (known !== scents) {
    setKnown(scents);
    setItems(scents);
  }

  const busy = pending !== null;
  const unused = items.filter((item) => item.perfumes === 0).length;

  async function run(key: string, action: () => Promise<Result>, success?: { title: string; message?: string }) {
    setPending(key);
    const result = await action();
    setPending(null);
    if (!result.ok) {
      notify({ tone: "error", title: "Could not update scents", message: result.error });
      return false;
    }
    setItems(result.scents);
    setConfirming(null);
    if (success) notify({ tone: "success", ...success });
    router.refresh();
    return true;
  }

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isNew = !draft.id;
    const saved = await run("save", () => saveScent(draft), {
      title: isNew ? "Scent added" : "Scent renamed",
      message: isNew ? "Tick it on the fragrances that have it; it appears in the finder once one does." : undefined,
    });
    if (saved) setDraft(emptyDraft);
  }

  return (
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="order-2 border border-line bg-white lg:order-1">
        <div className="border-b border-line px-5 py-4 md:px-6">
          <p className="text-[12px] tracking-[0.16em] text-muted uppercase">
            {items.length} {items.length === 1 ? "scent" : "scents"}
            {unused > 0 ? ` · ${unused} not on any fragrance yet, so not shown to visitors` : ""}
          </p>
        </div>
        {items.length === 0 ? (
          <p className="px-5 py-10 text-sm leading-6 text-muted md:px-6">
            No scents yet. Until there are some, the finder only asks who the scent is for.
          </p>
        ) : (
          <ol className="divide-y divide-line">
            {items.map((item, index) => {
              const key = item.id;
              const active = draft.id === item.id;
              return (
                <li
                  key={item.id}
                  className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6 ${
                    confirming === key ? "bg-sale/[0.04]" : active ? "bg-ivory" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink">
                      {item.nameId}
                      {item.nameEn && item.nameEn !== item.nameId ? (
                        <span className="text-muted"> · {item.nameEn}</span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {item.perfumes === 0
                        ? "Not on any fragrance"
                        : `On ${item.perfumes} ${item.perfumes === 1 ? "fragrance" : "fragrances"}`}
                    </p>
                  </div>
                  {confirming === key ? (
                    <div className="flex shrink-0 flex-wrap items-center gap-4">
                      <span className="text-xs text-sale">
                        {item.perfumes > 0 ? "It will be unticked from every fragrance." : "Delete this scent?"}
                      </span>
                      <button
                        type="button"
                        disabled={busy}
                        className={`${textButton} text-sale hover:text-sale`}
                        onClick={() => run(key, () => deleteScent(item.id), { title: "Scent deleted" })}
                      >
                        Delete
                      </button>
                      <button type="button" disabled={busy} className={textButton} onClick={() => setConfirming(null)}>
                        Keep
                      </button>
                    </div>
                  ) : (
                    <div className="flex shrink-0 items-center gap-4">
                      <button
                        type="button"
                        disabled={busy || index === 0}
                        aria-label={`Move ${item.nameId} up`}
                        className={textButton}
                        onClick={() => run(key, () => moveScent(item.id, -1))}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        disabled={busy || index === items.length - 1}
                        aria-label={`Move ${item.nameId} down`}
                        className={textButton}
                        onClick={() => run(key, () => moveScent(item.id, 1))}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        className={textButton}
                        onClick={() => setDraft({ id: item.id, nameId: item.nameId, nameEn: item.nameEn })}
                      >
                        Rename
                      </button>
                      <button type="button" disabled={busy} className={textButton} onClick={() => setConfirming(key)}>
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <form onSubmit={onSave} className="order-1 space-y-6 border border-line bg-white p-6 lg:sticky lg:top-8 lg:order-2">
        <p className="text-[12px] tracking-[0.16em] text-ink uppercase">{draft.id ? "Rename scent" : "Add a scent"}</p>
        <Field id="scent-name-id" label="Name (Indonesian)">
          <input
            id="scent-name-id"
            value={draft.nameId}
            onChange={(event) => setDraft({ ...draft, nameId: event.target.value })}
            required
            maxLength={MAX_SCENT_NAME}
            disabled={busy}
            placeholder="Kopi"
            className={inputClass}
          />
        </Field>
        <Field id="scent-name-en" label="Name (English)" hint="Optional. The Indonesian is shown when empty.">
          <input
            id="scent-name-en"
            value={draft.nameEn}
            onChange={(event) => setDraft({ ...draft, nameEn: event.target.value })}
            maxLength={MAX_SCENT_NAME}
            disabled={busy}
            placeholder="Coffee"
            aria-describedby="scent-name-en-hint"
            className={inputClass}
          />
        </Field>
        <div className="flex gap-3">
          <button type="submit" disabled={busy || (!draft.id && items.length >= MAX_SCENTS)} className={buttonClass}>
            {pending === "save" ? "Saving…" : draft.id ? "Save" : "Add scent"}
          </button>
          {draft.id ? (
            <button type="button" disabled={busy} onClick={() => setDraft(emptyDraft)} className={buttonGhostClass}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
