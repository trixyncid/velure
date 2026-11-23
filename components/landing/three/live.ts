import * as THREE from "three";

/**
 * Per-frame scene state shared between the WebGL components. Mutable on purpose:
 * written in useFrame, never rendered by React.
 */

/**
 * Presence of the footage layer (see Footage.tsx). `cover` is how much the full-screen clips
 * hide the night sky; `fade` also counts the floating craft clip.
 */
export const hero = { fade: 1, cover: 1 };

/** Frame-rate independent smoothing factor. */
export const ease = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt);

/** A soft round sprite, used for mist and glows. */
export function softTexture(size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.45)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
