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
  /**
   * Ordered remote URLs forming the demonstration sequence (start → end).
   * The first entry is the hero/thumbnail source.
   */
  remoteUrls: string[];
  /** 0–1 confidence the match is correct. */
  confidence: number;
  license: string;
  contributor?: string;
  /**
   * Gender of the demonstration set, when the provider can distinguish.
   * Omitted = gender-neutral (stored as the shared gallery).
   */
  gender?: "male" | "female";
}

/** Read-only importer diagnostics for explaining why media was or wasn't imported. */
export interface ProviderDiagnosticMatch extends ProviderMatch {
  firstUrlExists?: boolean;
  status: "available" | "below-threshold" | "missing-female-url" | "no-remote-urls";
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
  /** Optional non-mutating diagnostic scan used by the dev importer report. */
  diagnose?(query: ProviderQuery, gender?: "male" | "female"): Promise<ProviderDiagnosticMatch[]>;
  /** Download the raw bytes for one URL of a chosen match. */
  fetchAsset(match: ProviderMatch, url: string): Promise<Uint8Array>;
}
