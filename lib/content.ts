/**
 * Storefront structure. Perfumes come from the admin catalog (lib/store.ts);
 * all visible copy lives in the dictionaries under lib/i18n.
 */

/** Whole Rupiah. Orders at or above this ship free. */
export const freeShippingThreshold = Number(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 500_000,
);

export const navLinks = [
  { key: "shop", href: "#shop" },
  { key: "collections", href: "#collections" },
  { key: "howToOrder", href: "#how-to-order" },
  { key: "story", href: "#story" },
  { key: "faq", href: "#faq" },
] as const;

export const trustItems = [
  { id: "concierge", icon: "chat" },
  { id: "payLater", icon: "wallet" },
  { id: "shipping", icon: "truck" },
  { id: "quality", icon: "seal" },
] as const;

export type Category = "Women" | "Men" | "Unisex";

/** A perfume as the storefront sees it. Built on the server from the admin catalog. */
export type Product = {
  id: string;
  name: string;
  description: string;
  categories: Category[];
  /** Selling price in whole Rupiah after discount, or null for "price on request". */
  price: number | null;
  /** Original price when discounted. */
  compareAt: number | null;
  discount: number;
  bestSeller: boolean;
  images: string[];
  rating: number | null;
  reviews: number;
};

export const genderCategory = {
  FEMALE: "Women",
  MALE: "Men",
  UNISEX: "Unisex",
} as const satisfies Record<string, Category>;

export type ShopFilter = "All" | Category;

export const collections = [
  { id: "women", image: "/images/collection-women.jpg", filter: "Women" },
  { id: "men", image: "/images/collection-men.jpg", filter: "Men" },
  { id: "unisex", image: "/images/collection-unisex.jpg", filter: "Unisex" },
  { id: "all", image: "/images/collection-bestsellers.jpg", filter: "All" },
] as const satisfies readonly { id: string; image: string; filter: ShopFilter }[];
