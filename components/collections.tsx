"use client";

import Image from "next/image";
import { collections } from "@/lib/content";
import { useI18n } from "@/lib/i18n/client";
import { useShowCollection } from "@/components/commerce";
import { IconArrow } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

export function Collections() {
  const showCollection = useShowCollection();
  const { t } = useI18n();

  return (
    <section id="collections" className="scroll-mt-24 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1180px] px-5 md:px-8">
        <Reveal>
          <SectionHeading eyebrow={t.collections.eyebrow}>{t.collections.heading}</SectionHeading>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {collections.map((collection, index) => (
            <li key={collection.id}>
              <Reveal delay={index * 90} className="h-full">
                <button
                  type="button"
                  onClick={() => showCollection(collection.filter)}
                  className="group relative block aspect-[3/4] w-full overflow-hidden bg-ink text-left"
                >
                  <Image
                    src={collection.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-700 ease-out group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-colors group-hover:from-black/90" />
                  <span className="absolute inset-x-0 bottom-0 flex flex-col items-center px-3 pb-6 text-center text-white sm:pb-8">
                    <span className="text-[10px] tracking-[0.28em] text-champagne uppercase sm:text-[11px]">
                      {t.collections.items[collection.id].eyebrow}
                    </span>
                    <span className="mt-1.5 font-serif text-[22px] leading-none sm:text-[28px]">
                      {t.collections.items[collection.id].title}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] tracking-[0.22em] uppercase opacity-80 transition-[opacity,gap] duration-300 group-hover:gap-2.5 group-hover:opacity-100 sm:text-[11px]">
                      {t.collections.explore} <IconArrow className="size-3.5" />
                    </span>
                  </span>
                </button>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
