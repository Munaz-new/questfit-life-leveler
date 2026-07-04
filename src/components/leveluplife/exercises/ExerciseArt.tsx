import { ExerciseAsset } from "./ExerciseAsset";

/**
 * Thin compatibility wrapper kept for existing call sites. All resolution
 * now flows through the Asset Manager via <ExerciseAsset/>, which picks the
 * best available asset for the selected demonstrator and falls back silently.
 * The `animationUrl` prop is retained for backwards-compat but is no longer
 * needed — assets are resolved by exercise id.
 */
export function ExerciseArt({
  id,
  animated = false,
  className,
  animationUrl,
}: {
  id: string;
  animated?: boolean;
  className?: string;
  animationUrl?: string;
}) {
  void animationUrl;
  return <ExerciseAsset id={id} animated={animated} className={className} />;
}
