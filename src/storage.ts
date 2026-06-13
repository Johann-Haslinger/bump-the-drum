import type { AppMode, DrumSurface } from "./types";

export const SURFACES_STORAGE_KEY = "bump-the-drum-surfaces";
export const MODE_STORAGE_KEY = "bump-the-drum-mode";

const legacyPresetIds = new Set(["kick", "snare", "hihat"]);

function containsOnlyLegacyPresets(surfaces: DrumSurface[]) {
  return (
    surfaces.length > 0 &&
    surfaces.every((surface) => legacyPresetIds.has(surface.id))
  );
}

export function loadSurfaces() {
  try {
    const stored = localStorage.getItem(SURFACES_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as DrumSurface[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    if (containsOnlyLegacyPresets(parsed)) {
      return [];
    }

    return parsed.map((surface) => {
      const size = surface.width ?? surface.height;

      return {
        ...surface,
        height: size,
        lastHitAt: undefined,
        width: size,
      };
    });
  } catch {
    return [];
  }
}

export function loadMode(): AppMode {
  return localStorage.getItem(MODE_STORAGE_KEY) === "game" ? "game" : "edit";
}

export function serializeSurfaces(surfaces: DrumSurface[]) {
  return surfaces.map(
    ({ id, name, x, y, width, height, rotation, midiNote, midiChannel }) => ({
      id,
      name,
      x,
      y,
      width,
      height,
      rotation,
      midiNote,
      midiChannel,
    }),
  );
}
