ALTER TABLE "runs" ALTER COLUMN "analysis_version" SET DEFAULT 'analysis-v3';--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "competing_pick" jsonb;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "first_pick_turns" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "first_pick_verdict" text;--> statement-breakpoint
ALTER TABLE "results" ADD COLUMN "first_pick_follow_up" jsonb;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_first_pick_turns_check" CHECK ("results"."first_pick_turns" between 0 and 2);