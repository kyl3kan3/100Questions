ALTER TABLE "credit_ledger" ADD COLUMN "expires_at" timestamp (3) with time zone;--> statement-breakpoint
UPDATE "credit_ledger"
SET "expires_at" = "created_at" + interval '12 months'
WHERE "type" = 'purchase' AND "expires_at" IS NULL;--> statement-breakpoint
CREATE INDEX "credit_ledger_user_expires_at_idx" ON "credit_ledger" USING btree ("user_id","expires_at");
