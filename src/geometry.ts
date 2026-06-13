import type { PointerEvent as ReactPointerEvent } from "react";
import type { Point } from "./types";

export function getPointerPosition(
  event: ReactPointerEvent<HTMLElement>,
  bounds: DOMRect,
) {
  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  };
}

export function getAngleFromCenter(point: Point, center: Point) {
  return Math.atan2(point.y - center.y, point.x - center.x) * (180 / Math.PI);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
