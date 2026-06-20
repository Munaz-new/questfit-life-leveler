# Contributing exercise assets

LevelUp Life uses a **provider-agnostic asset pipeline**. The app (Workout
Player, exercise pages) never references files directly — it asks the Asset
Manager for the best available demonstration and renders whatever comes back.

## Folder layout

Every exercise has its own folder under `src/assets/exercise-library/`:

```
src/assets/exercise-library/
  push_bw/
    thumbnail.webp        # required-ish (square preview)
    illustration.webp     # or illustration.svg
    animation.lottie      # optional
    preview.mp4           # optional
    metadata.json         # REQUIRED — provenance for every asset
```

Folder names are the exercise `id` with non-alphanumerics replaced by `_`
(e.g. `push-bw` → `push_bw`). Filenames are fixed — never random.

## metadata.json

```json
{
  "exerciseId": "push-bw",
  "folder": "push_bw",
  "assets": {
    "thumbnail":    { "url": "push_bw/thumbnail.webp",  "format": "webp", "source": "local-community", "license": "CC-BY-4.0", "contributor": "Your Name", "version": "1", "updatedAt": "2026-06-20T00:00:00Z" },
    "illustration": { "url": "push_bw/illustration.svg", "format": "svg",  "source": "local-community", "license": "CC0-1.0",   "version": "1", "updatedAt": "2026-06-20T00:00:00Z" }
  }
}
```

After adding/editing folders, regenerate the manifest:

```bash
bun scripts/import-exercise-assets.ts --generate
```

## Fallback chain (you never need every asset)

`animation → illustration → thumbnail → built-in inline glyph → placeholder`

If you only contribute a better animation, drop it in — everything else keeps
working.

## Importing from approved sources

```bash
bun scripts/import-exercise-assets.ts --exercise=push-bw --provider=free-exercise-db
```

Providers live in `src/lib/leveluplife/assets/providers/`. Add one by creating
a file and registering it in `providers/index.ts`.

## ⚖️ Legal rules (non-negotiable)

- Only **public-domain or redistributable-licensed** assets.
- **No scraping** random sites, **no copyrighted media**, **no image search.**
- Every asset must record its `source`, `license`, and (when applicable)
  `contributor`.

These rules keep the library replaceable by official LevelUp Life assets later.
