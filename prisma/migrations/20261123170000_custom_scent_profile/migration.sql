-- Scent profile, customisable in the admin: the finder's questions and their options move
-- from fixed enums into tables. Existing tags are carried over before the old columns go.

-- CreateTable
CREATE TABLE "scent_question" (
    "id" TEXT NOT NULL,
    "titleId" TEXT NOT NULL,
    "titleEn" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 2,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scent_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scent_option" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,
    "labelEn" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scent_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PerfumeScentOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PerfumeScentOptions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "scent_question_position_idx" ON "scent_question"("position");

-- CreateIndex
CREATE INDEX "scent_option_questionId_position_idx" ON "scent_option"("questionId", "position");

-- CreateIndex
CREATE INDEX "_PerfumeScentOptions_B_index" ON "_PerfumeScentOptions"("B");

-- AddForeignKey
ALTER TABLE "scent_option" ADD CONSTRAINT "scent_option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "scent_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PerfumeScentOptions" ADD CONSTRAINT "_PerfumeScentOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "perfume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PerfumeScentOptions" ADD CONSTRAINT "_PerfumeScentOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "scent_option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed the two questions the finder asked until now, with their options and fallback keywords.
INSERT INTO "scent_question" ("id", "titleId", "titleEn", "weight", "position", "updatedAt") VALUES
  ('character', 'Karakter seperti apa yang Anda suka?', 'What kind of character do you like?', 2, 0, CURRENT_TIMESTAMP),
  ('occasion', 'Kapan paling sering dipakai?', 'When will you wear it most?', 1, 1, CURRENT_TIMESTAMP);

INSERT INTO "scent_option" ("id", "questionId", "labelId", "labelEn", "keywords", "position", "updatedAt") VALUES
  ('character-fresh', 'character', 'Segar & Citrus', 'Fresh & Citrus',
    ARRAY['fresh','segar','citrus','aromatic','aromatik','bergamot','lemon','jeruk','grapefruit','lavender'], 0, CURRENT_TIMESTAMP),
  ('character-sweet', 'character', 'Manis & Fruity', 'Sweet & Fruity',
    ARRAY['sweet','manis','fruity','buah','gourmand','tropical','tropis','vanilla','vanila','praline','berry'], 1, CURRENT_TIMESTAMP),
  ('character-warm', 'character', 'Hangat & Woody', 'Warm & Woody',
    ARRAY['warm','hangat','woody','kayu','amber','cedar','tonka','oakmoss','musk'], 2, CURRENT_TIMESTAMP),
  ('character-spicy', 'character', 'Spicy & Berani', 'Spicy & Bold',
    ARRAY['spicy','rempah','leather','kulit','leathery','pepper','lada','coffee','kopi','bold','berani'], 3, CURRENT_TIMESTAMP),
  ('occasion-daily', 'occasion', 'Sehari-hari', 'Every day',
    ARRAY['fresh','segar','citrus','aromatic','fruity','soft','floral','tropical','light','ringan'], 0, CURRENT_TIMESTAMP),
  ('occasion-night', 'occasion', 'Malam & Acara Spesial', 'Evenings & Special Occasions',
    ARRAY['warm','hangat','spicy','amber','gourmand','leather','leathery','coffee','kopi','woody','vanilla'], 1, CURRENT_TIMESTAMP);

-- Carry over tags set with the previous fixed lists.
INSERT INTO "_PerfumeScentOptions" ("A", "B")
SELECT p."id", 'character-' || lower(f::text) FROM "perfume" p, unnest(p."scentFamilies") AS f
ON CONFLICT DO NOTHING;

INSERT INTO "_PerfumeScentOptions" ("A", "B")
SELECT p."id", 'occasion-' || lower(o::text) FROM "perfume" p, unnest(p."occasions") AS o
ON CONFLICT DO NOTHING;

-- AlterTable
ALTER TABLE "perfume" DROP COLUMN "occasions",
DROP COLUMN "scentFamilies";

-- DropEnum
DROP TYPE "Occasion";

-- DropEnum
DROP TYPE "ScentFamily";
