-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNISEX');

-- CreateTable
CREATE TABLE "perfume" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender"[],
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "perfume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfume_image" (
    "id" TEXT NOT NULL,
    "perfumeId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileSize" DOUBLE PRECISION NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfume_image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "perfume_createdById_idx" ON "perfume"("createdById");

-- CreateIndex
CREATE INDEX "perfume_image_perfumeId_idx" ON "perfume_image"("perfumeId");

-- AddForeignKey
ALTER TABLE "perfume" ADD CONSTRAINT "perfume_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfume" ADD CONSTRAINT "perfume_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfume_image" ADD CONSTRAINT "perfume_image_perfumeId_fkey" FOREIGN KEY ("perfumeId") REFERENCES "perfume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
