import type { UserProfile } from "../types";
import { filterMoves, type Equip, type Move, type Pattern } from "./patterns";
import type { ProtocolPlan } from "./selector";
import { exerciseById } from "../exercises/library";
import { scoreExercise } from "../exercises/recommend";

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

function rankAndPick(
  candidates: Move[],
  n: number,
  profile: UserProfile,
  recentIds: Set<string>,
): Move[] {
  if (!candidates.length) return [];
  const ranked = candidates
    .map((m) => {
      const ex = exerciseById(m.id);
      const score = ex ? scoreExercise(ex, profile, recentIds) : Math.random();
      return { m, score };
    })
    .sort((a, b) => b.score - a.score);

  // Prefer un-recent, fall back to full pool if dedupe starves us.
  const fresh = ranked.filter((r) => !recentIds.has(r.m.id));
  const pool = fresh.length >= n ? fresh : ranked;
  return pool.slice(0, n).map((r) => r.m);
}

export function buildSession(
  profile: UserProfile,
  plan: ProtocolPlan,
  lastMoves: string[] = [],
): Session {
  const skip = new Set(lastMoves);
  const equipment: Equip[] = (profile.equipment.length ? profile.equipment : ["none"]) as Equip[];
  const apartmentSafe = true;

  // ── warmup ────────────────────────────────────────────
  const warmup = WARMUP_IDS
    .map((id) =>
      filterMoves({ level: plan.level, equipment, apartmentSafe })
        .find((m) => m.id === id),
    )
    .filter((m): m is Move => Boolean(m))
    .slice(0, 2);

  // ── main block ────────────────────────────────────────
  const ratioEntries = Object.entries(plan.protocol.ratio) as [Pattern, number][];
  const totalWeight = ratioEntries.reduce((s, [, w]) => s + w, 0) || 1;
  const targetMoves = Math.max(3, Math.min(8, Math.round(plan.protocol.mainMin / 3)));

  const main: Move[] = [];
  for (const [pattern, weight] of ratioEntries) {
    const count = Math.max(0, Math.round((weight / totalWeight) * targetMoves));
    if (count === 0) continue;
    const candidates = filterMoves({ pattern, level: plan.level, equipment, apartmentSafe });
    if (!candidates.length) continue;
    main.push(...rankAndPick(candidates, count, profile, skip));
  }
  while (main.length > targetMoves) main.pop();
  if (main.length < 3) {
    const filler = filterMoves({ pattern: "mobility", level: plan.level, equipment, apartmentSafe });
    const used = new Set(main.map((m) => m.id));
    main.push(...rankAndPick(filler.filter((m) => !used.has(m.id)), 3 - main.length, profile, skip));
  }

  // ── cooldown ──────────────────────────────────────────
  const cooldown = COOLDOWN_IDS
    .map((id) =>
      filterMoves({ level: plan.level, equipment, apartmentSafe })
        .find((m) => m.id === id),
    )
    .filter((m): m is Move => Boolean(m));

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
