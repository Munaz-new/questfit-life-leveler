import { createFileRoute, Link } from "@tanstack/react-router";
import { addDays, addMonths, format, startOfMonth, startOfWeek, isSameMonth } from "date-fns";
import { ArrowLeft, ChevronLeft, ChevronRight, List, Plus } from "lucide-react";
import { useState } from "react";
import { MobileFrame } from "@/components/leveluplife/Shell";
import { useApp } from "@/lib/leveluplife/store";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({ meta: [{ title: "Journal — LevelUp Life" }] }),
  component: Journal,
});

const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

function Journal() {
  const { state, saveJournalNote } = useApp();
  const [selected, setSelected] = useState(() => new Date());
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [draft, setDraft] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const notes = state.journalNotes;
  const key = dateKey(selected);
  const note = notes[key];
  const entries = Object.keys(notes)
    .filter((date) => date.startsWith(format(month, "yyyy-MM")))
    .sort();
  const start = startOfWeek(month, { weekStartsOn: 1 });
  function select(date: Date) {
    setSelected(date);
    setDraft(null);
  }
  function changeMonth(delta: number) {
    const next = addMonths(month, delta);
    setMonth(next);
    select(next);
  }

  return (
    <MobileFrame gym>
      <header className="mb-5 flex items-center gap-3">
        <Link
          to="/progress"
          aria-label="Back to Progress"
          className="gym-pill grid place-items-center"
        >
          <ArrowLeft size={19} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-sm text-[#aaa]">
            {entries.length ? `${entries.length} notes this month` : "No notes this month"}
          </p>
        </div>
        <button
          className="gym-pill gym-primary"
          aria-label="Add note"
          onClick={() => setDraft(note ?? "")}
        >
          <Plus size={18} />
        </button>
        <button
          className="gym-pill"
          aria-label="Show monthly notes"
          aria-pressed={showList}
          onClick={() => setShowList(!showList)}
        >
          <List size={18} />
        </button>
      </header>
      <section className="gym-panel space-y-4 border border-[#3c3c3c] p-3 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <button className="gym-pill" aria-label="Previous month" onClick={() => changeMonth(-1)}>
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-bold">{format(month, "MMMM yyyy")}</h2>
          <button className="gym-pill" aria-label="Next month" onClick={() => changeMonth(1)}>
            <ChevronRight size={18} />
          </button>
        </div>
        {showList ? (
          <ul className="space-y-2">
            {entries.length === 0 && (
              <li className="p-3 text-sm text-[#aaa]">No notes this month.</li>
            )}
            {entries.map((date) => (
              <li key={date}>
                <button
                  className="gym-pill w-full truncate text-left"
                  onClick={() => {
                    select(new Date(date + "T12:00:00"));
                    setShowList(false);
                  }}
                >
                  {date} · {notes[date]}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
              <span className="py-2 text-[#aaa]" key={i}>
                {day}
              </span>
            ))}
            {Array.from({ length: 42 }, (_, i) => {
              const date = addDays(start, i);
              const cell = dateKey(date);
              return isSameMonth(date, month) ? (
                <button
                  key={cell}
                  aria-label={format(date, "MMMM d, yyyy")}
                  aria-pressed={cell === key}
                  className="relative min-h-11 rounded-xl border border-transparent text-[#aaa] aria-pressed:border-white aria-pressed:bg-[#333] aria-pressed:text-white"
                  onClick={() => select(date)}
                >
                  {date.getDate()}{" "}
                  {notes[cell] && (
                    <span className="absolute bottom-1 left-1/2 size-1 rounded-full bg-[#d9a184]" />
                  )}
                </button>
              ) : (
                <span key={cell} />
              );
            })}
          </div>
        )}
      </section>
      <div className="my-5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[#aaa]">{format(selected, "EEEE, MMM d, yyyy")}</p>
        <button className="gym-pill text-sm" onClick={() => setDraft(note ?? "")}>
          Note on this day
        </button>
      </div>
      {draft === null ? (
        <p className="gym-panel whitespace-pre-wrap break-words p-5 text-sm text-[#aaa]">
          {note ?? "Nothing written on this day"}
        </p>
      ) : (
        <form
          className="gym-panel space-y-3 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveJournalNote(key, draft);
            setDraft(null);
          }}
        >
          <textarea
            aria-label="Journal note"
            maxLength={4000}
            autoFocus
            rows={5}
            value={draft}
            className="w-full rounded-xl border border-[#444] bg-[#111] p-3"
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="flex gap-2">
            <button className="gym-pill gym-primary font-bold">Save note</button>
            <button type="button" className="gym-pill" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </MobileFrame>
  );
}
