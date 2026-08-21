import { describe, expect, it } from "vitest";

import { VERIFIED_BRAND_PROFILES } from "./product-facts";
import { EDITORIAL_AUTHOR, EDITORIAL_AUTHOR_ID } from "./editorial";
import { buildSiteStructuredData } from "./site-structured-data";

describe("site structured data", () => {
  it("publishes one linked Organization, Brand, and WebSite identity", () => {
    const graph = buildSiteStructuredData()["@graph"];
    const organization = graph.find((item) => item["@type"] === "Organization");
    const brand = graph.find((item) => item["@type"] === "Brand");
    const website = graph.find((item) => item["@type"] === "WebSite");
    const person = graph.find((item) => item["@type"] === "Person");
    const expectedProfiles = VERIFIED_BRAND_PROFILES.map(({ url }) => url);

    expect(organization).toMatchObject({
      "@id": "https://100questionsai.com/#organization",
      brand: { "@id": "https://100questionsai.com/#brand" },
      member: { "@id": EDITORIAL_AUTHOR_ID },
      sameAs: expectedProfiles,
    });
    expect(brand).toMatchObject({
      "@id": "https://100questionsai.com/#brand",
      sameAs: expectedProfiles,
    });
    expect(website).toMatchObject({
      publisher: { "@id": "https://100questionsai.com/#organization" },
      inLanguage: "en-US",
    });
    expect(person).toMatchObject({
      "@id": EDITORIAL_AUTHOR_ID,
      name: EDITORIAL_AUTHOR.name,
      url: EDITORIAL_AUTHOR.profileUrl,
    });
  });
});
