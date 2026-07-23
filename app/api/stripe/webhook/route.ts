import type Stripe from "stripe";

import {
  grantPurchasedCredits,
  recordBillingEvent,
  recordIntroductoryCheckoutSessionState,
  reversePurchasedCredits,
  restoreDisputedCredits,
} from "@/lib/billing/credits";
import {
  CREDIT_VALIDITY_MONTHS,
  getFrozenCreditGrant,
} from "@/lib/billing/packages";
import {
  BillingConfigurationError,
  getStripe,
  getStripeWebhookSecret,
} from "@/lib/billing/stripe";

export const runtime = "nodejs";

function getStripeObjectId(
  value: string | { id: string } | null,
): string | null {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

async function persistIgnoredEvent(
  event: Stripe.Event,
  failureCode?: string,
  failureMessage?: string,
) {
  await recordBillingEvent({
    stripeEventId: event.id,
    eventType: event.type,
    status: failureCode ? "failed" : "ignored",
    livemode: event.livemode,
    apiVersion: event.api_version,
    failureCode,
    failureMessage,
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    if (error instanceof BillingConfigurationError) {
      return Response.json(
        { error: "Stripe webhooks are not configured" },
        { status: 503 },
      );
    }

    return Response.json(
      { error: "Invalid Stripe signature" },
      { status: 400 },
    );
  }

  try {
    if (event.type === "charge.refunded") {
      const charge = event.data.object;

      if (!charge.refunded) {
        await persistIgnoredEvent(event);
        return Response.json({ received: true });
      }

      const paymentIntentId = getStripeObjectId(charge.payment_intent);

      if (!paymentIntentId) {
        await persistIgnoredEvent(
          event,
          "missing_payment_intent",
          "A fully refunded charge did not reference a PaymentIntent",
        );
        return Response.json({ received: true });
      }

      const reversal = await reversePurchasedCredits({
        stripeEventId: event.id,
        eventType: event.type,
        stripePaymentIntentId: paymentIntentId,
        ledgerReference: `stripe:refund:${charge.id}`,
        reason: "refund",
        livemode: event.livemode,
        apiVersion: event.api_version,
      });

      if (!reversal.processed) {
        throw new Error("Refund arrived before its credit purchase");
      }

      return Response.json({ received: true });
    }

    if (event.type === "charge.dispute.funds_withdrawn") {
      const dispute = event.data.object;
      const paymentIntentId = getStripeObjectId(dispute.payment_intent);

      if (!paymentIntentId) {
        await persistIgnoredEvent(
          event,
          "missing_payment_intent",
          "A dispute did not reference a PaymentIntent",
        );
        return Response.json({ received: true });
      }

      const reversal = await reversePurchasedCredits({
        stripeEventId: event.id,
        eventType: event.type,
        stripePaymentIntentId: paymentIntentId,
        ledgerReference: `stripe:dispute:${dispute.id}:withdrawn`,
        reason: "dispute",
        livemode: event.livemode,
        apiVersion: event.api_version,
      });

      if (!reversal.processed) {
        throw new Error("Dispute arrived before its credit purchase");
      }

      return Response.json({ received: true });
    }

    if (event.type === "charge.dispute.funds_reinstated") {
      const dispute = event.data.object;
      const paymentIntentId = getStripeObjectId(dispute.payment_intent);

      if (!paymentIntentId) {
        await persistIgnoredEvent(
          event,
          "missing_payment_intent",
          "A dispute reinstatement did not reference a PaymentIntent",
        );
        return Response.json({ received: true });
      }

      const restoration = await restoreDisputedCredits({
        stripeEventId: event.id,
        eventType: event.type,
        stripePaymentIntentId: paymentIntentId,
        disputeId: dispute.id,
        livemode: event.livemode,
        apiVersion: event.api_version,
      });

      if (!restoration.processed) {
        throw new Error("Dispute funds were reinstated before withdrawal was recorded");
      }

      return Response.json({ received: true });
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const checkoutSession = event.data.object;
      const claimId = checkoutSession.metadata?.introductoryClaimId;
      const metadataUserId = checkoutSession.metadata?.appUserId;

      if (
        claimId &&
        metadataUserId &&
        checkoutSession.client_reference_id === metadataUserId
      ) {
        await recordIntroductoryCheckoutSessionState({
          claimId,
          userId: metadataUserId,
          stripeCheckoutSessionId: checkoutSession.id,
          state: "retryable",
        });
        await recordBillingEvent({
          stripeEventId: event.id,
          eventType: event.type,
          status: "processed",
          livemode: event.livemode,
          apiVersion: event.api_version,
        });
      } else {
        await persistIgnoredEvent(event);
      }

      return Response.json({ received: true });
    }

    if (
      event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_succeeded"
    ) {
      await persistIgnoredEvent(event);
      return Response.json({ received: true });
    }

    const checkoutSession = event.data.object;

    if (
      event.type === "checkout.session.completed" &&
      checkoutSession.payment_status !== "paid"
    ) {
      const claimId = checkoutSession.metadata?.introductoryClaimId;
      const metadataUserId = checkoutSession.metadata?.appUserId;

      if (
        claimId &&
        metadataUserId &&
        checkoutSession.client_reference_id === metadataUserId
      ) {
        await recordIntroductoryCheckoutSessionState({
          claimId,
          userId: metadataUserId,
          stripeCheckoutSessionId: checkoutSession.id,
          state: "payment_pending",
        });
        await recordBillingEvent({
          stripeEventId: event.id,
          eventType: event.type,
          status: "processed",
          livemode: event.livemode,
          apiVersion: event.api_version,
        });
      } else {
        await persistIgnoredEvent(event);
      }

      return Response.json({ received: true });
    }

    if (
      checkoutSession.mode !== "payment" ||
      checkoutSession.payment_status !== "paid"
    ) {
      await persistIgnoredEvent(event);
      return Response.json({ received: true });
    }

    const clientReferenceId = checkoutSession.client_reference_id;
    const metadataUserId = checkoutSession.metadata?.appUserId;
    const metadataCredits = Number(checkoutSession.metadata?.creditGrant);
    const packageId = checkoutSession.metadata?.billingPackage;
    const grantVersion = checkoutSession.metadata?.creditGrantVersion;
    const introductoryClaimId =
      checkoutSession.metadata?.introductoryClaimId ?? null;
    const frozenGrant =
      packageId && grantVersion
        ? getFrozenCreditGrant(grantVersion, packageId)
        : undefined;
    const paymentIntentId = getStripeObjectId(checkoutSession.payment_intent);

    if (
      !clientReferenceId ||
      !metadataUserId ||
      !paymentIntentId ||
      clientReferenceId !== metadataUserId ||
      !frozenGrant ||
      !Number.isSafeInteger(metadataCredits) ||
      metadataCredits !== frozenGrant.credits
    ) {
      await persistIgnoredEvent(
        event,
        "invalid_user_reference",
        "Checkout Session is missing consistent application credit metadata",
      );
      return Response.json({ received: true });
    }

    const expiresAt = new Date(event.created * 1_000);
    expiresAt.setUTCMonth(expiresAt.getUTCMonth() + CREDIT_VALIDITY_MONTHS);

    await grantPurchasedCredits({
      stripeEventId: event.id,
      eventType: event.type,
      stripeCheckoutSessionId: checkoutSession.id,
      stripePaymentIntentId: paymentIntentId,
      stripeCustomerId: getStripeObjectId(checkoutSession.customer),
      userId: clientReferenceId,
      credits: metadataCredits,
      packageId: frozenGrant.packageId,
      grantVersion: frozenGrant.version,
      introductory: frozenGrant.introductory,
      introductoryClaimId,
      expiresAt,
      livemode: event.livemode,
      apiVersion: event.api_version,
    });

    return Response.json({ received: true });
  } catch {
    // Returning 500 asks Stripe to retry. No raw event or answer data is logged.
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
