/* ────────────────────────────────────────────────────────────────────────
 * Provider: Free Exercise DB (github.com/yuhonas/free-exercise-db)
 * License: Unlicense (public domain) — freely redistributable.
 *
 * Pulls the open exercise dataset + demonstration images. Matching is done
 * by normalized-name token overlap with a confidence score.
 * ──────────────────────────────────────────────────────────────────── */

import type { AssetProvider, ProviderMatch, ProviderQuery } from "./types";

const DATA_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const IMAGE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

interface FreeExercise {
  id: string;
  name: string;
  primaryMuscles?: string[];
  images?: string[];
}

let cache: FreeExercise[] | null = null;

async function loadDataset(): Promise<FreeExercise[]> {
  if (cache) return cache;
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`free-exercise-db: dataset fetch failed (${res.status})`);
  cache = (await res.json()) as FreeExercise[];
  return cache;
}

const STOP = new Set(["the", "a", "with", "and", "on", "to", "of", "up", "down"]);

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOP.has(t)),
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let hits = 0;
  for (const t of a) if (b.has(t)) hits++;
  return hits / Math.max(a.size, b.size);
}

export const freeExerciseDbProvider: AssetProvider = {
  id: "free-exercise-db",
  label: "Free Exercise DB (yuhonas)",
  license: "Unlicense",

  async search(query: ProviderQuery): Promise<ProviderMatch[]> {
    const data = await loadDataset();
    const queryTokens = tokens([query.name, ...(query.aliases ?? [])].join(" "));

    return data
      .filter((e) => e.images && e.images.length > 0)
      .map((e) => {
        let confidence = overlap(queryTokens, tokens(e.name));
        if (query.primaryMuscles?.length && e.primaryMuscles?.length) {
          const m = overlap(new Set(query.primaryMuscles), new Set(e.primaryMuscles));
          confidence = confidence * 0.8 + m * 0.2;
        }
        return {
          externalId: e.id,
          label: e.name,
          kind: "thumbnail" as const,
          format: "jpg" as const,
          remoteUrl: IMAGE_BASE + e.images![0],
          confidence,
          license: "Unlicense",
        } satisfies ProviderMatch;
      })
      .filter((m) => m.confidence >= 0.34)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  },

  async fetchAsset(match: ProviderMatch): Promise<Uint8Array> {
    const res = await fetch(match.remoteUrl);
    if (!res.ok) throw new Error(`free-exercise-db: image fetch failed (${res.status})`);
    return new Uint8Array(await res.arrayBuffer());
  },
};
