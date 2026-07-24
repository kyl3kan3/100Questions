import type { MetadataRoute } from "next";

import { absoluteUrl, SITE_UPDATED_AT, SITE_URL } from "./site";

export const PUBLIC_MARKETING_PATHS = [
  "/",
  "/about",
  "/ai-visibility",
  "/ai-visibility-checker",
  "/ai-search-optimization",
  "/ai-seo-tools",
  "/answer-engine-optimization",
  "/generative-engine-optimization",
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
  { source: "/contact", destination: "/faq", permanent: true },
  { source: "/contact-us", destination: "/faq", permanent: true },
  { source: "/help", destination: "/faq", permanent: true },
  { source: "/support", destination: "/faq", permanent: true },
  { source: "/aeo", destination: "/answer-engine-optimization", permanent: true },
  { source: "/agencies", destination: "/for-agencies", permanent: true },
  { source: "/checker", destination: "/ai-visibility-checker", permanent: true },
  { source: "/chatgpt-seo", destination: "/llm-seo", permanent: true },
] as const;

export function buildSitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(SITE_UPDATED_AT);

  return [
    {
      url: absoluteUrl(),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [absoluteUrl("/hero-ai-visibility.png")],
    },
    {
      url: absoluteUrl("/about"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/ai-visibility"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [absoluteUrl("/hero-ai-visibility.png")],
    },
    {
      url: absoluteUrl("/ai-visibility-checker"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
      images: [absoluteUrl("/hero-ai-visibility.png")],
    },
    {
      url: absoluteUrl("/ai-search-optimization"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [absoluteUrl("/hero-ai-visibility.png")],
    },
    {
      url: absoluteUrl("/ai-seo-tools"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [absoluteUrl("/hero-ai-visibility.png")],
    },
    {
      url: absoluteUrl("/answer-engine-optimization"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
      images: [absoluteUrl("/hero-ai-visibility.png")],
    },
    {
      url: absoluteUrl("/generative-engine-optimization"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
      images: [absoluteUrl("/hero-ai-visibility.png")],
    },
    {
      url: absoluteUrl("/llm-seo"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
      images: [absoluteUrl("/hero-ai-visibility.png")],
    },
    {
      url: absoluteUrl("/peec-ai-alternative"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
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
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/sample-report"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [absoluteUrl("/sample-report-preview.png")],
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
