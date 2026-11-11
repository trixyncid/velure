import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { getStoreTestimonials } from "@/lib/testimonials";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { TrustBar } from "@/components/trust-bar";
import { Collections } from "@/components/collections";
import { Products } from "@/components/products";
import { HowToOrder } from "@/components/how-to-order";
import { Story } from "@/components/story";
import { Testimonials } from "@/components/testimonials";
import { Faq } from "@/components/faq";
import { Footer } from "@/components/footer";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const testimonials = await getStoreTestimonials(lang);

  return (
    <>
      <Header />
      <main id="main">
        <Hero locale={lang} />
        <TrustBar locale={lang} />
        <Collections />
        <Products />
        <HowToOrder locale={lang} />
        <Story locale={lang} />
        <Testimonials items={testimonials} />
        <Faq locale={lang} />
      </main>
      <Footer locale={lang} />
    </>
  );
}
