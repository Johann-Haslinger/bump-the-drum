import { useEffect } from "react";
import type { TargetAssets, TargetKind } from "../stores/sessionStore";
import { useSessionStore } from "../stores/sessionStore";

const USE_MOCK_SESSION_EVENTS = true;

export function useSessionEventsStream() {
  const controllerUrl = useSessionStore(
    (state) => state.session?.controllerUrl,
  );
  const addEvent = useSessionStore((state) => state.addEvent);
  const isActive = useSessionStore((state) => state.isActive);
  const isIntroComplete = useSessionStore((state) => state.isIntroComplete);
  const setStreamError = useSessionStore((state) => state.setStreamError);
  const setStreamStatus = useSessionStore((state) => state.setStreamStatus);
  const setTargetAssets = useSessionStore((state) => state.setTargetAssets);
  const showTarget = useSessionStore((state) => state.showTarget);

  useEffect(() => {
    if (!controllerUrl || !isActive || !isIntroComplete) {
      setStreamStatus("idle");
      return;
    }

    const abortController = new AbortController();

    setStreamError(null);
    setStreamStatus("connecting");

    if (USE_MOCK_SESSION_EVENTS) {
      return startMockSessionEvents({
        addEvent,
        onSessionEvent: (event) => {
          applySessionEvent(event, setTargetAssets, showTarget);
        },
        setStreamStatus,
      });
    }

    void readSessionEvents({
      addEvent,
      controllerUrl,
      onSessionEvent: (event) => {
        applySessionEvent(event, setTargetAssets, showTarget);
      },
      signal: abortController.signal,
      setStreamError,
      setStreamStatus,
    });

    return () => {
      abortController.abort();
    };
  }, [
    addEvent,
    controllerUrl,
    isActive,
    isIntroComplete,
    setStreamError,
    setStreamStatus,
    setTargetAssets,
    showTarget,
  ]);
}

function startMockSessionEvents({
  addEvent,
  onSessionEvent,
  setStreamStatus,
}: {
  addEvent: (event: { data: unknown; type: string }) => void;
  onSessionEvent: (event: { data: unknown; type: string }) => void;
  setStreamStatus: (streamStatus: "idle" | "connecting" | "open" | "error") => void;
}) {
  let timeout: number | undefined;
  let cancelled = false;
  let nextSurfaceNumber: 1 | 2 = 1;

  const emit = (event: { data: unknown; type: string }) => {
    addEvent(event);
    onSessionEvent(event);
  };

  const scheduleTarget = () => {
    if (cancelled) {
      return;
    }

    const visibleMs = randomNumberBetween(2200, 3600);
    const nextDelay = randomNumberBetween(800, 1600);
    const kind = Math.random() > 0.5 ? "enemy" : "friend";

    emit({
      data: {
        kind,
        surfaceNumber: nextSurfaceNumber,
        type: "target",
        visibleMs,
      },
      type: "target",
    });

    nextSurfaceNumber = nextSurfaceNumber === 1 ? 2 : 1;
    timeout = window.setTimeout(scheduleTarget, nextDelay);
  };

  setStreamStatus("open");
  emit({
    data: {
      message: "Mock-Session-Events aktiv. Echter Stream ist vorerst deaktiviert.",
      type: "mock",
    },
    type: "mock",
  });

  timeout = window.setTimeout(scheduleTarget, 500);

  return () => {
    cancelled = true;
    window.clearTimeout(timeout);
    setStreamStatus("idle");
  };
}

async function readSessionEvents({
  addEvent,
  controllerUrl,
  onSessionEvent,
  signal,
  setStreamError,
  setStreamStatus,
}: {
  addEvent: (event: { data: unknown; type: string }) => void;
  controllerUrl: string;
  onSessionEvent: (event: { data: unknown; type: string }) => void;
  signal: AbortSignal;
  setStreamError: (streamError: string | null) => void;
  setStreamStatus: (streamStatus: "idle" | "connecting" | "open" | "error") => void;
}) {
  try {
    const response = await fetch(`${controllerUrl}/events`, {
      headers: {
        Accept: "text/event-stream",
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Session-Eventstream antwortet mit ${response.status}.`);
    }

    if (!response.body) {
      throw new Error("Session-Eventstream enthält keinen lesbaren Body.");
    }

    setStreamStatus("open");
    await readEventStream(response.body, addEvent, onSessionEvent, signal);
  } catch (error) {
    if (signal.aborted) {
      return;
    }

    setStreamError(
      error instanceof Error
        ? error.message
        : "Session-Eventstream konnte nicht verbunden werden.",
    );
    setStreamStatus("error");
  }
}

async function readEventStream(
  body: ReadableStream<Uint8Array>,
  addEvent: (event: { data: unknown; type: string }) => void,
  onSessionEvent: (event: { data: unknown; type: string }) => void,
  signal: AbortSignal,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (!signal.aborted) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const event = parseSseBlock(block);

      if (event) {
        addEvent(event);
        onSessionEvent(event);
      }
    }
  }
}

function randomNumberBetween(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

function parseSseBlock(block: string) {
  const eventLines = block.split(/\r?\n/);
  const dataLines: string[] = [];
  const commentLines: string[] = [];
  let type = "message";

  for (const line of eventLines) {
    if (line.startsWith(":")) {
      commentLines.push(line.slice(1).trim());
      continue;
    }

    const separatorIndex = line.indexOf(":");
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    const value =
      separatorIndex === -1 ? "" : line.slice(separatorIndex + 1).trimStart();

    if (field === "event") {
      type = value || "message";
    }

    if (field === "data") {
      dataLines.push(value);
    }
  }

  if (dataLines.length > 0) {
    return {
      data: parseEventData(dataLines.join("\n")),
      type,
    };
  }

  if (commentLines.length > 0) {
    return {
      data: commentLines.join("\n"),
      type: "comment",
    };
  }

  return null;
}

function parseEventData(data: string) {
  try {
    return JSON.parse(data) as unknown;
  } catch {
    return data;
  }
}

function applySessionEvent(
  event: { data: unknown; type: string },
  setTargetAssets: (assets: Partial<TargetAssets>) => void,
  showTarget: (target: {
    kind: TargetKind;
    surfaceNumber: 1 | 2;
    visibleMs?: number;
  }) => void,
) {
  const payload = normalizePayload(event);

  if (!isRecord(payload)) {
    return;
  }

  if (payload.type === "assets" || event.type === "assets") {
    const assets = parseAssetsPayload(payload);

    if (assets) {
      setTargetAssets(assets);
    }
  }

  if (payload.type === "target" || event.type === "target") {
    const target = parseTargetPayload(payload);

    if (target) {
      showTarget(target);
    }
  }
}

function normalizePayload(event: { data: unknown; type: string }) {
  if (isRecord(event.data) && isRecord(event.data.payload)) {
    return {
      ...event.data.payload,
      type: event.data.type ?? event.type,
    };
  }

  if (isRecord(event.data)) {
    return {
      ...event.data,
      type: event.data.type ?? event.type,
    };
  }

  return event.data;
}

function parseAssetsPayload(payload: Record<string, unknown>) {
  const friend = parseAsset(payload.friend);
  const enemy = parseAsset(payload.enemy);

  if (!friend && !enemy) {
    return null;
  }

  return {
    ...(enemy ? { enemy } : {}),
    ...(friend ? { friend } : {}),
  };
}

function parseAsset(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.defaultImage !== "string" || typeof value.hitImage !== "string") {
    return null;
  }

  return {
    defaultImage: value.defaultImage,
    hitImage: value.hitImage,
  };
}

function parseTargetPayload(payload: Record<string, unknown>) {
  if (!isTargetKind(payload.kind)) {
    return null;
  }

  const surfaceNumber = payload.surfaceNumber;

  if (!isSurfaceNumber(surfaceNumber)) {
    return null;
  }

  return {
    kind: payload.kind,
    surfaceNumber,
    visibleMs:
      typeof payload.visibleMs === "number" && payload.visibleMs > 0
        ? payload.visibleMs
        : undefined,
  };
}

function isTargetKind(value: unknown): value is TargetKind {
  return value === "enemy" || value === "friend";
}

function isSurfaceNumber(value: unknown): value is 1 | 2 {
  return value === 1 || value === 2;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
