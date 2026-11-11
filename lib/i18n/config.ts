export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "id";

/** Remembers the visitor's choice so "/" sends them back to it. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeNames: Record<Locale, string> = {
  id: "Bahasa Indonesia",
  en: "English",
};

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** BCP 47 tag used for dates and the <html lang> attribute. */
export const localeTags: Record<Locale, string> = {
  id: "id-ID",
  en: "en-GB",
};
