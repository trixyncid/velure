import { getLandingContent } from "@/config/landing-content";
import type { Locale } from "@/lib/i18n";
import { FadeUp, RevealLines } from "@/components/landing/RevealLines";

/**
 * The blocks alternate sides so the bottle playing behind them stays in view; each sits on
 * a soft dark pool (see .story-pool in landing.css) that keeps it readable over the footage.
 */
const ALIGN = [
  "md:ml-0 md:text-left story-pool",
  "md:mr-0 md:text-right story-pool story-pool-right",
  "md:ml-0 md:text-left story-pool",
];

/**
 * Chapter 2: what midnight means to Velure, leading into how a scent is made. It scrolls
 * over the hero's bottle shot, which keeps playing until the craft chapter takes over.
 */
export function BrandStory({ locale }: { locale: Locale }) {
  const c = getLandingContent(locale);
  return (
    <section data-chapter="story" id="story" aria-label={c.story.eyebrow} className="relative overflow-x-clip">
      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        {c.story.blocks.map((block, index) => (
          <div
            key={block.body}
            // The first block follows the hero straight in, over the last of its footage.
            className={index === 0 ? "flex min-h-[82svh] items-start pt-[9svh]" : "flex min-h-[86svh] items-center"}
          >
            <div
              className={`mx-auto max-w-2xl text-center ${ALIGN[index % ALIGN.length]}`}
            >
              {index === 0 ? (
                <FadeUp>
                  <p className="eyebrow mb-6">{c.story.eyebrow}</p>
                </FadeUp>
              ) : null}
              <RevealLines
                lines={block.titleLines}
                className="font-serif text-[clamp(2.2rem,5.6vw,4.2rem)] leading-[1.04] font-medium text-[#f4efe4]"
              />
              <FadeUp delay={350}>
                <p className="mt-6 text-[clamp(1rem,1.5vw,1.15rem)] leading-8 text-[#cfc9bc]">{block.body}</p>
              </FadeUp>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
