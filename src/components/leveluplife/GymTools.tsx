import { useState } from "react";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/leveluplife/Shell";

const plates = {
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
  lb: [45, 35, 25, 10, 5, 2.5, 1.25],
};
const defaultBar = { kg: 20, lb: 45 };

export function GymTools({ only }: { only: "max" | "plates" }) {
  const [unit, setUnit] = useState<keyof typeof plates>("kg");
  const [bar, setBar] = useState("20");
  const [target, setTarget] = useState("");
  const [load, setLoad] = useState("");
  const [reps, setReps] = useState("5");

  const barWeight = Number(bar);
  const targetWeight = Number(target);
  const validTarget =
    target !== "" &&
    bar !== "" &&
    barWeight >= 0 &&
    targetWeight >= barWeight &&
    targetWeight <= 2000;
  let remaining = validTarget ? (targetWeight - barWeight) / 2 : 0;
  const perSide = plates[unit].flatMap((plate) => {
    const count = Math.floor(remaining / plate);
    remaining -= count * plate;
    return count ? [`${count} × ${plate}`] : [];
  });
  const loaded = targetWeight - 2 * remaining;
  const lift = Number(load);
  const count = Number(reps);
  const validLift =
    lift > 0 && lift <= 2000 && Number.isInteger(count) && count >= 1 && count <= 12;
  const max = count === 1 ? lift : lift * (1 + count / 30);

  return (
    <GlassCard className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Training tools</h2>
        <label className="flex items-center gap-2 text-sm">
          Units
          <select
            className="rounded-lg border border-input bg-background px-2 py-1"
            value={unit}
            onChange={(event) => {
              const next = event.target.value === "lb" ? "lb" : "kg";
              setUnit(next);
              setBar(String(defaultBar[next]));
              setTarget("");
              setLoad("");
            }}
          >
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </label>
      </div>
      {only === "plates" && (
        <details open className="rounded-xl border border-border p-3">
          <summary className="cursor-pointer text-sm font-medium">Plate calculator</summary>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs">
              <span>Target weight ({unit})</span>
              <Input
                type="number"
                min={0}
                max={2000}
                step="any"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-xs">
              <span>Bar weight ({unit})</span>
              <Input
                type="number"
                min={0}
                max={2000}
                step="any"
                value={bar}
                onChange={(event) => setBar(event.target.value)}
              />
            </label>
          </div>
          <p className="mt-3 text-sm" aria-live="polite">
            {validTarget
              ? `${perSide.join(" + ") || "No plates"} per side · ${Number(loaded.toFixed(2))} ${unit} total`
              : "Enter a target at least as heavy as the bar."}
          </p>
          {validTarget && remaining > 0.00001 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Closest load below target with these plates.
            </p>
          )}
        </details>
      )}
      {only === "max" && (
        <details open className="rounded-xl border border-border p-3">
          <summary className="cursor-pointer text-sm font-medium">One-rep max estimator</summary>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs">
              <span>Weight lifted ({unit})</span>
              <Input
                type="number"
                min={0}
                max={2000}
                step="any"
                value={load}
                onChange={(event) => setLoad(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-xs">
              <span>Reps completed</span>
              <Input
                type="number"
                min={1}
                max={12}
                value={reps}
                onChange={(event) => setReps(event.target.value)}
              />
            </label>
          </div>
          <p className="mt-3 text-sm" aria-live="polite">
            {validLift
              ? `Estimated max: ${Number(max.toFixed(1))} ${unit}`
              : "Enter a weight and 1–12 reps."}
          </p>
        </details>
      )}
    </GlassCard>
  );
}
