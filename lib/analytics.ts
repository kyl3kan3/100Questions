"use client";

declare global {
  interface Window {
    datafast?: (
      event: string,
      properties?: Record<string, string>,
    ) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const DATAFAST_PROPERTY_NAME = /^[a-z0-9_-]{1,64}$/u;
const DATAFAST_PROPERTY_LIMIT = 10;
const DATAFAST_PROPERTY_VALUE_LIMIT = 255;

export type ProductEvent =
  | "seo_landing_viewed"
  | "purchase_completed"
  | "sample_report_viewed"
  | "signup_started"
  | "checkout_started"
  | "benchmark_started"
  | "result_viewed"
  | "rerun_started"
  | "report_exported";

export function trackEvent(
  event: ProductEvent,
  properties: Record<string, string | number | boolean | undefined> = {},
) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, properties);
  window.datafast?.(event, toDataFastProperties(properties));
}

function toDataFastProperties(
  properties: Record<string, string | number | boolean | undefined>,
): Record<string, string> | undefined {
  const normalized = Object.entries(properties)
    .filter(
      (entry): entry is [string, string | number | boolean] =>
        entry[1] !== undefined && DATAFAST_PROPERTY_NAME.test(entry[0]),
    )
    .slice(0, DATAFAST_PROPERTY_LIMIT)
    .map(([key, value]) => [
      key,
      String(value).slice(0, DATAFAST_PROPERTY_VALUE_LIMIT),
    ]);

  return normalized.length ? Object.fromEntries(normalized) : undefined;
}
