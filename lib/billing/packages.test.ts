import { describe, expect, it } from "vitest";

import {
  formatPackagePrice,
  getBillingPackage,
  getPublicBillingPackages,
} from "./packages";

describe("billing packages", () => {
  it("uses the configured benchmark bundle sizes", () => {
    expect(getBillingPackage("intro")?.credits).toBe(1);
    expect(getBillingPackage("three")?.credits).toBe(3);
    expect(getBillingPackage("ten")?.credits).toBe(10);
  });

  it("uses the public launch pricing", () => {
    expect(getBillingPackage("intro")?.priceCents).toBe(1_900);
    expect(getBillingPackage("single")?.priceCents).toBe(2_900);
    expect(getBillingPackage("three")?.priceCents).toBe(7_900);
    expect(getBillingPackage("ten")?.priceCents).toBe(19_900);
  });

  it("only offers the introductory package before a purchase", () => {
    expect(getPublicBillingPackages(false).map(({ id }) => id)).toContain("intro");
    expect(getPublicBillingPackages(false).map(({ id }) => id)).not.toContain("single");
    expect(getPublicBillingPackages(true).map(({ id }) => id)).not.toContain("intro");
    expect(getPublicBillingPackages(true).map(({ id }) => id)).toContain("single");
  });

  it("formats public whole-dollar prices", () => {
    expect(formatPackagePrice(7_900)).toBe("$79");
  });
});
