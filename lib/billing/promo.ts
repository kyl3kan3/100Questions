import "server-only";

import { createHash } from "node:crypto";

import { getDb } from "@/lib/db";
import { creditLedger } from "@/lib/db/schema";

const PROMO_CODE = "shipordie";
export const PROMO_CREDIT_GRANT = 2;

export type PromoRedemptionResult = "redeemed" | "already_redeemed" | "invalid";

function normalizePromoCode(code: string): string {
  return code.trim().toLowerCase();
}

function promoExternalReference(userId: string): string {
  const userFingerprint = createHash("sha256")
    .update(userId)
    .digest("hex")
    .slice(0, 32);

  return `promo:${PROMO_CODE}:${userFingerprint}`;
}

function promoExpirationDate(now = new Date()): Date {
  const expiresAt = new Date(now);
  expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1);
  return expiresAt;
}

export async function redeemPromoCode({
  userId,
  code,
}: {
  userId: string;
  code: string;
}): Promise<PromoRedemptionResult> {
  if (!userId.trim() || userId.length > 255) {
    throw new Error("Invalid user ID");
  }

  if (normalizePromoCode(code) !== PROMO_CODE) {
    return "invalid";
  }

  const [grant] = await getDb()
    .insert(creditLedger)
    .values({
      userId,
      amount: PROMO_CREDIT_GRANT,
      type: "purchase",
      externalReference: promoExternalReference(userId),
      metadata: {
        source: "promo_code",
        promo_code: PROMO_CODE,
      },
      expiresAt: promoExpirationDate(),
    })
    .onConflictDoNothing({ target: creditLedger.externalReference })
    .returning({ id: creditLedger.id });

  return grant ? "redeemed" : "already_redeemed";
}

