import { getLandingContent } from "@/config/landing-content";
import type { Locale } from "@/lib/i18n";
import { IconArrow } from "@/components/icons";
import { HeroScrub } from "@/components/landing/HeroScrub";
import { FadeUp, RevealLines } from "@/components/landing/RevealLines";
import { ScrollLink } from "@/components/landing/ScrollLink";

/**
 * Chapter 1: midnight falls. The section is several screens tall and its content is pinned,
 * so scrolling plays the opening shots: the moonlit sky sinks to the water, mist rolls in,
 * and a bottle rises out of it. Three beats of copy come and go along the way
 * (timings in lib/landing/footage.ts, styles in app/[lang]/landing.css):
 *
 *   title    the collection's name and what it is, under the moon
 *   tagline  one line over the mist
 *   reveal   a short line and two ways forward (the collection, or help choosing), beside the bottle
 */
export function Hero({ locale }: { locale: Locale }) {
  const c = getLandingContent(locale);
  return (
    <section id="top" data-chapter="hero" aria-labelledby="hero-title" className="hero-film">
      <div className="hero-pin">
        <div className="hero-beat" data-beat="title">
          <FadeUp>
            <p className="eyebrow">{c.hero.eyebrow}</p>
          </FadeUp>
          <RevealLines
            as="h1"
            id="hero-title"
            lines={c.hero.titleLines}
            className="mt-5 font-serif text-[clamp(3rem,9.5vw,6.6rem)] leading-[0.98] font-medium text-[#f4efe4]"
          />
          <FadeUp delay={500}>
            <p className="mt-6 font-serif text-[clamp(1.15rem,2.2vw,1.6rem)] text-champagne italic">{c.hero.sub}</p>
          </FadeUp>
        </div>

        <div className="hero-beat" data-beat="tagline">
          <p className="mx-auto max-w-3xl font-serif text-[clamp(1.6rem,4.4vw,3.2rem)] leading-[1.15] text-[#f4efe4] italic">
            {c.hero.interlude}
          </p>
        </div>

        <div className="hero-beat" data-beat="reveal">
          <p className="eyebrow">{c.hero.reveal.eyebrow}</p>
          <p className="mt-3 font-serif text-[clamp(1.5rem,2.6vw,2.4rem)] leading-[1.12] text-[#f4efe4] md:mt-4">
            {c.hero.reveal.line}
          </p>
          <div className="mt-5 flex flex-col items-center gap-4 md:mt-8 md:items-start">
            <ScrollLink to="collection" className="btn-gold">
              {c.hero.cta}
              <IconArrow className="size-4" />
            </ScrollLink>
            <ScrollLink to="finder" className="link-quiet">
              {c.hero.reveal.secondary}
            </ScrollLink>
          </div>
        </div>

        <div className="hero-cue" data-beat="cue" aria-hidden="true">
          <span className="text-[10px] tracking-[0.32em] text-white/55 uppercase">{c.hero.scroll}</span>
          <span className="scroll-cue h-10 w-px bg-gradient-to-b from-gold to-transparent" />
        </div>
      </div>
      <HeroScrub />
    </section>
  );
}
