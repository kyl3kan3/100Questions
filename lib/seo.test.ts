import { describe, expect, it } from "vitest";

import { buildRobots, buildSitemap, PUBLIC_MARKETING_PATHS } from "./seo";

describe("public SEO metadata", () => {
  it("lists every public marketing page and excludes private application routes", () => {
    const urls = buildSitemap().map(({ url }) => new URL(url).pathname);

    expect(urls).toEqual(PUBLIC_MARKETING_PATHS);
    expect(urls).not.toContain("/dashboard");
    expect(urls).not.toContain("/auth/sign-in");
    expect(urls.some((url) => url.startsWith("/runs/"))).toBe(false);
  });

  it("advertises the canonical sitemap and keeps private APIs out of crawls", () => {
    const rules = buildRobots();

    expect(rules.sitemap).toBe("https://100questionsai.com/sitemap.xml");
    expect(rules.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/.well-known/workflow/"],
    });
  });
});
