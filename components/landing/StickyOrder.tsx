"use client";

import { IconArrow, IconBag } from "@/components/icons";
import { useLanding } from "@/lib/landing/film";
import { scrollToSection } from "@/lib/landing/scroll";
import { useCommerce } from "@/components/commerce";
import { useLandingContent } from "@/components/landing/hooks";

/**
 * The one floating action. During the film it skips ahead to the collection; in the shop it
 * appears once the cart has something in it and opens the cart.
 */
export function StickyOrder() {
  const { c } = useLandingContent();
  const { panel, cartCount, openPanel } = useCommerce();
  const chapter = useLanding((state) => state.chapter);
  const ready = useLanding((state) => state.ready);
  const detailOpen = useLanding((state) => state.detailId !== null);
  const film = chapter === "story" || chapter === "craft";
  const shop = (chapter === "shop" || chapter === "outro") && cartCount > 0;
  const visible = ready && panel === null && !detailOpen && (film || shop);
  const className = `btn-gold fixed right-4 bottom-4 z-30 !min-h-[46px] !px-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-500 sm:right-6 sm:bottom-6 ${
    visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
  }`;

  if (shop) {
    return (
      <button type="button" tabIndex={visible ? undefined : -1} aria-hidden={!visible} onClick={() => openPanel("cart")} className={className}>
        <IconBag className="size-4" />
        {c.nav.viewCart(cartCount)}
      </button>
    );
  }

  return (
    <a
      href="#collection"
      tabIndex={visible ? undefined : -1}
      aria-hidden={!visible}
      onClick={(event) => {
        event.preventDefault();
        scrollToSection("collection");
      }}
      className={className}
    >
      {c.nav.collection}
      <IconArrow className="size-4" />
    </a>
  );
}
