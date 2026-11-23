/**
 * The site's public origin, for absolute URLs in metadata and structured data (canonical,
 * language alternates, Open Graph, Product offers). Set NEXT_PUBLIC_SITE_URL in production,
 * e.g. https://velure.id; until then the auth URL is used.
 */
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
);

export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
