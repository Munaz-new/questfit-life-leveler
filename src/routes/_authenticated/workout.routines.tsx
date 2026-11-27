import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Play, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard, MobileFrame } from "@/components/leveluplife/Shell";
import { RoutineExport, RoutineLibrary } from "@/components/leveluplife/RoutineLibrary";
import { GymSchedule } from "@/components/leveluplife/GymSchedule";
import { EXERCISES } from "@/lib/leveluplife/exercises/library";
import { ROUTINE_MOVES } from "@/lib/leveluplife/engine/patterns";
import { parseTarget } from "@/lib/leveluplife/engine/xp";
import { useApp } from "@/lib/leveluplife/store";
import type { WorkoutRoutine } from "@/lib/leveluplife/types";

export const Route = createFileRoute("/_authenticated/workout/routines")({
  component: Routines,
  head: () => ({ meta: [{ title: "Gym routines — LevelUp Life" }] }),
});

const moveById = new Map(ROUTINE_MOVES.map((move) => [move.id, move]));
const selectClass = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";

function Routines() {
  const navigate = useNavigate();
  const { state, saveRoutine, deleteRoutine, startMission } = useApp();
  const [draft, setDraft] = useState<WorkoutRoutine | null>(null);

  function start(routine: WorkoutRoutine) {
    const main = routine.exercises.flatMap(({ id, target, rest }) => {
      const move = moveById.get(id);
      return move ? [{ ...move, reps: target, rest }] : [];
    });
    if (state.activeSession || !main.length) return;
    const duration = main.reduce((total, move) => {
      const target = parseTarget(move.reps);
      const seconds =
        target.kind === "time" ? target.seconds * (target.sets ?? 1) : target.sets * 30;
      return total + seconds + move.rest;
    }, 0);
    startMission({
      id: crypto.randomUUID(),
      protocolId: `routine-${routine.id}`,
      protocolName: routine.name,
      reason: "Your saved routine.",
      durationMin: Math.ceil(duration / 60),
      intensity: "moderate",
      warmup: [],
      main,
      cooldown: [],
    });
    navigate({ to: "/workout/play" });
  }

  return (
    <MobileFrame gym withNav>
      <header className="mb-6 flex items-center gap-3">
        <Link to="/workout" aria-label="Back to workout" className="gym-pill">
          <ArrowLeft size={19} />
        </Link>
        <h1 className="flex-1 text-2xl font-bold">Routines</h1>
        <RoutineExport routines={state.routines} />
      </header>
      {draft ? (
        <RoutineEditor
          key={draft.id}
          initial={draft}
          onCancel={() => setDraft(null)}
          onSave={(routine) => {
            saveRoutine(routine);
            setDraft(null);
          }}
        />
      ) : (
        <div className="mb-6 space-y-3">
          <GymSchedule onStart={start} />
          <h2 className="text-xs font-bold uppercase tracking-[.18em] text-[#aaa]">
            Your routines
          </h2>
          <Button
            className="gym-pill gym-primary w-full"
            onClick={() => setDraft({ id: crypto.randomUUID(), name: "", exercises: [] })}
          >
            <Plus className="h-4 w-4" /> New routine
          </Button>
          {state.activeSession && (
            <p className="text-sm text-muted-foreground">
              Finish your current workout to start a routine.
            </p>
          )}
          {state.routines.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Save exercises, sets, and rest times for a workout you repeat.
            </p>
          )}
          {state.routines.map((routine) => (
            <GlassCard key={routine.id}>
              <h2 className="text-lg font-semibold">{routine.name}</h2>
              <p className="mb-3 text-sm text-muted-foreground">
                {routine.exercises.length}{" "}
                {routine.exercises.length === 1 ? "exercise" : "exercises"}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button disabled={!!state.activeSession} onClick={() => start(routine)}>
                  <Play className="h-4 w-4" /> Start routine
                </Button>
                <Button variant="outline" onClick={() => setDraft(routine)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  aria-label={`Delete ${routine.name}`}
                  onClick={() => {
                    if (confirm(`Delete "${routine.name}"?`)) deleteRoutine(routine.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </GlassCard>
          ))}
          <RoutineLibrary onSave={saveRoutine} />
        </div>
      )}
      <Link className="gym-pill block text-center" to="/workout/tools">
        Training tools
      </Link>
    </MobileFrame>
  );
}

function RoutineEditor({
  initial,
  onCancel,
  onSave,
}: {
  initial: WorkoutRoutine;
  onCancel: () => void;
  onSave: (routine: WorkoutRoutine) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [exercises, setExercises] = useState(initial.exercises);
  const [selected, setSelected] = useState("");
  const needed = new Set(exercises.map(({ id }) => id));
  const choices = EXERCISES.filter(({ id }) => !needed.has(id));

  function addExercise() {
    const move = moveById.get(selected);
    if (!move || needed.has(move.id)) return;
    setExercises([...exercises, { id: move.id, target: move.reps, rest: Math.max(15, move.rest) }]);
    setSelected("");
  }

  function reorder(index: number, direction: -1 | 1) {
    const next = [...exercises];
    const destination = index + direction;
    [next[index], next[destination]] = [next[destination], next[index]];
    setExercises(next);
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (name.trim() && exercises.length && exercises.every(({ target }) => target.trim())) {
      onSave({ ...initial, name: name.trim(), exercises });
    }
  }

  return (
    <GlassCard className="mb-6">
      <form onSubmit={save} className="space-y-4">
        <label className="block space-y-1 text-sm">
          <span>Routine name</span>
          <Input
            required
            maxLength={64}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <div className="flex items-end gap-2">
          <label className="min-w-0 flex-1 space-y-1 text-sm">
            <span id="routine-exercise-label">Exercise</span>
            <select
              aria-labelledby="routine-exercise-label"
              className={selectClass}
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
            >
              <option value="">Choose an exercise</option>
              {choices.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <Button type="button" disabled={!selected} onClick={addExercise}>
            Add
          </Button>
        </div>
        {exercises.map((exercise, index) => (
          <fieldset key={exercise.id} className="space-y-2 rounded-xl border border-border p-3">
            <legend className="px-1 text-sm font-medium">
              {moveById.get(exercise.id)?.name ?? "Unavailable exercise"}
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1 text-xs">
                <span>Sets × reps or time</span>
                <Input
                  required
                  maxLength={24}
                  value={exercise.target}
                  onChange={(event) =>
                    setExercises(
                      exercises.map((item) =>
                        item.id === exercise.id ? { ...item, target: event.target.value } : item,
                      ),
                    )
                  }
                />
              </label>
              <label className="space-y-1 text-xs">
                <span>Rest in seconds</span>
                <Input
                  type="number"
                  required
                  min={15}
                  max={600}
                  value={Number.isNaN(exercise.rest) ? "" : exercise.rest}
                  onChange={(event) =>
                    setExercises(
                      exercises.map((item) =>
                        item.id === exercise.id
                          ? { ...item, rest: event.target.valueAsNumber }
                          : item,
                      ),
                    )
                  }
                />
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Move exercise up"
                disabled={index === 0}
                onClick={() => reorder(index, -1)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Move exercise down"
                disabled={index === exercises.length - 1}
                onClick={() => reorder(index, 1)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Remove exercise"
                onClick={() => setExercises(exercises.filter(({ id }) => id !== exercise.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </fieldset>
        ))}
        <div className="flex gap-2">
          <Button type="submit" disabled={!exercises.length}>
            Save routine
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
