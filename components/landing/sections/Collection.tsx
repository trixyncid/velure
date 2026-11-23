"use client";

import { useLanding } from "@/lib/landing/film";
import type { LandingProduct } from "@/lib/landing/types";
import { conciergeUrl } from "@/lib/whatsapp";
import { IconWhatsApp } from "@/components/icons";
import { useLandingContent } from "@/components/landing/hooks";
import { FadeUp } from "@/components/landing/RevealLines";
import { ScrollLink } from "@/components/landing/ScrollLink";
import { ProductCard } from "@/components/landing/shop/ProductCard";
import { ProductDetail } from "@/components/landing/shop/ProductDetail";

/**
 * The collection: every perfume in the CMS, in the order the admin lists them. One perfume
 * is shown in full; two or more become a grid of cards that open a detail panel.
 */
export function Collection({ products }: { products: LandingProduct[] }) {
  const { c, locale } = useLandingContent();
  // Start fetching the first photos while the film's last shot is still playing.
  const warm = useLanding((state) => state.craftStep >= 5 || state.chapter === "shop" || state.chapter === "outro");
  const count = products.length;

  return (
    <section id="collection" aria-labelledby="collection-title" className="scroll-mt-20 px-5 pt-20 pb-20 md:px-10 md:pt-28 md:pb-28">
      <div className="mx-auto max-w-[1320px]">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{c.collection.eyebrow}</p>
          <h2
            id="collection-title"
            className="mt-4 font-serif text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.04] font-medium text-[#f4efe4]"
          >
            {count === 0 ? c.collection.emptyTitle : c.collection.heading}
          </h2>
          <p className="mt-5 text-[15px] leading-7 text-[#cfc9bc] md:text-[16px]">
            {count === 0 ? c.collection.emptyBody : c.collection.intro}
          </p>
          {count > 1 ? (
            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              <span className="text-[11px] tracking-[0.28em] text-white/45 uppercase">{c.collection.count(count)}</span>
              <ScrollLink to="finder" className="link-quiet">
                {c.collection.unsure}
              </ScrollLink>
            </p>
          ) : null}
          {count === 0 ? (
            <a href={conciergeUrl(locale)} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-8">
              <IconWhatsApp className="size-4" /> WhatsApp
            </a>
          ) : null}
        </FadeUp>

        {count === 1 ? (
          <div className="mx-auto mt-14 max-w-[1120px] md:mt-20">
            <ProductDetail product={products[0]} headingId={`featured-${products[0].id}`} eager={warm} />
          </div>
        ) : null}

        {count > 1 ? (
          <ul
            // Two or three perfumes sit centred instead of leaving half a row empty.
            className={`mx-auto mt-14 grid gap-5 sm:grid-cols-2 md:mt-20 xl:gap-6 ${
              count === 2 ? "max-w-[700px]" : count === 3 ? "max-w-[1050px] lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {products.map((product, index) => (
              <li key={product.id}>
                <ProductCard product={product} eager={warm && index < 4} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
