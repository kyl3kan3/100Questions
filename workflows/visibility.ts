import {
  and,
  asc,
  eq,
  inArray,
  isNull,
  sql,
} from "drizzle-orm";
import {
  createHook,
  FatalError,
  getStepMetadata,
  RetryableError,
  sleep,
} from "workflow";

import { analyzeAnswer, type AnswerAnalysis } from "@/lib/ai/analyze";
import {
  generateBenchmarkQuestions,
  type GeneratedQuestionSet,
} from "@/lib/ai/generate-questions";
import {
  getProviderModel,
  PROVIDERS,
  type FrozenModelSet,
  type ProviderKey,
} from "@/lib/ai/models";
import {
  classifyProviderError,
  combineCostProvenance,
  combineUsage,
  getGatewayGenerationCostMicros,
  providerErrorDiagnostic,
  providerRetryDelayMs,
  queryGroundedProvider,
  type ClassifiedProviderError,
  type CostProvenance,
  type NormalizedProviderAnswer,
} from "@/lib/ai/providers";
import {
  consumeReservedCreditForRun,
  releaseReservedCreditForRun,
} from "@/lib/billing/credits";
import { getBenchmarkConfig } from "@/lib/config";
import { getDb } from "@/lib/db";
import {
  dailyUsage,
  providerJobs,
  questions,
  results,
  runs,
  workflowDispatches,
  type FrozenModels,
} from "@/lib/db/schema";
import { workflowErrorMessage } from "@/lib/workflow-errors";

type TerminalRunStatus = "complete" | "partial" | "failed" | "cancelled";

export interface VisibilityWorkflowResult {
  runId: string;
  status: TerminalRunStatus | "deduplicated";
  succeededProviderCalls: number;
  failedProviderCalls: number;
  eligibleProviderCalls: number;
  deduplicatedToWorkflowRunId?: string;
}

interface WorkflowRunContext {
  id: string;
  userId: string;
  subjectName: string;
  canonicalDomain: string;
  description: string;
  aliases: string[];
  competitors: string[];
  market: string;
  locale: string;
  discoveryCount: number;
  diagnosticCount: number;
  questionCount: number;
  frozenModels: FrozenModelSet;
  questionPromptVersion: string;
  providerPromptVersion: string;
  analysisVersion: string;
  budgetCeilingMicros: number;
  batchSize: number;
  batchDelayMs: number;
  maxAttempts: number;
  estimatedMicrosPerProviderCall: number;
  usageDate: string;
}

interface ClaimResult {
  claimed: boolean;
  status: string;
  context: WorkflowRunContext | null;
}

interface ProviderJobWork {
  id: string;
  questionId: string;
  questionText: string;
  cohort: "discovery" | "diagnostic";
  provider: ProviderKey;
  model: string;
}

interface DurableProviderAnswer extends NormalizedProviderAnswer {
  workflowStepId: string;
  attempts: number;
}

interface DurableAnswerAnalysis extends AnswerAnalysis {
  analysisAttempts: number;
}

const TERMINAL_STATUSES = [
  "complete",
  "partial",
  "failed",
  "cancelled",
] as const;
const HARD_MAX_AI_ATTEMPTS = 5;
const MAX_QUESTION_GENERATION_CALLS = 7;
const PENDING_ANALYSIS_VERSION = "__pending__";

/**
 * Durable benchmark orchestration. A deterministic hook token and a database
 * claim prevent duplicate active executions for the same application run.
 */
export async function runVisibilityWorkflow(
  runId: string,
): Promise<VisibilityWorkflowResult> {
  "use workflow";

  console.log(`[visibility] START runId=${runId}`);
  const runGuard = createHook({ token: `visibility-run:${runId}` });
  const conflict = await runGuard.getConflict();

  if (conflict) {
    console.log(
      `[visibility] DEDUPLICATED runId=${runId} owner=${conflict.runId}`,
    );
    runGuard.dispose();
    return {
      runId,
      status: "deduplicated",
      succeededProviderCalls: 0,
      failedProviderCalls: 0,
      eligibleProviderCalls: 0,
      deduplicatedToWorkflowRunId: conflict.runId,
    };
  }

  try {
    const claim = await claimRunStep(runId);

    if (!claim.claimed || !claim.context) {
      console.log(
        `[visibility] NOOP runId=${runId} existingStatus=${claim.status}`,
      );
      return await readTerminalResultStep(runId, claim.status);
    }

    const context = claim.context;
    await syncDailyUsageStep(context.userId, context.usageDate);
    let jobs: ProviderJobWork[];

    try {
      let generated = await generateQuestionsStep(context);
      generated = await reconcileQuestionGenerationCostStep(context, generated);
      await persistQuestionAccountingStep(context, generated);
      await persistQuestionsStep(context, generated);
      await ensureProviderJobsStep(context.id);
      jobs = await loadOutstandingJobsStep(context.id);
    } catch (error) {
      const message = workflowErrorMessage(error);
      await failRunStep(context.id, "QUESTION_PHASE_FAILED", message);
      await releaseCreditStep(context, "question_phase_failed");
      await syncDailyUsageStep(context.userId, context.usageDate);
      throw error;
    }

    console.log(
      `[visibility] JOBS runId=${runId} outstanding=${jobs.length}`,
    );
    const queues = Object.fromEntries(
      PROVIDERS.map((provider) => [
        provider,
        jobs.filter((job) => job.provider === provider),
      ]),
    ) as Record<ProviderKey, ProviderJobWork[]>;
    let creditConsumed = false;

    try {
      while (PROVIDERS.some((provider) => queues[provider].length > 0)) {
        const batch: ProviderJobWork[] = [];

        while (batch.length < context.batchSize) {
          let added = false;

          for (const provider of PROVIDERS) {
            const job = queues[provider].shift();
            if (job) {
              batch.push(job);
              added = true;
            }
            if (batch.length === context.batchSize) break;
          }

          if (!added) break;
        }

        const budget = await checkBudgetStep(context, batch.length);

        if (!budget.allowed) {
          const remainingIds = [
            ...batch,
            ...PROVIDERS.flatMap((provider) => queues[provider]),
          ].map(({ id }) => id);
          await markBudgetBlockedJobsStep(context.id, remainingIds);

          if (!creditConsumed) {
            await releaseCreditStep(context, "budget_blocked_before_provider_work");
          }
          break;
        }

        if (!creditConsumed) {
          await consumeCreditStep(context);
          creditConsumed = true;
        }

        await markBatchRunningStep(context.id, batch.map(({ id }) => id));

        console.log(
          `[visibility] BATCH runId=${runId} size=${batch.length} spentMicros=${budget.spentMicros}`,
        );
        const settled = await Promise.allSettled(
          batch.map(async (job) => {
            let answer = await queryProviderStep(context, job);
            answer = await reconcileProviderAnswerCostStep(answer);
            await persistProviderAnswerStep(context, job, answer);
            let analysis = await analyzeAnswerStep(context, job, answer);
            analysis = await reconcileAnalysisCostStep(analysis);
            await persistProviderResultStep(context, job, answer, analysis);
            return job.id;
          }),
        );

        for (let index = 0; index < settled.length; index += 1) {
          const outcome = settled[index];
          const job = batch[index];

          if (outcome.status === "rejected") {
            await markJobFailedStep(
              job.id,
              "PROVIDER_JOB_FAILED",
              workflowErrorMessage(outcome.reason),
            );
          }
        }

        if (
          context.batchDelayMs > 0 &&
          PROVIDERS.some((provider) => queues[provider].length > 0)
        ) {
          await sleep(context.batchDelayMs);
        }
      }

      await markRunAnalyzingStep(context.id);
      const finalized = await finalizeRunStep(context.id);
      await syncDailyUsageStep(context.userId, context.usageDate);
      console.log(
        `[visibility] DONE runId=${runId} status=${finalized.status}`,
      );
      return finalized;
    } catch (error) {
      await failRunStep(
        context.id,
        "WORKFLOW_EXECUTION_FAILED",
        workflowErrorMessage(error),
      );
      await syncDailyUsageStep(context.userId, context.usageDate);
      throw error;
    }
  } finally {
    runGuard.dispose();
  }
}

async function claimRunStep(runId: string): Promise<ClaimResult> {
  "use step";

  const { stepId } = getStepMetadata();
  console.log(`[claimRun] START runId=${runId} stepId=${stepId}`);
  const db = getDb();
  const [run] = await db.select().from(runs).where(eq(runs.id, runId)).limit(1);

  if (!run) {
    console.error(`[claimRun] FAIL runId=${runId} reason=not_found`);
    throw new FatalError("RUN_NOT_FOUND: Benchmark run does not exist.");
  }

  if (TERMINAL_STATUSES.includes(run.status as TerminalRunStatus)) {
    console.log(`[claimRun] DONE runId=${runId} status=${run.status}`);
    return { claimed: false, status: run.status, context: null };
  }

  if (run.claimStepId && run.claimStepId !== stepId) {
    console.log(`[claimRun] DONE runId=${runId} status=already_claimed`);
    return { claimed: false, status: "deduplicated", context: null };
  }

  if (!run.claimStepId) {
    const [claimed] = await db
      .update(runs)
      .set({
        claimStepId: stepId,
        status: run.status === "queued" ? "generating" : run.status,
        startedAt: run.startedAt ?? new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(runs.id, runId),
          eq(runs.status, "queued"),
          isNull(runs.claimStepId),
        ),
      )
      .returning({ claimStepId: runs.claimStepId });

    if (!claimed) {
      const [currentOwner] = await db
        .select({ claimStepId: runs.claimStepId, status: runs.status })
        .from(runs)
        .where(eq(runs.id, runId))
        .limit(1);

      if (!currentOwner || currentOwner.claimStepId !== stepId) {
        console.log(`[claimRun] DONE runId=${runId} status=claim_race_lost`);
        return {
          claimed: false,
          status: currentOwner?.status ?? "deduplicated",
          context: null,
        };
      }
    }
  }

  const dispatchStartedAt = new Date();
  await Promise.all([
    db
      .update(runs)
      .set({ dispatchStatus: "started", updatedAt: dispatchStartedAt })
      .where(and(eq(runs.id, runId), eq(runs.claimStepId, stepId))),
    db
      .update(workflowDispatches)
      .set({
        status: "started",
        dispatchedAt: sql`coalesce(${workflowDispatches.dispatchedAt}, ${dispatchStartedAt})`,
        failureCode: null,
        failureMessage: null,
        updatedAt: dispatchStartedAt,
      })
      .where(eq(workflowDispatches.runId, runId)),
  ]);

  const config = getBenchmarkConfig();
  const maxAttempts = Math.min(
    HARD_MAX_AI_ATTEMPTS,
    Math.max(1, config.workflow.maxAttempts),
  );
  const context: WorkflowRunContext = {
    id: run.id,
    userId: run.userId,
    subjectName: run.subjectName,
    canonicalDomain: run.canonicalDomain,
    description: run.description,
    aliases: run.aliases,
    competitors: run.competitors,
    market: run.market,
    locale: run.locale,
    discoveryCount: run.discoveryCountPlanned,
    diagnosticCount: run.diagnosticCountPlanned,
    questionCount: run.questionCountPlanned,
    frozenModels: normalizeFrozenModels(run.frozenModels),
    questionPromptVersion: run.questionPromptVersion,
    providerPromptVersion: run.providerPromptVersion,
    analysisVersion: run.analysisVersion,
    budgetCeilingMicros: run.budgetCeilingMicros,
    batchSize: Math.min(12, Math.max(1, config.workflow.batchSize)),
    batchDelayMs: config.workflow.batchDelayMs,
    maxAttempts,
    estimatedMicrosPerProviderCall: estimatedMicrosPerCall(run),
    usageDate: run.createdAt.toISOString().slice(0, 10),
  };

  console.log(`[claimRun] DONE runId=${runId} status=claimed`);
  return { claimed: true, status: "generating", context };
}
claimRunStep.maxRetries = 3;

async function generateQuestionsStep(
  context: WorkflowRunContext,
): Promise<GeneratedQuestionSet> {
  "use step";

  const metadata = getStepMetadata();
  console.log(
    `[generateQuestions] START runId=${context.id} attempt=${metadata.attempt}`,
  );

  try {
    const generated = await generateBenchmarkQuestions({
      subjectName: context.subjectName,
      canonicalDomain: context.canonicalDomain,
      description: context.description,
      aliases: context.aliases,
      competitors: context.competitors,
      market: context.market,
      locale: context.locale,
      discoveryCount: context.discoveryCount,
      diagnosticCount: context.diagnosticCount,
      // Question-set generation is a substantially larger structured task than
      // per-answer labeling. Use the run's more capable frozen OpenAI model;
      // the analysis model is intentionally the smallest/cheapest model.
      model: context.frozenModels.openai,
      gatewayUserId: context.userId,
      runId: context.id,
      promptVersion: context.questionPromptVersion,
    });
    console.log(
      `[generateQuestions] DONE runId=${context.id} count=${generated.questions.length}`,
    );
    return {
      ...generated,
      // A failed workflow attempt can still have reached Gateway. No reliable
      // generation ID is available in that case, so reserve the full bounded
      // question-generation call allowance for each failed outer attempt.
      generationCallCount:
        generated.generationCallCount +
        Math.max(0, metadata.attempt - 1) * MAX_QUESTION_GENERATION_CALLS,
    };
  } catch (error) {
    const failure = classifyProviderError(error);
    const diagnostic = providerErrorDiagnostic(error);
    console.error(
      `[generateQuestions] FAIL runId=${context.id} attempt=${metadata.attempt} code=${failure.code} retryable=${failure.retryable} message=${JSON.stringify(failure.message)} diagnostic=${JSON.stringify(diagnostic)}`,
    );
    throwRetriableAiError(failure, context.maxAttempts, "question generation");
  }
}
generateQuestionsStep.maxRetries = HARD_MAX_AI_ATTEMPTS - 1;

async function reconcileQuestionGenerationCostStep(
  context: WorkflowRunContext,
  generated: GeneratedQuestionSet,
): Promise<GeneratedQuestionSet> {
  "use step";

  console.log(
    `[reconcileQuestionCost] START runId=${context.id} generations=${generated.gatewayGenerationIds.length}`,
  );
  const resolvedCosts = await Promise.all(
    generated.gatewayGenerationIds.map(resolveGatewayCostWithoutThrowing),
  );
  const resolved = resolvedCosts.filter(
    (costMicros): costMicros is number => costMicros !== null,
  );
  const unresolvedCalls = Math.max(
    0,
    generated.generationCallCount - resolved.length,
  );
  const reconciledCost =
    resolved.reduce((total, costMicros) => total + costMicros, 0) +
    unresolvedCalls * context.estimatedMicrosPerProviderCall;
  const costMicros = Math.max(generated.costMicros, reconciledCost);
  const costProvenance: CostProvenance =
    unresolvedCalls === 0 && resolved.length === generated.generationCallCount
      ? "gateway_actual"
      : resolved.length > 0 || generated.costMicros > 0
        ? "mixed"
        : "estimated";

  console.log(
    `[reconcileQuestionCost] DONE runId=${context.id} resolved=${resolved.length} estimated=${unresolvedCalls}`,
  );
  return { ...generated, costMicros, costProvenance };
}
reconcileQuestionGenerationCostStep.maxRetries = 0;

async function persistQuestionAccountingStep(
  context: WorkflowRunContext,
  generated: GeneratedQuestionSet,
): Promise<void> {
  "use step";

  console.log(`[persistQuestionAccounting] START runId=${context.id}`);
  await getDb()
    .update(runs)
    .set({
      actualCostMicros: generated.costMicros,
      costProvenance: generated.costProvenance,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(runs.id, context.id),
        inArray(runs.status, ["generating", "querying"]),
      ),
    );
  console.log(`[persistQuestionAccounting] DONE runId=${context.id}`);
}
persistQuestionAccountingStep.maxRetries = 3;

async function persistQuestionsStep(
  context: WorkflowRunContext,
  generated: GeneratedQuestionSet,
): Promise<void> {
  "use step";

  console.log(`[persistQuestions] START runId=${context.id}`);

  if (generated.questions.length !== context.questionCount) {
    throw new FatalError(
      "QUESTION_COUNT_MISMATCH: Generated question count differs from the frozen run.",
    );
  }

  const db = getDb();
  await db
    .insert(questions)
    .values(
      generated.questions.map((question) => ({
        runId: context.id,
        cohort: question.cohort,
        category: question.category,
        text: question.text,
        sortOrder: question.sortOrder,
        generatorModel: generated.generatorModel,
        promptVersion: generated.promptVersion,
        normalizedHash: question.normalizedHash,
      })),
    )
    .onConflictDoNothing();

  const stored = await db
    .select({
      cohort: questions.cohort,
      sortOrder: questions.sortOrder,
      normalizedHash: questions.normalizedHash,
    })
    .from(questions)
    .where(eq(questions.runId, context.id))
    .orderBy(asc(questions.sortOrder));

  if (
    stored.length !== generated.questions.length ||
    stored.some((question, index) => {
      const expected = generated.questions[index];
      return (
        question.sortOrder !== expected.sortOrder ||
        question.cohort !== expected.cohort ||
        question.normalizedHash !== expected.normalizedHash
      );
    })
  ) {
    throw new FatalError(
      "QUESTION_SET_CONFLICT: A different frozen question set already exists.",
    );
  }

  await db
    .update(runs)
    .set({
      questionsGenerated: stored.length,
      status: "querying",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(runs.id, context.id),
        inArray(runs.status, ["generating", "querying"]),
      ),
    );

  console.log(`[persistQuestions] DONE runId=${context.id}`);
}
persistQuestionsStep.maxRetries = 3;

async function ensureProviderJobsStep(runId: string): Promise<number> {
  "use step";

  console.log(`[ensureProviderJobs] START runId=${runId}`);
  const db = getDb();
  const [run] = await db
    .select({ frozenModels: runs.frozenModels })
    .from(runs)
    .where(eq(runs.id, runId))
    .limit(1);

  if (!run) throw new FatalError("RUN_NOT_FOUND: Benchmark run does not exist.");

  const frozenModels = normalizeFrozenModels(run.frozenModels);
  const providers = providersForFrozenModels(run.frozenModels);
  const storedQuestions = await db
    .select({ id: questions.id })
    .from(questions)
    .where(eq(questions.runId, runId));
  const values = storedQuestions.flatMap(({ id: questionId }) =>
    providers.map((provider) => ({
      runId,
      questionId,
      provider,
      model: getProviderModel(provider, frozenModels),
      groundingMode: "web_grounded" as const,
      workflowStepId: `pending:${runId}:${questionId}:${provider}`,
    })),
  );

  if (values.length > 0) {
    await db.insert(providerJobs).values(values).onConflictDoNothing();
  }

  const storedJobs = await db
    .select({ id: providerJobs.id })
    .from(providerJobs)
    .where(eq(providerJobs.runId, runId));
  await db
    .update(runs)
    .set({ providerCallsPlanned: storedJobs.length, updatedAt: new Date() })
    .where(eq(runs.id, runId));

  console.log(
    `[ensureProviderJobs] DONE runId=${runId} count=${storedJobs.length}`,
  );
  return storedJobs.length;
}
ensureProviderJobsStep.maxRetries = 3;

async function loadOutstandingJobsStep(
  runId: string,
): Promise<ProviderJobWork[]> {
  "use step";

  console.log(`[loadOutstandingJobs] START runId=${runId}`);
  const rows = await getDb()
    .select({
      id: providerJobs.id,
      questionId: providerJobs.questionId,
      questionText: questions.text,
      cohort: questions.cohort,
      provider: providerJobs.provider,
      model: providerJobs.model,
    })
    .from(providerJobs)
    .innerJoin(questions, eq(providerJobs.questionId, questions.id))
    .leftJoin(results, eq(results.jobId, providerJobs.id))
    .where(
      and(
        eq(providerJobs.runId, runId),
        inArray(providerJobs.status, ["queued", "running"]),
        isNull(results.id),
      ),
    )
    .orderBy(asc(questions.sortOrder), asc(providerJobs.provider));

  console.log(
    `[loadOutstandingJobs] DONE runId=${runId} count=${rows.length}`,
  );
  return rows;
}
loadOutstandingJobsStep.maxRetries = 3;

async function checkBudgetStep(
  context: WorkflowRunContext,
  nextCalls: number,
): Promise<{ allowed: boolean; spentMicros: number }> {
  "use step";

  console.log(
    `[checkBudget] START runId=${context.id} nextCalls=${nextCalls}`,
  );
  const db = getDb();
  const [run] = await db
    .select({
      budgetCeilingMicros: runs.budgetCeilingMicros,
      generationCostMicros: runs.actualCostMicros,
    })
    .from(runs)
    .where(eq(runs.id, context.id))
    .limit(1);

  if (!run) throw new FatalError("RUN_NOT_FOUND: Benchmark run does not exist.");

  const persistedCosts = await db
    .select({ costMicros: results.costMicros })
    .from(results)
    .innerJoin(providerJobs, eq(results.jobId, providerJobs.id))
    .where(eq(providerJobs.runId, context.id));
  const failedWork = await db
    .select({
      attempts: providerJobs.attempts,
      errorCode: providerJobs.errorCode,
      resultId: results.id,
    })
    .from(providerJobs)
    .leftJoin(results, eq(results.jobId, providerJobs.id))
    .where(
      and(
        eq(providerJobs.runId, context.id),
        eq(providerJobs.status, "failed"),
      ),
    );
  const estimatedFailureMicros = failedWork.reduce(
    (total, job) =>
      total +
      estimatedUnpersistedFailureCost(
        job.attempts,
        job.errorCode,
        job.resultId !== null,
        context.estimatedMicrosPerProviderCall,
      ),
    0,
  );
  const spentMicros =
    run.generationCostMicros +
    persistedCosts.reduce((total, row) => total + row.costMicros, 0) +
    estimatedFailureMicros;
  const projectedMicros =
    spentMicros +
    nextCalls *
      2 *
      context.estimatedMicrosPerProviderCall *
      context.maxAttempts;
  const allowed = projectedMicros <= run.budgetCeilingMicros;

  console.log(
    `[checkBudget] DONE runId=${context.id} allowed=${allowed} spentMicros=${spentMicros}`,
  );
  return { allowed, spentMicros };
}
checkBudgetStep.maxRetries = 3;

async function markBatchRunningStep(
  runId: string,
  jobIds: string[],
): Promise<void> {
  "use step";

  console.log(
    `[markBatchRunning] START runId=${runId} count=${jobIds.length}`,
  );
  if (jobIds.length > 0) {
    await getDb()
      .update(providerJobs)
      .set({
        status: "running",
        startedAt: sql`coalesce(${providerJobs.startedAt}, now())`,
        attempts: sql`greatest(${providerJobs.attempts}, 1)`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(providerJobs.runId, runId),
          inArray(providerJobs.id, jobIds),
          inArray(providerJobs.status, ["queued", "running"]),
        ),
      );
  }
  console.log(`[markBatchRunning] DONE runId=${runId}`);
}
markBatchRunningStep.maxRetries = 3;

async function consumeCreditStep(context: WorkflowRunContext): Promise<void> {
  "use step";

  console.log(`[consumeCredit] START runId=${context.id}`);
  const consumed = await consumeReservedCreditForRun({
    userId: context.userId,
    runId: context.id,
  });

  if (!consumed) {
    console.error(`[consumeCredit] FAIL runId=${context.id}`);
    throw new FatalError(
      "CREDIT_NOT_RESERVED: Paid provider work requires a reserved run credit.",
    );
  }

  console.log(`[consumeCredit] DONE runId=${context.id}`);
}
consumeCreditStep.maxRetries = 3;

async function releaseCreditStep(
  context: WorkflowRunContext,
  reason: string,
): Promise<void> {
  "use step";

  console.log(`[releaseCredit] START runId=${context.id}`);
  try {
    await releaseReservedCreditForRun({
      userId: context.userId,
      runId: context.id,
      reason,
    });
  } catch (error) {
    console.error(
      `[releaseCredit] FAIL runId=${context.id} reason=${reason}`,
    );
    throw error;
  }
  console.log(`[releaseCredit] DONE runId=${context.id}`);
}
releaseCreditStep.maxRetries = 3;

async function queryProviderStep(
  context: WorkflowRunContext,
  job: ProviderJobWork,
): Promise<DurableProviderAnswer> {
  "use step";

  const metadata = getStepMetadata();
  console.log(
    `[queryProvider] START runId=${context.id} jobId=${job.id} provider=${job.provider} attempt=${metadata.attempt}`,
  );

  try {
    const answer = await queryGroundedProvider({
      provider: job.provider,
      model: job.model,
      question: job.questionText,
      cohort: job.cohort,
      market: context.market,
      locale: context.locale,
      gatewayUserId: context.userId,
      runId: context.id,
      promptVersion: context.providerPromptVersion,
    });
    console.log(
      `[queryProvider] DONE runId=${context.id} jobId=${job.id} grounding=${answer.groundingStatus}`,
    );
    return {
      ...answer,
      workflowStepId: metadata.stepId,
      attempts: metadata.attempt,
    };
  } catch (error) {
    await getDb()
      .update(providerJobs)
      .set({
        workflowStepId: metadata.stepId,
        attempts: sql`greatest(${providerJobs.attempts}, ${metadata.attempt})`,
        updatedAt: new Date(),
      })
      .where(eq(providerJobs.id, job.id));
    const failure = classifyProviderError(error);
    const diagnostic = providerErrorDiagnostic(error);
    console.error(
      `[queryProvider] FAIL runId=${context.id} jobId=${job.id} attempt=${metadata.attempt} code=${failure.code} retryable=${failure.retryable} message=${JSON.stringify(failure.message)} diagnostic=${JSON.stringify(diagnostic)}`,
    );
    throwRetriableAiError(failure, context.maxAttempts, "grounded provider query");
  }
}
queryProviderStep.maxRetries = HARD_MAX_AI_ATTEMPTS - 1;

async function reconcileProviderAnswerCostStep(
  answer: DurableProviderAnswer,
): Promise<DurableProviderAnswer> {
  "use step";

  const costMicros = await resolveGatewayCostWithoutThrowing(
    answer.gatewayGenerationId,
  );
  return costMicros === null
    ? answer
    : { ...answer, costMicros, costProvenance: "gateway_actual" };
}
reconcileProviderAnswerCostStep.maxRetries = 0;

async function persistProviderAnswerStep(
  context: WorkflowRunContext,
  job: ProviderJobWork,
  answer: DurableProviderAnswer,
): Promise<void> {
  "use step";

  console.log(
    `[persistProviderAnswer] START runId=${context.id} jobId=${job.id}`,
  );
  const db = getDb();
  const answerCost = accountAnswerCost(context, answer);
  await db
    .insert(results)
    .values({
      jobId: job.id,
      answerText: answer.text,
      sources: answer.sources,
      searchQueries: answer.searchQueries,
      requiredAttribution: answer.requiredAttribution,
      warnings: answer.warnings,
      groundingRequested: true,
      groundingObserved: answer.sources.length > 0,
      groundingStatus: answer.groundingStatus,
      scoreEligible: false,
      exclusionReason: "analysis_pending",
      targetMentioned: false,
      matchedAliases: [],
      ownedDomainCited: false,
      prominence: "absent",
      sentiment: null,
      competitorMentions: [],
      analysisVersion: PENDING_ANALYSIS_VERSION,
      usage: answer.usage,
      costMicros: answerCost.costMicros,
      costProvenance: answerCost.costProvenance,
      latencyMs: answer.latencyMs,
      gatewayRequestId:
        answer.gatewayGenerationId ?? answer.gatewayRequestId,
      providerRequestId: answer.providerRequestId,
      updatedAt: new Date(),
    })
    .onConflictDoNothing({ target: results.jobId });

  const [stored] = await db
    .select({ id: results.id })
    .from(results)
    .where(eq(results.jobId, job.id))
    .limit(1);
  if (!stored) throw new Error("The provider answer checkpoint was not persisted");

  await db
    .update(providerJobs)
    .set({
      workflowStepId: answer.workflowStepId,
      attempts: sql`greatest(${providerJobs.attempts}, ${answer.attempts})`,
      updatedAt: new Date(),
    })
    .where(eq(providerJobs.id, job.id));
  console.log(
    `[persistProviderAnswer] DONE runId=${context.id} jobId=${job.id}`,
  );
}
persistProviderAnswerStep.maxRetries = 3;

async function analyzeAnswerStep(
  context: WorkflowRunContext,
  job: ProviderJobWork,
  answer: DurableProviderAnswer,
): Promise<DurableAnswerAnalysis> {
  "use step";

  const metadata = getStepMetadata();
  console.log(
    `[analyzeAnswer] START runId=${context.id} provider=${answer.provider} attempt=${metadata.attempt}`,
  );

  try {
    const analysis = await analyzeAnswer({
      subjectName: context.subjectName,
      canonicalDomain: context.canonicalDomain,
      aliases: context.aliases,
      competitors: context.competitors,
      answerText: answer.text,
      sources: answer.sources,
      model: context.frozenModels.analysis,
      gatewayUserId: context.userId,
      runId: context.id,
      analysisVersion: context.analysisVersion,
    });
    console.log(
      `[analyzeAnswer] DONE runId=${context.id} provider=${answer.provider}`,
    );
    return { ...analysis, analysisAttempts: metadata.attempt };
  } catch (error) {
    await getDb()
      .update(providerJobs)
      .set({
        attempts: sql`greatest(${providerJobs.attempts}, ${answer.attempts + metadata.attempt})`,
        updatedAt: new Date(),
      })
      .where(
        and(eq(providerJobs.id, job.id), eq(providerJobs.status, "running")),
      );
    const failure = classifyProviderError(error);
    const diagnostic = providerErrorDiagnostic(error);
    console.error(
      `[analyzeAnswer] FAIL runId=${context.id} provider=${answer.provider} attempt=${metadata.attempt} code=${failure.code} retryable=${failure.retryable} message=${JSON.stringify(failure.message)} diagnostic=${JSON.stringify(diagnostic)}`,
    );
    throwRetriableAiError(failure, context.maxAttempts, "answer analysis");
  }
}
analyzeAnswerStep.maxRetries = HARD_MAX_AI_ATTEMPTS - 1;

async function reconcileAnalysisCostStep(
  analysis: DurableAnswerAnalysis,
): Promise<DurableAnswerAnalysis> {
  "use step";

  const costMicros = await resolveGatewayCostWithoutThrowing(
    analysis.gatewayGenerationId,
  );
  return costMicros === null
    ? analysis
    : { ...analysis, costMicros, costProvenance: "gateway_actual" };
}
reconcileAnalysisCostStep.maxRetries = 0;

async function persistProviderResultStep(
  context: WorkflowRunContext,
  job: ProviderJobWork,
  answer: DurableProviderAnswer,
  analysis: DurableAnswerAnalysis,
): Promise<void> {
  "use step";

  console.log(
    `[persistProviderResult] START runId=${context.id} jobId=${job.id}`,
  );
  const db = getDb();
  const combinedUsage = combineUsage(answer.usage, analysis.usage);
  const analysisCalledModel =
    analysis.latencyMs > 0 || analysis.providerRequestId !== null;
  const completedCost = accountCompletedJobCost(
    context,
    answer,
    analysis,
    analysisCalledModel,
  );
  const scoreEligible =
    answer.groundingStatus === "grounded" && answer.sources.length > 0;

  await db
    .update(results)
    .set({
      answerText: answer.text,
      sources: answer.sources,
      searchQueries: answer.searchQueries,
      requiredAttribution: answer.requiredAttribution,
      warnings: answer.warnings,
      groundingRequested: true,
      groundingObserved: answer.sources.length > 0,
      groundingStatus: answer.groundingStatus,
      scoreEligible,
      exclusionReason: scoreEligible ? null : answer.groundingStatus,
      targetMentioned: analysis.targetMentioned,
      matchedAliases: analysis.matchedAliases,
      ownedDomainCited: analysis.ownedDomainCited,
      prominence: analysis.prominence,
      sentiment: analysis.sentiment,
      competitorMentions: analysis.competitorMentions,
      analysisVersion: context.analysisVersion,
      usage: combinedUsage,
      costMicros: completedCost.costMicros,
      costProvenance: completedCost.costProvenance,
      latencyMs: answer.latencyMs + analysis.latencyMs,
      gatewayRequestId:
        answer.gatewayGenerationId ?? answer.gatewayRequestId,
      providerRequestId: answer.providerRequestId,
      updatedAt: new Date(),
    })
    .where(eq(results.jobId, job.id));

  const [stored] = await db
    .select({ id: results.id })
    .from(results)
    .where(eq(results.jobId, job.id))
    .limit(1);

  if (!stored) {
    throw new Error("The provider result was not persisted");
  }

  await db
    .update(providerJobs)
    .set({
      status: "succeeded",
      workflowStepId: answer.workflowStepId,
      attempts: sql`greatest(${providerJobs.attempts}, ${answer.attempts + analysis.analysisAttempts})`,
      errorCode: null,
      errorMessage: null,
      startedAt: sql`coalesce(${providerJobs.startedAt}, now())`,
      finishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(providerJobs.id, job.id));

  console.log(
    `[persistProviderResult] DONE runId=${context.id} jobId=${job.id}`,
  );
}
persistProviderResultStep.maxRetries = 3;

async function markJobFailedStep(
  jobId: string,
  code: string,
  message: string,
): Promise<void> {
  "use step";

  console.log(`[markJobFailed] START jobId=${jobId}`);
  const db = getDb();
  const [jobState] = await db
    .select({
      status: providerJobs.status,
      resultId: results.id,
      analysisVersion: results.analysisVersion,
    })
    .from(providerJobs)
    .leftJoin(results, eq(results.jobId, providerJobs.id))
    .where(eq(providerJobs.id, jobId))
    .limit(1);

  if (!jobState) throw new FatalError("PROVIDER_JOB_NOT_FOUND");
  const hasCompletedResult =
    jobState.resultId !== null &&
    jobState.analysisVersion !== PENDING_ANALYSIS_VERSION;

  await db
    .update(providerJobs)
    .set(
      jobState.status === "succeeded" || hasCompletedResult
        ? {
            status: "succeeded",
            errorCode: null,
            errorMessage: null,
            finishedAt: new Date(),
            updatedAt: new Date(),
          }
        : {
            status: "failed",
            attempts: sql`greatest(${providerJobs.attempts}, 1)`,
            errorCode: code.slice(0, 96),
            errorMessage: message.slice(0, 500),
            finishedAt: new Date(),
            updatedAt: new Date(),
          },
    )
    .where(eq(providerJobs.id, jobId));

  if (jobState.resultId && !hasCompletedResult) {
    await db
      .update(results)
      .set({
        scoreEligible: false,
        exclusionReason: "analysis_failed",
        updatedAt: new Date(),
      })
      .where(eq(results.jobId, jobId));
  }

  console.log(
    `[markJobFailed] DONE jobId=${jobId} repaired=${hasCompletedResult}`,
  );
}
markJobFailedStep.maxRetries = 3;

async function markBudgetBlockedJobsStep(
  runId: string,
  jobIds: string[],
): Promise<void> {
  "use step";

  console.log(
    `[markBudgetBlockedJobs] START runId=${runId} count=${jobIds.length}`,
  );
  if (jobIds.length > 0) {
    await getDb()
      .update(providerJobs)
      .set({
        status: "failed",
        errorCode: "RUN_BUDGET_REACHED",
        errorMessage: "The run budget stopped this provider call before it started.",
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(providerJobs.runId, runId),
          inArray(providerJobs.id, jobIds),
          inArray(providerJobs.status, ["queued", "running"]),
        ),
      );
  }
  console.log(`[markBudgetBlockedJobs] DONE runId=${runId}`);
}
markBudgetBlockedJobsStep.maxRetries = 3;

async function markRunAnalyzingStep(runId: string): Promise<void> {
  "use step";

  console.log(`[markRunAnalyzing] START runId=${runId}`);
  await getDb()
    .update(runs)
    .set({ status: "analyzing", updatedAt: new Date() })
    .where(
      and(
        eq(runs.id, runId),
        inArray(runs.status, ["querying", "analyzing"]),
      ),
    );
  console.log(`[markRunAnalyzing] DONE runId=${runId}`);
}
markRunAnalyzingStep.maxRetries = 3;

async function finalizeRunStep(runId: string): Promise<VisibilityWorkflowResult> {
  "use step";

  console.log(`[finalizeRun] START runId=${runId}`);
  const db = getDb();
  const [run] = await db.select().from(runs).where(eq(runs.id, runId)).limit(1);

  if (!run) throw new FatalError("RUN_NOT_FOUND: Benchmark run does not exist.");

  if (TERMINAL_STATUSES.includes(run.status as TerminalRunStatus)) {
    console.log(`[finalizeRun] DONE runId=${runId} status=${run.status}`);
    return {
      runId,
      status: run.status as TerminalRunStatus,
      succeededProviderCalls: run.succeededProviderCalls,
      failedProviderCalls: run.failedProviderCalls,
      eligibleProviderCalls: run.eligibleProviderCalls,
    };
  }

  const jobs = await db
    .select({
      status: providerJobs.status,
      attempts: providerJobs.attempts,
      errorCode: providerJobs.errorCode,
      resultId: results.id,
    })
    .from(providerJobs)
    .leftJoin(results, eq(results.jobId, providerJobs.id))
    .where(eq(providerJobs.runId, runId));
  const storedResults = await db
    .select({
      scoreEligible: results.scoreEligible,
      costMicros: results.costMicros,
      costProvenance: results.costProvenance,
    })
    .from(results)
    .innerJoin(providerJobs, eq(results.jobId, providerJobs.id))
    .where(eq(providerJobs.runId, runId));
  const succeededProviderCalls = jobs.filter(
    ({ status }) => status === "succeeded",
  ).length;
  const failedProviderCalls = jobs.filter(
    ({ status }) => status === "failed",
  ).length;
  const eligibleProviderCalls = storedResults.filter(
    ({ scoreEligible }) => scoreEligible,
  ).length;
  const status: TerminalRunStatus =
    succeededProviderCalls === jobs.length && failedProviderCalls === 0
      ? "complete"
      : succeededProviderCalls > 0
        ? "partial"
        : "failed";
  const resultCost = storedResults.reduce(
    (total, result) => total + result.costMicros,
    0,
  );
  const failedWorkCost = jobs.reduce(
    (total, job) =>
      job.status === "failed"
        ? total +
          estimatedUnpersistedFailureCost(
            job.attempts,
            job.errorCode,
            job.resultId !== null,
            estimatedMicrosPerCall(run),
          )
        : total,
    0,
  );
  const resultProvenance = storedResults.reduce<CostProvenance>(
    (current, result) =>
      combineCostProvenance(current, result.costProvenance),
    "unavailable",
  );
  const costProvenance = combineCostProvenance(
    combineCostProvenance(run.costProvenance, resultProvenance),
    failedWorkCost > 0 ? "estimated" : "unavailable",
  );

  await db
    .update(runs)
    .set({
      status,
      succeededProviderCalls,
      failedProviderCalls,
      eligibleProviderCalls,
      actualCostMicros: run.actualCostMicros + resultCost + failedWorkCost,
      costProvenance,
      failureCode: status === "complete" ? null : "INCOMPLETE_PROVIDER_COVERAGE",
      failureMessage:
        status === "complete"
          ? null
          : "One or more planned provider calls did not produce a persisted answer.",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(runs.id, runId));

  console.log(`[finalizeRun] DONE runId=${runId} status=${status}`);
  return {
    runId,
    status,
    succeededProviderCalls,
    failedProviderCalls,
    eligibleProviderCalls,
  };
}
finalizeRunStep.maxRetries = 3;

async function failRunStep(
  runId: string,
  code: string,
  message: string,
): Promise<void> {
  "use step";

  console.log(`[failRun] START runId=${runId} code=${code}`);
  const db = getDb();
  const [run] = await db
    .select({
      status: runs.status,
      actualCostMicros: runs.actualCostMicros,
      costProvenance: runs.costProvenance,
      estimatedCostMicros: runs.estimatedCostMicros,
      providerCallsPlanned: runs.providerCallsPlanned,
    })
    .from(runs)
    .where(eq(runs.id, runId))
    .limit(1);

  if (!run) throw new FatalError("RUN_NOT_FOUND: Benchmark run does not exist.");

  if (TERMINAL_STATUSES.includes(run.status as TerminalRunStatus)) {
    console.log(`[failRun] DONE runId=${runId} status=${run.status}`);
    return;
  }

  await db
    .update(providerJobs)
    .set({
      status: "failed",
      errorCode: code.slice(0, 96),
      errorMessage: message.slice(0, 500),
      finishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(providerJobs.runId, runId),
        inArray(providerJobs.status, ["queued", "running"]),
      ),
    );

  const storedJobs = await db
    .select({
      status: providerJobs.status,
      attempts: providerJobs.attempts,
      errorCode: providerJobs.errorCode,
      resultId: results.id,
    })
    .from(providerJobs)
    .leftJoin(results, eq(results.jobId, providerJobs.id))
    .where(eq(providerJobs.runId, runId));
  const storedResults = await db
    .select({
      scoreEligible: results.scoreEligible,
      costMicros: results.costMicros,
      costProvenance: results.costProvenance,
    })
    .from(results)
    .innerJoin(providerJobs, eq(results.jobId, providerJobs.id))
    .where(eq(providerJobs.runId, runId));
  const succeededProviderCalls = storedJobs.filter(
    ({ status: jobStatus }) => jobStatus === "succeeded",
  ).length;
  const status: "partial" | "failed" =
    succeededProviderCalls > 0 ? "partial" : "failed";
  const resultCostMicros = storedResults.reduce(
    (total, result) => total + result.costMicros,
    0,
  );
  const resultCostProvenance = storedResults.reduce<CostProvenance>(
    (current, result) =>
      combineCostProvenance(current, result.costProvenance),
    "unavailable",
  );
  const estimatedCallMicros = estimatedMicrosPerCall(run);
  const failedWorkCostMicros = storedJobs.reduce(
    (total, job) =>
      job.status === "failed"
        ? total +
          estimatedUnpersistedFailureCost(
            job.attempts,
            job.errorCode,
            job.resultId !== null,
            estimatedCallMicros,
          )
        : total,
    0,
  );
  const questionFailureCostMicros =
    code === "QUESTION_PHASE_FAILED" && run.actualCostMicros === 0
      ? estimatedCallMicros *
        Math.min(
          HARD_MAX_AI_ATTEMPTS,
          Math.max(1, getBenchmarkConfig().workflow.maxAttempts),
        ) *
        MAX_QUESTION_GENERATION_CALLS
      : 0;
  const hasEstimatedFailureCost =
    failedWorkCostMicros > 0 || questionFailureCostMicros > 0;

  await db
    .update(runs)
    .set({
      status,
      succeededProviderCalls,
      failedProviderCalls: storedJobs.filter(
        ({ status: jobStatus }) => jobStatus === "failed",
      ).length,
      eligibleProviderCalls: storedResults.filter(
        ({ scoreEligible }) => scoreEligible,
      ).length,
      actualCostMicros:
        run.actualCostMicros +
        resultCostMicros +
        failedWorkCostMicros +
        questionFailureCostMicros,
      costProvenance: combineCostProvenance(
        combineCostProvenance(run.costProvenance, resultCostProvenance),
        hasEstimatedFailureCost ? "estimated" : "unavailable",
      ),
      failureCode: code.slice(0, 96),
      failureMessage: message.slice(0, 500),
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(runs.id, runId),
        inArray(runs.status, ["queued", "generating", "querying", "analyzing"]),
      ),
    );
  console.log(`[failRun] DONE runId=${runId} status=${status}`);
}
failRunStep.maxRetries = 3;

async function readTerminalResultStep(
  runId: string,
  fallbackStatus: string,
): Promise<VisibilityWorkflowResult> {
  "use step";

  console.log(`[readTerminalResult] START runId=${runId}`);
  const [run] = await getDb()
    .select({
      status: runs.status,
      succeededProviderCalls: runs.succeededProviderCalls,
      failedProviderCalls: runs.failedProviderCalls,
      eligibleProviderCalls: runs.eligibleProviderCalls,
    })
    .from(runs)
    .where(eq(runs.id, runId))
    .limit(1);

  if (!run) throw new FatalError("RUN_NOT_FOUND: Benchmark run does not exist.");

  const status = TERMINAL_STATUSES.includes(run.status as TerminalRunStatus)
    ? (run.status as TerminalRunStatus)
    : "deduplicated";
  console.log(`[readTerminalResult] DONE runId=${runId} status=${status}`);
  return {
    runId,
    status: fallbackStatus === "deduplicated" ? "deduplicated" : status,
    succeededProviderCalls: run.succeededProviderCalls,
    failedProviderCalls: run.failedProviderCalls,
    eligibleProviderCalls: run.eligibleProviderCalls,
  };
}
readTerminalResultStep.maxRetries = 3;

async function syncDailyUsageStep(
  userId: string,
  usageDate: string,
): Promise<void> {
  "use step";

  console.log(`[syncDailyUsage] START usageDate=${usageDate}`);
  const db = getDb();
  const [totals] = await db
    .select({
      runsStarted:
        sql<number>`count(*) filter (where ${runs.startedAt} is not null)::integer`.mapWith(
          Number,
        ),
      providerCallsCompleted:
        sql<number>`coalesce(sum(${runs.succeededProviderCalls} + ${runs.failedProviderCalls}), 0)::integer`.mapWith(
          Number,
        ),
      costActualMicros:
        sql<number>`coalesce(sum(${runs.actualCostMicros}), 0)::bigint`.mapWith(
          Number,
        ),
    })
    .from(runs)
    .where(
      and(
        eq(runs.userId, userId),
        sql`(${runs.createdAt} at time zone 'UTC')::date = ${usageDate}::date`,
      ),
    );
  const actuals = totals ?? {
    runsStarted: 0,
    providerCallsCompleted: 0,
    costActualMicros: 0,
  };

  await db
    .insert(dailyUsage)
    .values({
      userId,
      usageDate,
      runsStarted: actuals.runsStarted,
      providerCallsCompleted: actuals.providerCallsCompleted,
      costActualMicros: actuals.costActualMicros,
    })
    .onConflictDoNothing();
  await db
    .update(dailyUsage)
    .set({
      runsStarted: actuals.runsStarted,
      providerCallsCompleted: actuals.providerCallsCompleted,
      costActualMicros: actuals.costActualMicros,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(dailyUsage.userId, userId),
        eq(dailyUsage.usageDate, usageDate),
      ),
    );
  console.log(`[syncDailyUsage] DONE usageDate=${usageDate}`);
}
syncDailyUsageStep.maxRetries = 3;

async function resolveGatewayCostWithoutThrowing(
  generationId: string | null,
): Promise<number | null> {
  try {
    return await getGatewayGenerationCostMicros(generationId);
  } catch {
    if (generationId) {
      console.warn(`[gatewayCost] UNAVAILABLE generationId=${generationId}`);
    }
    return null;
  }
}

function accountAnswerCost(
  context: WorkflowRunContext,
  answer: DurableProviderAnswer,
): { costMicros: number; costProvenance: CostProvenance } {
  const hasReportedCost =
    answer.costMicros > 0 && answer.costProvenance !== "unavailable";
  const retryEstimate =
    Math.max(0, answer.attempts - 1) *
    context.estimatedMicrosPerProviderCall;
  const successfulAttemptCost = hasReportedCost
    ? answer.costMicros
    : context.estimatedMicrosPerProviderCall;
  const usedEstimate = !hasReportedCost || retryEstimate > 0;

  return {
    costMicros: successfulAttemptCost + retryEstimate,
    costProvenance: usedEstimate
      ? hasReportedCost
        ? "mixed"
        : "estimated"
      : answer.costProvenance,
  };
}

function accountCompletedJobCost(
  context: WorkflowRunContext,
  answer: DurableProviderAnswer,
  analysis: DurableAnswerAnalysis,
  analysisCalledModel: boolean,
): { costMicros: number; costProvenance: CostProvenance } {
  const reportedCost = answer.costMicros + analysis.costMicros;
  const hasUnpricedWork =
    answer.costProvenance === "unavailable" ||
    (analysisCalledModel && analysis.costProvenance === "unavailable");
  const successfulWorkCost = hasUnpricedWork
    ? Math.max(reportedCost, context.estimatedMicrosPerProviderCall)
    : reportedCost;
  const retryEstimate =
    (Math.max(0, answer.attempts - 1) +
      (analysisCalledModel
        ? Math.max(0, analysis.analysisAttempts - 1)
        : 0)) *
    context.estimatedMicrosPerProviderCall;
  const usedEstimate = hasUnpricedWork || retryEstimate > 0;
  const reportedProvenance = analysisCalledModel
    ? combineCostProvenance(
        answer.costProvenance,
        analysis.costProvenance,
      )
    : answer.costProvenance;

  return {
    costMicros: successfulWorkCost + retryEstimate,
    costProvenance: usedEstimate
      ? reportedCost > 0
        ? "mixed"
        : "estimated"
      : reportedProvenance,
  };
}

function estimatedUnpersistedFailureCost(
  attempts: number,
  errorCode: string | null,
  hasAnswerCheckpoint: boolean,
  estimatedCallMicros: number,
): number {
  if (
    attempts <= 0 ||
    errorCode === "RUN_BUDGET_REACHED" ||
    estimatedCallMicros <= 0
  ) {
    return 0;
  }

  // When an answer checkpoint exists, its query cost (including query retries)
  // is already stored. Remaining combined attempts are conservatively treated
  // as analysis/downstream spend; without a checkpoint every query attempt is
  // estimated because no authoritative generation data survived.
  const uncheckpointedAttempts = hasAnswerCheckpoint
    ? Math.max(1, attempts - 1)
    : attempts;
  return uncheckpointedAttempts * estimatedCallMicros;
}

function estimatedMicrosPerCall(run: {
  estimatedCostMicros: number;
  providerCallsPlanned: number;
}): number {
  if (run.providerCallsPlanned > 0 && run.estimatedCostMicros > 0) {
    const frozenEstimatedGatewayCalls =
      run.providerCallsPlanned * 2 + MAX_QUESTION_GENERATION_CALLS;
    return Math.max(
      1,
      Math.round(run.estimatedCostMicros / frozenEstimatedGatewayCalls),
    );
  }
  return getBenchmarkConfig().budget.estimatedMicrosPerProviderCall;
}

function normalizeFrozenModels(models: FrozenModels): FrozenModelSet {
  const candidates: FrozenModelSet = {
    openai: models.openai,
    anthropic: models.anthropic,
    google: models.google,
    xai: models.xai ?? getBenchmarkConfig().models.xai,
    analysis: models.analysis,
  };

  return {
    openai: getProviderModel("openai", candidates),
    anthropic: getProviderModel("anthropic", candidates),
    google: getProviderModel("google", candidates),
    xai: getProviderModel("xai", candidates),
    analysis: candidates.analysis,
  };
}

function providersForFrozenModels(models: FrozenModels): readonly ProviderKey[] {
  return models.xai
    ? PROVIDERS
    : PROVIDERS.filter((provider) => provider !== "xai");
}

function throwRetriableAiError(
  failure: ClassifiedProviderError,
  maxAttempts: number,
  operation: string,
): never {
  const { attempt } = getStepMetadata();

  if (!failure.retryable || attempt >= maxAttempts) {
    throw new FatalError(`${failure.code}: ${failure.message}`);
  }

  const retryAfter = providerRetryDelayMs(failure, attempt);
  throw new RetryableError(`${operation}: ${failure.message}`, { retryAfter });
}
