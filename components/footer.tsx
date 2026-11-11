import { collections, navLinks } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { conciergeUrl, WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { IconWhatsApp } from "@/components/icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Reveal } from "@/components/reveal";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="scroll-mt-24 lg:scroll-mt-28 bg-[#0c0c0c] text-white">
      <div className="border-b border-white/10">
        <Reveal className="mx-auto flex max-w-[1180px] flex-col items-start gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-[11px] tracking-[0.34em] text-champagne uppercase">
              {t.footer.bannerEyebrow}
            </p>
            <p className="mt-3 max-w-lg font-serif text-[clamp(1.9rem,3.5vw,2.6rem)] leading-tight">
              {t.footer.bannerTitle}
            </p>
          </div>
          <a
            href={conciergeUrl(locale)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2.5 bg-champagne px-7 py-4 text-[12px] font-medium tracking-[0.2em] text-ink uppercase transition-colors duration-300 hover:bg-champagne-deep"
          >
            <IconWhatsApp className="size-4" />
            {t.footer.chat}
          </a>
        </Reveal>
      </div>

      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-12 md:px-8">
        <div className="sm:col-span-2 md:col-span-5">
          <p className="font-serif text-3xl tracking-[0.28em]">VELURE</p>
          <p className="mt-4 max-w-xs text-sm leading-7 text-white/60">{t.footer.about}</p>
          <div className="mt-6">
            <p className="text-[11px] tracking-[0.22em] text-white/40 uppercase">
              {t.common.language}
            </p>
            <LanguageSwitcher tone="dark" className="mt-3" />
          </div>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-[11px] tracking-[0.22em] text-white/40 uppercase">
            {t.footer.explore}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors duration-300 hover:text-white">
                  {t.nav[link.key]}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-[11px] tracking-[0.22em] text-white/40 uppercase">
            {t.footer.collections}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            {collections
              .filter((collection) => collection.filter !== "All")
              .map((collection) => (
                <li key={collection.id}>
                  <a href="#shop" className="transition-colors duration-300 hover:text-white">
                    {t.categories[collection.filter]}
                  </a>
                </li>
              ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <h2 className="text-[11px] tracking-[0.22em] text-white/40 uppercase">
            {t.footer.contact}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li>
              <a
                href={conciergeUrl(locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-white"
              >
                <IconWhatsApp className="size-4 text-champagne" />
                {WHATSAPP_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@velure.com"
                className="transition-colors duration-300 hover:text-white"
              >
                hello@velure.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-2 px-5 py-6 text-[12px] tracking-wide text-white/40 md:flex-row md:items-center md:justify-between md:px-8">
          <p>{t.footer.rights(year)}</p>
          <p>{t.footer.note}</p>
        </div>
      </div>
    </footer>
  );
}
