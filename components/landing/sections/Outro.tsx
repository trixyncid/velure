import { getLandingContent } from "@/config/landing-content";
import { freeShippingThreshold } from "@/lib/content";
import { formatPrice } from "@/lib/format";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { StoreTestimonial } from "@/lib/testimonial-types";
import { conciergeUrl } from "@/lib/whatsapp";
import { IconArrow, IconPlus, IconWhatsApp } from "@/components/icons";
import { ScrollLink } from "@/components/landing/ScrollLink";
import { Testimonials } from "@/components/testimonials";
import { Footer } from "@/components/landing/sections/Footer";

/**
 * The end of the page: customer testimonials (managed in the admin), the FAQ, one last
 * call to action, and the footer.
 */
export function Outro({ locale, testimonials }: { locale: Locale; testimonials: StoreTestimonial[] }) {
  const t = getDictionary(locale);
  const c = getLandingContent(locale);
  const faqs = t.faq.items(formatPrice(freeShippingThreshold));

  return (
    <div data-chapter="outro" className="relative bg-[#04060c]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-48 h-48 bg-gradient-to-b from-transparent to-[#04060c]" />

      <Testimonials items={testimonials} />

      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24 px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="eyebrow">{c.outro.faqEyebrow}</p>
            <h2 id="faq-title" className="mt-3 font-serif text-[clamp(2.1rem,4vw,3rem)] leading-[1.05] font-medium text-[#f4efe4]">
              {t.faq.heading}
            </h2>
          </div>
          <div className="mt-12 border-t border-white/10">
            {faqs.map((faq) => (
              <details key={faq.question} className="group border-b border-white/10">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
                  <span className="font-serif text-[22px] leading-snug text-[#f4efe4]">{faq.question}</span>
                  <IconPlus className="size-5 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <p className="-mt-1 pr-10 pb-6 text-[15px] leading-7 text-white/65">{faq.answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <p className="text-[14px] text-white/60">{t.faq.still}</p>
            <a href={conciergeUrl(locale)} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <IconWhatsApp className="size-4" />
              {t.faq.ask}
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="closing-title" className="border-t border-white/10 px-5 py-24 text-center md:py-32">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">{c.outro.closing.eyebrow}</p>
          <h2
            id="closing-title"
            className="mt-4 font-serif text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.05] font-medium text-[#f4efe4]"
          >
            {c.outro.closing.heading}
          </h2>
          <p className="mt-5 text-[15px] leading-7 text-[#cfc9bc] md:text-[16px]">{c.outro.closing.body}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ScrollLink to="collection" className="btn-gold w-full sm:w-auto">
              {c.outro.closing.primary}
              <IconArrow className="size-4" />
            </ScrollLink>
            <a href={conciergeUrl(locale)} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full sm:w-auto">
              <IconWhatsApp className="size-4" />
              {c.outro.closing.secondary}
            </a>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  );
}
