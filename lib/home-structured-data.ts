import { BILLING_PACKAGES } from "./billing/packages";
import {
  PRODUCT_FAQS,
  PRODUCT_FEATURES,
  PRODUCT_NAME,
  PRODUCT_SKU,
  PRODUCT_UPDATED_AT,
} from "./product-facts";
import { PRODUCT_IMAGE } from "./product-image";
import { absoluteUrl } from "./site";

export function buildHomeProductStructuredData() {
  const homeUrl = absoluteUrl();

  return {
    "@type": ["Product", "SoftwareApplication"],
    "@id": `${homeUrl}#product`,
    name: PRODUCT_NAME,
    url: homeUrl,
    image: PRODUCT_IMAGE,
    sku: PRODUCT_SKU,
    description:
      "A prepaid, source-backed AI visibility audit with one 25-question set, four model providers, and a prioritized action plan.",
    brand: { "@id": `${homeUrl}#brand` },
    provider: { "@id": `${homeUrl}#organization` },
    category: "AI visibility analytics",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "AI visibility analytics",
    operatingSystem: "Web",
    browserRequirements: "Requires a modern web browser",
    softwareVersion: "benchmark-v2",
    inLanguage: "en-US",
    dateModified: PRODUCT_UPDATED_AT,
    isAccessibleForFree: false,
    featureList: [...PRODUCT_FEATURES],
    audience: {
      "@type": "Audience",
      audienceType: "Consultants, agencies, and in-house marketing teams",
    },
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
      availability: "https://schema.org/OnlineOnly",
      seller: { "@id": `${homeUrl}#organization` },
      offers: BILLING_PACKAGES.map((billingPackage) => ({
        "@type": "Offer",
        sku: `${PRODUCT_SKU}-${billingPackage.id.toUpperCase()}`,
        name: billingPackage.name,
        description: billingPackage.description,
        url: absoluteUrl("/#pricing"),
        price: (billingPackage.priceCents / 100).toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/OnlineOnly",
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
        dateModified: PRODUCT_UPDATED_AT,
        inLanguage: "en-US",
      },
      buildHomeProductStructuredData(),
      {
        "@type": "FAQPage",
        "@id": `${homeUrl}#faq`,
        mainEntity: PRODUCT_FAQS.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
        })),
      },
    ],
  };
}
