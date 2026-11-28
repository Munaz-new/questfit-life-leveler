import { useState } from "react";
import { format, parseISO } from "date-fns";
import { GlassCard } from "@/components/leveluplife/Shell";
import { liftHistory, repRecords } from "@/lib/leveluplife/exercises/liftHistory";
import { useApp } from "@/lib/leveluplife/store";

export function LiftHistory({ exerciseId }: { exerciseId: string }) {
  const { state } = useApp();
  const [limit, setLimit] = useState(5);
  const history = liftHistory(state.workoutHistory, exerciseId);
  const records = repRecords(history);

  return (
    <GlassCard className="gym-panel mb-5 space-y-4">
      <h2 className="text-lg font-bold">Exercise history</h2>
      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Log a set in a workout to see your history here.
        </p>
      ) : (
        <>
          <section>
            <h3 className="mb-2 text-sm font-semibold">Rep records</h3>
            {records.length ? (
              <ul className="divide-y divide-border text-sm">
                {records.map(({ set, date }) => (
                  <li key={set.reps} className="flex justify-between gap-3 py-2">
                    <span>
                      {set.reps} {set.reps === 1 ? "rep" : "reps"}
                    </span>
                    <span className="text-right">
                      <strong>{set.weightKg} kg</strong>{" "}
                      <time dateTime={date} className="ml-2 text-xs text-muted-foreground">
                        {format(parseISO(date), "MMM d, yyyy")}
                      </time>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Enter reps and a load to set a record.
              </p>
            )}
          </section>
          <section>
            <h3 className="mb-2 text-sm font-semibold">Recent sessions</h3>
            <ol className="space-y-2">
              {history.slice(0, limit).map(({ name, date, sets }, index) => (
                <li key={index} className="rounded-xl bg-white/5 p-3 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-medium">{name}</span>
                    <time dateTime={date} className="text-muted-foreground">
                      {format(parseISO(date), "MMM d, yyyy")}
                    </time>
                  </div>
                  <ol className="mt-1 space-y-1 text-muted-foreground">
                    {sets.map((set, number) => (
                      <li key={number} className="flex flex-wrap gap-x-2">
                        <span>Set {number + 1}</span>
                        {set.reps !== undefined && <span>{set.reps} reps</span>}
                        {set.weightKg !== undefined && <span>{set.weightKg} kg</span>}
                        {set.reps === undefined && set.weightKg === undefined && (
                          <span>Completed</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
            {history.length > limit && (
              <button className="gym-pill mt-3" onClick={() => setLimit(limit + 5)}>
                Show more sessions
              </button>
            )}
          </section>
        </>
      )}
    </GlassCard>
  );
}
