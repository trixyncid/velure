"use client";

import { useEffect, useRef, useState } from "react";
import { getLandingContent } from "@/config/landing-content";
import { useI18n } from "@/lib/i18n/client";
import { useLanding } from "@/lib/landing/film";

export function useLandingContent() {
  const { locale, t } = useI18n();
  return { locale, t, c: getLandingContent(locale) };
}

/** True once the element has scrolled into view and the preloader has lifted. */
export function useShown<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const ready = useLanding((state) => state.ready);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, shown: inView && ready };
}
