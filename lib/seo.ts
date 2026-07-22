import type { MetadataRoute } from "next";

import { absoluteUrl, SITE_UPDATED_AT, SITE_URL } from "./site";

export const PUBLIC_MARKETING_PATHS = [
  "/",
  "/ai-visibility",
  "/generative-engine-optimization",
  "/methodology",
  "/faq",
  "/sample-report",
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
      url: absoluteUrl("/ai-visibility"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
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
