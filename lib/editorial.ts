import { absoluteUrl } from "./site";

export const EDITORIAL_AUTHOR_PUBLIC_PROFILES = [
  "https://github.com/kyl3kan3",
  "https://peerlist.io/kyl3kan3/project/100-questions",
  "https://www.producthunt.com/products/100-questions",
  absoluteUrl("/about#kyle"),
] as const;

export const EDITORIAL_AUTHOR = {
  name: "Kyle Kane",
  role: "Product maintainer and editor",
  profilePath: "/about#kyle",
  profileUrl: absoluteUrl("/about#kyle"),
  githubUrl: "https://github.com/kyl3kan3",
  description:
    "Kyle Kane builds and maintains 100 Questions and reviews its public measurement methodology, product documentation, and evidence-led AI visibility guides.",
  areas: [
    "AI visibility measurement",
    "Benchmark design and interpretation",
    "Product documentation",
    "Technical search accessibility",
  ],
} as const;

export const EDITORIAL_AUTHOR_ID = `${absoluteUrl()}#kyle`;

export function buildEditorialPersonStructuredData() {
  return {
    "@type": "Person",
    "@id": EDITORIAL_AUTHOR_ID,
    name: EDITORIAL_AUTHOR.name,
    url: EDITORIAL_AUTHOR.profileUrl,
    jobTitle: EDITORIAL_AUTHOR.role,
    description: EDITORIAL_AUTHOR.description,
    knowsAbout: [...EDITORIAL_AUTHOR.areas],
    sameAs: [...EDITORIAL_AUTHOR_PUBLIC_PROFILES],
    worksFor: { "@id": `${absoluteUrl()}#organization` },
  };
}

export const EDITORIAL_METHOD = [
  "Separate observed product behavior, first-party documentation, and interpretation.",
  "Prefer primary sources and link material claims to evidence readers can inspect.",
  "Keep study-specific model labels and dates frozen while current product facts update centrally.",
  "State limitations, denominators, and coverage beside conclusions.",
  "Correct material errors when identified and update the visible review date only after review.",
] as const;
