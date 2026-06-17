import type { UserProfile } from "../types";
import { filterMoves, type Equip, type Move, type Pattern } from "./patterns";
import type { ProtocolPlan } from "./selector";

export interface Session {
  id: string;
  protocolId: string;
  protocolName: string;
  reason: string;
  durationMin: number;
  intensity: "low" | "moderate" | "high";
  warmup: Move[];
  main: Move[];
  cooldown: Move[];
}

const WARMUP_IDS = ["mob-catcow", "mob-thoracic", "mob-hip"];
const COOLDOWN_IDS = ["mob-hams", "mob-neck"];

function pick<T>(arr: T[], n: number, seedSkip: Set<string>, idOf: (t: T) => string): T[] {
  const fresh = arr.filter((x) => !seedSkip.has(idOf(x)));
  const pool = fresh.length >= n ? fresh : arr; // fall back if dedupe starves us
  // shuffle deterministically-ish via random sort (fine for variety)
  const sorted = [...pool].sort(() => Math.random() - 0.5);
  return sorted.slice(0, n);
}

export function buildSession(
  profile: UserProfile,
  plan: ProtocolPlan,
  lastMoves: string[] = [],
): Session {
  const skip = new Set(lastMoves);
  const equipment: Equip[] = (profile.equipment.length ? profile.equipment : ["none"]) as Equip[];
  // Apartment-safe is the default; we could expose an opt-out later.
  const apartmentSafe = true;

  // ── pick warmup ──────────────────────────────────────────
  const warmup = WARMUP_IDS
    .map((id) =>
      filterMoves({ level: plan.level, equipment, apartmentSafe })
        .find((m) => m.id === id),
    )
    .filter((m): m is Move => Boolean(m))
    .slice(0, 2);

  // ── pick main block from the protocol ratio ─────────────
  const ratioEntries = Object.entries(plan.protocol.ratio) as [Pattern, number][];
  const totalWeight = ratioEntries.reduce((s, [, w]) => s + w, 0) || 1;

  // Roughly 1 move per ~3 minutes of main budget; min 3, max 8.
  const targetMoves = Math.max(3, Math.min(8, Math.round(plan.protocol.mainMin / 3)));

  const main: Move[] = [];
  for (const [pattern, weight] of ratioEntries) {
    const count = Math.max(0, Math.round((weight / totalWeight) * targetMoves));
    if (count === 0) continue;
    const candidates = filterMoves({ pattern, level: plan.level, equipment, apartmentSafe });
    if (!candidates.length) continue;
    main.push(...pick(candidates, count, skip, (m) => m.id));
  }
  // Trim/pad to target.
  while (main.length > targetMoves) main.pop();
  if (main.length < 3) {
    const filler = filterMoves({ pattern: "mobility", level: plan.level, equipment, apartmentSafe });
    main.push(...pick(filler, 3 - main.length, new Set(main.map((m) => m.id)), (m) => m.id));
  }

  // ── cooldown ────────────────────────────────────────────
  const cooldown = COOLDOWN_IDS
    .map((id) =>
      filterMoves({ level: plan.level, equipment, apartmentSafe })
        .find((m) => m.id === id),
    )
    .filter((m): m is Move => Boolean(m));

  // Tone down rep volume for low-intensity protocols.
  const main2 = plan.protocol.intensity === "low"
    ? main.map((m) => ({ ...m, rest: Math.max(15, Math.round(m.rest * 0.7)) }))
    : main;

  return {
    id: `sess-${Date.now()}`,
    protocolId: plan.protocol.id,
    protocolName: plan.protocol.name,
    reason: plan.reason,
    durationMin: plan.timeMin,
    intensity: plan.protocol.intensity,
    warmup,
    main: main2,
    cooldown,
  };
}

export function sessionToMoves(s: Session): Move[] {
  return [...s.warmup, ...s.main, ...s.cooldown];
}
