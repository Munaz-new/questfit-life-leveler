import type { MuscleGroup } from "@/lib/leveluplife/exercises/types";

/**
 * Stylized front/back body diagram. Muscle regions are abstract rounded
 * shapes (not anatomical), tuned to read clearly at small sizes and to
 * highlight cleanly when active. All paths use currentColor so the map
 * themes with the active mode automatically.
 */

interface Props {
  primary: MuscleGroup[];
  secondary?: MuscleGroup[];
  className?: string;
  showLabels?: boolean;
}

export function MuscleMap({ primary, secondary = [], className, showLabels }: Props) {
  const isPrimary = (m: MuscleGroup) => primary.includes(m) || primary.includes("full_body");
  const isSecondary = (m: MuscleGroup) => !isPrimary(m) && secondary.includes(m);
  const fill = (m: MuscleGroup) =>
    isPrimary(m)
      ? "fill-[var(--cyan-glow)] opacity-95"
      : isSecondary(m)
      ? "fill-[var(--rare)] opacity-60"
      : "fill-white/8";

  return (
    <div className={`flex items-center justify-center gap-4 ${className ?? ""}`}>
      <Figure label="Front" show={showLabels}>
        {/* head + neck */}
        <ellipse cx="60" cy="22" rx="14" ry="16" className="fill-white/8" />
        <rect x="52" y="36" width="16" height="10" rx="4" className={fill("neck")} />
        {/* shoulders */}
        <ellipse cx="36" cy="54" rx="12" ry="10" className={fill("delts_front")} />
        <ellipse cx="84" cy="54" rx="12" ry="10" className={fill("delts_front")} />
        {/* chest */}
        <path d="M40 56 Q60 50 80 56 L80 78 Q60 86 40 78 Z" className={fill("chest")} />
        {/* biceps */}
        <ellipse cx="26" cy="78" rx="8" ry="14" className={fill("biceps")} />
        <ellipse cx="94" cy="78" rx="8" ry="14" className={fill("biceps")} />
        {/* forearms */}
        <ellipse cx="22" cy="106" rx="7" ry="14" className={fill("forearms")} />
        <ellipse cx="98" cy="106" rx="7" ry="14" className={fill("forearms")} />
        {/* wrists */}
        <circle cx="20" cy="124" r="5" className={fill("wrists")} />
        <circle cx="100" cy="124" r="5" className={fill("wrists")} />
        {/* core */}
        <rect x="46" y="82" width="28" height="32" rx="6" className={fill("core")} />
        {/* obliques */}
        <path d="M40 82 L46 82 L46 114 L40 110 Z" className={fill("obliques")} />
        <path d="M80 82 L74 82 L74 114 L80 110 Z" className={fill("obliques")} />
        {/* hip flexors */}
        <rect x="46" y="116" width="12" height="10" rx="4" className={fill("hip_flexors")} />
        <rect x="62" y="116" width="12" height="10" rx="4" className={fill("hip_flexors")} />
        {/* quads */}
        <ellipse cx="50" cy="146" rx="9" ry="20" className={fill("quads")} />
        <ellipse cx="70" cy="146" rx="9" ry="20" className={fill("quads")} />
        {/* calves (front shins drawn faintly) */}
        <ellipse cx="50" cy="180" rx="7" ry="14" className="fill-white/6" />
        <ellipse cx="70" cy="180" rx="7" ry="14" className="fill-white/6" />
        {/* ankles */}
        <circle cx="50" cy="200" r="5" className={fill("ankles")} />
        <circle cx="70" cy="200" r="5" className={fill("ankles")} />
      </Figure>

      <Figure label="Back" show={showLabels}>
        {/* head + neck */}
        <ellipse cx="60" cy="22" rx="14" ry="16" className="fill-white/8" />
        <rect x="52" y="36" width="16" height="10" rx="4" className={fill("neck")} />
        {/* traps */}
        <path d="M40 44 Q60 36 80 44 L78 56 Q60 50 42 56 Z" className={fill("traps")} />
        {/* rear delts */}
        <ellipse cx="34" cy="56" rx="11" ry="9" className={fill("delts_rear")} />
        <ellipse cx="86" cy="56" rx="11" ry="9" className={fill("delts_rear")} />
        {/* side delts (peek) */}
        <circle cx="28" cy="50" r="6" className={fill("delts_side")} />
        <circle cx="92" cy="50" r="6" className={fill("delts_side")} />
        {/* upper back */}
        <rect x="42" y="58" width="36" height="18" rx="4" className={fill("upper_back")} />
        {/* lats */}
        <path d="M40 60 L46 96 L52 76 Z" className={fill("lats")} />
        <path d="M80 60 L74 96 L68 76 Z" className={fill("lats")} />
        {/* triceps */}
        <ellipse cx="26" cy="80" rx="8" ry="14" className={fill("triceps")} />
        <ellipse cx="94" cy="80" rx="8" ry="14" className={fill("triceps")} />
        {/* lower back */}
        <rect x="48" y="78" width="24" height="22" rx="4" className={fill("lower_back")} />
        {/* glutes */}
        <ellipse cx="50" cy="112" rx="11" ry="13" className={fill("glutes")} />
        <ellipse cx="70" cy="112" rx="11" ry="13" className={fill("glutes")} />
        {/* hamstrings */}
        <ellipse cx="50" cy="148" rx="9" ry="20" className={fill("hamstrings")} />
        <ellipse cx="70" cy="148" rx="9" ry="20" className={fill("hamstrings")} />
        {/* calves */}
        <ellipse cx="50" cy="182" rx="7" ry="14" className={fill("calves")} />
        <ellipse cx="70" cy="182" rx="7" ry="14" className={fill("calves")} />
      </Figure>
    </div>
  );
}

function Figure({ children, label, show }: { children: React.ReactNode; label: string; show?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 215" className="h-44 w-auto text-foreground">
        {children}
      </svg>
      {show && (
        <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      )}
    </div>
  );
}
