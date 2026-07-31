import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import {
  grantPurchasedCredits,
  upsertBillingCustomer,
} from "@/lib/billing/credits";
import {
  CREDIT_VALIDITY_MONTHS,
  getFrozenCreditGrant,
} from "@/lib/billing/packages";
import { getStripe } from "@/lib/billing/stripe";

export const GUEST_CHECKOUT_COOKIE = "guest_checkout_token";

const CHECKOUT_SESSION_PATTERN = /^cs_(?:test_|live_)?[A-Za-z0-9_]+$/;

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null;
}

export function hashGuestCheckoutToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function tokenMatches(token: string, expectedHash: string | undefined) {
  if (!expectedHash || !/^[a-f0-9]{64}$/.test(expectedHash)) return false;
  const actual = Buffer.from(hashGuestCheckoutToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function paymentIntentId(
  value: string | { id: string } | null,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export type GuestCheckoutSummary =
  | { state: "invalid" | "processing" }
  | { state: "paid"; email: string };

export async function getGuestCheckoutSummary(
  sessionId: string,
  token: string | undefined,
): Promise<GuestCheckoutSummary> {
  if (!CHECKOUT_SESSION_PATTERN.test(sessionId) || !token) {
    return { state: "invalid" };
  }

  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if (
    session.metadata?.guestCheckout !== "true" ||
    !tokenMatches(token, session.metadata.guestCheckoutTokenHash)
  ) {
    return { state: "invalid" };
  }

  if (session.mode !== "payment" || session.payment_status !== "paid") {
    return { state: "processing" };
  }

  const email = normalizeEmail(
    session.customer_details?.email || session.customer_email,
  );
  return email ? { state: "paid", email } : { state: "invalid" };
}

export async function claimGuestCheckout({
  sessionId,
  token,
  userId,
  userEmail,
}: {
  sessionId: string;
  token: string | undefined;
  userId: string;
  userEmail: string;
}) {
  const summary = await getGuestCheckoutSummary(sessionId, token);
  const normalizedUserEmail = normalizeEmail(userEmail);

  if (
    summary.state !== "paid" ||
    !normalizedUserEmail ||
    summary.email !== normalizedUserEmail
  ) {
    throw new Error("This purchase does not match the signed-in account.");
  }

  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const packageId = session.metadata?.billingPackage;
  const grantVersion = session.metadata?.creditGrantVersion;
  const metadataCredits = Number(session.metadata?.creditGrant);
  const grant =
    packageId && grantVersion
      ? getFrozenCreditGrant(grantVersion, packageId)
      : undefined;
  const intentId = paymentIntentId(session.payment_intent);
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || null;

  if (
    !grant ||
    !intentId ||
    !Number.isSafeInteger(metadataCredits) ||
    metadataCredits !== grant.credits
  ) {
    throw new Error("The paid Checkout Session has invalid fulfillment data.");
  }

  if (customerId) {
    await upsertBillingCustomer({
      userId,
      stripeCustomerId: customerId,
    });
  }

  const expiresAt = new Date();
  expiresAt.setUTCMonth(expiresAt.getUTCMonth() + CREDIT_VALIDITY_MONTHS);
  const result = await grantPurchasedCredits({
    stripeEventId: `account-claim:${session.id}`,
    eventType: "checkout.session.account_claimed",
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: intentId,
    stripeCustomerId: customerId,
    userId,
    credits: grant.credits,
    packageId: grant.packageId,
    grantVersion: grant.version,
    introductory: grant.introductory,
    introductoryClaimId: null,
    expiresAt,
    livemode: session.livemode,
    apiVersion: null,
  });

  if (result.status === "failed") {
    throw new Error(
      "This account has already used the introductory purchase. Contact support so we can reconcile the payment.",
    );
  }

  return { credits: grant.credits };
}
