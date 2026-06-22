# Production Exercise Demonstration System

Replace the placeholder SVG/stick-figure demonstrations with a real-human, coach-quality demonstration system across the whole app, keeping all workout logic untouched.

## What changes for the user

- Every exercise shows **real human demonstration photos** instead of stick figures.
- A **Male / Female toggle** sits at the top of the demonstration. The choice is remembered (set during onboarding, changeable in Settings) and applies everywhere.
- Demonstration layout: **large hero image** + a **row of step thumbnails** (Start → Movement → End → Return) with the current step highlighted.
- Exercises with no available photo show a clean **"Illustration coming soon"** card — never a broken image.
- The exercise page keeps all its existing sections (muscles, level, equipment, time, type, how-to, benefits, mistakes, safety, recommended for, Track My Progress) plus a new **Breathing Pattern** section.
- Private user photos/videos stay only in Progress Mirror — official demos are never replaced by user uploads.

> Note on gender media (per your choice): the approved free dataset has one demonstrator per exercise. The toggle and `male_images[] / female_images[]` data model are built now; both genders display the available shared photos until a gendered dataset is plugged in later. A small inline note signals when a true gender-specific set isn't available yet.

## Data model & provider

- Extend the asset pipeline to carry **galleries** (ordered step images) per gender, not just single thumbnails:
  - Per exercise, store: `exerciseId`, `male.images[]`, `female.images[]`, `thumbnail`, plus existing license/provenance.
  - Each image carries a `step` label (Start / Movement / End / Return) derived from dataset order.
- Keep the existing `ExerciseAssetProvider` interface; extend `ProviderMatch` to return an **ordered image set** (the yuhonas dataset already ships 2 images per exercise = start/end). Provider stays swappable so a future gendered dataset is a drop-in.
- Fallback chain (guaranteed): gendered gallery → shared gallery → thumbnail → "Illustration coming soon" card. The inline SVG/stick-figure glyphs are removed from the render path.

## Components

- **`ExerciseDemo`** (new): the centerpiece. Renders the gender toggle, large hero (selected step), step thumbnail strip, zoom-on-tap, lazy-loaded `<img>` with fixed aspect ratio (no layout shift), `loading="lazy"`, `decoding="async"`, and preloads the next step image. Accessible: alt text per step, `aria-label` on toggle and thumbnails, ≥44px touch targets, high-contrast captions.
- **`ExerciseAsset` / `ExerciseArt`**: refactored to delegate to `ExerciseDemo` (or a compact variant for cards/player). Stick-figure glyph fallback replaced by the "coming soon" card.
- **`BreathingPattern`** section on the exercise page (derived from a new optional `breathing` field on `Exercise`, with a sensible default by pattern).

## Gender preference (no workout-logic change)

- Add `gender?: "male" | "female"` to `UserProfile`.
- Add an onboarding step (gender selection) and a Settings toggle in `profile.tsx`.
- A small selector reads the profile gender as the default for all demonstrations; the in-page toggle overrides per session.

## Files

- **New**: `src/components/leveluplife/exercises/ExerciseDemo.tsx`, `.../BreathingPattern.tsx`, `src/lib/leveluplife/assets/gender.ts` (preference helper).
- **Edit**: `assets/types.ts` (gallery + gender model), `assets/assetManager.ts` (gallery resolution + gender selection), `providers/types.ts` + `providers/freeExerciseDb.ts` (return ordered image sets), `scripts/import-exercise-assets.ts` (write galleries + step labels), `components/.../ExerciseAsset.tsx` + `ExerciseArt.tsx` + `ExerciseCard.tsx`, `player/MissionPlayer.tsx` (use new demo, compact), `routes/exercises.$id.tsx` (new layout + breathing + toggle), `routes/onboarding.tsx` (gender step), `routes/profile.tsx` (gender toggle), `exercises/types.ts` (`breathing` field), `manifest.generated.ts` (regenerated).
- **Remove from render path**: `illustrations.tsx` stick figures (file may stay but is no longer used for demos).

## Import

- Run the dev-time importer for the current exercise library to pull and optimize a **starter batch** of real photos (webp + thumbnail + step ordering), skipping exercises with no confident match. Regenerate the manifest. Unmatched exercises display "Illustration coming soon".

## Design

- Dark premium LevelUp branding, glassmorphism cards, blue neon accents, generous spacing, large readable type, smooth step transitions and toggle animation. Uses existing design tokens — no hardcoded colors.

## Performance & accessibility

- Lazy-load + async decode, fixed aspect ratios to avoid CLS, preload next step/exercise image, optimized webp from the importer, browser caching via stable hashed URLs. Screen-reader alt text, zoomable hero, large touch targets, high contrast.

## Out of scope

- No real per-gender photo sourcing (needs a gendered dataset — structurally ready).
- No changes to workout generation, XP, or session logic.
