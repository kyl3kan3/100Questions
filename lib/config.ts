import "server-only";

import { z } from "zod";

import {
  BENCHMARK_MODEL_DEFAULTS,
  BENCHMARK_QUESTION_COUNT,
  BENCHMARK_RETENTION_DAYS,
} from "./product-facts";

const positiveInteger = z.coerce.number().int().positive();
const nonnegativeInteger = z.coerce.number().int().nonnegative();

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

function envNonnegativeInteger(name: string, fallback: number): number {
  const value = process.env[name];

  if (!value) return fallback;

  const parsed = nonnegativeInteger.safeParse(value);
  if (!parsed.success) {
    throw new Error(`${name} must be a nonnegative integer`);
  }

  return parsed.data;
}

export const PROVIDERS = ["openai", "anthropic", "google", "xai"] as const;
export type BenchmarkProvider = (typeof PROVIDERS)[number];

export function getBenchmarkConfig() {
  return {
    models: {
      openai:
        process.env.AI_GATEWAY_OPENAI_MODEL ?? BENCHMARK_MODEL_DEFAULTS.openai,
      anthropic:
        process.env.AI_GATEWAY_ANTHROPIC_MODEL ??
        BENCHMARK_MODEL_DEFAULTS.anthropic,
      google:
        process.env.AI_GATEWAY_GOOGLE_MODEL ??
        BENCHMARK_MODEL_DEFAULTS.google,
      xai: process.env.AI_GATEWAY_XAI_MODEL ?? BENCHMARK_MODEL_DEFAULTS.xai,
      analysis:
        process.env.AI_GATEWAY_ANALYSIS_MODEL ?? BENCHMARK_MODEL_DEFAULTS.analysis,
    },
    workflow: {
      // Run one shared question across the four providers concurrently. The
      // hard cap prevents a configuration mistake from creating an unbounded
      // fan-out, while batch-level guard checks preserve the cost ceiling.
      maxConcurrentJobs: Math.min(
        envInteger("WORKFLOW_MAX_CONCURRENT_JOBS", PROVIDERS.length),
        PROVIDERS.length,
      ),
      // Bounded fan-out already limits each batch to one call per provider.
      // Keep an optional cooldown for incident response, but do not add nearly
      // two minutes of idle time to every healthy benchmark by default.
      aiCallDelayMs: envNonnegativeInteger("WORKFLOW_AI_CALL_DELAY_MS", 0),
      // Keep a hard ceiling even though bounded batching should normally finish
      // well inside it. This prevents an abandoned workflow from spending
      // indefinitely when an upstream provider stalls.
      maxRunDurationMs:
        envInteger("WORKFLOW_MAX_RUN_DURATION_MINUTES", 120) * 60_000,
    },
    prompts: {
      questionVersion: "question-v2",
      providerVersion: "provider-v2",
      analysisVersion: "analysis-v2",
      scoringVersion: "scoring-v1",
      benchmarkVersion: "benchmark-v2",
    },
    benchmark: {
      defaultQuestionCount: BENCHMARK_QUESTION_COUNT,
      maximumQuestionCount: BENCHMARK_QUESTION_COUNT,
      discoveryRatio: 0.8,
      coverageThreshold: 0.9,
      retentionDays: envInteger("RUN_RETENTION_DAYS", BENCHMARK_RETENTION_DAYS),
    },
    budget: {
      // One grounded answer request plus, when an entity is mentioned, one
      // structured-analysis request. Reservation uses the worst case.
      aiCallsPerProviderJob: 2,
      // Brief generation plus as many as three validation rounds per cohort,
      // each with one tightly scoped malformed-output repair attempt.
      questionGenerationCallAllowance: 14,
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
