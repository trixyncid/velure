-- Scent finder, simplified: instead of questions with answers, keywords and weights, a plain
-- list of scents. Each perfume is ticked with the scents it has; visitors pick the scents they
-- like, and the perfume sharing the most of them is recommended.

-- DropForeignKey
ALTER TABLE "_PerfumeScentOptions" DROP CONSTRAINT "_PerfumeScentOptions_A_fkey";

-- DropForeignKey
ALTER TABLE "_PerfumeScentOptions" DROP CONSTRAINT "_PerfumeScentOptions_B_fkey";

-- DropForeignKey
ALTER TABLE "scent_option" DROP CONSTRAINT "scent_option_questionId_fkey";

-- DropTable
DROP TABLE "_PerfumeScentOptions";

-- DropTable
DROP TABLE "scent_option";

-- DropTable
DROP TABLE "scent_question";

-- CreateTable
CREATE TABLE "scent" (
    "id" TEXT NOT NULL,
    "nameId" TEXT NOT NULL,
    "nameEn" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PerfumeScents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PerfumeScents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "scent_position_idx" ON "scent"("position");

-- CreateIndex
CREATE INDEX "_PerfumeScents_B_index" ON "_PerfumeScents"("B");

-- AddForeignKey
ALTER TABLE "_PerfumeScents" ADD CONSTRAINT "_PerfumeScents_A_fkey" FOREIGN KEY ("A") REFERENCES "perfume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PerfumeScents" ADD CONSTRAINT "_PerfumeScents_B_fkey" FOREIGN KEY ("B") REFERENCES "scent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A starter list. Edit, reorder, add or delete them in the admin (Scents).
INSERT INTO "scent" ("id", "nameId", "nameEn", "position", "updatedAt") VALUES
  ('fresh', 'Segar', 'Fresh', 0, CURRENT_TIMESTAMP),
  ('citrus', 'Citrus', 'Citrus', 1, CURRENT_TIMESTAMP),
  ('fruity', 'Buah-buahan', 'Fruity', 2, CURRENT_TIMESTAMP),
  ('floral', 'Bunga', 'Floral', 3, CURRENT_TIMESTAMP),
  ('rose', 'Mawar', 'Rose', 4, CURRENT_TIMESTAMP),
  ('lavender', 'Lavender', 'Lavender', 5, CURRENT_TIMESTAMP),
  ('sweet', 'Manis', 'Sweet', 6, CURRENT_TIMESTAMP),
  ('vanilla', 'Vanilla', 'Vanilla', 7, CURRENT_TIMESTAMP),
  ('coffee', 'Kopi', 'Coffee', 8, CURRENT_TIMESTAMP),
  ('woody', 'Kayu', 'Woody', 9, CURRENT_TIMESTAMP),
  ('spicy', 'Rempah', 'Spicy', 10, CURRENT_TIMESTAMP),
  ('leather', 'Kulit', 'Leather', 11, CURRENT_TIMESTAMP),
  ('amber', 'Amber', 'Amber', 12, CURRENT_TIMESTAMP);
