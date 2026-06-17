/* ────────────────────────────────────────────────────────────────────────
 * Per-exercise stick-figure illustrations. Every illustration is a small
 * SVG (viewBox 0 0 100 100) using currentColor so it themes automatically.
 * Subtle CSS-keyframe loops are scoped via the `[data-anim]` attribute.
 * ──────────────────────────────────────────────────────────────────── */

import type { CSSProperties, SVGProps } from "react";

type Glyph = (p: { animated?: boolean }) => JSX.Element;

const STROKE: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 100 100",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
};

// Helpful primitive: a head circle.
const Head = ({ cx, cy, r = 5 }: { cx: number; cy: number; r?: number }) => (
  <circle cx={cx} cy={cy} r={r} className="fill-[var(--cyan-glow)] stroke-[var(--cyan-glow)]" />
);

const ChairSquat: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-bob" : ""}`}>
    <Head cx={42} cy={24} />
    <path d="M42 30 L42 56" />
    <path d="M42 38 L30 46 M42 38 L54 44" />
    <path d="M42 56 L34 78 M42 56 L52 74" />
    <rect x={56} y={62} width={28} height={20} rx={2} />
  </svg>
);
const AssistedSquat: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-bob" : ""}`}>
    <Head cx={36} cy={22} />
    <path d="M36 28 L36 56" />
    <path d="M36 36 L62 30" /><path d="M62 22 L62 90" strokeDasharray="3 3" />
    <path d="M36 56 L28 80 M36 56 L46 80" />
  </svg>
);
const Squat: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-bob" : ""}`}>
    <Head cx={50} cy={22} />
    <path d="M50 28 L50 56" />
    <path d="M50 38 L36 38 M50 38 L64 38" />
    <path d="M50 56 L36 84 M50 56 L64 84" />
    <line x1={20} y1={92} x2={80} y2={92} />
  </svg>
);
const GobletSquat: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-bob" : ""}`}>
    <Head cx={50} cy={20} />
    <path d="M50 26 L50 54" />
    <rect x={42} y={32} width={16} height={12} rx={2} className="fill-[var(--rare)]/30" />
    <path d="M42 38 L34 30 M58 38 L66 30" />
    <path d="M50 54 L36 80 M50 54 L64 80" />
  </svg>
);
const SplitSquat: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-bob" : ""}`}>
    <Head cx={50} cy={20} />
    <path d="M50 26 L50 56" />
    <path d="M50 36 L38 38 M50 36 L60 28" />
    <path d="M50 56 L36 84" /><path d="M50 56 L72 70 L78 86" />
  </svg>
);
const Pistol: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-bob" : ""}`}>
    <Head cx={50} cy={22} />
    <path d="M50 28 L50 58" />
    <path d="M50 36 L72 40 M50 36 L32 32" />
    <path d="M50 58 L34 82" /><path d="M50 58 L88 56" />
  </svg>
);

const WallPush: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-push" : ""}`}>
    <line x1={90} y1={10} x2={90} y2={90} />
    <Head cx={42} cy={30} />
    <path d="M42 36 L42 78" />
    <path d="M42 44 L78 36 M42 44 L78 52" />
    <path d="M42 78 L34 92 M42 78 L52 92" />
  </svg>
);
const InclinePush: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-push" : ""}`}>
    <rect x={62} y={60} width={28} height={26} rx={2} />
    <Head cx={20} cy={52} />
    <path d="M24 52 L70 66" />
    <path d="M30 54 L42 70 M58 60 L48 76" />
  </svg>
);
const PushUp: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-push" : ""}`}>
    <line x1={10} y1={82} x2={90} y2={82} />
    <Head cx={20} cy={50} />
    <path d="M24 52 L80 64" />
    <path d="M30 54 L42 78 M68 60 L56 80" />
  </svg>
);
const DeclinePush: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-push" : ""}`}>
    <rect x={62} y={30} width={28} height={20} rx={2} />
    <Head cx={20} cy={68} />
    <path d="M24 66 L80 44" />
    <path d="M30 64 L42 82 M62 50 L48 82" />
  </svg>
);

const BandRow: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pull" : ""}`}>
    <line x1={10} y1={20} x2={10} y2={80} strokeDasharray="2 3" />
    <Head cx={60} cy={26} />
    <path d="M60 32 L60 78" />
    <path d="M60 40 L42 38 L18 36" />
    <path d="M60 40 L42 46 L18 50" />
    <path d="M60 78 L52 94 M60 78 L70 94" />
  </svg>
);
const TowelRow: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pull" : ""}`}>
    <line x1={88} y1={10} x2={88} y2={90} />
    <Head cx={42} cy={28} />
    <path d="M42 34 L52 80" />
    <path d="M42 42 L70 36 L86 30" />
    <path d="M52 80 L40 92 M52 80 L60 92" />
  </svg>
);
const DbRow: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pull" : ""}`}>
    <rect x={50} y={70} width={20} height={6} rx={1} />
    <Head cx={26} cy={36} />
    <path d="M30 38 L82 56" />
    <path d="M40 42 L42 76" />
    <rect x={20} y={60} width={10} height={10} rx={2} className="fill-[var(--rare)]/30" />
    <path d="M28 60 L28 50" />
  </svg>
);
const ScapPull: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pull" : ""}`}>
    <line x1={20} y1={16} x2={80} y2={16} />
    <Head cx={50} cy={32} />
    <path d="M40 18 L50 36 L60 18" />
    <path d="M50 36 L50 78" />
    <path d="M50 78 L40 94 M50 78 L60 94" />
  </svg>
);
const PullUp: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pull" : ""}`}>
    <line x1={20} y1={16} x2={80} y2={16} />
    <Head cx={50} cy={40} />
    <path d="M38 18 L50 44 L62 18" />
    <path d="M50 44 L50 80" />
    <path d="M50 80 L42 94 M50 80 L58 94" />
  </svg>
);

const Bridge: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-bob" : ""}`}>
    <line x1={10} y1={80} x2={90} y2={80} />
    <Head cx={18} cy={72} />
    <path d="M22 72 L60 50 L78 80" />
    <path d="M60 50 L78 60" />
  </svg>
);
const HingeDrill: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-hinge" : ""}`}>
    <Head cx={28} cy={28} />
    <path d="M30 32 L60 50" />
    <path d="M60 50 L60 90" />
    <path d="M34 36 L20 50 M34 36 L46 50" />
  </svg>
);
const RDL: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-hinge" : ""}`}>
    <Head cx={28} cy={26} />
    <path d="M30 30 L62 48" />
    <path d="M62 48 L60 90" />
    <rect x={18} y={64} width={10} height={6} rx={1} className="fill-[var(--rare)]/30" />
    <rect x={36} y={70} width={10} height={6} rx={1} className="fill-[var(--rare)]/30" />
    <path d="M34 36 L22 66 M40 40 L40 72" />
  </svg>
);
const SingleRDL: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-hinge" : ""}`}>
    <Head cx={26} cy={28} />
    <path d="M28 32 L62 50" />
    <path d="M62 50 L60 90" />
    <path d="M62 50 L86 36" />
    <path d="M32 36 L42 56" />
  </svg>
);

const DeadBug: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-deadbug" : ""}`}>
    <line x1={10} y1={70} x2={90} y2={70} />
    <Head cx={18} cy={62} />
    <path d="M22 64 L70 62" />
    <path d="M30 62 L30 36" /><path d="M50 62 L72 44" />
    <path d="M62 62 L62 36" /><path d="M40 62 L18 44" />
  </svg>
);
const BirdDog: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-birddog" : ""}`}>
    <line x1={10} y1={80} x2={90} y2={80} />
    <Head cx={20} cy={50} />
    <path d="M24 52 L74 50" />
    <path d="M34 52 L34 80 M64 52 L64 80" />
    <path d="M24 50 L8 36" /><path d="M74 50 L92 64" />
  </svg>
);
const Plank: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pulse-soft" : ""}`}>
    <line x1={10} y1={70} x2={90} y2={70} />
    <Head cx={20} cy={56} />
    <path d="M24 58 L82 64" />
    <path d="M24 58 L24 70 M82 64 L82 70" />
  </svg>
);
const SidePlank: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pulse-soft" : ""}`}>
    <line x1={10} y1={84} x2={90} y2={84} />
    <Head cx={20} cy={56} />
    <path d="M22 60 L82 78" />
    <path d="M22 60 L22 84" />
    <path d="M48 70 L48 30" />
  </svg>
);

const NeckCAR: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-spin-slow" : ""}`}>
    <circle cx={50} cy={42} r={14} className="fill-[var(--cyan-glow)]/15 stroke-[var(--cyan-glow)]" />
    <Head cx={50} cy={42} r={4} />
    <path d="M50 56 L50 88" />
    <path d="M50 64 L36 80 M50 64 L64 80" />
    <circle cx={50} cy={42} r={22} strokeDasharray="3 4" className="opacity-60" />
  </svg>
);
const Wrist: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-rotate" : ""}`}>
    <path d="M30 60 L60 60" />
    <path d="M60 60 L78 46" />
    <path d="M78 46 L86 40 M78 46 L82 56 M78 46 L72 38" />
    <circle cx={60} cy={60} r={6} className="fill-[var(--cyan-glow)]/20 stroke-[var(--cyan-glow)]" />
    <circle cx={60} cy={60} r={16} strokeDasharray="3 4" className="opacity-60" />
  </svg>
);
const Thoracic: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-rotate-tho" : ""}`}>
    <line x1={10} y1={80} x2={90} y2={80} />
    <Head cx={26} cy={50} />
    <path d="M30 54 L76 60" />
    <path d="M40 54 L40 80 M70 60 L70 80" />
    <path d="M58 56 L70 24" />
    <path d="M70 24 L62 18 M70 24 L78 22" />
  </svg>
);
const ShoulderDis: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-arc" : ""}`}>
    <Head cx={50} cy={28} />
    <path d="M50 34 L50 80" />
    <path d="M50 80 L40 94 M50 80 L60 94" />
    <path d="M14 22 Q50 8 86 22" strokeDasharray="2 3" />
    <line x1={14} y1={22} x2={86} y2={22} strokeWidth={3} className="text-[var(--rare)]" />
  </svg>
);
const HipFlexor: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pulse-soft" : ""}`}>
    <line x1={10} y1={84} x2={90} y2={84} />
    <Head cx={36} cy={24} />
    <path d="M36 30 L40 60" />
    <path d="M40 60 L72 60 L82 84" />
    <path d="M40 60 L20 84" />
    <path d="M36 38 L24 40 M36 38 L48 40" />
  </svg>
);
const Ankle: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-bob" : ""}`}>
    <line x1={80} y1={10} x2={80} y2={90} />
    <Head cx={36} cy={28} />
    <path d="M36 34 L40 60" />
    <path d="M40 60 L66 80" />
    <path d="M40 60 L18 84" />
    <line x1={62} y1={86} x2={78} y2={86} strokeWidth={3} />
  </svg>
);
const Hamstring: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pulse-soft" : ""}`}>
    <line x1={10} y1={82} x2={90} y2={82} />
    <Head cx={20} cy={74} />
    <path d="M24 74 L60 74" />
    <path d="M50 74 L80 34" />
    <path d="M60 74 L80 78" />
    <path d="M76 38 L84 32 M76 38 L80 28" />
  </svg>
);
const CatCow: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-catcow" : ""}`}>
    <line x1={10} y1={80} x2={90} y2={80} />
    <Head cx={20} cy={50} />
    <path d="M24 52 Q50 32 76 52" />
    <path d="M30 52 L30 80 M70 52 L70 80" />
  </svg>
);

const March: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-march" : ""}`}>
    <Head cx={50} cy={22} />
    <path d="M50 28 L50 64" />
    <path d="M50 36 L32 50 M50 36 L72 28" />
    <path d="M50 64 L40 92" />
    <path d="M50 64 L66 60 L70 86" />
  </svg>
);
const Walk: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-walk" : ""}`}>
    <Head cx={50} cy={22} />
    <path d="M50 28 L50 60" />
    <path d="M50 36 L36 44 M50 36 L66 28" />
    <path d="M50 60 L36 90" /><path d="M50 60 L64 86" />
    <line x1={20} y1={94} x2={80} y2={94} strokeDasharray="2 3" />
  </svg>
);

const WallAngels: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-angel" : ""}`}>
    <line x1={88} y1={10} x2={88} y2={90} />
    <Head cx={50} cy={28} />
    <path d="M50 34 L50 84" />
    <path d="M50 40 L30 30 L26 14" />
    <path d="M50 40 L72 30 L78 14" />
  </svg>
);
const ChinTuck: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-tuck" : ""}`}>
    <line x1={80} y1={10} x2={80} y2={90} />
    <Head cx={56} cy={30} />
    <path d="M56 36 L56 86" />
    <path d="M50 30 L36 30" strokeDasharray="2 3" />
    <path d="M46 26 L36 30 L46 34" />
  </svg>
);
const DoorwayPec: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pulse-soft" : ""}`}>
    <line x1={70} y1={10} x2={70} y2={90} />
    <Head cx={40} cy={26} />
    <path d="M40 32 L40 86" />
    <path d="M40 40 L70 30" />
    <path d="M40 40 L20 50" />
    <path d="M40 86 L30 96 M40 86 L50 96" />
  </svg>
);
const BookOpener: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-book" : ""}`}>
    <line x1={10} y1={82} x2={90} y2={82} />
    <Head cx={20} cy={68} />
    <path d="M24 70 L60 60" />
    <path d="M28 70 L40 82 M52 64 L46 82" />
    <path d="M60 60 L78 30" strokeDasharray="2 3" />
    <path d="M60 60 L86 56" />
  </svg>
);
const ChildPose: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pulse-soft" : ""}`}>
    <line x1={10} y1={84} x2={90} y2={84} />
    <path d="M16 84 Q44 56 60 64 Q74 70 84 84" />
    <Head cx={20} cy={78} r={4} />
    <path d="M22 78 L60 64" />
  </svg>
);
const Figure4: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pulse-soft" : ""}`}>
    <line x1={10} y1={84} x2={90} y2={84} />
    <Head cx={18} cy={76} />
    <path d="M22 78 L60 78" />
    <path d="M60 78 L50 56 L72 46" />
    <path d="M60 78 L82 56" />
  </svg>
);
const BoxBreath: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-breath" : ""}`}>
    <rect x={24} y={24} width={52} height={52} rx={4} className="stroke-[var(--cyan-glow)]" />
    <circle cx={24} cy={24} r={3.5} className="fill-[var(--cyan-glow)]" />
    <text x={50} y={56} textAnchor="middle" className="fill-[var(--cyan-glow)] text-[10px]" stroke="none">4·4·4·4</text>
  </svg>
);
const EyeRest: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pulse-soft" : ""}`}>
    <path d="M14 50 Q50 18 86 50 Q50 82 14 50 Z" className="stroke-[var(--cyan-glow)]" />
    <circle cx={50} cy={50} r={10} className="fill-[var(--cyan-glow)]/30 stroke-[var(--cyan-glow)]" />
    <circle cx={50} cy={50} r={4} className="fill-[var(--cyan-glow)]" />
  </svg>
);
const GlutePulse: Glyph = ({ animated }) => (
  <svg {...STROKE} className={`text-foreground/80 ${animated ? "anim-pulse" : ""}`}>
    <line x1={10} y1={84} x2={90} y2={84} />
    <Head cx={18} cy={74} />
    <path d="M22 76 L58 50 L80 84" />
    <path d="M58 50 L78 64" />
  </svg>
);

/** Registry: id → glyph. */
export const ILLUSTRATIONS: Record<string, Glyph> = {
  "squat-chair": ChairSquat,
  "squat-assisted": AssistedSquat,
  "squat-bw": Squat,
  "squat-goblet": GobletSquat,
  "squat-split": SplitSquat,
  "squat-pistol": Pistol,
  "push-wall": WallPush,
  "push-incline": InclinePush,
  "push-bw": PushUp,
  "push-decline": DeclinePush,
  "pull-band-row": BandRow,
  "pull-towel-row": TowelRow,
  "pull-db-row": DbRow,
  "pull-scap": ScapPull,
  "pull-pullup": PullUp,
  "hinge-bridge": Bridge,
  "hinge-drill": HingeDrill,
  "hinge-rdl-db": RDL,
  "hinge-single": SingleRDL,
  "core-deadbug": DeadBug,
  "core-birddog": BirdDog,
  "core-plank": Plank,
  "core-side": SidePlank,
  "mob-neck": NeckCAR,
  "mob-wrist": Wrist,
  "mob-thoracic": Thoracic,
  "mob-shoulder": ShoulderDis,
  "mob-hip": HipFlexor,
  "mob-ankle": Ankle,
  "mob-hams": Hamstring,
  "mob-catcow": CatCow,
  "cardio-march": March,
  "cardio-walk": Walk,
  "rec-wall-angels": WallAngels,
  "rec-chin-tuck": ChinTuck,
  "rec-doorway-pec": DoorwayPec,
  "rec-thoracic-rotation": BookOpener,
  "rec-childs-pose": ChildPose,
  "rec-figure4": Figure4,
  "rec-box-breath": BoxBreath,
  "rec-eye-rest": EyeRest,
  "rec-glute-activation": GlutePulse,
};

export function illustrationFor(id: string): Glyph | undefined {
  return ILLUSTRATIONS[id];
}

/** Inline keyframes — kept here so each glyph file is portable. */
export const ILLUSTRATION_STYLE: CSSProperties = {};
