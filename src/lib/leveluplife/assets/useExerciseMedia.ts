/* ────────────────────────────────────────────────────────────────────────
 * useExerciseMedia — the single React entry point for exercise demonstration
 * media. Every exercise screen (Library, Detail, Workout/Mission Player, and
 * all previews) reads media through this hook so they stay perfectly in sync
 * with the global Demonstrator preference.
 *
 * It combines the reactive gender preference with the pure `resolveMedia`
 * resolver, so components re-render immediately when the preference changes —
 * no app restart required. Future media types (video, GIF, animation) flow
 * through the same `AssetFormat` / `assetUrl` layer, so UI code never changes.
 * ──────────────────────────────────────────────────────────────────── */

import { resolveMedia } from "./assetManager";
import { useDemoGender } from "./gender";
import type { DemoImage, Gender } from "./types";

export interface ExerciseMedia {
  /** Ordered demonstration frames for the current demonstrator (may be empty). */
  images: DemoImage[];
  /** First frame — the cover image. Undefined when nothing is imported. */
  cover?: DemoImage;
  /** The demonstrator the user selected. */
  gender: Gender;
  /** True when a female request was served the male/shared set. */
  isFallback: boolean;
  /** Subtle note to surface when isFallback is true. */
  note?: string;
  /** True when no media exists at all (caller shows a "coming soon" card). */
  isEmpty: boolean;
}

export function useExerciseMedia(id: string): ExerciseMedia {
  const [gender] = useDemoGender();
  const media = resolveMedia(id, gender);
  return {
    images: media.images,
    cover: media.images[0],
    gender,
    isFallback: media.isFallback,
    note: media.note,
    isEmpty: media.images.length === 0,
  };
}
