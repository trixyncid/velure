"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLockScroll } from "@/components/commerce";
import { IconPlus } from "@/components/icons";
import { useLanding } from "@/lib/landing/film";
import { closeProduct, getLenis } from "@/lib/landing/scroll";
import type { LandingProduct } from "@/lib/landing/types";
import { useLandingContent } from "@/components/landing/hooks";
import { ProductDetail } from "@/components/landing/shop/ProductDetail";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A perfume's detail, opened over the page: a sheet from the bottom on phones, a centred
 * panel on larger screens. Focus moves in, stays in, and returns to where it came from.
 */
export function ProductPanel({ products }: { products: LandingProduct[] }) {
  const { c } = useLandingContent();
  const detailId = useLanding((state) => state.detailId);
  const product = products.find((item) => item.id === detailId) ?? null;
  const open = product !== null;
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const close = useCallback(() => closeProduct(), []);
  useLockScroll(open, close);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    getLenis()?.stop();
    closeButton.current?.focus();
    return () => {
      getLenis()?.start();
      opener.current?.focus({ preventScroll: true });
    };
  }, [open]);

  function trapFocus(event: React.KeyboardEvent) {
    if (event.key !== "Tab" || !panel.current) return;
    const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((item) => item.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className={`fixed inset-0 z-[45] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        tabIndex={-1}
        aria-label={c.collection.close}
        onClick={close}
        className={`absolute inset-0 bg-[#02030a]/80 backdrop-blur-sm transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        inert={!open}
        onKeyDown={trapFocus}
        className={`absolute inset-x-0 bottom-0 mx-auto flex max-h-[92svh] w-full max-w-[1120px] flex-col border border-white/10 bg-[#070a14] shadow-[0_-30px_120px_rgba(0,0,0,0.6)] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:top-1/2 md:bottom-auto md:max-h-[88svh] md:-translate-y-1/2 ${
          open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 md:-translate-y-[46%]"
        }`}
      >
        <div className="flex items-center justify-end border-b border-white/10 px-3 py-2">
          <button
            ref={closeButton}
            type="button"
            onClick={close}
            aria-label={c.collection.close}
            className="grid size-11 place-items-center text-white/70 transition-colors hover:text-champagne"
          >
            <IconPlus className="size-5 rotate-45" />
          </button>
        </div>
        <div data-lenis-prevent className="overflow-y-auto overscroll-contain px-5 py-6 md:px-10 md:py-10">
          {product ? <ProductDetail key={product.id} product={product} headingId="detail-title" eager /> : null}
        </div>
      </div>
    </div>
  );
}
