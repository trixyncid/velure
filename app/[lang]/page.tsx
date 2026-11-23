import { notFound } from "next/navigation";
import { getLandingContent } from "@/config/landing-content";
import { hasLocale } from "@/lib/i18n";
import { excerpt } from "@/lib/landing/notes";
import { toLandingProducts } from "@/lib/landing/products";
import { absoluteUrl } from "@/lib/site";
import { getFinderScents } from "@/lib/scent";
import { getStoreCatalog } from "@/lib/store";
import { getStoreTestimonials } from "@/lib/testimonials";
import { LandingExperience } from "@/components/landing/LandingExperience";
import { Assurance } from "@/components/landing/sections/Assurance";
import { BrandStory } from "@/components/landing/sections/BrandStory";
import { Collection } from "@/components/landing/sections/Collection";
import { Craft } from "@/components/landing/sections/Craft";
import { Hero } from "@/components/landing/sections/Hero";
import { Outro } from "@/components/landing/sections/Outro";
import { ScentFinder } from "@/components/landing/sections/ScentFinder";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getLandingContent(lang);

  // Same catalog the layout loads for the cart; every perfume the admin adds appears here.
  const [catalog, testimonials, finderScents] = await Promise.all([
    getStoreCatalog(),
    getStoreTestimonials(lang),
    getFinderScents(lang),
  ]);
  const products = toLandingProducts(catalog);

  // Product structured data. Only facts from the CMS: no formulation or unverified claims.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": products.map((product) => ({
      "@type": "Product",
      name: product.name,
      ...(product.prose ? { description: excerpt(product.prose, 300) } : {}),
      brand: { "@type": "Brand", name: "Velure" },
      category: c.brand.collection,
      ...(product.images.length > 0 ? { image: product.images } : {}),
      ...(product.price != null
        ? {
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "IDR",
              url: absoluteUrl(`/${lang}?product=${product.slug}`),
            },
          }
        : {}),
    })),
  };

  return (
    <LandingExperience products={products}>
      {products.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
      <main id="main">
        <Hero locale={lang} />
        <BrandStory locale={lang} />
        <Craft products={products} />
        {/*
          The shop: an opaque sheet that rises over the film's last shot. From here on the
          page is ordinary server-rendered HTML driven by the CMS.
        */}
        <div data-chapter="shop" id="shop" className="relative bg-[#04060c]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-40 h-40 bg-gradient-to-b from-transparent to-[#04060c]" />
          <Collection products={products} />
          <Assurance locale={lang} />
          <ScentFinder products={products} scents={finderScents} />
        </div>
      </main>
      <Outro locale={lang} testimonials={testimonials} />
    </LandingExperience>
  );
}
