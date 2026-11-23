"use client";

import { useEffect, useRef, useState } from "react";
import { useCommerce } from "@/components/commerce";
import { IconCheck, IconWhatsApp } from "@/components/icons";
import type { LandingProduct } from "@/lib/landing/types";
import { productInquiryUrl } from "@/lib/whatsapp";
import { useLandingContent } from "@/components/landing/hooks";
import { QuantityStepper } from "@/components/landing/order/QuantityStepper";
import { GenderTags, Price, ProductPhoto } from "@/components/landing/ProductBits";

/**
 * Everything about one perfume, straight from the CMS, in buying order: name and price,
 * what it is like, size and quantity with the two ways to buy, then the scent pyramid. Used inside the detail panel, and inline when the
 * collection holds a single perfume. Ordering goes through the storefront's existing cart.
 */
export function ProductDetail({
  product,
  headingId,
  headingLevel = "h3",
  eager = false,
}: {
  product: LandingProduct;
  headingId: string;
  headingLevel?: "h2" | "h3";
  eager?: boolean;
}) {
  const { c, locale } = useLandingContent();
  const { addToCart, openPanel } = useCommerce();
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(0);
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);
  const Heading = headingLevel;

  useEffect(() => () => void (timer.current && window.clearTimeout(timer.current)), []);

  const photos = product.images;
  const hasNotes = c.pyramid.tiers.some((tier) => product.notes[tier.key].length > 0);

  function add() {
    addToCart(product.id, qty);
    setAdded(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:gap-12 lg:gap-16">
      <div>
        <ProductPhoto
          product={product}
          src={photos[photo]}
          alt={c.fallback.bottleAlt(product.name)}
          sizes="(max-width: 768px) 92vw, 560px"
          eager={eager}
          className="aspect-[4/5] w-full border border-white/10"
        />
        {photos.length > 1 ? (
          <ul className="mt-3 flex gap-2.5">
            {photos.map((src, index) => (
              <li key={src}>
                <button
                  type="button"
                  aria-label={c.collection.photo(product.name, index + 1)}
                  aria-pressed={index === photo}
                  onClick={() => setPhoto(index)}
                  className={`block w-16 border transition-colors duration-300 ${
                    index === photo ? "border-champagne" : "border-white/15 opacity-70 hover:opacity-100"
                  }`}
                >
                  <ProductPhoto product={product} src={src} alt="" sizes="64px" className="aspect-[4/5] w-full" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="md:py-2">
        <p className="eyebrow">{c.brand.collection}</p>
        <Heading
          id={headingId}
          className="mt-3 font-serif text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02] font-medium text-[#f4efe4]"
        >
          {product.name}
        </Heading>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <GenderTags product={product} />
          {product.price != null ? <Price product={product} /> : null}
        </div>

        {product.character ? (
          <p className="mt-6 text-[15px] leading-7 text-[#e4dccb]">
            <span className="mb-1 block text-[10px] tracking-[0.26em] text-gold uppercase">
              {c.collection.characterLabel}
            </span>
            {product.character}
          </p>
        ) : null}

        {product.scent.scents.length > 0 ? (
          <div className="mt-5">
            <p className="mb-2 text-[10px] tracking-[0.26em] text-gold uppercase">{c.collection.scentsLabel}</p>
            <ul className="flex flex-wrap gap-1.5">
              {product.scent.scents.map((scent) => (
                <li key={scent.id} className="border border-champagne/40 px-2.5 py-1 text-[12.5px] text-champagne">
                  {(locale === "en" && scent.nameEn) || scent.nameId}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-4 text-[15px] leading-7 whitespace-pre-line text-[#cfc9bc]">
          {product.prose || c.collection.noDescription}
        </p>

        <div className="mt-7 border-t border-white/10 pt-6">
          <p className="text-[10px] tracking-[0.24em] text-white/50 uppercase">{c.order.variantLabel}</p>
          <p className="mt-2 inline-block border border-champagne/60 px-3.5 py-2 text-[13px] text-champagne">
            {product.size ?? c.brand.size}
          </p>

          {product.price != null ? (
            <>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="mb-2 text-[10px] tracking-[0.24em] text-white/50 uppercase">{c.order.quantity}</p>
                  <QuantityStepper value={qty} onChange={setQty} label={product.name} />
                </div>
                <div className="text-right">
                  <p className="mb-2 text-[10px] tracking-[0.24em] text-white/50 uppercase">{c.order.total}</p>
                  <Price product={product} qty={qty} large />
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button type="button" className="btn-ghost" onClick={add}>
                  {added ? (
                    <span className="animate-pop inline-flex items-center gap-2 text-champagne">
                      <IconCheck className="size-4" /> {c.order.added}
                    </span>
                  ) : (
                    c.order.addToCart
                  )}
                </button>
                <button
                  type="button"
                  className="btn-gold"
                  onClick={() => {
                    addToCart(product.id, qty);
                    openPanel("cart");
                  }}
                >
                  {c.order.buyNow}
                </button>
              </div>
              <p className="mt-4 text-[12.5px] leading-5 text-white/50">{c.order.note}</p>
              <p className="sr-only" aria-live="polite">
                {added ? c.order.added : ""}
              </p>
            </>
          ) : (
            <div className="mt-6">
              <Price product={product} large />
              <a
                href={productInquiryUrl(product, locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold mt-5 w-full"
              >
                <IconWhatsApp className="size-[18px]" />
                {c.order.askPrice}
              </a>
            </div>
          )}
        </div>
        {/* How the scent smells, layer by layer. Not a list of what it is made from. */}
        <div className="mt-7 border-t border-white/10 pt-6">
          <p className="text-[10px] tracking-[0.26em] text-gold uppercase">{c.pyramid.eyebrow}</p>
          {hasNotes ? (
            <dl className="mt-4 space-y-4">
              {c.pyramid.tiers.map((tier) => {
                const notes = product.notes[tier.key];
                if (notes.length === 0) return null;
                return (
                  <div key={tier.key} className="grid gap-2 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
                    <dt>
                      <span className="block font-serif text-[19px] leading-tight text-champagne">{tier.title}</span>
                      <span className="block text-[11px] text-white/45">{tier.hint}</span>
                    </dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {notes.map((note) => (
                        <span key={note} className="border border-white/15 px-2.5 py-1 text-[12.5px] text-[#e4dccb]">
                          {note}
                        </span>
                      ))}
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : (
            <p className="mt-3 text-[13.5px] text-white/50 italic">{c.pyramid.notesPending}</p>
          )}
        </div>

      </div>
    </div>
  );
}
