import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MobileFrame, GlassCard, SectionTitle } from "@/components/leveluplife/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PrivateImage } from "@/components/leveluplife/mirror/PrivateImage";
import { BeforeAfterSlider } from "@/components/leveluplife/mirror/BeforeAfterSlider";
import { toast } from "sonner";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import {
  ACHIEVEMENTS,
  MEASUREMENT_FIELDS,
  PHOTO_VIEWS,
  addMeasurement,
  deleteMeasurement,
  deletePhoto,
  ensureMirrorSettings,
  getCurrentUserId,
  listAchievements,
  listMeasurements,
  listPhotos,
  syncAchievements,
  uploadPhoto,
  type BodyMeasurement,
  type MeasurementInput,
  type PhotoView,
  type ProgressPhoto,
} from "@/lib/leveluplife/progressMirror";

export const Route = createFileRoute("/_authenticated/progress-mirror")({
  head: () => ({ meta: [{ title: "Progress Mirror — LevelUp Life" }] }),
  component: ProgressMirror,
});

type Tab = "timeline" | "photos" | "measurements" | "achievements";
const TABS: { id: Tab; label: string }[] = [
  { id: "timeline", label: "Timeline" },
  { id: "photos", label: "Photos" },
  { id: "measurements", label: "Measurements" },
  { id: "achievements", label: "Achievements" },
];

const PrivacyLine = () => (
  <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-muted-foreground">
    <ShieldCheck className="h-3.5 w-3.5 text-[var(--cyan-glow)]" />
    Your photos are private and visible only to you.
  </div>
);

function ProgressMirror() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("timeline");
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (uid: string) => {
    const [ph, ms, ach] = await Promise.all([
      listPhotos(uid),
      listMeasurements(uid),
      listAchievements(uid),
    ]);
    const unlockedSet = new Set(ach.map((a) => a.achievement_key));
    const fresh = await syncAchievements(uid, ph, unlockedSet);
    fresh.forEach((k) => unlockedSet.add(k));
    if (fresh.length) {
      const def = ACHIEVEMENTS.find((a) => a.key === fresh[0]);
      if (def) toast.success(`Achievement unlocked: ${def.title} ${def.emoji}`);
    }
    setPhotos(ph);
    setMeasurements(ms);
    setUnlocked(unlockedSet);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const uid = await getCurrentUserId();
      if (!active) return;
      setUserId(uid);
      if (uid) {
        await ensureMirrorSettings(uid);
        await refresh(uid);
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [refresh]);

  // ----- Not signed in: nudge -----
  if (userId === null) {
    return (
      <MobileFrame withNav>
        <Header onBack={() => navigate({ to: "/progress" })} />
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
            <Lock className="h-7 w-7 text-[var(--primary-foreground)]" />
          </div>
          <h2 className="mt-5 text-xl font-bold">Sign in to unlock Progress Mirror</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Your transformation photos need a secure private account. They are
            stored privately and visible only to you — never shared.
          </p>
          <Button
            onClick={() => navigate({ to: "/auth" })}
            className="mt-6 h-12 w-full max-w-xs rounded-2xl bg-gradient-primary font-semibold text-[var(--primary-foreground)] shadow-glow"
          >
            Sign in to continue
          </Button>
        </div>
      </MobileFrame>
    );
  }

  if (userId === undefined || loading) {
    return (
      <MobileFrame withNav>
        <Header onBack={() => navigate({ to: "/progress" })} />
        <div className="mt-10 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame withNav>
      <Header onBack={() => navigate({ to: "/progress" })} />
      <PrivacyLine />

      {/* Tabs */}
      <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition ${
              tab === t.id
                ? "bg-gradient-primary text-[var(--primary-foreground)] shadow-glow"
                : "glass border border-white/10 text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "timeline" && <TimelineTab photos={photos} />}
      {tab === "photos" && (
        <PhotosTab userId={userId} photos={photos} onChange={() => refresh(userId)} />
      )}
      {tab === "measurements" && (
        <MeasurementsTab
          userId={userId}
          measurements={measurements}
          onChange={() => refresh(userId)}
        />
      )}
      {tab === "achievements" && <AchievementsTab unlocked={unlocked} photos={photos} />}
    </MobileFrame>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <header className="mb-4 flex items-center gap-3">
      <button onClick={onBack} className="glass flex h-9 w-9 items-center justify-center rounded-full" aria-label="Back">
        <ArrowLeft className="h-4 w-4" />
      </button>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Private</p>
        <h1 className="text-xl font-bold">Progress Mirror</h1>
      </div>
    </header>
  );
}

// ---------- Timeline ----------
function relativeLabel(firstISO: string, takenISO: string) {
  const days = Math.round((+new Date(takenISO) - +new Date(firstISO)) / 86_400_000);
  if (days <= 0) return "Day 1";
  if (days < 7) return `Day ${days + 1}`;
  if (days < 30) return `Week ${Math.floor(days / 7) + 1}`;
  return `Month ${Math.floor(days / 30) + 1}`;
}

function TimelineTab({ photos }: { photos: ProgressPhoto[] }) {
  const [view, setView] = useState<PhotoView>("front");
  const inView = useMemo(
    () => photos.filter((p) => p.view === view).sort((a, b) => +new Date(a.taken_at) - +new Date(b.taken_at)),
    [photos, view],
  );
  const [beforeId, setBeforeId] = useState<string | null>(null);
  const [afterId, setAfterId] = useState<string | null>(null);

  useEffect(() => {
    if (inView.length >= 2) {
      setBeforeId(inView[0].id);
      setAfterId(inView[inView.length - 1].id);
    } else {
      setBeforeId(null);
      setAfterId(null);
    }
  }, [inView]);

  if (photos.length === 0) return <EmptyState label="No photos yet. Add your first one in the Photos tab to start your timeline." />;

  const before = inView.find((p) => p.id === beforeId);
  const after = inView.find((p) => p.id === afterId);
  const first = inView[0]?.taken_at;

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5">
        {PHOTO_VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
              view === v.id ? "bg-white/15 text-foreground" : "text-muted-foreground"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {before && after && before.id !== after.id ? (
        <div>
          <SectionTitle hint="drag to compare">Before / After</SectionTitle>
          <BeforeAfterSlider
            beforePath={before.storage_path}
            afterPath={after.storage_path}
            beforeLabel={relativeLabel(first, before.taken_at)}
            afterLabel={relativeLabel(first, after.taken_at)}
          />
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <PickRow label="Before" list={inView} value={beforeId} onChange={setBeforeId} first={first} />
            <PickRow label="After" list={inView} value={afterId} onChange={setAfterId} first={first} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Add at least two {PHOTO_VIEWS.find((v) => v.id === view)?.label.toLowerCase()} photos to compare.
        </p>
      )}

      <div>
        <SectionTitle>Timeline</SectionTitle>
        <div className="space-y-3">
          {inView.map((p) => (
            <div key={p.id} className="flex gap-3">
              <div className="w-16 shrink-0 pt-1 text-right">
                <p className="text-xs font-bold text-gradient">{relativeLabel(first, p.taken_at)}</p>
                <p className="text-[10px] text-muted-foreground">{p.taken_at.slice(0, 10)}</p>
              </div>
              <PrivateImage path={p.storage_path} className="h-28 w-24 rounded-xl object-cover" />
              {p.note && <p className="flex-1 pt-1 text-xs italic text-muted-foreground">"{p.note}"</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PickRow({
  label,
  list,
  value,
  onChange,
  first,
}: {
  label: string;
  list: ProgressPhoto[];
  value: string | null;
  onChange: (id: string) => void;
  first: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-muted-foreground">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-xs"
      >
        {list.map((p) => (
          <option key={p.id} value={p.id} className="bg-background">
            {relativeLabel(first, p.taken_at)} · {p.taken_at.slice(0, 10)}
          </option>
        ))}
      </select>
    </label>
  );
}

// ---------- Photos ----------
function PhotosTab({
  userId,
  photos,
  onChange,
}: {
  userId: string;
  photos: ProgressPhoto[];
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-5">
      <Button
        onClick={() => setOpen(true)}
        className="h-11 w-full rounded-2xl bg-gradient-primary font-semibold text-[var(--primary-foreground)] shadow-glow"
      >
        <Plus className="mr-1.5 h-4 w-4" /> Add progress photo
      </Button>

      {photos.length === 0 && <EmptyState label="No photos yet. Capture front, side, and back views to track your transformation." />}

      {PHOTO_VIEWS.map((v) => {
        const group = photos.filter((p) => p.view === v.id).sort((a, b) => +new Date(b.taken_at) - +new Date(a.taken_at));
        if (!group.length) return null;
        return (
          <div key={v.id}>
            <SectionTitle hint={`${group.length}`}>{v.label}</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {group.map((p) => (
                <div key={p.id} className="group relative overflow-hidden rounded-xl">
                  <PrivateImage path={p.storage_path} className="aspect-[3/4] w-full object-cover" />
                  <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1.5 py-0.5 text-[9px] text-white">
                    {p.taken_at.slice(0, 10)}
                  </span>
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this photo permanently?")) return;
                      await deletePhoto(userId, p);
                      onChange();
                    }}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {open && (
        <UploadSheet userId={userId} onClose={() => setOpen(false)} onDone={onChange} />
      )}
    </div>
  );
}

function UploadSheet({
  userId,
  onClose,
  onDone,
}: {
  userId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [view, setView] = useState<PhotoView>("front");
  const [takenAt, setTakenAt] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [pain, setPain] = useState(0);
  const [confidence, setConfidence] = useState(3);
  const [busy, setBusy] = useState(false);

  function pick(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function save() {
    if (!file) return toast.error("Choose a photo first");
    setBusy(true);
    try {
      await uploadPhoto(userId, file, {
        view,
        taken_at: new Date(takenAt + "T12:00:00").toISOString(),
        note: note || null,
        mood,
        energy,
        pain_level: pain,
        confidence,
      });
      toast.success("Photo saved privately");
      onDone();
      onClose();
    } catch (e) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3" onClick={onClose}>
      <div
        className="glass-strong max-h-[88vh] w-full max-w-[456px] overflow-y-auto rounded-3xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold">Add progress photo</h3>
        <p className="mb-4 text-[11px] text-muted-foreground">Private — only you can see this.</p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="flex aspect-[3/4] max-h-64 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/5"
        >
          {preview ? (
            <img src={preview} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <span className="mt-2 text-xs">Tap to choose a photo</span>
            </div>
          )}
        </button>

        <div className="mt-4 space-y-3">
          <div>
            <Label>View</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {PHOTO_VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`rounded-lg py-2 text-[11px] font-medium transition ${
                    view === v.id ? "bg-gradient-primary text-[var(--primary-foreground)]" : "glass border border-white/10"
                  }`}
                >
                  {v.label.replace(" View", "")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              className="h-11 rounded-xl border-white/10 bg-white/5"
            />
          </div>

          <SliderRow label="Mood" value={mood} onChange={setMood} />
          <SliderRow label="Energy" value={energy} onChange={setEnergy} />
          <SliderRow label="Pain" value={pain} onChange={setPain} min={0} />
          <SliderRow label="Confidence" value={confidence} onChange={setConfidence} />

          <div>
            <Label>Notes</Label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Today I completed my first full push-up…"
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onClose} className="glass h-11 rounded-xl border-white/10">
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={busy}
            className="h-11 rounded-xl bg-gradient-primary font-semibold text-[var(--primary-foreground)]"
          >
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Measurements ----------
function MeasurementsTab({
  userId,
  measurements,
  onChange,
}: {
  userId: string;
  measurements: BodyMeasurement[];
  onChange: () => void;
}) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  async function save() {
    const values: MeasurementInput = { measured_at: new Date(date + "T12:00:00").toISOString() };
    let any = false;
    for (const f of MEASUREMENT_FIELDS) {
      const raw = form[f.id as string];
      if (raw && raw.trim() !== "") {
        (values as Record<string, number>)[f.id as string] = Number(raw);
        any = true;
      }
    }
    if (!any) return toast.error("Enter at least one measurement");
    setBusy(true);
    try {
      await addMeasurement(userId, values);
      setForm({});
      toast.success("Measurement saved");
      onChange();
    } catch {
      toast.error("Could not save");
    } finally {
      setBusy(false);
    }
  }

  const latest = measurements[measurements.length - 1];

  return (
    <div className="space-y-5">
      <GlassCard>
        <SectionTitle hint="all optional">Add entry</SectionTitle>
        <div className="mb-3">
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 rounded-xl border-white/10 bg-white/5"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MEASUREMENT_FIELDS.map((f) => (
            <label key={f.id as string} className="block">
              <span className="mb-1 block text-[10px] text-muted-foreground">{f.label}</span>
              <Input
                inputMode="decimal"
                value={form[f.id as string] ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, [f.id as string]: e.target.value }))}
                placeholder={f.suffix}
                className="h-9 rounded-lg border-white/10 bg-white/5 text-sm"
              />
            </label>
          ))}
        </div>
        <Button
          onClick={save}
          disabled={busy}
          className="mt-4 h-11 w-full rounded-xl bg-gradient-primary font-semibold text-[var(--primary-foreground)]"
        >
          {busy ? "Saving…" : "Save measurement"}
        </Button>
      </GlassCard>

      {measurements.length === 0 ? (
        <EmptyState label="No measurements yet. Track what matters to you — everything is optional." />
      ) : (
        <div>
          <SectionTitle hint={`${measurements.length} entries`}>Trends</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {MEASUREMENT_FIELDS.map((f) => {
              const series = measurements
                .map((m) => m[f.id] as number | null)
                .filter((v): v is number => v != null);
              if (!series.length) return null;
              const firstVal = series[0];
              const lastVal = series[series.length - 1];
              const delta = lastVal - firstVal;
              return (
                <GlassCard key={f.id as string} className="!p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{f.label}</p>
                  <p className="mt-0.5 text-lg font-bold">
                    {latest?.[f.id] != null ? `${latest[f.id]}` : lastVal}
                    <span className="ml-1 text-[10px] text-muted-foreground">{f.suffix}</span>
                  </p>
                  {series.length > 1 && (
                    <p className={`text-[10px] ${delta < 0 ? "text-[var(--cyan-glow)]" : "text-muted-foreground"}`}>
                      {delta > 0 ? "+" : ""}
                      {delta.toFixed(1)} since start
                    </p>
                  )}
                </GlassCard>
              );
            })}
          </div>

          <SectionTitle>History</SectionTitle>
          <div className="space-y-2">
            {[...measurements].reverse().map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
                <span className="text-muted-foreground">{m.measured_at.slice(0, 10)}</span>
                <span className="flex-1 px-2 text-right">
                  {MEASUREMENT_FIELDS.filter((f) => m[f.id] != null)
                    .map((f) => `${f.label} ${m[f.id]}${f.suffix}`)
                    .join(" · ") || "—"}
                </span>
                <button
                  onClick={async () => {
                    await deleteMeasurement(userId, m.id);
                    onChange();
                  }}
                  className="ml-1 text-muted-foreground"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Achievements ----------
function AchievementsTab({ unlocked, photos }: { unlocked: Set<string>; photos: ProgressPhoto[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Milestones celebrate your consistency. {photos.length === 0 && "Add your first photo to begin."}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.has(a.key);
          return (
            <div
              key={a.key}
              className={`rounded-2xl border p-3.5 transition ${
                got ? "border-transparent bg-gradient-primary text-[var(--primary-foreground)] shadow-glow" : "glass border-white/10 opacity-70"
              }`}
            >
              <div className="text-2xl">{got ? a.emoji : "🔒"}</div>
              <p className="mt-2 text-sm font-bold leading-tight">{a.title}</p>
              <p className={`mt-0.5 text-[10px] leading-snug ${got ? "text-black/70" : "text-muted-foreground"}`}>
                {a.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- shared bits ----------
function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">{children}</span>;
}
function SliderRow({
  label,
  value,
  onChange,
  min = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span>{value}/5</span>
      </span>
      <input
        type="range"
        min={min}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full appearance-none rounded-full bg-white/5 accent-[oklch(0.82_0.18_215)]"
      />
    </label>
  );
}
function EmptyState({ label }: { label: string }) {
  return (
    <GlassCard className="flex flex-col items-center py-8 text-center">
      <Sparkles className="h-7 w-7 text-[var(--cyan-glow)]" />
      <p className="mt-3 max-w-xs text-sm text-muted-foreground">{label}</p>
    </GlassCard>
  );
}
