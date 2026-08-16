"use client";

import { useEffect } from "react";

import { type ProductEvent, trackEvent } from "@/lib/analytics";

export function AnalyticsEvent({
  event,
  properties,
  onceKey,
}: {
  event: ProductEvent;
  properties?: Record<string, string | number | boolean>;
  onceKey?: string;
}) {
  useEffect(() => {
    const storageKey = onceKey ? `analytics-event:${onceKey}` : null;
    if (storageKey && window.sessionStorage.getItem(storageKey)) return;
    trackEvent(event, properties);
    if (storageKey) window.sessionStorage.setItem(storageKey, "1");
  }, [event, onceKey, properties]);

  return null;
}
