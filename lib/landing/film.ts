import { create } from "zustand";

/**
 * Chapters of the page, in scroll order. Each is one `data-chapter` element. The first three
 * are the film (footage scrubbed by scroll); the shop and the outro are ordinary page.
 */
export const CHAPTERS = ["hero", "story", "craft", "shop", "outro"] as const;
export type Chapter = (typeof CHAPTERS)[number];

/**
 * Per-frame values shared between the scroll director (HTML side) and the WebGL scene.
 * Plain mutable object on purpose: these change every frame and must not re-render React.
 */
export const film = {
  /** Film time: chapter index + progress through that chapter. Drives the footage. */
  T: 0,
  /** Pointer position, -1..1, for parallax. */
  pointerX: 0,
  pointerY: 0,
  /** 0 → 1 once the preloader lifts: the opening shot settles in. */
  intro: 0,
};

export type Quality = 0 | 1 | 2;

type LandingState = {
  /** "static" = no WebGL or reduced motion: stills instead of the film. The shop is the same either way. */
  mode: "pending" | "3d" | "static";
  quality: Quality;
  maxQuality: Quality;
  /** The preloader has lifted. */
  ready: boolean;
  sceneReady: boolean;
  chapter: Chapter;
  /** 0 = lead-in, 1..3 = the three steps, 4 = pour and seal, 5 = the seven, 6 = the closing question, 7 = leaving. */
  craftStep: number;
  /** The perfume whose detail panel is open, if any. */
  detailId: string | null;
  /** The tab is hidden. */
  paused: boolean;
  /** The shop covers the canvas, so there is nothing left to draw. */
  covered: boolean;
  /** Loading progress reported by the scene, 0..100. */
  loadProgress: number;
  set: (patch: Partial<Omit<LandingState, "set">>) => void;
};

export const useLanding = create<LandingState>((set) => ({
  mode: "pending",
  quality: 2,
  maxQuality: 2,
  ready: false,
  sceneReady: false,
  chapter: "hero",
  craftStep: 0,
  detailId: null,
  paused: false,
  covered: false,
  loadProgress: 0,
  set: (patch) => set(patch),
}));
