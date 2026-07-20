import "server-only";

import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  billingCustomers,
  billingEvents,
  creditLedger,
} from "@/lib/db/schema";

export {
  getCreditsPerPurchase,
  isStripeCheckoutConfigured,
} from "@/lib/billing/stripe";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RunCreditParams = {
  userId: string;
  runId: string;
};

type ReserveCreditParams = RunCreditParams & {
  externalReference?: string;
};

type ReleaseCreditParams = RunCreditParams & {
  reason: string;
};

export type BillingEventStatus =
  | "received"
  | "processing"
  | "processed"
  | "ignored"
  | "failed";

type BillingEventInput = {
  stripeEventId: string;
  eventType: string;
  status: BillingEventStatus;
  livemode: boolean;
  apiVersion: string | null;
  failureCode?: string;
  failureMessage?: string;
};

type StripePurchaseInput = {
  stripeEventId: string;
  eventType: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string;
  stripeCustomerId: string | null;
  userId: string;
  credits: number;
  livemode: boolean;
  apiVersion: string | null;
};

type StripeReversalInput = {
  stripeEventId: string;
  eventType: string;
  stripePaymentIntentId: string;
  ledgerReference: string;
  reason: "refund" | "dispute";
  livemode: boolean;
  apiVersion: string | null;
};

type StripeRestorationInput = {
  stripeEventId: string;
  eventType: string;
  stripePaymentIntentId: string;
  disputeId: string;
  livemode: boolean;
  apiVersion: string | null;
};

function assertUserId(userId: string): void {
  if (!userId.trim() || userId.length > 255) {
    throw new Error("Invalid user ID");
  }
}

function assertRunId(runId: string): void {
  if (!UUID_PATTERN.test(runId)) {
    throw new Error("Invalid run ID");
  }
}

function normalizeReference(reference: string): string {
  const normalized = reference.trim();

  if (!normalized || normalized.length > 240) {
    throw new Error("Invalid external credit reference");
  }

  return normalized;
}

function sanitizeText(value: string | undefined, maxLength: number) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

export async function getCreditBalance(userId: string): Promise<number> {
  assertUserId(userId);

  const [row] = await getDb()
    .select({
      balance: sql<number>`coalesce(sum(${creditLedger.amount}), 0)::integer`,
    })
    .from(creditLedger)
    .where(eq(creditLedger.userId, userId));

  return Number(row?.balance ?? 0);
}

/**
 * Atomically checks the user's ledger balance and reserves one run credit.
 * A per-user transaction advisory lock serializes competing reservations.
 * Repeating the same reservation returns true without another debit.
 */
export async function reserveCreditForRun({
  userId,
  runId,
  externalReference,
}: ReserveCreditParams): Promise<boolean> {
  assertUserId(userId);
  assertRunId(runId);

  const reference = normalizeReference(
    externalReference || `run:${runId}:reserve`,
  );
  const db = getDb();
  const query = sql`
    WITH existing_reservation AS MATERIALIZED (
      SELECT ledger.user_id, ledger.run_id, ledger.type
      FROM credit_ledger AS ledger
      WHERE ledger.external_reference = ${reference}
      LIMIT 1
    ),
    current_balance AS MATERIALIZED (
      SELECT coalesce(sum(ledger.amount), 0)::integer AS balance
      FROM credit_ledger AS ledger
      WHERE ledger.user_id = ${userId}
    ),
    owned_run AS MATERIALIZED (
      SELECT run.id
      FROM runs AS run
      WHERE run.id = ${runId}::uuid
        AND run.user_id = ${userId}
      LIMIT 1
    ),
    new_reservation AS (
      INSERT INTO credit_ledger (
        user_id,
        amount,
        type,
        run_id,
        external_reference,
        metadata
      )
      SELECT
        ${userId},
        -1,
        'reserve'::credit_ledger_type,
        owned_run.id,
        ${reference},
        jsonb_build_object('state', 'reserved')
      FROM current_balance
      CROSS JOIN owned_run
      WHERE current_balance.balance >= 1
        AND NOT EXISTS (SELECT 1 FROM existing_reservation)
      ON CONFLICT DO NOTHING
      RETURNING id
    )
    SELECT (
      EXISTS (SELECT 1 FROM new_reservation)
      OR EXISTS (
        SELECT 1
        FROM existing_reservation
        WHERE existing_reservation.user_id = ${userId}
          AND existing_reservation.run_id = ${runId}::uuid
          AND existing_reservation.type = 'reserve'::credit_ledger_type
      )
    ) AS accepted
  `;
  const [, result] = await db.batch([
    db.execute(sql`
      SELECT pg_advisory_xact_lock(hashtextextended(${userId}::text, 0))
    `),
    db.execute<{ accepted: boolean }>(query),
  ]);

  return Boolean(result.rows[0]?.accepted);
}

/** Marks a reserved credit consumed without changing the already-debited balance. */
export async function consumeReservedCreditForRun({
  userId,
  runId,
}: RunCreditParams): Promise<boolean> {
  assertUserId(userId);
  assertRunId(runId);

  const reference = `run:${runId}:consume`;
  const db = getDb();
  const query = sql`
    WITH existing_action AS MATERIALIZED (
      SELECT ledger.user_id, ledger.run_id, ledger.type
      FROM credit_ledger AS ledger
      WHERE ledger.external_reference = ${reference}
      LIMIT 1
    ),
    reservation AS MATERIALIZED (
      SELECT 1
      FROM credit_ledger AS ledger
      WHERE ledger.user_id = ${userId}
        AND ledger.run_id = ${runId}::uuid
        AND ledger.type = 'reserve'::credit_ledger_type
      LIMIT 1
    ),
    release AS MATERIALIZED (
      SELECT 1
      FROM credit_ledger AS ledger
      WHERE ledger.user_id = ${userId}
        AND ledger.run_id = ${runId}::uuid
        AND ledger.type = 'release'::credit_ledger_type
      LIMIT 1
    ),
    new_action AS (
      INSERT INTO credit_ledger (
        user_id,
        amount,
        type,
        run_id,
        external_reference,
        metadata
      )
      SELECT
        ${userId},
        0,
        'consume'::credit_ledger_type,
        ${runId}::uuid,
        ${reference},
        jsonb_build_object('state', 'consumed')
      WHERE EXISTS (SELECT 1 FROM reservation)
        AND NOT EXISTS (SELECT 1 FROM release)
        AND NOT EXISTS (SELECT 1 FROM existing_action)
      ON CONFLICT DO NOTHING
      RETURNING id
    )
    SELECT (
      EXISTS (SELECT 1 FROM new_action)
      OR EXISTS (
        SELECT 1
        FROM existing_action
        WHERE existing_action.user_id = ${userId}
          AND existing_action.run_id = ${runId}::uuid
          AND existing_action.type = 'consume'::credit_ledger_type
      )
    ) AS accepted
  `;
  const [, result] = await db.batch([
    db.execute(sql`
      SELECT pg_advisory_xact_lock(hashtextextended(${userId}::text, 0))
    `),
    db.execute<{ accepted: boolean }>(query),
  ]);

  return Boolean(result.rows[0]?.accepted);
}

/** Releases a reservation only if no paid provider work has consumed it. */
export async function releaseReservedCreditForRun({
  userId,
  runId,
  reason,
}: ReleaseCreditParams): Promise<boolean> {
  assertUserId(userId);
  assertRunId(runId);

  const normalizedReason = reason.trim().slice(0, 160);

  if (!normalizedReason) {
    throw new Error("A credit release reason is required");
  }

  const reference = `run:${runId}:release`;
  const db = getDb();
  const query = sql`
    WITH existing_action AS MATERIALIZED (
      SELECT ledger.user_id, ledger.run_id, ledger.type
      FROM credit_ledger AS ledger
      WHERE ledger.external_reference = ${reference}
      LIMIT 1
    ),
    reservation AS MATERIALIZED (
      SELECT ledger.amount
      FROM credit_ledger AS ledger
      WHERE ledger.user_id = ${userId}
        AND ledger.run_id = ${runId}::uuid
        AND ledger.type = 'reserve'::credit_ledger_type
      LIMIT 1
    ),
    consumption AS MATERIALIZED (
      SELECT 1
      FROM credit_ledger AS ledger
      WHERE ledger.user_id = ${userId}
        AND ledger.run_id = ${runId}::uuid
        AND ledger.type = 'consume'::credit_ledger_type
      LIMIT 1
    ),
    new_action AS (
      INSERT INTO credit_ledger (
        user_id,
        amount,
        type,
        run_id,
        external_reference,
        metadata
      )
      SELECT
        ${userId},
        -reservation.amount,
        'release'::credit_ledger_type,
        ${runId}::uuid,
        ${reference},
        jsonb_build_object('state', 'released', 'reason', ${normalizedReason}::text)
      FROM reservation
      WHERE EXISTS (SELECT 1 FROM reservation)
        AND NOT EXISTS (SELECT 1 FROM consumption)
        AND NOT EXISTS (SELECT 1 FROM existing_action)
      ON CONFLICT DO NOTHING
      RETURNING id
    )
    SELECT (
      EXISTS (SELECT 1 FROM new_action)
      OR EXISTS (
        SELECT 1
        FROM existing_action
        WHERE existing_action.user_id = ${userId}
          AND existing_action.run_id = ${runId}::uuid
          AND existing_action.type = 'release'::credit_ledger_type
      )
    ) AS accepted
  `;
  const [, result] = await db.batch([
    db.execute(sql`
      SELECT pg_advisory_xact_lock(hashtextextended(${userId}::text, 0))
    `),
    db.execute<{ accepted: boolean }>(query),
  ]);

  return Boolean(result.rows[0]?.accepted);
}

export async function getBillingCustomerForUser(
  userId: string,
): Promise<string | null> {
  assertUserId(userId);

  const [customer] = await getDb()
    .select({ stripeCustomerId: billingCustomers.stripeCustomerId })
    .from(billingCustomers)
    .where(eq(billingCustomers.userId, userId))
    .limit(1);

  return customer?.stripeCustomerId ?? null;
}

export async function upsertBillingCustomer({
  userId,
  stripeCustomerId,
}: {
  userId: string;
  stripeCustomerId: string;
}): Promise<void> {
  assertUserId(userId);

  const normalizedCustomerId = normalizeReference(stripeCustomerId);

  await getDb()
    .insert(billingCustomers)
    .values({
      userId,
      stripeCustomerId: normalizedCustomerId,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: billingCustomers.userId,
      set: {
        stripeCustomerId: normalizedCustomerId,
        updatedAt: new Date(),
      },
    });
}

export async function recordBillingEvent({
  stripeEventId,
  eventType,
  status,
  livemode,
  apiVersion,
  failureCode,
  failureMessage,
}: BillingEventInput): Promise<boolean> {
  const [event] = await getDb()
    .insert(billingEvents)
    .values({
      stripeEventId,
      eventType,
      status,
      livemode,
      apiVersion,
      failureCode: sanitizeText(failureCode, 96),
      failureMessage: sanitizeText(failureMessage, 500),
      processedAt:
        status === "processed" || status === "ignored" ? new Date() : null,
      updatedAt: new Date(),
    })
    .onConflictDoNothing({ target: billingEvents.stripeEventId })
    .returning({ id: billingEvents.id });

  return Boolean(event);
}

/**
 * Persists a verified Stripe event, customer mapping, and positive ledger
 * entry in one Postgres statement. Event ID and Checkout Session constraints
 * make retries and Stripe's related completion events exactly-once grants.
 */
export async function grantPurchasedCredits({
  stripeEventId,
  eventType,
  stripeCheckoutSessionId,
  stripePaymentIntentId,
  stripeCustomerId,
  userId,
  credits,
  livemode,
  apiVersion,
}: StripePurchaseInput): Promise<{ granted: boolean; status: string }> {
  assertUserId(userId);

  if (!Number.isSafeInteger(credits) || credits < 1 || credits > 100) {
    throw new Error("Invalid purchased credit count");
  }

  const reference = normalizeReference(
    `stripe:checkout:${stripeCheckoutSessionId}`,
  );
  const paymentIntentId = normalizeReference(stripePaymentIntentId);
  const result = await getDb().execute<{
    granted: boolean;
    status: string;
  }>(sql`
    WITH checkout_lock AS MATERIALIZED (
      SELECT pg_advisory_xact_lock(
        hashtextextended(${stripeCheckoutSessionId}::text, 0)
      )
    ),
    event_row AS (
      INSERT INTO billing_events (
        stripe_event_id,
        event_type,
        status,
        livemode,
        api_version,
        received_at,
        updated_at
      )
      SELECT
        ${stripeEventId},
        ${eventType},
        'processing'::billing_event_status,
        ${livemode},
        ${apiVersion}::text,
        now(),
        now()
      FROM checkout_lock
      ON CONFLICT (stripe_event_id) DO UPDATE
      SET updated_at = now()
      RETURNING id, status
    ),
    eligible_event AS MATERIALIZED (
      SELECT id
      FROM event_row
      WHERE status IN (
        'received'::billing_event_status,
        'processing'::billing_event_status,
        'failed'::billing_event_status
      )
    ),
    customer_record AS (
      INSERT INTO billing_customers (
        user_id,
        stripe_customer_id,
        created_at,
        updated_at
      )
      SELECT ${userId}, ${stripeCustomerId}::text, now(), now()
      FROM eligible_event
      WHERE ${stripeCustomerId}::text IS NOT NULL
      ON CONFLICT (user_id) DO UPDATE
      SET stripe_customer_id = excluded.stripe_customer_id,
          updated_at = now()
      RETURNING id
    ),
    grant_row AS (
      INSERT INTO credit_ledger (
        user_id,
        amount,
        type,
        stripe_checkout_session_id,
        stripe_payment_intent_id,
        external_reference,
        metadata,
        created_at
      )
      SELECT
        ${userId},
        ${credits},
        'purchase'::credit_ledger_type,
        ${stripeCheckoutSessionId},
        ${paymentIntentId},
        ${reference},
        jsonb_build_object('stripe_event_id', ${stripeEventId}),
        now()
      FROM eligible_event
      ON CONFLICT DO NOTHING
      RETURNING id
    ),
    processed_event AS (
      UPDATE billing_events AS event
      SET status = 'processed'::billing_event_status,
          failure_code = NULL,
          failure_message = NULL,
          processed_at = now(),
          updated_at = now()
      FROM eligible_event
      WHERE event.id = eligible_event.id
      RETURNING event.status
    )
    SELECT
      EXISTS (SELECT 1 FROM grant_row) AS granted,
      coalesce(
        (SELECT status::text FROM processed_event LIMIT 1),
        (SELECT status::text FROM event_row LIMIT 1)
      ) AS status,
      (SELECT count(*) FROM customer_record) AS customer_records
  `);

  return {
    granted: Boolean(result.rows[0]?.granted),
    status: result.rows[0]?.status ?? "processed",
  };
}

/**
 * Revokes as many still-unspent credits as possible after a verified full
 * refund or newly opened dispute. The purchase remains immutable in the
 * ledger; a negative adjustment records the compensating action. Stripe event
 * IDs make retries idempotent, and a user advisory lock serializes the balance
 * calculation with run reservations.
 */
export async function reversePurchasedCredits({
  stripeEventId,
  eventType,
  stripePaymentIntentId,
  ledgerReference,
  reason,
  livemode,
  apiVersion,
}: StripeReversalInput): Promise<{
  processed: boolean;
  reversedCredits: number;
}> {
  const paymentIntentId = normalizeReference(stripePaymentIntentId);
  const externalReference = normalizeReference(ledgerReference);
  const db = getDb();
  const [purchaseOwner] = await db
    .select({ userId: creditLedger.userId })
    .from(creditLedger)
    .where(eq(creditLedger.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  if (!purchaseOwner) {
    await recordBillingEvent({
      stripeEventId,
      eventType,
      status: "failed",
      livemode,
      apiVersion,
      failureCode: "purchase_not_found",
      failureMessage: "No credit purchase matched the Stripe PaymentIntent",
    });
    return { processed: false, reversedCredits: 0 };
  }

  const query = sql`
    WITH event_row AS MATERIALIZED (
      INSERT INTO billing_events (
        stripe_event_id, event_type, status, livemode, api_version,
        received_at, updated_at
      )
      VALUES (
        ${stripeEventId}, ${eventType}, 'processing'::billing_event_status,
        ${livemode}, ${apiVersion}::text, now(), now()
      )
      ON CONFLICT (stripe_event_id) DO UPDATE SET updated_at = now()
      RETURNING id, status
    ),
    eligible_event AS MATERIALIZED (
      SELECT id FROM event_row
      WHERE status IN (
        'received'::billing_event_status,
        'processing'::billing_event_status,
        'failed'::billing_event_status
      )
    ),
    purchase AS MATERIALIZED (
      SELECT ledger.user_id, ledger.amount
      FROM credit_ledger AS ledger
      CROSS JOIN eligible_event
      WHERE ledger.stripe_payment_intent_id = ${paymentIntentId}
        AND ledger.type = 'purchase'::credit_ledger_type
      LIMIT 1
    ),
    current_balance AS MATERIALIZED (
      SELECT
        purchase.user_id,
        purchase.amount AS purchased_credits,
        greatest(coalesce(sum(ledger.amount), 0)::integer, 0) AS balance
      FROM purchase
      LEFT JOIN credit_ledger AS ledger ON ledger.user_id = purchase.user_id
      GROUP BY purchase.user_id, purchase.amount
    ),
    reversal AS (
      INSERT INTO credit_ledger (
        user_id, amount, type, external_reference, metadata, created_at
      )
      SELECT
        current_balance.user_id,
        -least(current_balance.purchased_credits, current_balance.balance),
        'adjustment'::credit_ledger_type,
        ${externalReference},
        jsonb_build_object(
          'stripe_event_id', ${stripeEventId},
          'stripe_payment_intent_id', ${paymentIntentId},
          'reason', ${reason}
        ),
        now()
      FROM current_balance
      ON CONFLICT DO NOTHING
      RETURNING -amount AS reversed_credits
    ),
    finalized_event AS (
      UPDATE billing_events AS event
      SET
        status = CASE
          WHEN EXISTS (SELECT 1 FROM purchase)
            THEN 'processed'::billing_event_status
          ELSE 'failed'::billing_event_status
        END,
        failure_code = CASE
          WHEN EXISTS (SELECT 1 FROM purchase) THEN NULL
          ELSE 'purchase_not_found'
        END,
        failure_message = CASE
          WHEN EXISTS (SELECT 1 FROM purchase) THEN NULL
          ELSE 'No credit purchase matched the Stripe PaymentIntent'
        END,
        processed_at = CASE
          WHEN EXISTS (SELECT 1 FROM purchase) THEN now()
          ELSE NULL
        END,
        updated_at = now()
      FROM eligible_event
      WHERE event.id = eligible_event.id
      RETURNING event.status
    )
    SELECT
      coalesce(
        (SELECT status::text FROM finalized_event LIMIT 1),
        (SELECT status::text FROM event_row LIMIT 1)
      ) AS status,
      coalesce((SELECT reversed_credits FROM reversal LIMIT 1), 0)::integer
        AS reversed_credits
  `;
  const [, , result] = await db.batch([
    db.execute(sql`
      SELECT pg_advisory_xact_lock(hashtextextended(${stripeEventId}::text, 0))
    `),
    db.execute(sql`
      SELECT pg_advisory_xact_lock(hashtextextended(${purchaseOwner.userId}::text, 0))
    `),
    db.execute<{
    status: BillingEventStatus;
    reversed_credits: number | string;
  }>(query),
  ]);

  const row = result.rows[0];

  return {
    processed: row?.status === "processed",
    reversedCredits: Number(row?.reversed_credits ?? 0),
  };
}

/** Restores exactly the credits frozen when Stripe reinstates dispute funds. */
export async function restoreDisputedCredits({
  stripeEventId,
  eventType,
  stripePaymentIntentId,
  disputeId,
  livemode,
  apiVersion,
}: StripeRestorationInput): Promise<{
  processed: boolean;
  restoredCredits: number;
}> {
  const paymentIntentId = normalizeReference(stripePaymentIntentId);
  const withdrawalReference = normalizeReference(
    `stripe:dispute:${disputeId}:withdrawn`,
  );
  const restorationReference = normalizeReference(
    `stripe:dispute:${disputeId}:reinstated`,
  );
  const db = getDb();
  const [purchaseOwner] = await db
    .select({ userId: creditLedger.userId })
    .from(creditLedger)
    .where(eq(creditLedger.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  if (!purchaseOwner) {
    await recordBillingEvent({
      stripeEventId,
      eventType,
      status: "failed",
      livemode,
      apiVersion,
      failureCode: "purchase_not_found",
      failureMessage: "No credit purchase matched the Stripe PaymentIntent",
    });
    return { processed: false, restoredCredits: 0 };
  }

  const query = sql`
    WITH event_row AS MATERIALIZED (
      INSERT INTO billing_events (
        stripe_event_id, event_type, status, livemode, api_version,
        received_at, updated_at
      )
      VALUES (
        ${stripeEventId}, ${eventType}, 'processing'::billing_event_status,
        ${livemode}, ${apiVersion}::text, now(), now()
      )
      ON CONFLICT (stripe_event_id) DO UPDATE SET updated_at = now()
      RETURNING id, status
    ),
    eligible_event AS MATERIALIZED (
      SELECT id FROM event_row
      WHERE status IN (
        'received'::billing_event_status,
        'processing'::billing_event_status,
        'failed'::billing_event_status
      )
    ),
    withdrawal AS MATERIALIZED (
      SELECT ledger.user_id, -ledger.amount AS reversed_credits
      FROM credit_ledger AS ledger
      CROSS JOIN eligible_event
      WHERE ledger.external_reference = ${withdrawalReference}
        AND ledger.type = 'adjustment'::credit_ledger_type
      LIMIT 1
    ),
    restoration AS (
      INSERT INTO credit_ledger (
        user_id, amount, type, external_reference, metadata, created_at
      )
      SELECT
        withdrawal.user_id,
        withdrawal.reversed_credits,
        'adjustment'::credit_ledger_type,
        ${restorationReference},
        jsonb_build_object(
          'stripe_event_id', ${stripeEventId},
          'stripe_payment_intent_id', ${paymentIntentId},
          'stripe_dispute_id', ${disputeId},
          'reason', 'dispute_reinstated'
        ),
        now()
      FROM withdrawal
      ON CONFLICT DO NOTHING
      RETURNING amount AS restored_credits
    ),
    finalized_event AS (
      UPDATE billing_events AS event
      SET
        status = CASE
          WHEN EXISTS (SELECT 1 FROM withdrawal)
            THEN 'processed'::billing_event_status
          ELSE 'failed'::billing_event_status
        END,
        failure_code = CASE
          WHEN EXISTS (SELECT 1 FROM withdrawal) THEN NULL
          ELSE 'dispute_withdrawal_not_found'
        END,
        failure_message = CASE
          WHEN EXISTS (SELECT 1 FROM withdrawal) THEN NULL
          ELSE 'No prior credit freeze matched the Stripe dispute'
        END,
        processed_at = CASE
          WHEN EXISTS (SELECT 1 FROM withdrawal) THEN now()
          ELSE NULL
        END,
        updated_at = now()
      FROM eligible_event
      WHERE event.id = eligible_event.id
      RETURNING event.status
    )
    SELECT
      coalesce(
        (SELECT status::text FROM finalized_event LIMIT 1),
        (SELECT status::text FROM event_row LIMIT 1)
      ) AS status,
      coalesce((SELECT restored_credits FROM restoration LIMIT 1), 0)::integer
        AS restored_credits
  `;
  const [, , result] = await db.batch([
    db.execute(sql`
      SELECT pg_advisory_xact_lock(hashtextextended(${stripeEventId}::text, 0))
    `),
    db.execute(sql`
      SELECT pg_advisory_xact_lock(hashtextextended(${purchaseOwner.userId}::text, 0))
    `),
    db.execute<{
      status: BillingEventStatus;
      restored_credits: number | string;
    }>(query),
  ]);
  const row = result.rows[0];

  return {
    processed: row?.status === "processed",
    restoredCredits: Number(row?.restored_credits ?? 0),
  };
}
