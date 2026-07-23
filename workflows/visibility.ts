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
import { buildActionPlan } from "@/lib/action-plan";
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
  actionRecommendations,
  dailyUsage,
  providerJobs,
  questions,
  results,
  runs,
  workflowDispatches,
  type FrozenModels,
} from "@/lib/db/schema";
import { sendRunNotificationEmail } from "@/lib/email/send-run-notification";
import {
  ACTION_PLAN_FINALIZATION_RETRY_CODE,
  isActionPlanFinalizationRetry,
} from "@/lib/workflow-finalization";
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
  baselineRunId: string | null;
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
  aiCallDelayMs: number;
  maxConcurrentJobs: number;
  maxRunDurationMs: number;
  estimatedMicrosPerProviderCall: number;
  ceilingMicrosPerProviderCall: number;
  usageDate: string;
}

type RunGuardResult =
  | { allowed: true; spentMicros: number }
  | {
      allowed: false;
      spentMicros: number;
      reason: "budget" | "cancelled" | "duration" | "terminal";
    };

interface ClaimResult {
  claimed: boolean;
  status: string;
  context: WorkflowRunContext | null;
  resumeActionPlanFinalization?: boolean;
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
const MAX_QUESTION_GENERATION_CALLS = 14;
const LEGACY_QUESTION_GENERATION_CALLS = 7;
const PENDING_ANALYSIS_VERSION = "__pending__";
const ACCOUNTED_ANALYSIS_FAILURE_REASON =
  "analysis_failed_cost_accounted";

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

  let notificationRunId: string | null = null;

  try {
    const claim = await claimRunStep(runId);

    if (!claim.claimed || !claim.context) {
      console.log(
        `[visibility] NOOP runId=${runId} existingStatus=${claim.status}`,
      );
      return await readTerminalResultStep(runId, claim.status);
    }

    const context = claim.context;
    notificationRunId = context.id;
    await syncDailyUsageStep(context.userId, context.usageDate);
    let jobs: ProviderJobWork[] = [];

    if (!claim.resumeActionPlanFinalization) {
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
    }

    console.log(
      `[visibility] JOBS runId=${runId} outstanding=${jobs.length}`,
    );
    let creditConsumed = false;
    let actionPlanRepairPending = false;

    try {
      const batchCount = Math.ceil(jobs.length / context.maxConcurrentJobs);

      for (
        let batchStart = 0;
        batchStart < jobs.length;
        batchStart += context.maxConcurrentJobs
      ) {
        const batch = jobs.slice(
          batchStart,
          batchStart + context.maxConcurrentJobs,
        );
        const batchNumber = Math.floor(batchStart / context.maxConcurrentJobs) + 1;
        const budget = await checkRunGuardStep(context, batch.length * 2);

        if (!budget.allowed) {
          if (budget.reason === "cancelled" || budget.reason === "terminal") {
            await syncDailyUsageStep(context.userId, context.usageDate);
            return await readTerminalResultStep(context.id, "cancelled");
          }

          const failure =
            budget.reason === "duration"
              ? {
                  code: "RUN_DURATION_LIMIT",
                  message:
                    "The run reached its maximum duration and was stopped before more provider calls could begin.",
                }
              : {
                  code: "RUN_BUDGET_REACHED",
                  message:
                    "The run reached its cost ceiling and was stopped before more provider calls could begin.",
                };
          await failRunStep(context.id, failure.code, failure.message);

          if (!creditConsumed) {
            await releaseCreditStep(
              context,
              budget.reason === "duration"
                ? "duration_limit_before_provider_work"
                : "budget_blocked_before_provider_work",
            );
          }
          await syncDailyUsageStep(context.userId, context.usageDate);
          return await readTerminalResultStep(context.id, "failed");
        }

        if (!creditConsumed) {
          await consumeCreditStep(context);
          creditConsumed = true;
        }

        const jobStarted = await markBatchRunningStep(
          context.id,
          batch.map((job) => job.id),
        );

        if (!jobStarted) {
          await syncDailyUsageStep(context.userId, context.usageDate);
          return await readTerminalResultStep(context.id, "cancelled");
        }

        console.log(
          `[visibility] BATCH runId=${runId} batch=${batchNumber}/${batchCount} jobs=${batch.length} spentMicros=${budget.spentMicros}`,
        );

        const queryOutcomes = await Promise.allSettled(
          batch.map((job) => queryProviderStep(context, job)),
        );

        for (let index = 0; index < queryOutcomes.length; index += 1) {
          const outcome = queryOutcomes[index];

          if (outcome.status === "rejected") {
            await markJobFailedStep(
              batch[index].id,
              "PROVIDER_JOB_FAILED",
              workflowErrorMessage(outcome.reason),
            );
          }
        }

        const queriedJobs = queryOutcomes.flatMap((outcome, index) =>
          outcome.status === "fulfilled"
            ? [{ job: batch[index], answer: outcome.value }]
            : [],
        );

        if (queriedJobs.length > 0) {
          const reconciledAnswers = await Promise.all(
            queriedJobs.map(({ answer }) =>
              reconcileProviderAnswerCostStep(answer),
            ),
          );
          await Promise.all(
            queriedJobs.map(({ job }, index) =>
              persistProviderAnswerStep(
                context,
                job,
                reconciledAnswers[index],
              ),
            ),
          );

          if (context.aiCallDelayMs > 0) {
            console.log(
              `[visibility] PACING runId=${runId} delayMs=${context.aiCallDelayMs} reason=batch_query_to_analysis`,
            );
            await sleep(context.aiCallDelayMs);
          }

          const analysisGuard = await checkRunGuardStep(
            context,
            queriedJobs.length,
          );

          if (!analysisGuard.allowed) {
            if (
              analysisGuard.reason !== "cancelled" &&
              analysisGuard.reason !== "terminal"
            ) {
              await failRunStep(
                context.id,
                analysisGuard.reason === "duration"
                  ? "RUN_DURATION_LIMIT"
                  : "RUN_BUDGET_REACHED",
                analysisGuard.reason === "duration"
                  ? "The run reached its maximum duration before answer analysis could begin."
                  : "The run reached its cost ceiling before answer analysis could begin.",
              );
            }
            await syncDailyUsageStep(context.userId, context.usageDate);
            return await readTerminalResultStep(
              context.id,
              analysisGuard.reason === "cancelled" ? "cancelled" : "failed",
            );
          }

          const analysisOutcomes = await Promise.allSettled(
            queriedJobs.map(({ job }, index) =>
              analyzeAnswerStep(context, job, reconciledAnswers[index]),
            ),
          );

          for (let index = 0; index < analysisOutcomes.length; index += 1) {
            const outcome = analysisOutcomes[index];

            if (outcome.status === "rejected") {
              await markJobFailedStep(
                queriedJobs[index].job.id,
                "PROVIDER_JOB_FAILED",
                workflowErrorMessage(outcome.reason),
              );
            }
          }

          const analyzedJobs = analysisOutcomes.flatMap((outcome, index) =>
            outcome.status === "fulfilled"
              ? [
                  {
                    job: queriedJobs[index].job,
                    answer: reconciledAnswers[index],
                    analysis: outcome.value,
                  },
                ]
              : [],
          );
          const reconciledAnalyses = await Promise.all(
            analyzedJobs.map(({ analysis }) =>
              reconcileAnalysisCostStep(analysis),
            ),
          );
          await Promise.all(
            analyzedJobs.map(({ job, answer }, index) =>
              persistProviderResultStep(
                context,
                job,
                answer,
                reconciledAnalyses[index],
              ),
            ),
          );
        }

        if (
          context.aiCallDelayMs > 0 &&
          batchStart + batch.length < jobs.length
        ) {
          console.log(
            `[visibility] PACING runId=${runId} delayMs=${context.aiCallDelayMs} reason=batch_to_batch`,
          );
          await sleep(context.aiCallDelayMs);
        }
      }

      await markRunAnalyzingStep(context.id);
      try {
        await persistActionPlanStep(context.id);
      } catch (error) {
        await markActionPlanFinalizationRetryStep(
          context.id,
          workflowErrorMessage(error),
        );
        actionPlanRepairPending = true;
        throw error;
      }
      const finalized = await finalizeRunStep(context.id);
      await syncDailyUsageStep(context.userId, context.usageDate);
      console.log(
        `[visibility] DONE runId=${runId} status=${finalized.status}`,
      );
      return finalized;
    } catch (error) {
      if (!actionPlanRepairPending) {
        await failRunStep(
          context.id,
          "WORKFLOW_EXECUTION_FAILED",
          workflowErrorMessage(error),
        );
      }
      await syncDailyUsageStep(context.userId, context.usageDate);
      throw error;
    }
  } finally {
    if (notificationRunId) {
      try {
        await notifyRunFinishedStep(notificationRunId);
      } catch (error) {
        console.error(
          `[visibility] NOTIFICATION_FAILED runId=${notificationRunId} message=${JSON.stringify(workflowErrorMessage(error))}`,
        );
      }
    }
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

  const resumeActionPlanFinalization = isActionPlanFinalizationRetry(
    run.status,
    run.failureCode,
  );

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
          resumeActionPlanFinalization
            ? and(
                eq(runs.status, "analyzing"),
                eq(runs.failureCode, ACTION_PLAN_FINALIZATION_RETRY_CODE),
              )
            : eq(runs.status, "queued"),
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
        failureCode: resumeActionPlanFinalization
          ? ACTION_PLAN_FINALIZATION_RETRY_CODE
          : null,
        failureMessage: resumeActionPlanFinalization
          ? sql`${workflowDispatches.failureMessage}`
          : null,
        updatedAt: dispatchStartedAt,
      })
      .where(eq(workflowDispatches.runId, runId)),
  ]);

  const config = getBenchmarkConfig();
  const context: WorkflowRunContext = {
    id: run.id,
    baselineRunId: run.baselineRunId,
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
    aiCallDelayMs: config.workflow.aiCallDelayMs,
    maxConcurrentJobs: config.workflow.maxConcurrentJobs,
    maxRunDurationMs: config.workflow.maxRunDurationMs,
    estimatedMicrosPerProviderCall: estimatedMicrosPerCall(run),
    ceilingMicrosPerProviderCall:
      config.budget.ceilingMicrosPerProviderCall,
    usageDate: run.createdAt.toISOString().slice(0, 10),
  };

  console.log(`[claimRun] DONE runId=${runId} status=claimed`);
  return {
    claimed: true,
    status: resumeActionPlanFinalization ? "analyzing" : "generating",
    context,
    resumeActionPlanFinalization,
  };
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
    if (context.baselineRunId) {
      const baselineQuestions = await getDb()
        .select({
          cohort: questions.cohort,
          category: questions.category,
          text: questions.text,
          sortOrder: questions.sortOrder,
          normalizedHash: questions.normalizedHash,
          generatorModel: questions.generatorModel,
          promptVersion: questions.promptVersion,
        })
        .from(questions)
        .innerJoin(runs, eq(questions.runId, runs.id))
        .where(
          and(
            eq(questions.runId, context.baselineRunId),
            eq(runs.userId, context.userId),
          ),
        )
        .orderBy(asc(questions.sortOrder));

      if (baselineQuestions.length !== context.questionCount) {
        throw new FatalError(
          "BASELINE_QUESTION_SET_INCOMPATIBLE: The baseline question set is incomplete.",
        );
      }

      console.log(
        `[generateQuestions] REUSED runId=${context.id} baseline=${context.baselineRunId} count=${baselineQuestions.length}`,
      );
      return {
        questions: baselineQuestions.map((question) => ({
          cohort: question.cohort,
          category: question.category,
          text: question.text,
          sortOrder: question.sortOrder,
          normalizedHash: question.normalizedHash,
        })),
        generatorModel: baselineQuestions[0].generatorModel,
        promptVersion: baselineQuestions[0].promptVersion,
        usage: {
          inputTokens: null,
          outputTokens: null,
          totalTokens: null,
          reasoningTokens: null,
          cachedInputTokens: null,
          searchUses: null,
        },
        costMicros: 0,
        costProvenance: "unavailable",
        generationCallCount: 0,
        gatewayGenerationIds: [],
      };
    }

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
    throw providerStepError(failure, metadata.attempt);
  }
}
// Question generation may make several bounded calls internally, so allow one
// outer retry for a transient Gateway failure while keeping permanent errors fatal.
generateQuestionsStep.maxRetries = 1;

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

async function checkRunGuardStep(
  context: WorkflowRunContext,
  nextAiCalls: number,
): Promise<RunGuardResult> {
  "use step";

  console.log(
    `[checkRunGuard] START runId=${context.id} nextAiCalls=${nextAiCalls}`,
  );
  const db = getDb();
  const [run] = await db
    .select({
      status: runs.status,
      startedAt: runs.startedAt,
      createdAt: runs.createdAt,
      budgetCeilingMicros: runs.budgetCeilingMicros,
      generationCostMicros: runs.actualCostMicros,
    })
    .from(runs)
    .where(eq(runs.id, context.id))
    .limit(1);

  if (!run) throw new FatalError("RUN_NOT_FOUND: Benchmark run does not exist.");

  if (TERMINAL_STATUSES.includes(run.status as TerminalRunStatus)) {
    return {
      allowed: false,
      spentMicros: run.generationCostMicros,
      reason: run.status === "cancelled" ? "cancelled" : "terminal",
    };
  }

  const startedAt = run.startedAt ?? run.createdAt;

  if (Date.now() - startedAt.getTime() >= context.maxRunDurationMs) {
    return {
      allowed: false,
      spentMicros: run.generationCostMicros,
      reason: "duration",
    };
  }

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
      exclusionReason: results.exclusionReason,
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
        job.exclusionReason === ACCOUNTED_ANALYSIS_FAILURE_REASON,
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
    nextAiCalls * context.ceilingMicrosPerProviderCall;
  const allowed = projectedMicros <= run.budgetCeilingMicros;

  console.log(
    `[checkRunGuard] DONE runId=${context.id} allowed=${allowed} spentMicros=${spentMicros}`,
  );
  return allowed
    ? { allowed: true, spentMicros }
    : { allowed: false, spentMicros, reason: "budget" };
}
checkRunGuardStep.maxRetries = 3;

async function markBatchRunningStep(
  runId: string,
  jobIds: string[],
): Promise<boolean> {
  "use step";

  console.log(
    `[markBatchRunning] START runId=${runId} count=${jobIds.length}`,
  );
  if (jobIds.length > 0) {
    const started = await getDb()
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
          sql`exists (
            select 1 from runs as active_run
            where active_run.id = ${runId}::uuid
              and active_run.status in ('generating', 'querying', 'analyzing')
          )`,
        ),
      )
      .returning({ id: providerJobs.id });
    console.log(`[markBatchRunning] DONE runId=${runId} count=${started.length}`);
    return started.length === jobIds.length;
  }
  console.log(`[markBatchRunning] DONE runId=${runId}`);
  return true;
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
    const db = getDb();
    await db.batch([
      db.execute(sql`
        select id
        from runs
        where id = ${context.id}::uuid
        for update
      `),
      db.execute(sql`
        with job_state as materialized (
          select status::text as status, attempts, error_code
          from provider_jobs
          where id = ${job.id}::uuid
        ),
        result_state as materialized (
          select id
          from results
          where job_id = ${job.id}::uuid
        ),
        updated_terminal_run as (
          update runs as terminal_run
          set
            actual_cost_micros =
              terminal_run.actual_cost_micros
              + greatest(0, ${metadata.attempt} - job_state.attempts)
                * ${context.estimatedMicrosPerProviderCall},
            cost_provenance =
              case
                when greatest(0, ${metadata.attempt} - job_state.attempts) = 0
                  then terminal_run.cost_provenance
                when terminal_run.cost_provenance in ('unavailable', 'estimated')
                  then 'estimated'::cost_provenance
                else 'mixed'::cost_provenance
              end,
            updated_at = now()
          from job_state
          where terminal_run.id = ${context.id}::uuid
            and terminal_run.status in ('complete', 'partial', 'failed', 'cancelled')
            and job_state.status = 'failed'
            and job_state.error_code is distinct from 'RUN_BUDGET_REACHED'
            and not exists (select 1 from result_state)
          returning terminal_run.id
        ),
        updated_job as (
          update provider_jobs
          set
            workflow_step_id = ${metadata.stepId},
            attempts = greatest(attempts, ${metadata.attempt}),
            updated_at = now()
          where id = ${job.id}::uuid
          returning id
        )
        select exists (select 1 from updated_job) as job_updated
      `),
    ]);
    const failure = classifyProviderError(error);
    const diagnostic = providerErrorDiagnostic(error);
    console.error(
      `[queryProvider] FAIL runId=${context.id} jobId=${job.id} attempt=${metadata.attempt} code=${failure.code} retryable=${failure.retryable} message=${JSON.stringify(failure.message)} diagnostic=${JSON.stringify(diagnostic)}`,
    );
    throw providerStepError(failure, metadata.attempt);
  }
}
queryProviderStep.maxRetries = 2;

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
  const [, persistence] = await db.batch([
    db.execute(sql`
      select id
      from runs
      where id = ${context.id}::uuid
      for update
    `),
    db.execute<{ result_persisted: boolean }>(sql`
      with job_state as materialized (
        select status::text as status, attempts, error_code
        from provider_jobs
        where id = ${job.id}::uuid
      ),
      inserted_result as (
        insert into results (
          job_id,
          answer_text,
          sources,
          search_queries,
          required_attribution,
          warnings,
          grounding_requested,
          grounding_observed,
          grounding_status,
          score_eligible,
          exclusion_reason,
          target_mentioned,
          matched_aliases,
          owned_domain_cited,
          prominence,
          sentiment,
          competitor_mentions,
          analysis_version,
          usage,
          cost_micros,
          cost_provenance,
          latency_ms,
          gateway_request_id,
          provider_request_id,
          updated_at
        )
        values (
          ${job.id}::uuid,
          ${answer.text},
          ${JSON.stringify(answer.sources)}::jsonb,
          ${JSON.stringify(answer.searchQueries)}::jsonb,
          ${JSON.stringify(answer.requiredAttribution)}::jsonb,
          ${JSON.stringify(answer.warnings)}::jsonb,
          true,
          ${answer.sources.length > 0},
          ${answer.groundingStatus}::grounding_status,
          false,
          'analysis_pending',
          false,
          '[]'::jsonb,
          false,
          'absent'::prominence,
          null,
          '[]'::jsonb,
          ${PENDING_ANALYSIS_VERSION},
          ${JSON.stringify(answer.usage)}::jsonb,
          ${answerCost.costMicros},
          ${answerCost.costProvenance}::cost_provenance,
          ${answer.latencyMs},
          ${answer.gatewayGenerationId ?? answer.gatewayRequestId},
          ${answer.providerRequestId},
          now()
        )
        on conflict (job_id) do nothing
        returning id
      ),
      updated_terminal_run as (
        update runs as terminal_run
        set
          actual_cost_micros = greatest(
            0,
            terminal_run.actual_cost_micros
            + ${answerCost.costMicros}
            - case
                when job_state.status = 'failed'
                  and job_state.attempts > 0
                  and job_state.error_code is distinct from 'RUN_BUDGET_REACHED'
                  then job_state.attempts
                    * ${context.estimatedMicrosPerProviderCall}
                else 0
              end
          ),
          cost_provenance =
            case
              when terminal_run.cost_provenance = 'unavailable'
                then ${answerCost.costProvenance}::cost_provenance
              when ${answerCost.costProvenance}::cost_provenance = 'unavailable'
                then terminal_run.cost_provenance
              when terminal_run.cost_provenance = ${answerCost.costProvenance}::cost_provenance
                then terminal_run.cost_provenance
              else 'mixed'::cost_provenance
            end,
          updated_at = now()
        from job_state
        where terminal_run.id = ${context.id}::uuid
          and terminal_run.status in ('complete', 'partial', 'failed', 'cancelled')
          and exists (select 1 from inserted_result)
        returning terminal_run.id
      ),
      updated_job as (
        update provider_jobs
        set
          workflow_step_id = ${answer.workflowStepId},
          attempts = greatest(attempts, ${answer.attempts}),
          updated_at = now()
        where id = ${job.id}::uuid
        returning id
      )
      select (
        exists (select 1 from inserted_result)
        or exists (
          select 1
          from results
          where job_id = ${job.id}::uuid
        )
      ) as result_persisted
    `),
  ]);
  if (!persistence.rows[0]?.result_persisted) {
    throw new Error("The provider answer checkpoint was not persisted");
  }

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
    await persistAnalysisFailureAttempt(
      context,
      job.id,
      answer.attempts,
      metadata.attempt,
    );
    const failure = classifyProviderError(error);
    const diagnostic = providerErrorDiagnostic(error);
    console.error(
      `[analyzeAnswer] FAIL runId=${context.id} provider=${answer.provider} attempt=${metadata.attempt} code=${failure.code} retryable=${failure.retryable} message=${JSON.stringify(failure.message)} diagnostic=${JSON.stringify(diagnostic)}`,
    );
    throw providerStepError(failure, metadata.attempt);
  }
}
analyzeAnswerStep.maxRetries = 2;

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

/** @internal Exported for focused workflow accounting regression tests. */
export async function persistAnalysisFailureAttempt(
  context: WorkflowRunContext,
  jobId: string,
  checkpointedQueryAttempts: number,
  analysisAttempt: number,
): Promise<void> {
  const db = getDb();
  const targetCombinedAttempts =
    checkpointedQueryAttempts +
    calculateAnalysisFailureAttempts(
      checkpointedQueryAttempts + analysisAttempt,
      checkpointedQueryAttempts,
    );
  const [, persistence] = await db.batch([
    db.execute(sql`
      select id
      from runs
      where id = ${context.id}::uuid
      for update
    `),
    db.execute<{ result_persisted: boolean }>(sql`
      with job_state as materialized (
        select attempts
        from provider_jobs
        where id = ${jobId}::uuid
      ),
      previous_result as materialized (
        select cost_micros, cost_provenance
        from results
        where job_id = ${jobId}::uuid
          and analysis_version = ${PENDING_ANALYSIS_VERSION}
        for update
      ),
      accounting as materialized (
        select greatest(
          0,
          ${targetCombinedAttempts}
          - greatest(job_state.attempts, ${checkpointedQueryAttempts})
        )::integer as new_analysis_attempts
        from job_state
      ),
      updated_result as (
        update results as failed_result
        set
          score_eligible = false,
          exclusion_reason = ${ACCOUNTED_ANALYSIS_FAILURE_REASON},
          cost_micros =
            previous_result.cost_micros
            + accounting.new_analysis_attempts
              * ${context.estimatedMicrosPerProviderCall},
          cost_provenance =
            case
              when accounting.new_analysis_attempts = 0
                then previous_result.cost_provenance
              when previous_result.cost_provenance = 'unavailable'
                then 'estimated'::cost_provenance
              when previous_result.cost_provenance = 'estimated'
                then previous_result.cost_provenance
              else 'mixed'::cost_provenance
            end,
          updated_at = now()
        from previous_result, accounting
        where failed_result.job_id = ${jobId}::uuid
        returning failed_result.id
      ),
      updated_terminal_run as (
        update runs as terminal_run
        set
          actual_cost_micros =
            terminal_run.actual_cost_micros
            + accounting.new_analysis_attempts
              * ${context.estimatedMicrosPerProviderCall},
          cost_provenance =
            case
              when accounting.new_analysis_attempts = 0
                then terminal_run.cost_provenance
              when terminal_run.cost_provenance in ('unavailable', 'estimated')
                then 'estimated'::cost_provenance
              else 'mixed'::cost_provenance
            end,
          updated_at = now()
        from accounting
        where terminal_run.id = ${context.id}::uuid
          and terminal_run.status in ('complete', 'partial', 'failed', 'cancelled')
          and exists (select 1 from updated_result)
        returning terminal_run.id
      ),
      updated_job as (
        update provider_jobs
        set
          attempts = greatest(attempts, ${targetCombinedAttempts}),
          updated_at = now()
        where id = ${jobId}::uuid
        returning id
      )
      select exists (select 1 from updated_result) as result_persisted
    `),
  ]);

  if (!persistence.rows[0]?.result_persisted) {
    throw new Error("The failed analysis cost checkpoint was not persisted");
  }
}

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
  const completedCost = calculateCompletedJobCost(
    context,
    answer,
    analysis,
    analysisCalledModel,
  );
  const scoreEligible =
    answer.groundingStatus === "grounded" && answer.sources.length > 0;

  const persistence = await db.execute<{
    run_status: string;
    job_status: string | null;
    result_persisted: boolean;
  }>(sql`
    with locked_run as materialized (
      select status::text as run_status
      from runs
      where id = ${context.id}::uuid
      for update
    ),
    previous_result as materialized (
      select
        stored_result.cost_micros as previous_cost_micros,
        stored_result.score_eligible as previous_score_eligible
      from results as stored_result
      cross join locked_run
      where stored_result.job_id = ${job.id}::uuid
      for update of stored_result
    ),
    updated_result as (
      update results
      set
        answer_text = ${answer.text},
        sources = ${JSON.stringify(answer.sources)}::jsonb,
        search_queries = ${JSON.stringify(answer.searchQueries)}::jsonb,
        required_attribution = ${JSON.stringify(answer.requiredAttribution)}::jsonb,
        warnings = ${JSON.stringify(answer.warnings)}::jsonb,
        grounding_requested = true,
        grounding_observed = ${answer.sources.length > 0},
        grounding_status = ${answer.groundingStatus}::grounding_status,
        score_eligible = ${scoreEligible},
        exclusion_reason = ${scoreEligible ? null : answer.groundingStatus},
        target_mentioned = ${analysis.targetMentioned},
        matched_aliases = ${JSON.stringify(analysis.matchedAliases)}::jsonb,
        owned_domain_cited = ${analysis.ownedDomainCited},
        prominence = ${analysis.prominence}::prominence,
        sentiment = ${analysis.sentiment}::sentiment,
        competitor_mentions = ${JSON.stringify(analysis.competitorMentions)}::jsonb,
        analysis_version = ${context.analysisVersion},
        usage = ${JSON.stringify(combinedUsage)}::jsonb,
        cost_micros = ${completedCost.costMicros},
        cost_provenance = ${completedCost.costProvenance}::cost_provenance,
        latency_ms = ${answer.latencyMs + analysis.latencyMs},
        gateway_request_id = ${answer.gatewayGenerationId ?? answer.gatewayRequestId},
        provider_request_id = ${answer.providerRequestId},
        updated_at = now()
      where job_id = ${job.id}::uuid
        and exists (select 1 from locked_run)
        and exists (select 1 from previous_result)
      returning id
    ),
    updated_job as (
      update provider_jobs
      set
        status = 'succeeded',
        workflow_step_id = ${answer.workflowStepId},
        attempts = greatest(attempts, ${answer.attempts + analysis.analysisAttempts}),
        error_code = null,
        error_message = null,
        started_at = coalesce(started_at, now()),
        finished_at = now(),
        updated_at = now()
      where id = ${job.id}::uuid
        and status = 'running'
        and exists (
          select 1
          from locked_run
          where run_status in ('generating', 'querying', 'analyzing')
        )
        and exists (select 1 from updated_result)
      returning status::text as job_status
    ),
    updated_terminal_run as (
      update runs as terminal_run
      set
        actual_cost_micros =
          terminal_run.actual_cost_micros
          + greatest(
              0,
              ${completedCost.costMicros} - previous_result.previous_cost_micros
            ),
        eligible_provider_calls =
          terminal_run.eligible_provider_calls
          + case
              when previous_result.previous_score_eligible = false
                and ${scoreEligible} = true
                then 1
              when previous_result.previous_score_eligible = true
                and ${scoreEligible} = false
                then -1
              else 0
            end,
        cost_provenance =
          case
            when ${completedCost.costMicros} <= previous_result.previous_cost_micros
              then terminal_run.cost_provenance
            when terminal_run.cost_provenance = 'unavailable'
              then ${completedCost.costProvenance}::cost_provenance
            when ${completedCost.costProvenance}::cost_provenance = 'unavailable'
              then terminal_run.cost_provenance
            when terminal_run.cost_provenance = ${completedCost.costProvenance}::cost_provenance
              then terminal_run.cost_provenance
            else 'mixed'::cost_provenance
          end,
        updated_at = now()
      from locked_run, previous_result
      where terminal_run.id = ${context.id}::uuid
        and locked_run.run_status in ('complete', 'partial', 'failed', 'cancelled')
        and exists (select 1 from updated_result)
      returning terminal_run.id
    )
    select
      locked_run.run_status,
      coalesce(
        (select job_status from updated_job limit 1),
        (
          select status::text
          from provider_jobs
          where id = ${job.id}::uuid
          limit 1
        )
      ) as job_status,
      exists (select 1 from updated_result) as result_persisted
    from locked_run
  `);
  const stored = persistence.rows[0];

  if (!stored?.result_persisted) {
    throw new Error("The provider result was not persisted");
  }

  console.log(
    `[persistProviderResult] DONE runId=${context.id} jobId=${job.id} runStatus=${stored.run_status} jobStatus=${stored.job_status}`,
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
    .where(
      and(
        eq(providerJobs.id, jobId),
        eq(providerJobs.status, "running"),
        sql`exists (
          select 1 from runs as active_run
          where active_run.id = ${providerJobs.runId}
            and active_run.status in ('generating', 'querying', 'analyzing')
        )`,
      ),
    );

  console.log(
    `[markJobFailed] DONE jobId=${jobId} repaired=${hasCompletedResult}`,
  );
}
markJobFailedStep.maxRetries = 3;

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
      exclusionReason: results.exclusionReason,
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
            job.exclusionReason === ACCOUNTED_ANALYSIS_FAILURE_REASON,
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

  const [finalized] = await db
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
    .where(
      and(
        eq(runs.id, runId),
        inArray(runs.status, ["queued", "generating", "querying", "analyzing"]),
      ),
    )
    .returning({
      status: runs.status,
      succeededProviderCalls: runs.succeededProviderCalls,
      failedProviderCalls: runs.failedProviderCalls,
      eligibleProviderCalls: runs.eligibleProviderCalls,
    });

  if (!finalized) {
    const [terminal] = await db
      .select({
        status: runs.status,
        succeededProviderCalls: runs.succeededProviderCalls,
        failedProviderCalls: runs.failedProviderCalls,
        eligibleProviderCalls: runs.eligibleProviderCalls,
      })
      .from(runs)
      .where(eq(runs.id, runId))
      .limit(1);

    if (
      !terminal ||
      !TERMINAL_STATUSES.includes(terminal.status as TerminalRunStatus)
    ) {
      throw new Error("The run could not be finalized");
    }

    return {
      runId,
      status: terminal.status as TerminalRunStatus,
      succeededProviderCalls: terminal.succeededProviderCalls,
      failedProviderCalls: terminal.failedProviderCalls,
      eligibleProviderCalls: terminal.eligibleProviderCalls,
    };
  }

  console.log(`[finalizeRun] DONE runId=${runId} status=${finalized.status}`);
  return {
    runId,
    status: finalized.status as TerminalRunStatus,
    succeededProviderCalls: finalized.succeededProviderCalls,
    failedProviderCalls: finalized.failedProviderCalls,
    eligibleProviderCalls: finalized.eligibleProviderCalls,
  };
}
finalizeRunStep.maxRetries = 3;

async function persistActionPlanStep(runId: string): Promise<number> {
  "use step";

  console.log(`[persistActionPlan] START runId=${runId}`);
  const db = getDb();
  const [run] = await db
    .select({ canonicalDomain: runs.canonicalDomain })
    .from(runs)
    .where(eq(runs.id, runId))
    .limit(1);

  if (!run) throw new FatalError("RUN_NOT_FOUND: Benchmark run does not exist.");

  const evidence = await db
    .select({
      resultId: results.id,
      questionId: questions.id,
      questionText: questions.text,
      category: questions.category,
      cohort: questions.cohort,
      scoreEligible: results.scoreEligible,
      targetMentioned: results.targetMentioned,
      prominence: results.prominence,
      ownedDomainCited: results.ownedDomainCited,
      competitorMentions: results.competitorMentions,
      sources: results.sources,
    })
    .from(results)
    .innerJoin(providerJobs, eq(results.jobId, providerJobs.id))
    .innerJoin(questions, eq(providerJobs.questionId, questions.id))
    .where(eq(providerJobs.runId, runId));
  const actionPlan = buildActionPlan(evidence, run.canonicalDomain);

  if (actionPlan.length > 0) {
    await db
      .insert(actionRecommendations)
      .values(
        actionPlan.map((recommendation) => ({
          runId,
          ...recommendation,
        })),
      )
      .onConflictDoNothing();
  }

  console.log(`[persistActionPlan] DONE runId=${runId} count=${actionPlan.length}`);
  return actionPlan.length;
}
persistActionPlanStep.maxRetries = 3;

async function markActionPlanFinalizationRetryStep(
  runId: string,
  message: string,
): Promise<void> {
  "use step";

  const retryAt = new Date(Date.now() + 60_000);
  const safeMessage = message.slice(0, 500);
  const db = getDb();
  await db.batch([
    db
      .update(runs)
      .set({
        status: "analyzing",
        claimStepId: null,
        workflowRunId: null,
        dispatchStatus: "pending",
        failureCode: ACTION_PLAN_FINALIZATION_RETRY_CODE,
        failureMessage: safeMessage,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(runs.id, runId),
          eq(runs.status, "analyzing"),
        ),
      ),
    db
      .update(workflowDispatches)
      .set({
        status: "pending",
        workflowRunId: null,
        failureCode: ACTION_PLAN_FINALIZATION_RETRY_CODE,
        failureMessage: safeMessage,
        nextAttemptAt: retryAt,
        updatedAt: new Date(),
      })
      .where(eq(workflowDispatches.runId, runId)),
  ]);
}
markActionPlanFinalizationRetryStep.maxRetries = 3;

async function notifyRunFinishedStep(runId: string): Promise<void> {
  "use step";

  console.log(`[notifyRunFinished] START runId=${runId}`);
  const db = getDb();
  const [run] = await db
    .select({
      userId: runs.userId,
      subjectName: runs.subjectName,
      status: runs.status,
    })
    .from(runs)
    .where(eq(runs.id, runId))
    .limit(1);

  if (!run || !TERMINAL_STATUSES.includes(run.status as TerminalRunStatus)) {
    console.log(`[notifyRunFinished] SKIP runId=${runId} reason=not_terminal`);
    return;
  }

  const users = await db.execute<{ email: string }>(sql`
    SELECT email
    FROM neon_auth."user"
    WHERE id = ${run.userId}
    LIMIT 1
  `);
  const recipientEmail = users.rows[0]?.email?.trim();

  if (!recipientEmail) {
    console.log(`[notifyRunFinished] SKIP runId=${runId} reason=no_recipient`);
    return;
  }

  const result = await sendRunNotificationEmail({
    runId,
    recipientEmail,
    subjectName: run.subjectName,
    status: run.status as TerminalRunStatus,
  });

  console.log(
    `[notifyRunFinished] DONE runId=${runId} sent=${result.sent}`,
  );
}
notifyRunFinishedStep.maxRetries = 3;

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
      exclusionReason: results.exclusionReason,
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
            job.exclusionReason === ACCOUNTED_ANALYSIS_FAILURE_REASON,
            estimatedCallMicros,
          )
        : total,
    0,
  );
  const questionFailureCostMicros =
    code === "QUESTION_PHASE_FAILED" && run.actualCostMicros === 0
      ? estimatedCallMicros *
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

export function calculateCompletedJobCost(
  context: Pick<WorkflowRunContext, "estimatedMicrosPerProviderCall">,
  answer: Pick<
    DurableProviderAnswer,
    "attempts" | "costMicros" | "costProvenance"
  >,
  analysis: Pick<
    DurableAnswerAnalysis,
    "analysisAttempts" | "costMicros" | "costProvenance"
  >,
  analysisCalledModel: boolean,
): { costMicros: number; costProvenance: CostProvenance } {
  const answerUsedEstimate = answer.costProvenance === "unavailable";
  const analysisUsedEstimate =
    analysisCalledModel && analysis.costProvenance === "unavailable";
  const answerCost = answerUsedEstimate
    ? context.estimatedMicrosPerProviderCall
    : answer.costMicros;
  const analysisCost = !analysisCalledModel
    ? 0
    : analysisUsedEstimate
      ? context.estimatedMicrosPerProviderCall
      : analysis.costMicros;
  const retryEstimate =
    (Math.max(0, answer.attempts - 1) +
      (analysisCalledModel
        ? Math.max(0, analysis.analysisAttempts - 1)
        : 0)) *
    context.estimatedMicrosPerProviderCall;
  const usedEstimate =
    answerUsedEstimate || analysisUsedEstimate || retryEstimate > 0;
  const reportedCost =
    (answerUsedEstimate ? 0 : answer.costMicros) +
    (analysisCalledModel && !analysisUsedEstimate ? analysis.costMicros : 0);
  const reportedProvenance = analysisCalledModel
    ? combineCostProvenance(
        answer.costProvenance,
        analysis.costProvenance,
      )
    : answer.costProvenance;

  return {
    costMicros: answerCost + analysisCost + retryEstimate,
    costProvenance: usedEstimate
      ? reportedCost > 0
        ? "mixed"
        : "estimated"
      : reportedProvenance,
  };
}

export function calculateAnalysisFailureAttempts(
  combinedAttempts: number,
  checkpointedQueryAttempts: number,
): number {
  return Math.max(1, combinedAttempts - checkpointedQueryAttempts);
}

export function estimatedUnpersistedFailureCost(
  attempts: number,
  errorCode: string | null,
  hasAnswerCheckpoint: boolean,
  hasAccountedAnalysisFailure: boolean,
  estimatedCallMicros: number,
): number {
  if (
    attempts <= 0 ||
    errorCode === "RUN_BUDGET_REACHED" ||
    estimatedCallMicros <= 0
  ) {
    return 0;
  }

  if (hasAccountedAnalysisFailure) return 0;

  // A persisted answer already includes its successful query and every query
  // retry. If the analysis failure checkpoint itself did not persist, charge
  // one conservative analysis attempt instead of charging the queries again.
  return hasAnswerCheckpoint
    ? estimatedCallMicros
    : attempts * estimatedCallMicros;
}

function estimatedMicrosPerCall(run: {
  estimatedCostMicros: number;
  providerCallsPlanned: number;
}): number {
  if (run.providerCallsPlanned > 0 && run.estimatedCostMicros > 0) {
    // The reserved total freezes the per-call estimate, but older benchmark-v2
    // runs reserved seven question calls. Recover the exact integer estimate
    // from either layout so historical runs keep their original accounting.
    for (const questionCalls of [
      MAX_QUESTION_GENERATION_CALLS,
      LEGACY_QUESTION_GENERATION_CALLS,
    ]) {
      const frozenEstimatedGatewayCalls =
        run.providerCallsPlanned * 2 + questionCalls;
      if (run.estimatedCostMicros % frozenEstimatedGatewayCalls === 0) {
        return Math.max(
          1,
          run.estimatedCostMicros / frozenEstimatedGatewayCalls,
        );
      }
    }

    return Math.max(
      1,
      Math.round(
        run.estimatedCostMicros /
          (run.providerCallsPlanned * 2 + MAX_QUESTION_GENERATION_CALLS),
      ),
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

function providerStepError(
  failure: ClassifiedProviderError,
  attempt: number,
): FatalError | RetryableError {
  const message = `${failure.code}: ${failure.message}`;

  if (!failure.retryable) return new FatalError(message);

  const baseBackoffMs =
    failure.code === "PROVIDER_UNAVAILABLE" ||
    failure.code === "PROVIDER_RATE_LIMITED"
      ? 5_000
      : 2_000;
  const exponentialBackoffMs = Math.min(
    baseBackoffMs * 2 ** Math.max(0, attempt - 1),
    30_000,
  );
  return new RetryableError(message, {
    retryAfter: Math.max(failure.retryAfterMs ?? 0, exponentialBackoffMs),
  });
}
