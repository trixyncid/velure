import { getDictionary, type Locale } from "@/lib/i18n";
import { conciergeUrl, WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { IconBag, IconChat, IconWallet, IconWhatsApp } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

const stepIcons = [IconBag, IconChat, IconWallet];

export function HowToOrder({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const h = t.howToOrder;
  return (
    <section id="how-to-order" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1180px] px-5 md:px-8">
        <Reveal>
          <SectionHeading eyebrow={h.eyebrow}>{h.heading}</SectionHeading>
          <p className="mx-auto mt-6 max-w-xl text-center text-[15px] leading-7 text-muted">
            {h.intro}
          </p>
        </Reveal>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <span
            aria-hidden="true"
            className="absolute top-7 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-champagne to-transparent md:block"
          />
          {h.steps.map((step, index) => {
            const Icon = stepIcons[index];
            return (
              <li key={step.title}>
                <Reveal delay={index * 120} className="relative flex flex-col items-center text-center">
                  <span className="relative grid size-14 place-items-center rounded-full border border-champagne bg-white">
                    <Icon className="size-6" />
                    <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-ink text-[11px] text-white">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="mt-6 font-serif text-[26px] leading-tight">{step.title}</h3>
                  <p className="mt-3 max-w-xs text-[14px] leading-7 text-muted">{step.detail}</p>
                </Reveal>
              </li>
            );
          })}
        </ol>

        <Reveal className="mt-16 flex flex-col items-center gap-4 text-center">
          <a
            href="#shop"
            className="inline-flex bg-ink px-8 py-4 text-[12px] tracking-[0.22em] text-white uppercase transition-colors duration-300 hover:bg-[#2a2620]"
          >
            {h.start}
          </a>
          <p className="text-[13px] text-muted">
            {h.questions}{" "}
            <a
              href={conciergeUrl(locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-ink underline underline-offset-4"
            >
              <IconWhatsApp className="size-3.5" />
              {WHATSAPP_DISPLAY}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
