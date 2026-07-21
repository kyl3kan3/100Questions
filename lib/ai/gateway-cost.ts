import "server-only";

import { gateway } from "@ai-sdk/gateway";

const GATEWAY_COST_LOOKUP_DELAYS_MS = [750] as const;

/**
 * Resolves authoritative Gateway billing data for a completed generation.
 * Generation records can briefly lag the model response, so retry one delayed
 * record lookup. Service, rate-limit, and authentication failures fall back
 * immediately instead of multiplying nonessential observability traffic.
 */
export async function getGatewayGenerationCostMicros(
  generationId: string | null | undefined,
): Promise<number | null> {
  if (!generationId || !/^gen_[0-9A-Za-z]+$/u.test(generationId)) return null;

  for (let attempt = 0; ; attempt += 1) {
    try {
      const info = await gateway.getGenerationInfo({ id: generationId });
      return dollarsToMicros(info.totalCost);
    } catch (error) {
      const delayMs = GATEWAY_COST_LOOKUP_DELAYS_MS[attempt];

      if (delayMs === undefined || !isDelayedGatewayCostRecordError(error)) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export function isDelayedGatewayCostRecordError(error: unknown): boolean {
  const record = readRecord(error);
  const statusCode = finiteIntegerOrNull(record?.statusCode);

  return statusCode === 404 || statusCode === 409 || statusCode === 425;
}

function dollarsToMicros(value: number): number {
  return Math.max(0, Math.round(value * 1_000_000));
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function finiteIntegerOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.trunc(value)
    : null;
}
