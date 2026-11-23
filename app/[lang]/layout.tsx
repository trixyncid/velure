import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { CommerceProvider } from "@/components/commerce";
import { getLandingContent } from "@/config/landing-content";
import { fontVariables } from "@/lib/fonts";
import { getStoreCatalog } from "@/lib/store";
import { getDictionary, hasLocale, locales, localeTags } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/client";
import { siteUrl } from "@/lib/site";
import "../globals.css";
import "./landing.css";

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
  const meta = getLandingContent(lang).meta;
  return {
    // Makes canonical, language alternates and Open Graph URLs absolute.
    metadataBase: siteUrl,
    title: { default: meta.title, template: "%s · Velure" },
    description: meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { "id-ID": "/id", "en-GB": "/en", "x-default": "/id" },
    },
    openGraph: {
      title: meta.title,
      description: meta.ogDescription,
      type: "website",
      url: `/${lang}`,
      siteName: "Velure",
      locale: localeTags[lang].replace("-", "_"),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#04060c",
  width: "device-width",
  initialScale: 1,
};

export default async function StoreLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const products = await getStoreCatalog();

  return (
    <html lang={lang} className={`${fontVariables} motion night h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <noscript>
          {/* Without JavaScript, show the story as a plain page. */}
          <style>{`.line-mask > span { transform: none } .fade-up { opacity: 1; transform: none } [role="status"] { display: none } .hero-film { height: auto } .hero-pin { position: static; height: auto; min-height: 100svh } .hero-beat { position: static; opacity: 1 } .hero-cue { display: none }`}</style>
        </noscript>
        <a
          href="#main"
          className="absolute top-4 left-4 z-[110] -translate-y-24 bg-champagne px-4 py-2 text-sm text-[#070a14] focus:translate-y-0"
        >
          {t.common.skipToContent}
        </a>
        <I18nProvider locale={lang}>
          <CommerceProvider products={products}>
            {children}
          </CommerceProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
