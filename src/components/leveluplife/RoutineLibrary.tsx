import { useState } from "react";
import { Download, Layers, Upload } from "lucide-react";
import { z } from "zod";
import { ROUTINE_MOVES } from "@/lib/leveluplife/engine/patterns";
import type { WorkoutRoutine } from "@/lib/leveluplife/types";

const item = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  target: z.string().trim().min(1).max(24).optional(),
  sets: z.number().int().min(1).max(100).optional(),
  reps: z.number().int().min(1).max(1000).optional(),
  rest: z.number().int().min(15).max(600).optional(),
});
const routine = z.object({
  name: z.string().trim().min(1).max(64),
  exercises: z.array(item).min(1).max(100),
});
const importSchema = z.union([
  routine.transform((value) => [value]),
  z.array(routine).min(1).max(100),
  z.object({ routines: z.array(routine).min(1).max(100) }).transform(({ routines }) => routines),
]);
const plans = [
  { name: "Full body gym", exercises: ["gym-squat", "gym-bench-press", "gym-seated-row"] },
  { name: "Bodyweight basics", exercises: ["squat-bw", "push-wall", "hinge-bridge"] },
];

const moves = new Map(ROUTINE_MOVES.map((move) => [move.id, move]));
const byName = new Map(ROUTINE_MOVES.map((move) => [move.name.toLowerCase(), move]));
function exerciseFor(move: (typeof ROUTINE_MOVES)[number]) {
  return { id: move.id, target: move.reps, rest: Math.max(15, move.rest) };
}

export function exportRoutines(routines: WorkoutRoutine[]) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify({ routines }, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "levelup-routines.json";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function RoutineLibrary({ onSave }: { onSave: (value: WorkoutRoutine) => void }) {
  const [editor, setEditor] = useState(false);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState("");

  function importRoutines() {
    try {
      const result = importSchema.parse(JSON.parse(text)).map(({ name, exercises }) => {
        const used = new Set<string>();
        const mapped = exercises.map((exercise) => {
          const move =
            moves.get(exercise.id ?? "") ?? byName.get(exercise.name?.trim().toLowerCase() ?? "");
          if (!move)
            throw new Error(`Exercise unavailable: ${exercise.name ?? exercise.id ?? "unknown"}`);
          if (used.has(move.id)) throw new Error(`Duplicate exercise: ${move.name}`);
          used.add(move.id);
          const defaults = exerciseFor(move);
          return {
            ...defaults,
            target:
              exercise.target ??
              (exercise.reps ? `${exercise.sets ?? 1} × ${exercise.reps}` : defaults.target),
            rest: exercise.rest ?? defaults.rest,
          };
        });
        return { id: crypto.randomUUID(), name, exercises: mapped };
      });
      result.forEach(onSave);
      setEditor(false);
      setText("");
      setFeedback(`Imported ${result.length} ${result.length === 1 ? "routine" : "routines"}.`);
    } catch (error) {
      setFeedback(
        error instanceof SyntaxError || error instanceof z.ZodError
          ? "Could not read that routine JSON."
          : error instanceof Error
            ? error.message
            : "Could not import routines.",
      );
    }
  }

  return (
    <div className="space-y-3">
      <details>
        <summary className="gym-pill flex cursor-pointer items-center justify-center gap-2 font-bold">
          <Layers size={18} /> Ready-made plans
        </summary>
        <div className="gym-panel mt-2 space-y-2 p-3">
          {plans.map((plan) => (
            <button
              key={plan.name}
              className="gym-pill w-full"
              onClick={() => {
                const exercises = plan.exercises.flatMap((id) => {
                  const move = moves.get(id);
                  return move ? [exerciseFor(move)] : [];
                });
                onSave({ id: crypto.randomUUID(), name: plan.name, exercises });
                setFeedback(`Added ${plan.name}.`);
              }}
            >
              {plan.name}
            </button>
          ))}
        </div>
      </details>
      <button
        className="gym-pill flex w-full items-center justify-center gap-2 font-bold"
        onClick={() => setEditor(!editor)}
      >
        <Download size={18} /> Import routines
      </button>
      {editor && (
        <div className="gym-panel space-y-3 p-3">
          <label className="block text-sm">
            <span>Routine JSON</span>
            <textarea
              className="mt-1 w-full rounded-xl border border-[#444] bg-[#111] p-2"
              rows={5}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </label>
          <button className="gym-pill gym-primary" disabled={!text.trim()} onClick={importRoutines}>
            Import JSON
          </button>
        </div>
      )}
      {feedback && (
        <p className="text-sm text-[#ddd]" role="status">
          {feedback}
        </p>
      )}
    </div>
  );
}

export function RoutineExport({ routines }: { routines: WorkoutRoutine[] }) {
  return (
    <button
      className="gym-pill disabled:opacity-40"
      aria-label="Export routines"
      disabled={!routines.length}
      onClick={() => exportRoutines(routines)}
    >
      <Upload size={19} />
    </button>
  );
}
