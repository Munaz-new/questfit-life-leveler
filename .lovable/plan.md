# Exercise Asset Pipeline

A scalable, provider-agnostic system so every exercise automatically shows the best available demonstration, and new exercises are added by importing or dropping a folder — no manual wiring. The Workout Player only ever asks the Asset Manager for `thumbnail / illustration / animation / video` and gets back the best available asset (with guaranteed fallback).

## Architecture

```text
Exercise DB (library.ts)
      │
Asset Manager  ──►  resolve(exerciseId, kind) → best asset + fallback chain
      │
Asset Registry (generated manifest)  ◄── Asset Importer (dev-time Node script)
      │                                         │
In-repo asset library  ◄── Approved Providers (Free Exercise DB, local, community)
```

The app reads only the **generated manifest** + the in-repo files. The **importer** is the only thing that talks to providers. Swapping/adding a provider never touches app code.

## 1. Asset library + folder structure

```text
src/assets/exercise-library/
  push_up/
    thumbnail.webp
    illustration.svg
    animation.lottie      (optional)
    preview.mp4           (optional)
    metadata.json         (source, license, contributor, version, updatedAt, checksums)
  squat/ ...
```
- Consistent naming derived from exercise id (`push_up`, never random).
- Large binaries (webp/mp4/lottie) are externalized to the Lovable CDN via `.asset.json` pointers; small SVGs stay inline. `metadata.json` always committed.

## 2. Asset metadata schema

Extend `Exercise` (types.ts) with an optional `assets` block and per-asset provenance:
```ts
assets?: {
  thumbnail?: AssetRef; illustration?: AssetRef;
  animation?: AssetRef; video?: AssetRef;
}
// AssetRef: { url, format, source, license, contributor?, version, updatedAt, bytes? }
```
Existing inline-SVG illustrations remain valid as the built-in `illustration` source.

## 3. Asset Manager (`src/lib/leveluplife/assets/`)

- `manifest.generated.ts` — typed map `exerciseId → assets`, produced by the importer. Checked in.
- `assetManager.ts` — `getAsset(id, kind)` and `resolveBest(id)` implementing the **fallback chain**:
  `animation → illustration(svg) → thumbnail → LEVELUP placeholder`. Never returns broken.
- `ExerciseAsset.tsx` — single render component that switches on format (Lottie / SVG / `<img>` webp / `<video>` mp4 / future 3D) behind one API. Workout Player and exercise pages render this and stay format-agnostic.
- Lottie: add `lottie-react` (only loaded when an animation asset exists).

`ExerciseArt` is refactored to delegate to `ExerciseAsset`, so existing call sites keep working.

## 4. Provider abstraction (`src/lib/leveluplife/assets/providers/`)

```ts
interface AssetProvider {
  id: string; license: string;
  search(exercise): Promise<ProviderMatch[]>;
  fetchAsset(match): Promise<Buffer>;
}
```
Registered in a `providers/index.ts` array — add/remove a provider = add/remove one file. Ship:
- `freeExerciseDb.ts` — **Free Exercise DB (yuhonas, Unlicense / public domain)**, first real provider: matches by name/alias, pulls demonstration images.
- `local.ts` — reads hand-placed/community folders already in the asset library.

## 5. Importer (dev-time Node script: `scripts/import-exercise-assets.ts`)

Run via `bun scripts/import-exercise-assets.ts [--exercise=push_up] [--provider=free-exercise-db]`. Steps per exercise:
1. Verify asset exists at provider; skip if already current (checksum/version dedupe).
2. Download, **optimize/compress** to webp + generate thumbnail (uses `sharp`/`cwebp` available in the dev sandbox — never at app runtime).
3. Write into `src/assets/exercise-library/<id>/` with consistent names + `metadata.json` (source, license, contributor, version, updatedAt).
4. Externalize large binaries to CDN, regenerate `manifest.generated.ts`.
No manual linking; the Workout Player picks it up automatically on next load.

## 6. Fallback system

Guaranteed by `resolveBest`. Add one branded `placeholder.svg` as the final fallback so users never see a broken image.

## 7. Community support

`metadata.json` carries `source / license / contributor / version`. Contributors add a folder + metadata or run the importer; `local` provider ingests it. A `CONTRIBUTING-assets.md` documents the format and the legal rule (only redistributable / appropriately licensed assets — no scraping, no copyrighted media, no image search).

## 8. Developer dashboard

New **unlinked dev route `/dev/asset-dashboard`** (reachable by URL only). Table over all exercises showing: thumbnail, asset status per kind (animation/video/illustration), license, source, last updated, missing-asset flags, and a simple **quality score** (weighted by which asset tiers are present). Lets devs see at a glance which exercises still need better assets.

## 9. Future-ready

The format switch in `ExerciseAsset` + provider array mean official LEVELUP assets, trainer videos, 3D (glb), or AI-generated demos are added as new providers/formats with zero Workout Player changes.

## Out of scope (v1)
- Runtime in-app importing (edge runtime can't compress) — importer stays dev-time.
- Bulk import of all 500+ now: I'll wire the pipeline and import a starter set (the existing core exercises) to prove it end-to-end.

## Technical notes / files
- New: `src/lib/leveluplife/assets/{assetManager.ts,manifest.generated.ts,providers/*}`, `src/components/leveluplife/exercises/ExerciseAsset.tsx`, `scripts/import-exercise-assets.ts`, `src/routes/dev.asset-dashboard.tsx`, `src/assets/exercise-library/*`, `placeholder.svg`, `CONTRIBUTING-assets.md`.
- Edited: `exercises/types.ts` (assets block), `ExerciseArt.tsx` (delegate), `MissionPlayer.tsx` + `exercises.$id.tsx` (render via asset manager — visual only).
- Deps: `lottie-react` (app), `sharp` (dev script only).
