"use client";

import { useEffect, useMemo, useRef } from "react";
import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Quality } from "@/lib/landing/film";
import { hero, softTexture } from "@/components/landing/three/live";

const MIST = [
  { x: -2.5, y: -1.9, z: 2.2, w: 12, h: 3.6, speed: 0.05, phase: 0 },
  { x: 2, y: -2.2, z: 0.6, w: 14, h: 4.2, speed: 0.035, phase: 1.7 },
  { x: -1, y: -1.7, z: -2.5, w: 16, h: 4.4, speed: 0.045, phase: 3.1 },
  { x: 3, y: -1.2, z: -5.5, w: 20, h: 5, speed: 0.03, phase: 4.4 },
  { x: -4, y: 0.4, z: -9, w: 26, h: 7, speed: 0.02, phase: 5.2 },
];

/** Opacity of the moon's core and its two layers of glow. */
const MOON_OPACITY = [1, 0.5, 0.16];


/** Stars, a soft moon and low drifting mist. */
export function NightSky({ quality }: { quality: Quality }) {
  const sprite = useMemo(() => softTexture(128), []);
  const mist = useRef<(THREE.Mesh | null)[]>([]);
  const root = useRef<THREE.Group>(null);
  const moon = useRef<THREE.Group>(null);

  useEffect(() => () => sprite.dispose(), [sprite]);

  useFrame((state) => {
    // Full-screen footage has its own sky; this one shows around the floating craft clip.
    if (root.current) root.current.visible = hero.cover < 0.995;
    // The moon steps back while footage is on screen (it would shine through its soft edges).
    moon.current?.children.forEach((child, index) => {
      const lit = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      lit.opacity = MOON_OPACITY[index] * Math.pow(1 - hero.fade, 8);
    });
    const time = state.clock.elapsedTime;
    mist.current.forEach((mesh, index) => {
      if (!mesh) return;
      const layer = MIST[index];
      mesh.position.x = layer.x + Math.sin(time * layer.speed + layer.phase) * 1.6;
    });
  });

  return (
    <group ref={root} renderOrder={-30}>
      <Stars radius={70} depth={40} count={quality === 0 ? 900 : quality === 1 ? 1600 : 2800} factor={3.2} saturation={0} fade speed={0.5} />

      {/* Moon: a bright core with two layers of glow. */}
      <group ref={moon} position={[2.6, 7.7, -24]} renderOrder={-30}>
        <mesh>
          <circleGeometry args={[1.15, 48]} />
          <meshBasicMaterial color="#e9efff" transparent depthWrite={false} fog={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[11, 11]} />
          <meshBasicMaterial map={sprite} color="#9db4ff" transparent opacity={0.5} depthWrite={false} fog={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh position={[0, 0, -0.2]}>
          <planeGeometry args={[30, 30]} />
          <meshBasicMaterial map={sprite} color="#5f7de0" transparent opacity={0.16} depthWrite={false} fog={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {MIST.slice(0, quality === 0 ? 3 : MIST.length).map((layer, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            mist.current[index] = mesh;
          }}
          position={[layer.x, layer.y, layer.z]}
          renderOrder={-1}
        >
          <planeGeometry args={[layer.w, layer.h]} />
          {index === 0 ? (
            <meshBasicMaterial map={sprite} color="#5a6690" transparent opacity={0.2} depthWrite={false} fog={false} />
          ) : (
            <meshBasicMaterial map={sprite} color="#2a3560" transparent opacity={0.22} depthWrite={false} fog={false} />
          )}
        </mesh>
      ))}
    </group>
  );
}
