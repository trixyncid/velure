"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

const I18nContext = createContext<Locale | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <I18nContext.Provider value={locale}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const locale = useContext(I18nContext);
  if (!locale) throw new Error("useI18n must be used within I18nProvider");
  return { locale, t: getDictionary(locale) };
}
