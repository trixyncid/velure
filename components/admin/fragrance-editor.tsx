"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteFragrance, saveFragrance } from "@/app/admin/(panel)/perfumes/actions";
import { IconChevron } from "@/components/icons";
import { useToast } from "@/components/admin/toast";
import { Field, buttonClass, buttonGhostClass, inputClass, textAreaClass } from "@/components/admin/ui";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_DISCOUNT,
  MAX_NAME_LENGTH,
  MAX_CHARACTER_LENGTH,
  MAX_PHOTOGRAPHS,
  genders,
  parseNotesInput,
  salePrice,
  type Fragrance,
  type GenderValue,
  type Photograph,
} from "@/lib/catalog";
import type { ScentRecord } from "@/lib/scent-types";
import { formatPrice } from "@/lib/format";

const accept = "image/jpeg,image/png,image/webp,image/avif,image/gif";

/** A row of on/off chips, styled like "Worn by". */
function ToggleGroup<Value extends string>({
  label,
  hint,
  options,
  selected,
  disabled,
  onToggle,
}: {
  label: string;
  hint?: string;
  options: readonly { value: Value; label: string }[];
  selected: Value[];
  disabled: boolean;
  onToggle: (value: Value) => void;
}) {
  return (
    <div>
      <p className="text-[12px] tracking-[0.16em] text-muted uppercase">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onToggle(option.value)}
              className={`px-4 py-2 text-[12px] tracking-[0.14em] uppercase transition-colors ${
                active ? "bg-ink text-white" : "border border-line text-muted hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {hint ? <p className="mt-2 text-xs leading-5 text-muted">{hint}</p> : null}
    </div>
  );
}

export function FragranceEditor({
  fragrance,
  storageReady,
  scents,
}: {
  fragrance?: Fragrance;
  storageReady: boolean;
  /** The scent list, for ticking the scents this fragrance has. */
  scents: ScentRecord[];
}) {
  const router = useRouter();
  const notify = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const persisted = useRef(new Set(fragrance?.images.map((image) => image.fileKey) ?? []));
  const [name, setName] = useState(fragrance?.name ?? "");
  const [description, setDescription] = useState(fragrance?.description ?? "");
  const [selectedGenders, setSelectedGenders] = useState<GenderValue[]>(fragrance?.genders ?? []);
  const [images, setImages] = useState<Photograph[]>(fragrance?.images ?? []);
  const [price, setPrice] = useState(fragrance?.price ? String(fragrance.price) : "");
  const [discount, setDiscount] = useState(fragrance?.discount ? String(fragrance.discount) : "");
  const [bestSeller, setBestSeller] = useState(fragrance?.bestSeller ?? false);
  const [scentIds, setScentIds] = useState<string[]>(fragrance?.scentIds ?? []);
  const [character, setCharacter] = useState(fragrance?.character ?? "");
  const [topNotes, setTopNotes] = useState(fragrance?.topNotes.join(", ") ?? "");
  const [middleNotes, setMiddleNotes] = useState(fragrance?.middleNotes.join(", ") ?? "");
  const [baseNotes, setBaseNotes] = useState(fragrance?.baseNotes.join(", ") ?? "");
  const priceValue = price ? Number(price) : null;
  const discountValue = discount ? Number(discount) : null;
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function toggleGender(value: GenderValue) {
    setSelectedGenders((current) =>
      current.includes(value) ? current.filter((gender) => gender !== value) : [...current, value],
    );
  }

  async function uploadFiles(files: File[]) {
    const room = MAX_PHOTOGRAPHS - images.length;
    if (room <= 0) {
      notify({
        tone: "warning",
        title: "Photograph limit reached",
        message: `A fragrance can keep ${MAX_PHOTOGRAPHS} photographs.`,
      });
      return;
    }

    const accepted = files.filter((file) => accept.split(",").includes(file.type)).slice(0, room);
    if (accepted.length === 0) {
      notify({
        tone: "error",
        title: "Could not upload",
        message: "Use a JPEG, PNG, WebP, AVIF, or GIF image.",
      });
      return;
    }

    setUploading(accepted.length);
    const settled = await Promise.allSettled(accepted.map(uploadFile));
    setUploading(0);

    const next: Photograph[] = [];
    let uploadError = "";
    for (const result of settled) {
      if (result.status === "fulfilled") next.push(result.value);
      else if (!uploadError) {
        uploadError =
          result.reason instanceof Error ? result.reason.message : "Could not upload that photograph.";
      }
    }
    if (next.length > 0) {
      setImages((current) => [...current, ...next].slice(0, MAX_PHOTOGRAPHS));
      notify({
        tone: "success",
        title: "Uploaded",
        message: next.length === 1 ? "Photograph added." : `${next.length} photographs added.`,
      });
    }
    if (accepted.length < files.length) {
      notify({
        tone: "warning",
        title: "Some files were left out",
        message:
          files.length > room
            ? `Only ${MAX_PHOTOGRAPHS} photographs can be kept.`
            : "Use a JPEG, PNG, WebP, AVIF, or GIF image.",
      });
    }
    if (uploadError) {
      notify({ tone: "error", title: "Could not upload", message: uploadError });
    }
  }

  async function removeImage(fileKey: string) {
    setImages((current) => current.filter((image) => image.fileKey !== fileKey));
    if (persisted.current.has(fileKey)) return;
    const response = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: fileKey }),
    });
    if (!response.ok) {
      notify({
        tone: "warning",
        title: "Photograph removed from this fragrance",
        message: "The stored file could not be deleted.",
      });
    }
  }

  function makeCover(fileKey: string) {
    setImages((current) => {
      const index = current.findIndex((image) => image.fileKey === fileKey);
      if (index <= 0) return current;
      const next = [...current];
      const [cover] = next.splice(index, 1);
      next.unshift(cover);
      return next;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await saveFragrance({
      id: fragrance?.id,
      name,
      description,
      genders: selectedGenders,
      price: priceValue,
      discount: discountValue,
      bestSeller,
      scentIds,
      character,
      topNotes: parseNotesInput(topNotes),
      middleNotes: parseNotesInput(middleNotes),
      baseNotes: parseNotesInput(baseNotes),
      images: images.map(({ fileKey, fileType, fileSize }) => ({ fileKey, fileType, fileSize })),
    });
    setPending(false);

    if (!result.ok) {
      notify({
        tone: "error",
        title: fragrance ? "Could not update" : "Could not save",
        message: result.error,
      });
      return;
    }

    persisted.current = new Set(images.map((image) => image.fileKey));
    notify({
      tone: "success",
      title: fragrance ? "Updated" : "Saved",
      message: fragrance ? "Changes saved." : "The fragrance is in the catalog.",
    });
    if (!fragrance) {
      router.push(`/admin/perfumes/${result.id}`);
    }
    router.refresh();
  }

  async function onDelete() {
    if (!fragrance) return;
    setPending(true);
    const result = await deleteFragrance(fragrance.id);
    if (!result.ok) {
      setPending(false);
      notify({ tone: "error", title: "Could not delete", message: result.error });
      return;
    }
    notify({
      tone: "success",
      title: "Removed",
      message: "The fragrance and its photographs were deleted.",
    });
    router.push("/admin/perfumes");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <Link
        href="/admin/perfumes"
        className="inline-flex items-center gap-1 text-[12px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-ink"
      >
        <IconChevron className="size-4" />
        Fragrances
      </Link>
      <h1 className="mt-4 font-serif text-5xl text-ink">
        {fragrance ? fragrance.name : "New fragrance"}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
        A name, who it is for, its price, and the photographs that introduce it. The first
        photograph is the cover.
      </p>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
        <section className="space-y-6 border border-line bg-white p-6 md:p-8">
          <Field id="fragrance-name" label="Name">
            <input
              id="fragrance-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={MAX_NAME_LENGTH}
              disabled={pending}
              className={inputClass}
            />
          </Field>

          <div>
            <p className="text-[12px] tracking-[0.16em] text-muted uppercase">Worn by</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {genders.map((gender) => {
                const active = selectedGenders.includes(gender.value);
                return (
                  <button
                    key={gender.value}
                    type="button"
                    aria-pressed={active}
                    disabled={pending}
                    onClick={() => toggleGender(gender.value)}
                    className={`px-4 py-2 text-[12px] tracking-[0.14em] uppercase transition-colors ${
                      active ? "bg-ink text-white" : "border border-line text-muted hover:text-ink"
                    }`}
                  >
                    {gender.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_140px]">
            <Field
              id="fragrance-price"
              label="Price (Rupiah)"
              hint="Leave empty to show “price on request” in the shop."
            >
              <div className="mt-2 flex items-baseline gap-2 border-b border-line focus-within:border-ink">
                <span className="text-sm text-muted">Rp</span>
                <input
                  id="fragrance-price"
                  inputMode="numeric"
                  autoComplete="off"
                  value={price ? Number(price).toLocaleString("id-ID") : ""}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
                    setPrice(digits);
                    if (!digits) setDiscount("");
                  }}
                  placeholder="1.250.000"
                  disabled={pending}
                  aria-describedby="fragrance-price-hint"
                  className="w-full bg-transparent py-3 text-sm text-ink tabular-nums outline-none placeholder:text-muted/50"
                />
              </div>
            </Field>
            <Field id="fragrance-discount" label="Discount">
              <div className="mt-2 flex items-baseline gap-2 border-b border-line focus-within:border-ink">
                <input
                  id="fragrance-discount"
                  inputMode="numeric"
                  autoComplete="off"
                  value={discount}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 2);
                    setDiscount(digits && Number(digits) > MAX_DISCOUNT ? String(MAX_DISCOUNT) : digits);
                  }}
                  placeholder="0"
                  disabled={pending || !price}
                  className="w-full bg-transparent py-3 text-sm text-ink tabular-nums outline-none placeholder:text-muted/50 disabled:opacity-50"
                />
                <span className="text-sm text-muted">%</span>
              </div>
            </Field>
          </div>
          {priceValue && discountValue ? (
            <p className="-mt-3 text-xs text-muted">
              Shown in the shop as{" "}
              <span className="text-ink">{formatPrice(salePrice(priceValue, discountValue))}</span>{" "}
              <span className="line-through">{formatPrice(priceValue)}</span>
            </p>
          ) : null}

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={bestSeller}
              onChange={(event) => setBestSeller(event.target.checked)}
              disabled={pending}
              className="mt-0.5 size-4 accent-ink"
            />
            <span>
              <span className="block text-[12px] tracking-[0.16em] text-ink uppercase">Best seller</span>
              <span className="mt-1 block text-xs leading-5 text-muted">
                Highlighted with a badge and shown first in the shop.
              </span>
            </span>
          </label>

          <Field
            id="fragrance-description"
            label="Description"
            hint="Optional. A short note about the fragrance."
          >
            <textarea
              id="fragrance-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={MAX_DESCRIPTION_LENGTH}
              disabled={pending}
              aria-describedby="fragrance-description-hint"
              className={textAreaClass}
            />
          </Field>

          {/* How the perfume smells. Powers the shop's detail view and its scent finder. */}
          <div className="space-y-6 border-t border-line pt-6">
            <div>
              <p className="text-[12px] tracking-[0.16em] text-ink uppercase">Scent profile</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                How the fragrance smells. The scents decide when “Help me choose” recommends it; the
                summary and notes are shown on its product page.
              </p>
            </div>

            <ToggleGroup
              label="Scents"
              hint="Tick every scent this fragrance has. Visitors who pick them in “Help me choose” are matched to it."
              options={scents.map((scent) => ({ value: scent.id, label: scent.nameEn || scent.nameId }))}
              selected={scentIds}
              disabled={pending}
              onToggle={(value) =>
                setScentIds((current) =>
                  current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
                )
              }
            />
            <p className="-mt-3 text-xs leading-5 text-muted">
              {scents.length === 0 ? "There are no scents yet. " : "Missing one? "}
              <Link href="/admin/scent" className="text-ink underline underline-offset-4">
                {scents.length === 0 ? "Add scents" : "Add or rename scents"}
              </Link>
              .
            </p>

            <Field
              id="fragrance-character"
              label="Scent summary"
              hint="One line shown on the product page as “Karakter Aroma”, e.g. “Warm, woody and a little spicy”."
            >
              <input
                id="fragrance-character"
                value={character}
                onChange={(event) => setCharacter(event.target.value)}
                maxLength={MAX_CHARACTER_LENGTH}
                disabled={pending}
                aria-describedby="fragrance-character-hint"
                className={inputClass}
              />
            </Field>

            <div className="grid gap-6 sm:grid-cols-3">
              {(
                [
                  ["fragrance-top-notes", "Top notes", topNotes, setTopNotes],
                  ["fragrance-middle-notes", "Middle notes", middleNotes, setMiddleNotes],
                  ["fragrance-base-notes", "Base notes", baseNotes, setBaseNotes],
                ] as const
              ).map(([id, label, value, setValue]) => (
                <Field key={id} id={id} label={label}>
                  <input
                    id={id}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Separate with commas"
                    autoComplete="off"
                    disabled={pending}
                    className={inputClass}
                  />
                </Field>
              ))}
            </div>
          </div>
        </section>

        <section className="border border-line bg-white p-6 md:p-8">
          <p className="text-[12px] tracking-[0.16em] text-muted uppercase">Photographs</p>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              if (storageReady) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              if (!storageReady || pending) return;
              void uploadFiles([...event.dataTransfer.files]);
            }}
            className={`mt-4 border border-dashed px-5 py-8 text-center transition-colors ${
              dragging ? "border-gold bg-ivory" : "border-line"
            }`}
          >
            {storageReady ? (
              <>
                <p className="text-sm text-ink">Drop photographs here</p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  JPEG, PNG, WebP, AVIF, or GIF · up to 8 MB · {images.length}/{MAX_PHOTOGRAPHS}
                </p>
                <button
                  type="button"
                  disabled={pending || uploading > 0 || images.length >= MAX_PHOTOGRAPHS}
                  onClick={() => fileRef.current?.click()}
                  className={`${buttonGhostClass} mt-5`}
                >
                  {uploading > 0 ? "Uploading" : "Choose photographs"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept={accept}
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    const files = [...(event.target.files ?? [])];
                    event.target.value = "";
                    void uploadFiles(files);
                  }}
                />
              </>
            ) : (
              <p className="text-sm leading-6 text-muted">
                Connect DigitalOcean Spaces to add photographs. The fragrance can still be saved.
              </p>
            )}
          </div>

          {images.length > 0 ? (
            <ul className="mt-5 grid grid-cols-2 gap-3">
              {images.map((image, index) => (
                <li key={image.fileKey} className="border border-line">
                  <div className="relative aspect-square bg-ivory">
                    {image.url ? (
                      <Image
                        src={image.url}
                        alt={`Photograph ${index + 1}${name ? ` of ${name}` : ""}`}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="grid h-full place-items-center px-3 text-center text-xs text-muted">
                        Stored
                      </span>
                    )}
                    {index === 0 ? (
                      <span className="absolute top-2 left-2 bg-white px-2 py-1 text-[10px] tracking-[0.14em] text-ink uppercase">
                        Cover
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-2 px-2 py-2">
                    {index === 0 ? (
                      <span className="text-[10px] tracking-[0.12em] text-muted uppercase">
                        {formatBytes(image.fileSize)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => makeCover(image.fileKey)}
                        className="text-[10px] tracking-[0.12em] text-muted uppercase hover:text-ink"
                      >
                        Make cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void removeImage(image.fileKey)}
                      className="text-[10px] tracking-[0.12em] text-muted uppercase hover:text-sale"
                      aria-label={`Remove photograph ${index + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      <div className="mt-6 flex flex-col gap-4 border border-line bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="min-w-0 flex-1">
          {fragrance && confirmDelete ? (
            <p className="text-sm leading-6 text-muted">
              This removes the fragrance and its photographs.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {fragrance ? (
            confirmDelete ? (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={pending}
                  className={buttonGhostClass}
                >
                  Keep
                </button>
                <button
                  type="button"
                  onClick={() => void onDelete()}
                  disabled={pending}
                  className="inline-flex items-center justify-center bg-sale px-5 py-3 text-[12px] tracking-[0.18em] text-white uppercase disabled:opacity-60"
                >
                  {pending ? "Removing" : "Delete"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={pending}
                className="text-[12px] tracking-[0.16em] text-muted uppercase hover:text-sale"
              >
                Delete
              </button>
            )
          ) : null}
          <button type="submit" disabled={pending || uploading > 0} className={buttonClass}>
            {pending && !confirmDelete ? "Saving" : fragrance ? "Save changes" : "Save fragrance"}
          </button>
        </div>
      </div>
    </form>
  );
}

async function uploadFile(file: File): Promise<Photograph> {
  const body = new FormData();
  body.set("file", file);
  const response = await fetch("/api/admin/media", { method: "POST", body });
  const payload = (await response.json().catch(() => null)) as {
    error?: string;
    key?: string;
    url?: string;
    contentType?: string;
    size?: number;
  } | null;
  if (!response.ok || !payload?.key || !payload.url) {
    throw new Error(payload?.error || "Could not upload that photograph.");
  }
  return {
    fileKey: payload.key,
    url: payload.url,
    fileType: payload.contentType || file.type,
    fileSize: payload.size ?? file.size,
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
