import { getLandingContent } from "@/config/landing-content";
import { freeShippingThreshold } from "@/lib/content";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { IconChat, IconSeal, IconTruck, IconWallet } from "@/components/icons";

const ICONS = [IconSeal, IconWallet, IconChat, IconTruck];

/** How ordering works, in four short reassurances between the collection and the finder. */
export function Assurance({ locale }: { locale: Locale }) {
  const c = getLandingContent(locale);
  const items = [...c.order.trust, c.order.trustShipping(formatPrice(freeShippingThreshold))];
  return (
    <section aria-labelledby="assurance-title" className="border-y border-white/10 px-5 py-14 md:px-10 md:py-16">
      <div className="mx-auto max-w-[1320px]">
        <p className="eyebrow text-center">{c.assurance.eyebrow}</p>
        <h2 id="assurance-title" className="sr-only">
          {c.assurance.heading}
        </h2>
        <ul className="mt-9 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <li key={item.title} className="flex items-start gap-4">
                <Icon className="mt-0.5 size-6 shrink-0 text-gold" />
                <span>
                  <span className="block font-serif text-[19px] leading-tight text-[#f4efe4]">{item.title}</span>
                  <span className="mt-1 block text-[13px] leading-5 text-white/55">{item.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
