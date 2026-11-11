"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Product, ShopFilter } from "@/lib/content";

export type CartLine = { id: string; qty: number };

type Panel = "cart" | "search" | "product" | null;

export type Toast = { key: number; productId: string } | null;

type CommerceContextValue = {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
  cart: CartLine[];
  panel: Panel;
  cartCount: number;
  subtotal: number;
  viewingId: string | null;
  shopFilter: ShopFilter;
  toast: Toast;
  openPanel: (panel: "cart" | "search") => void;
  openProduct: (id: string) => void;
  closePanel: () => void;
  setShopFilter: (filter: ShopFilter) => void;
  addToCart: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  dismissToast: () => void;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

const CART_KEY = "velure-cart";
const CART_EVENT = "velure-cart-change";
export const MAX_QTY = 8;

function subscribeCart(callback: () => void) {
  window.addEventListener(CART_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CART_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getCartSnapshot() {
  try {
    return localStorage.getItem(CART_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

const getEmptySnapshot = () => "[]";

function writeCart(value: CartLine[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode); the bag simply won't persist.
  }
  window.dispatchEvent(new Event(CART_EVENT));
}

/** Lines whose perfume still exists and has a price. Anything else is dropped. */
function parseCart(raw: string, catalog: Map<string, Product>): CartLine[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (line): line is CartLine =>
        !!line &&
        typeof line === "object" &&
        typeof (line as CartLine).id === "string" &&
        catalog.get((line as CartLine).id)?.price != null &&
        typeof (line as CartLine).qty === "number" &&
        (line as CartLine).qty > 0,
    );
  } catch {
    return [];
  }
}

export function CommerceProvider({
  products,
  children,
}: {
  products: Product[];
  children: ReactNode;
}) {
  const catalog = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const getProduct = useCallback((id: string) => catalog.get(id), [catalog]);
  const cartRaw = useSyncExternalStore(subscribeCart, getCartSnapshot, getEmptySnapshot);
  const cart = useMemo(() => parseCart(cartRaw, catalog), [cartRaw, catalog]);
  const [panel, setPanel] = useState<Panel>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [shopFilter, setShopFilter] = useState<ShopFilter>("All");
  const [toast, setToast] = useState<Toast>(null);
  const toastKey = useRef(0);

  const openPanel = useCallback((next: "cart" | "search") => {
    setToast(null);
    setPanel(next);
  }, []);

  const openProduct = useCallback((id: string) => {
    setViewingId(id);
    setPanel("product");
  }, []);

  const closePanel = useCallback(() => setPanel(null), []);
  const dismissToast = useCallback(() => setToast(null), []);

  const updateCart = useCallback((updater: (current: CartLine[]) => CartLine[]) => {
    writeCart(updater(parseCart(getCartSnapshot(), catalog)));
  }, [catalog]);

  const addToCart = useCallback(
    (id: string, qty = 1) => {
      if (catalog.get(id)?.price == null) return;
      updateCart((current) => {
        const existing = current.find((line) => line.id === id);
        if (!existing) return [...current, { id, qty: Math.min(MAX_QTY, qty) }];
        return current.map((line) =>
          line.id === id ? { ...line, qty: Math.min(MAX_QTY, line.qty + qty) } : line,
        );
      });
      toastKey.current += 1;
      setToast({ key: toastKey.current, productId: id });
    },
    [updateCart, catalog],
  );

  const setQty = useCallback(
    (id: string, qty: number) => {
      updateCart((current) => {
        if (qty <= 0) return current.filter((line) => line.id !== id);
        return current.map((line) =>
          line.id === id ? { ...line, qty: Math.min(MAX_QTY, qty) } : line,
        );
      });
    },
    [updateCart],
  );

  const removeFromCart = useCallback(
    (id: string) => updateCart((current) => current.filter((line) => line.id !== id)),
    [updateCart],
  );

  const clearCart = useCallback(() => writeCart([]), []);

  const cartCount = cart.reduce((total, line) => total + line.qty, 0);
  const subtotal = cart.reduce((total, line) => {
    return total + (catalog.get(line.id)?.price ?? 0) * line.qty;
  }, 0);

  const value = useMemo<CommerceContextValue>(
    () => ({
      products,
      getProduct,
      cart,
      panel,
      cartCount,
      subtotal,
      viewingId,
      shopFilter,
      toast,
      openPanel,
      openProduct,
      closePanel,
      setShopFilter,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      dismissToast,
    }),
    [
      products,
      getProduct,
      cart,
      panel,
      cartCount,
      subtotal,
      viewingId,
      shopFilter,
      toast,
      openPanel,
      openProduct,
      closePanel,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      dismissToast,
    ],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const value = useContext(CommerceContext);
  if (!value) {
    throw new Error("useCommerce must be used within CommerceProvider");
  }
  return value;
}

export function useLockScroll(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscape();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [active, onEscape]);
}

/** Scroll to the shop grid with a given collection selected. */
export function useShowCollection() {
  const { setShopFilter } = useCommerce();
  return useCallback(
    (filter: ShopFilter) => {
      setShopFilter(filter);
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [setShopFilter],
  );
}
