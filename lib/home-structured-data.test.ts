import { describe, expect, it } from "vitest";

import { BILLING_PACKAGES } from "./billing/packages";
import {
  buildHomeProductStructuredData,
  buildHomeStructuredData,
} from "./home-structured-data";

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

  it("links the page and product to one descriptive product image", () => {
    const structuredData = buildHomeStructuredData();
    const webPage = structuredData["@graph"].find(
      (item) => item["@type"] === "WebPage",
    );
    const product = structuredData["@graph"].find(
      (item) => item["@type"] === "Product",
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
