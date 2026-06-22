import { useEffect, useState } from "react";
import { assetUrl, resolveGallery, hasGenderedAsset } from "@/lib/leveluplife/assets/assetManager";
import { useDemoGender } from "@/lib/leveluplife/assets/gender";
import { ComingSoon } from "./ExerciseAsset";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ZoomIn, Info } from "lucide-react";

/**
 * ExerciseDemo — the production demonstration centerpiece for an exercise.
 *
 * Renders a Male/Female toggle, a large hero image, and a step thumbnail strip
 * (Start → Movement → End → Return) with the active step highlighted. Tapping
 * the hero opens a zoomed view. Images are lazy-loaded with fixed aspect ratio
 * to avoid layout shift, and the next step is preloaded for instant stepping.
 */
export function ExerciseDemo({
  id,
  name,
  className,
}: {
  id: string;
  name: string;
  className?: string;
}) {
  const [gender, setGender] = useDemoGender();
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  const gallery = resolveGallery(id, gender);
  const images = gallery?.images ?? [];
  // Clamp active step if the gallery length changes (e.g. gender switch).
  const step = Math.min(active, Math.max(0, images.length - 1));

  // Preload the next step image for snappy stepping.
  useEffect(() => {
    const next = images[step + 1];
    if (next) {
      const img = new Image();
      img.src = assetUrl(next);
    }
  }, [step, images]);

  const trueGendered = hasGenderedAsset(id, gender);

  return (
    <div className={className}>
      {/* Gender toggle */}
      <div
        role="radiogroup"
        aria-label="Demonstration gender"
        className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 p-1"
      >
        {(["male", "female"] as const).map((g) => (
          <button
            key={g}
            role="radio"
            aria-checked={gender === g}
            onClick={() => {
              setGender(g);
              setActive(0);
            }}
            className={`min-h-9 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              gender === g
                ? "bg-gradient-primary text-[var(--primary-foreground)] shadow-glow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Hero */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0">
        {images.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => setZoom(true)}
              aria-label={`Zoom ${name} demonstration`}
              className="group h-full w-full"
            >
              <img
                key={assetUrl(images[step])}
                src={assetUrl(images[step])}
                alt={`${name} — ${images[step].stepLabel}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full animate-float-up object-cover"
              />
              <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition group-hover:bg-black/60">
                <ZoomIn className="h-4 w-4" aria-hidden />
              </span>
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
                Step {step + 1} · {images[step].stepLabel}
              </p>
            </div>
          </>
        ) : (
          <ComingSoon />
        )}
      </div>

      {/* Step strip */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActive(i)}
              aria-label={`Show step ${i + 1}: ${img.stepLabel}`}
              aria-current={i === step}
              className={`relative shrink-0 overflow-hidden rounded-xl border transition ${
                i === step
                  ? "border-[var(--cyan-glow)] shadow-glow"
                  : "border-white/10 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={assetUrl(img)}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-16 w-16 object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Provenance / gender-availability note */}
      {gallery && (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          {trueGendered
            ? "Demonstration always shows correct form."
            : "Gender-specific demonstrations are coming soon — showing the available set."}
        </p>
      )}

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-w-3xl border-white/10 bg-background p-2">
          <DialogTitle className="sr-only">{name} demonstration — enlarged</DialogTitle>
          {images.length > 0 && (
            <img
              src={assetUrl(images[step])}
              alt={`${name} — ${images[step].stepLabel}`}
              className="max-h-[80dvh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Avoid unused import warning when SSR strips Image usage.
const _ref = useRef;
void _ref;
