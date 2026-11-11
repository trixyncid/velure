import { genderCategory, type Category, type Product } from "@/lib/content";
import { isGenderValue, salePrice } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { isMediaKey, publicObjectUrl, spacesStatus } from "@/lib/spaces";

function imageUrl(key: string) {
  if (!spacesStatus().configured || !isMediaKey(key)) return null;
  try {
    return publicObjectUrl(key);
  } catch {
    return null;
  }
}

/**
 * Perfumes for the storefront: best sellers first, then newest.
 * Falls back to an empty catalog if the database is unreachable so the shop still renders.
 */
export async function getStoreCatalog(): Promise<Product[]> {
  try {
    const perfumes = await prisma.perfume.findMany({
      orderBy: [{ bestSeller: "desc" }, { createdAt: "desc" }],
      include: {
        images: { orderBy: { createdAt: "asc" } },
        reviews: { select: { rating: true } },
      },
    });

    return perfumes.map((perfume) => {
      const discount = perfume.price && perfume.discount ? perfume.discount : 0;
      const ratings = perfume.reviews.map((review) => review.rating);
      return {
        id: perfume.id,
        name: perfume.name,
        description: perfume.description ?? "",
        categories: perfume.gender
          .filter(isGenderValue)
          .map((gender) => genderCategory[gender] as Category),
        price: perfume.price ? salePrice(perfume.price, discount) : null,
        compareAt: discount > 0 ? perfume.price : null,
        discount,
        bestSeller: perfume.bestSeller ?? false,
        images: perfume.images
          .map((image) => imageUrl(image.fileKey))
          .filter((url): url is string => url !== null),
        rating: ratings.length
          ? Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10
          : null,
        reviews: ratings.length,
      };
    });
  } catch (error) {
    console.error("Could not load the storefront catalog", error);
    return [];
  }
}
