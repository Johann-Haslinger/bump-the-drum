import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import type { DrumSurface, InteractionType } from "../types";

type ProjectionStageProps = {
  isEditMode: boolean;
  learningSurfaceId: string | null;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerStop: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onStartInteraction: (
    event: ReactPointerEvent<HTMLElement>,
    surface: DrumSurface,
    type: InteractionType,
  ) => void;
  selectedSurfaceId: string;
  stageRef: RefObject<HTMLDivElement | null>;
  surfaces: DrumSurface[];
};

export function ProjectionStage({
  isEditMode,
  learningSurfaceId,
  onPointerMove,
  onPointerStop,
  onStartInteraction,
  selectedSurfaceId,
  stageRef,
  surfaces,
}: ProjectionStageProps) {
  return (
    <section
      className="fixed h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_center,#1e293b_0%,#020617_62%)]"
      onPointerMove={onPointerMove}
      onPointerCancel={onPointerStop}
      onPointerUp={onPointerStop}
      ref={stageRef}
    >
      {surfaces.map((surface) => {
        const isSelected = isEditMode && surface.id === selectedSurfaceId;
        const isLearning = learningSurfaceId === surface.id;
        const isHit = surface.lastHitAt !== undefined;
        const surfaceClassName = [
          "absolute left-0 top-0 flex touch-none select-none flex-col items-center justify-center rounded-[999px] border-2 text-center shadow-2xl transition-colors duration-100",
          isEditMode ? "cursor-move" : "cursor-default",
          isSelected
            ? "border-cyan-300 bg-cyan-400/20 text-cyan-50 ring-4 ring-cyan-300/30"
            : "border-cyan-400/60 bg-cyan-400/10 text-cyan-50",
          isLearning
            ? "border-amber-300 bg-amber-300/20 ring-4 ring-amber-300/40"
            : "",
          isHit
            ? "border-white bg-amber-300/80 text-slate-950 shadow-amber-200/70"
            : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            className={surfaceClassName}
            key={surface.id}
            onPointerDown={(event) =>
              onStartInteraction(event, surface, "drag")
            }
            style={{
              height: surface.height,
              transform: `translate(${surface.x}px, ${surface.y}px) rotate(${surface.rotation}deg)`,
              width: surface.width,
            }}
          >
            <span className="pointer-events-none text-xl font-black uppercase tracking-wide">
              {surface.name}
            </span>
            {isEditMode && (
              <span className="pointer-events-none mt-1 text-xs font-bold uppercase tracking-wide opacity-70">
                {surface.midiNote === undefined
                  ? "No MIDI"
                  : `Ch ${surface.midiChannel} · ${surface.midiNote}`}
              </span>
            )}

            {isEditMode && (
              <>
                <button
                  aria-label={`${surface.name} rotieren`}
                  className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 -translate-y-12 rounded-full border-2 border-cyan-100 bg-slate-950 shadow-lg shadow-cyan-500/30 before:absolute before:left-1/2 before:top-full before:h-10 before:w-px before:-translate-x-1/2 before:bg-cyan-100"
                  onPointerDown={(event) =>
                    onStartInteraction(event, surface, "rotate")
                  }
                  type="button"
                />
                <button
                  aria-label={`${surface.name} skalieren`}
                  className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-2 border-white bg-cyan-300 shadow-lg shadow-cyan-500/40"
                  onPointerDown={(event) =>
                    onStartInteraction(event, surface, "resize")
                  }
                  type="button"
                />
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}
