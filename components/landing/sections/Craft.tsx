"use client";

import { useLanding } from "@/lib/landing/film";
import type { LandingProduct } from "@/lib/landing/types";
import { IconArrow } from "@/components/icons";
import { ScrollLink } from "@/components/landing/ScrollLink";
import { useLandingContent } from "@/components/landing/hooks";

/** Still scenes for devices without the 3D film: the same three steps, cross-fading. */
function CraftStills({ step, product }: { step: number; product: LandingProduct | undefined }) {
  const theme = product?.theme;
  if (!theme) return null;
  const merged = step >= 2;
  const luminous = step >= 3;
  const shared = luminous ? theme.liquidColor : undefined;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[16svh] mx-auto h-[38svh] max-w-md md:top-[24svh] md:right-[8vw] md:left-auto md:mx-0 md:h-[50svh] md:w-[40vw]">
      <span
        className="craft-orb top-1/2 left-1/2 size-28 md:size-36"
        style={{
          background: `radial-gradient(circle at 35% 30%, #fff8, ${shared ?? theme.lightColor} 45%, transparent 75%)`,
          boxShadow: `0 0 ${luminous ? 110 : 50}px ${shared ?? theme.lightColor}`,
          transform: `translate(-50%, -50%) translateX(${merged ? 0 : -72}%) scale(${merged ? 1.25 : 1})`,
          opacity: step === 0 ? 0.5 : step >= 4 ? 0.25 : 1,
        }}
      />
      <span
        className="craft-orb top-1/2 left-1/2 size-28 md:size-36"
        style={{
          background: `radial-gradient(circle at 60% 35%, #fff8, ${shared ?? theme.lightColor2} 45%, transparent 75%)`,
          boxShadow: `0 0 ${luminous ? 110 : 50}px ${shared ?? theme.lightColor2}`,
          transform: `translate(-50%, -50%) translateX(${merged ? 0 : 72}%) scale(${merged ? 1.25 : 1})`,
          opacity: step === 0 ? 0.5 : merged ? 0.55 : 1,
          mixBlendMode: "screen",
        }}
      />
      {[0, 1, 2].map((drop) => (
        <span
          key={drop}
          className="craft-orb left-1/2 size-2.5 bg-white/90"
          style={{
            top: `${8 + drop * 9}%`,
            transform: `translateX(${(drop - 1) * 22 - 5}px)`,
            boxShadow: "0 0 14px #fff",
            opacity: step === 3 ? 0.9 : 0,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Chapter 3: Bagaimana Midnight Tercipta. A scroll-pinned sequence played by footage
 * (see components/landing/three/Footage.tsx), with the copy in config/landing-content.ts:
 *
 *   01–03  the three steps, numbered, in a column beside the picture
 *   pour   the pour and seal: a caption in the same column, deliberately not numbered
 *   finale the seven bottles: a centred line, then a question that leads into the shop
 *
 * Caption changes are driven by CRAFT_STEPS in lib/landing/footage.ts.
 */
export function Craft({ products }: { products: LandingProduct[] }) {
  const { c } = useLandingContent();
  const step = useLanding((state) => state.craftStep);
  const mode = useLanding((state) => state.mode);
  const product = products[0];
  // Before scroll reaches the first step, show step 01 so the column is never empty.
  const shown = Math.min(3, Math.max(1, step));
  const pour = step === 4;
  // The finale stays up as the chapter unpins: the shop rises directly beneath it.
  const finale = step >= 5;
  const asking = step >= 6;
  const leaving = step >= 7;
  const swap = "transition-all duration-700 ease-out";
  const hidden = "pointer-events-none translate-y-4 opacity-0";

  return (
    <section
      id="craft"
      data-chapter="craft"
      aria-labelledby="craft-title"
      className={`relative ${mode === "static" ? "h-[480svh]" : "h-[800svh]"}`}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {mode === "static" ? <CraftStills step={step} product={product} /> : null}

        {/* Keep the copy readable over full-screen footage. */}
        <div
          aria-hidden="true"
          className="scrim-left hidden md:block"
          style={{ opacity: finale || leaving || step === 0 ? 0 : step >= 3 ? 1 : 0.5 }}
        />
        <div aria-hidden="true" className="scrim-bottom" style={{ opacity: finale ? 1 : 0 }} />

        <header
          className={`relative mx-auto w-full max-w-[1320px] px-5 pt-24 text-center transition-opacity duration-700 md:px-10 md:pt-28 md:text-left ${
            finale || leaving ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="eyebrow">{c.craft.eyebrow}</p>
          <h2
            id="craft-title"
            className="sr-only mt-3 font-serif text-[clamp(1.7rem,3.6vw,2.6rem)] leading-tight font-medium text-[#f4efe4] md:not-sr-only"
          >
            {c.craft.heading}
          </h2>
        </header>

        <div className="relative mx-auto mt-auto w-full max-w-[1320px] px-5 pb-20 md:mb-auto md:px-10 md:pb-0">
          <ol className="relative min-h-[15.5rem] max-w-md md:min-h-[17rem] md:max-w-[25rem]">
            {c.craft.steps.map((item, index) => {
              const active = step < 4 && shown === index + 1;
              return (
                <li
                  key={item.number}
                  aria-current={active ? "step" : undefined}
                  className={`absolute inset-x-0 bottom-0 md:top-0 md:bottom-auto ${swap} ${
                    active ? "translate-y-0 opacity-100" : hidden
                  }`}
                >
                  <div className="panel-glass px-6 py-6 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
                    <p className="flex items-baseline gap-4">
                      <span className="font-serif text-[clamp(2.6rem,6vw,4.4rem)] leading-none text-gold">
                        {item.number}
                      </span>
                      <span className="text-[11px] tracking-[0.24em] text-white/60 uppercase">{item.step}</span>
                    </p>
                    <h3 className="mt-3 font-serif text-[clamp(1.8rem,4vw,2.9rem)] leading-tight font-medium text-[#f4efe4]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-7 text-[#d6d0c3] md:text-[16px]">{item.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* The pour and seal. Same place as the steps, but not one of them. */}
          <div
            className={`absolute inset-x-5 bottom-20 max-w-md md:inset-x-10 md:top-0 md:bottom-auto md:max-w-[25rem] ${swap} ${
              pour ? "translate-y-0 opacity-100" : hidden
            }`}
          >
            <div className="panel-glass px-6 py-6 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
              <p className="eyebrow">{c.craft.pour.label}</p>
              <h3 className="mt-4 font-serif text-[clamp(1.8rem,4vw,2.9rem)] leading-tight font-medium text-[#f4efe4]">
                {c.craft.pour.title}
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-[#d6d0c3] md:text-[16px]">{c.craft.pour.body}</p>
            </div>
          </div>

          <div
            className={`mt-6 flex items-center gap-2 transition-opacity duration-500 ${finale || leaving ? "opacity-0" : "opacity-100"}`}
            aria-hidden="true"
          >
            {c.craft.steps.map((item, index) => (
              <span
                key={item.number}
                className={`h-px transition-all duration-500 ${
                  pour || (shown >= index + 1 && step > 0) ? "w-12 bg-gold" : "w-6 bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Finale: the collection, then the question that hands over to it. */}
        <div
          className={`absolute inset-x-0 bottom-0 grid justify-items-center px-5 pb-28 text-center md:pb-14 ${swap} ${
            finale ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className={`col-start-1 row-start-1 self-end ${swap} ${asking ? hidden : "translate-y-0 opacity-100"}`}>
            <p className="eyebrow">{c.craft.finale.eyebrow}</p>
            <p className="mt-4 font-serif text-[clamp(1.7rem,3.8vw,3rem)] leading-[1.12] font-medium text-[#f4efe4]">
              {c.craft.finale.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div
            className={`col-start-1 row-start-1 flex flex-col items-center self-end ${swap} ${
              asking ? "translate-y-0 opacity-100" : hidden
            }`}
          >
            <p className="font-serif text-[clamp(1.9rem,4.4vw,3.4rem)] leading-tight text-champagne italic">
              {c.craft.finale.question}
            </p>
            <ScrollLink to="collection" className="btn-ghost mt-6">
              {c.craft.finale.cta}
              <IconArrow className="size-4" />
            </ScrollLink>
          </div>
        </div>
      </div>
    </section>
  );
}
