import { describe, expect, it } from "vitest";

import { buildHomepageUrlCandidates } from "./public-site-http";

describe("public site HTTP helpers", () => {
  it("tries apex and www homepage variants", () => {
    const hosts = buildHomepageUrlCandidates("stripe.com").map(
      (url) => url.hostname,
    );
    expect(hosts).toContain("stripe.com");
    expect(hosts).toContain("www.stripe.com");
  });

  it("deduplicates when www is already present", () => {
    const hosts = buildHomepageUrlCandidates("www.notion.so").map(
      (url) => url.hostname,
    );
    expect(hosts).toEqual(["www.notion.so", "notion.so"]);
  });
});
