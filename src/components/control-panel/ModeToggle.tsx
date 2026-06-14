import type { AppMode } from "../../types";

export function ModeToggle({
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
