#!/usr/bin/env bun
/* ────────────────────────────────────────────────────────────────────────
 * Exercise Asset Importer (DEV-TIME ONLY — never runs in the app/edge).
 *
 * Pipeline:
 *   Exercise DB → providers.search() → pick best → download → optimize
 *   (webp + thumbnail) → write src/assets/exercise-library/<folder>/ +
 *   metadata.json → regenerate manifest.generated.ts.
 *
 * Usage:
 *   bun scripts/import-exercise-assets.ts                 # import all (skips existing)
 *   bun scripts/import-exercise-assets.ts --exercise=push-bw
 *   bun scripts/import-exercise-assets.ts --provider=free-exercise-db
 *   bun scripts/import-exercise-assets.ts --force         # re-import existing
 *   bun scripts/import-exercise-assets.ts --generate      # only rebuild manifest
 *   bun scripts/import-exercise-assets.ts --dry-run       # no writes
 *
 * LEGAL: only approved, redistributable sources. No scraping / copyrighted
 * media / image search. Provenance (source + license) is stored per asset.
 * ──────────────────────────────────────────────────────────────────── */

import { mkdir, readdir, readFile, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { EXERCISES } from "../src/lib/leveluplife/exercises/library";
import { PROVIDERS, providerById } from "../src/lib/leveluplife/assets/providers";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIB_DIR = join(ROOT, "src/assets/exercise-library");
const MANIFEST = join(ROOT, "src/lib/leveluplife/assets/manifest.generated.ts");

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];

const ONLY_EX = opt("exercise");
const ONLY_PROVIDER = opt("provider");
const FORCE = flag("force");
const DRY = flag("dry-run");

const folderOf = (id: string) => id.replace(/[^a-z0-9]+/gi, "_").toLowerCase();

/** Human step labels for an ordered gallery of N images. */
function stepLabels(n: number): { step: string; stepLabel: string }[] {
  if (n <= 1) return [{ step: "demo", stepLabel: "Demonstration" }];
  if (n === 2)
    return [
      { step: "start", stepLabel: "Start Position" },
      { step: "end", stepLabel: "End Position" },
    ];
  if (n === 3)
    return [
      { step: "start", stepLabel: "Start Position" },
      { step: "movement", stepLabel: "Movement" },
      { step: "end", stepLabel: "End Position" },
    ];
  return [
    { step: "start", stepLabel: "Start Position" },
    { step: "movement", stepLabel: "Movement" },
    { step: "end", stepLabel: "End Position" },
    { step: "return", stepLabel: "Return" },
  ];
}

async function importOne(ex: (typeof EXERCISES)[number]): Promise<boolean> {
  const folder = folderOf(ex.id);
  const dir = join(LIB_DIR, folder);
  const metaPath = join(dir, "metadata.json");

  if (existsSync(metaPath) && !FORCE) {
    console.log(`  · ${ex.id}: assets exist (skip; --force to redo)`);
    return false;
  }

  const providers = ONLY_PROVIDER ? [providerById(ONLY_PROVIDER)].filter(Boolean) : PROVIDERS;
  for (const provider of providers) {
    if (!provider || provider.id === "local-community") continue;
    try {
      const matches = await provider.search({
        id: ex.id,
        name: ex.name,
        primaryMuscles: ex.primaryMuscles as string[],
      });
      const best = matches[0];
      if (!best || !best.remoteUrls.length) continue;

      console.log(
        `  ↓ ${ex.id} ← ${provider.id} "${best.label}" (${best.remoteUrls.length} img, conf ${best.confidence.toFixed(2)})`,
      );
      if (DRY) return true;

      await mkdir(dir, { recursive: true });
      const now = new Date().toISOString();
      const labels = stepLabels(best.remoteUrls.length);
      const gallery: unknown[] = [];

      for (let i = 0; i < best.remoteUrls.length; i++) {
        const raw = await provider.fetchAsset(best, best.remoteUrls[i]);
        const webp = await sharp(Buffer.from(raw))
          .resize(720, 720, { fit: "inside" })
          .webp({ quality: 82 })
          .toBuffer();
        const file = `step-${i}.webp`;
        await writeFile(join(dir, file), webp);
        gallery.push({
          url: `${folder}/${file}`,
          format: "webp",
          source: provider.id,
          license: best.license,
          contributor: best.contributor,
          version: "1",
          updatedAt: now,
          bytes: webp.byteLength,
          step: labels[i].step,
          stepLabel: labels[i].stepLabel,
        });
      }

      // Square thumbnail from the first frame.
      const thumbRaw = await provider.fetchAsset(best, best.remoteUrls[0]);
      const thumb = await sharp(Buffer.from(thumbRaw))
        .resize(256, 256, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();
      await writeFile(join(dir, "thumbnail.webp"), thumb);

      // A real gendered provider would store under `male`/`female`; today the
      // public-domain dataset is gender-neutral, so it lives in `shared`.
      const genderKey = best.gender ?? "shared";
      const meta = {
        exerciseId: ex.id,
        folder,
        assets: {
          thumbnail: {
            url: `${folder}/thumbnail.webp`,
            format: "webp",
            source: provider.id,
            license: best.license,
            contributor: best.contributor,
            version: "1",
            updatedAt: now,
            bytes: thumb.byteLength,
          },
          [genderKey]: gallery,
        },
      };
      await writeFile(metaPath, JSON.stringify(meta, null, 2) + "\n");
      console.log(`  ✓ ${ex.id} → ${folder}/ (${gallery.length} frames)`);
      return true;
    } catch (err) {
      console.warn(`  ! ${ex.id} via ${provider.id}: ${(err as Error).message}`);
    }
  }
  console.log(`  ∅ ${ex.id}: no match`);
  return false;
}

async function generateManifest() {
  const manifest: Record<string, unknown> = {};
  if (existsSync(LIB_DIR)) {
    for (const entry of await readdir(LIB_DIR)) {
      const metaPath = join(LIB_DIR, entry, "metadata.json");
      if (!existsSync(metaPath)) continue;
      if ((await stat(join(LIB_DIR, entry))).isDirectory() === false) continue;
      const meta = JSON.parse(await readFile(metaPath, "utf8"));
      if (meta.exerciseId && meta.assets) manifest[meta.exerciseId] = meta.assets;
    }
  }
  const body = `/* ──────────────────────────────────────────────────────────────────────── 
 * AUTO-GENERATED by scripts/import-exercise-assets.ts — DO NOT EDIT BY HAND.
 *
 * Maps exercise id → imported assets. When empty (or missing a kind), the
 * Asset Manager falls back to the built-in inline SVG illustration, and
 * finally to the LevelUp placeholder, so the UI is never broken.
 * ──────────────────────────────────────────────────────────────────── */

import type { ExerciseAssets } from "./types";

export const ASSET_MANIFEST: Record<string, ExerciseAssets> = ${JSON.stringify(manifest, null, 2)};

/** When the manifest was last regenerated (ISO). */
export const ASSET_MANIFEST_GENERATED_AT = ${JSON.stringify(new Date().toISOString())};
`;
  if (!DRY) await writeFile(MANIFEST, body);
  console.log(`Manifest: ${Object.keys(manifest).length} exercises with assets.`);
}

async function main() {
  console.log(`Providers: ${PROVIDERS.map((p) => p.id).join(", ")}`);
  if (!flag("generate")) {
    const list = ONLY_EX ? EXERCISES.filter((e) => e.id === ONLY_EX) : EXERCISES;
    console.log(`Importing ${list.length} exercise(s)…`);
    for (const ex of list) await importOne(ex);
  }
  await generateManifest();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
