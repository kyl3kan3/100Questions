CREATE TYPE "public"."billing_event_status" AS ENUM('received', 'processing', 'processed', 'ignored', 'failed');--> statement-breakpoint
CREATE TYPE "public"."cost_provenance" AS ENUM('gateway_actual', 'provider_reported', 'estimated', 'mixed', 'unavailable');--> statement-breakpoint
CREATE TYPE "public"."credit_ledger_type" AS ENUM('purchase', 'reserve', 'consume', 'release', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."grounding_mode" AS ENUM('web_grounded');--> statement-breakpoint
CREATE TYPE "public"."grounding_status" AS ENUM('grounded', 'no_sources', 'unsupported');--> statement-breakpoint
CREATE TYPE "public"."prominence" AS ENUM('lead', 'shortlist', 'incidental', 'absent');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('openai', 'anthropic', 'google');--> statement-breakpoint
CREATE TYPE "public"."provider_job_status" AS ENUM('queued', 'running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."question_cohort" AS ENUM('discovery', 'diagnostic');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('queued', 'generating', 'querying', 'analyzing', 'complete', 'partial', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."sentiment" AS ENUM('positive', 'neutral', 'negative');--> statement-breakpoint
CREATE TYPE "public"."workflow_dispatch_status" AS ENUM('pending', 'starting', 'started', 'failed');--> statement-breakpoint
CREATE TABLE "billing_customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"status" "billing_event_status" DEFAULT 'received' NOT NULL,
	"livemode" boolean DEFAULT false NOT NULL,
	"api_version" varchar(32),
	"failure_code" varchar(96),
	"failure_message" varchar(500),
	"received_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp (3) with time zone,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"type" "credit_ledger_type" NOT NULL,
	"run_id" uuid,
	"stripe_checkout_session_id" text,
	"external_reference" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"usage_date" date NOT NULL,
	"runs_reserved" integer DEFAULT 0 NOT NULL,
	"runs_started" integer DEFAULT 0 NOT NULL,
	"provider_calls_reserved" integer DEFAULT 0 NOT NULL,
	"provider_calls_completed" integer DEFAULT 0 NOT NULL,
	"cost_reserved_micros" bigint DEFAULT 0 NOT NULL,
	"cost_actual_micros" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_usage_nonnegative_check" CHECK ("daily_usage"."runs_reserved" >= 0 AND "daily_usage"."runs_started" >= 0 AND "daily_usage"."provider_calls_reserved" >= 0 AND "daily_usage"."provider_calls_completed" >= 0 AND "daily_usage"."cost_reserved_micros" >= 0 AND "daily_usage"."cost_actual_micros" >= 0)
);
--> statement-breakpoint
CREATE TABLE "provider_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"provider" "provider" NOT NULL,
	"model" text NOT NULL,
	"grounding_mode" "grounding_mode" DEFAULT 'web_grounded' NOT NULL,
	"status" "provider_job_status" DEFAULT 'queued' NOT NULL,
	"workflow_step_id" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"error_code" varchar(96),
	"error_message" varchar(500),
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp (3) with time zone,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp (3) with time zone,
	CONSTRAINT "provider_jobs_attempts_nonnegative_check" CHECK ("provider_jobs"."attempts" >= 0)
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"cohort" "question_cohort" NOT NULL,
	"category" text NOT NULL,
	"text" text NOT NULL,
	"sort_order" integer NOT NULL,
	"generator_model" text NOT NULL,
	"prompt_version" varchar(64) NOT NULL,
	"normalized_hash" char(64) NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"answer_text" text NOT NULL,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"search_queries" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"required_attribution" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"grounding_requested" boolean DEFAULT true NOT NULL,
	"grounding_observed" boolean DEFAULT false NOT NULL,
	"grounding_status" "grounding_status" NOT NULL,
	"score_eligible" boolean DEFAULT false NOT NULL,
	"exclusion_reason" varchar(160),
	"target_mentioned" boolean DEFAULT false NOT NULL,
	"matched_aliases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"owned_domain_cited" boolean DEFAULT false NOT NULL,
	"prominence" "prominence" DEFAULT 'absent' NOT NULL,
	"sentiment" "sentiment",
	"competitor_mentions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"analysis_version" varchar(64) NOT NULL,
	"usage" jsonb NOT NULL,
	"cost_micros" bigint DEFAULT 0 NOT NULL,
	"cost_provenance" "cost_provenance" DEFAULT 'unavailable' NOT NULL,
	"latency_ms" integer NOT NULL,
	"gateway_request_id" text,
	"provider_request_id" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "results_cost_nonnegative_check" CHECK ("results"."cost_micros" >= 0),
	CONSTRAINT "results_latency_nonnegative_check" CHECK ("results"."latency_ms" >= 0)
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"client_request_id" varchar(128) NOT NULL,
	"subject_name" text NOT NULL,
	"canonical_domain" text NOT NULL,
	"description" text NOT NULL,
	"aliases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"competitors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"market" varchar(120) NOT NULL,
	"locale" varchar(32) NOT NULL,
	"status" "run_status" DEFAULT 'queued' NOT NULL,
	"question_count_planned" integer DEFAULT 100 NOT NULL,
	"discovery_count_planned" integer DEFAULT 80 NOT NULL,
	"diagnostic_count_planned" integer DEFAULT 20 NOT NULL,
	"questions_generated" integer DEFAULT 0 NOT NULL,
	"provider_calls_planned" integer DEFAULT 300 NOT NULL,
	"eligible_provider_calls" integer DEFAULT 0 NOT NULL,
	"succeeded_provider_calls" integer DEFAULT 0 NOT NULL,
	"failed_provider_calls" integer DEFAULT 0 NOT NULL,
	"benchmark_version" varchar(64) DEFAULT 'v1' NOT NULL,
	"question_prompt_version" varchar(64) DEFAULT 'v1' NOT NULL,
	"provider_prompt_version" varchar(64) DEFAULT 'v1' NOT NULL,
	"analysis_version" varchar(64) DEFAULT 'v1' NOT NULL,
	"scoring_version" varchar(64) DEFAULT 'v1' NOT NULL,
	"frozen_models" jsonb NOT NULL,
	"grounding_mode" "grounding_mode" DEFAULT 'web_grounded' NOT NULL,
	"budget_confirmed_at" timestamp (3) with time zone,
	"budget_ceiling_micros" bigint NOT NULL,
	"estimated_cost_micros" bigint DEFAULT 0 NOT NULL,
	"actual_cost_micros" bigint DEFAULT 0 NOT NULL,
	"cost_provenance" "cost_provenance" DEFAULT 'unavailable' NOT NULL,
	"workflow_run_id" text,
	"claim_step_id" text,
	"dispatch_status" "workflow_dispatch_status" DEFAULT 'pending' NOT NULL,
	"failure_code" varchar(96),
	"failure_message" varchar(500),
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp (3) with time zone,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp (3) with time zone,
	"retention_expires_at" timestamp (3) with time zone NOT NULL,
	CONSTRAINT "runs_question_count_planned_check" CHECK ("runs"."question_count_planned" > 0),
	CONSTRAINT "runs_cohort_counts_check" CHECK ("runs"."discovery_count_planned" + "runs"."diagnostic_count_planned" = "runs"."question_count_planned"),
	CONSTRAINT "runs_provider_counts_nonnegative_check" CHECK ("runs"."eligible_provider_calls" >= 0 AND "runs"."succeeded_provider_calls" >= 0 AND "runs"."failed_provider_calls" >= 0),
	CONSTRAINT "runs_costs_nonnegative_check" CHECK ("runs"."budget_ceiling_micros" >= 0 AND "runs"."estimated_cost_micros" >= 0 AND "runs"."actual_cost_micros" >= 0)
);
--> statement-breakpoint
CREATE TABLE "workflow_dispatches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"status" "workflow_dispatch_status" DEFAULT 'pending' NOT NULL,
	"workflow_run_id" text,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"failure_code" varchar(96),
	"failure_message" varchar(500),
	"next_attempt_at" timestamp (3) with time zone,
	"last_attempt_at" timestamp (3) with time zone,
	"dispatched_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workflow_dispatches_attempt_count_nonnegative_check" CHECK ("workflow_dispatches"."attempt_count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_jobs" ADD CONSTRAINT "provider_jobs_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_jobs" ADD CONSTRAINT "provider_jobs_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_job_id_provider_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."provider_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_dispatches" ADD CONSTRAINT "workflow_dispatches_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "billing_customers_user_id_unique" ON "billing_customers" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_customers_stripe_customer_id_unique" ON "billing_customers" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_events_stripe_event_id_unique" ON "billing_events" USING btree ("stripe_event_id");--> statement-breakpoint
CREATE INDEX "billing_events_status_received_at_idx" ON "billing_events" USING btree ("status","received_at");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_ledger_external_reference_unique" ON "credit_ledger" USING btree ("external_reference");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_ledger_checkout_session_unique" ON "credit_ledger" USING btree ("stripe_checkout_session_id");--> statement-breakpoint
CREATE INDEX "credit_ledger_user_created_at_idx" ON "credit_ledger" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "credit_ledger_user_run_idx" ON "credit_ledger" USING btree ("user_id","run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_usage_user_date_unique" ON "daily_usage" USING btree ("user_id","usage_date");--> statement-breakpoint
CREATE INDEX "daily_usage_date_idx" ON "daily_usage" USING btree ("usage_date");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_jobs_run_question_provider_mode_unique" ON "provider_jobs" USING btree ("run_id","question_id","provider","grounding_mode");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_jobs_workflow_step_id_unique" ON "provider_jobs" USING btree ("workflow_step_id");--> statement-breakpoint
CREATE INDEX "provider_jobs_run_status_idx" ON "provider_jobs" USING btree ("run_id","status");--> statement-breakpoint
CREATE INDEX "provider_jobs_provider_status_idx" ON "provider_jobs" USING btree ("provider","status");--> statement-breakpoint
CREATE INDEX "provider_jobs_question_idx" ON "provider_jobs" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "questions_run_normalized_hash_unique" ON "questions" USING btree ("run_id","normalized_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "questions_run_sort_order_unique" ON "questions" USING btree ("run_id","sort_order");--> statement-breakpoint
CREATE INDEX "questions_run_cohort_idx" ON "questions" USING btree ("run_id","cohort");--> statement-breakpoint
CREATE UNIQUE INDEX "results_job_id_unique" ON "results" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "results_score_eligible_idx" ON "results" USING btree ("score_eligible");--> statement-breakpoint
CREATE UNIQUE INDEX "runs_user_client_request_unique" ON "runs" USING btree ("user_id","client_request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "runs_workflow_run_id_unique" ON "runs" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "runs_one_active_per_user_unique" ON "runs" USING btree ("user_id") WHERE "runs"."status" IN ('queued', 'generating', 'querying', 'analyzing');--> statement-breakpoint
CREATE INDEX "runs_user_created_at_idx" ON "runs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "runs_user_status_idx" ON "runs" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "runs_status_retention_idx" ON "runs" USING btree ("status","retention_expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_dispatches_run_id_unique" ON "workflow_dispatches" USING btree ("run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_dispatches_workflow_run_id_unique" ON "workflow_dispatches" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE INDEX "workflow_dispatches_status_next_attempt_idx" ON "workflow_dispatches" USING btree ("status","next_attempt_at");