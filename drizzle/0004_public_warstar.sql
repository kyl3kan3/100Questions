CREATE TABLE "action_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"category" varchar(48) NOT NULL,
	"title" text NOT NULL,
	"rationale" text NOT NULL,
	"action" text NOT NULL,
	"evidence_result_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confidence" varchar(16) NOT NULL,
	"analysis_version" varchar(64) DEFAULT 'action-plan-v1' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "action_recommendations_rank_check" CHECK ("action_recommendations"."rank" BETWEEN 1 AND 5)
);
--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "baseline_run_id" uuid;--> statement-breakpoint
ALTER TABLE "action_recommendations" ADD CONSTRAINT "action_recommendations_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "action_recommendations_run_rank_unique" ON "action_recommendations" USING btree ("run_id","rank");--> statement-breakpoint
CREATE INDEX "action_recommendations_run_id_idx" ON "action_recommendations" USING btree ("run_id");--> statement-breakpoint
ALTER TABLE "runs" ADD CONSTRAINT "runs_baseline_run_id_runs_id_fk" FOREIGN KEY ("baseline_run_id") REFERENCES "public"."runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "runs_baseline_run_id_idx" ON "runs" USING btree ("baseline_run_id");