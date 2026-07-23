import { describe, expect, it, vi } from "vitest";

const { workflowBatch, workflowExecute, workflowGetDb } = vi.hoisted(() => {
  const workflowBatch = vi.fn();
  const workflowExecute = vi.fn(() => ({}));
  return {
    workflowBatch,
    workflowExecute,
    workflowGetDb: vi.fn(() => ({
      batch: workflowBatch,
      execute: workflowExecute,
    })),
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/analyze", () => ({ analyzeAnswer: vi.fn() }));
vi.mock("@/lib/action-plan", () => ({ buildActionPlan: vi.fn() }));
vi.mock("@/lib/ai/generate-questions", () => ({
  generateBenchmarkQuestions: vi.fn(),
}));
vi.mock("@/lib/ai/models", () => ({
  getProviderModel: vi.fn(),
  PROVIDERS: ["openai", "anthropic", "google", "xai"],
}));
vi.mock("@/lib/ai/providers", () => ({
  classifyProviderError: vi.fn(),
  combineCostProvenance: (left: string, right: string) => {
    if (left === "unavailable") return right;
    if (right === "unavailable") return left;
    return left === right ? left : "mixed";
  },
  combineUsage: vi.fn(),
  getGatewayGenerationCostMicros: vi.fn(),
  providerErrorDiagnostic: vi.fn(),
  queryGroundedProvider: vi.fn(),
}));
vi.mock("@/lib/billing/credits", () => ({
  consumeReservedCreditForRun: vi.fn(),
  releaseReservedCreditForRun: vi.fn(),
}));
vi.mock("@/lib/config", () => ({ getBenchmarkConfig: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: workflowGetDb }));
vi.mock("@/lib/db/schema", () => ({
  actionRecommendations: {},
  dailyUsage: {},
  providerJobs: {},
  questions: {},
  results: {},
  runs: {},
  workflowDispatches: {},
}));
vi.mock("@/lib/email/send-run-notification", () => ({
  sendRunNotificationEmail: vi.fn(),
}));
vi.mock("@/lib/workflow-errors", () => ({
  workflowErrorMessage: vi.fn(),
}));
vi.mock("@/lib/workflow-finalization", () => ({
  ACTION_PLAN_FINALIZATION_RETRY_CODE: "ACTION_PLAN_FINALIZATION_RETRY",
  isActionPlanFinalizationRetry: (status: string, failureCode: string | null) =>
    status === "analyzing" &&
    failureCode === "ACTION_PLAN_FINALIZATION_RETRY",
}));

import {
  calculateAnalysisFailureAttempts,
  calculateCompletedJobCost,
  estimatedUnpersistedFailureCost,
  persistAnalysisFailureAttempt,
} from "./visibility";

describe("visibility workflow cost accounting", () => {
  const estimate = 1_000;

  it("falls back independently for every unpriced successful call", () => {
    expect(
      calculateCompletedJobCost(
        { estimatedMicrosPerProviderCall: estimate },
        {
          attempts: 1,
          costMicros: 0,
          costProvenance: "unavailable",
        },
        {
          analysisAttempts: 1,
          costMicros: 0,
          costProvenance: "unavailable",
        },
        true,
      ),
    ).toEqual({ costMicros: 2_000, costProvenance: "estimated" });
  });

  it("adds a fallback without discarding a priced companion call", () => {
    expect(
      calculateCompletedJobCost(
        { estimatedMicrosPerProviderCall: estimate },
        {
          attempts: 1,
          costMicros: 1_500,
          costProvenance: "gateway_actual",
        },
        {
          analysisAttempts: 1,
          costMicros: 0,
          costProvenance: "unavailable",
        },
        true,
      ),
    ).toEqual({ costMicros: 2_500, costProvenance: "mixed" });
  });

  it("accounts for retries in addition to both successful calls", () => {
    expect(
      calculateCompletedJobCost(
        { estimatedMicrosPerProviderCall: estimate },
        {
          attempts: 2,
          costMicros: 800,
          costProvenance: "gateway_actual",
        },
        {
          analysisAttempts: 3,
          costMicros: 700,
          costProvenance: "gateway_actual",
        },
        true,
      ),
    ).toEqual({ costMicros: 4_500, costProvenance: "mixed" });
  });

  it("does not charge for analysis when deterministic analysis skipped the model", () => {
    expect(
      calculateCompletedJobCost(
        { estimatedMicrosPerProviderCall: estimate },
        {
          attempts: 1,
          costMicros: 800,
          costProvenance: "gateway_actual",
        },
        {
          analysisAttempts: 3,
          costMicros: 0,
          costProvenance: "unavailable",
        },
        false,
      ),
    ).toEqual({ costMicros: 800, costProvenance: "gateway_actual" });
  });

  it("subtracts every checkpointed query attempt from a failed analysis", () => {
    expect(calculateAnalysisFailureAttempts(5, 2)).toBe(3);
  });

  it("never invents a second failed attempt when metadata is incomplete", () => {
    expect(calculateAnalysisFailureAttempts(1, 2)).toBe(1);
  });

  it("does not count query retries again after an answer checkpoint", () => {
    expect(
      estimatedUnpersistedFailureCost(
        5,
        "PROVIDER_JOB_FAILED",
        true,
        true,
        estimate,
      ),
    ).toBe(0);
    expect(
      estimatedUnpersistedFailureCost(
        2,
        "RUN_BUDGET_REACHED",
        true,
        false,
        estimate,
      ),
    ).toBe(0);
  });

  it("estimates one analysis call when its failure checkpoint did not persist", () => {
    expect(
      estimatedUnpersistedFailureCost(
        4,
        "PROVIDER_JOB_FAILED",
        true,
        false,
        estimate,
      ),
    ).toBe(1_000);
  });

  it("estimates every failed query attempt when no checkpoint survived", () => {
    expect(
      estimatedUnpersistedFailureCost(
        3,
        "PROVIDER_JOB_FAILED",
        false,
        false,
        estimate,
      ),
    ).toBe(3_000);
  });

  it("persists a failed analysis attempt inside the run-lock transaction", async () => {
    workflowBatch.mockResolvedValueOnce([
      { rows: [{ id: "run_123" }] },
      { rows: [{ result_persisted: true }] },
    ]);

    await persistAnalysisFailureAttempt(
      {
        id: "43d11c7c-4a71-437a-ad81-85715245e516",
        estimatedMicrosPerProviderCall: estimate,
      } as never,
      "02ac19e5-44c9-4f11-8c63-c27880722c5c",
      2,
      3,
    );

    expect(workflowBatch).toHaveBeenCalledTimes(1);
    expect(workflowExecute).toHaveBeenCalledTimes(2);
  });
});
