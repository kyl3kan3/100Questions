import type { MetadataRoute } from "next";

import { absoluteUrl, SITE_UPDATED_AT } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl(),
      lastModified: new Date(SITE_UPDATED_AT),
      changeFrequency: "weekly",
      priority: 1,
      images: [absoluteUrl("/hero-ai-visibility.png")],
    },
    {
      url: absoluteUrl("/methodology"),
      lastModified: new Date(SITE_UPDATED_AT),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/faq"),
      lastModified: new Date(SITE_UPDATED_AT),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
