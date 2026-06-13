import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { clamp, getAngleFromCenter, getPointerPosition } from "../geometry";
import type { DrumSurface, Interaction, InteractionType } from "../types";

type UseSurfaceInteractionsOptions = {
  isEditMode: boolean;
  stageRef: RefObject<HTMLDivElement | null>;
  onSelectSurface: (surfaceId: string) => void;
  updateSurface: (surfaceId: string, updates: Partial<DrumSurface>) => void;
};

export function useSurfaceInteractions({
  isEditMode,
  stageRef,
  onSelectSurface,
  updateSurface,
}: UseSurfaceInteractionsOptions) {
  const interactionRef = useRef<Interaction | null>(null);

  const startInteraction = (
    event: ReactPointerEvent<HTMLElement>,
    surface: DrumSurface,
    type: InteractionType,
  ) => {
    if (!isEditMode || !stageRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelectSurface(surface.id);

    const bounds = stageRef.current.getBoundingClientRect();
    const startPointer = getPointerPosition(event, bounds);
    const center = {
      x: surface.x + surface.width / 2,
      y: surface.y + surface.height / 2,
    };

    interactionRef.current = {
      type,
      surfaceId: surface.id,
      pointerId: event.pointerId,
      startPointer,
      startSurface: surface,
      center,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;

    if (!interaction || !stageRef.current) {
      return;
    }

    const bounds = stageRef.current.getBoundingClientRect();
    const pointer = getPointerPosition(event, bounds);
    const deltaX = pointer.x - interaction.startPointer.x;
    const deltaY = pointer.y - interaction.startPointer.y;
    const { startSurface } = interaction;

    if (interaction.type === "drag") {
      updateSurface(interaction.surfaceId, {
        x: startSurface.x + deltaX,
        y: startSurface.y + deltaY,
      });
      return;
    }

    if (interaction.type === "resize") {
      const size = clamp(
        startSurface.width + Math.max(deltaX, deltaY),
        60,
        520,
      );

      updateSurface(interaction.surfaceId, {
        width: size,
        height: size,
      });
      return;
    }

    if (interaction.type === "rotate" && interaction.center) {
      const startAngle = getAngleFromCenter(
        interaction.startPointer,
        interaction.center,
      );
      const currentAngle = getAngleFromCenter(pointer, interaction.center);

      updateSurface(interaction.surfaceId, {
        rotation: Math.round(startSurface.rotation + currentAngle - startAngle),
      });
    }
  };

  const stopInteraction = (event: ReactPointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;

    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    interactionRef.current = null;
  };

  return {
    handlePointerMove,
    startInteraction,
    stopInteraction,
  };
}
