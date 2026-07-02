# Unified Exercise Demonstrator Media

Make every exercise screen resolve demonstration media through one source of truth, driven by the global Demonstrator preference, with correct female→male fallback and a subtle note when a female asset is missing.

## Problem

- Exercise assets only exist as a `shared` gallery (male-model photos). Female selection silently shows male images with no note; male is treated as a generic fallback rather than its native set.
- `resolveGallery` can't tell "male native" from "female fallback," so no accurate note is possible.
- Fallback notes are missing on Library cards and the Mission Player, and the Detail page shows "coming soon" even for male.

## Approach

Establish **one resolution function + one React hook** that all exercise UIs consume. Treat `shared` as the canonical male demonstrator until real female assets are imported. Return explicit fallback info so any screen can render a consistent, subtle note. No UI screen ever references a static image path directly.

### 1. Asset resolution — single source of truth (`src/lib/leveluplife/assets/assetManager.ts`)

- Add `resolveMedia(id, gender)` returning a richer result:
  - `images: DemoImage[]`
  - `requestedGender: Gender`
  - `servedGender: Gender` (which demonstrator the returned images actually depict)
  - `isFallback: boolean` (true when a female request was served male assets)
  - `note?: string` (e.g. `"Female demonstration coming soon"`) — set only when `isFallback`.
- Resolution order:
  - `female`: `demo.female` → else `demo.male ?? demo.shared` (served male, `isFallback: true`) → else thumbnail → else undefined.
  - `male`: `demo.male ?? demo.shared` (native) → thumbnail → undefined.
- Keep existing `resolveGallery`/`assetUrl` exports working (reimplement `resolveGallery` on top of `resolveMedia`) so nothing else breaks.

### 2. Provider hook (new `src/lib/leveluplife/assets/useExerciseMedia.ts`)

- `useExerciseMedia(id)` = `useDemoGender()` + `resolveMedia(id, gender)`, returning `{ images, coverUrl, isFallback, note, gender }`.
- This is the single entry point every screen uses; it re-renders automatically when the preference changes (existing `demoGender` event/`storage` sync in `gender.ts`).

### 3. Screen updates (presentation only)

- **`ExerciseAsset.tsx`** (used by Library cards + Mission Player): consume `useExerciseMedia`. Add an optional `showFallbackNote` prop that renders a subtle corner badge when `isFallback`. Keep the guaranteed `ComingSoon` fallback for no-asset cases (never broken/empty images).
- **`ExerciseCard.tsx`** (Library): pass through the fallback so a subtle "Female demo coming soon" line appears under the affected card; cover image comes only from the provider.
- **`ExerciseDemo.tsx`** (Detail): replace the current `hasGenderedAsset` note logic with `isFallback`/`note` from the resolver so Male no longer shows "coming soon," and Female shows the subtle note while displaying the male fallback.
- **`MissionPlayer.tsx`**: `ExerciseArt` already routes through `ExerciseAsset`; enable the subtle fallback note so the Player matches Library/Detail.

### 4. Verification

- Toggle the demonstrator in Settings/onboarding and confirm Library, Detail, and Mission Player update instantly without reload.
- Female selection shows male fallback images plus the subtle note everywhere; Male shows no note.
- No broken/empty images for any exercise (thumbnail/ComingSoon fallback intact).
- `tsgo` typecheck clean.

## Technical notes

- Purely frontend/presentation + the pure resolver module; no changes to workout logic, store data model, or the importer/manifest schema.
- `shared` is intentionally mapped to `male` now; when the importer later adds real `female` galleries, `resolveMedia` serves them automatically with **no UI changes** — satisfying the future-media-types requirement (videos/GIFs/animations already flow through `AssetFormat` + `assetUrl`).
- Single source of truth = `resolveMedia` (pure) + `useExerciseMedia` (React); all screens depend on these, keeping every demonstrator view synchronized.
