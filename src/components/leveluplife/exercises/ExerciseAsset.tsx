import { assetUrl } from "@/lib/leveluplife/assets/assetManager";
import { useExerciseMedia } from "@/lib/leveluplife/assets/useExerciseMedia";
import { ImageOff } from "lucide-react";

/**
 * ExerciseAsset — the compact, non-interactive demonstration renderer used in
 * cards, the workout player and the dev dashboard. It shows the cover frame of
 * the best available media for the currently-selected demonstration gender via
 * the shared `useExerciseMedia` provider (single source of truth).
 *
 * Fallback is silent and guaranteed: female→male media falls back automatically
 * with NO note/overlay/badge. The user never sees a broken image.
 */
export function ExerciseAsset({
  id,
  className,
  alt,
}: {
  id: string;
  animated?: boolean;
  className?: string;
  alt?: string;
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
        <UnavailableMedia />
      )}
    </div>
  );
}


/** Neutral branded fallback shown only when no real demonstration media exists. */
export function UnavailableMedia({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-white/5 to-white/0 text-center text-[var(--cyan-glow)]">
      <ImageOff className={compact ? "h-5 w-5 opacity-70" : "h-8 w-8 opacity-70"} aria-hidden />
      {!compact && (
        <p className="px-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Demonstration unavailable
        </p>
      )}
    </div>
  );
}

/** Back-compat export for older imports; render text remains neutral. */
export const ComingSoon = UnavailableMedia;
