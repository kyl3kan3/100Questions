import { describe, expect, it } from "vitest";

import {
  MEASUREMENT_TOOLKIT_LINKS,
  RESOURCE_COUNT,
  RESOURCE_GROUPS,
} from "./resource-catalog";
import { PUBLIC_MARKETING_PATHS } from "./seo";

describe("resource catalog", () => {
  it("uses unique public URLs and reports the rendered resource count", () => {
    const resources = RESOURCE_GROUPS.reduce<
      Array<{ href: string; title: string; description: string }>
    >((all, group) => [...all, ...group.resources], []);
    const hrefs = resources.map((resource) => resource.href);

    expect(resources).toHaveLength(RESOURCE_COUNT);
    expect(new Set(hrefs).size).toBe(hrefs.length);

    for (const href of hrefs) {
      expect(PUBLIC_MARKETING_PATHS).toContain(href);
    }
  });

  it("keeps every group useful as a browse destination", () => {
    for (const group of RESOURCE_GROUPS) {
      expect(group.resources.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps the measurement toolkit crawlable from public pages", () => {
    const hrefs = MEASUREMENT_TOOLKIT_LINKS.map(({ href }) => href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toContain("/mcp");
    expect(hrefs).toContain("/ai-search-prompt-tracking-spreadsheet");
    expect(hrefs).toContain("/ai-visibility-report-template");
    expect(hrefs).toContain("/llm-citation-audit-template");

    for (const href of hrefs) {
      expect(PUBLIC_MARKETING_PATHS).toContain(href);
    }
  });
});
