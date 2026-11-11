-- AlterTable
ALTER TABLE "perfume" ADD COLUMN     "bestSeller" BOOLEAN DEFAULT false,
ADD COLUMN     "discount" INTEGER,
ADD COLUMN     "price" INTEGER;

-- CreateTable
CREATE TABLE "perfume_review" (
    "id" TEXT NOT NULL,
    "perfumeId" TEXT NOT NULL,
    "review" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfume_review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "perfume_review_perfumeId_idx" ON "perfume_review"("perfumeId");

-- AddForeignKey
ALTER TABLE "perfume_review" ADD CONSTRAINT "perfume_review_perfumeId_fkey" FOREIGN KEY ("perfumeId") REFERENCES "perfume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

