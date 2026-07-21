import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  char,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const runStatusEnum = pgEnum("run_status", [
  "queued",
  "generating",
  "querying",
  "analyzing",
  "complete",
  "partial",
  "failed",
  "cancelled",
]);

export const questionCohortEnum = pgEnum("question_cohort", [
  "discovery",
  "diagnostic",
]);

export const providerEnum = pgEnum("provider", [
  "openai",
  "anthropic",
  "google",
  "xai",
]);

export const groundingModeEnum = pgEnum("grounding_mode", ["web_grounded"]);

export const providerJobStatusEnum = pgEnum("provider_job_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
]);

export const workflowDispatchStatusEnum = pgEnum(
  "workflow_dispatch_status",
  ["pending", "starting", "started", "failed"],
);

export const billingEventStatusEnum = pgEnum("billing_event_status", [
  "received",
  "processing",
  "processed",
  "ignored",
  "failed",
]);

export const creditLedgerTypeEnum = pgEnum("credit_ledger_type", [
  "purchase",
  "reserve",
  "consume",
  "release",
  "adjustment",
]);

export const costProvenanceEnum = pgEnum("cost_provenance", [
  "gateway_actual",
  "provider_reported",
  "estimated",
  "mixed",
  "unavailable",
]);

export const groundingStatusEnum = pgEnum("grounding_status", [
  "grounded",
  "no_sources",
  "unsupported",
]);

export const prominenceEnum = pgEnum("prominence", [
  "lead",
  "shortlist",
  "incidental",
  "absent",
]);

export const sentimentEnum = pgEnum("sentiment", [
  "positive",
  "neutral",
  "negative",
]);

export type FrozenModels = {
  openai: string;
  anthropic: string;
  google: string;
  xai?: string;
  analysis: string;
};

export type NormalizedSource = {
  url: string;
  title: string | null;
  snippet: string | null;
  publisher: string | null;
  publishedAt: string | null;
};

export type RequiredAttribution = {
  label: string;
  url: string | null;
  text: string | null;
};

export type CompetitorMention = {
  name: string;
  matchedAlias: string | null;
  sentiment: "positive" | "neutral" | "negative" | null;
};

export type NormalizedUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  reasoningTokens: number | null;
  cachedInputTokens: number | null;
  searchUses: number | null;
};

export type BillingMetadata = Record<
  string,
  string | number | boolean | null
>;

export const runs = pgTable(
  "runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    clientRequestId: varchar("client_request_id", { length: 128 }).notNull(),
    subjectName: text("subject_name").notNull(),
    canonicalDomain: text("canonical_domain").notNull(),
    description: text("description").notNull(),
    aliases: jsonb("aliases")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    competitors: jsonb("competitors")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    market: varchar("market", { length: 120 }).notNull(),
    locale: varchar("locale", { length: 32 }).notNull(),
    status: runStatusEnum("status").notNull().default("queued"),
    questionCountPlanned: integer("question_count_planned")
      .notNull()
      .default(25),
    discoveryCountPlanned: integer("discovery_count_planned")
      .notNull()
      .default(20),
    diagnosticCountPlanned: integer("diagnostic_count_planned")
      .notNull()
      .default(5),
    questionsGenerated: integer("questions_generated").notNull().default(0),
    providerCallsPlanned: integer("provider_calls_planned")
      .notNull()
      .default(100),
    eligibleProviderCalls: integer("eligible_provider_calls")
      .notNull()
      .default(0),
    succeededProviderCalls: integer("succeeded_provider_calls")
      .notNull()
      .default(0),
    failedProviderCalls: integer("failed_provider_calls")
      .notNull()
      .default(0),
    benchmarkVersion: varchar("benchmark_version", { length: 64 })
      .notNull()
      .default("benchmark-v2"),
    questionPromptVersion: varchar("question_prompt_version", { length: 64 })
      .notNull()
      .default("question-v2"),
    providerPromptVersion: varchar("provider_prompt_version", { length: 64 })
      .notNull()
      .default("provider-v2"),
    analysisVersion: varchar("analysis_version", { length: 64 })
      .notNull()
      .default("analysis-v2"),
    scoringVersion: varchar("scoring_version", { length: 64 })
      .notNull()
      .default("scoring-v1"),
    frozenModels: jsonb("frozen_models").$type<FrozenModels>().notNull(),
    groundingMode: groundingModeEnum("grounding_mode")
      .notNull()
      .default("web_grounded"),
    budgetConfirmedAt: timestamp("budget_confirmed_at", {
      withTimezone: true,
      precision: 3,
    }),
    budgetCeilingMicros: bigint("budget_ceiling_micros", {
      mode: "number",
    }).notNull(),
    estimatedCostMicros: bigint("estimated_cost_micros", {
      mode: "number",
    })
      .notNull()
      .default(0),
    actualCostMicros: bigint("actual_cost_micros", { mode: "number" })
      .notNull()
      .default(0),
    costProvenance: costProvenanceEnum("cost_provenance")
      .notNull()
      .default("unavailable"),
    workflowRunId: text("workflow_run_id"),
    claimStepId: text("claim_step_id"),
    dispatchStatus: workflowDispatchStatusEnum("dispatch_status")
      .notNull()
      .default("pending"),
    failureCode: varchar("failure_code", { length: 96 }),
    failureMessage: varchar("failure_message", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    startedAt: timestamp("started_at", { withTimezone: true, precision: 3 }),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      precision: 3,
    }),
    retentionExpiresAt: timestamp("retention_expires_at", {
      withTimezone: true,
      precision: 3,
    }).notNull(),
  },
  (table) => [
    uniqueIndex("runs_user_client_request_unique").on(
      table.userId,
      table.clientRequestId,
    ),
    uniqueIndex("runs_workflow_run_id_unique").on(table.workflowRunId),
    uniqueIndex("runs_one_active_per_user_unique")
      .on(table.userId)
      .where(
        sql`${table.status} IN ('queued', 'generating', 'querying', 'analyzing')`,
      ),
    index("runs_user_created_at_idx").on(table.userId, table.createdAt),
    index("runs_user_status_idx").on(table.userId, table.status),
    index("runs_status_retention_idx").on(
      table.status,
      table.retentionExpiresAt,
    ),
    check("runs_question_count_planned_check", sql`${table.questionCountPlanned} > 0`),
    check(
      "runs_cohort_counts_check",
      sql`${table.discoveryCountPlanned} + ${table.diagnosticCountPlanned} = ${table.questionCountPlanned}`,
    ),
    check(
      "runs_provider_counts_nonnegative_check",
      sql`${table.eligibleProviderCalls} >= 0 AND ${table.succeededProviderCalls} >= 0 AND ${table.failedProviderCalls} >= 0`,
    ),
    check(
      "runs_costs_nonnegative_check",
      sql`${table.budgetCeilingMicros} >= 0 AND ${table.estimatedCostMicros} >= 0 AND ${table.actualCostMicros} >= 0`,
    ),
  ],
);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "cascade" }),
    cohort: questionCohortEnum("cohort").notNull(),
    category: text("category").notNull(),
    text: text("text").notNull(),
    sortOrder: integer("sort_order").notNull(),
    generatorModel: text("generator_model").notNull(),
    promptVersion: varchar("prompt_version", { length: 64 }).notNull(),
    normalizedHash: char("normalized_hash", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("questions_run_normalized_hash_unique").on(
      table.runId,
      table.normalizedHash,
    ),
    uniqueIndex("questions_run_sort_order_unique").on(
      table.runId,
      table.sortOrder,
    ),
    index("questions_run_cohort_idx").on(table.runId, table.cohort),
  ],
);

export const providerJobs = pgTable(
  "provider_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    provider: providerEnum("provider").notNull(),
    model: text("model").notNull(),
    groundingMode: groundingModeEnum("grounding_mode")
      .notNull()
      .default("web_grounded"),
    status: providerJobStatusEnum("status").notNull().default("queued"),
    workflowStepId: text("workflow_step_id").notNull(),
    attempts: integer("attempts").notNull().default(0),
    errorCode: varchar("error_code", { length: 96 }),
    errorMessage: varchar("error_message", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    startedAt: timestamp("started_at", { withTimezone: true, precision: 3 }),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    finishedAt: timestamp("finished_at", {
      withTimezone: true,
      precision: 3,
    }),
  },
  (table) => [
    uniqueIndex("provider_jobs_run_question_provider_mode_unique").on(
      table.runId,
      table.questionId,
      table.provider,
      table.groundingMode,
    ),
    uniqueIndex("provider_jobs_workflow_step_id_unique").on(
      table.workflowStepId,
    ),
    index("provider_jobs_run_status_idx").on(table.runId, table.status),
    index("provider_jobs_provider_status_idx").on(
      table.provider,
      table.status,
    ),
    index("provider_jobs_question_idx").on(table.questionId),
    check("provider_jobs_attempts_nonnegative_check", sql`${table.attempts} >= 0`),
  ],
);

export const results = pgTable(
  "results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => providerJobs.id, { onDelete: "cascade" }),
    answerText: text("answer_text").notNull(),
    sources: jsonb("sources")
      .$type<NormalizedSource[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    searchQueries: jsonb("search_queries")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    requiredAttribution: jsonb("required_attribution")
      .$type<RequiredAttribution[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    warnings: jsonb("warnings")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    groundingRequested: boolean("grounding_requested").notNull().default(true),
    groundingObserved: boolean("grounding_observed").notNull().default(false),
    groundingStatus: groundingStatusEnum("grounding_status").notNull(),
    scoreEligible: boolean("score_eligible").notNull().default(false),
    exclusionReason: varchar("exclusion_reason", { length: 160 }),
    targetMentioned: boolean("target_mentioned").notNull().default(false),
    matchedAliases: jsonb("matched_aliases")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    ownedDomainCited: boolean("owned_domain_cited").notNull().default(false),
    prominence: prominenceEnum("prominence").notNull().default("absent"),
    sentiment: sentimentEnum("sentiment"),
    competitorMentions: jsonb("competitor_mentions")
      .$type<CompetitorMention[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    analysisVersion: varchar("analysis_version", { length: 64 }).notNull(),
    usage: jsonb("usage").$type<NormalizedUsage>().notNull(),
    costMicros: bigint("cost_micros", { mode: "number" })
      .notNull()
      .default(0),
    costProvenance: costProvenanceEnum("cost_provenance")
      .notNull()
      .default("unavailable"),
    latencyMs: integer("latency_ms").notNull(),
    gatewayRequestId: text("gateway_request_id"),
    providerRequestId: text("provider_request_id"),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("results_job_id_unique").on(table.jobId),
    index("results_score_eligible_idx").on(table.scoreEligible),
    check("results_cost_nonnegative_check", sql`${table.costMicros} >= 0`),
    check("results_latency_nonnegative_check", sql`${table.latencyMs} >= 0`),
  ],
);

export const workflowDispatches = pgTable(
  "workflow_dispatches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "cascade" }),
    status: workflowDispatchStatusEnum("status").notNull().default("pending"),
    workflowRunId: text("workflow_run_id"),
    attemptCount: integer("attempt_count").notNull().default(0),
    failureCode: varchar("failure_code", { length: 96 }),
    failureMessage: varchar("failure_message", { length: 500 }),
    nextAttemptAt: timestamp("next_attempt_at", {
      withTimezone: true,
      precision: 3,
    }),
    lastAttemptAt: timestamp("last_attempt_at", {
      withTimezone: true,
      precision: 3,
    }),
    dispatchedAt: timestamp("dispatched_at", {
      withTimezone: true,
      precision: 3,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("workflow_dispatches_run_id_unique").on(table.runId),
    uniqueIndex("workflow_dispatches_workflow_run_id_unique").on(
      table.workflowRunId,
    ),
    index("workflow_dispatches_status_next_attempt_idx").on(
      table.status,
      table.nextAttemptAt,
    ),
    check(
      "workflow_dispatches_attempt_count_nonnegative_check",
      sql`${table.attemptCount} >= 0`,
    ),
  ],
);

export const billingCustomers = pgTable(
  "billing_customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("billing_customers_user_id_unique").on(table.userId),
    uniqueIndex("billing_customers_stripe_customer_id_unique").on(
      table.stripeCustomerId,
    ),
  ],
);

export const billingEvents = pgTable(
  "billing_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    stripeEventId: text("stripe_event_id").notNull(),
    eventType: text("event_type").notNull(),
    status: billingEventStatusEnum("status").notNull().default("received"),
    livemode: boolean("livemode").notNull().default(false),
    apiVersion: varchar("api_version", { length: 32 }),
    failureCode: varchar("failure_code", { length: 96 }),
    failureMessage: varchar("failure_message", { length: 500 }),
    receivedAt: timestamp("received_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    processedAt: timestamp("processed_at", {
      withTimezone: true,
      precision: 3,
    }),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("billing_events_stripe_event_id_unique").on(
      table.stripeEventId,
    ),
    index("billing_events_status_received_at_idx").on(
      table.status,
      table.receivedAt,
    ),
  ],
);

export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    amount: integer("amount").notNull(),
    type: creditLedgerTypeEnum("type").notNull(),
    runId: uuid("run_id").references(() => runs.id, { onDelete: "set null" }),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    externalReference: text("external_reference").notNull(),
    metadata: jsonb("metadata")
      .$type<BillingMetadata>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      precision: 3,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("credit_ledger_external_reference_unique").on(
      table.externalReference,
    ),
    uniqueIndex("credit_ledger_checkout_session_unique").on(
      table.stripeCheckoutSessionId,
    ),
    uniqueIndex("credit_ledger_payment_intent_unique")
      .on(table.stripePaymentIntentId)
      .where(sql`${table.stripePaymentIntentId} IS NOT NULL`),
    index("credit_ledger_user_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    index("credit_ledger_user_run_idx").on(table.userId, table.runId),
    index("credit_ledger_user_expires_at_idx").on(
      table.userId,
      table.expiresAt,
    ),
  ],
);

export const dailyUsage = pgTable(
  "daily_usage",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    usageDate: date("usage_date", { mode: "string" }).notNull(),
    runsReserved: integer("runs_reserved").notNull().default(0),
    runsStarted: integer("runs_started").notNull().default(0),
    providerCallsReserved: integer("provider_calls_reserved")
      .notNull()
      .default(0),
    providerCallsCompleted: integer("provider_calls_completed")
      .notNull()
      .default(0),
    costReservedMicros: bigint("cost_reserved_micros", { mode: "number" })
      .notNull()
      .default(0),
    costActualMicros: bigint("cost_actual_micros", { mode: "number" })
      .notNull()
      .default(0),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("daily_usage_user_date_unique").on(
      table.userId,
      table.usageDate,
    ),
    index("daily_usage_date_idx").on(table.usageDate),
    check(
      "daily_usage_nonnegative_check",
      sql`${table.runsReserved} >= 0 AND ${table.runsStarted} >= 0 AND ${table.providerCallsReserved} >= 0 AND ${table.providerCallsCompleted} >= 0 AND ${table.costReservedMicros} >= 0 AND ${table.costActualMicros} >= 0`,
    ),
  ],
);
