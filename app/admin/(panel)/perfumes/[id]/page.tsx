import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FragranceEditor } from "@/components/admin/fragrance-editor";
import { getFragrance } from "@/lib/perfumes";
import { spacesStatus } from "@/lib/spaces";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const fragrance = await getFragrance(id);
  return { title: fragrance?.name ?? "Fragrance" };
}

export default async function FragrancePage({ params }: PageProps) {
  const { id } = await params;
  const fragrance = await getFragrance(id);
  if (!fragrance) notFound();

  return <FragranceEditor fragrance={fragrance} storageReady={spacesStatus().configured} />;
}
