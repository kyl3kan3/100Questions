import { sql, type SQL } from "drizzle-orm";

function assertUserId(userId: string): void {
  if (!userId.trim() || userId.length > 255) {
    throw new Error("Invalid user ID");
  }
}

function assertPaymentIntentId(paymentIntentId: string): void {
  if (!paymentIntentId.trim() || paymentIntentId.length > 240) {
    throw new Error("Invalid Stripe PaymentIntent ID");
  }
}

export function availableCreditBalanceSql(userId: string) {
  assertUserId(userId);

  return sql<number>`(
    WITH purchase_lots AS (
      SELECT
        purchase.id,
        least(
          purchase.amount,
          greatest(
            purchase.amount + coalesce(sum(funded_event.amount), 0)::integer,
            0
          )
        )::integer AS remaining
      FROM credit_ledger AS purchase
      LEFT JOIN credit_ledger AS funded_event
        ON funded_event.funding_purchase_id = purchase.id
      WHERE purchase.user_id = ${userId}
        AND purchase.type = 'purchase'::credit_ledger_type
        AND purchase.amount > 0
        AND purchase.expires_at > now()
      GROUP BY purchase.id, purchase.amount
    )
    SELECT coalesce(sum(remaining), 0)::integer
    FROM purchase_lots
  )`;
}

export function availableCreditPurchaseSql(userId: string) {
  assertUserId(userId);

  return sql<string | null>`(
    SELECT purchase.id
    FROM credit_ledger AS purchase
    LEFT JOIN credit_ledger AS funded_event
      ON funded_event.funding_purchase_id = purchase.id
    WHERE purchase.user_id = ${userId}
      AND purchase.type = 'purchase'::credit_ledger_type
      AND purchase.amount > 0
      AND purchase.expires_at > now()
    GROUP BY
      purchase.id,
      purchase.amount,
      purchase.expires_at,
      purchase.created_at
    HAVING purchase.amount + coalesce(sum(funded_event.amount), 0) > 0
    ORDER BY purchase.expires_at, purchase.created_at, purchase.id
    LIMIT 1
  )`;
}

/**
 * A reservation can cross the irreversible consume boundary only while its
 * funding lot has no outstanding refund or dispute withdrawal. Reservations
 * without a funding purchase represent unlimited-access runs and remain
 * consumable.
 */
export function consumableCreditPurchaseSql(fundingPurchaseId: SQL) {
  return sql<boolean>`(
    ${fundingPurchaseId} IS NULL
    OR coalesce((
      SELECT sum(adjustment.amount)
      FROM credit_ledger AS adjustment
      WHERE adjustment.funding_purchase_id = ${fundingPurchaseId}
        AND adjustment.type = 'adjustment'::credit_ledger_type
    ), 0) >= 0
  )`;
}

/**
 * Returns the unconsumed entitlement and outstanding adjustment balance for a
 * purchase. Active reservations are deliberately not subtracted from
 * unconsumed entitlement: a later release must not resurrect credit after a
 * refund or dispute withdrawal.
 */
export function revocableCreditPurchaseSql(paymentIntentId: string) {
  assertPaymentIntentId(paymentIntentId);

  return sql`
    WITH purchase_entitlement AS MATERIALIZED (
      SELECT
        purchase.id,
        purchase.user_id,
        purchase.amount,
        purchase.expires_at,
        greatest(
          purchase.amount - coalesce((
            SELECT sum(greatest(-reservation.amount, 0))
            FROM credit_ledger AS reservation
            WHERE reservation.funding_purchase_id = purchase.id
              AND reservation.type = 'reserve'::credit_ledger_type
              AND EXISTS (
                SELECT 1
                FROM credit_ledger AS consumption
                WHERE consumption.funding_purchase_id = purchase.id
                  AND consumption.user_id = reservation.user_id
                  AND consumption.type = 'consume'::credit_ledger_type
                  AND (
                    (
                      reservation.run_id IS NOT NULL
                      AND consumption.run_id = reservation.run_id
                    )
                    OR (
                      reservation.external_reference ~
                        '^run:[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[1-8][0-9A-Fa-f]{3}-[89AaBb][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}:reserve$'
                      AND consumption.external_reference =
                        regexp_replace(
                          reservation.external_reference,
                          ':reserve$',
                          ':consume'
                        )
                    )
                  )
              )
          ), 0)::integer,
          0
        )::integer AS unconsumed_credits,
        coalesce((
          SELECT sum(adjustment.amount)
          FROM credit_ledger AS adjustment
          WHERE adjustment.funding_purchase_id = purchase.id
            AND adjustment.type = 'adjustment'::credit_ledger_type
        ), 0)::integer AS adjustment_balance
      FROM credit_ledger AS purchase
      WHERE purchase.stripe_payment_intent_id = ${paymentIntentId}
        AND purchase.type = 'purchase'::credit_ledger_type
      LIMIT 1
    )
    SELECT
      purchase_entitlement.*,
      least(
        purchase_entitlement.unconsumed_credits,
        greatest(
          purchase_entitlement.unconsumed_credits
            + purchase_entitlement.adjustment_balance,
          0
        )
      )::integer AS revocable_credits
    FROM purchase_entitlement
  `;
}
