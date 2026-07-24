import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildRobots,
  buildSitemap,
  PUBLIC_MARKETING_PATHS,
  PUBLIC_ROUTE_REDIRECTS,
} from "./seo";
import { SOCIAL_IMAGE, SOCIAL_IMAGE_PATH } from "./site";

describe("public SEO metadata", () => {
  it("lists every public marketing page and excludes private application routes", () => {
    const urls = buildSitemap().map(({ url }) => new URL(url).pathname);

    expect(urls).toEqual(PUBLIC_MARKETING_PATHS);
    expect(urls).toHaveLength(16);
    expect(urls).toContain("/ai-search-optimization");
    expect(urls).toContain("/ai-seo-tools");
    expect(urls).toContain("/answer-engine-optimization-tools");
    expect(urls).toContain("/chatgpt-seo-tool");
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

  it("maps observed trust and support aliases to canonical public pages", () => {
    expect(PUBLIC_ROUTE_REDIRECTS).toContainEqual({
      source: "/about-us",
      destination: "/about",
      permanent: true,
    });
    expect(PUBLIC_ROUTE_REDIRECTS).toContainEqual({
      source: "/support",
      destination: "/faq",
      permanent: true,
    });
    expect(
      PUBLIC_ROUTE_REDIRECTS.every(({ destination }) =>
        PUBLIC_MARKETING_PATHS.includes(destination),
      ),
    ).toBe(true);
  });

  it("uses a stable, public social preview image", () => {
    expect(SOCIAL_IMAGE).toMatchObject({
      url: "https://100questionsai.com/social-card-v4.png",
      width: 1200,
      height: 630,
    });
    // X's card crawler drops images behind query-stringed URLs, so versioning
    // must live in the filename.
    expect(new URL(SOCIAL_IMAGE.url).search).toBe("");
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
    // PNG color type 2 = truecolor RGB; an alpha channel (type 6) makes X's
    // card renderer unreliable.
    expect(image.readUInt8(25)).toBe(2);
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
