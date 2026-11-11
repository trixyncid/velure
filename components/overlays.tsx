"use client";

import {
  FormEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  collections,
  freeShippingThreshold,
} from "@/lib/content";
import { formatPrice } from "@/lib/format";
import {
  buildOrderMessage,
  conciergeUrl,
  createOrderReference,
  productInquiryUrl,
  whatsappUrl,
} from "@/lib/whatsapp";
import { useI18n } from "@/lib/i18n/client";
import { MAX_QTY, useCommerce, useLockScroll, useShowCollection } from "@/components/commerce";
import {
  IconArrow,
  IconBag,
  IconCheck,
  IconChevron,
  IconClose,
  IconMinus,
  IconPlus,
  IconSearch,
  IconWhatsApp,
} from "@/components/icons";
import { PriceTag, ProductImage } from "@/components/product-media";
import { Stars } from "@/components/stars";

const CUSTOMER_KEY = "velure-customer";

function readSavedCustomer(): { name: string; city: string } {
  try {
    const value = JSON.parse(localStorage.getItem(CUSTOMER_KEY) ?? "{}");
    return {
      name: typeof value.name === "string" ? value.name : "",
      city: typeof value.city === "string" ? value.city : "",
    };
  } catch {
    return { name: "", city: "" };
  }
}

function saveCustomer(value: { name: string; city: string }) {
  try {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(value));
  } catch {
    // Not critical: the form just won't be prefilled next time.
  }
}

export function Overlays() {
  return (
    <>
      <CartDrawer />
      <ProductDialog />
      <SearchDialog />
      <AddedToast />
      <FloatingConcierge />
    </>
  );
}

function Backdrop({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      aria-label={t.common.closeDialog}
      tabIndex={open ? 0 : -1}
      className={`absolute inset-0 bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    />
  );
}

function QtyStepper({
  value,
  onChange,
  label,
  min = 0,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
  min?: number;
}) {
  const { t } = useI18n();
  return (
    <div className="inline-flex items-center border border-line bg-white">
      <button
        type="button"
        className="grid size-9 place-items-center text-ink/70 hover:text-ink disabled:opacity-30"
        aria-label={t.common.decrease(label)}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <IconMinus className="size-3.5" />
      </button>
      <span className="w-7 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="grid size-9 place-items-center text-ink/70 hover:text-ink disabled:opacity-30"
        aria-label={t.common.increase(label)}
        disabled={value >= MAX_QTY}
        onClick={() => onChange(value + 1)}
      >
        <IconPlus className="size-3.5" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bag & WhatsApp checkout                                                    */
/* -------------------------------------------------------------------------- */

type Phase = "bag" | "details" | "sent";

const steps: Phase[] = ["bag", "details", "sent"];

function Stepper({ phase }: { phase: Phase }) {
  const { t } = useI18n();
  const currentIndex = steps.indexOf(phase);
  return (
    <ol className="flex items-center gap-2 px-6 py-3.5 text-[10px] tracking-[0.2em] uppercase">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              aria-current={current ? "step" : undefined}
              className={`flex items-center gap-1.5 ${
                current ? "text-ink" : done ? "text-gold" : "text-muted/70"
              }`}
            >
              <span
                className={`grid size-5 place-items-center rounded-full border text-[10px] ${
                  current
                    ? "border-ink bg-ink text-white"
                    : done
                      ? "border-gold bg-gold text-white"
                      : "border-line"
                }`}
              >
                {done ? <IconCheck className="size-3" /> : index + 1}
              </span>
              {t.cart.steps[step]}
            </span>
            {index < steps.length - 1 ? (
              <span className={`h-px flex-1 ${done ? "bg-gold" : "bg-line"}`} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function CartDrawer() {
  const {
    panel,
    closePanel,
    cart,
    setQty,
    removeFromCart,
    clearCart,
    subtotal,
    cartCount,
    getProduct,
  } = useCommerce();
  const showCollection = useShowCollection();
  const { locale, t } = useI18n();
  const open = panel === "cart";
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<Phase>("bag");
  const [nameError, setNameError] = useState("");
  const [customer, setCustomer] = useState({ name: "", city: "" });
  const [receipt, setReceipt] = useState<{
    name: string;
    total: number;
    reference: string;
    url: string;
  } | null>(null);

  function closeCart() {
    // Keep the success screen until the drawer is closed, then reset.
    if (phase === "sent") setPhase("bag");
    setNameError("");
    closePanel();
  }

  useLockScroll(open, closeCart);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const showEmpty = phase !== "sent" && cart.length === 0;

  function goToDetails() {
    setCustomer(readSavedCustomer());
    setPhase("details");
  }

  function sendOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const city = String(data.get("city") ?? "").trim();
    const note = String(data.get("note") ?? "").trim();
    if (name.length < 2) {
      setNameError(t.cart.nameError);
      event.currentTarget.querySelector<HTMLInputElement>("#order-name")?.focus();
      return;
    }
    setNameError("");
    saveCustomer({ name, city });
    const reference = createOrderReference();
    const url = whatsappUrl(
      buildOrderMessage({
        locale,
        reference,
        customer: { name, city, note },
        lines: cart,
        getProduct,
      }),
    );
    // Opened synchronously inside the submit handler so popup blockers allow it.
    window.open(url, "_blank", "noopener,noreferrer");
    setReceipt({ name, total: subtotal, reference, url });
    clearCart();
    setPhase("sent");
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <Backdrop open={open} onClose={closeCart} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!open}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-background shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2">
            {phase === "details" ? (
              <button
                type="button"
                onClick={() => setPhase("bag")}
                className="-ml-2 grid size-9 place-items-center"
                aria-label={t.cart.back}
              >
                <IconChevron className="size-5" />
              </button>
            ) : null}
            <h2 id={titleId} className="font-serif text-[28px] leading-none">
              {phase === "details"
                ? t.cart.titleDetails
                : phase === "sent"
                  ? t.cart.titleSent
                  : t.cart.titleBag}
            </h2>
            {phase === "bag" && cartCount > 0 ? (
              <span className="mt-1 text-[12px] text-muted">
                ({t.common.items(cartCount)})
              </span>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="grid size-10 place-items-center"
            aria-label={t.cart.close}
          >
            <IconClose className="size-5" />
          </button>
        </header>

        {!showEmpty ? (
          <div className="border-b border-line bg-ivory/50">
            <Stepper phase={phase} />
          </div>
        ) : null}

        {phase === "sent" && receipt ? (
          <SentScreen receipt={receipt} onClose={closeCart} />
        ) : showEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-ivory">
              <IconBag className="size-7 text-muted" />
            </span>
            <p className="mt-6 font-serif text-[30px] leading-tight">{t.cart.emptyTitle}</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
              {t.cart.emptyBody}
            </p>
            <button
              type="button"
              onClick={() => {
                closeCart();
                showCollection("All");
              }}
              className="mt-8 inline-flex items-center gap-2 bg-ink px-7 py-3.5 text-[12px] tracking-[0.2em] text-white uppercase"
            >
              {t.cart.emptyCta} <IconArrow className="size-4" />
            </button>
          </div>
        ) : phase === "bag" ? (
          <>
            <div className="border-b border-line px-6 py-4">
              <p className="text-[13px] text-ink/80">
                {remaining > 0 ? (
                  <>
                    {t.cart.addMoreBefore}{" "}
                    <span className="font-medium text-ink">{formatPrice(remaining)}</span>{" "}
                    {t.cart.addMoreAfter}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <IconCheck className="size-4 text-gold" /> {t.cart.freeUnlocked}
                  </span>
                )}
              </p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-gold transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {cart.map((line) => {
                const product = getProduct(line.id);
                if (!product || product.price == null) return null;
                return (
                  <li key={line.id} className="flex gap-4 py-5">
                    <div className="relative size-24 shrink-0 overflow-hidden bg-[#f3ede4]">
                      <ProductImage product={product} sizes="96px" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-serif text-[20px] leading-tight">{product.name}</p>
                          <p className="mt-0.5 truncate text-[12px] text-muted">
                            {product.categories.map((c) => t.categories[c]).join(" · ")}
                          </p>
                        </div>
                        <p className="text-sm font-medium tabular-nums">
                          {formatPrice(product.price * line.qty)}
                        </p>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <QtyStepper
                          value={line.qty}
                          label={product.name}
                          min={1}
                          onChange={(next) => setQty(line.id, next)}
                        />
                        <button
                          type="button"
                          onClick={() => removeFromCart(line.id)}
                          className="text-[11px] tracking-[0.14em] text-muted uppercase underline-offset-4 hover:text-ink hover:underline"
                        >
                          {t.cart.remove}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line bg-white px-6 pt-5 pb-6">
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] tracking-[0.18em] uppercase">{t.cart.subtotal}</span>
                <span className="font-serif text-[30px] leading-none tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-5 text-muted">
                {remaining > 0 ? t.cart.shippingConfirmed : ""}
                {t.cart.nothingCharged}
              </p>
              <button
                type="button"
                onClick={goToDetails}
                className="mt-5 flex w-full items-center justify-center gap-2 bg-ink py-4 text-[12px] tracking-[0.2em] text-white uppercase transition-colors duration-300 hover:bg-[#2a2620]"
              >
                {t.cart.continue} <IconArrow className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={sendOrder} noValidate className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div className="flex items-center justify-between bg-ivory px-4 py-3.5">
                <div className="flex -space-x-3">
                  {cart.slice(0, 4).map((line) => {
                    const product = getProduct(line.id);
                    return product ? (
                      <span
                        key={line.id}
                        className="relative size-10 overflow-hidden rounded-full border-2 border-ivory bg-[#f3ede4]"
                      >
                        <ProductImage product={product} sizes="40px" />
                      </span>
                    ) : null;
                  })}
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-muted">
                    {t.common.items(cartCount)}
                  </p>
                  <p className="font-medium tabular-nums">{formatPrice(subtotal)}</p>
                </div>
              </div>

              <div>
                <p className="text-[14px] leading-6 text-muted">
                  {t.cart.detailsIntro}
                </p>
              </div>

              <Field label={t.cart.name} htmlFor="order-name" error={nameError}>
                <input
                  id="order-name"
                  name="name"
                  autoComplete="name"
                  defaultValue={customer.name}
                  key={`name-${customer.name}`}
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={nameError ? "order-name-error" : undefined}
                  className={inputClass(!!nameError)}
                />
              </Field>
              <Field label={t.cart.city} htmlFor="order-city" optional>
                <input
                  id="order-city"
                  name="city"
                  autoComplete="address-level2"
                  defaultValue={customer.city}
                  key={`city-${customer.city}`}
                  placeholder={t.cart.cityPlaceholder}
                  className={inputClass(false)}
                />
              </Field>
              <Field label={t.cart.note} htmlFor="order-note" optional>
                <textarea
                  id="order-note"
                  name="note"
                  rows={3}
                  maxLength={500}
                  placeholder={t.cart.notePlaceholder}
                  className={`${inputClass(false)} resize-none`}
                />
              </Field>
            </div>
            <div className="border-t border-line bg-white px-6 pt-5 pb-6">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2.5 bg-ink py-4 text-[12px] tracking-[0.2em] text-white uppercase transition-colors duration-300 hover:bg-[#2a2620]"
              >
                <IconWhatsApp className="size-[18px]" />
                {t.cart.send}
              </button>
              <p className="mt-3 text-center text-[12px] leading-5 text-muted">
                {t.cart.sendHintTop}
                <br />
                {t.cart.sendHintBottom}
              </p>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}

function inputClass(invalid: boolean) {
  return `mt-2 w-full border bg-white px-3.5 py-3 text-[15px] outline-none transition-colors placeholder:text-muted/60 focus:border-ink focus:shadow-[inset_0_0_0_1px_var(--ink)] ${
    invalid ? "border-sale" : "border-line"
  }`;
}

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
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-[11px] tracking-[0.16em] uppercase">
        {label}
        {optional ? (
          <span className="text-[11px] tracking-normal text-muted normal-case">{t.common.optional}</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-[12px] text-sale">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SentScreen({
  receipt,
  onClose,
}: {
  receipt: { name: string; total: number; reference: string; url: string };
  onClose: () => void;
}) {
  const { t } = useI18n();
  const next = t.cart.next;
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-8">
      <span className="animate-pop grid size-14 place-items-center rounded-full bg-ink text-white">
        <IconCheck className="size-7" />
      </span>
      <p className="mt-6 text-[11px] tracking-[0.28em] text-gold uppercase">
        {t.cart.reference(receipt.reference)}
      </p>
      <p className="mt-2 font-serif text-[36px] leading-tight">
        {t.cart.thanks(receipt.name.split(" ")[0])}
      </p>
      <p className="mt-3 text-sm leading-7 text-muted">
        {t.cart.readyBefore}{" "}
        <span className="font-medium text-ink">{formatPrice(receipt.total)}</span>{" "}
        {t.cart.readyAfter}
      </p>

      <ol className="mt-8 space-y-4 border-y border-line py-6">
        {next.map((item, index) => (
          <li key={item} className="flex gap-3.5 text-[14px] leading-6">
            <span className="grid size-6 shrink-0 place-items-center rounded-full border border-champagne text-[11px]">
              {index + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>

      <div className="mt-auto space-y-3 pt-8">
        <a
          href={receipt.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2.5 bg-ink py-4 text-[12px] tracking-[0.2em] text-white uppercase"
        >
          <IconWhatsApp className="size-[18px]" />
          {t.cart.reopen}
        </a>
        <button
          type="button"
          onClick={onClose}
          className="w-full border border-line py-4 text-[12px] tracking-[0.2em] uppercase hover:border-ink"
        >
          {t.cart.keepBrowsing}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Product quick view                                                         */
/* -------------------------------------------------------------------------- */

function ProductDialog() {
  const { panel, viewingId, closePanel, addToCart, getProduct } = useCommerce();
  const { locale, t } = useI18n();
  const open = panel === "product";
  const product = viewingId ? getProduct(viewingId) : undefined;
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(0);
  const [shownId, setShownId] = useState(viewingId);

  // Reset quantity and photo whenever a different product is opened.
  if (shownId !== viewingId) {
    setShownId(viewingId);
    setQty(1);
    setPhoto(0);
  }

  useLockScroll(open, closePanel);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6 ${
        open ? "" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <Backdrop open={open} onClose={closePanel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!open}
        className={`relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-background shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid-cols-2 ${
          open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={closePanel}
          className="absolute top-3 right-3 z-10 grid size-10 place-items-center bg-white/80 backdrop-blur"
          aria-label={t.productDialog.close}
        >
          <IconClose className="size-5" />
        </button>
        {product ? (
          <>
            <div className="flex flex-col bg-[#f3ede4]">
              <div className="relative aspect-square md:aspect-auto md:min-h-[480px] md:flex-1">
                <ProductImage
                  key={photo}
                  product={product}
                  index={photo}
                  alt={t.shop.bottleAlt(product.name)}
                  sizes="(max-width: 768px) 100vw, 448px"
                  className="animate-fade"
                />
                <span className="absolute top-4 left-4 flex flex-col items-start gap-1.5">
                  {product.bestSeller ? (
                    <span className="bg-white/95 px-2 py-1 text-[10px] tracking-[0.14em] uppercase">
                      {t.shop.bestSeller}
                    </span>
                  ) : null}
                  {product.discount > 0 ? (
                    <span className="bg-ink px-2 py-1 text-[11px] text-white">
                      −{product.discount}%
                    </span>
                  ) : null}
                </span>
              </div>
              {product.images.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {product.images.map((src, index) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setPhoto(index)}
                      aria-label={t.productDialog.photo(index + 1)}
                      aria-current={index === photo}
                      className={`relative size-16 shrink-0 overflow-hidden border-2 transition-colors ${
                        index === photo ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col px-6 py-8 md:px-9 md:py-10">
              {product.categories.length > 0 ? (
                <p className="text-[11px] tracking-[0.28em] text-gold uppercase">
                  {product.categories.map((category) => t.categories[category]).join(" · ")}
                </p>
              ) : null}
              <h2 id={titleId} className="mt-2 pr-8 font-serif text-[40px] leading-none">
                {product.name}
              </h2>
              {product.rating != null ? (
                <div className="mt-3 flex items-center gap-2">
                  <Stars value={product.rating} />
                  <span className="text-[12px] text-muted">
                    {t.productDialog.reviews(product.rating.toFixed(1), product.reviews)}
                  </span>
                </div>
              ) : null}
              <div className="mt-5">
                <PriceTag product={product} size="lg" />
              </div>
              <p className="mt-5 text-[15px] leading-7 whitespace-pre-line text-muted">
                {product.description || t.shop.noDescription}
              </p>

              {product.categories.length > 0 ? (
                <>
                  <p className="mt-6 text-[11px] tracking-[0.2em] uppercase">
                    {t.productDialog.forWhom}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {product.categories.map((category) => (
                      <li
                        key={category}
                        className="rounded-full border border-champagne/80 px-3.5 py-1.5 text-[12px]"
                      >
                        {t.categories[category]}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {product.price != null ? (
                <>
                  <div className="mt-8 flex gap-3 md:mt-auto md:pt-8">
                    <QtyStepper value={qty} min={1} label={product.name} onChange={setQty} />
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product.id, qty);
                        closePanel();
                      }}
                      className="flex flex-1 items-center justify-center gap-2 bg-ink px-3 text-[12px] tracking-[0.18em] text-white uppercase transition-colors duration-300 hover:bg-[#2a2620]"
                    >
                      {t.productDialog.addToBag(formatPrice(product.price * qty))}
                    </button>
                  </div>
                  <a
                    href={productInquiryUrl(product, locale)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-2 text-[12px] tracking-[0.14em] text-muted uppercase underline-offset-4 hover:text-ink hover:underline"
                  >
                    <IconWhatsApp className="size-4" />
                    {t.productDialog.ask}
                  </a>
                </>
              ) : (
                <a
                  href={productInquiryUrl(product, locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex items-center justify-center gap-2.5 bg-ink py-4 text-[12px] tracking-[0.2em] text-white uppercase transition-colors duration-300 hover:bg-[#2a2620] md:mt-auto"
                >
                  <IconWhatsApp className="size-[18px]" />
                  {t.shop.askPrice}
                </a>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Search                                                                     */
/* -------------------------------------------------------------------------- */

function SearchDialog() {
  const { panel, closePanel, openProduct, products } = useCommerce();
  const showCollection = useShowCollection();
  const { locale, t } = useI18n();
  const open = panel === "search";
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  function closeSearch() {
    setQuery("");
    closePanel();
  }

  useLockScroll(open, closeSearch);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const needle = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!needle) return products;
    return products.filter((product) => {
      return [
        product.name,
        product.description,
        ...product.categories,
        ...product.categories.map((category) => t.categories[category]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [needle, t, products]);

  const collectionResults = useMemo(() => {
    if (!needle) return [];
    return collections.filter((collection) => {
      const item = t.collections.items[collection.id];
      return `${item.eyebrow} ${item.title}`.toLowerCase().includes(needle);
    });
  }, [needle, t]);

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <Backdrop open={open} onClose={closeSearch} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!open}
        className={`absolute inset-x-0 top-0 mx-auto w-full max-w-2xl bg-background shadow-2xl transition-all duration-300 sm:top-16 ${
          open ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
        }`}
      >
        <h2 id={titleId} className="sr-only">
          {t.search.title}
        </h2>
        <div className="relative flex items-center gap-3 border-b border-line px-5 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 focus-within:after:scale-x-100">
          <IconSearch className="size-5 shrink-0 text-muted transition-colors [div:focus-within>&]:text-ink" />
          <label htmlFor="site-search" className="sr-only">
            {t.search.title}
          </label>
          <input
            ref={inputRef}
            id="site-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search.placeholder}
            className="min-w-0 flex-1 bg-transparent py-5 font-serif text-[19px] outline-none placeholder:text-muted/60 sm:text-[22px]"
          />
          <button
            type="button"
            onClick={closeSearch}
            className="grid size-10 shrink-0 place-items-center"
            aria-label={t.search.close}
          >
            <IconClose className="size-5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {!needle ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {(["Women", "Men", "Unisex"] as const).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    closeSearch();
                    showCollection(category);
                  }}
                  className="rounded-full border border-line px-3.5 py-1.5 text-[12px] transition-colors hover:border-ink"
                >
                  {t.categories[category]}
                </button>
              ))}
            </div>
          ) : null}
          {collectionResults.length > 0 ? (
            <ul className="mb-2">
              {collectionResults.map((collection) => (
                <li key={collection.id}>
                  <button
                    type="button"
                    onClick={() => {
                      closeSearch();
                      showCollection(collection.filter);
                    }}
                    className="flex w-full items-center justify-between py-2.5 text-left text-[12px] tracking-[0.16em] uppercase hover:text-gold"
                  >
                    {t.search.collection(t.collections.items[collection.id].eyebrow)}{" "}
                    <IconArrow className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {results.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-serif text-2xl">{t.search.noMatch(query.trim())}</p>
              <p className="mt-2 text-sm text-muted">
                {t.search.tryBefore}{" "}
                <a
                  href={conciergeUrl(locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-4"
                >
                  {t.search.askConcierge}
                </a>
                .
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      openProduct(product.id);
                    }}
                    className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-ivory/70"
                  >
                    <span className="relative size-14 shrink-0 overflow-hidden bg-[#f3ede4]">
                      <ProductImage product={product} sizes="56px" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-serif text-[19px] leading-tight">{product.name}</span>
                      <span className="block truncate text-[12px] text-muted">
                        {product.categories.map((c) => t.categories[c]).join(" · ")}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm tabular-nums">
                      {product.price != null ? formatPrice(product.price) : "—"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Feedback & quick access                                                    */
/* -------------------------------------------------------------------------- */

const TOAST_MS = 4000;

function AddedToast() {
  const { toast, dismissToast, openPanel, cartCount, subtotal, getProduct } = useCommerce();
  const { t } = useI18n();
  const [paused, setPaused] = useState(false);
  const product = toast ? getProduct(toast.productId) : undefined;

  useEffect(() => {
    if (!toast || paused) return;
    const timeout = window.setTimeout(dismissToast, TOAST_MS);
    return () => window.clearTimeout(timeout);
  }, [toast, paused, dismissToast]);

  if (!toast || !product) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[45] flex justify-center px-3 sm:top-5">
      <div
        key={toast.key}
        role="status"
        aria-live="polite"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="animate-toast-down pointer-events-auto relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/60 bg-white/85 shadow-[0_24px_60px_-12px_rgba(28,25,21,0.35),0_0_0_1px_rgba(28,25,21,0.04)] backdrop-blur-xl backdrop-saturate-150"
      >
        <div className="flex items-center gap-3.5 p-3 pr-2.5">
          <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-[#f3ede4]">
            <ProductImage product={product} sizes="48px" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] whitespace-nowrap text-gold uppercase">
              <span className="grid size-4 shrink-0 place-items-center rounded-full bg-gold text-white">
                <IconCheck className="size-2.5" />
              </span>
              <span className="truncate">{t.toast.title}</span>
            </p>
            <p className="mt-1 truncate font-serif text-[19px] leading-tight text-ink">
              {product.name}
            </p>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            className="grid size-8 shrink-0 place-items-center self-start rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
            aria-label={t.toast.dismiss}
          >
            <IconClose className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-ink/[0.06] bg-white/50 py-2.5 pr-3 pl-4">
          <p className="min-w-0 leading-tight tabular-nums">
            <span className="block truncate text-[11px] text-muted">
              {t.cart.subtotal} · {t.common.items(cartCount)}
            </span>
            <span className="block text-[14px] font-medium text-ink">{formatPrice(subtotal)}</span>
          </p>
          <button
            type="button"
            onClick={() => openPanel("cart")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[10px] font-medium tracking-[0.16em] whitespace-nowrap text-white uppercase transition-colors hover:bg-[#2a2620]"
          >
            {t.toast.viewBag}
            <IconArrow className="size-3" />
          </button>
        </div>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gold/70"
          style={{
            animation: `toast-timer ${TOAST_MS}ms linear forwards`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      </div>
    </div>
  );
}

function FloatingConcierge() {
  const { panel } = useCommerce();
  const { locale, t } = useI18n();
  const hidden = panel !== null;
  return (
    <a
      href={conciergeUrl(locale)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.floating.label}
      tabIndex={hidden ? -1 : undefined}
      className={`group fixed right-4 bottom-4 z-30 flex h-14 min-w-14 items-center justify-center rounded-full bg-ink px-4 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:pr-5 focus-visible:pr-5 sm:right-6 sm:bottom-6 ${
        hidden ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100"
      }`}
    >
      <IconWhatsApp className="size-6 shrink-0" />
      <span className="max-w-0 overflow-hidden text-[11px] tracking-[0.16em] whitespace-nowrap uppercase transition-[max-width,margin] duration-300 group-hover:ml-2 group-hover:max-w-[8rem] group-focus-visible:ml-2 group-focus-visible:max-w-[8rem]">
        {t.floating.short}
      </span>
    </a>
  );
}
