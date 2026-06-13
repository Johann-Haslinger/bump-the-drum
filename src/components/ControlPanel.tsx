import { AnimatePresence, motion } from "framer-motion";
import type { AppMode, DrumSurface, MidiEvent } from "../types";

type ControlPanelProps = {
  events: MidiEvent[];
  inputName: string;
  learningSurfaceId: string | null;
  mode: AppMode;
  onAddSurface: () => void;
  onModeChange: (mode: AppMode) => void;
  onRemoveMidiMapping: () => void;
  onSelectSurface: (surfaceId: string) => void;
  onStartLearning: () => void;
  selectedSurface?: DrumSurface;
  selectedSurfaceId: string;
  surfaces: DrumSurface[];
  updateSurface: (surfaceId: string, updates: Partial<DrumSurface>) => void;
};

const primaryButtonClass =
  "rounded-xl bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300";
const secondaryButtonClass =
  "rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800";
const labelClass =
  "grid gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400";
const inputClass =
  "rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base font-medium text-slate-100 outline-none transition focus:border-cyan-400";

export function ControlPanel({
  events,
  inputName,
  learningSurfaceId,
  mode,
  onAddSurface,
  onModeChange,
  onRemoveMidiMapping,
  onSelectSurface,
  onStartLearning,
  selectedSurface,
  selectedSurfaceId,
  surfaces,
  updateSurface,
}: ControlPanelProps) {
  const isEditMode = mode === "edit";

  return (
    <motion.aside
      animate={
        isEditMode
          ? {
              bottom: 16,
              height: "calc(100vh - 32px)",
              left: 16,
              width: 320,
              x: 0,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderColor: "rgba(255, 255, 255, 0.1)",
            }
          : {
              bottom: 16,
              height: 64,
              left: "50%",
              width: 240,
              x: "-50%",
              backgroundColor: "rgba(255, 255, 255, 0)",
              borderColor: "rgba(255, 255, 255, 0)",
            }
      }
      className="fixed z-50 overflow-hidden rounded-3xl border  text-slate-100 shadow-2xl shadow-black/40 backdrop-blur-2xl"
      initial={false}
      transition={{ damping: 28, stiffness: 260, type: "spring" }}
    >
      <div
        className={
          isEditMode
            ? "flex h-full flex-col gap-6 overflow-y-auto p-3"
            : "flex h-full flex-col justify-end p-2"
        }
      >
        <ModeToggle mode={mode} onModeChange={onModeChange} />

        <AnimatePresence initial={false}>
          {isEditMode && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6"
              exit={{ opacity: 0, y: 12 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
            >
              <SurfaceList
                onAddSurface={onAddSurface}
                onSelectSurface={onSelectSurface}
                selectedSurfaceId={selectedSurfaceId}
                surfaces={surfaces}
              />

              {selectedSurface && (
                <SelectedSurfacePanel
                  learningSurfaceId={learningSurfaceId}
                  onRemoveMidiMapping={onRemoveMidiMapping}
                  onStartLearning={onStartLearning}
                  selectedSurface={selectedSurface}
                  updateSurface={updateSurface}
                />
              )}

              <MidiLog events={events} inputName={inputName} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}

function ModeToggle({
  mode,
  onModeChange,
}: {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}) {
  return (
    <div
      aria-label="App Modus"
      className="grid grid-cols-2 rounded-2xl border border-slate-800 bg-slate-900 p-1"
    >
      <button
        className={
          mode === "edit"
            ? "rounded-xl bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950 transition"
            : "rounded-xl px-3 py-2 text-sm font-bold text-slate-400 transition hover:text-slate-100"
        }
        onClick={() => onModeChange("edit")}
        type="button"
      >
        Edit
      </button>
      <button
        className={
          mode === "game"
            ? "rounded-xl bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950 transition"
            : "rounded-xl px-3 py-2 text-sm font-bold text-slate-400 transition hover:text-slate-100"
        }
        onClick={() => onModeChange("game")}
        type="button"
      >
        Game
      </button>
    </div>
  );
}

function SurfaceList({
  onAddSurface,
  onSelectSurface,
  selectedSurfaceId,
  surfaces,
}: {
  onAddSurface: () => void;
  onSelectSurface: (surfaceId: string) => void;
  selectedSurfaceId: string;
  surfaces: DrumSurface[];
}) {
  return (
    <section className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-2">
      <div className="flex items-center justify-between gap-3 px-2">
        <h2 className="text-lg font-bold">Flächen</h2>
        <button className={primaryButtonClass} onClick={onAddSurface} type="button">
          + Neu
        </button>
      </div>

      <div className="grid gap-2">
        {surfaces.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-700 p-3 text-sm text-slate-400">
            Noch keine Flächen. Lege die erste Drum-Fläche mit „+ Neu“ an.
          </p>
        )}

        {surfaces.map((surface) => (
          <button
            className={
              surface.id === selectedSurfaceId
                ? "grid gap-1 rounded-2xl border border-cyan-400 bg-cyan-400/10 p-3 text-left shadow-lg shadow-cyan-500/10"
                : "grid gap-1 rounded-2xl border border-slate-800 bg-slate-950 p-3 text-left transition hover:border-slate-600"
            }
            key={surface.id}
            onClick={() => onSelectSurface(surface.id)}
            type="button"
          >
            <span className="font-bold text-slate-100">{surface.name}</span>
            <small className="text-xs text-slate-400">
              {surface.midiNote === undefined
                ? "Kein MIDI"
                : `Ch ${surface.midiChannel} · Note ${surface.midiNote}`}
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}

function SelectedSurfacePanel({
  learningSurfaceId,
  onRemoveMidiMapping,
  onStartLearning,
  selectedSurface,
  updateSurface,
}: {
  learningSurfaceId: string | null;
  onRemoveMidiMapping: () => void;
  onStartLearning: () => void;
  selectedSurface: DrumSurface;
  updateSurface: (surfaceId: string, updates: Partial<DrumSurface>) => void;
}) {
  return (
    <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="text-lg font-bold">Auswahl</h2>
      <label className={labelClass}>
        Name
        <input
          className={inputClass}
          onChange={(event) =>
            updateSurface(selectedSurface.id, {
              name: event.target.value,
            })
          }
          value={selectedSurface.name}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className={labelClass}>
          X
          <input
            className={inputClass}
            onChange={(event) =>
              updateSurface(selectedSurface.id, {
                x: Number(event.target.value),
              })
            }
            type="number"
            value={Math.round(selectedSurface.x)}
          />
        </label>
        <label className={labelClass}>
          Y
          <input
            className={inputClass}
            onChange={(event) =>
              updateSurface(selectedSurface.id, {
                y: Number(event.target.value),
              })
            }
            type="number"
            value={Math.round(selectedSurface.y)}
          />
        </label>
        <label className={labelClass}>
          Größe
          <input
            className={inputClass}
            onChange={(event) =>
              updateSurface(selectedSurface.id, {
                height: Number(event.target.value),
                width: Number(event.target.value),
              })
            }
            type="number"
            value={Math.round(selectedSurface.width)}
          />
        </label>
        <label className={labelClass}>
          Rotation
          <input
            className={inputClass}
            onChange={(event) =>
              updateSurface(selectedSurface.id, {
                rotation: Number(event.target.value),
              })
            }
            type="number"
            value={Math.round(selectedSurface.rotation)}
          />
        </label>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
          MIDI
        </span>
        <strong className="text-sm text-slate-100">
          {selectedSurface.midiNote === undefined
            ? "Nicht zugeordnet"
            : `Channel ${selectedSurface.midiChannel}, Note ${selectedSurface.midiNote}`}
        </strong>
        <button className={primaryButtonClass} onClick={onStartLearning} type="button">
          {learningSurfaceId === selectedSurface.id
            ? "Warte auf Signal..."
            : "MIDI lernen"}
        </button>
        <button
          className={secondaryButtonClass}
          onClick={onRemoveMidiMapping}
          type="button"
        >
          Zuordnung löschen
        </button>
      </div>
    </section>
  );
}

function MidiLog({
  events,
  inputName,
}: {
  events: MidiEvent[];
  inputName: string;
}) {
  return (
    <section className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="text-lg font-bold">MIDI Input</h2>
      <p className="text-sm text-slate-400">{inputName}</p>
      <div className="grid max-h-36 gap-1 overflow-auto rounded-2xl bg-slate-950 p-3 font-mono text-xs text-slate-400">
        {events.length === 0 && <span>Noch keine MIDI Hits</span>}
        {events.map((event, index) => (
          <span key={`${event.time}-${event.note}-${event.velocity}-${index}`}>
            {event.time} · Ch {event.channel} · Note {event.note}
            {event.matchedSurfaceId ? " · Treffer" : ""}
          </span>
        ))}
      </div>
    </section>
  );
}
