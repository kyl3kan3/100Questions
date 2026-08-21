export const EVIDENCE_SOURCES = {
  googleAiFeatures: {
    title: "Google Search: AI features and your website",
    href: "https://developers.google.com/search/docs/appearance/ai-features",
    note: "Google says its existing SEO fundamentals remain relevant to AI Overviews and AI Mode and that inclusion is not guaranteed.",
  },
  googleAiOptimization: {
    title: "Google Search: optimizing for generative AI features",
    href: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
    note: "Google documents crawlability, clear technical structure, original content, and established SEO foundations for generative Search features.",
  },
  bingGuidelines: {
    title: "Bing Webmaster Guidelines",
    href: "https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a",
    note: "Bing connects crawlable links, canonical URLs, accurate content, and established SEO foundations with search and grounding eligibility.",
  },
  bingAiPerformance: {
    title: "Bing Webmaster Tools: AI Performance",
    href: "https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview",
    note: "Microsoft distinguishes citations and cited pages in AI answers from rankings or authority claims.",
  },
  openAiPublishers: {
    title: "OpenAI publisher and developer guidance",
    href: "https://help.openai.com/en/articles/12627856-publishers-and-developers-faq",
    note: "OpenAI documents OAI-SearchBot access for content discovery in ChatGPT search separately from GPTBot training controls.",
  },
  anthropicWebSearch: {
    title: "Anthropic web search documentation",
    href: "https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/web-search-tool",
    note: "Anthropic documents web search as a sourced retrieval tool whose usage and returned content form part of the answer conditions.",
  },
  geoPaper: {
    title: "GEO: Generative Engine Optimization research paper",
    href: "https://arxiv.org/abs/2311.09735",
    note: "The original GEO paper formalizes generative-engine visibility as a measurable, black-box optimization problem; its reported experiments are not a universal ranking formula.",
  },
  visibilityIndex: {
    title: "100 Questions 2026 AI Visibility Index protocol and evidence",
    href: "/ai-visibility-index",
    note: "First-party frozen study with protocol, question set, answer evidence, source files, hashes, and explicit limitations.",
  },
  methodology: {
    title: "100 Questions benchmark methodology",
    href: "/methodology",
    note: "Definitions for eligibility, coverage, mentions, prominence, citations, competitor share of voice, and comparable reruns.",
  },
} as const;

export type EvidenceSourceId = keyof typeof EVIDENCE_SOURCES;
