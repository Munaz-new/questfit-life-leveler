import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, CircleDot, Dumbbell, Ruler, Scale } from "lucide-react";
import { useState } from "react";
import { MobileFrame } from "@/components/leveluplife/Shell";
import { GymTools } from "@/components/leveluplife/GymTools";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/workout/tools")({
  head: () => ({ meta: [{ title: "Tools — LevelUp Life" }] }),
  component: Tools,
});

const tools = [
  {
    id: "max",
    name: "1RM",
    description: "Estimated one-rep max",
    Icon: Dumbbell,
    color: "#d9a184",
  },
  { id: "bmi", name: "BMI", description: "Body mass index", Icon: Scale, color: "#a3c398" },
  { id: "ffmi", name: "FFMI", description: "Fat-free mass index", Icon: Ruler, color: "#d9bb89" },
  {
    id: "plates",
    name: "Plates",
    description: "Barbell plate calculator",
    Icon: CircleDot,
    color: "#93b5d5",
  },
  { id: "warmup", name: "Warm-up", description: "Ramp-up sets", Icon: BarChart3, color: "#d9a184" },
] as const;

function Tools() {
  const [selected, setSelected] = useState<(typeof tools)[number]>();
  return (
    <MobileFrame gym>
      <header className="mb-6 flex items-center gap-3">
        {selected ? (
          <button
            className="gym-pill"
            aria-label="All tools"
            onClick={() => setSelected(undefined)}
          >
            <ArrowLeft size={19} />
          </button>
        ) : (
          <Link to="/workout/routines" aria-label="Back to routines" className="gym-pill">
            <ArrowLeft size={19} />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold">{selected?.name ?? "Tools"}</h1>
          <p className="text-sm text-[#aaa]">
            {selected?.description ?? `${tools.length} training calculators`}
          </p>
        </div>
      </header>
      {selected ? (
        selected.id === "max" || selected.id === "plates" ? (
          <GymTools key={selected.id} only={selected.id} />
        ) : (
          <MetricTool key={selected.id} tool={selected.id} />
        )
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {tools.map(({ Icon, ...tool }) => (
            <button
              key={tool.id}
              className="gym-panel min-h-36 space-y-2 p-4 text-left"
              onClick={() => setSelected({ Icon, ...tool })}
            >
              <Icon className="mb-2 size-10" style={{ color: tool.color }} aria-hidden="true" />
              <span className="block text-lg font-bold">{tool.name}</span>
              <span className="block text-sm text-[#aaa]">{tool.description}</span>
            </button>
          ))}
        </div>
      )}
    </MobileFrame>
  );
}

function MetricTool({ tool }: { tool: "bmi" | "ffmi" | "warmup" }) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [fat, setFat] = useState("");
  const kg = Number(weight);
  const cm = Number(height);
  const percent = Number(fat);
  const valid = kg > 0 && kg <= 600 && (tool === "warmup" || (cm > 0 && cm <= 300));
  const index = kg / (cm / 100) ** 2;
  const estimate = tool === "ffmi" ? index * (1 - percent / 100) : index;
  return (
    <section className="gym-panel space-y-3 p-5">
      <label className="block space-y-1">
        <span>{tool === "warmup" ? "Working weight" : "Weight"} (kg)</span>
        <Input
          type="number"
          min={0}
          max={600}
          step="any"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
        />
      </label>
      {tool !== "warmup" && (
        <label className="block space-y-1">
          <span>Height (cm)</span>
          <Input
            type="number"
            min={0}
            max={300}
            step="any"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
          />
        </label>
      )}
      {tool === "ffmi" && (
        <label className="block space-y-1">
          <span>Body fat (%)</span>
          <Input
            type="number"
            min={0}
            max={99}
            step="any"
            value={fat}
            onChange={(event) => setFat(event.target.value)}
          />
        </label>
      )}
      {valid && tool === "warmup" && (
        <ul className="space-y-1">
          {[0.4, 0.6, 0.8].map((part) => (
            <li key={part}>
              {part * 100}% · {Number((kg * part).toFixed(1))} kg
            </li>
          ))}
        </ul>
      )}
      {valid &&
        tool !== "warmup" &&
        (tool !== "ffmi" || (fat !== "" && percent >= 0 && percent < 100)) && (
          <output className="block text-xl font-bold">
            {tool.toUpperCase()} {estimate.toFixed(1)}
          </output>
        )}
    </section>
  );
}
