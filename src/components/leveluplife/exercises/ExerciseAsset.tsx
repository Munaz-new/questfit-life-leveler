import { lazy, Suspense } from "react";
import { assetUrl, resolveBest } from "@/lib/leveluplife/assets/assetManager";
import { illustrationFor } from "./illustrations";
import placeholderUrl from "@/assets/exercise-library/placeholder.svg";

/**
 * ExerciseAsset — the format-agnostic demonstration renderer.
 *
 * The Workout Player and exercise pages render this and never care whether
 * the underlying asset is a Lottie, SVG, webp, GIF, video or (future) 3D
 * model. The Asset Manager decides the best available asset; this component
 * just draws it. Fallback is guaranteed: imported asset → inline SVG glyph
 * → branded placeholder. The user never sees a broken image.
 */

const LottieAsset = lazy(() => import("./LottieAsset"));

export function ExerciseAsset({
  id,
  animated = false,
  className,
}: {
  id: string;
  animated?: boolean;
  className?: string;
}) {
  const best = resolveBest(id);

  let inner: React.ReactNode;

  if (best) {
    const { ref } = best;
    switch (ref.format) {
      case "lottie":
        inner = (
          <Suspense fallback={<InlineOrPlaceholder id={id} animated={animated} />}>
            <LottieAsset url={ref.url} />
          </Suspense>
        );
        break;
      case "mp4":
        inner = (
          <video
            src={ref.url}
            className="h-full w-full object-contain"
            autoPlay={animated}
            muted
            loop
            playsInline
          />
        );
        break;
      case "svg":
      case "webp":
      case "png":
      case "jpg":
      case "gif":
        inner = (
          <img
            src={ref.url}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain"
          />
        );
        break;
      default:
        inner = <InlineOrPlaceholder id={id} animated={animated} />;
    }
  } else {
    inner = <InlineOrPlaceholder id={id} animated={animated} />;
  }

  return (
    <div className={`relative flex h-full w-full items-center justify-center ${className ?? ""}`}>
      {inner}
    </div>
  );
}

/** Inline built-in glyph if present, else the branded placeholder. */
function InlineOrPlaceholder({ id, animated }: { id: string; animated: boolean }) {
  const Glyph = illustrationFor(id);
  if (Glyph) return <Glyph animated={animated} />;
  return <img src={placeholderUrl} alt="" className="h-full w-full object-contain opacity-90" />;
}
