import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/workout")({
  head: () => ({ meta: [{ title: "Workout — LevelUp Life" }] }),
  component: () => <Outlet />,
});
