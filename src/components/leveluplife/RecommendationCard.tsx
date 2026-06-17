import type { RecCard } from "@/lib/leveluplife/engine/messages";
import { GlassCard } from "./Shell";
import { Sparkles, Heart, Trophy, RefreshCw, ChevronRight } from "lucide-react";

const ICON = {
  info: Sparkles,
  recovery: Heart,
  celebrate: Trophy,
  restart: RefreshCw,
};

export function RecommendationCard({
  card,
  onCta,
}: {
  card: RecCard;
  onCta?: () => void;
}) {
  const Icon = ICON[card.tone];
  return (
    <GlassCard className="mb-5">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-rare shadow-rare">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{card.title}</p>
          <p className="text-sm leading-snug text-foreground/90">{card.body}</p>
          {card.cta && onCta && (
            <button
              onClick={onCta}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--cyan-glow)] hover:underline"
            >
              {card.cta} <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
