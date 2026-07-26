import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("promo-code redemption", () => {
  const source = readFileSync(join(process.cwd(), "lib/billing/promo.ts"), "utf8");
  const creditsSource = readFileSync(
    join(process.cwd(), "lib/billing/credits.ts"),
    "utf8",
  );

  it("defines shipordie as a two-credit grant", () => {
    expect(source).toContain('const PROMO_CODE = "shipordie"');
    expect(source).toContain("export const PROMO_CREDIT_GRANT = 2");
  });

  it("uses an account-specific unique ledger reference", () => {
    expect(source).toContain("promoExternalReference(userId)");
    expect(source).toContain(
      ".onConflictDoNothing({ target: creditLedger.externalReference })",
    );
  });

  it("expires promotional credits after one year", () => {
    expect(source).toContain(
      "expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1)",
    );
  });

  it("does not count a promotional grant as a prior paid purchase", () => {
    expect(creditsSource).toContain(
      "AND ${creditLedger.stripeCheckoutSessionId} IS NOT NULL",
    );
    expect(creditsSource).toMatch(
      /WHERE user_id = \$\{userId\}\s+AND type = 'purchase'::credit_ledger_type\s+AND stripe_checkout_session_id IS NOT NULL/u,
    );
  });
});
