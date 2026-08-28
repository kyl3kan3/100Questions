"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

const AI_REFERRERS = [
  ["chatgpt.com", "chatgpt"],
  ["perplexity.ai", "perplexity"],
  ["claude.ai", "claude"],
  ["copilot.microsoft.com", "copilot"],
  ["gemini.google.com", "gemini"],
  ["you.com", "you.com"],
] as const;

function normalizeSource(value: string | null) {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  return AI_REFERRERS.find(([signal]) => normalized.includes(signal))?.[1];
}

export function AiReferralAttribution() {
  useEffect(() => {
    const storageKey = "100q_ai_referral_landing";
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
    } catch {
      // Continue without deduplication when browser storage is unavailable.
    }

    const params = new URLSearchParams(window.location.search);
    const source =
      normalizeSource(params.get("utm_source")) ||
      normalizeSource(document.referrer);
    if (!source) return;

    try {
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // Measurement should never interfere with rendering or navigation.
    }
    trackEvent("ai_referral_landing", {
      source,
      landing_path: window.location.pathname,
    });
  }, []);

  return null;
}
