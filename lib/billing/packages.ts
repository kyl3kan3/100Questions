export const CREDIT_VALIDITY_MONTHS = 12;

export const BILLING_PACKAGES = [
  {
    id: "intro",
    name: "First benchmark",
    credits: 1,
    priceCents: 1_900,
    priceEnvironmentVariable: "STRIPE_PRICE_INTRO",
    introductory: true,
    description: "A complete first benchmark at the launch price.",
  },
  {
    id: "single",
    name: "One benchmark",
    credits: 1,
    priceCents: 2_900,
    priceEnvironmentVariable: "STRIPE_PRICE_SINGLE",
    introductory: false,
    description: "A fresh point-in-time benchmark whenever you need it.",
  },
  {
    id: "three",
    name: "Three benchmarks",
    credits: 3,
    priceCents: 7_900,
    priceEnvironmentVariable: "STRIPE_PRICE_THREE",
    introductory: false,
    description: "Measure a baseline, make changes, and run a follow-up.",
  },
  {
    id: "ten",
    name: "Ten benchmarks",
    credits: 10,
    priceCents: 19_900,
    priceEnvironmentVariable: "STRIPE_PRICE_TEN",
    introductory: false,
    description: "Flexible capacity for consultants and agencies.",
  },
] as const;

export type BillingPackage = (typeof BILLING_PACKAGES)[number];
export type BillingPackageId = BillingPackage["id"];

export function getBillingPackage(
  packageId: string,
): BillingPackage | undefined {
  return BILLING_PACKAGES.find((billingPackage) => billingPackage.id === packageId);
}

export function getPublicBillingPackages(hasPurchased: boolean) {
  return BILLING_PACKAGES.filter((billingPackage) => {
    if (billingPackage.id === "intro") return !hasPurchased;
    if (billingPackage.id === "single") return hasPurchased;
    return true;
  });
}

export function formatPackagePrice(priceCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}
