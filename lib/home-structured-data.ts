import { BILLING_PACKAGES } from "./billing/packages";
import { absoluteUrl, SITE_UPDATED_AT } from "./site";

const PRODUCT_IMAGE = {
  "@type": "ImageObject",
  "@id": `${absoluteUrl()}#product-image`,
  url: absoluteUrl("/sample-report-preview.png"),
  contentUrl: absoluteUrl("/sample-report-preview.png"),
  width: 1440,
  height: 900,
  caption:
    "Sample AI visibility report showing brand visibility, competitor evidence, cited sources, and recommended actions.",
} as const;

export function buildHomeProductStructuredData() {
  const homeUrl = absoluteUrl();

  return {
    "@type": "Product",
    "@id": `${homeUrl}#product`,
    name: "100 Questions AI Visibility Benchmark",
    url: homeUrl,
    image: PRODUCT_IMAGE,
    description:
      "A prepaid, source-backed AI visibility audit with one 25-question set, four model providers, and a prioritized action plan.",
    brand: { "@id": `${homeUrl}#organization` },
    category: "AI visibility analytics",
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Question set",
        value: "25 frozen questions",
      },
      {
        "@type": "PropertyValue",
        name: "Model providers",
        value: "OpenAI, Anthropic, Google, and xAI",
      },
      {
        "@type": "PropertyValue",
        name: "Planned answers",
        value: 100,
      },
      {
        "@type": "PropertyValue",
        name: "Answer retention",
        value: "30 days",
      },
      {
        "@type": "PropertyValue",
        name: "Billing model",
        value: "Prepaid credits; no subscription",
      },
    ],
    offers: {
      "@type": "AggregateOffer",
      url: absoluteUrl("/#pricing"),
      priceCurrency: "USD",
      lowPrice: String(
        Math.min(...BILLING_PACKAGES.map(({ priceCents }) => priceCents)) / 100,
      ),
      highPrice: String(
        Math.max(...BILLING_PACKAGES.map(({ priceCents }) => priceCents)) / 100,
      ),
      offerCount: BILLING_PACKAGES.length,
      availability: "https://schema.org/InStock",
      seller: { "@id": `${homeUrl}#organization` },
      offers: BILLING_PACKAGES.map((billingPackage) => ({
        "@type": "Offer",
        name: billingPackage.name,
        description: billingPackage.description,
        url: absoluteUrl("/#pricing"),
        price: (billingPackage.priceCents / 100).toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        seller: { "@id": `${homeUrl}#organization` },
        eligibleQuantity: {
          "@type": "QuantitativeValue",
          value: billingPackage.credits,
          unitText:
            billingPackage.credits === 1
              ? "benchmark credit"
              : "benchmark credits",
        },
      })),
    },
  };
}

export function buildHomeStructuredData() {
  const homeUrl = absoluteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${homeUrl}#webpage`,
        url: homeUrl,
        name: "AI Visibility Benchmark for OpenAI, Claude, Gemini, and Grok",
        description:
          "Measure brand mentions, prominence, competitor share of voice, citations, and coverage across 100 planned web-grounded AI answers.",
        isPartOf: { "@id": `${homeUrl}#website` },
        about: { "@id": `${homeUrl}#product` },
        primaryImageOfPage: { "@id": PRODUCT_IMAGE["@id"] },
        dateModified: SITE_UPDATED_AT,
        inLanguage: "en-US",
      },
      buildHomeProductStructuredData(),
    ],
  };
}
