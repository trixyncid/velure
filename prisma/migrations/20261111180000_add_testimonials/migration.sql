-- CreateTable
CREATE TABLE "testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "place" TEXT,
    "quoteId" TEXT NOT NULL,
    "quoteEn" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "testimonial_published_position_idx" ON "testimonial"("published", "position");


-- Seed: the testimonials previously hard-coded on the landing page.
INSERT INTO "testimonial" ("id", "name", "place", "quoteId", "quoteEn", "published", "position", "updatedAt") VALUES
  ('0d98ab23-f47a-4171-83db-2fe7ecb01a6e', 'Amelia Hart', 'Paris', 'Parfum Velure benar-benar luar biasa! Wanginya tahan seharian dan saya selalu mendapat pujian.', 'Velure perfumes are simply exceptional! The fragrance lasts all day and I always receive compliments.', true, 0, CURRENT_TIMESTAMP),
  ('e92f4bf6-1bb1-4e4f-9001-19383e1b7421', 'Julian Moreau', 'Lyon', 'Noir Intense kini menjadi satu-satunya parfum yang saya pakai. Elegan, tidak berlebihan, dan tetap tercium hingga malam.', 'Noir Intense has become the only scent I wear. It feels tailored, never loud, and it stays close until evening.', true, 1, CURRENT_TIMESTAMP),
  ('76c1156e-8c4e-493a-9950-9706ac3f3975', 'Sofia Lang', 'New York', 'Azure Mist adalah parfum paling segar yang pernah saya temukan. Saya langsung memesan botol kedua di minggu yang sama.', 'Azure Mist is the cleanest fragrance I have found. I ordered a second bottle the same week.', true, 2, CURRENT_TIMESTAMP);
