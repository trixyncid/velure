import type { Metadata } from "next";
import { TestimonialManager } from "@/components/admin/testimonial-manager";
import { PageHeader } from "@/components/admin/ui";
import { listTestimonials, type Testimonial } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Testimonials",
};

export default async function TestimonialsPage() {
  let testimonials: Testimonial[] = [];
  let unavailable = false;
  try {
    testimonials = await listTestimonials();
  } catch (error) {
    console.error(error);
    unavailable = true;
  }

  return (
    <>
      <PageHeader
        eyebrow="Landing page"
        title="Testimonials"
        lede="What customers say about the house. Published quotes rotate on the landing page in this order, in Indonesian and English."
      />
      {unavailable ? (
        <div className="mt-10 border border-dashed border-line bg-white px-6 py-12 text-center">
          <h2 className="font-serif text-3xl text-ink">Testimonials aren&apos;t set up yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            The database is missing the testimonials table. Apply the pending migration with{" "}
            <code className="bg-ivory px-1.5 py-0.5 text-ink">
              npx prisma migrate deploy --config prisma7.config.ts
            </code>{" "}
            and reload this page.
          </p>
        </div>
      ) : (
        <TestimonialManager testimonials={testimonials} />
      )}
    </>
  );
}
