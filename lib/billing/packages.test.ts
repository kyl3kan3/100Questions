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

  it("only offers the introductory package before a purchase", () => {
    expect(getPublicBillingPackages(false).map(({ id }) => id)).toContain("intro");
    expect(getPublicBillingPackages(false).map(({ id }) => id)).not.toContain("single");
    expect(getPublicBillingPackages(true).map(({ id }) => id)).not.toContain("intro");
    expect(getPublicBillingPackages(true).map(({ id }) => id)).toContain("single");
  });

  it("formats public whole-dollar prices", () => {
    expect(formatPackagePrice(9_900)).toBe("$99");
  });
});
