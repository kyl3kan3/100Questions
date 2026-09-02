import type { MetadataRoute } from "next";

import { PUBLIC_PAGE_LAST_MODIFIED } from "./content-dates";
import { absoluteUrl, SITE_URL } from "./site";

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
] as const;

// Keep this list aligned with the substantive Markdown and machine-interface
// sections in public/llms.txt.
export const PUBLIC_MARKDOWN_SITEMAP_PATHS = [
  "/index.md",
  "/pricing.md",
  "/ai-visibility.md",
  "/ai-visibility-checker.md",
  "/ai-seo-tools.md",
  "/answer-engine-optimization-tools.md",
  "/how-to-get-chatgpt-to-recommend-your-business.md",
  "/how-to-check-if-oai-searchbot-is-blocked.md",
  "/mcp.md",
  "/auth.md",
] as const;

export const PUBLIC_MACHINE_INTERFACE_PATHS = [
  "/llms.txt",
  "/llms-full.txt",
  "/.well-known/api-catalog",
  "/openapi.json",
  "/.well-known/mcp/server-card.json",
] as const;

// Published open-data files for the 2026 AI Visibility Index.
export const PUBLIC_INDEX_DATA_PATHS = [
  "/data/ai-visibility-index-2026-results-manifest.json",
  "/data/ai-visibility-index-2026-results.json",
  "/data/ai-visibility-index-2026-protocol.json",
  "/data/ai-visibility-index-2026-cohort.csv",
  "/data/ai-visibility-index-2026-question-set.csv",
  "/data/ai-visibility-index-2026-brand-results.csv",
  "/data/ai-visibility-index-2026-provider-results.csv",
  "/data/ai-visibility-index-2026-source-results.csv",
  "/data/ai-visibility-index-2026-answer-evidence.csv",
  "/data/ai-visibility-index-2026-match-adjudications.csv",
] as const;

const MACHINE_MARKDOWN_LAST_REVIEWED = "2026-08-28";
const AI_VISIBILITY_INDEX_PUBLISHED_AT = "2026-07-30";

const SUBSTANTIVE_MACHINE_MARKDOWN_PATHS = new Set<string>([
  "/ai-visibility.md",
  "/ai-visibility-checker.md",
  "/ai-seo-tools.md",
  "/answer-engine-optimization-tools.md",
  "/how-to-get-chatgpt-to-recommend-your-business.md",
  "/how-to-check-if-oai-searchbot-is-blocked.md",
  "/mcp.md",
]);

export type SitemapEntry = {
  url: string;
  lastModified?: Date;
  images?: string[];
};

function reviewedDate(path: string): Date | undefined {
  const reviewed = PUBLIC_PAGE_LAST_MODIFIED[path];
  return reviewed ? new Date(`${reviewed}T00:00:00.000Z`) : undefined;
}

function lastModifiedForMarkdownPath(markdownPath: string): Date | undefined {
  const htmlPath =
    markdownPath === "/index.md" ? "/" : markdownPath.replace(/\.md$/, "");
  const reviewed = reviewedDate(htmlPath);
  if (reviewed) return reviewed;

  if (SUBSTANTIVE_MACHINE_MARKDOWN_PATHS.has(markdownPath)) {
    return new Date(`${MACHINE_MARKDOWN_LAST_REVIEWED}T00:00:00.000Z`);
  }

  return undefined;
}

function buildMarketingSitemapEntries(): SitemapEntry[] {
  return PUBLIC_MARKETING_PATHS.map((path) => ({
    url: absoluteUrl(path),
    ...(reviewedDate(path) ? { lastModified: reviewedDate(path) } : {}),
    ...(["/", "/ai-search-visibility-tool"].includes(path)
      ? { images: [absoluteUrl("/sample-report-preview.png")] }
      : {}),
  }));
}

function buildMachineDiscoverySitemapEntries(): SitemapEntry[] {
  const indexLastModified = new Date(
    `${AI_VISIBILITY_INDEX_PUBLISHED_AT}T00:00:00.000Z`,
  );

  return [
    ...PUBLIC_MACHINE_INTERFACE_PATHS.map((path) => ({
      url: absoluteUrl(path),
    })),
    ...PUBLIC_MARKDOWN_SITEMAP_PATHS.map((path) => ({
      url: absoluteUrl(path),
      ...(lastModifiedForMarkdownPath(path)
        ? { lastModified: lastModifiedForMarkdownPath(path) }
        : {}),
    })),
    ...PUBLIC_INDEX_DATA_PATHS.map((path) => ({
      url: absoluteUrl(path),
      lastModified: indexLastModified,
    })),
  ];
}

export function buildSitemapEntries(): SitemapEntry[] {
  return [...buildMarketingSitemapEntries(), ...buildMachineDiscoverySitemapEntries()];
}

export function buildSitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries().map(({ url, lastModified, images }) => ({
    url,
    ...(lastModified ? { lastModified } : {}),
    ...(images ? { images } : {}),
  }));
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildSitemapXml(): string {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ];

  for (const entry of buildSitemapEntries()) {
    lines.push("<url>");
    lines.push(`<loc>${escapeXml(entry.url)}</loc>`);

    for (const image of entry.images ?? []) {
      lines.push("<image:image>");
      lines.push(`<image:loc>${escapeXml(image)}</image:loc>`);
      lines.push("</image:image>");
    }

    if (entry.lastModified) {
      lines.push(`<lastmod>${entry.lastModified.toISOString()}</lastmod>`);
    }

    lines.push("</url>");
  }

  lines.push("</urlset>");
  return lines.join("\n");
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
