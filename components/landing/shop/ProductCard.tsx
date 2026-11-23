"use client";

import { useEffect, useRef, useState } from "react";
import { useCommerce } from "@/components/commerce";
import { IconArrow, IconCheck, IconWhatsApp } from "@/components/icons";
import { openProduct } from "@/lib/landing/scroll";
import type { LandingProduct } from "@/lib/landing/types";
import { productInquiryUrl } from "@/lib/whatsapp";
import { useLandingContent } from "@/components/landing/hooks";
import { GenderTags, Price, ProductPhoto } from "@/components/landing/ProductBits";

/** One perfume in the collection grid. The photo and "Lihat Detail" open its detail panel. */
export function ProductCard({ product, eager }: { product: LandingProduct; eager: boolean }) {
  const { c, locale } = useLandingContent();
  const { addToCart } = useCommerce();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => void (timer.current && window.clearTimeout(timer.current)), []);

  function add() {
    addToCart(product.id, 1);
    setAdded(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article
      aria-labelledby={`card-${product.id}`}
      className="flex h-full flex-col border border-white/10 bg-white/[0.02] transition-colors duration-500 hover:border-champagne/40"
    >
      <button
        type="button"
        onClick={() => openProduct(product.id, product.slug)}
        aria-hidden="true"
        tabIndex={-1}
        className="group block text-left"
      >
        <ProductPhoto
          product={product}
          alt={c.fallback.bottleAlt(product.name)}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 320px"
          eager={eager}
          className="aspect-square w-full sm:aspect-[4/5]"
        />
      </button>

      <div className="flex flex-1 flex-col px-5 pt-5 pb-5">
        <h3 id={`card-${product.id}`} className="font-serif text-[26px] leading-[1.08] font-medium text-[#f4efe4]">
          {product.name}
        </h3>
        <div className="mt-3">
          <GenderTags product={product} />
        </div>
        {product.character ? (
          <p className="mt-3 line-clamp-2 text-[13.5px] leading-6 text-[#cfc9bc]">{product.character}</p>
        ) : null}

        <div className="mt-auto pt-5">
          <Price product={product} />
          <div className="mt-4 grid gap-2.5">
            {product.price != null ? (
              <button type="button" className="btn-gold w-full" onClick={add}>
                {added ? (
                  <span className="animate-pop inline-flex items-center gap-2">
                    <IconCheck className="size-4" /> {c.order.added}
                  </span>
                ) : (
                  c.collection.add
                )}
              </button>
            ) : (
              <a
                href={productInquiryUrl(product, locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full"
              >
                <IconWhatsApp className="size-[18px]" />
                {c.order.askPrice}
              </a>
            )}
            <button
              type="button"
              className="btn-ghost w-full"
              onClick={() => openProduct(product.id, product.slug)}
              aria-label={c.collection.detailsFor(product.name)}
            >
              {c.collection.details}
              <IconArrow className="size-4" />
            </button>
          </div>
          <p className="sr-only" aria-live="polite">
            {added ? c.order.added : ""}
          </p>
        </div>
      </div>
    </article>
  );
}
