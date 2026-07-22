"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type ProductEvent =
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
}
