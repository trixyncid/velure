import { freeShippingThreshold } from "@/lib/content";
import { formatPrice } from "@/lib/format";
import { getDictionary, type Locale } from "@/lib/i18n";
import { conciergeUrl } from "@/lib/whatsapp";
import { IconPlus, IconWhatsApp } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

export function Faq({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const faqs = t.faq.items(formatPrice(freeShippingThreshold));
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Reveal>
          <SectionHeading eyebrow={t.faq.eyebrow}>{t.faq.heading}</SectionHeading>
        </Reveal>
        <Reveal className="mt-12 border-t border-line">
          {faqs.map((faq) => (
            <details key={faq.question} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
                <span className="font-serif text-[22px] leading-snug">{faq.question}</span>
                <IconPlus className="size-5 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="-mt-1 pr-10 pb-6 text-[15px] leading-7 text-muted">{faq.answer}</p>
            </details>
          ))}
        </Reveal>
        <Reveal className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-[14px] text-muted">{t.faq.still}</p>
          <a
            href={conciergeUrl(locale)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 border border-ink px-7 py-3.5 text-[12px] tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-ink hover:text-white"
          >
            <IconWhatsApp className="size-4" />
            {t.faq.ask}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
