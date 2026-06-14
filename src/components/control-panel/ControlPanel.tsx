import { AnimatePresence, motion } from "framer-motion";
import type { AppMode, DrumSurface, MidiEvent } from "../../types";
import { GameSessionPanel } from "./GameSessionPanel";
import { MidiLog } from "./MidiLog";
import { ModeToggle } from "./ModeToggle";
import { SelectedSurfacePanel } from "./SelectedSurfacePanel";
import { SurfaceList } from "./SurfaceList";
import { useSessionStore } from "../../stores/sessionStore";

type ControlPanelProps = {
  events: MidiEvent[];
  inputName: string;
  learningSurfaceId: string | null;
  mode: AppMode;
  onAddSurface: () => void;
  onModeChange: (mode: AppMode) => void;
  onRemoveMidiMapping: () => void;
  onSelectSurface: (surfaceId: string) => void;
  onSetMainSurface: (surfaceId: string) => void;
  onStartLearning: () => void;
  selectedSurface?: DrumSurface;
  selectedSurfaceId: string;
  surfaces: DrumSurface[];
  updateSurface: (surfaceId: string, updates: Partial<DrumSurface>) => void;
};

export function ControlPanel({
  events,
  inputName,
  learningSurfaceId,
  mode,
  onAddSurface,
  onModeChange,
  onRemoveMidiMapping,
  onSelectSurface,
  onSetMainSurface,
  onStartLearning,
  selectedSurface,
  selectedSurfaceId,
  surfaces,
  updateSurface,
}: ControlPanelProps) {
  const finishedScore = useSessionStore((state) => state.finishedScore);
  const isSessionActive = useSessionStore((state) => state.isActive);
  const isEditMode = mode === "edit";
  const isGameMode = mode === "game";

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
              height: isSessionActive ? 64 : finishedScore === null ? 220 : 312,
              left: 16,
              width: 360,

              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderColor: "rgba(255, 255, 255, 0.1)",
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
            : "flex h-full flex-col gap-3 p-2"
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
                  onSetMainSurface={onSetMainSurface}
                  onStartLearning={onStartLearning}
                  selectedSurface={selectedSurface}
                  updateSurface={updateSurface}
                />
              )}

              <MidiLog events={events} inputName={inputName} />
            </motion.div>
          )}
          {isGameMode && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
            >
              <GameSessionPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
