"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { LandingProduct } from "@/lib/landing/types";
import { useLandingContent } from "@/components/landing/hooks";

export function Price({ product, qty = 1, large = false }: { product: LandingProduct; qty?: number; large?: boolean }) {
  const { c } = useLandingContent();
  if (product.price == null) {
    return <p className={`text-champagne/80 italic ${large ? "text-[18px]" : "text-[14px]"}`}>{c.order.priceOnRequest}</p>;
  }
  return (
    <p className="flex flex-wrap items-baseline gap-x-3">
      <span className={`font-serif tabular-nums text-[#f4efe4] ${large ? "text-[34px] leading-none" : "text-[24px] leading-none"}`}>
        {formatPrice(product.price * qty)}
      </span>
      {product.compareAt ? (
        <span className="text-[13px] text-white/45 tabular-nums line-through">
          {formatPrice(product.compareAt * qty)}
        </span>
      ) : null}
      {product.discount > 0 ? (
        <span className="border border-champagne/50 px-1.5 py-0.5 text-[11px] text-champagne">−{product.discount}%</span>
      ) : null}
    </p>
  );
}

export function GenderTags({ product }: { product: LandingProduct }) {
  const { t } = useLandingContent();
  if (product.tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {product.tags.map((tag) => (
        <li key={tag} className="border border-champagne/40 px-3 py-1 text-[10px] tracking-[0.22em] text-champagne uppercase">
          {t.categories[tag]}
        </li>
      ))}
    </ul>
  );
}

/** CMS photo, or a swatch in the perfume's colour when it has none. */
export function ProductThumb({
  product,
  sizes,
  className = "",
}: {
  product: { images: string[]; theme?: LandingProduct["theme"] };
  sizes: string;
  className?: string;
}) {
  const src = product.images[0];
  const accent = product.theme?.accentColor ?? "#d7c4a4";
  const liquid = product.theme?.liquidColor ?? "#c9a35c";
  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={`absolute inset-0 ${className}`}
        style={{
          background: `radial-gradient(circle at 35% 30%, ${accent}, ${liquid} 55%, #070a14)`,
        }}
      />
    );
  }
  return <Image src={src} alt="" fill sizes={sizes} className={`object-cover ${className}`} />;
}

/**
 * A perfume's CMS photo in a fixed-ratio frame. The frame is tinted with the perfume's
 * colours and the photo fades in once loaded, so nothing jumps or flashes while it arrives.
 */
export function ProductPhoto({
  product,
  src = product.images[0],
  alt,
  sizes,
  eager = false,
  className = "",
}: {
  product: LandingProduct;
  src?: string;
  alt: string;
  sizes: string;
  eager?: boolean;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const { accentColor, liquidColor } = product.theme;
  return (
    <div
      className={`relative overflow-hidden bg-[#0a0e1a] ${className}`}
      style={{
        backgroundImage: `radial-gradient(ellipse 70% 55% at 50% 62%, ${liquidColor}55, ${accentColor}14 55%, transparent 78%)`,
      }}
    >
      {src ? (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          className={`object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.04] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
    </div>
  );
}
