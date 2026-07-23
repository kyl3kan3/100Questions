import "server-only";

import { randomUUID } from "node:crypto";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import {
  availableCreditBalanceSql,
  availableCreditPurchaseSql,
} from "./billing/credit-lot-sql";
import { getBenchmarkConfig, PROVIDERS } from "@/lib/config";
import { getDb } from "@/lib/db";
import {
  actionRecommendations,
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

export function toPublicRun(run: RunSummary) {
  const {
    actualCostMicros,
    budgetCeilingMicros,
    costProvenance,
    estimatedCostMicros,
    ...publicRun
  } = run;

  void actualCostMicros;
  void budgetCeilingMicros;
  void costProvenance;
  void estimatedCostMicros;

  return publicRun;
}

export type CreateReservedRunResult =
  | { state: "created" | "existing"; run: RunSummary }
  | { state: "no_credit" | "active_run" | "daily_limit" };

type CreateReservedRunOptions = {
  unlimitedAccess?: boolean;
  baselineRunId?: string;
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
      SELECT ${availableCreditPurchaseSql(userId)}::uuid AS funding_purchase_id
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
        id, user_id, client_request_id, baseline_run_id, subject_name, canonical_domain,
        description, aliases, competitors, market, locale, status,
        question_count_planned, discovery_count_planned,
        diagnostic_count_planned, provider_calls_planned,
        benchmark_version, question_prompt_version, provider_prompt_version,
        analysis_version, scoring_version, frozen_models, grounding_mode,
        budget_confirmed_at, budget_ceiling_micros, estimated_cost_micros,
        retention_expires_at
      )
      SELECT
        ${id}::uuid, ${userId}, ${clientRequestId}, ${options.baselineRunId ?? null}::uuid, ${input.subjectName},
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
      WHERE (${unlimitedAccess} OR credit.funding_purchase_id IS NOT NULL)
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
        user_id, amount, type, run_id, funding_purchase_id,
        external_reference, metadata
      )
      SELECT ${userId},
        CASE WHEN ${unlimitedAccess} THEN 0 ELSE -1 END,
        'reserve'::credit_ledger_type, id,
        CASE
          WHEN ${unlimitedAccess} THEN NULL
          ELSE credit.funding_purchase_id
        END,
        'run:' || id::text || ':reserve',
        ${JSON.stringify({
          benchmarkVersion: config.prompts.benchmarkVersion,
          funding: unlimitedAccess ? "internal_unlimited" : "prepaid_credit",
        })}::jsonb
      FROM created_run
      CROSS JOIN credit
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
      SELECT ${availableCreditBalanceSql(userId)} AS balance
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
    })
    .from(providerJobs)
    .leftJoin(results, eq(results.jobId, providerJobs.id))
    .where(eq(providerJobs.runId, runId));
  return toPublicRun({
    ...run,
    succeededProviderCalls: Number(progress?.succeededProviderCalls ?? 0),
    failedProviderCalls: Number(progress?.failedProviderCalls ?? 0),
    eligibleProviderCalls: Number(progress?.eligibleProviderCalls ?? 0),
  });
}

export async function getRunResultsForUser(runId: string, userId: string) {
  const run = await getRunForUser(runId, userId);

  if (!run) {
    return null;
  }

  const [rows, actionPlan] = await Promise.all([
    getDb()
      .select({ question: questions, job: providerJobs, result: results })
      .from(questions)
      .leftJoin(providerJobs, eq(providerJobs.questionId, questions.id))
      .leftJoin(results, eq(results.jobId, providerJobs.id))
      .where(eq(questions.runId, runId))
      .orderBy(asc(questions.sortOrder), asc(providerJobs.provider)),
    getDb()
      .select()
      .from(actionRecommendations)
      .where(eq(actionRecommendations.runId, runId))
      .orderBy(asc(actionRecommendations.rank)),
  ]);

  return {
    run: toPublicRun(run),
    actionPlan,
    rows: rows.map(({ question, job, result }) => {
      if (!result) {
        return { question, job, result };
      }

      const { costMicros, costProvenance, ...publicResult } = result;
      void costMicros;
      void costProvenance;

      return { question, job, result: publicResult };
    }),
  };
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
  const db = getDb();
  const releaseReference = `run:${runId}:release`;
  const [, cancellation] = await db.batch([
    db.execute(sql`
      select pg_advisory_xact_lock(hashtextextended(${userId}::text, 0))
    `),
    db.execute<{
      id: string;
      workflow_run_id: string | null;
      credit_released: boolean;
    }>(sql`
      with target_run as materialized (
        select id, workflow_run_id
        from runs
        where id = ${runId}::uuid
          and user_id = ${userId}
          and status = 'queued'
          and claim_step_id is null
        for update
      ),
      reservation as materialized (
        select amount, funding_purchase_id
        from credit_ledger
        where user_id = ${userId}
          and run_id = ${runId}::uuid
          and type = 'reserve'::credit_ledger_type
        limit 1
      ),
      consumption as materialized (
        select 1
        from credit_ledger
        where user_id = ${userId}
          and run_id = ${runId}::uuid
          and type = 'consume'::credit_ledger_type
        limit 1
      ),
      existing_release as materialized (
        select id
        from credit_ledger
        where external_reference = ${releaseReference}
          and user_id = ${userId}
          and run_id = ${runId}::uuid
          and type = 'release'::credit_ledger_type
        limit 1
      ),
      released_credit as (
        insert into credit_ledger (
          user_id,
          amount,
          type,
          run_id,
          funding_purchase_id,
          external_reference,
          metadata
        )
        select
          ${userId},
          -reservation.amount,
          'release'::credit_ledger_type,
          ${runId}::uuid,
          reservation.funding_purchase_id,
          ${releaseReference},
          jsonb_build_object(
            'state', 'released',
            'reason', 'user_cancelled_before_provider_work'
          )
        from reservation
        cross join target_run
        where not exists (select 1 from consumption)
          and not exists (select 1 from existing_release)
        returning id
      ),
      release_outcome as materialized (
        select (
          exists (select 1 from released_credit)
          or exists (select 1 from existing_release)
        ) as credit_released
      ),
      cancelled_run as (
        update runs as cancelled
        set
          status = 'cancelled',
          failure_code = 'CANCELLED_BEFORE_PROVIDER_WORK',
          failure_message = 'Cancelled before provider work began.',
          completed_at = now(),
          updated_at = now()
        from target_run, release_outcome
        where cancelled.id = target_run.id
          and release_outcome.credit_released
        returning
          cancelled.id,
          target_run.workflow_run_id,
          release_outcome.credit_released
      )
      select id, workflow_run_id, credit_released
      from cancelled_run
    `),
  ]);

  const cancelled = cancellation.rows[0];
  return cancelled
    ? {
        id: cancelled.id,
        workflowRunId: cancelled.workflow_run_id,
        creditReleased: cancelled.credit_released,
      }
    : null;
}

export type CancelRunResult =
  | {
      state: "cancelled";
      workflowRunId: string | null;
      creditReleased: boolean;
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
  const estimatedMicros =
    getBenchmarkConfig().budget.estimatedMicrosPerProviderCall;
  const releaseReference = `run:${runId}:release`;
  // Neon HTTP batches run in one transaction. The advisory lock serializes
  // consume/release ledger actions; the following row lock gives reconciliation
  // a fresh READ COMMITTED snapshot after in-flight result persistence commits.
  const [, , , cancellation] = await db.batch([
    db.execute(sql`
      select pg_advisory_xact_lock(hashtextextended(${userId}::text, 0))
    `),
    db.execute(sql`
      select id
      from runs
      where id = ${runId}::uuid
        and user_id = ${userId}
      for update
    `),
    db.execute(sql`
      update provider_jobs as cancelled_job
      set
        status = 'failed',
        attempts = greatest(
          cancelled_job.attempts,
          case when cancelled_job.status = 'running' then 1 else 0 end
        ),
        error_code = 'RUN_CANCELLED',
        error_message = 'The run was cancelled before this job completed.',
        finished_at = now(),
        updated_at = now()
      where cancelled_job.run_id = ${runId}::uuid
        and cancelled_job.status in ('queued', 'running')
        and exists (
          select 1
          from runs as active_run
          where active_run.id = ${runId}::uuid
            and active_run.user_id = ${userId}
            and active_run.status in ('queued', 'generating', 'querying', 'analyzing')
        )
    `),
    db.execute<{
      workflow_run_id: string | null;
      credit_released: boolean;
    }>(sql`
      with target_run as materialized (
        select
          workflow_run_id,
          actual_cost_micros,
          cost_provenance
        from runs
        where id = ${runId}::uuid
          and user_id = ${userId}
          and status in ('queued', 'generating', 'querying', 'analyzing')
      ),
      summary as (
        select
          count(*) filter (where job.status = 'succeeded')::integer
            as succeeded_provider_calls,
          count(*) filter (where job.status = 'failed')::integer
            as failed_provider_calls,
          count(*) filter (where stored_result.score_eligible = true)::integer
            as eligible_provider_calls,
          coalesce(sum(stored_result.cost_micros), 0)::bigint
            as persisted_cost_micros,
          coalesce(
            sum(
              case
                when job.status = 'failed'
                  and job.attempts > 0
                  and stored_result.id is null
                  then job.attempts * ${estimatedMicros}
                else 0
              end
            ),
            0
          )::bigint as estimated_unpersisted_cost_micros,
          coalesce(
            bool_and(job.attempts = 0 and job.started_at is null),
            true
          )
            as credit_may_be_released
        from provider_jobs as job
        cross join target_run
        left join results as stored_result
          on stored_result.job_id = job.id
        where job.run_id = ${runId}::uuid
      ),
      provenance_inputs as (
        select target_run.cost_provenance::text as provenance
        from target_run
        where target_run.actual_cost_micros > 0
          and target_run.cost_provenance <> 'unavailable'
        union all
        select stored_result.cost_provenance::text
        from results as stored_result
        inner join provider_jobs as result_job
          on result_job.id = stored_result.job_id
        cross join target_run
        where result_job.run_id = ${runId}::uuid
          and stored_result.cost_micros > 0
          and stored_result.cost_provenance <> 'unavailable'
        union all
        select 'estimated'
        from summary
        where summary.estimated_unpersisted_cost_micros > 0
      ),
      combined_provenance as (
        select
          case
            when count(distinct provenance) = 0
              then 'unavailable'::cost_provenance
            when count(distinct provenance) = 1
              then min(provenance)::cost_provenance
            else 'mixed'::cost_provenance
          end as cost_provenance
        from provenance_inputs
      ),
      reservation as materialized (
        select amount, funding_purchase_id
        from credit_ledger
        where user_id = ${userId}
          and run_id = ${runId}::uuid
          and type = 'reserve'::credit_ledger_type
        limit 1
      ),
      consumption as materialized (
        select 1
        from credit_ledger
        where user_id = ${userId}
          and run_id = ${runId}::uuid
          and type = 'consume'::credit_ledger_type
        limit 1
      ),
      existing_release as materialized (
        select id
        from credit_ledger
        where external_reference = ${releaseReference}
          and user_id = ${userId}
          and run_id = ${runId}::uuid
          and type = 'release'::credit_ledger_type
        limit 1
      ),
      released_credit as (
        insert into credit_ledger (
          user_id,
          amount,
          type,
          run_id,
          funding_purchase_id,
          external_reference,
          metadata
        )
        select
          ${userId},
          -reservation.amount,
          'release'::credit_ledger_type,
          ${runId}::uuid,
          reservation.funding_purchase_id,
          ${releaseReference},
          jsonb_build_object(
            'state', 'released',
            'reason', 'cancelled_before_provider_work'
          )
        from reservation
        cross join summary
        where summary.credit_may_be_released
          and not exists (select 1 from consumption)
          and not exists (select 1 from existing_release)
        returning id
      ),
      credit_release as materialized (
        select (
          exists (select 1 from released_credit)
          or exists (select 1 from existing_release)
        ) as credit_released
      ),
      cancelled_run as (
        update runs as cancelled
        set
          status = 'cancelled',
          succeeded_provider_calls = summary.succeeded_provider_calls,
          failed_provider_calls = summary.failed_provider_calls,
          eligible_provider_calls = summary.eligible_provider_calls,
          actual_cost_micros =
            target_run.actual_cost_micros
            + summary.persisted_cost_micros
            + summary.estimated_unpersisted_cost_micros,
          cost_provenance = combined_provenance.cost_provenance,
          failure_code = ${failureCode},
          failure_message = ${failureMessage},
          completed_at = now(),
          updated_at = now()
        from target_run, summary, combined_provenance, credit_release
        where cancelled.id = ${runId}::uuid
        returning
          target_run.workflow_run_id,
          credit_release.credit_released
      )
      select workflow_run_id, credit_released
      from cancelled_run
    `),
  ]);
  const cancelled = cancellation.rows[0];

  if (!cancelled) {
    const existing = await getRunForUser(runId, userId);
    return { state: existing ? "not_active" : "not_found" };
  }

  return {
    state: "cancelled",
    workflowRunId: cancelled.workflow_run_id,
    creditReleased: cancelled.credit_released,
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
