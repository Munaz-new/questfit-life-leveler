import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Logo } from "@/components/leveluplife/Logo";
import { MobileFrame } from "@/components/leveluplife/Shell";
import { useApp } from "@/lib/leveluplife/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LevelUp Life — Turn Your Real Life Into Character Progression" },
      { name: "description", content: "An adaptive home fitness system. Quests, XP, skills — built for your real life." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const { state } = useApp();

  useEffect(() => {
    const t = setTimeout(() => {
      if (state.onboarded) navigate({ to: "/home" });
      else navigate({ to: "/auth" });
    }, 1700);
    return () => clearTimeout(t);
  }, [navigate, state.onboarded]);

  return (
    <MobileFrame>
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center">
        <Logo size={112} />
        <div className="animate-float-up">
          <h1 className="text-3xl font-bold tracking-tight">
            LevelUp <span className="text-gradient">Life</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Turn your real life into character progression.
          </p>
        </div>
      </div>
    </MobileFrame>
  );
}
