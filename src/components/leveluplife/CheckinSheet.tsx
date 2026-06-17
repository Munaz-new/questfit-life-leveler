import { useState } from "react";
import type { Checkin } from "@/lib/leveluplife/types";
import { Button } from "@/components/ui/button";
import { GlassCard } from "./Shell";

interface Props {
  initialSitting: number;
  onSubmit: (c: Checkin, sittingHours: number) => void;
}

const TIMES: Checkin["timeMin"][] = [5, 10, 20, 40];
const ENERGY: Checkin["energy"][] = ["low", "med", "high"];
const STRESS: Checkin["stress"][] = ["low", "med", "high"];

export function CheckinSheet({ initialSitting, onSubmit }: Props) {
  const [energy, setEnergy] = useState<Checkin["energy"]>("med");
  const [timeMin, setTimeMin] = useState<Checkin["timeMin"]>(20);
  const [sore, setSore] = useState(false);
  const [stress, setStress] = useState<Checkin["stress"]>("low");
  const [sit, setSit] = useState(initialSitting);

  return (
    <div className="space-y-4">
      <header className="mb-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Daily check-in</p>
        <h1 className="text-2xl font-bold">Calibrating your session</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Four taps. Your protocol adapts to what's true today — not yesterday.
        </p>
      </header>

      <GlassCard className="space-y-5">
        <Row label="Energy">
          <Seg options={ENERGY} value={energy} onChange={setEnergy} />
        </Row>
        <Row label="Time available">
          <Seg
            options={TIMES}
            value={timeMin}
            onChange={setTimeMin}
            renderLabel={(v) => `${v} min`}
          />
        </Row>
        <Row label="Soreness">
          <Seg
            options={[false, true] as const}
            value={sore}
            onChange={setSore}
            renderLabel={(v) => (v ? "Yes" : "No")}
          />
        </Row>
        <Row label="Stress">
          <Seg options={STRESS} value={stress} onChange={setStress} />
        </Row>
        <Row label={`Hours sat today: ${sit}h`}>
          <input
            type="range"
            min={0}
            max={12}
            value={sit}
            onChange={(e) => setSit(Number(e.target.value))}
            className="w-full accent-[var(--cyan-glow)]"
          />
        </Row>
      </GlassCard>

      <Button
        onClick={() =>
          onSubmit({ date: "", energy, timeMin, sore, stress }, sit)
        }
        className="h-12 w-full rounded-2xl bg-gradient-primary font-semibold text-[var(--primary-foreground)] shadow-glow"
      >
        Generate my protocol
      </Button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Seg<T>({
  options,
  value,
  onChange,
  renderLabel,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  renderLabel?: (v: T) => string;
}) {
  return (
    <div className="flex gap-1.5 rounded-xl bg-white/5 p-1">
      {options.map((o, i) => {
        const active = o === value;
        return (
          <button
            key={i}
            onClick={() => onChange(o)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${
              active
                ? "bg-gradient-primary text-[var(--primary-foreground)] shadow-glow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {renderLabel ? renderLabel(o) : String(o)}
          </button>
        );
      })}
    </div>
  );
}
