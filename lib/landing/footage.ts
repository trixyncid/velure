/**
 * The film's live-action footage, scrubbed by scroll:
 *
 *   moon    the moonlit sky sinks to a misty water surface   (hero, first half)
 *   bottle  a bottle rises out of the mist                   (hero, second half)
 *   drops   two essences drift together and blend            (craft, steps 01 and 02)
 *   fill    clear drops fall in, then the pour and the seal  (craft, step 03 and the pour)
 *   seven   seven bottles, then the camera settles on one    (craft, finale)
 *
 * Each clip is a sequence of stills in /public/landing/film/<clip>/<hd|sd>/000.webp …, so
 * scroll can move through it frame by frame in either direction, which a compressed video
 * cannot do smoothly. Frames load progressively; the nearest loaded frame is shown.
 * "hd" is the clips' native resolution; "sd" is a lighter set for weak devices.
 */

export type ClipId = "moon" | "bottle" | "drops" | "fill" | "seven";
export type FootageSet = "hd" | "sd";

type Clip = {
  count: number;
  size: Record<FootageSet, [width: number, height: number]>;
  /** The point of the picture (0..1 from the left/top) that is kept at the anchor on screen. */
  focus: [x: number, y: number];
  /** On narrow screens, never crop tighter than this fraction of the picture's width. */
  minVisibleX: number;
  /** Fraction trimmed off the left and right edges (the bottle clip has a dark bar on the left). */
  trim?: [left: number, right: number];
};

export const CLIPS: Record<ClipId, Clip> = {
  moon: { count: 130, size: { hd: [1920, 1080], sd: [1280, 720] }, focus: [0.457, 0.5], minVisibleX: 0 },
  bottle: { count: 94, size: { hd: [1920, 1080], sd: [1280, 720] }, focus: [0.43, 0.5], minVisibleX: 0.36, trim: [0.035, 0] },
  drops: { count: 122, size: { hd: [1792, 1008], sd: [1194, 672] }, focus: [0.5, 0.5], minVisibleX: 0.6 },
  fill: { count: 94, size: { hd: [1888, 1062], sd: [1258, 708] }, focus: [0.485, 0.5], minVisibleX: 0.5 },
  seven: { count: 94, size: { hd: [1920, 1080], sd: [1280, 720] }, focus: [0.5, 0.5], minVisibleX: 0.42 },
};

/** Also the drawing order, back to front. */
export const CLIP_ORDER: ClipId[] = ["moon", "bottle", "drops", "fill", "seven"];

/** Edge sharpening applied on screen, 0 (off) to 0.2 (strongest). */
export const FOOTAGE_SHARPEN = 0.14;

/** Hero timing, in hero scroll progress (0..1). */
export const HERO_FILM = {
  /** The moon clip plays from 0 to here. */
  moonEnd: 0.42,
  /** The bottle clip cross-fades in over `bottleIn`. */
  bottleIn: [0.4, 0.48],
  /**
   * How far through the bottle clip the film is at each point of film time. It rises
   * through the rest of the hero, then keeps playing, slower, behind the whole story
   * (film time 1 → 2), so there is never a stretch of scroll without footage.
   */
  bottleKeys: [
    [0.4, 0],
    [0.87, 0.55],
    [1.95, 1],
  ],
  /** It cross-fades straight into the craft chapter's first clip (film time). */
  out: [1.9, 2.04],
} as const;

/** Hero scroll progress (0..1) at which each beat of copy enters and leaves. */
export const HERO_BEATS = {
  title: { out: [0.06, 0.14] },
  tagline: { in: [0.19, 0.25], out: [0.33, 0.4] },
  // Clears quickly as the hero unpins, while the story follows it in over the same shot.
  reveal: { in: [0.72, 0.79], out: [0.895, 0.935] },
} as const;

/**
 * Craft chapter, in craft scroll progress (0..1). The chapter is pinned from about 0.06 to
 * 0.94. `CRAFT_STEPS` are the points where the caption changes:
 *
 *   01 two essences · 02 the blend · 03 the final touch · the pour and seal · the seven ·
 *   the question · (the chapter unpins and its copy clears)
 */
export const CRAFT_STEPS = [0.06, 0.24, 0.42, 0.56, 0.76, 0.87, 0.94] as const;

export const CRAFT_FILM = {
  drops: { in: [-0.08, 0.03], frames: [0.05, 0.415], out: [0.42, 0.46] },
  fill: {
    in: [0.4, 0.45],
    /** Step 03: the clear drops. This part of the clip ends at `split` of its length. */
    dropFrames: [0.425, 0.56],
    split: 0.29,
    /** The pour, then the seal. */
    pourFrames: [0.56, 0.75],
    out: [0.765, 0.805],
  },
  seven: { in: [0.75, 0.8], frames: [0.775, 0.95] },
  /**
   * The shop rises over the final shot (film time; the craft chapter unpins at about 2.94
   * and the shop reaches mid-screen at 3).
   */
  handoff: [2.94, 3.05],
} as const;

/** Still used when the film cannot play (no WebGL, reduced motion). See landing.css. */
export const HERO_POSTER = "/landing/film/moon/sd/044.webp";

export const frameSrc = (clip: ClipId, set: FootageSet, index: number) =>
  `/landing/film/${clip}/${set}/${String(index).padStart(3, "0")}.webp`;

/**
 * Film-time window in which each clip's frames are fetched: from about two screens of
 * scroll before the clip appears until it is gone. Clips outside the window are not
 * downloaded at all, so a visitor who never scrolls (or lands on a deep link in the shop)
 * never pays for them. Once a clip has started, it finishes loading.
 */
export const CLIP_FETCH: Record<ClipId, [from: number, to: number]> = {
  moon: [-1, 0.62],
  bottle: [0.12, 2.06],
  drops: [1.3, 2.5],
  fill: [2.15, 2.85],
  seven: [2.45, 3.12],
};

const images: Record<ClipId, (HTMLImageElement | undefined)[]> = { moon: [], bottle: [], drops: [], fill: [], seven: [] };
const queues: Record<ClipId, number[]> = { moon: [], bottle: [], drops: [], fill: [], seven: [] };
/** Clips whose frames may be fetched (see CLIP_FETCH). */
const enabled = new Set<ClipId>();

export const footage = {
  set: "hd" as FootageSet,
  /** The opening frame is in (or failed), so the preloader may lift. */
  ready: false,
  failed: false,
  started: false,
  /** The clip scroll is currently in; its frames are fetched first. */
  wanted: "moon" as ClipId,
};

/** Stride of the first, coarse loading pass. */
const COARSE = 8;
/** Frames fetched at once. */
const LANES = 4;
let lanes = 0;

function take(): [ClipId, number] | null {
  // First a coarse pass over each enabled clip (the one in view first), then the rest.
  const order = [footage.wanted, ...CLIP_ORDER].filter((clip) => enabled.has(clip));
  for (const clip of order) {
    const coarse = Math.ceil(CLIPS[clip].count / COARSE) + 1;
    if (CLIPS[clip].count - queues[clip].length < coarse && queues[clip].length > 0) {
      return [clip, queues[clip].shift()!];
    }
  }
  for (const clip of order) {
    const index = queues[clip].shift();
    if (index !== undefined) return [clip, index];
  }
  return null;
}

function fetchFrame(clip: ClipId, index: number, onSettled: () => void) {
  const opening = clip === "moon" && index === 0;
  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    const done = () => {
      images[clip][index] = image;
      if (opening) footage.ready = true;
      onSettled();
    };
    // Decode off the main thread first so scrubbing never waits on it.
    if (image.decode) image.decode().then(done, done);
    else done();
  };
  image.onerror = () => {
    if (opening) {
      footage.failed = true;
      footage.ready = true;
    }
    onSettled();
  };
  image.src = frameSrc(clip, footage.set, index);
}

/** Keeps up to LANES frames in flight while enabled clips still have frames to fetch. */
function pump() {
  while (footage.ready && lanes < LANES) {
    const job = take();
    if (!job) return;
    lanes += 1;
    fetchFrame(job[0], job[1], () => {
      lanes -= 1;
      pump();
    });
  }
}

/**
 * Prepares loading and fetches the opening frame only. Everything else is fetched by
 * `needFootage` as scroll approaches it. `step` 2 loads every other frame (weak devices).
 */
export function loadFootage(set: FootageSet, step: 1 | 2) {
  if (footage.started || typeof window === "undefined") return;
  footage.started = true;
  footage.set = set;
  // Coarse to fine within each clip: every 8th frame first, so a clip can be scrubbed within
  // moments of starting, then the frames in between.
  for (const clip of CLIP_ORDER) {
    const last = CLIPS[clip].count - 1;
    const queued = new Set<number>(clip === "moon" ? [0] : []);
    const add = (index: number) => {
      if (queued.has(index)) return;
      queued.add(index);
      queues[clip].push(index);
    };
    add(0);
    add(last);
    for (let stride = 8; stride >= step; stride /= 2) {
      for (let index = 0; index < last; index += stride) add(index);
    }
  }
  fetchFrame("moon", 0, pump);
}

/** Call every frame with the film time: starts fetching the clips whose window it is in. */
export function needFootage(T: number) {
  if (!footage.started) return;
  let changed = false;
  for (const clip of CLIP_ORDER) {
    if (enabled.has(clip)) continue;
    const [from, to] = CLIP_FETCH[clip];
    if (T >= from && T <= to) {
      enabled.add(clip);
      changed = true;
    }
  }
  if (changed) pump();
}

/** Index of the loaded frame nearest to `index`, or -1 if none of the clip has loaded yet. */
export function nearestFrame(clip: ClipId, index: number) {
  const list = images[clip];
  const count = CLIPS[clip].count;
  const wanted = Math.min(count - 1, Math.max(0, index));
  for (let offset = 0; offset < count; offset++) {
    if (list[wanted - offset]) return wanted - offset;
    if (list[wanted + offset]) return wanted + offset;
  }
  return -1;
}

export function frameImage(clip: ClipId, index: number) {
  return images[clip][index];
}

/*
 * Ready-to-upload frames. Uploading an <img> to the GPU makes the browser decode it again on
 * the main thread (about 20 ms for a 1080p frame), which is what made scrolling stutter. So
 * the few frames around the playhead are decoded in the background into ImageBitmaps ahead
 * of time; uploading one of those is close to free. Only a small window is kept per clip:
 * a decoded 1080p frame is about 8 MB.
 */
const bitmaps: Record<ClipId, Map<number, ImageBitmap>> = {
  moon: new Map(),
  bottle: new Map(),
  drops: new Map(),
  fill: new Map(),
  seven: new Map(),
};
const centres: Record<ClipId, number> = { moon: 0, bottle: 0, drops: 0, fill: 0, seven: 0 };
const decoding = new Set<string>();
/** Frames decoded ahead of the playhead, and behind it, in the direction of travel. */
const AHEAD = 6;
const BEHIND = 3;
/** Decoded frames further than this from the playhead are released. */
const KEEP = 10;
const DECODE_LANES = 3;

/** Decodes the frames around `position` (heading in `direction`) for `clip`. Call every frame. */
export function prepareFrames(clip: ClipId, position: number, direction: 1 | -1) {
  if (typeof createImageBitmap !== "function") return;
  const centre = Math.round(position);
  centres[clip] = centre;
  const held = bitmaps[clip];
  for (const [index, bitmap] of held) {
    if (Math.abs(index - centre) > KEEP) {
      bitmap.close();
      held.delete(index);
    }
  }
  const order: number[] = [];
  for (let step = 0; step <= AHEAD; step += 1) order.push(centre + direction * step);
  for (let step = 1; step <= BEHIND; step += 1) order.push(centre - direction * step);
  for (const index of order) {
    if (decoding.size >= DECODE_LANES) return;
    const key = `${clip}:${index}`;
    const image = images[clip][index];
    if (!image || held.has(index) || decoding.has(key)) continue;
    decoding.add(key);
    createImageBitmap(image)
      .then((bitmap) => {
        // The playhead may have moved on while this was decoding.
        if (Math.abs(index - centres[clip]) > KEEP || held.has(index)) bitmap.close();
        else held.set(index, bitmap);
      })
      .catch(() => {})
      .finally(() => decoding.delete(key));
  }
}

/** Frees a clip's decoded frames once it is off screen. */
export function releaseFrames(clip: ClipId) {
  const held = bitmaps[clip];
  if (held.size === 0) return;
  for (const bitmap of held.values()) bitmap.close();
  held.clear();
}

export function frameBitmap(clip: ClipId, index: number) {
  return bitmaps[clip].get(index);
}
