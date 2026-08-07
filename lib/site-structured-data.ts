import { VERIFIED_BRAND_PROFILES } from "./product-facts";
import { absoluteUrl, SITE_NAME } from "./site";

export function buildSiteStructuredData() {
  const homeUrl = absoluteUrl();
  const sameAs = VERIFIED_BRAND_PROFILES.map(({ url }) => url);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${homeUrl}#organization`,
        name: SITE_NAME,
        url: homeUrl,
        description:
          "A source-backed AI visibility benchmark comparing one shared question set across OpenAI, Claude, Gemini, and Grok.",
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/logo-mark.svg"),
        },
        brand: { "@id": `${homeUrl}#brand` },
        sameAs,
      },
      {
        "@type": "Brand",
        "@id": `${homeUrl}#brand`,
        name: SITE_NAME,
        url: homeUrl,
        description:
          "Source-backed, prepaid AI visibility benchmarking with inspectable answers, citations, and limitations.",
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/logo-mark.svg"),
        },
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": `${homeUrl}#website`,
        name: SITE_NAME,
        url: homeUrl,
        description:
          "Measure brand visibility, citations, competitor share of voice, and coverage across web-grounded AI answers.",
        publisher: { "@id": `${homeUrl}#organization` },
        inLanguage: "en-US",
      },
    ],
  };
}
