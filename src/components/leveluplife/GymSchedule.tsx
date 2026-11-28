import { ChevronRight } from "lucide-react";
import { useApp } from "@/lib/leveluplife/store";
import type { WorkoutRoutine } from "@/lib/leveluplife/types";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function GymSchedule({ onStart }: { onStart: (routine: WorkoutRoutine) => void }) {
  const { state, setGymSchedule } = useApp();
  const { gymSchedule, routines, workoutHistory } = state;
  const { mode, week, rotation } = gymSchedule;
  const last = workoutHistory.find(
    (session) => !session.partial && session.protocolId.startsWith("routine-"),
  );
  const lastIndex = rotation.findIndex((id) => last?.protocolId === `routine-${id}`);
  const today = routines.find(
    ({ id }) =>
      id ===
      (mode === "fixed"
        ? week[(new Date().getDay() + 6) % 7]
        : rotation[(lastIndex + 1) % rotation.length]),
  );

  return (
    <section className="mb-7 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-[.18em] text-[#aaa]">Weekly plan</h2>
        <div className="flex rounded-full bg-[#292929] p-1 text-sm">
          {(["fixed", "rotation"] as const).map((value) => (
            <button
              key={value}
              className="gym-pill"
              aria-pressed={mode === value}
              onClick={() => setGymSchedule({ ...gymSchedule, mode: value })}
            >
              {value === "fixed" ? "Fixed week" : "Rotation"}
            </button>
          ))}
        </div>
      </div>
      <div className="gym-panel px-4 py-2">
        {mode === "fixed" ? (
          weekdays.map((day, index) => (
            <label key={day} className="flex min-h-12 items-center justify-between gap-3">
              <span>{day}</span>
              <span className="flex min-w-0 items-center gap-2 text-[#aaa]">
                <select
                  aria-label={`Routine for ${day}`}
                  value={week[index]}
                  className="min-w-0 bg-[#1c1c1c] text-right"
                  onChange={(event) =>
                    setGymSchedule({
                      ...gymSchedule,
                      week: week.map((id, i) => (i === index ? event.target.value : id)),
                    })
                  }
                >
                  <option value="">Rest day</option>
                  {routines.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="size-4" aria-hidden="true" />
              </span>
            </label>
          ))
        ) : (
          <div className="space-y-2 py-2">
            {rotation.map((id, index) => (
              <div key={id} className="flex items-center justify-between gap-2 py-2">
                <span>
                  {index + 1}. {routines.find((routine) => routine.id === id)?.name}
                </span>
                <button
                  className="gym-pill text-xs"
                  onClick={() =>
                    setGymSchedule({
                      ...gymSchedule,
                      rotation: rotation.filter((item) => item !== id),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <select
              aria-label="Add routine to rotation"
              value=""
              className="gym-pill w-full"
              onChange={(event) =>
                setGymSchedule({ ...gymSchedule, rotation: [...rotation, event.target.value] })
              }
            >
              <option value="" disabled>
                Add routine to rotation
              </option>
              {routines
                .filter(({ id }) => !rotation.includes(id))
                .map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
      {today && (
        <button
          className="gym-pill gym-primary w-full font-bold disabled:opacity-50"
          disabled={!!state.activeSession}
          onClick={() => onStart(today)}
        >
          Start {today.name}
        </button>
      )}
    </section>
  );
}
