import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { buildRobots, buildSitemap, PUBLIC_MARKETING_PATHS } from "./seo";
import { SOCIAL_IMAGE, SOCIAL_IMAGE_PATH } from "./site";

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
      url: "https://100questionsai.com/social-card-v3.png?v=e5060413",
      width: 1200,
      height: 630,
    });
    const imagePath = join(
      process.cwd(),
      "public",
      SOCIAL_IMAGE_PATH.replace(/^\//, ""),
    );
    expect(existsSync(imagePath)).toBe(true);

    const image = readFileSync(imagePath);
    expect(image.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
    expect(existsSync(join(process.cwd(), "public", "sample-report-preview.png"))).toBe(true);
  });

  it("uses a cache-busted branded favicon without file-based duplicates", () => {
    expect(existsSync(join(process.cwd(), "public", "favicon-v2.ico"))).toBe(
      true,
    );
    expect(existsSync(join(process.cwd(), "app", "favicon.ico"))).toBe(false);
    expect(existsSync(join(process.cwd(), "app", "icon.svg"))).toBe(false);
  });
});
