import { describe, expect, it } from "vitest";

import { PUBLIC_MARKETING_PATHS } from "./seo";
import { SEARCH_INTENT_CLUSTERS, SEARCH_INTENT_PAGES } from "./search-intent-map";

describe("search intent map", () => {
  it("assigns every overlapping page one distinct, public purpose", () => {
    expect(SEARCH_INTENT_CLUSTERS).toHaveLength(3);
    expect(new Set(SEARCH_INTENT_PAGES.map(({ path }) => path)).size).toBe(
      SEARCH_INTENT_PAGES.length,
    );
    expect(new Set(SEARCH_INTENT_PAGES.map(({ uniqueJob }) => uniqueJob)).size).toBe(
      SEARCH_INTENT_PAGES.length,
    );

    for (const page of SEARCH_INTENT_PAGES) {
      expect(PUBLIC_MARKETING_PATHS).toContain(page.path);
      expect(page.primaryQuery.length).toBeGreaterThan(5);
      expect(page.intent.length).toBeGreaterThan(10);
      expect(page.cta.length).toBeGreaterThan(10);
    }
  });
});
