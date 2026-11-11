"use client";

import Image from "next/image";
import type { Product } from "@/lib/content";
import { formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";

/** Cover photo (or a given photo index), with a monogram when there is no photograph. */
export function ProductImage({
  product,
  sizes,
  index = 0,
  className = "",
  alt = "",
}: {
  product: Product;
  sizes: string;
  index?: number;
  className?: string;
  alt?: string;
}) {
  const src = product.images[index];
  if (!src) {
    return (
      <span
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#f6f1ea] to-[#ece3d6] font-serif text-[clamp(2rem,6vw,4.5rem)] text-ink/20"
      >
        {product.name.trim().charAt(0).toUpperCase() || "V"}
      </span>
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} className={`object-cover ${className}`} />;
}

export function PriceTag({ product, size = "md" }: { product: Product; size?: "md" | "lg" }) {
  const { t } = useI18n();
  if (product.price == null) {
    return (
      <p className={`italic text-muted ${size === "lg" ? "text-[17px]" : "text-[13px]"}`}>
        {t.shop.priceOnRequest}
      </p>
    );
  }
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span
        className={`font-medium tabular-nums ${size === "lg" ? "text-[22px]" : "text-[15px]"}`}
      >
        {formatPrice(product.price)}
      </span>
      {product.compareAt ? (
        <span
          className={`text-muted tabular-nums line-through ${size === "lg" ? "text-[14px]" : "text-[12px]"}`}
        >
          {formatPrice(product.compareAt)}
        </span>
      ) : null}
    </p>
  );
}

export function useCategoryLabel() {
  const { t } = useI18n();
  return (product: Product) => product.categories.map((category) => t.categories[category]).join(" · ");
}
