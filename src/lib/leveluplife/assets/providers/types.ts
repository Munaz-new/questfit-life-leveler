/* ────────────────────────────────────────────────────────────────────────
 * Asset Provider contract.
 *
 * A provider is an adapter over an APPROVED, legally-redistributable source
 * of exercise assets. The importer talks to providers; the app never does.
 * Add or remove a provider by editing providers/index.ts — nothing else in
 * the app changes.
 *
 * LEGAL RULE: providers MUST only return assets that are public-domain or
 * carry a redistributable license. No scraping, no copyrighted media, no
 * image-search results.
 * ──────────────────────────────────────────────────────────────────── */

import type { AssetFormat, AssetKind } from "../types";

/** Minimal shape the importer passes to a provider for matching. */
export interface ProviderQuery {
  /** Exercise id in our DB (e.g. "push-bw"). */
  id: string;
  /** Display name (e.g. "Push-up"). */
  name: string;
  /** Optional extra terms to help matching. */
  aliases?: string[];
  /** Primary muscles, used to disambiguate matches. */
  primaryMuscles?: string[];
}

/** A candidate asset the provider found for a query. */
export interface ProviderMatch {
  /** Provider-internal id, for logging / dedupe. */
  externalId: string;
  /** Human label of the matched source entry. */
  label: string;
  kind: AssetKind;
  format: AssetFormat;
  /** Remote URL to download from. */
  remoteUrl: string;
  /** 0–1 confidence the match is correct. */
  confidence: number;
  license: string;
  contributor?: string;
}

export interface AssetProvider {
  /** Stable id, stored as `source` on imported assets. */
  id: string;
  /** Human label for the dashboard. */
  label: string;
  /** Default license for assets from this provider. */
  license: string;
  /** Find candidate assets for an exercise (best first). */
  search(query: ProviderQuery): Promise<ProviderMatch[]>;
  /** Download the raw bytes for a chosen match. */
  fetchAsset(match: ProviderMatch): Promise<Uint8Array>;
}
