# Dual-Gender Exercise Media System

Turn the demonstration pipeline into a scalable, per-gender, multi-format system. Male shows silently when female is missing — no "coming soon" anywhere in normal use. Add a female import provider, nested `male/`|`female/` folders for new imports, and an admin-only coverage dashboard.

## Decisions (confirmed)
- **Female source:** wire a real provider. Candidate: `StudioAppsTeam/ironhex-exercise-db` (Unlicense fork of free-exercise-db, advertises gender-specific media). Legal gate: only import if per-asset license is redistributable; otherwise female stays empty. No fake data.
- **Folder layout:** nested `exercise-library/<folder>/male|female/…` for new imports; existing flat files keep working via the manifest.
- **Fallback:** silent male fallback everywhere. Remove all user-facing notes/overlays/badges.

## 1. Data model (single source of truth)
Extend `assets/types.ts`:
- Add `AssetTier` = per-gender bundle: `{ thumbnail?, hero?, gallery?: DemoImage[], animation?, video? }` where each slot is an `AssetRef` (keeps existing `AssetFormat`: webp/png/jpg/gif/mp4/lottie/glb — already future-ready).
- `ExerciseDemoAssets` gains structured `male?: AssetTier` and `female?: AssetTier`. Keep the current `shared`/`male[]`/`female[]`/`thumbnail` shape readable for back-compat: the manifest loader normalizes legacy `shared` → `male` tier and legacy gallery arrays → `tier.gallery`.
- `resolveMedia` return keeps `images`/`servedGender` but `isFallback`/`note` become internal-only (UI ignores them).

## 2. Resolver + hook (silent fallback)
`assetManager.ts`:
- `resolveMedia(id, gender)`: female → female tier if it has media, else male tier; male → male tier (which absorbs legacy `shared`). Always returns the best available; never empties when any tier exists.
- Drop the `note` text from all return paths used by UI. Keep `hasGenderedAsset`, `qualityScore`, `imageCount`, plus new `coverage(id)` → `{ male: boolean, female: boolean }`.
- `useExerciseMedia.ts`: unchanged surface, but `isFallback`/`note` no longer consumed by components.

## 3. Remove all "coming soon" / fallback notes
- `ExerciseAsset.tsx`: delete the `showFallbackNote` badge block and prop usage. Keep `ComingSoon` **only** for the true-empty case (no media at all for any gender).
- `ExerciseDemo.tsx`: remove the `isFallback`/`note` provenance line ("Female demonstration coming soon" and the "showing the available demonstration" text). Keep the neutral "Demonstration always shows correct form." line.
- `ExerciseArt.tsx`, `MissionPlayer.tsx`, `ExerciseCard.tsx`: drop `showFallbackNote` pass-through.

## 4. Every screen reads the global preference
Audit and confirm all consumers go through `useExerciseMedia` (already the case for Library, Detail, Mission/Workout Player). Verify and wire the remaining surfaces named in the request that currently render exercise imagery: Daily Quests, Recommendations (`RecommendationCard.tsx`), Search/Favorites (in `exercises.index.tsx`), Progress, and any adaptive/AI preview cards. Any direct `assetUrl`/manifest access is replaced with `useExerciseMedia`.

## 5. Female import pipeline
`scripts/import-exercise-assets.ts` + new provider `providers/ironhexExerciseDb.ts`:
- Provider returns matches with `gender: "male" | "female"` when the source distinguishes; importer writes into `exercise-library/<folder>/<gender>/{thumbnail,hero,step-N}.webp`.
- Importer flow per exercise: import male (existing free-exercise-db path, now also gender-aware), then attempt female via the female-capable provider. If found and license is redistributable → attach female tier. If not → leave female empty (no placeholder).
- `metadata.json` schema extended to nested tiers; `generateManifest()` reads both flat-legacy and nested-tier metadata and emits the normalized `ExerciseDemoAssets`.
- Register the provider in `providers/index.ts`. Importer stays dev-time only (never bundled/edge).

## 6. Admin dashboard
Rework `routes/dev.asset-dashboard.tsx` (unlinked dev route, not in user nav):
- Columns per exercise: Male ✓/�— , Female ✓/�— , formats present, import status, per-exercise coverage.
- Header aggregate: overall coverage %, male coverage %, female coverage %, count missing female, count missing male. Filters: all / missing-female / missing-male.

## 7. Performance
- Keep `loading="lazy"` / `decoding="async"` on all imagery.
- Detail player already preloads the next step; add workout-start preloading: in the Mission/Workout Player, prefetch the first frame (and thumbnail) of every exercise in the queue on mount via `new Image()`.
- Bundled webp imports are already content-hashed and CDN/browser-cached.

## Technical notes
- No database/schema change — all media resolved from the generated manifest; new media types (gif/mp4/lottie/glb) already expressible via `AssetFormat` + tier slots, so future additions need no UI change.
- Back-compat: existing 36 flat-folder exercises continue rendering as the male tier with zero migration.
- Legal: female import guarded by redistributable-license check; skip otherwise.

## Verification
- Typecheck (`tsgo`) and `bun run build`.
- Toggle demonstrator in Settings → confirm Library, Detail, Mission Player, Quests, Recommendations all switch together and never show a "coming soon" note when male media exists.
- Load the dev dashboard → confirm male/female columns and coverage math.
