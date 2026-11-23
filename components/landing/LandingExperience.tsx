"use client";

import { useEffect, type ReactNode } from "react";
import { useCommerce } from "@/components/commerce";
import { film, useLanding, type Quality } from "@/lib/landing/film";
import { getLenis, scrollToSection } from "@/lib/landing/scroll";
import type { LandingProduct } from "@/lib/landing/types";
import { LandingCanvas } from "@/components/landing/LandingCanvas";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Preloader } from "@/components/landing/Preloader";
import { ScrollDirector } from "@/components/landing/ScrollDirector";
import { SectionRail } from "@/components/landing/SectionRail";
import { StickyOrder } from "@/components/landing/StickyOrder";
import { CartDrawer } from "@/components/landing/order/CartDrawer";
import { ProductPanel } from "@/components/landing/shop/ProductPanel";

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** A first guess at what the device can handle; PerformanceMonitor refines it while running. */
function guessQuality(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const touch = window.matchMedia("(pointer: coarse)").matches;
  if (memory <= 2 || cores <= 2) return 0;
  if (touch || memory <= 4 || cores <= 4) return 1;
  return 2;
}

/**
 * Client shell of the landing page: decides between the scroll-scrubbed film and its still
 * version, mounts the footage canvas behind the page, and wires scroll, deep links, the
 * product panel and the cart.
 */
export function LandingExperience({
  products,
  children,
}: {
  products: LandingProduct[];
  children: ReactNode;
}) {
  const { panel } = useCommerce();
  const mode = useLanding((state) => state.mode);

  useEffect(() => {
    const { set } = useLanding.getState();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const quality = guessQuality();
    const use3d = !reduced && hasWebGL();

    set({ mode: use3d ? "3d" : "static", quality, maxQuality: quality });
    const onVisibility = () => set({ paused: document.hidden });
    document.addEventListener("visibilitychange", onVisibility);

    const fine = window.matchMedia("(pointer: fine)").matches;
    const onPointer = (event: PointerEvent) => {
      film.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      film.pointerY = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    if (fine && use3d) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  // Deep link: /id?product=midnight-sin lands in the shop with that perfume open, without
  // replaying the film (handy for ads).
  useEffect(() => {
    if (mode === "pending") return;
    const wanted = new URLSearchParams(window.location.search).get("product")?.toLowerCase();
    const linked = wanted ? products.find((product) => product.slug === wanted || product.id === wanted) : null;
    if (!linked) return;
    const frame = requestAnimationFrame(() => {
      scrollToSection("collection", true);
      useLanding.getState().set({ detailId: linked.id });
    });
    return () => cancelAnimationFrame(frame);
    // The catalog only changes on navigation.
  }, [mode, products]);

  // Freeze smooth scrolling while the cart drawer is open.
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    if (panel) lenis.stop();
    else lenis.start();
  }, [panel]);

  return (
    <>
      <div className="night-backdrop" aria-hidden="true" />
      <LandingCanvas />
      <ScrollDirector />
      <LandingHeader />
      <div className="relative z-10" data-mode={mode}>
        {children}
      </div>
      <SectionRail />
      <StickyOrder />
      <ProductPanel products={products} />
      <CartDrawer />
      <Preloader />
    </>
  );
}
