import { beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";

const { batch, execute, getDb } = vi.hoisted(() => {
  const batch = vi.fn();
  const execute = vi.fn();
  return {
    batch,
    execute,
    getDb: vi.fn(() => ({ batch, execute })),
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@/lib/billing/credits", () => ({
  availableCreditBalanceSql: vi.fn(),
}));
vi.mock("./billing/credit-lot-sql", () => ({
  availableCreditBalanceSql: vi.fn(),
  availableCreditPurchaseSql: vi.fn(),
}));
vi.mock("@/lib/config", () => ({
  PROVIDERS: ["openai", "anthropic", "google", "xai"],
  getBenchmarkConfig: () => ({
    budget: { estimatedMicrosPerProviderCall: 1_000 },
  }),
}));
vi.mock("@/lib/db", () => ({ getDb }));
vi.mock("@/lib/db/schema", () => ({
  actionRecommendations: {},
  providerJobs: {},
  questions: {},
  results: {},
  runs: {},
  workflowDispatches: {},
}));

import { cancelQueuedRunForUser, cancelRunForUser } from "./runs";

describe("run cancellation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    execute.mockReturnValue({});
  });

  it("closes jobs and reconciles the terminal summary in one database transaction", async () => {
    batch.mockResolvedValueOnce([
      { rows: [] },
      { rows: [{ id: "43d11c7c-4a71-437a-ad81-85715245e516" }] },
      { rows: [] },
      {
        rows: [
          {
            workflow_run_id: "wrun_123",
            credit_released: false,
          },
        ],
      },
    ]);

    await expect(
      cancelRunForUser("43d11c7c-4a71-437a-ad81-85715245e516", "user_123"),
    ).resolves.toEqual({
      state: "cancelled",
      workflowRunId: "wrun_123",
      creditReleased: false,
    });

    expect(batch).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledTimes(4);
    const closeJobsQuery = execute.mock.calls[2]?.[0];
    const renderedCloseJobs = new PgDialect().sqlToQuery(closeJobsQuery);
    expect(renderedCloseJobs.sql).toContain(
      "case when cancelled_job.status = 'running' then 1 else 0 end",
    );
    const cancellationQuery = execute.mock.calls[3]?.[0];
    const rendered = new PgDialect().sqlToQuery(cancellationQuery);
    expect(rendered.sql).toContain(
      "bool_and(job.attempts = 0 and job.started_at is null)",
    );
    expect(rendered.sql).toContain("insert into credit_ledger");
    expect(rendered.sql).toContain(
      "and not exists (select 1 from consumption)",
    );
  });

  it("cancels a queued run only when its reservation release commits", async () => {
    batch.mockResolvedValueOnce([
      { rows: [] },
      {
        rows: [
          {
            id: "43d11c7c-4a71-437a-ad81-85715245e516",
            workflow_run_id: null,
            credit_released: true,
          },
        ],
      },
    ]);

    await expect(
      cancelQueuedRunForUser(
        "43d11c7c-4a71-437a-ad81-85715245e516",
        "user_123",
      ),
    ).resolves.toEqual({
      id: "43d11c7c-4a71-437a-ad81-85715245e516",
      workflowRunId: null,
      creditReleased: true,
    });

    const cancellationQuery = execute.mock.calls[1]?.[0];
    const rendered = new PgDialect().sqlToQuery(cancellationQuery);
    expect(rendered.sql).toContain("insert into credit_ledger");
    expect(rendered.sql).toContain("not exists (select 1 from consumption)");
    expect(rendered.sql).toContain("and release_outcome.credit_released");
  });
});
