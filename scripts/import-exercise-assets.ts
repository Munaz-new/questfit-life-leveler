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
 *   bun scripts/import-exercise-assets.ts --diagnose      # write an import diagnostic report
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
import { PROVIDERS } from "../src/lib/leveluplife/assets/providers";

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
const DIAGNOSE = flag("diagnose") || flag("diagnostics");
const REPORT_PATH = opt("report") ?? "/mnt/documents/exercise-asset-diagnostics.json";
/** Add/refresh only the female tier, merging into existing metadata (non-destructive). */
const FEMALE_ONLY = flag("female-only");

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

type GenderKey = "male" | "female";

function tierHasGallery(tier: unknown): boolean {
  return Boolean(
    tier &&
      typeof tier === "object" &&
      Array.isArray((tier as { gallery?: unknown }).gallery) &&
      ((tier as { gallery?: unknown[] }).gallery?.length ?? 0) > 0,
  );
}

function tierHasThumbnail(tier: unknown): boolean {
  return Boolean(
    tier &&
      typeof tier === "object" &&
      (tier as { thumbnail?: { url?: string } }).thumbnail?.url,
  );
}

function metadataCoverage(meta: Record<string, unknown> | null) {
  const assets = ((meta?.assets as Record<string, unknown>) ?? {}) as Record<string, unknown>;
  const tiers = ((meta?.tiers as Record<string, unknown>) ?? {}) as Record<string, unknown>;
  const maleTier = tiers.male;
  const femaleTier = tiers.female;
  const hasArray = (v: unknown) => Array.isArray(v) && v.length > 0;
  const hasRef = (v: unknown) => Boolean(v && typeof v === "object" && (v as { url?: string }).url);
  return {
    male: hasArray(assets.shared) || hasArray(assets.male) || tierHasGallery(maleTier) || hasRef(assets.thumbnail) || tierHasThumbnail(maleTier),
    female: hasArray(assets.female) || tierHasGallery(femaleTier) || tierHasThumbnail(femaleTier),
    thumbnail: hasRef(assets.thumbnail) || tierHasThumbnail(maleTier) || tierHasThumbnail(femaleTier),
    hero: hasRef(assets.hero) || Boolean((maleTier as { hero?: unknown } | undefined)?.hero) || Boolean((femaleTier as { hero?: unknown } | undefined)?.hero),
    animation: hasRef(assets.animation) || Boolean((maleTier as { animation?: unknown } | undefined)?.animation) || Boolean((femaleTier as { animation?: unknown } | undefined)?.animation),
    video: hasRef(assets.video) || Boolean((maleTier as { video?: unknown } | undefined)?.video) || Boolean((femaleTier as { video?: unknown } | undefined)?.video),
  };
}

async function readMetadata(ex: (typeof EXERCISES)[number]) {
  const folder = folderOf(ex.id);
  const metaPath = join(LIB_DIR, folder, "metadata.json");
  if (!existsSync(metaPath)) return { folder, metaPath, meta: null };
  return {
    folder,
    metaPath,
    meta: JSON.parse(await readFile(metaPath, "utf8")) as Record<string, unknown>,
  };
}

/** Import one gender tier from a set of providers into <folder>/<gender>/. */
async function importTier(
  ex: (typeof EXERCISES)[number],
  folder: string,
  dir: string,
  gender: GenderKey,
  providers: (typeof PROVIDERS)[number][],
): Promise<Record<string, unknown> | null> {
  for (const provider of providers) {
    if (!provider || provider.id === "local-community") continue;
    try {
      const matches = await provider.search({
        id: ex.id,
        name: ex.name,
        primaryMuscles: ex.primaryMuscles as string[],
      });
      // For female tiers, only accept genuinely female matches (no fake data).
      const best = matches.find((m) => (gender === "female" ? m.gender === "female" : true));
      if (!best || !best.remoteUrls.length) continue;

      console.log(
        `  ↓ ${ex.id} [${gender}] ← ${provider.id} "${best.label}" (${best.remoteUrls.length} img)`,
      );
      if (DRY) return { dry: true };

      const tierDir = join(dir, gender);
      await mkdir(tierDir, { recursive: true });
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
        await writeFile(join(tierDir, file), webp);
        gallery.push({
          url: `${folder}/${gender}/${file}`,
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

      const thumbRaw = await provider.fetchAsset(best, best.remoteUrls[0]);
      const thumb = await sharp(Buffer.from(thumbRaw))
        .resize(256, 256, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();
      await writeFile(join(tierDir, "thumbnail.webp"), thumb);

      return {
        thumbnail: {
          url: `${folder}/${gender}/thumbnail.webp`,
          format: "webp",
          source: provider.id,
          license: best.license,
          contributor: best.contributor,
          version: "1",
          updatedAt: now,
          bytes: thumb.byteLength,
        },
        gallery,
      };
    } catch (err) {
      console.warn(`  ! ${ex.id} [${gender}] via ${provider.id}: ${(err as Error).message}`);
    }
  }
  return null;
}

async function importOne(ex: (typeof EXERCISES)[number]): Promise<boolean> {
  const folder = folderOf(ex.id);
  const dir = join(LIB_DIR, folder);
  const metaPath = join(dir, "metadata.json");

  const femaleProviders = PROVIDERS.filter(
    (p) => p.id === "ironhex-exercise-db" && (!ONLY_PROVIDER || p.id === ONLY_PROVIDER),
  );

  // Non-destructive female-only pass: keep existing (legacy flat) male media,
  // only attach a female tier when a real female set is found.
  if (FEMALE_ONLY) {
    const existing = existsSync(metaPath)
      ? (JSON.parse(await readFile(metaPath, "utf8")) as Record<string, unknown>)
      : { exerciseId: ex.id, folder };
    const tiers = ((existing.tiers as Record<string, unknown>) ?? {}) as Record<string, unknown>;
    if (tiers.female && !FORCE) {
      console.log(`  · ${ex.id}: female exists (skip; --force to redo)`);
      return false;
    }
    const female = await importTier(ex, folder, dir, "female", femaleProviders);
    if (DRY) return Boolean(female);
    if (!female) {
      console.log(`  ∅ ${ex.id}: no female match (left empty)`);
      return false;
    }
    await mkdir(dir, { recursive: true });
    tiers.female = female;
    await writeFile(
      metaPath,
      JSON.stringify({ ...existing, exerciseId: ex.id, folder, tiers }, null, 2) + "\n",
    );
    console.log(`  ✓ ${ex.id} → female tier added`);
    return true;
  }

  if (existsSync(metaPath) && !FORCE) {
    console.log(`  · ${ex.id}: assets exist (skip; --force to redo)`);
    return false;
  }

  const maleProviders = PROVIDERS.filter(
    (p) => p.id !== "ironhex-exercise-db" && (!ONLY_PROVIDER || p.id === ONLY_PROVIDER),
  );

  const male = await importTier(ex, folder, dir, "male", maleProviders);
  const female = await importTier(ex, folder, dir, "female", femaleProviders);

  if (DRY) return Boolean(male || female);
  if (!male && !female) {
    console.log(`  ∅ ${ex.id}: no match`);
    return false;
  }

  await mkdir(dir, { recursive: true });
  const assets: Record<string, unknown> = {};
  if (male) assets.male = male;
  if (female) assets.female = female; // female stays absent when none found
  await writeFile(
    metaPath,
    JSON.stringify({ exerciseId: ex.id, folder, tiers: assets }, null, 2) + "\n",
  );
  console.log(`  ✓ ${ex.id} → ${folder}/ (male:${!!male} female:${!!female})`);
  return true;
}

/**
 * Normalize any metadata shape (legacy flat `assets` or new nested `tiers`)
 * into the runtime `ExerciseAssets` map the app consumes.
 */
function normalizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  // Legacy flat shape: { assets: { thumbnail, shared|male|female: [...] } }
  if (meta.assets) Object.assign(out, meta.assets as Record<string, unknown>);

  // New nested shape: { tiers: { male: { thumbnail, gallery }, female: {...} } }
  // Merges on top of any legacy assets so a female tier added later is kept.
  const tiers = (meta.tiers ?? {}) as Record<string, { thumbnail?: unknown; gallery?: unknown }>;
  if (tiers.male) {
    out.male = tiers.male.gallery ?? [];
    out.maleTier = tiers.male;
    if (tiers.male.thumbnail && !out.thumbnail) out.thumbnail = tiers.male.thumbnail;
  }
  if (tiers.female) {
    out.female = tiers.female.gallery ?? [];
    out.femaleTier = tiers.female;
  }
  return out;
}

async function generateManifest() {
  const manifest: Record<string, unknown> = {};
  if (existsSync(LIB_DIR)) {
    for (const entry of await readdir(LIB_DIR)) {
      const metaPath = join(LIB_DIR, entry, "metadata.json");
      if (!existsSync(metaPath)) continue;
      if ((await stat(join(LIB_DIR, entry))).isDirectory() === false) continue;
      const meta = JSON.parse(await readFile(metaPath, "utf8"));
      if (meta.exerciseId) manifest[meta.exerciseId] = normalizeMeta(meta);
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

async function diagnoseImports() {
  const report = [];
  const femaleProviders = PROVIDERS.filter((p) => p.id === "ironhex-exercise-db");

  for (const ex of EXERCISES) {
    const { folder, metaPath, meta } = await readMetadata(ex);
    const cov = metadataCoverage(meta);
    const providerReports = [];

    for (const provider of femaleProviders) {
      const diagnostics = provider.diagnose
        ? await provider.diagnose(
            { id: ex.id, name: ex.name, primaryMuscles: ex.primaryMuscles as string[] },
            "female",
          )
        : [];
      const best = diagnostics[0];
      const available = diagnostics.find((d) => d.status === "available");
      providerReports.push({
        provider: provider.id,
        searched: true,
        status: cov.female
          ? "already-imported"
          : available
          ? "available-not-imported"
          : best
          ? best.status
          : "no-match",
        bestCandidate: best
          ? {
              label: best.label,
              externalId: best.externalId,
              confidence: Number(best.confidence.toFixed(3)),
              firstUrlExists: best.firstUrlExists ?? null,
              remoteUrlCount: best.remoteUrls.length,
              status: best.status,
            }
          : null,
        availableCandidate: available
          ? {
              label: available.label,
              externalId: available.externalId,
              confidence: Number(available.confidence.toFixed(3)),
              remoteUrlCount: available.remoteUrls.length,
            }
          : null,
      });
    }

    report.push({
      exerciseId: ex.id,
      exerciseName: ex.name,
      folder,
      metadataPath: existsSync(metaPath) ? metaPath : null,
      imported: {
        male: cov.male,
        female: cov.female,
        thumbnail: cov.thumbnail,
        hero: cov.hero,
        animation: cov.animation,
        video: cov.video,
      },
      missing: Object.entries(cov)
        .filter(([, ok]) => !ok)
        .map(([name]) => name),
      femalePipeline: providerReports,
    });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    totalExercises: report.length,
    exercisesWithMaleAssets: report.filter((r) => r.imported.male).length,
    exercisesWithFemaleAssets: report.filter((r) => r.imported.female).length,
    exercisesWithNoMedia: report.filter((r) => !r.imported.male && !r.imported.female).length,
  };

  const payload = { summary, exercises: report };
  await writeFile(REPORT_PATH, JSON.stringify(payload, null, 2) + "\n");
  console.log(`Diagnostic report: ${REPORT_PATH}`);
  console.log(
    `Summary: ${summary.totalExercises} exercises · male ${summary.exercisesWithMaleAssets} · female ${summary.exercisesWithFemaleAssets} · no media ${summary.exercisesWithNoMedia}`,
  );
}

async function main() {
  console.log(`Providers: ${PROVIDERS.map((p) => p.id).join(", ")}`);
  if (DIAGNOSE) {
    await diagnoseImports();
    return;
  }
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
