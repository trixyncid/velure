"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { MAX_QTY, useCommerce, useLockScroll } from "@/components/commerce";
import { IconArrow, IconBag, IconCheck, IconChevron, IconClose, IconWhatsApp } from "@/components/icons";
import { freeShippingThreshold } from "@/lib/content";
import { formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { scrollToSection } from "@/lib/landing/scroll";
import { buildOrderMessage, createOrderReference, whatsappUrl } from "@/lib/whatsapp";
import { CheckoutForm } from "@/components/landing/order/CheckoutForm";
import { QuantityStepper } from "@/components/landing/order/QuantityStepper";
import { ProductThumb } from "@/components/landing/ProductBits";

/**
 * Cart and checkout for the night theme. The logic is the storefront's existing flow,
 * unchanged: the cart lives in CommerceProvider, and checkout builds a WhatsApp order
 * message with lib/whatsapp.ts. No payment is taken on the site.
 */

const CUSTOMER_KEY = "velure-customer";
type Phase = "bag" | "details" | "sent";
const PHASES: Phase[] = ["bag", "details", "sent"];

type Receipt = {
  name: string;
  total: number;
  reference: string;
  url: string;
  lines: { id: string; name: string; qty: number; total: number }[];
};

function readSavedCustomer() {
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

function Steps({ phase }: { phase: Phase }) {
  const { t } = useI18n();
  const currentIndex = PHASES.indexOf(phase);
  return (
    <ol className="flex items-center gap-2 px-6 py-3.5 text-[10px] tracking-[0.2em] uppercase">
      {PHASES.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              aria-current={current ? "step" : undefined}
              className={`flex items-center gap-1.5 ${current ? "text-[#f4efe4]" : done ? "text-gold" : "text-white/40"}`}
            >
              <span
                className={`grid size-5 place-items-center rounded-full border text-[10px] ${
                  current ? "border-champagne bg-champagne text-[#070a14]" : done ? "border-gold bg-gold text-[#070a14]" : "border-white/20"
                }`}
              >
                {done ? <IconCheck className="size-3" /> : index + 1}
              </span>
              {t.cart.steps[step]}
            </span>
            {index < PHASES.length - 1 ? <span className={`h-px flex-1 ${done ? "bg-gold" : "bg-white/15"}`} /> : null}
          </li>
        );
      })}
    </ol>
  );
}

function SentScreen({ receipt, onClose }: { receipt: Receipt; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <div data-lenis-prevent className="flex flex-1 flex-col overflow-y-auto px-6 py-8">
      <span className="relative grid size-14 place-items-center">
        <span className="gold-burst absolute inset-0 rounded-full border border-gold" aria-hidden="true" />
        <span className="gold-burst absolute inset-0 rounded-full bg-gold/30 [animation-delay:200ms]" aria-hidden="true" />
        <span className="animate-pop relative grid size-14 place-items-center rounded-full bg-champagne text-[#070a14]">
          <IconCheck className="size-7" />
        </span>
      </span>
      <p className="mt-6 text-[11px] tracking-[0.28em] text-gold uppercase">{t.cart.reference(receipt.reference)}</p>
      <p className="mt-2 font-serif text-[36px] leading-tight text-[#f4efe4]">{t.cart.thanks(receipt.name.split(" ")[0])}</p>
      <p className="mt-3 text-sm leading-7 text-white/65">
        {t.cart.readyBefore} <span className="font-medium text-[#f4efe4]">{formatPrice(receipt.total)}</span>{" "}
        {t.cart.readyAfter}
      </p>

      <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
        {receipt.lines.map((line) => (
          <li key={line.id} className="flex items-baseline justify-between gap-4 py-3 text-[14px]">
            <span className="min-w-0 truncate text-[#e4dccb]">
              {line.qty} × {line.name}
            </span>
            <span className="shrink-0 tabular-nums text-[#f4efe4]">{formatPrice(line.total)}</span>
          </li>
        ))}
        <li className="flex items-baseline justify-between gap-4 py-3 text-[14px]">
          <span className="text-[11px] tracking-[0.18em] text-white/60 uppercase">{t.cart.subtotal}</span>
          <span className="font-serif text-[22px] tabular-nums text-[#f4efe4]">{formatPrice(receipt.total)}</span>
        </li>
      </ul>

      <ol className="mt-6 space-y-3.5">
        {t.cart.next.map((item, index) => (
          <li key={item} className="flex gap-3.5 text-[14px] leading-6 text-white/75">
            <span className="grid size-6 shrink-0 place-items-center rounded-full border border-champagne/60 text-[11px] text-champagne">
              {index + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>

      <div className="mt-auto space-y-3 pt-8">
        <a href={receipt.url} target="_blank" rel="noopener noreferrer" className="btn-gold w-full">
          <IconWhatsApp className="size-[18px]" />
          {t.cart.reopen}
        </a>
        <button type="button" onClick={onClose} className="btn-ghost w-full">
          {t.cart.keepBrowsing}
        </button>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { panel, closePanel, cart, setQty, removeFromCart, clearCart, subtotal, cartCount, getProduct } = useCommerce();
  const { locale, t } = useI18n();
  const open = panel === "cart";
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<Phase>("bag");
  const [nameError, setNameError] = useState("");
  const [customer, setCustomer] = useState({ name: "", city: "" });
  const [receipt, setReceipt] = useState<Receipt | null>(null);

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
      buildOrderMessage({ locale, reference, customer: { name, city, note }, lines: cart, getProduct }),
    );
    // Opened synchronously inside the submit handler so popup blockers allow it.
    window.open(url, "_blank", "noopener,noreferrer");
    setReceipt({
      name,
      total: subtotal,
      reference,
      url,
      lines: cart.flatMap((line) => {
        const product = getProduct(line.id);
        if (!product || product.price == null) return [];
        return [{ id: line.id, name: product.name, qty: line.qty, total: product.price * line.qty }];
      }),
    });
    clearCart();
    setPhase("sent");
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label={t.common.closeDialog}
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 bg-black/55 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeCart}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!open}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col border-l border-white/10 bg-[#070a14]/95 text-[#ece7dc] shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            {phase === "details" ? (
              <button type="button" onClick={() => setPhase("bag")} className="-ml-2 grid size-9 place-items-center" aria-label={t.cart.back}>
                <IconChevron className="size-5" />
              </button>
            ) : null}
            <h2 id={titleId} className="font-serif text-[28px] leading-none text-[#f4efe4]">
              {phase === "details" ? t.cart.titleDetails : phase === "sent" ? t.cart.titleSent : t.cart.titleBag}
            </h2>
            {phase === "bag" && cartCount > 0 ? (
              <span className="mt-1 text-[12px] text-white/50">({t.common.items(cartCount)})</span>
            ) : null}
          </div>
          <button ref={closeRef} type="button" onClick={closeCart} className="grid size-10 place-items-center" aria-label={t.cart.close}>
            <IconClose className="size-5" />
          </button>
        </header>

        {!showEmpty ? (
          <div className="border-b border-white/10 bg-white/[0.03]">
            <Steps phase={phase} />
          </div>
        ) : null}

        {phase === "sent" && receipt ? (
          <SentScreen receipt={receipt} onClose={closeCart} />
        ) : showEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full border border-white/15">
              <IconBag className="size-7 text-white/60" />
            </span>
            <p className="mt-6 font-serif text-[30px] leading-tight text-[#f4efe4]">{t.cart.emptyTitle}</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-white/60">{t.cart.emptyBody}</p>
            <button
              type="button"
              onClick={() => {
                closeCart();
                scrollToSection("collection");
              }}
              className="btn-gold mt-8"
            >
              {t.cart.emptyCta} <IconArrow className="size-4" />
            </button>
          </div>
        ) : phase === "bag" ? (
          <>
            <div className="border-b border-white/10 px-6 py-4">
              <p className="text-[13px] text-white/80">
                {remaining > 0 ? (
                  <>
                    {t.cart.addMoreBefore} <span className="font-medium text-[#f4efe4]">{formatPrice(remaining)}</span>{" "}
                    {t.cart.addMoreAfter}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <IconCheck className="size-4 text-gold" /> {t.cart.freeUnlocked}
                  </span>
                )}
              </p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <ul data-lenis-prevent className="flex-1 divide-y divide-white/10 overflow-y-auto px-6">
              {cart.map((line) => {
                const product = getProduct(line.id);
                if (!product || product.price == null) return null;
                return (
                  <li key={line.id} className="flex gap-4 py-5">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-white/10">
                      <ProductThumb product={product} sizes="80px" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-serif text-[20px] leading-tight text-[#f4efe4]">{product.name}</p>
                          <p className="mt-0.5 truncate text-[12px] text-white/50">
                            {product.categories.map((category) => t.categories[category]).join(" · ")}
                          </p>
                        </div>
                        <p className="text-sm font-medium tabular-nums">{formatPrice(product.price * line.qty)}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <QuantityStepper size="sm" value={Math.min(line.qty, MAX_QTY)} label={product.name} onChange={(next) => setQty(line.id, next)} />
                        <button
                          type="button"
                          onClick={() => removeFromCart(line.id)}
                          className="text-[11px] tracking-[0.14em] text-white/50 uppercase underline-offset-4 hover:text-white hover:underline"
                        >
                          {t.cart.remove}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-white/10 px-6 pt-5 pb-6">
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] tracking-[0.18em] uppercase">{t.cart.subtotal}</span>
                <span className="font-serif text-[30px] leading-none tabular-nums text-[#f4efe4]">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-2 text-[12px] leading-5 text-white/50">
                {remaining > 0 ? t.cart.shippingConfirmed : ""}
                {t.cart.nothingCharged}
              </p>
              <button
                type="button"
                onClick={() => {
                  setCustomer(readSavedCustomer());
                  setPhase("details");
                }}
                className="btn-gold mt-5 w-full"
              >
                {t.cart.continue} <IconArrow className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <CheckoutForm
            defaults={customer}
            nameError={nameError}
            onSubmit={sendOrder}
            summary={
              <div className="flex items-center justify-between border border-white/10 bg-white/[0.03] px-4 py-3.5">
                <p className="text-[12px] text-white/55">{t.common.items(cartCount)}</p>
                <p className="font-medium tabular-nums">{formatPrice(subtotal)}</p>
              </div>
            }
          />
        )}
      </aside>
    </div>
  );
}
