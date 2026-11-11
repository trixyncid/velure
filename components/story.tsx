import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { getDictionary, type Locale } from "@/lib/i18n";

export function Story({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <section id="story" className="scroll-mt-24 lg:scroll-mt-28 grid bg-ink text-white md:grid-cols-2">
      <Reveal className="order-2 flex items-center px-6 py-16 md:order-1 md:px-14 md:py-24 lg:px-20">
        <div className="max-w-md">
          <p className="text-[12px] tracking-[0.34em] text-white/70 uppercase">
            {t.story.eyebrow}
          </p>
          <h2 className="mt-4 font-serif text-[clamp(2.4rem,4vw,3.5rem)] leading-[1.05] font-medium">
            {t.story.titleTop}
            <br />
            {t.story.titleBottom}
          </h2>
          <p className="mt-5 text-[15px] leading-7 text-white/75">
            {t.story.body}
          </p>
          <a
            href="#shop"
            className="mt-8 inline-flex bg-champagne px-8 py-3.5 text-[12px] font-medium tracking-[0.22em] text-ink uppercase transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-champagne-deep"
          >
            {t.story.cta}
          </a>
        </div>
      </Reveal>
      <Reveal
        delay={120}
        className="relative order-1 min-h-[380px] overflow-hidden md:order-2 md:min-h-[560px]"
      >
        <Image
          src="/images/story.jpg"
          alt={t.story.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-right transition duration-700 ease-out hover:scale-[1.03]"
        />
      </Reveal>
    </section>
  );
}
