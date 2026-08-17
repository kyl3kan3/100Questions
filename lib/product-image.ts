import { absoluteUrl } from "./site";

export const PRODUCT_IMAGE = {
  "@type": "ImageObject",
  "@id": `${absoluteUrl()}#product-image`,
  url: absoluteUrl("/sample-report-preview.png"),
  contentUrl: absoluteUrl("/sample-report-preview.png"),
  width: 1440,
  height: 900,
  caption:
    "Sample AI visibility report showing brand visibility, competitor evidence, cited sources, and recommended actions.",
} as const;
