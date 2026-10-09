/**
 * Generated stage imagery (Google Flow — Nano Banana / Veo). No stock, no real
 * dancers. Files live in /public/stage as webp + jpg at several widths.
 */
export type StageAsset = { base: string; widths: number[]; w: number; h: number; alt: string };

const asset = (base: string, widths: number[], alt: string): StageAsset => ({ base, widths, w: 2752, h: 1536, alt });

/** Hero — silhouette grand jeté, back-lit pink/amber haze. */
export const HERO_IMAGE = asset("/stage/hero", [1000, 1600, 2400], "Silhouette of a dancer in a grand jeté under a back-lit stage spotlight");
/** Spotlight page header — silhouette grand jeté, warm gold haze, stage rig visible. */
export const SPOTLIGHT_IMAGE = asset("/stage/spotlight", [1200, 2000], "Silhouette of a dancer leaping across a competition stage");
/** Arabesque balance silhouettes. */
export const ARABESQUE_IMAGE = asset("/stage/arabesque", [1000, 1600], "Silhouette of a dancer balancing in arabesque on stage");
export const ARABESQUE_2_IMAGE = asset("/stage/arabesque-2", [1000, 1600], "Silhouette of a dancer in arabesque under a spotlight");
/** Six-dancer formation under one spotlight — the routine, as a whole. */
export const GROUP_IMAGE = asset("/stage/group", [1000, 1600], "Six dancers in formation on a dark competition stage");
/** Silhouette frames for the Spotlight explainer. Pose measurements stay; face, skin, and costume detail do not. */
export const DEVELOPPE_IMAGE = asset("/stage/developpe", [1200], "Silhouette of a dancer holding a développé on stage");
export const LEAP_IMAGE = asset("/stage/leap", [1200], "Silhouette of a dancer mid-leap on stage");
export const STAGE_1_IMAGE = asset("/stage/stage-1", [1600], "A dancer alone on a dark stage under one spotlight");
export const STAGE_2_IMAGE = asset("/stage/stage-2", [1600], "A dancer under a spotlight, haze in the air");

export function srcSet(a: StageAsset, ext: "webp" | "jpg") {
  return a.widths.map((w) => `${a.base}-${w}.${ext} ${w}w`).join(", ");
}
export function fallbackSrc(a: StageAsset) {
  return `${a.base}-${a.widths[a.widths.length - 1]}.jpg`;
}
