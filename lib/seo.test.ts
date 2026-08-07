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
    expect(urls).toHaveLength(25);
    expect(urls).toContain("/ai-search-optimization");
    expect(urls).toContain("/ai-seo-tools");
    expect(urls).toContain("/ai-visibility-index");
    expect(urls).toContain("/ai-visibility-audit-checklist");
    expect(urls).toContain("/ai-visibility-prompts");
    expect(urls).toContain("/ai-visibility-report-template");
    expect(urls).toContain("/ai-visibility-score-calculator");
    expect(urls).toContain("/ai-search-prompt-tracking-spreadsheet");
    expect(urls).toContain("/answer-engine-optimization-tools");
    expect(urls).toContain("/chatgpt-brand-visibility-test");
    expect(urls).toContain("/chatgpt-seo-tool");
    expect(urls).toContain("/geo-client-reporting-template");
    expect(urls).toContain("/llm-citation-audit-template");
    expect(urls).not.toContain("/dashboard");
    expect(urls).not.toContain("/auth/sign-in");
    expect(urls.some((url) => url.startsWith("/runs/"))).toBe(false);
  });

  it("publishes accurate modification dates for changed product pages", () => {
    const pages = new Map(
      buildSitemap().map(({ url, lastModified }) => [
        new URL(url).pathname,
        lastModified,
      ]),
    );

    for (const path of ["/", "/about", "/faq"]) {
      expect(pages.get(path)).toEqual(new Date("2026-08-07T00:00:00.000Z"));
    }
  });

  it("ships the complete AI visibility prompt library as a downloadable CSV", () => {
    const csv = readFileSync(
      join(process.cwd(), "public", "ai-visibility-prompts.csv"),
      "utf8",
    );
    const rows = csv.trim().split(/\r?\n/);

    expect(rows).toHaveLength(101);
    expect(rows[0]).toBe("id,category,prompt_type,starter,prompt");
    expect(rows.filter((row) => row.includes(",true,"))).toHaveLength(25);
    expect(rows[100]).toContain("Brand-named diagnostics");
  });

  it("ships every resource-library download without an email gate", () => {
    const resources = [
      "ai-visibility-report-template.md",
      "chatgpt-brand-visibility-test.csv",
      "llm-citation-audit-template.csv",
      "ai-search-prompt-tracking-spreadsheet.csv",
      "geo-client-reporting-template.md",
    ];

    for (const resource of resources) {
      const resourcePath = join(process.cwd(), "public", resource);
      expect(existsSync(resourcePath), resource).toBe(true);
      expect(readFileSync(resourcePath, "utf8").length, resource).toBeGreaterThan(500);
    }

    const tracker = readFileSync(
      join(process.cwd(), "public", "ai-search-prompt-tracking-spreadsheet.csv"),
      "utf8",
    );
    expect(tracker.trim().split(/\r?\n/)).toHaveLength(26);
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
    expect(existsSync(join(process.cwd(), "public", "favicon-v3.ico"))).toBe(
      true,
    );
    expect(existsSync(join(process.cwd(), "public", "favicon-v2.ico"))).toBe(
      false,
    );
    expect(existsSync(join(process.cwd(), "app", "favicon.ico"))).toBe(false);
    expect(existsSync(join(process.cwd(), "app", "icon.svg"))).toBe(false);
  });

  it("keeps every favicon small enough to stay off the critical path", () => {
    // The favicon downloads on every first page view. A previous revision
    // shipped uncompressed 128px and 256px BMP frames totalling 361KB, which
    // dwarfed the fonts and CSS combined. Browsers only render 16-48px in a
    // tab; larger launcher icons come from the manifest and apple-touch-icon.
    for (const name of ["favicon-v3.ico", "favicon.ico"]) {
      const icon = readFileSync(join(process.cwd(), "public", name));
      expect(icon.byteLength).toBeLessThan(24 * 1024);

      // ICO header: reserved=0, type=1, then one 16-byte directory entry per
      // frame whose first two bytes are width and height (0 meaning 256).
      expect(icon.readUInt16LE(0)).toBe(0);
      expect(icon.readUInt16LE(2)).toBe(1);
      const frames = icon.readUInt16LE(4);
      const dimensions = Array.from({ length: frames }, (_, index) => {
        const entry = 6 + index * 16;
        return icon.readUInt8(entry) || 256;
      });
      expect(dimensions).toEqual([16, 32, 48]);
    }
  });
});
