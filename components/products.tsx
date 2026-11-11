"use client";

import { useEffect, useState } from "react";
import type { Product, ShopFilter } from "@/lib/content";
import { useI18n } from "@/lib/i18n/client";
import { conciergeUrl, productInquiryUrl } from "@/lib/whatsapp";
import { useCommerce } from "@/components/commerce";
import { IconCheck, IconPlus, IconWhatsApp } from "@/components/icons";
import { PriceTag, ProductImage, useCategoryLabel } from "@/components/product-media";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Stars } from "@/components/stars";

const filters: ShopFilter[] = ["All", "Women", "Men", "Unisex"];

export function Products() {
  const { products, shopFilter, setShopFilter } = useCommerce();
  const { locale, t } = useI18n();
  const inFilter = (filter: ShopFilter) =>
    filter === "All" ? products : products.filter((p) => p.categories.includes(filter));
  const visible = inFilter(shopFilter);

  return (
    <section
      id="shop"
      aria-labelledby="shop-heading"
      className="scroll-mt-20 border-t border-line bg-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1180px] px-5 md:px-8">
        <Reveal>
          <SectionHeading id="shop-heading" eyebrow={t.shop.eyebrow}>
            {t.shop.heading}
          </SectionHeading>
        </Reveal>

        {products.length === 0 ? (
          <div className="mx-auto mt-12 max-w-md text-center">
            <p className="font-serif text-[28px] leading-tight">{t.shop.emptyTitle}</p>
            <p className="mt-3 text-[15px] leading-7 text-muted">{t.shop.emptyBody}</p>
            <a
              href={conciergeUrl(locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2.5 border border-ink px-7 py-3.5 text-[12px] tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-ink hover:text-white"
            >
              <IconWhatsApp className="size-4" />
              {t.faq.ask}
            </a>
          </div>
        ) : (
          <>
            <div
              role="tablist"
              aria-label={t.shop.filterLabel}
              className="mx-auto mt-10 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-ivory/60 p-1"
            >
              {filters.map((filter) => {
                const active = filter === shopFilter;
                return (
                  <button
                    key={filter}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setShopFilter(filter)}
                    className={`shrink-0 rounded-full px-4 py-2 text-[11px] tracking-[0.16em] uppercase transition-colors duration-300 sm:px-5 ${
                      active ? "bg-ink text-white" : "text-ink/70 hover:text-ink"
                    }`}
                  >
                    {t.categories[filter]}
                    <span className={`ml-1.5 ${active ? "text-white/60" : "text-muted"}`}>
                      {inFilter(filter).length}
                    </span>
                  </button>
                );
              })}
            </div>

            {visible.length === 0 ? (
              <div className="mt-14 text-center">
                <p className="text-[15px] text-muted">{t.shop.emptyFilter}</p>
                <button
                  type="button"
                  onClick={() => setShopFilter("All")}
                  className="mt-4 text-[12px] tracking-[0.16em] uppercase underline underline-offset-4"
                >
                  {t.shop.showAll}
                </button>
              </div>
            ) : (
              <ul className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
                {visible.map((product) => (
                  <li
                    key={product.id}
                    id={`product-${product.id}`}
                    className="animate-fade scroll-mt-28"
                  >
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-14 text-center text-[13px] text-muted">
              {t.shop.notSure}{" "}
              <a href="#how-to-order" className="text-ink underline underline-offset-4">
                {t.shop.seeHow}
              </a>
              .
            </p>
          </>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart, openProduct } = useCommerce();
  const { locale, t } = useI18n();
  const categoryLabel = useCategoryLabel();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [added]);

  return (
    <article className="group flex h-full flex-col">
      <button
        type="button"
        onClick={() => openProduct(product.id)}
        className="relative block aspect-[4/5] overflow-hidden bg-[#f3ede4] text-left"
        aria-label={t.shop.viewDetails(product.name)}
      >
        <ProductImage
          product={product}
          alt={t.shop.bottleAlt(product.name)}
          sizes="(max-width: 1024px) 50vw, 25vw"
          className="transition duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {product.bestSeller ? (
            <span className="bg-white/95 px-2 py-1 text-[10px] tracking-[0.14em] text-ink uppercase">
              {t.shop.bestSeller}
            </span>
          ) : null}
          {product.discount > 0 ? (
            <span className="bg-ink px-2 py-1 text-[10px] tracking-[0.1em] text-white">
              −{product.discount}%
            </span>
          ) : null}
        </span>
        <span className="absolute inset-x-3 bottom-3 hidden translate-y-2 bg-white/95 py-2.5 text-center text-[10px] tracking-[0.2em] uppercase opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block">
          {t.shop.quickView}
        </span>
      </button>
      <div className="flex flex-1 flex-col pt-4">
        {product.categories.length > 0 ? (
          <p className="text-[10px] tracking-[0.22em] text-muted uppercase">
            {categoryLabel(product)}
          </p>
        ) : null}
        <h3 className="mt-1 font-serif text-[22px] leading-tight">
          <button
            type="button"
            onClick={() => openProduct(product.id)}
            className="text-left hover:text-gold"
          >
            {product.name}
          </button>
        </h3>
        {product.rating != null ? (
          <div className="mt-2 flex items-center gap-1.5">
            <Stars value={product.rating} />
            <span className="text-[11px] text-muted">({product.reviews})</span>
          </div>
        ) : null}
        <div className="mt-2">
          <PriceTag product={product} />
        </div>
        <div className="min-h-4 flex-1" />
        {product.price != null ? (
          <button
            type="button"
            onClick={() => {
              addToCart(product.id);
              setAdded(true);
            }}
            className={`flex w-full items-center justify-center gap-2 border py-3 text-[11px] font-medium tracking-[0.18em] uppercase transition-colors duration-300 ${
              added
                ? "border-ink bg-ink text-white"
                : "border-[#d9d1c5] bg-white hover:border-ink hover:bg-ink hover:text-white"
            }`}
          >
            {added ? (
              <>
                <IconCheck className="size-4" /> {t.shop.added}
              </>
            ) : (
              <>
                <IconPlus className="size-3.5" /> {t.shop.addToBag}
              </>
            )}
          </button>
        ) : (
          <a
            href={productInquiryUrl(product, locale)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 border border-[#d9d1c5] bg-white py-3 text-[11px] font-medium tracking-[0.18em] uppercase transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-white"
          >
            <IconWhatsApp className="size-3.5" /> {t.shop.askPrice}
          </a>
        )}
      </div>
    </article>
  );
}
