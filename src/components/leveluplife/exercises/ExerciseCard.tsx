import { Link } from "@tanstack/react-router";
import { Activity, ChevronRight, Dumbbell, Footprints, Star } from "lucide-react";
import { gymManeArtUrl } from "@/lib/leveluplife/exercises/gymmaneArt";
import type { Exercise } from "@/lib/leveluplife/exercises/types";

const equipmentLabels = {
  none: "Bodyweight",
  bands: "Resistance band",
  dumbbells: "Dumbbells",
  chair: "Chair",
  pullup: "Pull-up bar",
  barbell: "Barbell",
  cable: "Cable",
  machine: "Machine",
  kettlebell: "Kettlebell",
  rings: "Rings",
  weighted: "Weighted",
  other: "Other",
};

export function ExerciseCard({
  ex,
  favorite,
  onToggleFavorite,
}: {
  ex: Exercise;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  const art = gymManeArtUrl(ex.id, false);
  const Placeholder =
    ex.pattern === "cardio" ? Footprints : ex.pattern === "mobility" ? Activity : Dumbbell;
  return (
    <div className="flex items-center pr-2">
      <Link
        to="/exercises/$id"
        params={{ id: ex.id }}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 hover:bg-white/5"
      >
        <div className="flex size-[52px] shrink-0 items-center justify-center rounded-[15px] bg-white/5 text-[#d9a184]">
          {art ? (
            <img src={art} alt="" loading="lazy" className="size-11 object-contain" />
          ) : (
            <Placeholder className="size-6" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{ex.name}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {ex.gymMane?.equipment ?? equipmentLabels[ex.equipment]} · {ex.difficulty}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
      <button
        type="button"
        className="grid size-11 shrink-0 place-items-center rounded-xl text-[#d9a184] hover:bg-white/5"
        aria-label={`Favorite ${ex.name}`}
        aria-pressed={favorite}
        onClick={onToggleFavorite}
      >
        <Star className="size-5" fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
      </button>
    </div>
  );
}
