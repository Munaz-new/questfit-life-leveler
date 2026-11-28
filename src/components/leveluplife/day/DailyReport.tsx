import { useState } from "react";
import { GlassCard } from "@/components/leveluplife/Shell";
import { dayVoice } from "@/lib/leveluplife/day/copy";
import type {
  EnergyReport,
  PhysicalReport,
  TimeBudget,
} from "@/lib/leveluplife/day/types";
import type { MotivationStyle } from "@/lib/leveluplife/types";
import { BatteryCharging, BatteryFull, BatteryMedium, BatteryWarning, type LucideIcon, BatteryLow, Clock, HeartPulse, Sparkles } from "lucide-react";

const ENERGY: { key: EnergyReport; label: string; Icon: LucideIcon }[] = [
  { key: "great", label: "Great", Icon: BatteryCharging },
  { key: "good", label: "Good", Icon: BatteryFull },
  { key: "okay", label: "Okay", Icon: BatteryMedium },
  { key: "low", label: "Low", Icon: BatteryLow },
  { key: "exhausted", label: "Exhausted", Icon: BatteryWarning },
];

const TIME: TimeBudget[] = [5, 10, 20, 30];

const PHYSICAL: { key: PhysicalReport; label: string; hint: string }[] = [
  { key: "ready", label: "Ready", hint: "Body feels good" },
  { key: "stiff", label: "Stiff", hint: "Tight, not painful" },
  { key: "sore", label: "Sore", hint: "Yesterday still hurts" },
  { key: "recovering", label: "Recovering", hint: "Ill or run down" },
];

export interface DailyReportValue {
  energy: EnergyReport;
  timeMin: TimeBudget;
  physical: PhysicalReport;
}

/**
 * The 10–15 second daily check-in. Three taps, no typing, no scrolling.
 * It never judges an answer — every combination produces a valid day.
 */
export function DailyReport({
  motivation,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  motivation: MotivationStyle | null | undefined;
  initial?: Partial<DailyReportValue>;
  submitLabel?: string;
  onSubmit: (v: DailyReportValue) => void;
  onCancel?: () => void;
}) {
  const voice = dayVoice(motivation);
  const [energy, setEnergy] = useState<EnergyReport | null>(initial?.energy ?? null);
  const [timeMin, setTimeMin] = useState<TimeBudget | null>(initial?.timeMin ?? null);
  const [physical, setPhysical] = useState<PhysicalReport | null>(initial?.physical ?? null);

  const ready = energy && timeMin && physical;

  return (
    <GlassCard glow className="mb-5">
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Takes about 15 seconds
        </p>
        <h2 className="mt-1 font-display text-xl font-bold">{voice.checkinTitle}</h2>
      </div>

      <Field icon={<BatteryLow className="h-3.5 w-3.5" />} label="Energy">
        <div className="flex flex-wrap gap-2">
          {ENERGY.map((e) => (
            <Chip key={e.key} active={energy === e.key} onClick={() => setEnergy(e.key)}>
              <e.Icon size={16} aria-hidden="true" className="mr-1 inline-block" />
              {e.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field icon={<Clock className="h-3.5 w-3.5" />} label="Time available">
        <div className="flex gap-2">
          {TIME.map((t) => (
            <Chip key={t} active={timeMin === t} onClick={() => setTimeMin(t)}>
              {t} min
            </Chip>
          ))}
        </div>
      </Field>

      <Field icon={<HeartPulse className="h-3.5 w-3.5" />} label="Body today">
        <div className="grid grid-cols-2 gap-2">
          {PHYSICAL.map((p) => (
            <button
              key={p.key}
              onClick={() => setPhysical(p.key)}
              className={`rounded-xl border p-2.5 text-left transition ${
                physical === p.key
                  ? "border-[var(--cyan-glow)] bg-[var(--cyan-glow)]/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <p className="text-sm font-semibold">{p.label}</p>
              <p className="text-[11px] text-muted-foreground">{p.hint}</p>
            </button>
          ))}
        </div>
      </Field>

      <div className="mt-5 flex gap-2">
        <button
          disabled={!ready}
          onClick={() =>
            ready && onSubmit({ energy: energy!, timeMin: timeMin!, physical: physical! })
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--cyan-glow)] py-3 text-sm font-semibold text-black transition disabled:opacity-40"
        >
          <Sparkles className="h-4 w-4" />
          {submitLabel ?? "Build my day"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-xl border border-white/10 px-4 text-sm text-muted-foreground transition hover:text-foreground"
          >
            Cancel
          </button>
        )}
      </div>
    </GlassCard>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-[var(--cyan-glow)] bg-[var(--cyan-glow)]/15 text-foreground"
          : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
