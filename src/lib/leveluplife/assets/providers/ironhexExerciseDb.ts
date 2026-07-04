/* ────────────────────────────────────────────────────────────────────────
 * Provider: IronHex Exercise DB (github.com/StudioAppsTeam/ironhex-exercise-db)
 * License: Unlicense (public domain) — an extended fork of free-exercise-db
 * that adds gender-specific demonstration media (…/<id>/<i>-female.jpg).
 *
 * This provider is the FEMALE demonstration source. It only returns a match
 * when real female images exist for the exercise (verified with a HEAD probe),
 * so the importer never fabricates female data — exercises without a female
 * set are simply left empty.
 * ──────────────────────────────────────────────────────────────────── */

import type { AssetProvider, ProviderMatch, ProviderQuery } from "./types";

const DATA_URL =
  "https://raw.githubusercontent.com/StudioAppsTeam/ironhex-exercise-db/main/dist/exercises.json";
const IMAGE_BASE =
  "https://raw.githubusercontent.com/StudioAppsTeam/ironhex-exercise-db/main/exercises/";

interface IronExercise {
  id: string;
  name: string;
  primaryMuscles?: string[];
  images?: string[];
}

let cache: IronExercise[] | null = null;

async function loadDataset(): Promise<IronExercise[]> {
  if (cache) return cache;
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`ironhex-exercise-db: dataset fetch failed (${res.status})`);
  const json = (await res.json()) as { exercises?: IronExercise[] } | IronExercise[];
  cache = Array.isArray(json) ? json : (json.exercises ?? []);
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

/** Turn a neutral image path ("Chair_Squat/0.jpg") into its female variant. */
function femaleUrl(image: string): string {
  return IMAGE_BASE + image.replace(/(\.\w+)$/, "-female$1");
}

async function exists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export const ironhexExerciseDbProvider: AssetProvider = {
  id: "ironhex-exercise-db",
  label: "IronHex Exercise DB (female media)",
  license: "Unlicense",

  async search(query: ProviderQuery): Promise<ProviderMatch[]> {
    const data = await loadDataset();
    const queryTokens = tokens([query.name, ...(query.aliases ?? [])].join(" "));

    const ranked = data
      .filter((e) => e.images && e.images.length > 0)
      .map((e) => {
        let confidence = overlap(queryTokens, tokens(e.name));
        if (query.primaryMuscles?.length && e.primaryMuscles?.length) {
          const m = overlap(new Set(query.primaryMuscles), new Set(e.primaryMuscles));
          confidence = confidence * 0.8 + m * 0.2;
        }
        return { e, confidence };
      })
      .filter((m) => m.confidence >= 0.34)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    const matches: ProviderMatch[] = [];
    for (const { e, confidence } of ranked) {
      const femaleUrls = e.images!.slice(0, 4).map(femaleUrl);
      // Only surface a female match when the first female frame actually exists.
      if (!(await exists(femaleUrls[0]))) continue;
      matches.push({
        externalId: e.id,
        label: e.name,
        kind: "thumbnail",
        format: "jpg",
        remoteUrls: femaleUrls,
        confidence,
        license: "Unlicense",
        gender: "female",
      });
    }
    return matches;
  },

  async fetchAsset(_match: ProviderMatch, url: string): Promise<Uint8Array> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ironhex-exercise-db: image fetch failed (${res.status})`);
    return new Uint8Array(await res.arrayBuffer());
  },
};
