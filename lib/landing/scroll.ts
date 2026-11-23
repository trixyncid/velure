import type Lenis from "lenis";
import { useLanding } from "@/lib/landing/film";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

/** Scrolls to a section. `instant` skips the animation (deep links, which should not replay the film). */
export function scrollToSection(id: string, instant = false) {
  const element = document.getElementById(id);
  if (!element) return;
  const y = Math.max(0, element.getBoundingClientRect().top + window.scrollY);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenis) {
    lenis.scrollTo(y, instant ? { immediate: true, force: true } : { duration: 1.6, lock: false, force: true });
    return;
  }
  window.scrollTo({ top: y, behavior: instant || reduced ? "auto" : "smooth" });
}

/** Opens a perfume's detail panel and puts it in the address bar, so the view can be shared. */
export function openProduct(productId: string, slug: string) {
  useLanding.getState().set({ detailId: productId });
  const url = new URL(window.location.href);
  url.searchParams.set("product", slug);
  window.history.replaceState(null, "", url);
}

export function closeProduct() {
  useLanding.getState().set({ detailId: null });
  const url = new URL(window.location.href);
  url.searchParams.delete("product");
  window.history.replaceState(null, "", url);
}
