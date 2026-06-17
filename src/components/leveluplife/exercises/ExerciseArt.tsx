import { illustrationFor } from "./illustrations";

/**
 * Wrapper that resolves an exercise id to its illustration. Falls back
 * to a generic body silhouette if the registry has no entry. When the
 * exercise later gets a Lottie/Rive URL, we'll branch on that here.
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
  // Reserved: Lottie integration drops in here without touching call sites.
  void animationUrl;

  const Glyph = illustrationFor(id);
  return (
    <div className={`relative flex h-full w-full items-center justify-center ${className ?? ""}`}>
      {Glyph ? <Glyph animated={animated} /> : <Fallback />}
    </div>
  );
}

function Fallback() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full text-foreground/70" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
      <circle cx={50} cy={26} r={8} />
      <path d="M50 34 L50 74" />
      <path d="M50 44 L30 56 M50 44 L70 56" />
      <path d="M50 74 L34 94 M50 74 L66 94" />
    </svg>
  );
}
