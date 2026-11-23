"use client";

import type { FormEvent, ReactNode } from "react";
import { IconWhatsApp } from "@/components/icons";
import { useI18n } from "@/lib/i18n/client";

const input =
  "mt-2 w-full border bg-white/[0.04] px-3.5 py-3 text-[15px] text-[#f4efe4] outline-none transition-colors placeholder:text-white/30 focus:border-champagne";

function Field({
  label,
  htmlFor,
  optional,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-[11px] tracking-[0.16em] text-white/80 uppercase">
        {label}
        {optional ? <span className="text-[11px] tracking-normal text-white/40 normal-case">{t.common.optional}</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-[12px] text-[#ff8f8f]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The customer details step of the existing WhatsApp order flow: name, destination city
 * and a note. Submitting hands the data to the cart drawer, which builds the WhatsApp message.
 */
export function CheckoutForm({
  defaults,
  nameError,
  summary,
  onSubmit,
}: {
  defaults: { name: string; city: string };
  nameError: string;
  summary: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const { t } = useI18n();
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col overflow-hidden">
      <div data-lenis-prevent className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        {summary}
        <p className="text-[14px] leading-6 text-white/60">{t.cart.detailsIntro}</p>
        <Field label={t.cart.name} htmlFor="order-name" error={nameError}>
          <input
            id="order-name"
            name="name"
            autoComplete="name"
            defaultValue={defaults.name}
            key={`name-${defaults.name}`}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? "order-name-error" : undefined}
            className={`${input} ${nameError ? "border-[#ff8f8f]" : "border-white/15"}`}
          />
        </Field>
        <Field label={t.cart.city} htmlFor="order-city" optional>
          <input
            id="order-city"
            name="city"
            autoComplete="address-level2"
            defaultValue={defaults.city}
            key={`city-${defaults.city}`}
            placeholder={t.cart.cityPlaceholder}
            className={`${input} border-white/15`}
          />
        </Field>
        <Field label={t.cart.note} htmlFor="order-note" optional>
          <textarea
            id="order-note"
            name="note"
            rows={3}
            maxLength={500}
            placeholder={t.cart.notePlaceholder}
            className={`${input} resize-none border-white/15`}
          />
        </Field>
      </div>
      <div className="border-t border-white/10 px-6 pt-5 pb-6">
        <button type="submit" className="btn-gold w-full">
          <IconWhatsApp className="size-[18px]" />
          {t.cart.send}
        </button>
        <p className="mt-3 text-center text-[12px] leading-5 text-white/50">
          {t.cart.sendHintTop}
          <br />
          {t.cart.sendHintBottom}
        </p>
      </div>
    </form>
  );
}
