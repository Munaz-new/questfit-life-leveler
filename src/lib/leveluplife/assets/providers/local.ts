/* ────────────────────────────────────────────────────────────────────────
 * Provider: Local / Community.
 *
 * Reads assets a contributor placed by hand under
 *   src/assets/exercise-library/<id>/{thumbnail.webp,illustration.svg,...}
 * with a sibling metadata.json. The importer uses this to ingest community
 * contributions without any external network call.
 *
 * This adapter is filesystem-backed and is only ever invoked from the
 * dev-time importer (Node/Bun), never from the app runtime.
 * ──────────────────────────────────────────────────────────────────── */

import type { AssetProvider, ProviderMatch, ProviderQuery } from "./types";

export const localProvider: AssetProvider = {
  id: "local-community",
  label: "Local / Community contributions",
  license: "varies (see metadata.json)",

  // Local discovery is handled directly by the importer's filesystem walk,
  // so search/fetch are intentionally inert here — the contract is satisfied
  // and the provider remains listed in the registry/dashboard.
  async search(_query: ProviderQuery): Promise<ProviderMatch[]> {
    void _query;
    return [];
  },

  async fetchAsset(_match: ProviderMatch, _url: string): Promise<Uint8Array> {
    void _match;
    void _url;
    throw new Error("localProvider.fetchAsset is handled by the importer filesystem walk");
  },
};
