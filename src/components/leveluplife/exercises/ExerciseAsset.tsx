import { assetUrl, resolveGallery } from "@/lib/leveluplife/assets/assetManager";
import { useDemoGender } from "@/lib/leveluplife/assets/gender";
import { ImageOff } from "lucide-react";

/**
 * ExerciseAsset — the compact, non-interactive demonstration renderer used in
 * cards, the workout player and the dev dashboard. It shows the first frame of
 * the best available gallery for the currently-selected demonstration gender.
 *
 * Fallback is guaranteed: imported image → branded "coming soon" card. The
 * user never sees a broken image or a stick figure.
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
  const [gender] = useDemoGender();
  const gallery = resolveGallery(id, gender);

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className ?? ""}`}
    >
      {gallery ? (
        <img
          src={assetUrl(gallery.images[0])}
          alt={alt ?? "Exercise demonstration"}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <ComingSoon />
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
