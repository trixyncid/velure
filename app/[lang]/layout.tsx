import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { CommerceProvider } from "@/components/commerce";
import { Overlays } from "@/components/overlays";
import { fontVariables } from "@/lib/fonts";
import { getStoreCatalog } from "@/lib/store";
import { getDictionary, hasLocale, locales, localeTags } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/client";
import "../globals.css";

// Only /id and /en exist; anything else is a 404.
export const dynamicParams = false;

// Admin saves refresh the shop immediately (revalidatePath); this is a safety net.
export const revalidate = 300;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: { default: t.meta.title, template: "%s · Velure" },
    description: t.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { "id-ID": "/id", "en-GB": "/en", "x-default": "/id" },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.ogDescription,
      type: "website",
      locale: localeTags[lang].replace("-", "_"),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default async function StoreLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const products = await getStoreCatalog();

  return (
    <html lang={lang} className={`${fontVariables} motion h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <a
          href="#main"
          className="absolute top-4 left-4 z-[60] -translate-y-24 bg-white px-4 py-2 text-sm focus:translate-y-0"
        >
          {t.common.skipToContent}
        </a>
        <I18nProvider locale={lang}>
          <CommerceProvider products={products}>
            {children}
            <Overlays />
          </CommerceProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
