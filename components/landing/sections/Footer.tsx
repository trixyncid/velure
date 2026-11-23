import { getLandingContent } from "@/config/landing-content";
import { getDictionary, type Locale } from "@/lib/i18n";
import { conciergeUrl, WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { IconWhatsApp } from "@/components/icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ScrollLink } from "@/components/landing/ScrollLink";

export function Footer({ locale }: { locale: Locale }) {
  const c = getLandingContent(locale);
  const t = getDictionary(locale);
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-white/10">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-16 sm:grid-cols-2 md:grid-cols-12 md:px-8">
        <div className="sm:col-span-2 md:col-span-6">
          <p className="font-serif text-3xl tracking-[0.3em] text-[#f4efe4]">VELURE</p>
          <p className="mt-2 text-[11px] tracking-[0.3em] text-gold uppercase">{c.brand.collection}</p>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">{c.footer.about}</p>
          <div className="mt-6">
            <p className="text-[11px] tracking-[0.22em] text-white/40 uppercase">{t.common.language}</p>
            <LanguageSwitcher tone="dark" className="mt-3" />
          </div>
        </div>
        <nav aria-label={c.footer.explore} className="md:col-span-3">
          <h2 className="text-[11px] tracking-[0.22em] text-white/40 uppercase">{c.footer.explore}</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            {c.footer.links.map((link) => (
              <li key={link.href}>
                <ScrollLink to={link.href.slice(1)} className="transition-colors duration-300 hover:text-champagne">
                  {link.label}
                </ScrollLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <h2 className="text-[11px] tracking-[0.22em] text-white/40 uppercase">{c.footer.contact}</h2>
          <a
            href={conciergeUrl(locale)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-white/70 transition-colors duration-300 hover:text-champagne"
          >
            <IconWhatsApp className="size-4 text-champagne" />
            {WHATSAPP_DISPLAY}
          </a>
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
