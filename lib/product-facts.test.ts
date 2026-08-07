import { describe, expect, it } from "vitest";

import { BILLING_PACKAGES, formatPackagePrice } from "./billing/packages";
import {
  PRODUCT_FAQS,
  PRODUCT_FEATURES,
  PRODUCT_LIMITATIONS,
  VERIFIED_BRAND_PROFILES,
} from "./product-facts";

describe("public product facts", () => {
  it("derives the public pricing answer from every billing package", () => {
    const pricingAnswer = PRODUCT_FAQS.find(
      ({ id }) => id === "product-pricing",
    )?.answer;

    for (const billingPackage of BILLING_PACKAGES) {
      expect(pricingAnswer).toContain(
        formatPackagePrice(billingPackage.priceCents),
      );
    }
  });

  it("keeps features, limitations, and entity profiles substantive and unique", () => {
    expect(PRODUCT_FEATURES.length).toBeGreaterThanOrEqual(5);
    expect(PRODUCT_LIMITATIONS.length).toBeGreaterThanOrEqual(3);
    expect(new Set(VERIFIED_BRAND_PROFILES.map(({ url }) => url)).size).toBe(
      VERIFIED_BRAND_PROFILES.length,
    );

    for (const profile of VERIFIED_BRAND_PROFILES) {
      expect(new URL(profile.url).protocol).toBe("https:");
      expect(profile.description.length).toBeGreaterThan(10);
    }
  });
});
