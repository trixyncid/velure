-- CreateEnum
CREATE TYPE "ScentFamily" AS ENUM ('FRESH', 'SWEET', 'WARM', 'SPICY');

-- CreateEnum
CREATE TYPE "Occasion" AS ENUM ('DAILY', 'NIGHT');

-- AlterTable
ALTER TABLE "perfume" ADD COLUMN     "scentFamilies" "ScentFamily"[] DEFAULT ARRAY[]::"ScentFamily"[],
ADD COLUMN     "occasions" "Occasion"[] DEFAULT ARRAY[]::"Occasion"[],
ADD COLUMN     "character" TEXT,
ADD COLUMN     "topNotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "middleNotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "baseNotes" TEXT[] DEFAULT ARRAY[]::TEXT[];
