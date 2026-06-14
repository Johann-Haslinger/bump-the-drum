import type { DrumSurface } from "../../types";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./styles";

export function SelectedSurfacePanel({
  learningSurfaceId,
  onRemoveMidiMapping,
  onSetMainSurface,
  onStartLearning,
  selectedSurface,
  updateSurface,
}: {
  learningSurfaceId: string | null;
  onRemoveMidiMapping: () => void;
  onSetMainSurface: (surfaceId: string) => void;
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

      <div className="grid gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-3">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Hauptfläche
        </span>
        <button
          className={
            selectedSurface.isMain ? primaryButtonClass : secondaryButtonClass
          }
          disabled={selectedSurface.isMain}
          onClick={() => onSetMainSurface(selectedSurface.id)}
          type="button"
        >
          {selectedSurface.isMain
            ? "Ist Hauptfläche"
            : "Als Hauptfläche verwenden"}
        </button>
      </div>

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
