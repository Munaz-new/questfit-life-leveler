/* ────────────────────────────────────────────────────────────────────────
 * Exercise Asset Manager — the ONLY thing the app asks for demonstrations.
 *
 * The Workout Player / exercise pages never know where an asset comes from
 * (Free Exercise DB, a community folder, future official LevelUp assets,
 * AI-generated demos, 3D models…). They call resolveBest() / getAsset() and
 * render whatever comes back via <ExerciseAsset/>.
 *
 * Fallback chain (guaranteed never-broken):
 *   animation  →  illustration (svg)  →  thumbnail  →  inline glyph  →  placeholder
 *
 * Note: inline-glyph + placeholder handling lives in <ExerciseAsset/> (it
 * needs React); this module stays pure so the importer can reuse it.
 * ──────────────────────────────────────────────────────────────────── */

import { ASSET_MANIFEST } from "./manifest.generated";
import type { AssetKind, AssetRef, ExerciseAssets, ResolvedAsset } from "./types";

/** Order the resolver prefers when picking the "best" visual demonstration. */
const VISUAL_PRIORITY: AssetKind[] = ["animation", "illustration", "thumbnail"];

/** All imported assets for an exercise (empty object if none). */
export function getAssets(id: string): ExerciseAssets {
  return ASSET_MANIFEST[id] ?? {};
}

/** A single asset of a given kind, if it has been imported. */
export function getAsset(id: string, kind: AssetKind): AssetRef | undefined {
  return getAssets(id)[kind];
}

/** Convenience accessors mirroring the Player's mental model. */
export const getThumbnail = (id: string) => getAsset(id, "thumbnail");
export const getIllustration = (id: string) => getAsset(id, "illustration");
export const getAnimation = (id: string) => getAsset(id, "animation");
export const getVideo = (id: string) => getAsset(id, "video");

/**
 * Best available *file-based* asset following the fallback chain. Returns
 * undefined when nothing has been imported — the caller then falls back to
 * the built-in inline SVG and finally the placeholder.
 */
export function resolveBest(id: string): ResolvedAsset | undefined {
  const assets = getAssets(id);
  for (const kind of VISUAL_PRIORITY) {
    const ref = assets[kind];
    if (ref?.url) return { kind, ref };
  }
  return undefined;
}

/** Does this exercise have any imported asset at all? */
export function hasImportedAsset(id: string): boolean {
  const a = getAssets(id);
  return Boolean(a.animation || a.illustration || a.thumbnail || a.video);
}

/**
 * 0–100 quality score for the dev dashboard. Weighted by which asset tiers
 * exist; richer media scores higher.
 */
export function qualityScore(id: string): number {
  const a = getAssets(id);
  let score = 0;
  if (a.thumbnail) score += 20;
  if (a.illustration) score += 25;
  if (a.animation) score += 40;
  if (a.video) score += 15;
  return Math.min(100, score);
}

/** Which kinds are still missing for an exercise. */
export function missingKinds(id: string): AssetKind[] {
  const a = getAssets(id);
  return (["thumbnail", "illustration", "animation", "video"] as AssetKind[]).filter(
    (k) => !a[k],
  );
}
