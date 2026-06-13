import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AppMode, DrumSurface, MidiEvent } from "../types";

const HIT_FLASH_MS = 180;

type UseMidiInputOptions = {
  surfaces: DrumSurface[];
  setSurfaces: Dispatch<SetStateAction<DrumSurface[]>>;
  learningSurfaceId: string | null;
  setLearningSurfaceId: Dispatch<SetStateAction<string | null>>;
  mode: AppMode;
};

function getFirstMidiInput(midiAccess: MIDIAccess) {
  let firstInput: MIDIInput | undefined;

  midiAccess.inputs.forEach((input) => {
    firstInput ??= input;
  });

  return firstInput;
}

export function useMidiInput({
  surfaces,
  setSurfaces,
  learningSurfaceId,
  setLearningSurfaceId,
  mode,
}: UseMidiInputOptions) {
  const surfacesRef = useRef<DrumSurface[]>([]);
  const learningSurfaceIdRef = useRef<string | null>(null);
  const modeRef = useRef<AppMode>(mode);

  const [inputName, setInputName] = useState("Kein Input gefunden");
  const [events, setEvents] = useState<MidiEvent[]>([]);

  useEffect(() => {
    surfacesRef.current = surfaces;
  }, [surfaces]);

  useEffect(() => {
    learningSurfaceIdRef.current = learningSurfaceId;
  }, [learningSurfaceId]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    let activeInput: MIDIInput | undefined;
    let cancelled = false;

    async function initMidi() {
      if (!navigator.requestMIDIAccess) {
        setInputName("Web MIDI wird nicht unterstützt");
        return;
      }

      const midiAccess = await navigator.requestMIDIAccess({ sysex: false });

      if (cancelled) {
        return;
      }

      const input = getFirstMidiInput(midiAccess);
      activeInput = input;

      if (!input) {
        setInputName("Kein MIDI Input gefunden");
        return;
      }

      setInputName(input.name ?? "Unbekannter MIDI Input");

      input.onmidimessage = (message: MIDIMessageEvent) => {
        const data = Array.from(message.data ?? []);
        const [status = 0, note = 0, velocity = 0] = data;
        const command = status & 0xf0;
        const channel = status & 0x0f;
        const isNoteOn = command === 0x90 && velocity > 0;

        if (!isNoteOn) {
          return;
        }

        const learningId = learningSurfaceIdRef.current;
        learningSurfaceIdRef.current = null;
        setLearningSurfaceId(null);

        const now = Date.now();
        const matchedSurface = surfacesRef.current.find(
          (surface) =>
            surface.midiChannel === channel && surface.midiNote === note,
        );
        const matchedSurfaceId = learningId ?? matchedSurface?.id;

        if (!learningId && modeRef.current === "game" && matchedSurface) {
          console.log(matchedSurface.name);
        }

        setSurfaces((current) =>
          current.map((surface) => {
            if (learningId === surface.id) {
              return {
                ...surface,
                midiChannel: channel,
                midiNote: note,
                lastHitAt: now,
              };
            }

            if (matchedSurfaceId === surface.id) {
              return { ...surface, lastHitAt: now };
            }

            return surface;
          }),
        );

        setEvents((prev) => [
          {
            raw: data,
            status,
            command,
            channel,
            note,
            velocity,
            time: new Date().toLocaleTimeString(),
            matchedSurfaceId,
          },
          ...prev.slice(0, 20),
        ]);
      };
    }

    initMidi();

    return () => {
      cancelled = true;

      if (activeInput) {
        activeInput.onmidimessage = null;
      }
    };
  }, [setLearningSurfaceId, setSurfaces]);

  useEffect(() => {
    const hitSurface = surfaces.find((surface) => surface.lastHitAt);

    if (!hitSurface?.lastHitAt) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSurfaces((current) =>
        current.map((surface) =>
          surface.lastHitAt &&
          Date.now() - surface.lastHitAt >= HIT_FLASH_MS
            ? { ...surface, lastHitAt: undefined }
            : surface,
        ),
      );
    }, HIT_FLASH_MS);

    return () => window.clearTimeout(timeout);
  }, [setSurfaces, surfaces]);

  return { events, inputName };
}
