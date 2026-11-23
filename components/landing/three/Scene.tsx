"use client";

import { useRef } from "react";
import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useLanding, type Quality } from "@/lib/landing/film";
import { footage } from "@/lib/landing/footage";
import { Effects } from "@/components/landing/three/Effects";
import { Footage } from "@/components/landing/three/Footage";
import { NightSky } from "@/components/landing/three/NightSky";

/** Tells the preloader the opening frame is in and has been drawn. */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    const landing = useLanding.getState();
    if (landing.sceneReady) return;
    const progress = footage.ready ? 100 : 40;
    if (landing.loadProgress !== progress) landing.set({ loadProgress: progress });
    if (frames.current >= 4 && footage.ready) landing.set({ sceneReady: true });
  });
  return null;
}

/**
 * Pixel density of the canvas. The footage is 1080p, so drawing it at 2× on a large screen
 * adds no detail but doubles the work per frame; 1.5× already exceeds the source width.
 */
const DPR: Record<Quality, number | [number, number]> = { 0: 1, 1: [1, 1.25], 2: [1, 1.5] };

/**
 * The canvas behind the film (hero, story, craft). It only draws footage over a night sky;
 * once the shop covers the screen it stops rendering altogether. Loaded client-side only
 * (see components/landing/LandingCanvas.tsx).
 */
export default function Scene() {
  const quality = useLanding((state) => state.quality);
  const paused = useLanding((state) => state.paused || state.covered);

  return (
    <Canvas
      dpr={DPR[quality]}
      frameloop={paused ? "never" : "always"}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 32, near: 0.1, far: 220, position: [0, 0, 8.4] }}
    >
      <color attach="background" args={["#04060c"]} />
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => {
          const state = useLanding.getState();
          if (state.quality > 0) state.set({ quality: (state.quality - 1) as Quality });
        }}
        onIncline={() => {
          const state = useLanding.getState();
          if (state.quality < state.maxQuality) state.set({ quality: (state.quality + 1) as Quality });
        }}
        onFallback={() => useLanding.getState().set({ quality: 0, maxQuality: 0 })}
      />
      <Footage quality={quality} />
      <NightSky quality={quality} />
      <Effects quality={quality} />
      <ReadySignal />
    </Canvas>
  );
}
