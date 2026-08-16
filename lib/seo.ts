import type { MetadataRoute } from "next";

import { PRODUCT_UPDATED_AT } from "./product-facts";
import { absoluteUrl, SITE_UPDATED_AT, SITE_URL } from "./site";

export const PUBLIC_MARKETING_PATHS = [
  "/",
  "/about",
  "/resources",
  "/contact",
  "/support",
  "/privacy",
  "/terms",
  "/ai-visibility",
  "/ai-visibility-tools",
  "/ai-visibility-checker",
  "/mcp",
  "/ai-visibility-audit",
  "/ai-search-visibility-tool",
  "/how-to-measure-ai-search-visibility",
  "/ai-search-optimization",
  "/how-to-get-chatgpt-to-recommend-your-business",
  "/ai-seo-tools",
  "/ai-visibility-index",
  "/ai-visibility-audit-checklist",
  "/ai-visibility-prompts",
  "/ai-visibility-report-template",
  "/ai-visibility-score-calculator",
  "/ai-search-prompt-tracking-spreadsheet",
  "/answer-engine-optimization",
  "/aeo-vs-geo",
  "/answer-engine-optimization-tools",
  "/chatgpt-brand-visibility-test",
  "/chatgpt-citations-vs-brand-mentions",
  "/chatgpt-seo-tool",
  "/generative-engine-optimization",
  "/ai-overviews-tracker-vs-cross-model-visibility-testing",
  "/geo-client-reporting-template",
  "/llm-citation-audit-template",
  "/llm-seo",
  "/peec-ai-alternative",
  "/for-agencies",
  "/methodology",
  "/faq",
  "/sample-report",
] as const;

export const PUBLIC_ROUTE_REDIRECTS = [
  { source: "/about-us", destination: "/about", permanent: true },
  { source: "/team", destination: "/about", permanent: true },
  { source: "/contact-us", destination: "/contact", permanent: true },
  { source: "/help", destination: "/support", permanent: true },
  { source: "/guides", destination: "/resources", permanent: true },
  { source: "/tools", destination: "/resources", permanent: true },
  { source: "/aeo", destination: "/answer-engine-optimization", permanent: true },
  { source: "/agencies", destination: "/for-agencies", permanent: true },
  { source: "/checker", destination: "/ai-visibility-checker", permanent: true },
  { source: "/chatgpt-seo", destination: "/llm-seo", permanent: true },
] as const;

export function buildSitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(SITE_UPDATED_AT);
  const productLastModified = new Date(PRODUCT_UPDATED_AT);
  const augustSeventh = new Date("2026-08-07T00:00:00.000Z");
  const augustTenth = new Date("2026-08-10T00:00:00.000Z");
  const augustEleventh = new Date("2026-08-11T00:00:00.000Z");
  const augustThirteenth = new Date("2026-08-13T00:00:00.000Z");
  const augustFourteenth = new Date("2026-08-14T00:00:00.000Z");
  const augustFifteenth = new Date("2026-08-15T00:00:00.000Z");
  const augustSixteenth = new Date("2026-08-16T00:00:00.000Z");

  return [
    {
      url: absoluteUrl(),
      lastModified: augustFourteenth,
      changeFrequency: "weekly",
      priority: 1,
      images: [absoluteUrl("/sample-report-preview.png")],
    },
    {
      url: absoluteUrl("/about"),
      lastModified: augustTenth,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/resources"),
      lastModified: augustEleventh,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: augustTenth,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/support"),
      lastModified: augustFifteenth,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: augustTenth,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: augustTenth,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/ai-visibility"),
      lastModified: augustThirteenth,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/ai-visibility-tools"),
      lastModified: augustThirteenth,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/ai-visibility-checker"),
      lastModified: augustThirteenth,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/mcp"),
      lastModified: augustFourteenth,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/ai-visibility-audit"),
      lastModified: augustEleventh,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/ai-search-visibility-tool"),
      lastModified: augustSixteenth,
      changeFrequency: "monthly",
      priority: 0.95,
      images: [absoluteUrl("/sample-report-preview.png")],
    },
    {
      url: absoluteUrl("/how-to-measure-ai-search-visibility"),
      lastModified: augustSixteenth,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/ai-search-optimization"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/how-to-get-chatgpt-to-recommend-your-business"),
      lastModified: augustThirteenth,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/ai-seo-tools"),
      lastModified: augustThirteenth,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/ai-visibility-index"),
      lastModified: augustFifteenth,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/ai-visibility-audit-checklist"),
      lastModified: augustTenth,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/ai-visibility-prompts"),
      lastModified: augustTenth,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/ai-visibility-report-template"),
      lastModified: augustFourteenth,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/ai-visibility-score-calculator"),
      lastModified: augustFourteenth,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/ai-search-prompt-tracking-spreadsheet"),
      lastModified: augustFourteenth,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/answer-engine-optimization"),
      lastModified: augustSixteenth,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/aeo-vs-geo"),
      lastModified: augustSixteenth,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/answer-engine-optimization-tools"),
      lastModified: augustThirteenth,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/chatgpt-brand-visibility-test"),
      lastModified: augustFourteenth,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/chatgpt-citations-vs-brand-mentions"),
      lastModified: augustSixteenth,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/chatgpt-seo-tool"),
      lastModified: augustSeventh,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/generative-engine-optimization"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/ai-overviews-tracker-vs-cross-model-visibility-testing"),
      lastModified: augustSixteenth,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/geo-client-reporting-template"),
      lastModified: augustFourteenth,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/llm-citation-audit-template"),
      lastModified: augustFourteenth,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/llm-seo"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/peec-ai-alternative"),
      lastModified: new Date("2026-08-02T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/for-agencies"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/methodology"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/faq"),
      lastModified: productLastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/sample-report"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}

export function buildRobots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/.well-known/workflow/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
