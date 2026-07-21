import "server-only";

import { z } from "zod";

const positiveInteger = z.coerce.number().int().positive();

function envInteger(name: string, fallback: number): number {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = positiveInteger.safeParse(value);

  if (!parsed.success) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed.data;
}

export const PROVIDERS = ["openai", "anthropic", "google", "xai"] as const;
export type BenchmarkProvider = (typeof PROVIDERS)[number];

export function getBenchmarkConfig() {
  return {
    models: {
      openai:
        process.env.AI_GATEWAY_OPENAI_MODEL ?? "openai/gpt-5.4-mini",
      anthropic:
        process.env.AI_GATEWAY_ANTHROPIC_MODEL ??
        "anthropic/claude-sonnet-4.6",
      google:
        process.env.AI_GATEWAY_GOOGLE_MODEL ??
        "google/gemini-3.1-flash-lite",
      xai: process.env.AI_GATEWAY_XAI_MODEL ?? "xai/grok-4.5",
      analysis:
        process.env.AI_GATEWAY_ANALYSIS_MODEL ?? "openai/gpt-5.4-nano",
    },
    workflow: {
      // Keep one call in flight so a run has deterministic cost and ordering.
      // The shared search harness removes provider-native search throttles;
      // this delay is operational pacing, not a retry strategy.
      aiCallDelayMs: envInteger("WORKFLOW_AI_CALL_DELAY_MS", 15_000),
    },
    prompts: {
      questionVersion: "question-v2",
      providerVersion: "provider-v2",
      analysisVersion: "analysis-v2",
      scoringVersion: "scoring-v1",
      benchmarkVersion: "benchmark-v2",
    },
    benchmark: {
      defaultQuestionCount: 25,
      maximumQuestionCount: 25,
      discoveryRatio: 0.8,
      coverageThreshold: 0.9,
      retentionDays: envInteger("RUN_RETENTION_DAYS", 30),
    },
    budget: {
      // One grounded answer request plus, when an entity is mentioned, one
      // structured-analysis request. Reservation uses the worst case.
      aiCallsPerProviderJob: 2,
      // Brief generation plus as many as three validation rounds per cohort.
      questionGenerationCallAllowance: 7,
      estimatedMicrosPerProviderCall: envInteger(
        "ESTIMATED_MICROS_PER_PROVIDER_CALL",
        12_000,
      ),
      ceilingMicrosPerProviderCall: envInteger(
        "BUDGET_MICROS_PER_PROVIDER_CALL",
        19_000,
      ),
      dailyRunLimit: envInteger("DAILY_RUN_LIMIT", 3),
      dailyCostLimitMicros: envInteger(
        "DAILY_COST_LIMIT_MICROS",
        12_000_000,
      ),
    },
  } as const;
}

export function formatMicros(micros: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(micros / 1_000_000);
}
