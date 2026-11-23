"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { film, useLanding } from "@/lib/landing/film";
import { HERO_BEATS } from "@/lib/landing/footage";
import { smoothstep } from "@/lib/landing/math";

type Range = readonly [number, number];

/** Fades the hero's beats of copy in and out as scroll plays the opening shot. */
export function HeroScrub() {
  const mode = useLanding((state) => state.mode);

  useEffect(() => {
    if (mode !== "3d") return;
    const beat = (name: string) => document.querySelector<HTMLElement>(`[data-beat="${name}"]`);
    const title = beat("title");
    const tagline = beat("tagline");
    const reveal = beat("reveal");
    const cue = beat("cue");
    let last = -1;

    const show = (element: HTMLElement | null, enter: Range | null, leave: Range | null, progress: number) => {
      if (!element) return;
      const entered = enter ? smoothstep(enter[0], enter[1], progress) : 1;
      const left = leave ? smoothstep(leave[0], leave[1], progress) : 0;
      const opacity = entered * (1 - left);
      element.style.opacity = opacity.toFixed(3);
      element.style.transform = `translate3d(0, ${((1 - entered) * 28 - left * 44).toFixed(1)}px, 0)`;
      element.style.filter = left > 0.01 ? `blur(${(left * 8).toFixed(1)}px)` : "";
      element.style.visibility = opacity < 0.01 ? "hidden" : "visible";
    };

    const update = () => {
      const progress = Math.min(1, Math.max(0, film.T));
      if (Math.abs(progress - last) < 0.0005) return;
      last = progress;
      show(title, null, HERO_BEATS.title.out, progress);
      show(tagline, HERO_BEATS.tagline.in, HERO_BEATS.tagline.out, progress);
      show(reveal, HERO_BEATS.reveal.in, HERO_BEATS.reveal.out, progress);
      show(cue, null, [0.015, 0.06], progress);
    };

    gsap.ticker.add(update);
    return () => {
      gsap.ticker.remove(update);
      for (const element of [title, tagline, reveal, cue]) element?.removeAttribute("style");
    };
  }, [mode]);

  return null;
}
