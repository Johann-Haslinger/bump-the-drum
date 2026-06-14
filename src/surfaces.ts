import type { DrumSurface } from "./types";

export function createSurfaceName(count: number) {
  return `Fläche ${count + 1}`;
}

export function createSurfaceId() {
  return crypto.randomUUID?.() ?? `surface-${Date.now()}`;
}

export function createDrumSurface(count: number): DrumSurface {
  return {
    id: createSurfaceId(),
    isMain: count === 0,
    name: createSurfaceName(count),
    x: 320 + count * 24,
    y: 220 + count * 18,
    width: 160,
    height: 160,
    rotation: 0,
  };
}
