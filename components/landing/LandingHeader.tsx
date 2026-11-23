"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useCommerce, useLockScroll } from "@/components/commerce";
import { IconBag, IconClose, IconMenu, IconWhatsApp } from "@/components/icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { film, useLanding } from "@/lib/landing/film";
import { getLenis, scrollToSection } from "@/lib/landing/scroll";
import { conciergeUrl } from "@/lib/whatsapp";
import { useLandingContent } from "@/components/landing/hooks";

/** Which menu link each chapter of the page belongs to. */
const CURRENT: Record<string, string> = { story: "#story", craft: "#craft", shop: "#collection" };

/**
 * Logo, section menu (inline on wide screens, a full-screen sheet on small ones), language
 * and cart. A thin gold line along its lower
 * edge shows how far through the film you are, and clears once the shop arrives.
 */
export function LandingHeader() {
  const { c, locale } = useLandingContent();
  const { cartCount, openPanel } = useCommerce();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useLockScroll(menuOpen, closeMenu);
  const chapter = useLanding((state) => state.chapter);
  const ready = useLanding((state) => state.ready);
  const solid = chapter === "shop" || chapter === "outro";
  const progress = useRef<HTMLSpanElement>(null);
  // Before the first scroll there is no progress line and only a faint shade behind the links.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let last = -1;
    const update = () => {
      // The film is chapters 0–2 (hero, story, craft).
      const value = Math.min(1, Math.max(0, film.T / 3));
      if (!progress.current || Math.abs(value - last) < 0.0005) return;
      last = value;
      progress.current.style.transform = `scaleX(${value.toFixed(4)})`;
    };
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, []);

  // While the menu is open: hold the page still, move focus in, and give it back on close.
  useEffect(() => {
    if (!menuOpen) return;
    const button = menuButton.current;
    getLenis()?.stop();
    firstLink.current?.focus();
    return () => {
      getLenis()?.start();
      button?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  // Leaving phone width closes it.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const onChange = () => wide.matches && setMenuOpen(false);
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, []);

  function go(id: string) {
    setMenuOpen(false);
    // Let the scroll lock release before moving.
    requestAnimationFrame(() => {
      getLenis()?.start();
      scrollToSection(id);
    });
  }

  return (
    <>
    <header
      // It arrives after the opening shot has settled, not on top of the preloader's fade.
      className={`fixed inset-x-0 top-0 z-40 transition-opacity duration-[1200ms] ${
        ready ? "opacity-100 delay-700" : "pointer-events-none opacity-0"
      }`}
    >
      {/*
        Two backings, cross-faded: over the film, a long soft shade that fades out well below
        the header, so it never reads as a bar; in the shop, a solid one.
      */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#04060c]/85 via-[#04060c]/45 to-transparent transition-opacity duration-700 md:h-52 ${
          solid ? "opacity-0" : scrolled || menuOpen ? "opacity-100" : "opacity-80"
        }`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 border-b border-white/10 bg-[#04060c]/85 backdrop-blur-md transition-opacity duration-500 ${
          solid ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="relative mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-6 px-5 [text-shadow:0_1px_14px_rgba(4,6,12,0.85)] md:h-20 md:px-10">
        <a
          href="#top"
          aria-label={c.nav.home}
          onClick={(event) => {
            event.preventDefault();
            scrollToSection("top");
          }}
          className="font-serif text-[22px] tracking-[0.34em] text-[#ece7dc] md:text-[26px]"
        >
          VELURE
        </a>

        <nav aria-label={c.nav.menu} className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {c.nav.links.map((link) => {
              const current = CURRENT[chapter] === link.href;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={current ? "location" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToSection(link.href.slice(1));
                    }}
                    className={`text-[11px] tracking-[0.22em] uppercase transition-colors duration-300 hover:text-champagne ${
                      current ? "text-champagne" : "text-[#ece7dc]/85"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3 md:gap-6">
          {/* On narrow phones the language choice lives in the menu. */}
          <span className="hidden min-[420px]:block">
            <LanguageSwitcher tone="dark" />
          </span>
          <button
            type="button"
            onClick={() => openPanel("cart")}
            aria-label={c.nav.cart(cartCount)}
            className="relative inline-flex h-10 items-center gap-2 border border-champagne/40 bg-[#04060c]/35 px-3.5 text-[#ece7dc] backdrop-blur-sm transition-colors duration-300 hover:border-champagne hover:text-champagne"
          >
            <IconBag className="size-[18px]" />
            <span key={cartCount} className={`text-[12px] tabular-nums ${cartCount > 0 ? "animate-bump" : ""}`}>
              {cartCount}
            </span>
          </button>
          <button
            ref={menuButton}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? c.nav.closeMenu : c.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="-mr-2 grid size-11 place-items-center text-[#ece7dc] transition-colors hover:text-champagne lg:hidden"
          >
            {menuOpen ? <IconClose className="size-6" /> : <IconMenu className="size-6" />}
          </button>
        </div>
      </div>
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 h-px transition-opacity duration-700 ${solid || !scrolled ? "opacity-0" : "opacity-100"}`}
      >
        <span ref={progress} className="block h-px origin-left scale-x-0 bg-gold" />
      </span>
    </header>

    {/* Small screens: the same links as a full-screen sheet under the header. */}
    <div
      id="site-menu"
      inert={!menuOpen}
      onKeyDown={(event) => {
        // Keep Tab inside the open menu (the toggle sits in the header above it).
        if (event.key !== "Tab") return;
        const items = [...event.currentTarget.querySelectorAll<HTMLElement>("a[href], button")].filter(
          (item) => item.offsetParent !== null,
        );
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          menuButton.current?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          menuButton.current?.focus();
        }
      }}
      className={`fixed inset-0 z-[39] flex flex-col bg-[#04060c]/97 px-5 pt-24 pb-8 backdrop-blur-md transition-opacity duration-400 lg:hidden ${
        menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <nav aria-label={c.nav.menu}>
        <ul className="border-t border-white/10">
          {c.nav.links.map((link, index) => (
            <li key={link.href} className="border-b border-white/10">
              <a
                ref={index === 0 ? firstLink : undefined}
                href={link.href}
                aria-current={CURRENT[chapter] === link.href ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  go(link.href.slice(1));
                }}
                className={`flex min-h-[60px] items-center justify-between font-serif text-[28px] transition-[color,transform,opacity] duration-500 ${
                  CURRENT[chapter] === link.href ? "text-champagne" : "text-[#f4efe4]"
                } ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
                style={{ transitionDelay: menuOpen ? `${80 + index * 50}ms` : "0ms" }}
              >
                {link.label}
                <span aria-hidden="true" className="text-[11px] tracking-[0.2em] text-white/35 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto flex flex-col gap-5">
        <a href={conciergeUrl(locale)} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full">
          <IconWhatsApp className="size-4" />
          {c.nav.concierge}
        </a>
        <LanguageSwitcher tone="dark" className="justify-center" />
      </div>
    </div>
    </>
  );
}
