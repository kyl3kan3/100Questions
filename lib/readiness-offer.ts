import { SITE_URL } from "./site";

export const READINESS_DOMAIN_COOKIE = "readiness_audit_domain";
export function readinessSource(value: unknown): "website" | "mcp" | "muse" {
  return value === "muse" || value === "mcp" ? value : "website";
}

export function readinessDomain(value: unknown): string {
  if (typeof value !== "string" || value.length > 500) return "";
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && !url.username && !url.password &&
      host.length <= 253 && /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(host)
      ? host : "";
  } catch { return ""; }
}

export function buildReadinessOffer(website: unknown, score: number, source = "website") {
  const url = new URL("/audit-after-scan", SITE_URL);
  url.searchParams.set("website", readinessDomain(website));
  url.searchParams.set("source", readinessSource(source));
  return {
    title: score >= 80
      ? "Your technical foundation looks strong. Is your brand getting recommended?"
      : "Fix access issues, then measure your brand’s AI visibility.",
    description: "Technical readiness does not tell you whether AI mentions your brand. The full audit checks 25 buyer questions across OpenAI, Claude, Gemini, and Grok, with stored answers, citations, competitor visibility, and prioritized actions.",
    label: "Run my first full audit · $9",
    priceNote: "One-time introductory price for your first purchase. Applicable tax calculated at checkout. No subscription.",
    url: url.toString(),
  };
}
