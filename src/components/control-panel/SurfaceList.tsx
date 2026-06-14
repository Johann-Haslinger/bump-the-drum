import type { DrumSurface } from "../../types";
import { primaryButtonClass } from "./styles";

export function SurfaceList({
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
            <span className="flex items-center gap-2 font-bold text-slate-100">
              {surface.name}
              {surface.isMain && (
                <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-wide text-slate-950">
                  Haupt
                </span>
              )}
            </span>
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
