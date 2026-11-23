"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { film, type Quality } from "@/lib/landing/film";
import {
  CLIPS,
  CLIP_ORDER,
  CRAFT_FILM,
  FOOTAGE_SHARPEN,
  HERO_FILM,
  footage,
  frameBitmap,
  frameImage,
  loadFootage,
  needFootage,
  nearestFrame,
  prepareFrames,
  releaseFrames,
  type ClipId,
} from "@/lib/landing/footage";
import { sideFor, smoothstep } from "@/lib/landing/math";
import { ease, hero } from "@/components/landing/three/live";

/** Behind everything in the scene, in front of the 3D night sky (which it covers). */
const DISTANCE = 60;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    // Frames are uploaded unflipped (flipY = false, the fast path), so flip here instead.
    vUv = vec2(uv.x, 1.0 - uv.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uA;
  uniform sampler2D uB;
  uniform float uMix;
  uniform float uOpacity;
  uniform vec2 uTexel;
  uniform vec2 uFeather;
  uniform float uSharpen;
  uniform vec2 uTrim;
  varying vec2 vUv;

  vec3 frameAt(vec2 uv) {
    return mix(texture2D(uA, uv).rgb, texture2D(uB, uv).rgb, uMix);
  }

  void main() {
    vec2 uv = vec2(mix(uTrim.x, 1.0 - uTrim.y, vUv.x), vUv.y);
    vec3 c = frameAt(uv);

    // Contrast-adaptive sharpening: restores edges lost when the picture is scaled up to the
    // screen, and backs off where contrast is already high (no halos).
    vec3 n = frameAt(uv + vec2(0.0, uTexel.y));
    vec3 s = frameAt(uv - vec2(0.0, uTexel.y));
    vec3 e = frameAt(uv + vec2(uTexel.x, 0.0));
    vec3 w = frameAt(uv - vec2(uTexel.x, 0.0));
    vec3 lo = min(c, min(min(n, s), min(e, w)));
    vec3 hi = max(c, max(max(n, s), max(e, w)));
    vec3 amount = sqrt(clamp(min(lo, 1.0 - hi) / max(hi, vec3(0.001)), 0.0, 1.0));
    vec3 weight = -amount * uSharpen;
    vec3 frame = clamp((c + (n + s + e + w) * weight) / (1.0 + 4.0 * weight), 0.0, 1.0);

    // Soft edges where the picture does not fill the screen (symmetric, so the flip is moot).
    vec2 edge = min(vUv, 1.0 - vUv);
    float mask = smoothstep(0.0, max(uFeather.x, 0.0001), edge.x) * smoothstep(0.0, max(uFeather.y, 0.0001), edge.y);

    gl_FragColor = vec4(frame * 1.1, uOpacity * mask);
    #include <colorspace_fragment>
  }
`;

function frameTexture() {
  const texture = new THREE.Texture();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  // Uploading with flipY makes the browser flip every 1080p frame on the CPU first.
  texture.flipY = false;
  return texture;
}

/**
 * Frame uploads allowed per rendered frame, across all clips. A 1080p upload is the most
 * expensive thing the page does; spreading them keeps scrolling smooth. When the budget is
 * spent, a clip shows the frame it already holds for one more frame.
 */
const UPLOADS_PER_FRAME = 1;
let uploadsLeft = UPLOADS_PER_FRAME;

/** One clip's surface: its material plus the two textures holding the frames being blended. */
class FilmSurface {
  private slots = [
    { texture: frameTexture(), index: -1 },
    { texture: frameTexture(), index: -1 },
  ];
  /** Smoothed frame position. */
  position = 0;
  /** Direction of travel, for decoding frames ahead. */
  direction: 1 | -1 = 1;
  readonly material: THREE.ShaderMaterial;

  constructor(readonly clip: ClipId) {
    const [width, height] = CLIPS[clip].size[footage.set];
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uA: { value: this.slots[0].texture },
        uB: { value: this.slots[1].texture },
        uMix: { value: 0 },
        uOpacity: { value: 0 },
        uTexel: { value: new THREE.Vector2(1 / width, 1 / height) },
        uFeather: { value: new THREE.Vector2(0, 0) },
        uSharpen: { value: FOOTAGE_SHARPEN },
        uTrim: { value: new THREE.Vector2(...(CLIPS[clip].trim ?? [0, 0])) },
      },
    });
  }

  /**
   * Eases toward frame `goal` and shows it (two neighbouring frames, blended), uploading only
   * what is not already held. Returns false while nothing of the clip has loaded.
   */
  show(goal: number, dt: number, opacity: number, featherX: number, featherY: number) {
    const last = CLIPS[this.clip].count - 1;
    const target = Math.min(last, Math.max(0, goal));
    if (Math.abs(target - this.position) > 0.05) this.direction = target > this.position ? 1 : -1;
    this.position += (target - this.position) * ease(9, dt);
    prepareFrames(this.clip, this.position, this.direction);

    let lower = nearestFrame(this.clip, Math.floor(this.position));
    if (lower < 0) return false;
    let upper = Math.max(lower, nearestFrame(this.clip, Math.min(last, lower + 1)));
    const held = (index: number) => this.slots.some((slot) => slot.index === index);
    const empty = this.slots.every((slot) => slot.index < 0);
    const nearestHeld = (index: number) =>
      this.slots
        .filter((slot) => slot.index >= 0)
        .sort((a, b) => Math.abs(a.index - index) - Math.abs(b.index - index))[0]?.index ?? -1;
    const upload = (index: number, keep: number) => {
      const free = this.slots.find((slot) => slot.index !== keep) ?? this.slots[0];
      free.texture.image = frameBitmap(this.clip, index) ?? frameImage(this.clip, index);
      free.texture.needsUpdate = true;
      free.index = index;
      uploadsLeft -= 1;
    };
    // Upload a frame when it is decoded and the budget allows. Otherwise stay on the nearest
    // frame already on the GPU for a moment, unless that is far off (a jump), in which case
    // upload the undecoded frame anyway.
    const ready = (index: number) => frameBitmap(this.clip, index) !== undefined;
    if (!held(lower)) {
      const fallback = nearestHeld(lower);
      const close = fallback >= 0 && Math.abs(fallback - lower) <= 4;
      if (empty || (uploadsLeft > 0 && (ready(lower) || !close))) upload(lower, upper);
      else lower = upper = fallback;
    }
    if (!held(upper)) {
      if (uploadsLeft > 0 && ready(upper)) upload(upper, lower);
      else upper = lower;
    }
    const uniforms = this.material.uniforms;
    uniforms.uA.value = this.slots.find((slot) => slot.index === lower)!.texture;
    uniforms.uB.value = this.slots.find((slot) => slot.index === upper)!.texture;
    const mix = upper > lower ? Math.min(1, Math.max(0, (this.position - lower) / (upper - lower))) : 0;
    // Blend only neighbouring frames. While the frames in between are still loading, blending
    // two distant ones would ghost, so show the nearer one instead.
    uniforms.uMix.value = upper - lower > 2 ? Math.round(mix) : mix;
    uniforms.uOpacity.value = opacity;
    uniforms.uFeather.value.set(featherX, featherY);
    return true;
  }

  dispose() {
    this.slots.forEach((slot) => slot.texture.dispose());
    this.material.dispose();
  }
}

const unit = (from: number, to: number, value: number) => Math.min(1, Math.max(0, (value - from) / (to - from)));
const right = new THREE.Vector3();
const up = new THREE.Vector3();
const forward = new THREE.Vector3();

type Shot = {
  /** 0 = hidden. */
  opacity: number;
  /** Frame to show. */
  frame: number;
  /** Plane height as a fraction of the screen height, before the narrow-screen rule. */
  height: number;
  /** Where the clip's focus point sits on screen, -1..1. */
  x: number;
  y: number;
  /** Fill the screen (never show past the picture's edge) or float with soft edges. */
  cover: boolean;
  feather: [number, number];
  /** Overrides the clip's narrow-screen rule for this moment. */
  minVisibleX?: number;
  /** Where a banded picture sits vertically, -1..1 (0 = centred). */
  bandY?: number;
};

/**
 * The footage layer: five scroll-scrubbed clips. The hero plays `moon` and cross-fades into
 * `bottle`, which carries on behind the story; the craft chapter plays `drops`, `fill` and
 * `seven`, and the shop then rises over the last shot. Timings live in lib/landing/footage.ts.
 */
export function Footage({ quality }: { quality: Quality }) {
  const meshes = useRef<Partial<Record<ClipId, THREE.Mesh | null>>>({});
  const surfaces = useRef<Partial<Record<ClipId, FilmSurface>>>({});

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    // Phones get the 720p set: about half the download, and the difference is hard to see at
    // that size. Weak devices and data-saver mode get it everywhere.
    const phone = window.matchMedia("(max-width: 767px)").matches;
    loadFootage(quality === 0 || phone || connection?.saveData ? "sd" : "hd", quality === 0 ? 2 : 1);
    const created = CLIP_ORDER.map((clip) => new FilmSurface(clip));
    const held = surfaces.current;
    const planes = meshes.current;
    created.forEach((surface) => {
      held[surface.clip] = surface;
      const mesh = planes[surface.clip];
      if (mesh) mesh.material = surface.material;
    });
    return () => {
      created.forEach((surface) => {
        delete held[surface.clip];
        surface.dispose();
      });
    };
    // Loading starts once; a later quality change does not restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const time = state.clock.elapsedTime;
    const camera = state.camera as THREE.PerspectiveCamera;
    const T = film.T;
    const failed = footage.failed;

    // ── What each clip should be doing at this point of the film ──
    const heroOut = 1 - smoothstep(HERO_FILM.out[0], HERO_FILM.out[1], T);
    const bottleIn = smoothstep(HERO_FILM.bottleIn[0], HERO_FILM.bottleIn[1], T);
    const intro = 1 + (1 - film.intro) * 0.09;

    const moonLast = CLIPS.moon.count - 1;
    const moonAt = unit(0, HERO_FILM.moonEnd, T) * moonLast;
    // Once the camera has settled on the water, the mist keeps breathing by itself.
    const moonSettled = smoothstep(72, 86, moonAt);
    const moon: Shot = {
      opacity: heroOut * (1 - smoothstep(HERO_FILM.bottleIn[1], HERO_FILM.bottleIn[1] + 0.05, T)),
      frame: Math.min(moonAt, moonLast - 6 * moonSettled) + Math.sin(time * 0.55) * 6 * moonSettled,
      height: 1.035 * intro,
      x: 0,
      y: 0,
      cover: true,
      feather: [0, 0],
    };

    const bottleLast = CLIPS.bottle.count - 1;
    const [riseFrom, riseTo, storyEnd] = HERO_FILM.bottleKeys;
    const bottleAt =
      (unit(riseFrom[0], riseTo[0], T) * riseTo[1] + unit(riseTo[0], storyEnd[0], T) * (storyEnd[1] - riseTo[1])) * bottleLast;
    const bottleSettled = smoothstep(bottleLast - 16, bottleLast - 2, bottleAt);
    const bottle: Shot = {
      opacity: heroOut * bottleIn,
      frame: Math.min(bottleAt, bottleLast - 4 * bottleSettled) + Math.sin(time * 0.5) * 4 * bottleSettled,
      // A slow push-in as the bottle rises.
      height: 1.02 + (1 - bottleIn) * 0.05,
      x: 0,
      y: 0,
      // On a phone the copy sits beneath the bottle.
      bandY: 0.55,
      cover: true,
      feather: [0, 0.12],
    };

    // Craft: the two essences float beside the copy…
    const q = T - 2;
    const side = sideFor(camera.aspect);
    // The shop rises over the last shot, which dims and settles back a touch beneath it.
    const handoff = smoothstep(CRAFT_FILM.handoff[0], CRAFT_FILM.handoff[1], T);
    const drops: Shot = {
      opacity: smoothstep(CRAFT_FILM.drops.in[0], CRAFT_FILM.drops.in[1], q) * (1 - smoothstep(CRAFT_FILM.drops.out[0], CRAFT_FILM.drops.out[1], q)),
      frame: unit(CRAFT_FILM.drops.frames[0], CRAFT_FILM.drops.frames[1], q) * (CLIPS.drops.count - 1),
      height: 0.82,
      // Beside the copy on wide screens, above it on a phone.
      x: 0.3 * side,
      y: 0.12 + 0.2 * (1 - side),
      cover: false,
      feather: [0.14, 0.16],
    };

    // …then the clear drops, the pour and the seal fill the screen, nudged aside on wide
    // screens so the bottle stands clear of the copy.
    const fillSpec = CRAFT_FILM.fill;
    const fill: Shot = {
      opacity: smoothstep(fillSpec.in[0], fillSpec.in[1], q) * (1 - smoothstep(fillSpec.out[0], fillSpec.out[1], q)),
      frame:
        (unit(fillSpec.dropFrames[0], fillSpec.dropFrames[1], q) * fillSpec.split +
          unit(fillSpec.pourFrames[0], fillSpec.pourFrames[1], q) * (1 - fillSpec.split)) *
        (CLIPS.fill.count - 1),
      height: 1.02 + 0.12 * side,
      x: 0.2 * side,
      y: 0,
      bandY: 0.2,
      cover: true,
      feather: [0, 0.12],
    };

    // Finale: seven bottles, then the camera settles on one. On a phone the picture starts
    // as a wide band showing all seven and tightens as the camera moves in.
    const sevenLast = CLIPS.seven.count - 1;
    const sevenAt = unit(CRAFT_FILM.seven.frames[0], CRAFT_FILM.seven.frames[1], q);
    const sevenSettled = smoothstep(0.85, 1, sevenAt);
    const seven: Shot = {
      opacity: smoothstep(CRAFT_FILM.seven.in[0], CRAFT_FILM.seven.in[1], q) * (1 - 0.55 * handoff),
      frame: Math.min(sevenAt * sevenLast, sevenLast - 3 * sevenSettled) + Math.sin(time * 0.5) * 3 * sevenSettled,
      height: 1.02 - 0.035 * handoff,
      x: 0,
      y: 0,
      bandY: 0.08,
      cover: true,
      feather: [0, 0.14],
      minVisibleX: 0.96 + (CLIPS.seven.minVisibleX - 0.96) * smoothstep(0.15, 0.8, sevenAt),
    };

    const shots: Record<ClipId, Shot> = { moon, bottle, drops, fill, seven };
    hero.cover = failed ? 0 : Math.max(moon.opacity, bottle.opacity, fill.opacity, seven.opacity);
    hero.fade = failed ? 0 : Math.max(hero.cover, drops.opacity);
    needFootage(T);
    uploadsLeft = UPLOADS_PER_FRAME;
    footage.wanted =
      q > CRAFT_FILM.seven.in[0] - 0.12
        ? "seven"
        : q > CRAFT_FILM.fill.in[0] - 0.12
          ? "fill"
          : q > -0.6
            ? "drops"
            : T > HERO_FILM.bottleIn[0] - 0.12
              ? "bottle"
              : "moon";

    // ── Place and draw them ──
    const screenH = 2 * DISTANCE * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const screenW = screenH * camera.aspect;
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    up.setFromMatrixColumn(camera.matrixWorld, 1);
    camera.getWorldDirection(forward);

    for (const clip of CLIP_ORDER) {
      const mesh = meshes.current[clip];
      const surface = surfaces.current[clip];
      if (!mesh || !surface) continue;
      const shot = shots[clip];
      if (failed || shot.opacity <= 0.002) {
        mesh.visible = false;
        // Free decoded frames of clips that are off screen (and not about to appear).
        if (clip !== footage.wanted) releaseFrames(clip);
        continue;
      }
      const spec = CLIPS[clip];
      const [pixelsW, pixelsH] = spec.size[footage.set];
      const [trimLeft, trimRight] = spec.trim ?? [0, 0];
      const aspect = (pixelsW * (1 - trimLeft - trimRight)) / pixelsH;

      // Like `object-fit: cover`, except a narrow screen may not crop tighter than
      // `minVisibleX`; the picture then becomes a band with feathered edges.
      let height = shot.cover ? Math.max(screenH, screenW / aspect) * shot.height : screenH * shot.height;
      const widest = screenW / Math.max(0.0001, shot.minVisibleX ?? spec.minVisibleX);
      const banded = height * aspect > widest;
      if (banded) height = widest / aspect;
      const width = height * aspect;

      // Keep the focus point at its anchor, without ever showing past the picture's edge.
      let x = (shot.x * screenW) / 2 - (spec.focus[0] - 0.5) * width;
      let y = (shot.y * screenH) / 2 + (spec.focus[1] - 0.5) * height;
      if (shot.cover) {
        const slackX = Math.max(0, (width - screenW) / 2);
        const slackY = Math.max(0, (height - screenH) / 2);
        x = Math.min(slackX, Math.max(-slackX, x + film.pointerX * screenW * 0.004));
        y = height >= screenH ? Math.min(slackY, Math.max(-slackY, y + film.pointerY * screenH * 0.004)) : ((shot.bandY ?? 0) * (screenH - height)) / 2;
      } else if (height < screenH) {
        // A floating picture stays inside the screen vertically.
        const room = (screenH - height) / 2;
        y = Math.min(room - screenH * 0.14 * (1 - side), Math.max(-room, y));
      }

      const floating = !shot.cover || banded;
      const drawn = surface.show(
        shot.frame,
        dt,
        shot.opacity,
        floating && (!shot.cover || width < screenW) ? shot.feather[0] : 0,
        floating ? shot.feather[1] : 0,
      );
      mesh.visible = drawn;
      if (!drawn) continue;
      mesh.position.copy(camera.position).addScaledVector(forward, DISTANCE).addScaledVector(right, x).addScaledVector(up, y);
      mesh.quaternion.copy(camera.quaternion);
      mesh.scale.set(width, height, 1);
    }
  });

  return (
    <>
      {CLIP_ORDER.map((clip, index) => (
        <mesh
          key={clip}
          ref={(mesh) => {
            meshes.current[clip] = mesh;
          }}
          visible={false}
          frustumCulled={false}
          renderOrder={-20 + index}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </>
  );
}
