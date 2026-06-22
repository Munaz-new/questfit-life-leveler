import { Wind } from "lucide-react";
import type { Exercise } from "@/lib/leveluplife/exercises/types";

/** Sensible breathing guidance derived from the movement pattern. */
const BY_PATTERN: Record<string, string> = {
  squat: "Inhale and brace as you lower. Exhale as you drive up to standing.",
  push: "Inhale as you lower under control. Exhale as you press away from the floor.",
  pull: "Exhale as you pull toward you. Inhale as you return with control.",
  hinge: "Inhale and brace at the top. Exhale as you stand and lock out the hips.",
  core: "Exhale slowly through the effort, keeping the ribs down and core braced.",
  mobility: "Breathe slow and deep — inhale to lengthen, exhale to settle deeper into range.",
  cardio: "Find a steady rhythm: breathe in through the nose, out through the mouth.",
};

export function breathingFor(ex: Exercise): string {
  return ex.breathing ?? BY_PATTERN[ex.pattern] ?? BY_PATTERN.mobility;
}

export function BreathingPattern({ ex }: { ex: Exercise }) {
  return (
    <p className="flex gap-2 text-sm">
      <Wind className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cyan-glow)]" aria-hidden />
      <span>{breathingFor(ex)}</span>
    </p>
  );
}
