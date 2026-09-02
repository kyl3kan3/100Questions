import "server-only";

import Stripe from "stripe";

import {
  BILLING_PACKAGES,
  getBillingPackage,
  type BillingPackageId,
} from "@/lib/billing/packages";

const STRIPE_API_VERSION = "2026-06-24.dahlia";

let stripeClient: Stripe | undefined;
let stripeTaxEnabledCache: boolean | undefined;

export class BillingConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingConfigurationError";
  }
}

function readRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new BillingConfigurationError(`${name} is not configured`);
  }

  return value;
}

function readOptionalEnvironmentVariable(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getStripe(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  stripeClient = new Stripe(
    readRequiredEnvironmentVariable("STRIPE_SECRET_KEY"),
    {
      apiVersion: STRIPE_API_VERSION,
      appInfo: {
        name: "100 Questions",
        version: "0.1.0",
      },
      maxNetworkRetries: 2,
      telemetry: false,
    },
  );

  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  return readRequiredEnvironmentVariable("STRIPE_WEBHOOK_SECRET");
}

export async function isStripeAutomaticTaxEnabled(
  stripe: Stripe,
): Promise<boolean> {
  if (stripeTaxEnabledCache !== undefined) {
    return stripeTaxEnabledCache;
  }

  const override = readOptionalEnvironmentVariable("STRIPE_AUTOMATIC_TAX");
  if (override === "true") {
    stripeTaxEnabledCache = true;
    return true;
  }
  if (override === "false") {
    stripeTaxEnabledCache = false;
    return false;
  }

  try {
    const registrations = await stripe.tax.registrations.list({
      status: "active",
      limit: 1,
    });
    stripeTaxEnabledCache = registrations.data.length > 0;
  } catch {
    stripeTaxEnabledCache = false;
  }

  return stripeTaxEnabledCache;
}

export function getStripePackage(packageId: BillingPackageId) {
  const billingPackage = getBillingPackage(packageId);

  if (!billingPackage) {
    throw new BillingConfigurationError("Unknown billing package");
  }

  return {
    ...billingPackage,
    stripePriceId: readRequiredEnvironmentVariable(
      billingPackage.priceEnvironmentVariable,
    ),
  };
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_WEBHOOK_SECRET?.trim(),
  );
}

export function isStripePackageConfigured(packageId: BillingPackageId): boolean {
  if (!isStripeWebhookConfigured()) {
    return false;
  }

  try {
    getStripePackage(packageId);
    return true;
  } catch {
    return false;
  }
}

/** Minimum env needed for the guest $9 intro checkout path. */
export function isStripeCheckoutConfigured(): boolean {
  return isStripePackageConfigured("intro");
}

export function getApplicationOrigin(request: Request): string {
  const configuredOrigin =
    process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  const origin = configuredOrigin || new URL(request.url).origin;
  const parsed = new URL(origin);

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new BillingConfigurationError(
      "APP_URL must use the http or https protocol",
    );
  }

  return parsed.origin;
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
