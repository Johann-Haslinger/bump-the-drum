export type AppMode = "edit" | "game";

export type DrumSurface = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  midiNote?: number;
  midiChannel?: number;
  lastHitAt?: number;
};

export type MidiEvent = {
  raw: number[];
  status: number;
  command: number;
  channel: number;
  note: number;
  velocity: number;
  time: string;
  matchedSurfaceId?: string;
};

export type InteractionType = "drag" | "resize" | "rotate";

export type Interaction = {
  type: InteractionType;
  surfaceId: string;
  pointerId: number;
  startPointer: Point;
  startSurface: DrumSurface;
  center?: Point;
};

export type Point = {
  x: number;
  y: number;
};
