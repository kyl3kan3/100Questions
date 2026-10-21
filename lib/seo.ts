import type { MetadataRoute } from "next";

import { PUBLIC_PAGE_LAST_MODIFIED } from "./content-dates";
import { absoluteUrl, canonicalUrl } from "./site";

export const PUBLIC_MARKETING_PATHS = [
  "/",
  "/about",
  "/resources",
  "/pricing",
  "/contact",
  "/support",
  "/privacy",
  "/terms",
  "/ai-visibility",
  "/ai-visibility-tools",
  "/ai-visibility-checker",
  "/ai-brand-risk-checker",
  "/llms-txt-checker",
  "/mcp",
  "/ai-visibility-audit",
  "/ai-search-visibility-tool",
  "/how-to-measure-ai-search-visibility",
  "/customer-research-methods",
  "/ai-search-optimization",
  "/how-to-get-chatgpt-to-recommend-your-business",
  "/how-to-check-if-oai-searchbot-is-blocked",
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
  "/can-google-alerts-track-chatgpt-mentions",
  "/chatgpt-seo-tool",
  "/generative-engine-optimization",
  "/ai-overviews-tracker-vs-cross-model-visibility-testing",
  "/geo-client-reporting-template",
  "/llm-citation-audit-template",
  "/llm-seo",
  "/peec-ai-alternative",
  "/profound-alternative",
  "/otterly-alternative",
  "/ai-visibility-audit-vs-monitoring",
  "/how-to-get-cited-in-claude-gemini-grok",
  "/ai-visibility-tools-pricing",
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
  { source: "/blog", destination: "/resources", permanent: true },
  { source: "/blog/:path*", destination: "/resources", permanent: true },
] as const;

export function buildSitemap(): MetadataRoute.Sitemap {
  return PUBLIC_MARKETING_PATHS.map((path) => ({
    url: canonicalUrl(path),
    ...(PUBLIC_PAGE_LAST_MODIFIED[path]
      ? {
          lastModified: new Date(
            `${PUBLIC_PAGE_LAST_MODIFIED[path]}T00:00:00.000Z`,
          ),
        }
      : {}),
    ...(["/", "/ai-search-visibility-tool"].includes(path)
      ? { images: [absoluteUrl("/sample-report-preview.png")] }
      : {}),
  }));
}

export function buildRobots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/.well-known/workflow/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
