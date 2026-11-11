import { Gender } from "@/generated/prisma/enums";
import {
  type Fragrance,
  type GenderValue,
  type Photograph,
  isGenderValue,
} from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { isMediaKey, publicObjectUrl, spacesStatus } from "@/lib/spaces";

function photographUrl(key: string) {
  if (!spacesStatus().configured || !isMediaKey(key)) return null;
  try {
    return publicObjectUrl(key);
  } catch {
    return null;
  }
}

function toFragrance(perfume: {
  id: string;
  name: string;
  description: string | null;
  gender: Gender[];
  price: number | null;
  discount: number | null;
  bestSeller: boolean | null;
  updatedAt: Date;
  images: { fileKey: string; fileType: string; fileSize: number; createdAt: Date }[];
}): Fragrance {
  const images: Photograph[] = [...perfume.images]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((image) => ({
      fileKey: image.fileKey,
      fileType: image.fileType,
      fileSize: image.fileSize,
      url: photographUrl(image.fileKey),
    }));

  return {
    id: perfume.id,
    name: perfume.name,
    description: perfume.description ?? "",
    genders: perfume.gender.filter((gender): gender is GenderValue => isGenderValue(gender)),
    price: perfume.price,
    discount: perfume.discount,
    bestSeller: perfume.bestSeller ?? false,
    updatedAt: perfume.updatedAt.toISOString(),
    images,
  };
}

const perfumeInclude = {
  images: { orderBy: { createdAt: "asc" as const } },
};

export async function listFragrances() {
  const perfumes = await prisma.perfume.findMany({
    orderBy: { updatedAt: "desc" },
    include: perfumeInclude,
  });
  return perfumes.map(toFragrance);
}

export async function getFragrance(id: string) {
  const perfume = await prisma.perfume.findUnique({
    where: { id },
    include: perfumeInclude,
  });
  return perfume ? toFragrance(perfume) : null;
}

export async function atelierSnapshot() {
  const [people, fragrances, photographs, unpriced, recent] = await Promise.all([
    prisma.user.count(),
    prisma.perfume.count(),
    prisma.perfumeImage.count(),
    prisma.perfume.count({ where: { price: null } }),
    prisma.perfume.findMany({
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: perfumeInclude,
    }),
  ]);

  return {
    people,
    fragrances,
    photographs,
    unpriced,
    recent: recent.map(toFragrance),
  };
}
