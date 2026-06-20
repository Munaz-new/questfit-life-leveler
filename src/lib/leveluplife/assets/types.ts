/* ────────────────────────────────────────────────────────────────────────
 * Exercise Asset Pipeline — shared types.
 *
 * These describe the *provenance and format* of an exercise demonstration
 * asset. They are intentionally framework-agnostic (no React) so both the
 * runtime Asset Manager and the dev-time importer script can share them.
 * ──────────────────────────────────────────────────────────────────── */

/** Renderable formats the pipeline understands. Add new ones here only. */
export type AssetFormat =
  | "svg"
  | "lottie"
  | "webp"
  | "png"
  | "jpg"
  | "gif"
  | "mp4"
  | "glb";

/** The kinds of asset an exercise can have. */
export type AssetKind = "thumbnail" | "illustration" | "animation" | "video";

/** A single resolved asset plus its legal/provenance metadata. */
export interface AssetRef {
  /** Public URL (CDN pointer, /public path, or bundled import URL). */
  url: string;
  format: AssetFormat;
  /** Provider id the asset originated from (e.g. "free-exercise-db"). */
  source: string;
  /** SPDX-ish license string (e.g. "Unlicense", "CC-BY-4.0"). */
  license: string;
  /** Optional human/community contributor credit. */
  contributor?: string;
  /** Monotonic content version, bumped by the importer on change. */
  version: string;
  /** ISO timestamp of last import/update. */
  updatedAt: string;
  /** File size in bytes (used for the dashboard quality score). */
  bytes?: number;
}

/** All assets known for a single exercise. Every field optional. */
export type ExerciseAssets = Partial<Record<AssetKind, AssetRef>>;

/** What the Asset Manager hands back to the Workout Player. */
export interface ResolvedAsset {
  kind: AssetKind;
  ref: AssetRef;
}
