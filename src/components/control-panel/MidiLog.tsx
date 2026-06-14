import type { MidiEvent } from "../../types";

export function MidiLog({
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
