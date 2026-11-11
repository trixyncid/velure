import { salePrice, type Fragrance } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

type Priced = Pick<Fragrance, "price" | "discount">;

/** The price exactly as the storefront shows it: sale price, original struck through. */
export function PriceSummary({ fragrance, className = "" }: { fragrance: Priced; className?: string }) {
  if (!fragrance.price) {
    return <span className={`text-sm text-muted italic ${className}`}>Price on request</span>;
  }
  const discounted = !!fragrance.discount && fragrance.discount > 0;
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 tabular-nums ${className}`}>
      <span className="text-sm font-medium text-ink">
        {formatPrice(salePrice(fragrance.price, fragrance.discount))}
      </span>
      {discounted ? (
        <span className="text-xs text-muted line-through">{formatPrice(fragrance.price)}</span>
      ) : null}
    </span>
  );
}

/** Best-seller and discount badges, matching the storefront card. */
export function PriceBadges({ fragrance }: { fragrance: Priced & Pick<Fragrance, "bestSeller"> }) {
  const discount = fragrance.price && fragrance.discount ? fragrance.discount : 0;
  if (!fragrance.bestSeller && !discount) return null;
  return (
    <span className="flex flex-col items-start gap-1.5">
      {fragrance.bestSeller ? (
        <span className="bg-white/95 px-2 py-1 text-[10px] tracking-[0.14em] text-ink uppercase">
          Best seller
        </span>
      ) : null}
      {discount ? (
        <span className="bg-ink px-2 py-1 text-[10px] tracking-[0.1em] text-white">−{discount}%</span>
      ) : null}
    </span>
  );
}
