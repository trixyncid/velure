"use client";

import { useMemo, useState } from "react";
import { useCommerce } from "@/components/commerce";
import { recommend, type FinderAnswers } from "@/lib/landing/scent-finder";
import type { FinderScent } from "@/lib/scent-types";
import { openProduct } from "@/lib/landing/scroll";
import type { LandingProduct } from "@/lib/landing/types";
import { conciergeUrl } from "@/lib/whatsapp";
import { IconCheck, IconChevron, IconWhatsApp } from "@/components/icons";
import { useLandingContent } from "@/components/landing/hooks";
import { GenderTags, Price, ProductPhoto } from "@/components/landing/ProductBits";

/**
 * Two steps for undecided visitors, after the collection: who it is for, then the scents they
 * like (managed in the admin, Scents). The perfume that has the most of those scents is
 * recommended, and the result says which ones matched. Matching: lib/landing/scent-finder.ts.
 */
export function ScentFinder({ products, scents }: { products: LandingProduct[]; scents: FinderScent[] }) {
  const { c, locale } = useLandingContent();
  const { addToCart, openPanel } = useCommerce();
  const [who, setWho] = useState<FinderAnswers["who"] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState(0);
  // With no scents set up yet, the finder asks only who it is for.
  const total = scents.length > 0 ? 2 : 1;
  const done = step >= total;

  const results = useMemo(
    () => (done && who ? recommend(products, { who, scents: picked }) : []),
    [done, who, picked, products],
  );
  const match = results[pick] ?? results[0];
  const result = match?.product;
  const scentName = (scent: { nameId: string; nameEn: string }) => (locale === "en" && scent.nameEn) || scent.nameId;

  function chooseWho(value: FinderAnswers["who"]) {
    setWho(value);
    setPick(0);
    setStep(1);
  }

  function toggleScent(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function restart() {
    setWho(null);
    setPicked([]);
    setStep(0);
    setPick(0);
  }

  const option = (selected: boolean) =>
    `min-h-[52px] border px-4 text-left text-[14px] transition-colors duration-300 ${
      selected
        ? "border-champagne bg-champagne/10 text-champagne"
        : "border-white/15 text-[#e4dccb] hover:border-champagne/70 hover:text-champagne"
    }`;

  return (
    <section id="finder" aria-labelledby="finder-title" className="scroll-mt-20 px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-stretch gap-8 md:flex-row md:items-center md:gap-14">
        <div className="panel-glass w-full px-6 py-7 md:max-w-xl md:px-10 md:py-10">
          <p className="eyebrow">{c.finder.eyebrow}</p>

          {!done ? (
            <>
              <h2 id="finder-title" className="mt-3 font-serif text-[clamp(1.9rem,4vw,3rem)] leading-tight font-medium text-[#f4efe4]">
                {c.finder.heading}
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-[#cfc9bc]">{c.finder.intro}</p>

              <div className="mt-7 flex items-center gap-3">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    aria-label={c.finder.back}
                    className="-ml-2 grid size-8 place-items-center text-white/60 hover:text-white"
                  >
                    <IconChevron className="size-4" />
                  </button>
                ) : null}
                <p className="text-[10px] tracking-[0.26em] text-white/50 uppercase" aria-live="polite">
                  {c.finder.step(step + 1, total)}
                </p>
                <span className="h-px flex-1 bg-white/10">
                  <span
                    className="block h-px bg-gold transition-all duration-500"
                    style={{ width: `${((step + 1) / total) * 100}%` }}
                  />
                </span>
              </div>

              {step === 0 ? (
                <fieldset key="who" className="animate-quote mt-5">
                  <legend className="font-serif text-[clamp(1.5rem,3vw,2rem)] text-champagne">{c.finder.who.title}</legend>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                    {c.finder.who.options.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        aria-pressed={who === item.value}
                        onClick={() => chooseWho(item.value)}
                        className={option(who === item.value)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <fieldset key="scents" className="animate-quote mt-5">
                  <legend className="font-serif text-[clamp(1.5rem,3vw,2rem)] text-champagne">{c.finder.scents.title}</legend>
                  <p className="mt-1 text-[13px] text-white/55">{c.finder.scents.hint}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {scents.map((scent) => {
                      const selected = picked.includes(scent.id);
                      return (
                        <button
                          key={scent.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleScent(scent.id)}
                          className={`inline-flex min-h-[44px] items-center gap-2 border px-4 text-[14px] transition-colors duration-300 ${
                            selected
                              ? "border-champagne bg-champagne/10 text-champagne"
                              : "border-white/15 text-[#e4dccb] hover:border-champagne/70 hover:text-champagne"
                          }`}
                        >
                          {selected ? <IconCheck className="size-3.5" /> : null}
                          {scent.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <button type="button" className="btn-gold" disabled={picked.length === 0} onClick={() => setStep(2)}>
                      {c.finder.scents.submit}
                    </button>
                    <p className="text-[12px] text-white/50" aria-live="polite">
                      {c.finder.scents.picked(picked.length)}
                    </p>
                  </div>
                </fieldset>
              )}
            </>
          ) : result ? (
            <div key={result.id} className="animate-quote" aria-live="polite">
              <p className="mt-3 text-[14px] text-[#cfc9bc]">{c.finder.resultHeading}</p>
              <h2 id="finder-title" className="mt-1 font-serif text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.03] font-medium text-[#f4efe4]">
                {result.name}
              </h2>
              {picked.length > 0 ? (
                <p className="mt-4 border-l border-gold py-1 pl-3 text-[14px] leading-6 text-[#e4dccb]">
                  {match.matched.length > 0
                    ? c.finder.matched(match.matched.map(scentName).join(", "), match.matched.length, picked.length)
                    : c.finder.closest}
                </p>
              ) : null}
              <div className="mt-4">
                <GenderTags product={result} />
              </div>
              {result.character ? <p className="mt-4 text-[14px] leading-6 text-[#cfc9bc]">{result.character}</p> : null}
              <div className="mt-4">
                <Price product={result} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-gold flex-1 sm:flex-none"
                  onClick={() => {
                    if (result.price == null) return openProduct(result.id, result.slug);
                    addToCart(result.id, 1);
                    openPanel("cart");
                  }}
                >
                  {c.finder.order}
                </button>
                <button type="button" className="btn-ghost flex-1 sm:flex-none" onClick={() => openProduct(result.id, result.slug)}>
                  {c.finder.details}
                </button>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-[12px]">
                {results.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setPick((pick + 1) % results.length)}
                    className="text-champagne underline-offset-4 hover:underline"
                  >
                    {c.finder.alsoLike}: {results[(pick + 1) % results.length].product.name}
                  </button>
                ) : null}
                <button type="button" onClick={restart} className="tracking-[0.16em] text-white/55 uppercase hover:text-white">
                  {c.finder.restart}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 id="finder-title" className="mt-3 font-serif text-[clamp(1.7rem,3.6vw,2.4rem)] leading-tight text-[#f4efe4]">
                {c.finder.noMatch}
              </h2>
              <a href={conciergeUrl(locale)} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-6">
                <IconWhatsApp className="size-4" /> WhatsApp
              </a>
            </div>
          )}
        </div>
        {done && result ? (
          <ProductPhoto
            key={result.id}
            product={result}
            alt={c.fallback.bottleAlt(result.name)}
            sizes="(max-width: 768px) 92vw, 420px"
            className="animate-fade aspect-[4/5] w-full border border-white/10 md:ml-auto md:max-w-[400px]"
          />
        ) : null}
      </div>
    </section>
  );
}
