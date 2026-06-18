import { useRef, useState, type PointerEvent } from "react";
import { PrivateImage } from "./PrivateImage";

/**
 * Draggable before/after comparison slider for two progress photos.
 * `beforePath` is revealed on the left, `afterPath` on the right.
 */
export function BeforeAfterSlider({
  beforePath,
  afterPath,
  beforeLabel,
  afterLabel,
}: {
  beforePath: string;
  afterPath: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function move(clientX: number) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }

  function onDown(e: PointerEvent) {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    move(e.clientX);
  }
  function onMove(e: PointerEvent) {
    if (dragging.current) move(e.clientX);
  }
  function onUp() {
    dragging.current = false;
  }

  return (
    <div
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      className="relative aspect-[3/4] w-full touch-none select-none overflow-hidden rounded-2xl border border-white/10"
    >
      {/* After (full background) */}
      <PrivateImage path={afterPath} className="absolute inset-0 h-full w-full object-cover" />
      {afterLabel && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
          {afterLabel}
        </span>
      )}
      {/* Before (clipped to slider) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <PrivateImage
          path={beforePath}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {beforeLabel && (
          <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
            {beforeLabel}
          </span>
        )}
      </div>
      {/* Handle */}
      <div
        className="absolute top-0 bottom-0 z-10 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.6)]"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg">
          <span className="text-xs font-bold">↔</span>
        </div>
      </div>
    </div>
  );
}
