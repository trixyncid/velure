import { en, type Dictionary } from "@/lib/i18n/en";
import { id } from "@/lib/i18n/id";
import type { Locale } from "@/lib/i18n/config";

export type { Dictionary };
export * from "@/lib/i18n/config";

const dictionaries: Record<Locale, Dictionary> = { id, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

