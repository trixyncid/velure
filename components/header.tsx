"use client";

import { useEffect, useState } from "react";
import { freeShippingThreshold, navLinks } from "@/lib/content";
import { formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { conciergeUrl } from "@/lib/whatsapp";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useCommerce } from "@/components/commerce";
import {
  IconBag,
  IconClose,
  IconMenu,
  IconSearch,
  IconWhatsApp,
} from "@/components/icons";

export function Header() {
  const { cartCount, openPanel } = useCommerce();
  const { locale, t } = useI18n();
  const threshold = formatPrice(freeShippingThreshold);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <div className="bg-ink text-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-2 md:grid md:grid-cols-[1fr_auto_1fr] md:px-8">
          <span aria-hidden="true" className="hidden md:block" />
          <p className="truncate text-[10px] tracking-[0.2em] text-white/80 uppercase sm:text-[11px]">
            <span className="hidden lg:inline">{t.announcement.orderVia} · </span>
            <span className="sm:hidden">{t.announcement.shippingShort(threshold)}</span>
            <span className="hidden sm:inline">{t.announcement.shipping(threshold)}</span>
          </p>
          <LanguageSwitcher tone="dark" className="shrink-0 justify-self-end" />
        </div>
      </div>
      <header
        id="top"
        className={`sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md transition-shadow duration-300 ${
          scrolled ? "shadow-[0_10px_30px_rgba(28,25,21,0.06)]" : ""
        }`}
      >
        <div
          className={`mx-auto grid w-full max-w-[1180px] grid-cols-[1fr_auto_1fr] items-center px-3 transition-[height] duration-300 sm:px-5 md:px-8 ${
            scrolled ? "h-16" : "h-16 lg:h-[84px]"
          }`}
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="grid size-10 place-items-center lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <IconClose className="size-5" /> : <IconMenu className="size-5" />}
              <span className="sr-only">{menuOpen ? t.header.closeMenu : t.header.openMenu}</span>
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2.5 px-2 text-[11px] tracking-[0.18em] uppercase transition-colors duration-300 hover:text-gold lg:-ml-2"
              onClick={() => {
                setMenuOpen(false);
                openPanel("search");
              }}
            >
              <IconSearch className="size-[19px]" />
              <span className="sr-only lg:not-sr-only">{t.header.searchShort}</span>
              <span className="sr-only"> — {t.header.search}</span>
            </button>
          </div>

          <a
            href="#top"
            className={`font-serif tracking-[0.3em] text-ink transition-[font-size] duration-300 sm:tracking-[0.36em] ${
              scrolled ? "text-[22px] sm:text-[26px]" : "text-[22px] sm:text-[26px] lg:text-[32px]"
            }`}
          >
            VELURE
          </a>

          <div className="flex items-center justify-end gap-1">
            <a
              href={conciergeUrl(locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-2 px-3 text-[11px] tracking-[0.18em] uppercase transition-colors duration-300 hover:text-gold md:inline-flex"
            >
              <IconWhatsApp className="size-[17px]" />
              {t.header.concierge}
            </a>
            <button
              type="button"
              className="relative inline-flex h-10 items-center gap-2 bg-ink pr-3.5 pl-3 text-white transition-colors duration-300 hover:bg-[#2a2620]"
              aria-label={t.header.openBag(t.common.items(cartCount))}
              onClick={() => {
                setMenuOpen(false);
                openPanel("cart");
              }}
            >
              <IconBag className="size-[18px]" />
              <span
                key={cartCount}
                className={`text-[12px] tabular-nums ${cartCount > 0 ? "animate-bump" : ""}`}
              >
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        <nav aria-label="Primary" className="hidden border-t border-line lg:block">
          <ul className="mx-auto flex h-12 max-w-[1180px] items-center justify-center gap-12 px-8 xl:gap-16">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative py-2 text-[11px] tracking-[0.24em] whitespace-nowrap text-ink/70 uppercase transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:text-ink hover:after:scale-x-100"
                >
                  {t.nav[link.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {menuOpen ? (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="animate-menu border-t border-line bg-white px-5 pt-2 pb-6 lg:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block border-b border-line py-4 font-serif text-[28px] leading-none"
              >
                {t.nav[link.key]}
              </a>
            ))}
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[11px] tracking-[0.2em] text-muted uppercase">
                {t.common.language}
              </span>
              <LanguageSwitcher />
            </div>
            <a
              href={conciergeUrl(locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 border border-ink py-3.5 text-[12px] tracking-[0.2em] uppercase"
            >
              <IconWhatsApp className="size-4" />
              {t.header.chatConcierge}
            </a>
          </nav>
        ) : null}
      </header>
    </>
  );
}
