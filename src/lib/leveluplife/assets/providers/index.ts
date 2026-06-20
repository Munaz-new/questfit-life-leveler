/* ────────────────────────────────────────────────────────────────────────
 * Provider registry — the single place to add/remove approved sources.
 *
 * Adding a provider = add a file + one line here. Nothing else in the app
 * changes. Order matters: earlier providers are preferred by the importer.
 * ──────────────────────────────────────────────────────────────────── */

import { freeExerciseDbProvider } from "./freeExerciseDb";
import { localProvider } from "./local";
import type { AssetProvider } from "./types";

export const PROVIDERS: AssetProvider[] = [
  freeExerciseDbProvider,
  localProvider,
  // Future: officialLevelUpProvider, trainerVideoProvider, model3dProvider…
];

export function providerById(id: string): AssetProvider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export type { AssetProvider, ProviderMatch, ProviderQuery } from "./types";
