import { absoluteUrl } from "./site";

export const ARTICLE_IMAGES = {
  "/aeo-vs-geo": {
    path: "/aeo-vs-geo-hero.webp",
    alt: "Two overlapping evidence pathways comparing answer-level optimization with broader generative-engine visibility",
    caption: "AEO and GEO use overlapping inputs but emphasize different answer and reporting surfaces.",
  },
  "/generative-engine-optimization": {
    path: "/generative-engine-optimization-hero.webp",
    alt: "A structured brand entity connected to independent sources and multiple generative answer surfaces",
    caption: "GEO connects clear entity facts and source-worthy evidence to observable answer visibility.",
  },
  "/llm-seo": {
    path: "/llm-seo-hero.webp",
    alt: "Crawlable documents and structured evidence moving through retrieval into a cited AI answer",
    caption: "LLM SEO begins with retrievable pages and ends with answer-level evidence, not a guaranteed rank.",
  },
  "/ai-visibility": {
    path: "/ai-visibility-hero.webp",
    alt: "Five separate AI visibility signals flowing into an evidence-backed report",
    caption: "Mentions, prominence, competitors, citations, and coverage remain separate so one score cannot hide the evidence.",
  },
  "/how-to-measure-ai-search-visibility": {
    path: "/measure-ai-search-visibility-hero.webp",
    alt: "One frozen buyer-question set tested across four parallel AI provider lanes with stored evidence",
    caption: "Comparable AI visibility measurement sends the same buyer questions through four provider lanes and preserves the answer evidence.",
  },
} as const;

export type ArticleImagePath = keyof typeof ARTICLE_IMAGES;

export function getArticleImage(path: string) {
  const image = ARTICLE_IMAGES[path as ArticleImagePath];
  if (!image) return undefined;

  return {
    ...image,
    url: absoluteUrl(image.path),
    width: 1200,
    height: 675,
  };
}
