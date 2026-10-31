import { describe, expect, it } from "vitest";

import { buildHtmlSitemapSections } from "./html-sitemap";
import { PUBLIC_MARKETING_PATHS } from "./seo";

describe("html sitemap", () => {
  it("lists every public marketing path exactly once", () => {
    const sections = buildHtmlSitemapSections();
    const paths = sections.flatMap(({ links }) => links.map(({ path }) => path));

    expect(paths).toHaveLength(PUBLIC_MARKETING_PATHS.length);
    expect(new Set(paths)).toEqual(new Set(PUBLIC_MARKETING_PATHS));
    expect(paths).toContain("/sitemap");
  });
});
