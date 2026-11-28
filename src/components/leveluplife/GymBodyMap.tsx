import body from "@/lib/leveluplife/exercises/gymBody.json";

export type GymMuscle = keyof typeof body.fills;
export const gymMuscles = Object.keys(body.fills) as GymMuscle[];

export const gymMuscleGroups: Record<string, keyof typeof body.fills> = {
  biceps: "biceps",
  forearms: "forearm",
  chest: "chest",
  triceps: "triceps",
  core: "abdomen",
  obliques: "obliques",
  quads: "quads",
  delts_front: "shoulders",
  delts_side: "shoulders",
  delts_rear: "shoulders",
  calves: "calves",
  traps: "trapezius",
  upper_back: "back",
  lats: "back",
  lower_back: "lowerback",
  hamstrings: "hamstrings",
  glutes: "glutes",
};

export function GymBodyMap({
  muscleColor,
  selected,
  onSelect,
}: {
  muscleColor: (muscle: GymMuscle) => string;
  selected?: GymMuscle;
  onSelect?: (muscle: GymMuscle) => void;
}) {
  return (
    <svg
      viewBox="0 0 535 462"
      className="mx-auto w-full max-w-[380px]"
      role="img"
      aria-label="Front and back muscle map"
    >
      {body.base.map((path, i) => (
        <path key={i} d={path} fill="#313131" />
      ))}
      {body.trim.map((path, i) => (
        <path key={i} d={path} fill="#313131" />
      ))}
      {gymMuscles.map((muscle) => (
        <g
          key={muscle}
          className={onSelect ? "cursor-pointer" : undefined}
          onClick={onSelect && (() => onSelect(muscle))}
        >
          {body.fills[muscle].map((path, i) => (
            <path
              key={i}
              d={path}
              fill={muscleColor(muscle)}
              stroke={muscle === selected ? "#fff" : undefined}
              strokeWidth={muscle === selected ? 1.4 : undefined}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
