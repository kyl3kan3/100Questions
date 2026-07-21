import { GatewayError } from "@ai-sdk/gateway";
import {
  APICallError,
  NoObjectGeneratedError,
  NoOutputGeneratedError,
} from "ai";
import { ZodError } from "zod";

export interface ClassifiedProviderError {
  code: string;
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
}

export interface ProviderErrorDiagnostic {
  name: string;
  causeName?: string;
  statusCode?: number;
  generationId?: string;
  requestId?: string;
  finishReason?: string;
}

export function classifyProviderError(error: unknown): ClassifiedProviderError {
  if (GatewayError.isInstance(error)) {
    if (error.statusCode === 402) {
      return {
        code: "GATEWAY_BUDGET_EXCEEDED",
        message: "The AI Gateway budget was exhausted.",
        retryable: false,
      };
    }

    if (error.type === "authentication_error") {
      return {
        code: "GATEWAY_AUTH_ERROR",
        message: "AI Gateway authentication failed.",
        retryable: false,
      };
    }

    if (error.type === "rate_limit_exceeded" || error.statusCode === 429) {
      return {
        code: "PROVIDER_RATE_LIMITED",
        message: "AI Gateway or the selected provider rate-limited the request.",
        retryable: true,
      };
    }

    if (error.isRetryable || error.statusCode >= 500) {
      return {
        code: "PROVIDER_UNAVAILABLE",
        message: "AI Gateway or the selected provider is temporarily unavailable.",
        retryable: true,
      };
    }

    return {
      code:
        error.type === "model_not_found"
          ? "GATEWAY_MODEL_NOT_FOUND"
          : "PROVIDER_REQUEST_REJECTED",
      message: "AI Gateway permanently rejected the request configuration.",
      retryable: false,
    };
  }

  if (APICallError.isInstance(error)) {
    const status = error.statusCode;
    const retryAfterMs = parseRetryAfter(error.responseHeaders?.["retry-after"]);

    if (status === 402) {
      return {
        code: "GATEWAY_BUDGET_EXCEEDED",
        message: "The AI Gateway budget was exhausted.",
        retryable: false,
      };
    }

    if (status === 408 || status === 409 || status === 425 || status === 429) {
      return {
        code: status === 429 ? "PROVIDER_RATE_LIMITED" : "PROVIDER_TRANSIENT",
        message: `The provider returned a transient HTTP ${status} response.`,
        retryable: true,
        retryAfterMs,
      };
    }

    if (status !== undefined && status >= 500) {
      return {
        code: "PROVIDER_UNAVAILABLE",
        message: `The provider returned HTTP ${status}.`,
        retryable: true,
        retryAfterMs,
      };
    }

    if (status !== undefined && status >= 400) {
      return {
        code:
          status === 401 || status === 403
            ? "GATEWAY_AUTH_ERROR"
            : "PROVIDER_REQUEST_REJECTED",
        message: `The provider rejected the grounded request with HTTP ${status}.`,
        retryable: false,
      };
    }
  }

  if (
    NoObjectGeneratedError.isInstance(error) ||
    NoOutputGeneratedError.isInstance(error) ||
    error instanceof ZodError ||
    (error instanceof Error &&
      /Question generation produced|generated neutral brief exposed/iu.test(
        error.message,
      ))
  ) {
    return {
      code: "PROVIDER_INVALID_OUTPUT",
      message: "The model returned output that did not satisfy the benchmark schema.",
      retryable: true,
    };
  }

  const name = error instanceof Error ? error.name : "UnknownError";

  if (/AbortError|TimeoutError|NetworkError|ResponseError/iu.test(name)) {
    return {
      code: "PROVIDER_TRANSIENT",
      message: "The grounded provider request timed out or lost its connection.",
      retryable: true,
    };
  }

  if (
    /Unsupported|NoSuchModel|LoadAPIKey|LoadSetting|InvalidArgument|InvalidPrompt/iu.test(
      name,
    )
  ) {
    return {
      code: /LoadAPIKey|LoadSetting/iu.test(name)
        ? "GATEWAY_AUTH_ERROR"
        : "PROVIDER_CONFIGURATION_ERROR",
      message: "The selected model or native search tool is not configured or supported.",
      retryable: false,
    };
  }

  return {
    code: "PROVIDER_TRANSIENT",
    message: "The provider request failed before a grounded answer was recorded.",
    retryable: true,
  };
}

/**
 * Returns identifiers and error categories that are safe to emit to runtime
 * logs. Deliberately excludes provider response bodies and generated text.
 */
export function providerErrorDiagnostic(
  error: unknown,
): ProviderErrorDiagnostic {
  const record = readRecord(error);
  const cause = readRecord(record?.cause);
  const response = readRecord(record?.response);
  const headers = lowerCaseHeaders(response?.headers);
  const statusCode = finiteIntegerOrNull(record?.statusCode);
  const diagnostic: ProviderErrorDiagnostic = {
    name: error instanceof Error ? error.name : "UnknownError",
  };
  const causeName =
    record?.cause instanceof Error
      ? record.cause.name
      : readString(cause?.name);
  const generationId = readString(record?.generationId);
  const requestId =
    headers["x-vercel-ai-gateway-request-id"] ??
    headers["x-ai-gateway-request-id"] ??
    headers["x-request-id"] ??
    readString(response?.id);
  const finishReason = readString(record?.finishReason);

  if (causeName) diagnostic.causeName = causeName;
  if (statusCode !== null) diagnostic.statusCode = statusCode;
  if (generationId) diagnostic.generationId = generationId;
  if (requestId) diagnostic.requestId = requestId;
  if (finishReason) diagnostic.finishReason = finishReason;

  return diagnostic;
}

function parseRetryAfter(value: string | undefined): number | undefined {
  if (!value) return undefined;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1_000;

  const timestamp = Date.parse(value);
  if (Number.isFinite(timestamp)) return Math.max(0, timestamp - Date.now());

  return undefined;
}

function finiteIntegerOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : null;
}

function lowerCaseHeaders(value: unknown): Record<string, string> {
  const record = readRecord(value);
  if (!record) return {};

  return Object.fromEntries(
    Object.entries(record)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .map(([key, nested]) => [key.toLocaleLowerCase("en-US"), nested]),
  );
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}
