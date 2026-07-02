import { useEffect, useState } from "react";
import { assetUrl, resolveMedia } from "@/lib/leveluplife/assets/assetManager";
import { useDemoGender } from "@/lib/leveluplife/assets/gender";
import { useApp } from "@/lib/leveluplife/store";
import type { Gender } from "@/lib/leveluplife/assets/types";
import { ComingSoon } from "./ExerciseAsset";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ZoomIn, Info, Check, X } from "lucide-react";
import { toast } from "sonner";

/**
 * ExerciseDemo — the production demonstration centerpiece for an exercise.
 *
 * Renders a Male/Female toggle, a large hero image, and a step thumbnail strip
 * (Start → Movement → End → Return) with the active step highlighted. Tapping
 * the hero opens a zoomed view. Images are lazy-loaded with fixed aspect ratio
 * to avoid layout shift, and the next step is preloaded for instant stepping.
 *
 * Demonstrator selection has three layers:
 *   1. saved default (profile.gender, mirrored into the demoGender preference)
 *   2. a non-persistent per-exercise override (resets when leaving the page)
 * Switching to the OTHER demonstrator shows a small prompt:
 *   "Use only for this exercise" (keep override) vs "Make this my default".
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
  const [savedGender] = useDemoGender();
  const { setDemoGenderDefault } = useApp();
  // Per-exercise temporary override — dropped on unmount / id change.
  const [override, setOverride] = useState<Gender | null>(null);
  const [prompt, setPrompt] = useState(false);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  // Reset the temporary override when navigating to a different exercise.
  useEffect(() => {
    setOverride(null);
    setPrompt(false);
    setActive(0);
  }, [id]);

  const gender: Gender = override ?? savedGender;

  function pick(g: Gender) {
    setActive(0);
    if (g === savedGender) {
      // Switching back to the saved demonstrator — just clear the override.
      setOverride(null);
      setPrompt(false);
      return;
    }
    // Switched to the other demonstrator — preview it and ask what to do.
    setOverride(g);
    setPrompt(true);
  }

  const media = resolveMedia(id, gender);
  const images = media.images;
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

  const isFallback = media.isFallback;

  return (
    <div className={className}>
      {/* Gender toggle */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div
          role="radiogroup"
          aria-label="Demonstration gender"
          className="inline-flex rounded-full border border-white/10 bg-white/5 p-1"
        >
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              role="radio"
              aria-checked={gender === g}
              onClick={() => pick(g)}
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
        {override && !prompt && (
          <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Preview · this exercise only
          </span>
        )}
      </div>

      {/* Temporary-switch prompt */}
      {prompt && override && (
        <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-muted-foreground">
            Showing the <span className="font-semibold capitalize text-foreground">{override}</span>{" "}
            demonstrator. How should we apply this?
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button
              onClick={() => setPrompt(false)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/8 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-white/12"
            >
              <X className="h-3.5 w-3.5" /> Use only for this exercise
            </button>
            <button
              onClick={() => {
                setDemoGenderDefault(override);
                setOverride(null);
                setPrompt(false);
                toast.success(`${override[0].toUpperCase()}${override.slice(1)} set as your default`);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3 py-2 text-xs font-semibold text-[var(--primary-foreground)] shadow-glow"
            >
              <Check className="h-3.5 w-3.5" /> Make this my default
            </button>
          </div>
        </div>
      )}

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

