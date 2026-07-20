import { createHash } from "node:crypto";

import { auth } from "@/lib/auth/server";
import {
  getBillingCustomerForUser,
  upsertBillingCustomer,
} from "@/lib/billing/credits";
import {
  BillingConfigurationError,
  getApplicationOrigin,
  getCreditsPerPurchase,
  getStripe,
  getStripePriceId,
  isSameOriginRequest,
  isStripeWebhookConfigured,
} from "@/lib/billing/stripe";

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]{8,80}$/;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const { data: session, error: sessionError } = await auth.getSession();

  if (sessionError) {
    return Response.json(
      { error: "Authentication is temporarily unavailable" },
      { status: 503 },
    );
  }

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStripeWebhookConfigured()) {
    return Response.json(
      { error: "Payments are unavailable until credit fulfillment is configured" },
      { status: 503 },
    );
  }

  const idempotencyKey = request.headers.get("idempotency-key")?.trim();

  if (!idempotencyKey || !IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
    return Response.json(
      { error: "A valid idempotency key is required" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    let customerId = await getBillingCustomerForUser(session.user.id);

    if (!customerId) {
      const customer = await stripe.customers.create(
        {
          email: session.user.email || undefined,
          metadata: { appUserId: session.user.id },
        },
        {
          idempotencyKey: `100q:customer:${createHash("sha256")
            .update(session.user.id)
            .digest("hex")}`,
        },
      );
      customerId = customer.id;
      await upsertBillingCustomer({
        userId: session.user.id,
        stripeCustomerId: customerId,
      });
    }
    const origin = getApplicationOrigin(request);
    const credits = getCreditsPerPurchase();
    const checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [{ price: getStripePriceId(), quantity: 1 }],
        client_reference_id: session.user.id,
        customer: customerId,
        metadata: {
          appUserId: session.user.id,
          creditGrant: String(credits),
          creditGrantVersion: "v1",
        },
        invoice_creation: { enabled: true },
        success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/dashboard?checkout=cancelled`,
      },
      {
        idempotencyKey: `100q:checkout:${createHash("sha256")
          .update(session.user.id)
          .digest("hex")
          .slice(0, 24)}:${idempotencyKey}`,
      },
    );

    if (!checkoutSession.url) {
      return Response.json(
        { error: "Stripe did not return a Checkout URL" },
        { status: 502 },
      );
    }

    return Response.json(
      {
        url: checkoutSession.url,
        credits,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof BillingConfigurationError) {
      return Response.json(
        { error: "Payments are not configured yet" },
        { status: 503 },
      );
    }

    return Response.json(
      { error: "Unable to start Stripe Checkout" },
      { status: 502 },
    );
  }
}
