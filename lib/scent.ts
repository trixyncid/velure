import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import type { FinderScent, ScentRecord } from "@/lib/scent-types";

export * from "@/lib/scent-types";

const order = [{ position: "asc" as const }, { createdAt: "asc" as const }];

/** Every scent, in order, with how many fragrances have it. For the admin. */
export async function listScents(): Promise<ScentRecord[]> {
  const rows = await prisma.scent.findMany({
    orderBy: order,
    include: { _count: { select: { perfumes: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    nameId: row.nameId,
    nameEn: row.nameEn ?? "",
    position: row.position,
    perfumes: row._count.perfumes,
  }));
}

/**
 * The scents visitors can pick in the finder, in one language. Only scents at least one
 * fragrance has are offered, so every pick can lead somewhere. Empty if the database is
 * unreachable (the finder then asks only who the scent is for).
 */
export async function getFinderScents(locale: Locale): Promise<FinderScent[]> {
  try {
    const scents = await listScents();
    return scents
      .filter((scent) => scent.perfumes > 0)
      .map((scent) => ({ id: scent.id, name: (locale === "en" && scent.nameEn) || scent.nameId }));
  } catch (error) {
    console.error("Could not load the scent finder's scents", error);
    return [];
  }
}
