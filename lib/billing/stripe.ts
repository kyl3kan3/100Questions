import "server-only";

import Stripe from "stripe";

const STRIPE_API_VERSION = "2026-06-24.dahlia";

let stripeClient: Stripe | undefined;

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

export function getStripePriceId(): string {
  return readRequiredEnvironmentVariable("STRIPE_PRICE_ID");
}

export function getStripeWebhookSecret(): string {
  return readRequiredEnvironmentVariable("STRIPE_WEBHOOK_SECRET");
}

export function getCreditsPerPurchase(): number {
  const rawValue = process.env.STRIPE_CREDITS_PER_PURCHASE?.trim() || "1";
  const value = Number(rawValue);

  if (!Number.isSafeInteger(value) || value < 1 || value > 100) {
    throw new BillingConfigurationError(
      "STRIPE_CREDITS_PER_PURCHASE must be an integer from 1 to 100",
    );
  }

  return value;
}

export function isStripeCheckoutConfigured(): boolean {
  try {
    getStripePriceId();
    getCreditsPerPurchase();
    getStripeWebhookSecret();

    return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  } catch {
    return false;
  }
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_WEBHOOK_SECRET?.trim(),
  );
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
