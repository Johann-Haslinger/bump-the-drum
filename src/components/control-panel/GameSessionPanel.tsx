import { useSessionStore } from "../../stores/sessionStore";
import { inputClass, labelClass, primaryButtonClass } from "./styles";

export function GameSessionPanel() {
  const bpm = useSessionStore((state) => state.bpm);
  const finishedScore = useSessionStore((state) => state.finishedScore);
  const isActive = useSessionStore((state) => state.isActive);
  const isStarting = useSessionStore((state) => state.isStarting);
  const remainingSeconds = useSessionStore((state) => state.remainingSeconds);
  const score = useSessionStore((state) => state.score);
  const setBpm = useSessionStore((state) => state.setBpm);
  const startError = useSessionStore((state) => state.startError);
  const startSession = useSessionStore((state) => state.startSession);
  const streak = useSessionStore((state) => state.streak);
  const streamStatus = useSessionStore((state) => state.streamStatus);

  if (isActive) {
    return (
      <section className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">Session aktiv · {bpm} BPM</p>
            <p className="text-xs text-slate-500">
              Stream: {formatStreamStatus(streamStatus)}
            </p>
          </div>
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300">
            Live
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Score
            </span>
            <strong className="block text-3xl font-black text-slate-100">
              {score}
            </strong>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Streak
            </span>
            <strong className="block text-3xl font-black text-cyan-300">
              {streak}
            </strong>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Zeit
            </span>
            <strong className="block text-3xl font-black text-amber-200">
              {remainingSeconds ?? 60}s
            </strong>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
      <label className={labelClass}>
        BPM
        <input
          className={inputClass}
          min={1}
          onChange={(event) => setBpm(Number(event.target.value))}
          type="number"
          value={bpm}
        />
      </label>

      <button
        className={primaryButtonClass}
        disabled={bpm < 1 || isStarting}
        onClick={startSession}
        type="button"
      >
        {isStarting ? "Session startet..." : "Session starten"}
      </button>

      {finishedScore !== null && (
        <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3">
          <span className="text-xs font-bold uppercase tracking-wide text-amber-100/80">
            Letzter Score
          </span>
          <strong className="block text-3xl font-black text-amber-100">
            {finishedScore} Punkte
          </strong>
        </div>
      )}

      {startError && (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {startError}
        </p>
      )}
    </section>
  );
}

function formatStreamStatus(status: string) {
  switch (status) {
    case "connecting":
      return "verbinde";
    case "open":
      return "verbunden";
    case "error":
      return "Fehler";
    default:
      return "inaktiv";
  }
}
