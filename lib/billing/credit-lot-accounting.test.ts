import { readFileSync } from "node:fs";
import { join } from "node:path";

import { sql, type SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  availableCreditBalanceSql,
  availableCreditPurchaseSql,
  consumableCreditPurchaseSql,
  revocableCreditPurchaseSql,
} from "./credit-lot-sql";

const dialect = new PgDialect();

function compile(fragment: SQL) {
  return dialect.sqlToQuery(sql`SELECT ${fragment}`).sql;
}

describe("credit lot accounting", () => {
  it("bases availability on explicitly funded events rather than the raw ledger sum", () => {
    const balanceSql = compile(availableCreditBalanceSql("user_123"));
    const purchaseSql = compile(availableCreditPurchaseSql("user_123"));

    expect(balanceSql).toContain(
      "funded_event.funding_purchase_id = purchase.id",
    );
    expect(balanceSql).toContain("purchase.expires_at > now()");
    expect(purchaseSql).toContain(
      "funded_event.funding_purchase_id = purchase.id",
    );
    expect(purchaseSql).toContain(
      "HAVING purchase.amount + coalesce(sum(funded_event.amount), 0) > 0",
    );
    expect(balanceSql).not.toContain("global_balance");
  });

  it("allows only one reservation when the other positive lot has expired", () => {
    const now = Date.parse("2026-07-22T12:00:00Z");
    const lots = [
      { expiresAt: now - 1, remaining: 1 },
      { expiresAt: now + 60_000, remaining: 1 },
    ];
    const reserve = () => {
      const lot = lots.find(
        (candidate) => candidate.expiresAt > now && candidate.remaining > 0,
      );
      if (!lot) return false;
      lot.remaining -= 1;
      return true;
    };

    expect(reserve()).toBe(true);
    expect(reserve()).toBe(false);
  });

  it("keeps a reserved credit revoked after a later release", () => {
    const reversalSql = compile(
      revocableCreditPurchaseSql("pi_reserved_then_refunded"),
    );
    const unconsumedCredits = 1;
    const priorAdjustmentBalance = 0;
    const reversedCredits = Math.min(
      unconsumedCredits,
      Math.max(unconsumedCredits + priorAdjustmentBalance, 0),
    );
    const events = [-1, -reversedCredits, 1];
    const available = Math.max(
      0,
      Math.min(1, 1 + events.reduce((total, amount) => total + amount, 0)),
    );

    expect(reversalSql).toContain(
      "consumption.external_reference =",
    );
    expect(reversalSql).toContain(
      "regexp_replace",
    );
    expect(reversalSql).toContain(
      "reservation.external_reference",
    );
    expect(reversalSql).toContain(
      "adjustment.type = 'adjustment'::credit_ledger_type",
    );
    expect(reversalSql).not.toContain(
      "sum(funded_event.amount)",
    );
    expect(reversalSql).toMatch(
      /purchase_entitlement\.unconsumed_credits\s+\+\s+purchase_entitlement\.adjustment_balance/,
    );
    expect(reversedCredits).toBe(1);
    expect(
      Math.min(unconsumedCredits, Math.max(unconsumedCredits - 1, 0)),
    ).toBe(0);
    expect(available).toBe(0);
  });

  it("rejects consume after a reservation's funding lot is reversed", () => {
    const consumeGuardSql = compile(
      consumableCreditPurchaseSql(sql`reservation.funding_purchase_id`),
    );
    const events = [
      { type: "reserve", amount: -1 },
      { type: "adjustment", amount: -1 },
    ];
    const outstandingAdjustment = events
      .filter((event) => event.type === "adjustment")
      .reduce((total, event) => total + event.amount, 0);

    expect(consumeGuardSql).toContain(
      "adjustment.funding_purchase_id = reservation.funding_purchase_id",
    );
    expect(consumeGuardSql).toContain(
      "adjustment.type = 'adjustment'::credit_ledger_type",
    );
    expect(consumeGuardSql).toMatch(/coalesce\([\s\S]+, 0\) >= 0/);
    expect(outstandingAdjustment >= 0).toBe(false);
    expect([...events, { type: "adjustment", amount: 1 }]
      .filter((event) => event.type === "adjustment")
      .reduce((total, event) => total + event.amount, 0) >= 0).toBe(true);
  });

  it("backfills restorations through either payment intent or withdrawal reference", () => {
    const migration = readFileSync(
      join(process.cwd(), "drizzle", "0005_complete_spencer_smythe.sql"),
      "utf8",
    );

    expect(migration).toContain(
      "ledger_event.metadata->>'stripe_payment_intent_id'",
    );
    expect(migration).toContain(
      "ledger_event.metadata->>'withdrawal_reference'",
    );
    expect(migration).toContain(
      "Failed to backfill a resolvable dispute restoration credit lot",
    );
    expect(migration).toContain(
      'CREATE UNIQUE INDEX "introductory_checkout_claims_user_id_unique"',
    );
    expect(migration).toContain('"checkout_metadata" jsonb');
    expect(migration).toContain('"stripe_checkout_url" text');
  });

  it("links deleted-run releases and consumes by their stable ledger references", () => {
    const migration = readFileSync(
      join(process.cwd(), "drizzle", "0005_complete_spencer_smythe.sql"),
      "utf8",
    );

    expect(migration).toMatch(
      /regexp_replace\(\s*ledger_event\.external_reference,\s*':\(consume\|release\)\$',\s*':reserve'/u,
    );
    expect(migration).toContain(
      "Failed to backfill a resolvable deleted-run credit release",
    );
    expect(migration).toContain(
      "Failed to backfill a resolvable deleted-run credit consumption",
    );
  });
});
