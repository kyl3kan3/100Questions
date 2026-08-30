import { describe, expect, it } from "vitest";

import {
  EDITORIAL_AUTHOR,
  EDITORIAL_AUTHOR_ID,
  EDITORIAL_AUTHOR_PUBLIC_PROFILES,
} from "./editorial";
import { buildSiteStructuredData } from "./site-structured-data";

describe("site structured data", () => {
  it("publishes one linked Organization, Brand, and WebSite identity", () => {
    const graph = buildSiteStructuredData()["@graph"];
    const organization = graph.find((item) => item["@type"] === "Organization");
    const brand = graph.find((item) => item["@type"] === "Brand");
    const website = graph.find((item) => item["@type"] === "WebSite");
    const person = graph.find((item) => item["@type"] === "Person");

    expect(organization).toMatchObject({
      "@id": "https://100questionsai.com/#organization",
      brand: { "@id": "https://100questionsai.com/#brand" },
      founder: { "@id": EDITORIAL_AUTHOR_ID },
      sameAs: [...EDITORIAL_AUTHOR_PUBLIC_PROFILES],
    });
    expect(brand).toMatchObject({
      "@id": "https://100questionsai.com/#brand",
    });
    expect(website).toMatchObject({
      publisher: { "@id": "https://100questionsai.com/#organization" },
      inLanguage: "en-US",
    });
    expect(person).toMatchObject({
      "@id": EDITORIAL_AUTHOR_ID,
      name: "Kyle Kane",
      url: EDITORIAL_AUTHOR.profileUrl,
      sameAs: [...EDITORIAL_AUTHOR_PUBLIC_PROFILES],
    });
    expect(brand).not.toHaveProperty("sameAs");
  });
});
