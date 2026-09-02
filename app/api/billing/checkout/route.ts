import { createHash } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import {
  getCheckoutIdempotencyKey,
  getIntroductoryClaimIdempotencyKey,
} from "@/lib/billing/checkout-policy";
import {
  getBillingCustomerForUser,
  persistIntroductoryCheckoutSession,
  prepareIntroductoryCheckoutClaim,
  upsertBillingCustomer,
} from "@/lib/billing/credits";
import {
  CURRENT_CREDIT_GRANT_VERSION,
  getBillingPackage,
  getFrozenCreditGrant,
  type BillingPackageId,
} from "@/lib/billing/packages";
import {
  BillingConfigurationError,
  getApplicationOrigin,
  getStripe,
  getStripePackage,
  isSameOriginRequest,
  isStripeAutomaticTaxEnabled,
  isStripePackageConfigured,
} from "@/lib/billing/stripe";
import { buildDataFastCheckoutMetadata } from "@/lib/datafast-attribution";
import {
  GUEST_CHECKOUT_COOKIE,
  hashGuestCheckoutToken,
} from "@/lib/billing/guest-checkout";

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

  const idempotencyKey = request.headers.get("idempotency-key")?.trim();

  if (!idempotencyKey || !IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
    return Response.json(
      { error: "A valid idempotency key is required" },
      { status: 400 },
    );
  }

  try {
    const requestBody = (await request.json().catch(() => null)) as {
      packageId?: unknown;
    } | null;
    const requestedPackageId = requestBody?.packageId;
    const publicPackage =
      typeof requestedPackageId === "string"
        ? getBillingPackage(requestedPackageId)
        : undefined;

    if (!publicPackage) {
      return Response.json({ error: "Select a valid benchmark package" }, { status: 400 });
    }

    const packageId = publicPackage.id as BillingPackageId;

    if (!isStripePackageConfigured(packageId)) {
      return Response.json(
        {
          error: "Checkout is temporarily unavailable",
          code: "checkout_unavailable",
        },
        { status: 503 },
      );
    }

    const billingPackage = getStripePackage(packageId);
    const frozenGrant = getFrozenCreditGrant(
      CURRENT_CREDIT_GRANT_VERSION,
      billingPackage.id,
    );

    if (
      !frozenGrant ||
      frozenGrant.credits !== billingPackage.credits ||
      frozenGrant.introductory !== billingPackage.introductory
    ) {
      throw new BillingConfigurationError(
        "The live package does not match its frozen fulfillment contract",
      );
    }

    const stripe = getStripe();
    const automaticTaxEnabled = await isStripeAutomaticTaxEnabled(stripe);

    if (!session?.user?.id) {
      if (billingPackage.id !== "intro") {
        return Response.json(
          { error: "Sign in to buy additional benchmark packages" },
          { status: 401 },
        );
      }

      const origin = getApplicationOrigin(request);
      const cookieStore = await cookies();
      const guestToken = crypto.randomUUID() + crypto.randomUUID();
      const guestTokenHash = hashGuestCheckoutToken(guestToken);
      const dataFastMetadata = buildDataFastCheckoutMetadata({
        visitorId: cookieStore.get("datafast_visitor_id")?.value,
        sessionId: cookieStore.get("datafast_session_id")?.value,
      });
      const guestReference = `guest:${guestTokenHash.slice(0, 48)}`;
      const checkoutSession = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          integration_identifier: "100_questions_checkout_qmvkzjra",
          managed_payments: { enabled: false },
          ...(automaticTaxEnabled ? { automatic_tax: { enabled: true } } : {}),
          customer_creation: "always",
          line_items: [{ price: billingPackage.stripePriceId, quantity: 1 }],
          client_reference_id: guestReference,
          metadata: {
            guestCheckout: "true",
            guestCheckoutTokenHash: guestTokenHash,
            billingPackage: billingPackage.id,
            creditGrant: String(frozenGrant.credits),
            creditGrantVersion: frozenGrant.version,
            ...dataFastMetadata,
          },
          success_url: `${origin}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/?checkout=cancelled#pricing`,
        },
        {
          idempotencyKey: `100q:guest:${guestTokenHash.slice(0, 48)}:${idempotencyKey}`,
        },
      );

      if (!checkoutSession.url) {
        return Response.json(
          { error: "Stripe did not return a Checkout URL" },
          { status: 502 },
        );
      }

      const response = NextResponse.json(
        { url: checkoutSession.url, credits: frozenGrant.credits },
        { headers: { "Cache-Control": "no-store" } },
      );
      response.cookies.set(GUEST_CHECKOUT_COOKIE, guestToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      return response;
    }

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
    const cookieStore = await cookies();
    const dataFastMetadata = buildDataFastCheckoutMetadata({
      visitorId: cookieStore.get("datafast_visitor_id")?.value,
      sessionId: cookieStore.get("datafast_session_id")?.value,
    });
    const persistedDataFastMetadata = dataFastMetadata as Record<string, string>;
    let checkoutUserId = session.user.id;
    let checkoutCredits: number = frozenGrant.credits;
    let checkoutPriceId = billingPackage.stripePriceId;
    let checkoutCustomerId = customerId;
    let successUrl = `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    let cancelUrl = `${origin}/dashboard?checkout=cancelled`;
    let checkoutMetadata: Record<string, string> = {
      appUserId: session.user.id,
      billingPackage: billingPackage.id,
      creditGrant: String(frozenGrant.credits),
      creditGrantVersion: frozenGrant.version,
      ...dataFastMetadata,
    };
    let stripeIdempotencyKey = getCheckoutIdempotencyKey({
      userId: session.user.id,
      packageId: billingPackage.id,
      clientRequestKey: idempotencyKey,
    });
    let introductoryAttempt:
      | { claimId: string; attempt: number; userId: string }
      | undefined;

    if (billingPackage.introductory) {
      const preparedClaim = await prepareIntroductoryCheckoutClaim({
        userId: session.user.id,
        packageId: billingPackage.id,
        grantVersion: frozenGrant.version,
        credits: frozenGrant.credits,
        stripePriceId: billingPackage.stripePriceId,
        stripeCustomerId: customerId,
        successUrl,
        cancelUrl,
        checkoutMetadata: persistedDataFastMetadata,
      });

      if (
        preparedClaim.state === "unavailable" ||
        preparedClaim.state === "fulfilled"
      ) {
        return Response.json(
          { error: "The introductory package is limited to a first purchase" },
          { status: 409 },
        );
      }

      if (preparedClaim.state === "payment_pending") {
        return Response.json(
          { error: "Your introductory payment is still processing" },
          { status: 409 },
        );
      }

      if (preparedClaim.state === "reuse") {
        return Response.json(
          {
            url: preparedClaim.checkoutUrl,
            credits: preparedClaim.credits,
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      }

      checkoutUserId = preparedClaim.userId;
      checkoutCredits = preparedClaim.credits;
      checkoutPriceId = preparedClaim.stripePriceId;
      checkoutCustomerId = preparedClaim.stripeCustomerId;
      successUrl = preparedClaim.successUrl;
      cancelUrl = preparedClaim.cancelUrl;
      checkoutMetadata = {
        appUserId: preparedClaim.userId,
        billingPackage: preparedClaim.packageId,
        creditGrant: String(preparedClaim.credits),
        creditGrantVersion: preparedClaim.grantVersion,
        introductoryClaimId: preparedClaim.claimId,
        ...preparedClaim.checkoutMetadata,
      };
      stripeIdempotencyKey = getIntroductoryClaimIdempotencyKey(
        preparedClaim.claimId,
        preparedClaim.attempt,
      );
      introductoryAttempt = {
        claimId: preparedClaim.claimId,
        attempt: preparedClaim.attempt,
        userId: preparedClaim.userId,
      };
    }

    const checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        integration_identifier: "100_questions_checkout_qmvkzjra",
        managed_payments: { enabled: false },
        ...(automaticTaxEnabled ? { automatic_tax: { enabled: true } } : {}),
        line_items: [{ price: checkoutPriceId, quantity: 1 }],
        client_reference_id: checkoutUserId,
        customer: checkoutCustomerId,
        metadata: checkoutMetadata,
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
      {
        idempotencyKey: stripeIdempotencyKey,
      },
    );

    if (!checkoutSession.url) {
      return Response.json(
        { error: "Stripe did not return a Checkout URL" },
        { status: 502 },
      );
    }

    const checkoutUrl = introductoryAttempt
      ? await persistIntroductoryCheckoutSession({
          ...introductoryAttempt,
          stripeCheckoutSessionId: checkoutSession.id,
          checkoutUrl: checkoutSession.url,
          expiresAt: new Date(checkoutSession.expires_at * 1_000),
        })
      : checkoutSession.url;

    return Response.json(
      {
        url: checkoutUrl,
        credits: checkoutCredits,
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

    const stripeError =
      typeof error === "object" && error !== null
        ? (error as Record<string, unknown>)
        : {};
    console.error("[billing] Stripe Checkout creation failed.", {
      name: error instanceof Error ? error.name : "UnknownError",
      type: typeof stripeError.type === "string" ? stripeError.type : undefined,
      code: typeof stripeError.code === "string" ? stripeError.code : undefined,
      statusCode:
        typeof stripeError.statusCode === "number"
          ? stripeError.statusCode
          : undefined,
      requestId:
        typeof stripeError.requestId === "string"
          ? stripeError.requestId
          : undefined,
    });

    return Response.json(
      { error: "Unable to start Stripe Checkout" },
      { status: 502 },
    );
  }
}
