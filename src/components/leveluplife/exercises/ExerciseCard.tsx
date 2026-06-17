import { Link } from "@tanstack/react-router";
import { ExerciseArt } from "./ExerciseArt";
import type { Exercise } from "@/lib/leveluplife/exercises/types";
import { Clock } from "lucide-react";

export function ExerciseCard({ ex }: { ex: Exercise }) {
  return (
    <Link
      to="/exercises/$id"
      params={{ id: ex.id }}
      className="glass group flex flex-col rounded-2xl p-3 transition hover:border-white/20"
    >
      <div className="relative mb-2 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/0 text-[var(--cyan-glow)]">
        <div className="h-3/4 w-3/4">
          <ExerciseArt id={ex.id} animated />
        </div>
      </div>
      <p className="truncate text-sm font-semibold">{ex.name}</p>
      <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
        {ex.primaryMuscles[0]?.replace("_", " ") ?? ex.pattern}
      </p>
      <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
        <Clock className="h-3 w-3" /> {Math.max(1, Math.round(ex.estDurationSec / 60))} min
      </p>
    </Link>
  );
}
