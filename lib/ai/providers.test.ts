import { describe, expect, it } from "vitest";
import { GatewayInternalServerError, GatewayRateLimitError } from "@ai-sdk/gateway";
import { APICallError } from "ai";
import { z } from "zod";

import {
  classifyProviderError,
  providerErrorDiagnostic,
  providerRetryDelayMs,
} from "./provider-errors";

describe("provider error handling", () => {
  it("classifies locally invalid structured output distinctly", () => {
    const error = z.object({ questions: z.array(z.string()).min(2) }).safeParse({
      questions: ["one"],
    }).error;

    expect(classifyProviderError(error)).toEqual({
      code: "PROVIDER_INVALID_OUTPUT",
      message: "The model returned output that did not satisfy the benchmark schema.",
      retryable: true,
    });
  });

  it("emits safe diagnostics without response bodies", () => {
    const error = Object.assign(new Error("provider response contained secrets"), {
      name: "ExampleProviderError",
      statusCode: 503,
      responseBody: "do not log this",
      response: {
        id: "provider-request-id",
        headers: { "x-vercel-ai-gateway-request-id": "gateway-request-id" },
      },
      cause: Object.assign(new Error("socket closed"), {
        name: "NetworkError",
      }),
    });

    expect(providerErrorDiagnostic(error)).toEqual({
      name: "ExampleProviderError",
      causeName: "NetworkError",
      statusCode: 503,
      requestId: "gateway-request-id",
    });
    expect(JSON.stringify(providerErrorDiagnostic(error))).not.toContain(
      "do not log this",
    );
  });

  it("honors a nested Retry-After header from an AI Gateway rate limit", () => {
    const cause = new APICallError({
      message: "rate limited",
      url: "https://ai-gateway.vercel.sh/v1/ai/language-model",
      requestBodyValues: {},
      statusCode: 429,
      responseHeaders: { "retry-after": "45" },
      isRetryable: true,
    });
    const failure = classifyProviderError(
      new GatewayRateLimitError({ statusCode: 429, cause }),
    );

    expect(failure).toMatchObject({
      code: "PROVIDER_RATE_LIMITED",
      retryable: true,
      retryAfterMs: 45_000,
    });
    expect(providerRetryDelayMs(failure, 1, 0)).toBe(45_000);
  });

  it("retries an internal gateway wrapper even when its nested status is 403", () => {
    const failure = classifyProviderError(
      new GatewayInternalServerError({ statusCode: 403 }),
    );

    expect(failure).toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
      retryable: true,
    });
  });

  it("uses a longer exponential floor for rate limits", () => {
    const failure = {
      code: "PROVIDER_RATE_LIMITED",
      message: "rate limited",
      retryable: true,
    };

    expect(providerRetryDelayMs(failure, 1, 0)).toBe(30_000);
    expect(providerRetryDelayMs(failure, 3, 0)).toBe(120_000);
    expect(providerRetryDelayMs(failure, 5, 0)).toBe(300_000);
  });
});
