"use client";

import { useEffect } from "react";

import { type ProductEvent, trackEvent } from "@/lib/analytics";

export function AnalyticsEvent({
  event,
  properties,
}: {
  event: ProductEvent;
  properties?: Record<string, string | number | boolean>;
}) {
  useEffect(() => {
    trackEvent(event, properties);
  }, [event, properties]);

  return null;
}
