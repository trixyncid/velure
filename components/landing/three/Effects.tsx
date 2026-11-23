"use client";

import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type { Quality } from "@/lib/landing/film";

/** A light finish over the footage: bloom on its highlights and a vignette. Off on weak devices. */
export function Effects({ quality }: { quality: Quality }) {
  if (quality === 0) return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={quality === 2 ? 0.6 : 0.5} luminanceThreshold={0.74} luminanceSmoothing={0.2} />
      <Vignette offset={0.22} darkness={0.72} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
