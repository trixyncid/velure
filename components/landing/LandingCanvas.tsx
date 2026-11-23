"use client";

import dynamic from "next/dynamic";
import { useLanding } from "@/lib/landing/film";

// three.js and the footage renderer load in their own chunk, in the browser only.
const Scene = dynamic(() => import("@/components/landing/three/Scene"), { ssr: false });

export function LandingCanvas() {
  const mode = useLanding((state) => state.mode);
  const sceneReady = useLanding((state) => state.sceneReady);
  if (mode !== "3d") return null;
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-[1600ms] ${
        sceneReady ? "opacity-100" : "opacity-0"
      }`}
    >
      <Scene />
    </div>
  );
}
