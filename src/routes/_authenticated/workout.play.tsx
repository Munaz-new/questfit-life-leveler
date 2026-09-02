import { createFileRoute } from "@tanstack/react-router";
import { MobileFrame } from "@/components/leveluplife/Shell";
import { MissionPlayer } from "@/components/leveluplife/player/MissionPlayer";

export const Route = createFileRoute("/_authenticated/workout/play")({
  head: () => ({ meta: [{ title: "Mission — LevelUp Life" }] }),
  component: Play,
});

function Play() {
  return (
    <MobileFrame>
      <MissionPlayer />
    </MobileFrame>
  );
}
