import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";


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
    navigate({ to: state.onboarded ? "/home" : "/auth", replace: true });
  }, [navigate, state.onboarded]);

  return <div role="status" className="studio studio-loading">Opening QuestFit…</div>;
}
