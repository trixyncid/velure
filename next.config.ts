import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "@prisma/client"],
  async headers() {
    return [
      {
        // Film frames: hundreds of files per visit, never edited in place. Cache them for 30
        // days so returning visitors do not fetch or re-check them. If a clip is re-extracted,
        // write it to a new folder (or file names) so browsers pick up the change.
        source: "/landing/film/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=604800" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.digitaloceanspaces.com",
      },
    ],
  },
};

export default nextConfig;
