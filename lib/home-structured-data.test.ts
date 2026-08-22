import { describe, expect, it } from "vitest";

import { BILLING_PACKAGES } from "./billing/packages";
import {
  buildHomeProductStructuredData,
  buildHomeStructuredData,
} from "./home-structured-data";
import {
  PRODUCT_FEATURES,
  PRODUCT_SKU,
  PRODUCT_UPDATED_AT,
} from "./product-facts";

function hasType(item: { "@type": string | readonly string[] }, type: string) {
  return Array.isArray(item["@type"])
    ? item["@type"].includes(type)
    : item["@type"] === type;
}

describe("homepage structured data", () => {
  it("publishes exact prepaid package facts instead of only a price range", () => {
    const product = buildHomeProductStructuredData();

    expect(product.offers.offers).toEqual(
      BILLING_PACKAGES.map((billingPackage) =>
        expect.objectContaining({
          "@type": "Offer",
          name: billingPackage.name,
          description: billingPackage.description,
          price: (billingPackage.priceCents / 100).toFixed(2),
          priceCurrency: "USD",
          eligibleQuantity: {
            "@type": "QuantitativeValue",
            value: billingPackage.credits,
            unitText:
              billingPackage.credits === 1
                ? "benchmark credit"
                : "benchmark credits",
          },
        }),
      ),
    );
    expect(product.offers.offerCount).toBe(BILLING_PACKAGES.length);
  });

  it("makes the benchmark scope and billing model machine-readable", () => {
    const product = buildHomeProductStructuredData();

    expect(hasType(product, "Product")).toBe(true);
    expect(hasType(product, "SoftwareApplication")).toBe(false);
    expect(product).toMatchObject({
      sku: PRODUCT_SKU,
      category: "AI visibility analytics",
      dateModified: PRODUCT_UPDATED_AT,
      featureList: [...PRODUCT_FEATURES],
      brand: { "@id": "https://100questionsai.com/#brand" },
    });

    expect(product.additionalProperty).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Question set", value: "25 frozen questions" }),
        expect.objectContaining({ name: "Planned answers", value: 100 }),
        expect.objectContaining({
          name: "Billing model",
          value: "Prepaid credits; no subscription",
        }),
      ]),
    );
  });

  it("publishes online availability without inventing physical inventory or reviews", () => {
    const product = buildHomeProductStructuredData();

    expect(product.offers.availability).toBe("https://schema.org/OnlineOnly");
    expect(
      product.offers.offers.every(
        (offer) => offer.availability === "https://schema.org/OnlineOnly",
      ),
    ).toBe(true);
    expect(product).not.toHaveProperty("aggregateRating");
    expect(product).not.toHaveProperty("review");
    expect(product).not.toHaveProperty("gtin");
    expect(product).not.toHaveProperty("audience");
  });

  it("does not publish low-value FAQ rich-result markup", () => {
    const structuredData = buildHomeStructuredData();
    const faqPage = structuredData["@graph"].find((item) =>
      hasType(item, "FAQPage"),
    );

    expect(faqPage).toBeUndefined();
  });

  it("links the page and product to one descriptive product image", () => {
    const structuredData = buildHomeStructuredData();
    const webPage = structuredData["@graph"].find(
      (item) => item["@type"] === "WebPage",
    );
    const product = structuredData["@graph"].find(
      (item) => hasType(item, "Product"),
    );

    expect(webPage).toMatchObject({
      primaryImageOfPage: {
        "@id": "https://100questionsai.com/#product-image",
      },
    });
    expect(product).toMatchObject({
      image: {
        "@type": "ImageObject",
        "@id": "https://100questionsai.com/#product-image",
        width: 1440,
        height: 900,
        caption: expect.stringContaining("competitor evidence"),
      },
    });
  });
});
