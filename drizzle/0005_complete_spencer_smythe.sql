CREATE TABLE "introductory_checkout_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"status" varchar(24) DEFAULT 'creating' NOT NULL,
	"grant_version" varchar(32) NOT NULL,
	"package_id" varchar(64) NOT NULL,
	"credits" integer NOT NULL,
	"stripe_price_id" text,
	"stripe_customer_id" text,
	"success_url" text,
	"cancel_url" text,
	"checkout_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"attempt" integer DEFAULT 1 NOT NULL,
	"stripe_checkout_session_id" text,
	"stripe_checkout_url" text,
	"stripe_session_expires_at" timestamp (3) with time zone,
	"fulfilled_session_id" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"fulfilled_at" timestamp (3) with time zone,
	CONSTRAINT "introductory_checkout_claims_status_check" CHECK ("introductory_checkout_claims"."status" IN ('creating', 'open', 'payment_pending', 'retryable', 'fulfilled')),
	CONSTRAINT "introductory_checkout_claims_credits_check" CHECK ("introductory_checkout_claims"."credits" > 0),
	CONSTRAINT "introductory_checkout_claims_attempt_check" CHECK ("introductory_checkout_claims"."attempt" > 0)
);
--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD COLUMN "funding_purchase_id" uuid;--> statement-breakpoint
DO $$
DECLARE
	ledger_event record;
	funding_id uuid;
BEGIN
	FOR ledger_event IN
		SELECT
			id,
			user_id,
			type::text AS event_type,
			run_id,
			external_reference,
			metadata,
			created_at
		FROM credit_ledger
		WHERE type <> 'purchase'::credit_ledger_type
		ORDER BY created_at, id
	LOOP
		funding_id := NULL;

		IF ledger_event.event_type = 'reserve' THEN
			SELECT purchase.id
			INTO funding_id
			FROM credit_ledger AS purchase
			WHERE purchase.user_id = ledger_event.user_id
				AND purchase.type = 'purchase'::credit_ledger_type
				AND purchase.amount > 0
				AND purchase.created_at <= ledger_event.created_at
				AND purchase.expires_at > ledger_event.created_at
				AND purchase.amount + coalesce((
					SELECT sum(funded_event.amount)::integer
					FROM credit_ledger AS funded_event
					WHERE funded_event.funding_purchase_id = purchase.id
				), 0) > 0
			ORDER BY purchase.expires_at, purchase.created_at, purchase.id
			LIMIT 1;
		ELSIF ledger_event.event_type IN ('consume', 'release') THEN
			SELECT reservation.funding_purchase_id
			INTO funding_id
			FROM credit_ledger AS reservation
			WHERE reservation.user_id = ledger_event.user_id
				AND reservation.type = 'reserve'::credit_ledger_type
				AND (
					(
						ledger_event.run_id IS NOT NULL
						AND reservation.run_id = ledger_event.run_id
					)
					OR (
						ledger_event.external_reference ~
							'^run:[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[1-8][0-9A-Fa-f]{3}-[89AaBb][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}:(consume|release)$'
						AND reservation.external_reference =
							regexp_replace(
								ledger_event.external_reference,
								':(consume|release)$',
								':reserve'
							)
					)
				)
			ORDER BY reservation.created_at, reservation.id
			LIMIT 1;
		ELSIF ledger_event.event_type = 'adjustment' THEN
			SELECT purchase.id
			INTO funding_id
			FROM credit_ledger AS purchase
			WHERE purchase.type = 'purchase'::credit_ledger_type
				AND purchase.stripe_payment_intent_id =
					ledger_event.metadata->>'stripe_payment_intent_id'
			LIMIT 1;

			IF funding_id IS NULL
				AND ledger_event.metadata->>'withdrawal_reference' IS NOT NULL
			THEN
				SELECT withdrawal.funding_purchase_id
				INTO funding_id
				FROM credit_ledger AS withdrawal
				WHERE withdrawal.external_reference =
						ledger_event.metadata->>'withdrawal_reference'
					AND withdrawal.type = 'adjustment'::credit_ledger_type
					AND withdrawal.amount <= 0
				LIMIT 1;
			END IF;
		END IF;

		IF funding_id IS NOT NULL THEN
			UPDATE credit_ledger
			SET funding_purchase_id = funding_id
			WHERE id = ledger_event.id;
		END IF;
	END LOOP;

	UPDATE credit_ledger AS action
	SET funding_purchase_id = reservation.funding_purchase_id
	FROM credit_ledger AS reservation
	WHERE action.funding_purchase_id IS NULL
		AND action.type IN (
			'consume'::credit_ledger_type,
			'release'::credit_ledger_type
		)
		AND action.user_id = reservation.user_id
		AND reservation.type = 'reserve'::credit_ledger_type
		AND reservation.funding_purchase_id IS NOT NULL
		AND (
			(
				action.run_id IS NOT NULL
				AND reservation.run_id = action.run_id
			)
			OR (
				action.external_reference ~
					'^run:[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[1-8][0-9A-Fa-f]{3}-[89AaBb][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}:(consume|release)$'
				AND reservation.external_reference =
					regexp_replace(
						action.external_reference,
						':(consume|release)$',
						':reserve'
					)
			)
		);

	UPDATE credit_ledger AS restoration
	SET funding_purchase_id = withdrawal.funding_purchase_id
	FROM credit_ledger AS withdrawal
	WHERE restoration.funding_purchase_id IS NULL
		AND restoration.type = 'adjustment'::credit_ledger_type
		AND restoration.amount > 0
		AND withdrawal.external_reference =
			restoration.metadata->>'withdrawal_reference'
		AND withdrawal.funding_purchase_id IS NOT NULL;

	IF EXISTS (
		SELECT 1
		FROM credit_ledger AS release
		INNER JOIN credit_ledger AS reservation
			ON reservation.user_id = release.user_id
			AND reservation.type = 'reserve'::credit_ledger_type
			AND reservation.external_reference =
				regexp_replace(release.external_reference, ':release$', ':reserve')
			AND reservation.funding_purchase_id IS NOT NULL
		WHERE release.type = 'release'::credit_ledger_type
			AND release.funding_purchase_id IS NULL
			AND release.external_reference ~
				'^run:[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[1-8][0-9A-Fa-f]{3}-[89AaBb][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}:release$'
	) THEN
		RAISE EXCEPTION
			'Failed to backfill a resolvable deleted-run credit release';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM credit_ledger AS consumption
		INNER JOIN credit_ledger AS reservation
			ON reservation.user_id = consumption.user_id
			AND reservation.type = 'reserve'::credit_ledger_type
			AND reservation.external_reference =
				regexp_replace(consumption.external_reference, ':consume$', ':reserve')
			AND reservation.funding_purchase_id IS NOT NULL
		WHERE consumption.type = 'consume'::credit_ledger_type
			AND consumption.funding_purchase_id IS NULL
			AND consumption.external_reference ~
				'^run:[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[1-8][0-9A-Fa-f]{3}-[89AaBb][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}:consume$'
	) THEN
		RAISE EXCEPTION
			'Failed to backfill a resolvable deleted-run credit consumption';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM credit_ledger AS restoration
		WHERE restoration.type = 'adjustment'::credit_ledger_type
			AND restoration.amount > 0
			AND restoration.metadata->>'reason' = 'dispute_reinstated'
			AND restoration.funding_purchase_id IS NULL
			AND (
				EXISTS (
					SELECT 1
					FROM credit_ledger AS purchase
					WHERE purchase.type = 'purchase'::credit_ledger_type
						AND purchase.stripe_payment_intent_id =
							restoration.metadata->>'stripe_payment_intent_id'
				)
				OR EXISTS (
					SELECT 1
					FROM credit_ledger AS withdrawal
					WHERE withdrawal.external_reference =
							restoration.metadata->>'withdrawal_reference'
						AND withdrawal.funding_purchase_id IS NOT NULL
				)
			)
	) THEN
		RAISE EXCEPTION
			'Failed to backfill a resolvable dispute restoration credit lot';
	END IF;
END
$$;--> statement-breakpoint
INSERT INTO "introductory_checkout_claims" (
	"user_id",
	"status",
	"grant_version",
	"package_id",
	"credits",
	"stripe_customer_id",
	"stripe_checkout_session_id",
	"fulfilled_session_id",
	"created_at",
	"updated_at",
	"fulfilled_at"
)
SELECT DISTINCT ON (purchase.user_id)
	purchase.user_id,
	'fulfilled',
	'v2',
	coalesce(purchase.metadata->>'package_id', 'intro'),
	purchase.amount,
	customer.stripe_customer_id,
	purchase.stripe_checkout_session_id,
	purchase.stripe_checkout_session_id,
	purchase.created_at,
	purchase.created_at,
	purchase.created_at
FROM credit_ledger AS purchase
LEFT JOIN billing_customers AS customer
	ON customer.user_id = purchase.user_id
WHERE purchase.type = 'purchase'::credit_ledger_type
	AND purchase.amount > 0
	AND purchase.metadata->>'package_id' = 'intro'
ORDER BY purchase.user_id, purchase.created_at, purchase.id;--> statement-breakpoint
CREATE UNIQUE INDEX "introductory_checkout_claims_user_id_unique" ON "introductory_checkout_claims" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "introductory_checkout_claims_session_id_unique" ON "introductory_checkout_claims" USING btree ("stripe_checkout_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "introductory_checkout_claims_fulfilled_session_unique" ON "introductory_checkout_claims" USING btree ("fulfilled_session_id");--> statement-breakpoint
CREATE INDEX "introductory_checkout_claims_status_updated_idx" ON "introductory_checkout_claims" USING btree ("status","updated_at");--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_funding_purchase_id_credit_ledger_id_fk" FOREIGN KEY ("funding_purchase_id") REFERENCES "public"."credit_ledger"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_ledger_funding_purchase_idx" ON "credit_ledger" USING btree ("funding_purchase_id");
