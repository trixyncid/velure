import type { Metadata } from "next";
import Link from "next/link";
import { FragranceList } from "@/components/admin/fragrance-list";
import { PageHeader, buttonClass } from "@/components/admin/ui";
import { listFragrances } from "@/lib/perfumes";

export const metadata: Metadata = {
  title: "Fragrances",
};

export default async function FragrancesPage() {
  const fragrances = await listFragrances();

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Fragrances"
        lede="Names, who they are for, prices, and the photographs that introduce them. Prices here are exactly what the shop shows."
      >
        <Link href="/admin/perfumes/new" className={buttonClass}>
          New fragrance
        </Link>
      </PageHeader>

      {fragrances.length === 0 ? (
        <div className="mt-10 border border-dashed border-line bg-white px-6 py-16 text-center">
          <h2 className="font-serif text-4xl text-ink">The catalog is empty</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            Add the first fragrance, then attach the photographs that should represent it.
          </p>
          <Link href="/admin/perfumes/new" className={`${buttonClass} mt-8`}>
            New fragrance
          </Link>
        </div>
      ) : (
        <FragranceList fragrances={fragrances} />
      )}
    </>
  );
}
