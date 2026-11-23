"use client";

import { useEffect, useState } from "react";
import { useLanding } from "@/lib/landing/film";
import { scrollToSection } from "@/lib/landing/scroll";
import { useLandingContent } from "@/components/landing/hooks";

/**
 * "You are here": a slim list of the page's sections at the right edge, centred vertically.
 * The current section is marked and named; the others show their names on hover or keyboard
 * focus (wide screens). On phones it is marks only, small enough to stay out of the way.
 */
export function SectionRail() {
  const { c } = useLandingContent();
  const ready = useLanding((state) => state.ready);
  const [current, setCurrent] = useState("top");
  const sections = [{ href: "#top", label: c.nav.top }, ...c.nav.links];
  const ids = sections.map((section) => section.href.slice(1)).join(",");

  useEffect(() => {
    const list = ids.split(",");
    let frame = 0;
    const measure = () => {
      frame = 0;
      // The current section is the last one whose top has passed the middle of the screen.
      const middle = window.innerHeight / 2;
      let found = list[0];
      for (const id of list) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= middle) found = id;
      }
      setCurrent(found);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);

  return (
    <nav
      aria-label={c.nav.sections}
      className={`group/rail fixed top-1/2 right-1.5 z-30 -translate-y-1/2 transition-opacity delay-700 duration-[1200ms] md:right-5 ${
        ready ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ol className="flex flex-col items-end">
        {sections.map((section) => {
          const id = section.href.slice(1);
          const active = id === current;
          return (
            <li key={id}>
              <a
                href={section.href}
                aria-current={active ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(id);
                }}
                className="group/item flex h-7 items-center justify-end gap-3 pl-3 md:h-8"
              >
                <span
                  className={`hidden text-[10px] tracking-[0.22em] whitespace-nowrap uppercase transition-[opacity,transform,color] duration-300 [text-shadow:0_1px_12px_rgba(4,6,12,0.9)] md:block ${
                    active
                      ? "translate-x-0 text-champagne opacity-100"
                      : "translate-x-1 text-[#ece7dc]/80 opacity-0 group-hover/rail:translate-x-0 group-hover/rail:opacity-100 group-focus-within/rail:translate-x-0 group-focus-within/rail:opacity-100 group-hover/item:text-champagne"
                  }`}
                >
                  {section.label}
                </span>
                <span className="sr-only md:hidden">{section.label}</span>
                <span
                  aria-hidden="true"
                  className={`block h-px rounded-full transition-all duration-500 ${
                    active
                      ? "w-5 bg-gold shadow-[0_0_10px_rgba(201,163,92,0.8)] md:w-8"
                      : "w-2.5 bg-white/45 group-hover/item:w-5 group-hover/item:bg-champagne md:w-4"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
