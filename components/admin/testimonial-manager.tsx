"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteTestimonial,
  moveTestimonial,
  saveTestimonial,
  setTestimonialPublished,
} from "@/app/admin/(panel)/testimonials/actions";
import { useToast } from "@/components/admin/toast";
import { Field, buttonClass, buttonGhostClass, inputClass, textAreaClass } from "@/components/admin/ui";
import {
  MAX_TESTIMONIAL_NAME,
  MAX_TESTIMONIAL_PLACE,
  MAX_TESTIMONIAL_QUOTE,
  type Testimonial,
} from "@/lib/testimonial-types";

type Draft = {
  id?: string;
  name: string;
  place: string;
  quoteId: string;
  quoteEn: string;
  published: boolean;
};

const emptyDraft: Draft = { name: "", place: "", quoteId: "", quoteEn: "", published: true };

const textButton =
  "text-[11px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-ink disabled:opacity-40 disabled:hover:text-muted";

export function TestimonialManager({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const notify = useToast();
  const panelRef = useRef<HTMLElement>(null);
  const [items, setItems] = useState(testimonials);
  const [known, setKnown] = useState(testimonials);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [pending, setPending] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (known !== testimonials) {
    setKnown(testimonials);
    setItems(testimonials);
  }

  const editing = draft.id ? items.find((item) => item.id === draft.id) : undefined;
  const publishedCount = items.filter((item) => item.published).length;

  function edit(item: Testimonial) {
    setDraft({
      id: item.id,
      name: item.name,
      place: item.place,
      quoteId: item.quoteId,
      quoteEn: item.quoteEn,
      published: item.published,
    });
    if (window.matchMedia("(max-width: 1023px)").matches) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function run(
    key: string,
    action: () => ReturnType<typeof saveTestimonial>,
    success?: { title: string; message?: string },
  ) {
    setPending(key);
    const result = await action();
    setPending(null);
    if (!result.ok) {
      notify({ tone: "error", title: "Could not update testimonials", message: result.error });
      return false;
    }
    setItems(result.testimonials);
    if (success) notify({ tone: "success", ...success });
    router.refresh();
    return true;
  }

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isNew = !draft.id;
    const saved = await run("save", () => saveTestimonial(draft), {
      title: isNew ? "Testimonial added" : "Testimonial updated",
      message: draft.published
        ? "It now appears on the landing page."
        : "It is saved but hidden from the landing page.",
    });
    if (saved && isNew) setDraft(emptyDraft);
  }

  return (
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="order-2 border border-line bg-white lg:order-1">
        <div className="flex items-end justify-between gap-4 border-b border-line px-5 py-4 md:px-6">
          <p className="text-[12px] tracking-[0.16em] text-muted uppercase">
            {items.length} {items.length === 1 ? "testimonial" : "testimonials"} · {publishedCount}{" "}
            on the landing page
          </p>
        </div>

        {items.length === 0 ? (
          <p className="px-5 py-10 text-sm leading-6 text-muted md:px-6">
            No testimonials yet. The section is hidden on the landing page until one is published.
          </p>
        ) : (
          <ol>
            {items.map((item, index) => {
              const confirming = confirmingId === item.id;
              const active = draft.id === item.id;
              const busy = pending !== null;
              return (
                <li
                  key={item.id}
                  className={`border-b border-line last:border-b-0 ${
                    confirming ? "bg-sale/[0.04]" : active ? "bg-ivory" : ""
                  }`}
                >
                  <div className="flex gap-4 px-5 py-5 md:px-6">
                    <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => void run(`move-${item.id}`, () => moveTestimonial(item.id, -1))}
                        disabled={busy || index === 0}
                        aria-label={`Move ${item.name} up`}
                        className="grid size-7 place-items-center text-muted transition-colors hover:text-ink disabled:opacity-25"
                      >
                        <Chevron up />
                      </button>
                      <span className="text-[11px] text-muted tabular-nums">{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => void run(`move-${item.id}`, () => moveTestimonial(item.id, 1))}
                        disabled={busy || index === items.length - 1}
                        aria-label={`Move ${item.name} down`}
                        className="grid size-7 place-items-center text-muted transition-colors hover:text-ink disabled:opacity-25"
                      >
                        <Chevron />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm text-ink">{item.name}</p>
                        {item.place ? <p className="text-xs text-muted">· {item.place}</p> : null}
                        <span
                          className={`px-1.5 py-0.5 text-[10px] tracking-[0.14em] uppercase ${
                            item.published ? "bg-ink text-white" : "border border-line text-muted"
                          }`}
                        >
                          {item.published ? "Published" : "Hidden"}
                        </span>
                      </div>
                      <blockquote className="mt-2 font-serif text-[19px] leading-snug text-ink">
                        “{item.quoteId}”
                      </blockquote>
                      <p className="mt-2 text-[13px] leading-5 text-muted">
                        <span className="mr-1.5 text-[10px] tracking-[0.14em] uppercase">EN</span>
                        {item.quoteEn ? (
                          <>“{item.quoteEn}”</>
                        ) : (
                          <span className="italic">No English version — the Indonesian quote is shown.</span>
                        )}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                        <button type="button" onClick={() => edit(item)} disabled={busy} className={textButton}>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void run(`pub-${item.id}`, () => setTestimonialPublished(item.id, !item.published), {
                              title: item.published ? "Hidden" : "Published",
                              message: item.published
                                ? `${item.name}'s testimonial is no longer on the landing page.`
                                : `${item.name}'s testimonial is on the landing page.`,
                            })
                          }
                          disabled={busy}
                          className={textButton}
                        >
                          {item.published ? "Hide" : "Publish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(confirming ? null : item.id)}
                          aria-expanded={confirming}
                          disabled={busy}
                          className={`${textButton} hover:text-sale`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {confirming ? (
                    <div
                      role="group"
                      aria-label={`Confirm deleting ${item.name}'s testimonial`}
                      className="flex flex-col gap-4 border-t border-sale/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
                    >
                      <p className="text-sm leading-6 text-ink">
                        Delete <span className="font-medium">{item.name}</span>&apos;s testimonial? To
                        keep it but take it off the site, choose Hide instead.
                      </p>
                      <div className="flex shrink-0 gap-3">
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="inline-flex items-center justify-center border border-line bg-white px-4 py-2.5 text-[11px] tracking-[0.16em] uppercase hover:border-ink"
                        >
                          Keep
                        </button>
                        <button
                          type="button"
                          disabled={pending !== null}
                          onClick={async () => {
                            const done = await run(`del-${item.id}`, () => deleteTestimonial(item.id), {
                              title: "Testimonial deleted",
                            });
                            if (done) {
                              setConfirmingId(null);
                              if (draft.id === item.id) setDraft(emptyDraft);
                            }
                          }}
                          className="inline-flex items-center justify-center bg-sale px-4 py-2.5 text-[11px] tracking-[0.16em] text-white uppercase hover:opacity-90 disabled:opacity-60"
                        >
                          {pending === `del-${item.id}` ? "Deleting" : "Delete"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <aside
        ref={panelRef}
        className="order-1 border border-line bg-white p-6 md:p-7 lg:sticky lg:top-8 lg:order-2"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-3xl text-ink">
            {draft.id ? "Edit testimonial" : "New testimonial"}
          </h2>
          {draft.id ? (
            <button type="button" onClick={() => setDraft(emptyDraft)} className={textButton}>
              New instead
            </button>
          ) : null}
        </div>
        {draft.id && editing ? (
          <p className="mt-2 text-sm text-muted">Editing {editing.name}&apos;s quote.</p>
        ) : null}

        <form onSubmit={onSave} className="mt-6 space-y-5">
          <Field id="testimonial-name" label="Customer name">
            <input
              id="testimonial-name"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              maxLength={MAX_TESTIMONIAL_NAME}
              required
              disabled={pending === "save"}
              className={inputClass}
            />
          </Field>
          <Field id="testimonial-place" label="City" hint="Optional. Shown after the name.">
            <input
              id="testimonial-place"
              value={draft.place}
              onChange={(event) => setDraft({ ...draft, place: event.target.value })}
              maxLength={MAX_TESTIMONIAL_PLACE}
              placeholder="Jakarta"
              disabled={pending === "save"}
              aria-describedby="testimonial-place-hint"
              className={inputClass}
            />
          </Field>
          <QuoteField
            id="testimonial-quote-id"
            label="Quote · Indonesian"
            hint="Shown on the Indonesian site."
            value={draft.quoteId}
            required
            disabled={pending === "save"}
            onChange={(quoteId) => setDraft({ ...draft, quoteId })}
          />
          <QuoteField
            id="testimonial-quote-en"
            label="Quote · English"
            hint="Optional. When empty, the English site shows the Indonesian quote."
            value={draft.quoteEn}
            disabled={pending === "save"}
            onChange={(quoteEn) => setDraft({ ...draft, quoteEn })}
          />
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(event) => setDraft({ ...draft, published: event.target.checked })}
              disabled={pending === "save"}
              className="mt-0.5 size-4 accent-ink"
            />
            <span>
              <span className="block text-[12px] tracking-[0.16em] text-ink uppercase">
                Show on the landing page
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted">
                Untick to save it as hidden.
              </span>
            </span>
          </label>
          <div className="flex gap-3">
            {draft.id ? (
              <button
                type="button"
                onClick={() => setDraft(emptyDraft)}
                disabled={pending === "save"}
                className={buttonGhostClass}
              >
                Cancel
              </button>
            ) : null}
            <button type="submit" disabled={pending === "save"} className={`${buttonClass} flex-1`}>
              {pending === "save" ? "Saving" : draft.id ? "Save changes" : "Add testimonial"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function QuoteField({
  id,
  label,
  hint,
  value,
  required,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={MAX_TESTIMONIAL_QUOTE}
        required={required}
        disabled={disabled}
        aria-describedby={`${id}-hint`}
        className={`${textAreaClass} min-h-28`}
      />
      <p className="mt-1 text-right text-[11px] text-muted tabular-nums">
        {value.length}/{MAX_TESTIMONIAL_QUOTE}
      </p>
    </Field>
  );
}

function Chevron({ up = false }: { up?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`size-4 ${up ? "" : "rotate-180"}`}
    >
      <path d="M6.5 14.5L12 9l5.5 5.5" />
    </svg>
  );
}
