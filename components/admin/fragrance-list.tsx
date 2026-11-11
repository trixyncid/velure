"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { genderLabel, type Fragrance } from "@/lib/catalog";
import { PriceBadges, PriceSummary } from "@/components/admin/price-summary";

export function FragranceList({ fragrances }: { fragrances: Fragrance[] }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = fragrances.filter((fragrance) => {
    if (!needle) return true;
    const genders = fragrance.genders.map(genderLabel).join(" ");
    return `${fragrance.name} ${fragrance.description} ${genders}`.toLowerCase().includes(needle);
  });

  return (
    <div className="mt-10">
      {fragrances.length > 4 ? (
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the catalog"
          aria-label="Search the catalog"
          className="mb-6 w-full max-w-sm border-b border-line bg-transparent py-2 text-sm outline-none placeholder:text-muted/60"
        />
      ) : null}

      {visible.length === 0 ? (
        <p className="text-sm text-muted">Nothing in the catalog matches that search.</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((fragrance) => {
            const cover = fragrance.images[0];
            const audience = fragrance.genders.map(genderLabel).join(" · ");
            return (
              <li key={fragrance.id}>
                <Link
                  href={`/admin/perfumes/${fragrance.id}`}
                  className="group block border border-line bg-white transition-colors hover:border-gold"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                    {cover?.url ? (
                      <Image
                        src={cover.url}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 320px, (min-width: 640px) 45vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <span className="grid h-full place-items-center font-serif text-5xl text-ink/25">
                        {fragrance.name.trim().charAt(0).toUpperCase() || "V"}
                      </span>
                    )}
                    <span className="absolute top-3 left-3">
                      <PriceBadges fragrance={fragrance} />
                    </span>
                  </div>
                  <div className="px-5 py-5">
                    <h2 className="font-serif text-3xl text-ink">{fragrance.name}</h2>
                    <p className="mt-2 text-[12px] tracking-[0.16em] text-muted uppercase">
                      {audience || "Audience not set"}
                    </p>
                    <p className="mt-3">
                      <PriceSummary fragrance={fragrance} />
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      {fragrance.images.length}{" "}
                      {fragrance.images.length === 1 ? "photograph" : "photographs"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
