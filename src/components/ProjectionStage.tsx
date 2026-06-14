import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import enemyDefaultImage from "../assets/enemy-default.png";
import enemyHitImage from "../assets/enemy-hit.png";
import friendDefaultImage from "../assets/friend-default.png";
import friendHitImage from "../assets/friend-hit.png";
import punchCoronaImage from "../assets/punch-corona.png";
import failureSound from "../assets/sounds/failure.mp3";
import punchSound0 from "../assets/sounds/punch0.mp3";
import punchSound1 from "../assets/sounds/punch1.mp3";
import punchSound2 from "../assets/sounds/punch2.mp3";
import punchSound3 from "../assets/sounds/punch3.mp3";
import punchSound4 from "../assets/sounds/punch4.mp3";
import punchSound5 from "../assets/sounds/punch5.mp3";
import punchSound6 from "../assets/sounds/punch6.mp3";
import punchSound7 from "../assets/sounds/punch7.mp3";
import punchSound8 from "../assets/sounds/punch8.mp3";
import { useSessionStore } from "../stores/sessionStore";
import type { HitFeedback } from "../stores/sessionStore";
import type { DrumSurface, InteractionType } from "../types";

const punchSounds = [
  punchSound0,
  punchSound1,
  punchSound2,
  punchSound3,
  punchSound4,
  punchSound5,
  punchSound6,
  punchSound7,
  punchSound8,
];

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
  onSurfaceHit: (surface: DrumSurface) => void;
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
  onSurfaceHit,
  selectedSurfaceId,
  stageRef,
  surfaces,
}: ProjectionStageProps) {
  const activeHits = useSessionStore((state) => state.activeHits);
  const currentTarget = useSessionStore((state) => state.currentTarget);
  const finishedScore = useSessionStore((state) => state.finishedScore);
  const introCountdown = useSessionStore((state) => state.introCountdown);
  const introPhase = useSessionStore((state) => state.introPhase);
  const isActive = useSessionStore((state) => state.isActive);
  const isIntroComplete = useSessionStore((state) => state.isIntroComplete);
  const remainingSeconds = useSessionStore((state) => state.remainingSeconds);
  const mainSurfaceId =
    surfaces.find((surface) => surface.isMain)?.id ?? surfaces[0]?.id;
  const playedHitIdsRef = useRef(new Set<string>());

  useEffect(() => {
    for (const hit of activeHits) {
      if (playedHitIdsRef.current.has(hit.id)) {
        continue;
      }

      playedHitIdsRef.current.add(hit.id);
      playHitSound(hit.kind);
    }
  }, [activeHits]);

  return (
    <section
      className="fixed h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_center,#1e293b_0%,#020617_62%)]"
      onPointerMove={onPointerMove}
      onPointerCancel={onPointerStop}
      onPointerUp={onPointerStop}
      ref={stageRef}
    >
      {surfaces.map((surface, index) => {
        const isSelected = isEditMode && surface.id === selectedSurfaceId;
        const isLearning = learningSurfaceId === surface.id;
        const isHit = surface.lastHitAt !== undefined;
        const isMainSurface = surface.id === mainSurfaceId;
        const shouldShowIntro = !isEditMode && isMainSurface;
        const target =
          !isEditMode && currentTarget?.surfaceNumber === index + 1
            ? currentTarget
            : null;
        const activeHit = !isEditMode
          ? activeHits.find((hit) => hit.surfaceNumber === index + 1)
          : undefined;
        const targetImage = activeHit
          ? getTargetImage(activeHit.kind, true)
          : target
            ? getTargetImage(target.kind)
            : null;
        const targetKind = activeHit?.kind ?? target?.kind;
        const targetImageKey = targetKind
          ? `${surface.id}-${targetKind}`
          : undefined;
        const surfaceClassName = [
          "absolute bg-black left-0 top-0 flex touch-none select-none flex-col items-center justify-center overflow-hidden rounded-[999px] border-2 text-center shadow-2xl transition-colors duration-100",
          isEditMode ? "cursor-move" : "cursor-pointer",
          isSelected
            ? "bg-white/5  ring-4 ring-cyan-300/30"
            : "border-black border-4 bg-white/5 text-cyan-50",
          isLearning
            ? "border-amber-300 bg-amber-300/20 ring-4 ring-amber-300/40"
            : "",
          isHit
            ? ""
            : "",
          isEditMode && isMainSurface
            ? "border-amber-300 ring-4 ring-amber-300/30"
            : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <motion.div
            animate={{ backgroundPositionX: ["0px", "-1024px"] }}
            className={surfaceClassName}
            key={surface.id}
            onPointerDown={(event) => {
              if (isEditMode) {
                onStartInteraction(event, surface, "drag");
                return;
              }

              onSurfaceHit(surface);
            }}
            style={{
            backgroundColor: "black",
              height: surface.height,
              transform: `translate(${surface.x}px, ${surface.y}px) rotate(${surface.rotation}deg)`,
              width: surface.width,
            }}
          
          >
            <div className="pointer-events-none absolute left-1/2 top-[60%] z-10 h-[96%] w-[96%] -translate-x-1/2 -translate-y-1/2">
              <AnimatePresence initial={false} mode="wait">
                {targetImage && (
                  <motion.div
                    animate={{ y: "0%" }}
                    className="h-full w-full"
                    exit={{ y: "145%" }}
                    initial={{ y: "145%" }}
                    key={targetImageKey}
                    transition={{ duration: 0.36, ease: "easeOut" }}
                  >
                    <motion.img
                      alt={`${targetKind} target`}
                      animate={
                        activeHit
                          ? { x: ["-1.2%", "1.2%", "-1.2%"], y: "0%" }
                          : { x: "0%", y: ["-2%", "2%", "-2%"] }
                      }
                      className="h-full w-full object-contain"
                      src={targetImage}
                      transition={
                        activeHit
                          ? {
                              duration: 0.12,
                              ease: "easeInOut",
                              repeat: Infinity,
                            }
                          : {
                              duration: 1.45,
                              ease: "easeInOut",
                              repeat: Infinity,
                            }
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {activeHit && (
              <div className="pointer-events-none absolute left-1/2 top-[60%] z-0 size-[98%] -translate-x-1/2 -translate-y-1/2">
                <motion.img
                  alt=""
                  animate={{ scale: [0.95, 1.05, 0.95] }}
                  className="h-full w-full object-contain"
                  src={punchCoronaImage}
                  transition={{
                    duration: 0.28,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                />
              </div>
            )}

            {isEditMode && (
              <span className="pointer-events-none text-xl font-black uppercase tracking-wide">
                {surface.name}
              </span>
            )}
            {isEditMode && isMainSurface && (
              <span className="pointer-events-none mt-1 rounded-full bg-amber-300 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-950">
                Hauptfläche
              </span>
            )}
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

            {shouldShowIntro && (
              <>
                <SessionIntroOverlay
                  countdown={introCountdown}
                  phase={introPhase}
                />
                <SessionStatusOverlay
                  finishedScore={finishedScore}
                  isActive={isActive}
                  isIntroComplete={isIntroComplete}
                  remainingSeconds={remainingSeconds}
                />
              </>
            )}
          </motion.div>
        );
      })}
      <AnimatePresence>
        {!isEditMode &&
          activeHits.map((hit) => (
            <ScoreFeedbackOverlay hit={hit} key={hit.id} surfaces={surfaces} />
          ))}
      </AnimatePresence>
    </section>
  );
}

function SessionStatusOverlay({
  finishedScore,
  isActive,
  isIntroComplete,
  remainingSeconds,
}: {
  finishedScore: number | null;
  isActive: boolean;
  isIntroComplete: boolean;
  remainingSeconds: number | null;
}) {
  const shouldShowTimer =
    isActive && isIntroComplete && remainingSeconds !== null;
  const shouldShowFinalScore = !isActive && finishedScore !== null;

  if (!shouldShowTimer && !shouldShowFinalScore) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {shouldShowTimer ? (
        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="pointer-events-none absolute left-1/2 top-8 z-30 -translate-x-1/2 rounded-full border border-white/20 bg-slate-950/72 px-6 py-2 text-center shadow-2xl shadow-black/40 backdrop-blur-md"
          exit={{ opacity: 0, scale: 0.92, y: -10 }}
          initial={{ opacity: 0, scale: 0.92, y: -10 }}
          key="timer"
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <span className="block text-[0.65rem] font-black uppercase tracking-[0.24em] text-cyan-100">
            Zeit
          </span>
          <strong className="block text-4xl font-black leading-none text-amber-200">
            {remainingSeconds}s
          </strong>
        </motion.div>
      ) : (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-none absolute inset-0 z-30 grid place-items-center rounded-[999px] bg-slate-950/82 p-8 text-center backdrop-blur-sm"
          exit={{ opacity: 0, scale: 0.94 }}
          initial={{ opacity: 0, scale: 0.94 }}
          key="final-score"
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <div className="grid justify-items-center gap-3">
            <span className="rounded-full bg-white/10 px-4 py-1 text-xs font-black uppercase tracking-[0.24em] text-amber-100">
              Zeit vorbei
            </span>
            <strong className="text-7xl font-black leading-none text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]">
              {finishedScore}
            </strong>
            <span className="text-2xl font-black uppercase tracking-wide text-cyan-100">
              Punkte
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SessionIntroOverlay({
  countdown,
  phase,
}: {
  countdown: number | null;
  phase: ReturnType<typeof useSessionStore.getState>["introPhase"];
}) {
  const content = getIntroContent(phase, countdown);

  if (!content) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="pointer-events-none absolute inset-0 z-20 grid place-items-center rounded-[999px] bg-slate-950/78 p-8 text-center backdrop-blur-sm"
        exit={{ opacity: 0, scale: 0.94 }}
        initial={{ opacity: 0, scale: 0.94 }}
        key={content.key}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="grid justify-items-center gap-3">
          <span className="rounded-full bg-white/10 px-4 py-1 text-xs font-black uppercase tracking-[0.24em] text-cyan-100">
            Anleitung
          </span>
          <strong className={content.className}>{content.text}</strong>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function getIntroContent(
  phase: ReturnType<typeof useSessionStore.getState>["introPhase"],
  countdown: number | null,
) {
  if (phase === "enemyHint") {
    return {
      className: "text-3xl font-black leading-tight text-rose-200",
      key: phase,
      text: "Schlage auf das Enemy-Bild!",
    };
  }

  if (phase === "friendHint") {
    return {
      className: "text-3xl font-black leading-tight text-cyan-100",
      key: phase,
      text: "Schlage nicht auf das Freund-Bild!",
    };
  }

  if (phase === "countdown" && countdown !== null) {
    return {
      className: "text-7xl font-black leading-none text-amber-200",
      key: `${phase}-${countdown}`,
      text: String(countdown),
    };
  }

  return null;
}

function getTargetImage(kind: "enemy" | "friend", isHit?: boolean) {
  if (kind === "enemy") {
    return isHit ? enemyHitImage : enemyDefaultImage;
  }

  return isHit ? friendHitImage : friendDefaultImage;
}

function playHitSound(kind: HitFeedback["kind"]) {
  const sound =
    kind === "enemy"
      ? punchSounds[Math.floor(Math.random() * punchSounds.length)]
      : failureSound;
  const audio = new Audio(sound);

  void audio.play().catch(() => {
    // Browsers can reject playback when audio is blocked by user settings.
  });
}

function PixiLikeText({
  colors,
  fontSize,
  id,
  strokeWidth = 4,
  text,
}: {
  colors: string[];
  fontSize: number;
  id: string;
  strokeWidth?: number;
  text: string;
}) {
  const width = Math.ceil(text.length * fontSize * 0.82 + strokeWidth * 4 + 16);
  const height = Math.ceil(fontSize * 1.45 + strokeWidth * 4);
  const centerX = width / 2;
  const baselineY = height / 2 + fontSize * 0.34;

  return (
    <svg
      aria-label={text}
      className="block overflow-visible"
      height={height}
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`${id}-gradient`}
          x1="0"
          x2="0"
          y1="0"
          y2={height}
        >
          {colors.map((color, index) => (
            <stop
              key={color}
              offset={`${(index / Math.max(colors.length - 1, 1)) * 100}%`}
              stopColor={color}
            />
          ))}
        </linearGradient>
        <filter
          height="180%"
          id={`${id}-shadow`}
          width="180%"
          x="-40%"
          y="-40%"
        >
          <feDropShadow
            dx={5.2}
            dy={3}
            floodColor="#000000"
            floodOpacity="0.9"
            stdDeviation={4}
          />
        </filter>
      </defs>
      <text
        dominantBaseline="alphabetic"
        fill={`url(#${id}-gradient)`}
        filter={`url(#${id}-shadow)`}
        fontFamily="Arial, sans-serif"
        fontSize={fontSize}
        fontStyle="italic"
        fontWeight="700"
        paintOrder="stroke fill"
        stroke="#000000"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        textAnchor="middle"
        x={centerX}
        y={baselineY}
      >
        {text}
      </text>
    </svg>
  );
}

function ScoreFeedbackOverlay({
  hit,
  surfaces,
}: {
  hit: HitFeedback;
  surfaces: DrumSurface[];
}) {
  const surface = surfaces[hit.surfaceNumber - 1];

  if (!surface) {
    return null;
  }

  const isPositiveFeedback = hit.kind === "enemy";
  const x = surface.x + surface.width / 2 + hit.offsetX;
  const y = surface.y + surface.height / 2 + hit.offsetY;
  const pointsText = hit.points > 0 ? `+${hit.points}` : String(hit.points);
  const streakText = isPositiveFeedback
    ? `Streak x${hit.streak}`
    : "Streak reset";

  return (
    <div
      className="pointer-events-none fixed z-999"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${surface.rotation}deg)`,
      }}
    >
      <motion.div
        animate={
          isPositiveFeedback
            ? {
                opacity: 1,
                scale: [0.72, 1.2, 1],
                y: -92,
              }
            : {
                opacity: 1,
                scale: [0.78, 1.1, 1],
                x: [-10, 10, -7, 7, 0],
                y: -76,
              }
        }
        className="relative grid min-w-32 justify-items-center"
        exit={{
          opacity: 0,
          scale: 0.72,
          transition: { duration: 0.08 },
          y: -132,
        }}
        initial={{ opacity: 0, scale: 0.72, y: -12 }}
        key={hit.id}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <PixiLikeText
          colors={
            isPositiveFeedback
              ? ["#ffffff", "#a3e635"]
              : ["#ff6b6b", "#ff0000"]
          }
          fontSize={56}
          id={`${hit.id}-points`}
          strokeWidth={8}
          text={pointsText}
        />
        <PixiLikeText
          colors={
            isPositiveFeedback
              ? ["#ffd700", "#ff8c00", "#ff4500"]
              : ["#ffffff", "#fca5a5"]
          }
          fontSize={24}
          id={`${hit.id}-streak`}
          strokeWidth={8}
          text={streakText.toUpperCase()}
        />
      </motion.div>
    </div>
  );
}
