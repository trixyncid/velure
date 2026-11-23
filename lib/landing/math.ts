export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** 0 = portrait phone (picture above the copy), 1 = desktop (picture beside the copy). */
export function sideFor(aspect: number) {
  const side = Math.min(1, Math.max(0, (aspect - 0.85) / (1.45 - 0.85)));
  return Math.round(side * 20) / 20;
}
