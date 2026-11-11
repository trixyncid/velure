"use client";

import { useEffect, useState } from "react";
import { IconChevron } from "@/components/icons";
import { useI18n } from "@/lib/i18n/client";
import { Reveal } from "@/components/reveal";
import type { StoreTestimonial } from "@/lib/testimonial-types";

export function Testimonials({ items }: { items: StoreTestimonial[] }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  // Stay in range if the list shrinks after an admin edit.
  const current = items[count ? index % count : 0];

  useEffect(() => {
    if (paused || count < 2) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const timeout = window.setInterval(() => {
      setIndex((value) => (value + 1) % count);
    }, 7000);
    return () => window.clearInterval(timeout);
  }, [paused, count]);

  function step(direction: -1 | 1) {
    setIndex((value) => (value + direction + count) % count);
  }

  if (!current) return null;
  const active = index % count;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t.testimonials.label}
      className="bg-ink px-5 py-20 text-white md:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Reveal className="mx-auto max-w-3xl text-center">
        <h2 className="text-[12px] tracking-[0.34em] text-white/70 uppercase">
          {t.testimonials.heading}
        </h2>
        <p className="mt-8 font-serif text-6xl leading-none text-gold" aria-hidden="true">
          “
        </p>
        <div className="relative">
          <button
            type="button"
            onClick={() => step(-1)}
            className={`absolute top-1/2 left-0 hidden size-10 -translate-y-1/2 place-items-center text-white/70 hover:text-white ${count > 1 ? "sm:grid" : ""}`}
            aria-label={t.testimonials.previous}
          >
            <IconChevron className="size-5" />
          </button>
          <blockquote key={current.id} className="animate-quote mx-auto max-w-2xl px-2 sm:px-14">
            <p className="font-serif text-[clamp(1.35rem,2.5vw,1.9rem)] leading-snug font-medium">
              {current.quote}
            </p>
            <footer className="mt-6 text-[13px] tracking-[0.18em] text-white/60 uppercase">
              {current.name}
              {current.place ? ` · ${current.place}` : ""}
            </footer>
          </blockquote>
          <button
            type="button"
            onClick={() => step(1)}
            className={`absolute top-1/2 right-0 hidden size-10 -translate-y-1/2 place-items-center text-white/70 hover:text-white ${count > 1 ? "sm:grid" : ""}`}
            aria-label={t.testimonials.next}
          >
            <IconChevron className="size-5 rotate-180" />
          </button>
        </div>
        <div className={`mt-8 items-center justify-center gap-2 ${count > 1 ? "flex" : "hidden"}`}>
          {items.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={t.testimonials.show(itemIndex + 1)}
              aria-current={itemIndex === active}
              onClick={() => setIndex(itemIndex)}
              className={`h-1.5 rounded-full transition-all ${
                itemIndex === active ? "w-6 bg-gold" : "w-1.5 bg-white/35"
              }`}
            />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
