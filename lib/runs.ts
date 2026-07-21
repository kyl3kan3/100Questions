import "server-only";

import { randomUUID } from "node:crypto";

import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";

import { getBenchmarkConfig, PROVIDERS } from "@/lib/config";
import { getDb } from "@/lib/db";
import {
  providerJobs,
  questions,
  results,
  runs,
  workflowDispatches,
  type FrozenModels,
} from "@/lib/db/schema";
import type { CreateRunInput } from "@/lib/validation/run";

const activeStatuses = [
  "queued",
  "generating",
  "querying",
  "analyzing",
] as const;

export type RunSummary = typeof runs.$inferSelect;

export type CreateReservedRunResult =
  | { state: "created" | "existing"; run: RunSummary }
  | { state: "no_credit" | "active_run" | "daily_limit" };

type CreateReservedRunOptions = {
  unlimitedAccess?: boolean;
};

export async function createReservedRun(
  userId: string,
  clientRequestId: string,
  input: CreateRunInput,
  options: CreateReservedRunOptions = {},
): Promise<CreateReservedRunResult> {
  const db = getDb();
  const config = getBenchmarkConfig();
  const unlimitedAccess = options.unlimitedAccess === true;
  const id = randomUUID();
  const discoveryCount = Math.round(
    input.questionCount * config.benchmark.discoveryRatio,
  );
  const diagnosticCount = input.questionCount - discoveryCount;
  const providerCalls = input.questionCount * PROVIDERS.length;
  const plannedAiCalls =
    providerCalls * config.budget.aiCallsPerProviderJob +
    config.budget.questionGenerationCallAllowance;
  const estimatedCost =
    plannedAiCalls * config.budget.estimatedMicrosPerProviderCall;
  const budgetCeiling =
    plannedAiCalls * config.budget.ceilingMicrosPerProviderCall;
  const retentionExpiresAt = new Date(
    Date.now() + config.benchmark.retentionDays * 86_400_000,
  );
  const models: FrozenModels = config.models;
  const today = new Date().toISOString().slice(0, 10);

  const query = sql`
    WITH existing AS (
      SELECT id FROM runs
      WHERE user_id = ${userId} AND client_request_id = ${clientRequestId}
      LIMIT 1
    ),
    credit AS (
      SELECT COALESCE(SUM(amount), 0)::integer AS balance
      FROM credit_ledger
      WHERE user_id = ${userId}
    ),
    usage AS (
      SELECT
        COALESCE(runs_reserved, 0)::integer AS runs_reserved,
        COALESCE(cost_reserved_micros, 0)::bigint AS cost_reserved_micros
      FROM daily_usage
      WHERE user_id = ${userId} AND usage_date = ${today}::date
    ),
    created_run AS (
      INSERT INTO runs (
        id, user_id, client_request_id, subject_name, canonical_domain,
        description, aliases, competitors, market, locale, status,
        question_count_planned, discovery_count_planned,
        diagnostic_count_planned, provider_calls_planned,
        benchmark_version, question_prompt_version, provider_prompt_version,
        analysis_version, scoring_version, frozen_models, grounding_mode,
        budget_confirmed_at, budget_ceiling_micros, estimated_cost_micros,
        retention_expires_at
      )
      SELECT
        ${id}::uuid, ${userId}, ${clientRequestId}, ${input.subjectName},
        ${input.canonicalDomain}, ${input.description},
        ${JSON.stringify(input.aliases)}::jsonb,
        ${JSON.stringify(input.competitors)}::jsonb,
        ${input.market}, ${input.locale}, 'queued'::run_status,
        ${input.questionCount}, ${discoveryCount}, ${diagnosticCount},
        ${providerCalls}, ${config.prompts.benchmarkVersion},
        ${config.prompts.questionVersion}, ${config.prompts.providerVersion},
        ${config.prompts.analysisVersion}, ${config.prompts.scoringVersion},
        ${JSON.stringify(models)}::jsonb, 'web_grounded'::grounding_mode,
        now(), ${budgetCeiling}::bigint, ${estimatedCost}::bigint,
        ${retentionExpiresAt.toISOString()}::timestamptz
      FROM credit
      LEFT JOIN usage ON true
      WHERE (${unlimitedAccess} OR credit.balance >= 1)
        AND (
          ${unlimitedAccess}
          OR COALESCE(usage.runs_reserved, 0) < ${config.budget.dailyRunLimit}
        )
        AND (
          ${unlimitedAccess}
          OR COALESCE(usage.cost_reserved_micros, 0) + ${budgetCeiling}::bigint
            <= ${config.budget.dailyCostLimitMicros}::bigint
        )
        AND NOT EXISTS (SELECT 1 FROM existing)
      RETURNING id
    ),
    reserved_credit AS (
      INSERT INTO credit_ledger (
        user_id, amount, type, run_id, external_reference, metadata
      )
      SELECT ${userId},
        CASE WHEN ${unlimitedAccess} THEN 0 ELSE -1 END,
        'reserve'::credit_ledger_type, id,
        'run:' || id::text || ':reserve',
        ${JSON.stringify({
          benchmarkVersion: config.prompts.benchmarkVersion,
          funding: unlimitedAccess ? "internal_unlimited" : "prepaid_credit",
        })}::jsonb
      FROM created_run
      RETURNING run_id
    ),
    dispatch AS (
      INSERT INTO workflow_dispatches (run_id, status)
      SELECT id, 'pending'::workflow_dispatch_status FROM created_run
      RETURNING run_id
    ),
    tracked_usage AS (
      INSERT INTO daily_usage (
        user_id, usage_date, runs_reserved, provider_calls_reserved,
        cost_reserved_micros
      )
      SELECT ${userId}, ${today}::date, 1, ${providerCalls}, ${budgetCeiling}
      FROM created_run
      ON CONFLICT (user_id, usage_date) DO UPDATE SET
        runs_reserved = daily_usage.runs_reserved + 1,
        provider_calls_reserved = daily_usage.provider_calls_reserved + EXCLUDED.provider_calls_reserved,
        cost_reserved_micros = daily_usage.cost_reserved_micros + EXCLUDED.cost_reserved_micros,
        updated_at = now()
      RETURNING id
    )
    SELECT id, 'created'::text AS state FROM created_run
    UNION ALL
    SELECT id, 'existing'::text AS state FROM existing
    LIMIT 1
  `;

  try {
    // Neon HTTP batches run in one transaction. Taking the advisory lock as a
    // separate first statement gives the reservation query a fresh
    // READ COMMITTED snapshot after any concurrent refund/reversal finishes.
    const [, execution] = await db.batch([
      db.execute(sql`
        SELECT pg_advisory_xact_lock(hashtextextended(${userId}::text, 0))
      `),
      db.execute(query),
    ]);
    const row = execution.rows[0] as
      | { id: string; state: "created" | "existing" }
      | undefined;

    if (row) {
      const run = await getRunForUser(row.id, userId);

      if (!run) {
        throw new Error("Run was created but could not be read");
      }

      return { state: row.state, run };
    }
  } catch (error) {
    if (isUniqueViolation(error, "runs_user_client_request_unique")) {
      const [existingRun] = await db
        .select()
        .from(runs)
        .where(
          and(
            eq(runs.userId, userId),
            eq(runs.clientRequestId, clientRequestId),
          ),
        )
        .limit(1);

      if (existingRun) {
        return { state: "existing", run: existingRun };
      }
    }

    if (isUniqueViolation(error, "runs_one_active_per_user_unique")) {
      return { state: "active_run" };
    }

    throw error;
  }

  const [creditRow, activeRun, usageRow] = await Promise.all([
    db.execute(sql`
      SELECT COALESCE(SUM(amount), 0)::integer AS balance
      FROM credit_ledger WHERE user_id = ${userId}
    `),
    db
      .select({ id: runs.id })
      .from(runs)
      .where(and(eq(runs.userId, userId), inArray(runs.status, [...activeStatuses])))
      .limit(1),
    db.execute(sql`
      SELECT
        COALESCE(runs_reserved, 0)::integer AS runs_reserved,
        COALESCE(cost_reserved_micros, 0)::bigint AS cost_reserved_micros
      FROM daily_usage
      WHERE user_id = ${userId} AND usage_date = ${today}::date
      LIMIT 1
    `),
  ]);

  const balance = Number(
    (creditRow.rows[0] as { balance?: number | string } | undefined)?.balance ?? 0,
  );
  const usedToday = Number(
    (usageRow.rows[0] as { runs_reserved?: number | string } | undefined)
      ?.runs_reserved ?? 0,
  );
  const costReservedToday = Number(
    (
      usageRow.rows[0] as
        | { cost_reserved_micros?: number | string }
        | undefined
    )?.cost_reserved_micros ?? 0,
  );

  if (!unlimitedAccess && balance < 1) {
    return { state: "no_credit" };
  }

  if (activeRun.length > 0) {
    return { state: "active_run" };
  }

  if (
    !unlimitedAccess &&
    (usedToday >= config.budget.dailyRunLimit ||
      costReservedToday + budgetCeiling > config.budget.dailyCostLimitMicros)
  ) {
    return { state: "daily_limit" };
  }

  throw new Error("Run reservation did not complete");
}

export async function listRunsForUser(userId: string, limit = 20) {
  return getDb()
    .select()
    .from(runs)
    .where(eq(runs.userId, userId))
    .orderBy(desc(runs.createdAt))
    .limit(Math.min(Math.max(limit, 1), 50));
}

export async function getRunForUser(runId: string, userId: string) {
  const [run] = await getDb()
    .select()
    .from(runs)
    .where(and(eq(runs.id, runId), eq(runs.userId, userId)))
    .limit(1);

  return run ?? null;
}

export async function getRunProgressForUser(runId: string, userId: string) {
  const run = await getRunForUser(runId, userId);

  if (!run) {
    return null;
  }

  const [progress] = await getDb()
    .select({
      succeededProviderCalls: sql<number>`count(*) filter (where ${providerJobs.status} = 'succeeded')::integer`,
      failedProviderCalls: sql<number>`count(*) filter (where ${providerJobs.status} = 'failed')::integer`,
      eligibleProviderCalls: sql<number>`count(*) filter (where ${results.scoreEligible} = true)::integer`,
      persistedResultCostMicros: sql<number>`coalesce(sum(${results.costMicros}), 0)::bigint`,
    })
    .from(providerJobs)
    .leftJoin(results, eq(results.jobId, providerJobs.id))
    .where(eq(providerJobs.runId, runId));
  const terminal = ["complete", "partial", "failed", "cancelled"].includes(
    run.status,
  );

  return {
    ...run,
    succeededProviderCalls: Number(progress?.succeededProviderCalls ?? 0),
    failedProviderCalls: Number(progress?.failedProviderCalls ?? 0),
    eligibleProviderCalls: Number(progress?.eligibleProviderCalls ?? 0),
    actualCostMicros: terminal
      ? run.actualCostMicros
      : run.actualCostMicros + Number(progress?.persistedResultCostMicros ?? 0),
  };
}

export async function getRunResultsForUser(runId: string, userId: string) {
  const run = await getRunForUser(runId, userId);

  if (!run) {
    return null;
  }

  const rows = await getDb()
    .select({ question: questions, job: providerJobs, result: results })
    .from(questions)
    .leftJoin(providerJobs, eq(providerJobs.questionId, questions.id))
    .leftJoin(results, eq(results.jobId, providerJobs.id))
    .where(eq(questions.runId, runId))
    .orderBy(asc(questions.sortOrder), asc(providerJobs.provider));

  return { run, rows };
}

export async function markWorkflowStarted(
  runId: string,
  workflowRunId: string,
) {
  const db = getDb();
  await db.batch([
    db
      .update(runs)
      .set({
        workflowRunId,
        dispatchStatus: "started",
        updatedAt: new Date(),
      })
      .where(eq(runs.id, runId)),
    db
      .update(workflowDispatches)
      .set({
        status: "started",
        workflowRunId,
        attemptCount: sql`${workflowDispatches.attemptCount} + 1`,
        lastAttemptAt: new Date(),
        dispatchedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(workflowDispatches.runId, runId)),
  ]);
}

export async function markWorkflowDispatchFailed(
  runId: string,
  code: string,
  message: string,
) {
  const safeMessage = message.slice(0, 500);
  const db = getDb();
  await db.batch([
    db
      .update(runs)
      .set({
        dispatchStatus: "failed",
        status: "failed",
        failureCode: code,
        failureMessage: safeMessage,
        updatedAt: new Date(),
        completedAt: new Date(),
      })
      .where(eq(runs.id, runId)),
    db
      .update(workflowDispatches)
      .set({
        status: "failed",
        failureCode: code,
        failureMessage: safeMessage,
        attemptCount: sql`${workflowDispatches.attemptCount} + 1`,
        lastAttemptAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(workflowDispatches.runId, runId)),
  ]);
}

export async function recordWorkflowDispatchAttemptFailure(
  runId: string,
  code: string,
  message: string,
) {
  const safeMessage = message.slice(0, 500);

  await getDb()
    .update(workflowDispatches)
    .set({
      status: "pending",
      failureCode: code.slice(0, 96),
      failureMessage: safeMessage,
      attemptCount: sql`${workflowDispatches.attemptCount} + 1`,
      lastAttemptAt: new Date(),
      nextAttemptAt: new Date(Date.now() + 60_000),
      updatedAt: new Date(),
    })
    .where(eq(workflowDispatches.runId, runId));
}

export async function cancelQueuedRunForUser(runId: string, userId: string) {
  const [cancelled] = await getDb()
    .update(runs)
    .set({
      status: "cancelled",
      failureCode: "cancelled_by_user",
      failureMessage: "Cancelled before provider work began.",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(runs.id, runId),
        eq(runs.userId, userId),
        eq(runs.status, "queued"),
        isNull(runs.claimStepId),
      ),
    )
    .returning({ id: runs.id, workflowRunId: runs.workflowRunId });

  return cancelled ?? null;
}

export type CancelRunResult =
  | {
      state: "cancelled";
      workflowRunId: string | null;
      creditMayBeReleased: boolean;
    }
  | { state: "not_active" }
  | { state: "not_found" };

type CancelRunOptions = {
  failureCode?: string;
  failureMessage?: string;
};

/**
 * Makes cancellation authoritative in Postgres before asking Workflow to stop.
 * Any provider answer already checkpointed is retained, while queued or
 * in-flight jobs are closed so no additional work can be scheduled.
 */
export async function cancelRunForUser(
  runId: string,
  userId: string,
  options: CancelRunOptions = {},
): Promise<CancelRunResult> {
  const db = getDb();
  const failureCode = (options.failureCode ?? "CANCELLED_BY_USER").slice(0, 96);
  const failureMessage = (
    options.failureMessage ??
    "Cancelled by user. Completed evidence was retained and no further calls will be scheduled."
  ).slice(0, 500);
  const [cancelled] = await db
    .update(runs)
    .set({
      status: "cancelled",
      failureCode,
      failureMessage,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(runs.id, runId),
        eq(runs.userId, userId),
        inArray(runs.status, [...activeStatuses]),
      ),
    )
    .returning({
      workflowRunId: runs.workflowRunId,
      actualCostMicros: runs.actualCostMicros,
      costProvenance: runs.costProvenance,
    });

  if (!cancelled) {
    const existing = await getRunForUser(runId, userId);
    return { state: existing ? "not_active" : "not_found" };
  }

  await db
    .update(providerJobs)
    .set({
      status: "failed",
      errorCode: "RUN_CANCELLED",
      errorMessage: "The run was cancelled before this job completed.",
      finishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(providerJobs.runId, runId),
        inArray(providerJobs.status, ["queued", "running"]),
      ),
    );

  const jobs = await db
    .select({
      status: providerJobs.status,
      attempts: providerJobs.attempts,
      resultId: results.id,
      scoreEligible: results.scoreEligible,
      costMicros: results.costMicros,
      costProvenance: results.costProvenance,
    })
    .from(providerJobs)
    .leftJoin(results, eq(results.jobId, providerJobs.id))
    .where(eq(providerJobs.runId, runId));
  const estimatedMicros = getBenchmarkConfig().budget.estimatedMicrosPerProviderCall;
  const estimatedUnpersistedCost = jobs.reduce(
    (total, job) =>
      job.status === "failed" && job.attempts > 0 && !job.resultId
        ? total + job.attempts * estimatedMicros
        : total,
    0,
  );
  const persistedCost = jobs.reduce(
    (total, job) => total + (job.costMicros ?? 0),
    0,
  );
  const provenances = new Set<RunSummary["costProvenance"]>();

  if (
    cancelled.actualCostMicros > 0 &&
    cancelled.costProvenance !== "unavailable"
  ) {
    provenances.add(cancelled.costProvenance);
  }

  for (const job of jobs) {
    if (
      job.costMicros &&
      job.costProvenance &&
      job.costProvenance !== "unavailable"
    ) {
      provenances.add(job.costProvenance);
    }
  }

  if (estimatedUnpersistedCost > 0) {
    provenances.add("estimated");
  }

  await db
    .update(runs)
    .set({
      succeededProviderCalls: jobs.filter((job) => job.status === "succeeded")
        .length,
      failedProviderCalls: jobs.filter((job) => job.status === "failed").length,
      eligibleProviderCalls: jobs.filter((job) => job.scoreEligible === true)
        .length,
      actualCostMicros:
        cancelled.actualCostMicros + persistedCost + estimatedUnpersistedCost,
      costProvenance:
        provenances.size > 1
          ? "mixed"
          : (provenances.values().next().value ?? "unavailable"),
      updatedAt: new Date(),
    })
    .where(and(eq(runs.id, runId), eq(runs.status, "cancelled")));

  return {
    state: "cancelled",
    workflowRunId: cancelled.workflowRunId,
    creditMayBeReleased: jobs.every((job) => job.attempts === 0),
  };
}

export async function deleteRunForUser(runId: string, userId: string) {
  const deleted = await getDb()
    .delete(runs)
    .where(
      and(
        eq(runs.id, runId),
        eq(runs.userId, userId),
        inArray(runs.status, ["complete", "partial", "failed", "cancelled"]),
      ),
    )
    .returning({ id: runs.id });

  return deleted.length > 0;
}

function isUniqueViolation(error: unknown, constraint: string): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("duplicate key") && error.message.includes(constraint)
  );
}
