import { freeShippingThreshold, trustItems } from "@/lib/content";
import { formatPrice } from "@/lib/format";
import { getDictionary, type Locale } from "@/lib/i18n";
import { Reveal } from "@/components/reveal";
import { IconChat, IconSeal, IconTruck, IconWallet } from "@/components/icons";

const icons = {
  chat: IconChat,
  wallet: IconWallet,
  truck: IconTruck,
  seal: IconSeal,
} as const;

export function TrustBar({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const threshold = formatPrice(freeShippingThreshold);
  const copy = {
    concierge: t.trust.concierge,
    payLater: t.trust.payLater,
    shipping: { title: t.trust.shipping.title, detail: t.trust.shipping.detail(threshold) },
    quality: t.trust.quality,
  };

  return (
    <section aria-label={t.trust.label} className="border-b border-line bg-ivory/60">
      <ul className="mx-auto grid max-w-[1180px] grid-cols-2 gap-x-4 gap-y-8 px-5 py-9 md:px-8 lg:grid-cols-4">
        {trustItems.map((item, index) => {
          const Icon = icons[item.icon];
          const text = copy[item.id];
          return (
            <li key={item.id}>
              <Reveal
                delay={index * 90}
                className="flex min-w-0 flex-col items-center gap-2.5 text-center sm:flex-row sm:items-start sm:gap-3.5 sm:text-left lg:justify-center"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-champagne/70 bg-white text-ink">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-ink uppercase sm:text-[12px]">
                    {text.title}
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-muted sm:text-[13px]">
                    {text.detail}
                  </p>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
