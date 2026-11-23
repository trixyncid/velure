"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { CHAPTERS, film, useLanding } from "@/lib/landing/film";
import { CRAFT_STEPS } from "@/lib/landing/footage";
import { setLenis } from "@/lib/landing/scroll";

/**
 * Turns scroll into film time. Each `data-chapter` element owns one unit of it; the craft
 * chapter also reports which caption is on screen.
 * Lenis smooths the scroll and is kept in sync with ScrollTrigger.
 */
export function ScrollDirector() {
  const mode = useLanding((state) => state.mode);

  useEffect(() => {
    if (mode === "pending") return;
    gsap.registerPlugin(ScrollTrigger);
    const set = useLanding.getState().set;

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    if (mode === "3d") {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    const triggers: ScrollTrigger[] = [];

    CHAPTERS.forEach((name, index) => {
      const element = document.querySelector<HTMLElement>(`[data-chapter="${name}"]`);
      if (!element) return;
      const update = (self: ScrollTrigger) => {
        if (!self.isActive) {
          // A jump (anchor link, restored scroll) can skip the chapter entirely: leave its
          // captions in the right end state.
          if (name === "craft") {
            const rest = self.progress >= 1 ? CRAFT_STEPS.length : 0;
            if (useLanding.getState().craftStep !== rest) set({ craftStep: rest });
          }
          return;
        }
        const progress = self.progress;
        film.T = index + progress;
        const state = useLanding.getState();
        if (state.chapter !== name) set({ chapter: name });
        if (name === "craft") {
          const step = CRAFT_STEPS.filter((from) => progress >= from).length;
          if (state.craftStep !== step) set({ craftStep: step });
        }
      };
      triggers.push(
        ScrollTrigger.create({
          trigger: element,
          start: index === 0 ? "top top" : "top center",
          end: "bottom center",
          onUpdate: update,
          onToggle: update,
          onRefresh: update,
        }),
      );
    });

    // Once the shop covers the viewport there is nothing left for the canvas to draw.
    const shop = document.querySelector<HTMLElement>('[data-chapter="shop"]');
    if (shop) {
      triggers.push(
        ScrollTrigger.create({
          trigger: shop,
          start: "top top",
          onToggle: (self) => set({ covered: self.isActive }),
          onRefresh: (self) => set({ covered: self.isActive }),
        }),
      );
    }

    ScrollTrigger.refresh();
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);

    return () => {
      triggers.forEach((trigger) => trigger.kill());
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      setLenis(null);
    };
  }, [mode]);

  return null;
}
