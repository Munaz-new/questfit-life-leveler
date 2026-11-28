import type { CSSProperties, ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { useApp } from "@/lib/leveluplife/store";
import { Activity } from "lucide-react";
import { getMode, modeFor } from "@/lib/leveluplife/modes";

/**
 * MobileFrame is the single point where per-mode theming is injected.
 * Mode CSS variables override the base tokens in styles.css, so every
 * downstream component (XPBar, GlassCard, gradient buttons, BottomNav)
 * automatically re-themes when the user switches mode.
 */
export function MobileFrame({
  children,
  withNav = false,
  gym = false,
  previewMode,
}: {
  children: ReactNode;
  withNav?: boolean;
  gym?: boolean;
  previewMode?: Parameters<typeof getMode>[0];
}) {
  const { state } = useApp();
  const mode = previewMode ? getMode(previewMode) : modeFor(state.profile);
  const styleVars = mode.vars as CSSProperties;

  return (
    <div
      data-mode={mode.id}
      data-aesthetic={mode.aesthetic}
      style={styleVars}
      className={`quest-shell mode-root relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col overflow-hidden ${gym ? "gym-surface" : "transition-[background-image,color] duration-500"}`}
    >
      <header className="quest-mast"><span className="studio-brand"><Activity aria-hidden="true" /> QuestFit</span><span>{mode.label}</span></header>
      <main
        className={`relative flex-1 px-5 pt-6 ${withNav ? "pb-28" : "pb-6"}`}
      >
        {children}
      </main>
      {withNav && <BottomNav />}
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`glass rounded-[var(--radius)] p-5 ${glow ? "shadow-glow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-lg font-semibold tracking-tight">{children}</h2>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}
