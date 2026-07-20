ALTER TYPE "public"."provider" ADD VALUE 'xai';--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "question_count_planned" SET DEFAULT 25;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "discovery_count_planned" SET DEFAULT 20;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "diagnostic_count_planned" SET DEFAULT 5;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "provider_calls_planned" SET DEFAULT 100;--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "benchmark_version" SET DEFAULT 'benchmark-v2';--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "question_prompt_version" SET DEFAULT 'question-v2';--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "provider_prompt_version" SET DEFAULT 'provider-v2';--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "analysis_version" SET DEFAULT 'analysis-v2';--> statement-breakpoint
ALTER TABLE "runs" ALTER COLUMN "scoring_version" SET DEFAULT 'scoring-v1';