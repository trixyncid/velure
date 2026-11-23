import type { Metadata } from "next";
import { FragranceEditor } from "@/components/admin/fragrance-editor";
import { listScents } from "@/lib/scent";
import { spacesStatus } from "@/lib/spaces";

export const metadata: Metadata = {
  title: "New fragrance",
};

export default async function NewFragrancePage() {
  const scents = await listScents().catch(() => []);
  return <FragranceEditor storageReady={spacesStatus().configured} scents={scents} />;
}
