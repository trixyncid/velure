import type { Metadata } from "next";
import { FragranceEditor } from "@/components/admin/fragrance-editor";
import { spacesStatus } from "@/lib/spaces";

export const metadata: Metadata = {
  title: "New fragrance",
};

export default function NewFragrancePage() {
  return <FragranceEditor storageReady={spacesStatus().configured} />;
}
