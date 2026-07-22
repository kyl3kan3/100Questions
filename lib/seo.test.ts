import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { buildRobots, buildSitemap, PUBLIC_MARKETING_PATHS } from "./seo";
import { SOCIAL_IMAGE } from "./site";

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

  it("uses a stable, public social preview image", () => {
    expect(SOCIAL_IMAGE).toMatchObject({
      url: "https://100questionsai.com/social-card-v2.png",
      width: 1200,
      height: 630,
    });
    expect(existsSync(join(process.cwd(), "public", "social-card-v1.png"))).toBe(
      true,
    );
  });
});
