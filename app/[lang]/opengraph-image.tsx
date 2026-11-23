import { ImageResponse } from "next/og";
import { getLandingContent } from "@/config/landing-content";
import { defaultLocale, hasLocale } from "@/lib/i18n";

export const alt = "Velure — The Midnight Collection";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const c = getLandingContent(hasLocale(lang) ? lang : defaultLocale);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 22% 18%, #1c2a5a 0%, #070b18 45%, #04060c 100%)",
          color: "#f4efe4",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 22, color: "#c4a574", display: "flex" }}>VELURE</div>
        <div style={{ width: 120, height: 1, background: "#c4a574", margin: "34px 0", display: "flex" }} />
        <div style={{ fontSize: 92, display: "flex" }}>{c.brand.collection}</div>
        <div style={{ fontSize: 32, marginTop: 28, color: "#d7c4a4", fontStyle: "italic", display: "flex" }}>
          {c.hero.sub}
        </div>
      </div>
    ),
    size,
  );
}
