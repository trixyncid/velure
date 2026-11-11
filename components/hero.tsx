import Image from "next/image";
import { conciergeUrl } from "@/lib/whatsapp";
import { IconWhatsApp } from "@/components/icons";
import { getDictionary, type Locale } from "@/lib/i18n";

export function Hero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <section className="relative isolate h-[78vh] min-h-[560px] max-h-[800px] overflow-hidden bg-[#1a140e]">
      <div className="animate-hero absolute inset-0">
        <Image
          src="/images/hero.jpg"
          alt={t.hero.imageAlt}
          fill
          preload
          sizes="100vw"
          className="object-cover object-[72%_center]"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent md:hidden" />
      <div className="relative mx-auto flex h-full max-w-[1180px] items-end px-5 pb-16 md:items-center md:px-8 md:pb-0">
        <div className="w-full max-w-xl text-white [text-shadow:0_10px_30px_rgba(0,0,0,0.35)]">
          <p
            className="animate-rise text-[11px] tracking-[0.36em] text-champagne uppercase sm:text-[12px] sm:tracking-[0.42em]"
            style={{ animationDelay: "180ms" }}
          >
            {t.hero.eyebrow}
          </p>
          <h1
            className="animate-rise mt-4 font-serif text-[clamp(2.6rem,8vw,4.9rem)] leading-[0.98] font-medium"
            style={{ animationDelay: "320ms" }}
          >
            {t.hero.titleTop}
            <br />
            {t.hero.titleBottom}
          </h1>
          <p
            className="animate-rise mt-5 max-w-md text-[15px] leading-7 text-white/85"
            style={{ animationDelay: "500ms" }}
          >
            {t.hero.body}
          </p>
          <div
            className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "680ms" }}
          >
            <a
              href="#shop"
              className="inline-flex justify-center bg-champagne px-8 py-4 text-[12px] font-medium tracking-[0.22em] text-ink uppercase transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-champagne-deep"
            >
              {t.hero.shop}
            </a>
            <a
              href={conciergeUrl(locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 border border-white/50 px-7 py-4 text-[12px] tracking-[0.2em] text-white uppercase backdrop-blur-sm transition-colors duration-300 hover:border-white hover:bg-white/10"
            >
              <IconWhatsApp className="size-4" />
              {t.hero.ask}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
