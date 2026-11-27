import { useState } from "react";
import { gymManeArtUrl } from "@/lib/leveluplife/exercises/gymmaneArt";
import type { Exercise } from "@/lib/leveluplife/exercises/types";

export function ExerciseArt({
  exercise,
  showInstructions = false,
}: {
  exercise: Pick<Exercise, "id" | "name" | "instructions">;
  showInstructions?: boolean;
}) {
  const art = gymManeArtUrl(exercise.id);
  const [failedArt, setFailedArt] = useState<string>();

  if (art && failedArt !== art) {
    return (
      <div className="glass flex h-52 items-center justify-center rounded-2xl p-3">
        <img
          src={art}
          alt={`${exercise.name} movement illustration`}
          onError={() => setFailedArt(art)}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  if (!showInstructions || exercise.instructions.length === 0) return null;

  return (
    <section className="glass rounded-2xl p-4">
      <h2 className="mb-2 text-sm font-semibold">How to do it</h2>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
        {exercise.instructions.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
