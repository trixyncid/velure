import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { genderLabel } from "@/lib/catalog";
import { PriceBadges, PriceSummary } from "@/components/admin/price-summary";
import { atelierSnapshot } from "@/lib/perfumes";
import { requireAdmin } from "@/lib/session";
import { spacesStatus } from "@/lib/spaces";

export const metadata: Metadata = {
  title: "Atelier",
};

export default async function AdminHomePage() {
  const session = await requireAdmin();
  const snapshot = await atelierSnapshot();
  const storage = spacesStatus();
  const firstName = session.user.name.trim().split(/\s+/)[0] || "there";

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName}`}
        lede="People who can enter the atelier, and the fragrances the house keeps — with the prices the shop shows."
      />

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat href="/admin/users" label="People" value={snapshot.people} detail="Can sign in to the atelier" />
        <Stat
          href="/admin/perfumes"
          label="Fragrances"
          value={snapshot.fragrances}
          detail="In the catalog"
        />
        <Stat
          href="/admin/perfumes"
          label="Photographs"
          value={snapshot.photographs}
          detail="Attached to fragrances"
        />
        <Stat
          href="/admin/perfumes"
          label="Price on request"
          value={snapshot.unpriced}
          detail={
            snapshot.unpriced === 0
              ? "Every fragrance has a price"
              : "Can't be added to the bag until priced"
          }
          tone={snapshot.unpriced > 0 ? "warning" : "default"}
        />
      </ul>

      <section className="mt-10 border border-line bg-white">
        <div className="flex items-end justify-between gap-4 border-b border-line px-6 py-5">
          <h2 className="font-serif text-3xl text-ink">Recent fragrances</h2>
          <Link
            href="/admin/perfumes"
            className="text-[12px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-ink"
          >
            View all
          </Link>
        </div>
        {snapshot.recent.length === 0 ? (
          <div className="px-6 py-10">
            <p className="text-sm leading-6 text-muted">The catalog is waiting for its first fragrance.</p>
            <Link
              href="/admin/perfumes/new"
              className="mt-5 inline-flex bg-ink px-5 py-3 text-[12px] tracking-[0.18em] text-white uppercase"
            >
              New fragrance
            </Link>
          </div>
        ) : (
          <ul>
            {snapshot.recent.map((fragrance) => (
              <li key={fragrance.id} className="border-b border-line last:border-b-0">
                <Link
                  href={`/admin/perfumes/${fragrance.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-ivory"
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2 text-sm text-ink">
                      {fragrance.name}
                      <span className="flex gap-1.5 [&>span]:flex-row [&>span]:gap-1.5">
                        <PriceBadges fragrance={fragrance} />
                      </span>
                    </span>
                    <span className="mt-1 block text-[11px] tracking-[0.14em] text-muted uppercase">
                      {fragrance.genders.map(genderLabel).join(" · ") || "Audience not set"}
                      {" · "}
                      {fragrance.images.length}{" "}
                      {fragrance.images.length === 1 ? "photograph" : "photographs"}
                    </span>
                  </span>
                  <PriceSummary fragrance={fragrance} className="shrink-0 justify-end text-right" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-sm leading-6 text-muted">
        {storage.configured
          ? `Photographs are stored in ${storage.bucket}.`
          : "Photographs need DigitalOcean Spaces before they can be uploaded."}
      </p>
    </>
  );
}

function Stat({
  href,
  label,
  value,
  detail,
  tone = "default",
}: {
  href: string;
  label: string;
  value: number;
  detail: string;
  tone?: "default" | "warning";
}) {
  return (
    <li>
      <Link
        href={href}
        className={`block h-full border bg-white p-6 transition-colors hover:border-gold ${
          tone === "warning" ? "border-gold/70" : "border-line"
        }`}
      >
        <p className="text-[12px] tracking-[0.16em] text-muted uppercase">{label}</p>
        <p className="mt-3 font-serif text-5xl text-ink">{value}</p>
        <p className="mt-2 text-sm text-muted">{detail}</p>
      </Link>
    </li>
  );
}
