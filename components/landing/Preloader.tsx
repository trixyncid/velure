"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { film, useLanding } from "@/lib/landing/film";
import { useLandingContent } from "@/components/landing/hooks";

/** Longest the preloader may hold the page, whatever the scene is doing. */
const MAX_WAIT_MS = 7000;

/** Chapter 0: the logo over black, a thin gold line that fills, then a slow fade into the night. */
export function Preloader() {
  const { c } = useLandingContent();
  const mode = useLanding((state) => state.mode);
  const sceneReady = useLanding((state) => state.sceneReady);
  const loadProgress = useLanding((state) => state.loadProgress);
  const ready = useLanding((state) => state.ready);
  const [gone, setGone] = useState(false);

  // A deep link lands in the shop, which covers the film: nothing to wait for there.
  const covered = useLanding((state) => state.covered);
  const loaded = mode === "static" || sceneReady || covered;
  const progress = loaded ? 1 : mode === "pending" ? 0.12 : 0.3 + (loadProgress / 100) * 0.5;

  useEffect(() => {
    const lift = () => {
      if (useLanding.getState().ready) return;
      useLanding.getState().set({ ready: true });
      gsap.to(film, { intro: 1, duration: 3.2, ease: "power3.out" });
    };
    // Let the line finish filling before the curtain lifts.
    const timeout = window.setTimeout(lift, loaded ? 650 : MAX_WAIT_MS);
    return () => window.clearTimeout(timeout);
  }, [loaded]);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center bg-[#04060c] transition-opacity duration-[1400ms] ease-out ${
        ready ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && ready) setGone(true);
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center">
        <p className="animate-fade pl-[0.42em] font-serif text-[clamp(2rem,7vw,3.4rem)] tracking-[0.42em] text-[#ece7dc]">
          VELURE
        </p>
        <div className="mt-7 h-px w-44 overflow-hidden bg-white/10">
          <div
            className="h-full origin-left bg-gold transition-transform duration-700 ease-out"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
        <p className="mt-5 text-[10px] tracking-[0.32em] text-white/40 uppercase">{c.preloader.label}</p>
      </div>
    </div>
  );
}
