import { assetUrl } from "@/lib/leveluplife/assets/assetManager";
import { useExerciseMedia } from "@/lib/leveluplife/assets/useExerciseMedia";
import { ImageOff } from "lucide-react";

/**
 * ExerciseAsset — the compact, non-interactive demonstration renderer used in
 * cards, the workout player and the dev dashboard. It shows the cover frame of
 * the best available media for the currently-selected demonstration gender via
 * the shared `useExerciseMedia` provider (single source of truth).
 *
 * Fallback is guaranteed: female→male media falls back automatically (with an
 * optional subtle note), and when nothing is imported a branded "coming soon"
 * card shows. The user never sees a broken image or a stick figure.
 */
export function ExerciseAsset({
  id,
  className,
  alt,
  showFallbackNote = false,
}: {
  id: string;
  animated?: boolean;
  className?: string;
  alt?: string;
  /** Render a subtle badge when the selected gender fell back to another. */
  showFallbackNote?: boolean;
}) {
  const media = useExerciseMedia(id);

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className ?? ""}`}
    >
      {media.cover ? (
        <img
          src={assetUrl(media.cover)}
          alt={alt ?? "Exercise demonstration"}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <ComingSoon />
      )}
      {showFallbackNote && media.isFallback && media.note && (
        <span className="absolute bottom-1 left-1 right-1 rounded-md bg-black/55 px-1.5 py-0.5 text-center text-[9px] font-medium uppercase tracking-[0.12em] text-white/85 backdrop-blur-sm">
          {media.note}
        </span>
      )}
    </div>
  );
}


/** Branded placeholder shown when no demonstration media exists yet. */
export function ComingSoon({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-white/5 to-white/0 text-center text-[var(--cyan-glow)]">
      <ImageOff className={compact ? "h-5 w-5 opacity-70" : "h-8 w-8 opacity-70"} aria-hidden />
      {!compact && (
        <p className="px-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Illustration coming soon
        </p>
      )}
    </div>
  );
}
