import "server-only";

import { eq, sql } from "drizzle-orm";

import {
  availableCreditBalanceSql,
  availableCreditPurchaseSql,
  consumableCreditPurchaseSql,
  revocableCreditPurchaseSql,
} from "./credit-lot-sql";
import { getDb } from "@/lib/db";
import {
  billingCustomers,
  billingEvents,
  creditLedger,
} from "@/lib/db/schema";

export { isStripeCheckoutConfigured } from "@/lib/billing/stripe";

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
  packageId: string;
  grantVersion: string;
  introductory: boolean;
  introductoryClaimId?: string | null;
  expiresAt: Date;
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

type PrepareIntroductoryCheckoutClaimInput = {
  userId: string;
  packageId: string;
  grantVersion: string;
  credits: number;
  stripePriceId: string;
  stripeCustomerId: string;
  successUrl: string;
  cancelUrl: string;
  checkoutMetadata: Record<string, string>;
};

export type PreparedIntroductoryCheckoutClaim =
  | { state: "unavailable" }
  | { state: "fulfilled" }
  | { state: "payment_pending" }
  | {
      state: "reuse";
      claimId: string;
      credits: number;
      checkoutUrl: string;
    }
  | {
      state: "create";
      claimId: string;
      attempt: number;
      userId: string;
      packageId: string;
      grantVersion: string;
      credits: number;
      stripePriceId: string;
      stripeCustomerId: string;
      successUrl: string;
      cancelUrl: string;
      checkoutMetadata: Record<string, string>;
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
  const result = await getDb().execute<{ balance: number | string }>(sql`
    SELECT ${availableCreditBalanceSql(userId)} AS balance
  `);

  return Number(result.rows[0]?.balance ?? 0);
}

export async function hasPurchasedCredits(userId: string): Promise<boolean> {
  assertUserId(userId);
  const [purchase] = await getDb()
    .select({ id: creditLedger.id })
    .from(creditLedger)
    .where(
      sql`${creditLedger.userId} = ${userId} AND ${creditLedger.type} = 'purchase'::credit_ledger_type`,
    )
    .limit(1);

  return Boolean(purchase);
}

export async function prepareIntroductoryCheckoutClaim({
  userId,
  packageId,
  grantVersion,
  credits,
  stripePriceId,
  stripeCustomerId,
  successUrl,
  cancelUrl,
  checkoutMetadata,
}: PrepareIntroductoryCheckoutClaimInput): Promise<PreparedIntroductoryCheckoutClaim> {
  assertUserId(userId);
  if (
    !packageId.trim() ||
    !grantVersion.trim() ||
    !stripePriceId.trim() ||
    !stripeCustomerId.trim() ||
    !Number.isSafeInteger(credits) ||
    credits < 1
  ) {
    throw new Error("Invalid introductory Checkout claim");
  }

  const db = getDb();
  const query = sql`
    WITH inserted_claim AS (
      INSERT INTO introductory_checkout_claims (
        user_id,
        status,
        grant_version,
        package_id,
        credits,
        stripe_price_id,
        stripe_customer_id,
        success_url,
        cancel_url,
        checkout_metadata,
        attempt,
        created_at,
        updated_at
      )
      SELECT
        ${userId},
        'creating',
        ${grantVersion},
        ${packageId},
        ${credits},
        ${stripePriceId},
        ${stripeCustomerId},
        ${successUrl},
        ${cancelUrl},
        ${JSON.stringify(checkoutMetadata)}::jsonb,
        1,
        now(),
        now()
      WHERE NOT EXISTS (
        SELECT 1
        FROM credit_ledger
        WHERE user_id = ${userId}
          AND type = 'purchase'::credit_ledger_type
      )
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *
    ),
    locked_claim AS MATERIALIZED (
      SELECT claim.*
      FROM introductory_checkout_claims AS claim
      WHERE claim.user_id = ${userId}
      FOR UPDATE
    ),
    rotated_claim AS (
      UPDATE introductory_checkout_claims AS claim
      SET
        status = 'creating',
        grant_version = ${grantVersion},
        package_id = ${packageId},
        credits = ${credits},
        stripe_price_id = ${stripePriceId},
        stripe_customer_id = ${stripeCustomerId},
        success_url = ${successUrl},
        cancel_url = ${cancelUrl},
        checkout_metadata = ${JSON.stringify(checkoutMetadata)}::jsonb,
        attempt = claim.attempt + 1,
        stripe_checkout_session_id = NULL,
        stripe_checkout_url = NULL,
        stripe_session_expires_at = NULL,
        updated_at = now()
      FROM locked_claim
      WHERE claim.id = locked_claim.id
        AND locked_claim.status = 'retryable'
      RETURNING claim.*
    ),
    effective_claim AS (
      SELECT * FROM rotated_claim
      UNION ALL
      SELECT * FROM inserted_claim
      UNION ALL
      SELECT locked_claim.*
      FROM locked_claim
      WHERE NOT EXISTS (SELECT 1 FROM rotated_claim)
        AND NOT EXISTS (SELECT 1 FROM inserted_claim)
    )
    SELECT
      id,
      user_id,
      status,
      grant_version,
      package_id,
      credits,
      stripe_price_id,
      stripe_customer_id,
      success_url,
      cancel_url,
      checkout_metadata,
      attempt,
      stripe_checkout_url
    FROM effective_claim
    LIMIT 1
  `;
  const [, result] = await db.batch([
    db.execute(sql`
      SELECT pg_advisory_xact_lock(hashtextextended(${userId}::text, 0))
    `),
    db.execute<{
      id: string;
      user_id: string;
      status:
        | "creating"
        | "open"
        | "payment_pending"
        | "retryable"
        | "fulfilled";
      grant_version: string;
      package_id: string;
      credits: number | string;
      stripe_price_id: string | null;
      stripe_customer_id: string | null;
      success_url: string | null;
      cancel_url: string | null;
      checkout_metadata: Record<string, string>;
      attempt: number | string;
      stripe_checkout_url: string | null;
    }>(query),
  ]);
  const claim = result.rows[0];

  if (!claim) return { state: "unavailable" };
  if (claim.status === "fulfilled") return { state: "fulfilled" };
  if (claim.status === "payment_pending") return { state: "payment_pending" };
  if (claim.status === "open" && claim.stripe_checkout_url) {
    return {
      state: "reuse",
      claimId: claim.id,
      credits: Number(claim.credits),
      checkoutUrl: claim.stripe_checkout_url,
    };
  }
  if (
    !claim.stripe_price_id ||
    !claim.stripe_customer_id ||
    !claim.success_url ||
    !claim.cancel_url
  ) {
    throw new Error("Introductory Checkout claim snapshot is incomplete");
  }

  return {
    state: "create",
    claimId: claim.id,
    attempt: Number(claim.attempt),
    userId: claim.user_id,
    packageId: claim.package_id,
    grantVersion: claim.grant_version,
    credits: Number(claim.credits),
    stripePriceId: claim.stripe_price_id,
    stripeCustomerId: claim.stripe_customer_id,
    successUrl: claim.success_url,
    cancelUrl: claim.cancel_url,
    checkoutMetadata: claim.checkout_metadata,
  };
}

export async function persistIntroductoryCheckoutSession({
  claimId,
  userId,
  attempt,
  stripeCheckoutSessionId,
  checkoutUrl,
  expiresAt,
}: {
  claimId: string;
  userId: string;
  attempt: number;
  stripeCheckoutSessionId: string;
  checkoutUrl: string;
  expiresAt: Date;
}) {
  assertRunId(claimId);
  assertUserId(userId);
  const result = await getDb().execute<{
    stripe_checkout_url: string;
  }>(sql`
    UPDATE introductory_checkout_claims
    SET
      status = 'open',
      stripe_checkout_session_id = ${stripeCheckoutSessionId},
      stripe_checkout_url = ${checkoutUrl},
      stripe_session_expires_at = ${expiresAt},
      updated_at = now()
    WHERE id = ${claimId}::uuid
      AND user_id = ${userId}
      AND attempt = ${attempt}
      AND status IN ('creating', 'open')
      AND (
        stripe_checkout_session_id IS NULL
        OR stripe_checkout_session_id = ${stripeCheckoutSessionId}
      )
    RETURNING stripe_checkout_url
  `);
  const persistedUrl = result.rows[0]?.stripe_checkout_url;

  if (!persistedUrl) {
    throw new Error("Introductory Checkout Session could not be persisted");
  }

  return persistedUrl;
}

export async function recordIntroductoryCheckoutSessionState({
  claimId,
  userId,
  stripeCheckoutSessionId,
  state,
}: {
  claimId: string;
  userId: string;
  stripeCheckoutSessionId: string;
  state: "payment_pending" | "retryable";
}) {
  assertRunId(claimId);
  assertUserId(userId);
  await getDb().execute(sql`
    UPDATE introductory_checkout_claims
    SET
      status = ${state},
      stripe_checkout_session_id =
        CASE WHEN ${state} = 'retryable' THEN NULL
          ELSE stripe_checkout_session_id END,
      stripe_checkout_url =
        CASE WHEN ${state} = 'retryable' THEN NULL
          ELSE stripe_checkout_url END,
      stripe_session_expires_at =
        CASE WHEN ${state} = 'retryable' THEN NULL
          ELSE stripe_session_expires_at END,
      updated_at = now()
    WHERE id = ${claimId}::uuid
      AND user_id = ${userId}
      AND stripe_checkout_session_id = ${stripeCheckoutSessionId}
      AND status <> 'fulfilled'
  `);
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
    available_purchase AS MATERIALIZED (
      SELECT ${availableCreditPurchaseSql(userId)}::uuid AS id
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
        funding_purchase_id,
        external_reference,
        metadata
      )
      SELECT
        ${userId},
        -1,
        'reserve'::credit_ledger_type,
        owned_run.id,
        available_purchase.id,
        ${reference},
        jsonb_build_object('state', 'reserved')
      FROM available_purchase
      CROSS JOIN owned_run
      WHERE available_purchase.id IS NOT NULL
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
      SELECT ledger.funding_purchase_id
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
        funding_purchase_id,
        external_reference,
        metadata
      )
      SELECT
        ${userId},
        0,
        'consume'::credit_ledger_type,
        ${runId}::uuid,
        reservation.funding_purchase_id,
        ${reference},
        jsonb_build_object('state', 'consumed')
      FROM reservation
      WHERE EXISTS (SELECT 1 FROM reservation)
        AND ${consumableCreditPurchaseSql(
          sql`reservation.funding_purchase_id`,
        )}
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
      SELECT ledger.amount, ledger.funding_purchase_id
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
        funding_purchase_id,
        external_reference,
        metadata
      )
      SELECT
        ${userId},
        -reservation.amount,
        'release'::credit_ledger_type,
        ${runId}::uuid,
        reservation.funding_purchase_id,
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
  packageId,
  grantVersion,
  introductory,
  introductoryClaimId,
  expiresAt,
  livemode,
  apiVersion,
}: StripePurchaseInput): Promise<{ granted: boolean; status: string }> {
  assertUserId(userId);

  if (!Number.isSafeInteger(credits) || credits < 1 || credits > 100) {
    throw new Error("Invalid purchased credit count");
  }

  if (!packageId.trim() || packageId.length > 64) {
    throw new Error("Invalid billing package ID");
  }

  if (!grantVersion.trim() || grantVersion.length > 32) {
    throw new Error("Invalid credit grant version");
  }

  if (introductoryClaimId) {
    assertRunId(introductoryClaimId);
  }

  if (!Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date()) {
    throw new Error("Invalid credit expiration");
  }

  const reference = normalizeReference(
    `stripe:checkout:${stripeCheckoutSessionId}`,
  );
  const paymentIntentId = normalizeReference(stripePaymentIntentId);
  const result = await getDb().execute<{
    granted: boolean;
    status: string;
  }>(sql`
    WITH checkout_locks AS MATERIALIZED (
      SELECT
        pg_advisory_xact_lock(
          hashtextextended(${stripeCheckoutSessionId}::text, 0)
        ),
        pg_advisory_xact_lock(hashtextextended(${userId}::text, 0))
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
      FROM checkout_locks
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
    provided_claim AS MATERIALIZED (
      SELECT claim.*
      FROM introductory_checkout_claims AS claim
      CROSS JOIN eligible_event
      WHERE ${introductory}
        AND claim.user_id = ${userId}
        AND (
          ${introductoryClaimId ?? null}::uuid IS NULL
          OR claim.id = ${introductoryClaimId ?? null}::uuid
        )
      LIMIT 1
      FOR UPDATE
    ),
    legacy_claim AS (
      INSERT INTO introductory_checkout_claims (
        user_id,
        status,
        grant_version,
        package_id,
        credits,
        stripe_customer_id,
        stripe_checkout_session_id,
        fulfilled_session_id,
        attempt,
        created_at,
        updated_at,
        fulfilled_at
      )
      SELECT
        ${userId},
        'fulfilled',
        ${grantVersion},
        ${packageId},
        ${credits},
        ${stripeCustomerId}::text,
        ${stripeCheckoutSessionId},
        ${stripeCheckoutSessionId},
        1,
        now(),
        now(),
        now()
      FROM eligible_event
      WHERE ${introductory}
        AND ${introductoryClaimId ?? null}::uuid IS NULL
        AND NOT EXISTS (SELECT 1 FROM provided_claim)
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *
    ),
    resolved_claim AS MATERIALIZED (
      SELECT * FROM provided_claim
      UNION ALL
      SELECT * FROM legacy_claim
    ),
    claim_gate AS MATERIALIZED (
      SELECT (
        NOT ${introductory}
        OR EXISTS (
          SELECT 1
          FROM resolved_claim
          WHERE status <> 'fulfilled'
            OR fulfilled_session_id = ${stripeCheckoutSessionId}
        )
      ) AS allowed
    ),
    existing_purchase AS MATERIALIZED (
      SELECT ledger.id
      FROM credit_ledger AS ledger
      CROSS JOIN eligible_event
      WHERE ledger.type = 'purchase'::credit_ledger_type
        AND (
          ledger.stripe_checkout_session_id = ${stripeCheckoutSessionId}
          OR ledger.stripe_payment_intent_id = ${paymentIntentId}
        )
      LIMIT 1
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
      CROSS JOIN claim_gate
      WHERE ${stripeCustomerId}::text IS NOT NULL
        AND claim_gate.allowed
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
        expires_at,
        created_at
      )
      SELECT
        ${userId},
        ${credits},
        'purchase'::credit_ledger_type,
        ${stripeCheckoutSessionId},
        ${paymentIntentId},
        ${reference},
        jsonb_build_object(
          'stripe_event_id', ${stripeEventId},
          'package_id', ${packageId},
          'grant_version', ${grantVersion},
          'introductory_claim_id', ${introductoryClaimId ?? null}::text
        ),
        ${expiresAt},
        now()
      FROM eligible_event
      CROSS JOIN claim_gate
      WHERE claim_gate.allowed
      ON CONFLICT DO NOTHING
      RETURNING id
    ),
    fulfilled_claim AS (
      UPDATE introductory_checkout_claims AS claim
      SET
        status = 'fulfilled',
        stripe_customer_id =
          coalesce(${stripeCustomerId}::text, claim.stripe_customer_id),
        stripe_checkout_session_id = ${stripeCheckoutSessionId},
        fulfilled_session_id = ${stripeCheckoutSessionId},
        fulfilled_at = coalesce(claim.fulfilled_at, now()),
        updated_at = now()
      FROM resolved_claim
      WHERE ${introductory}
        AND claim.id = resolved_claim.id
        AND EXISTS (SELECT 1 FROM provided_claim)
        AND (
          EXISTS (SELECT 1 FROM grant_row)
          OR EXISTS (SELECT 1 FROM existing_purchase)
        )
      RETURNING claim.id
    ),
    processed_event AS (
      UPDATE billing_events AS event
      SET status = CASE
            WHEN claim_gate.allowed
              AND (
                EXISTS (SELECT 1 FROM grant_row)
                OR EXISTS (SELECT 1 FROM existing_purchase)
              )
              THEN 'processed'::billing_event_status
            ELSE 'failed'::billing_event_status
          END,
          failure_code = CASE
            WHEN claim_gate.allowed THEN NULL
            ELSE 'introductory_claim_already_fulfilled'
          END,
          failure_message = CASE
            WHEN claim_gate.allowed THEN NULL
            ELSE 'A different Checkout Session already fulfilled the introductory claim'
          END,
          processed_at = CASE
            WHEN claim_gate.allowed
              AND (
                EXISTS (SELECT 1 FROM grant_row)
                OR EXISTS (SELECT 1 FROM existing_purchase)
              )
              THEN now()
            ELSE NULL
          END,
          updated_at = now()
      FROM eligible_event, claim_gate
      WHERE event.id = eligible_event.id
      RETURNING event.status
    )
    SELECT
      EXISTS (SELECT 1 FROM grant_row) AS granted,
      coalesce(
        (SELECT status::text FROM processed_event LIMIT 1),
        (SELECT status::text FROM event_row LIMIT 1)
      ) AS status,
      (SELECT count(*) FROM customer_record) AS customer_records,
      (SELECT count(*) FROM fulfilled_claim) AS fulfilled_claims
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
      ${revocableCreditPurchaseSql(paymentIntentId)}
    ),
    reversal AS (
      INSERT INTO credit_ledger (
        user_id, amount, type, funding_purchase_id, external_reference,
        metadata, created_at
      )
      SELECT
        purchase.user_id,
        -CASE
          WHEN purchase.expires_at > now() THEN
            purchase.revocable_credits
          ELSE 0
        END,
        'adjustment'::credit_ledger_type,
        purchase.id,
        ${externalReference},
        jsonb_build_object(
          'stripe_event_id', ${stripeEventId},
          'stripe_payment_intent_id', ${paymentIntentId},
          'reason', ${reason}
        ),
        now()
      FROM purchase
      CROSS JOIN eligible_event
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
      SELECT
        ledger.user_id,
        -ledger.amount AS reversed_credits,
        purchase.id AS purchase_id,
        purchase.expires_at
      FROM credit_ledger AS ledger
      INNER JOIN credit_ledger AS purchase
        ON purchase.stripe_payment_intent_id = ${paymentIntentId}
       AND purchase.type = 'purchase'::credit_ledger_type
      CROSS JOIN eligible_event
      WHERE ledger.external_reference = ${withdrawalReference}
        AND ledger.type = 'adjustment'::credit_ledger_type
      LIMIT 1
    ),
    restoration AS (
      INSERT INTO credit_ledger (
        user_id, amount, type, funding_purchase_id, external_reference,
        metadata, created_at
      )
      SELECT
        withdrawal.user_id,
        CASE
          WHEN withdrawal.expires_at > now() THEN withdrawal.reversed_credits
          ELSE 0
        END,
        'adjustment'::credit_ledger_type,
        withdrawal.purchase_id,
        ${restorationReference},
        jsonb_build_object(
          'stripe_event_id', ${stripeEventId},
          'stripe_payment_intent_id', ${paymentIntentId},
          'stripe_dispute_id', ${disputeId},
          'withdrawal_reference', ${withdrawalReference},
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
