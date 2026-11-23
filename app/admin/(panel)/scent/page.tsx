import type { Metadata } from "next";
import { ScentManager } from "@/components/admin/scent-manager";
import { PageHeader } from "@/components/admin/ui";
import { listScents, type ScentRecord } from "@/lib/scent";

export const metadata: Metadata = {
  title: "Scents",
};

export default async function ScentPage() {
  let scents: ScentRecord[] = [];
  let unavailable = false;
  try {
    scents = await listScents();
  } catch (error) {
    console.error(error);
    unavailable = true;
  }

  return (
    <>
      <PageHeader
        eyebrow="Landing page"
        title="Scents"
        lede="The scents visitors can pick in “Help me choose”. Tick the scents each fragrance has on its page; the finder recommends the fragrance that shares the most of the visitor's picks."
      />
      {unavailable ? (
        <div className="mt-10 border border-dashed border-line bg-white px-6 py-12 text-center">
          <h2 className="font-serif text-3xl text-ink">Scents aren&apos;t set up yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            The database is missing its table. Apply the pending migration with{" "}
            <code className="bg-ivory px-1.5 py-0.5 text-ink">npx prisma migrate deploy --config prisma7.config.ts</code>{" "}
            and reload this page.
          </p>
        </div>
      ) : (
        <ScentManager scents={scents} />
      )}
    </>
  );
}
