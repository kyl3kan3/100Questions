const FALLBACK_WORKFLOW_ERROR =
  "Workflow step failed without a structured error.";

/** Reads errors serialized across the Workflow VM boundary without instanceof. */
export function workflowErrorMessage(error: unknown): string {
  const message = readMessage(error);
  return message ? message.slice(0, 500) : FALLBACK_WORKFLOW_ERROR;
}

function readMessage(value: unknown, inspectCause = true): string | null {
  if (typeof value === "string") return normalizeMessage(value);
  if (!value || typeof value !== "object") return null;

  try {
    const message = Reflect.get(value, "message");
    if (typeof message === "string") {
      const normalized = normalizeMessage(message);
      if (normalized) return normalized;
    }

    if (inspectCause) {
      return readMessage(Reflect.get(value, "cause"), false);
    }
  } catch {
    return null;
  }

  return null;
}

function normalizeMessage(message: string): string | null {
  return message.replace(/\s+/gu, " ").trim() || null;
}
