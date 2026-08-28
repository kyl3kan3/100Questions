export const SEARCH_INTENT_CLUSTERS = [
  {
    id: "commercial-benchmark",
    pages: [
      {
        path: "/",
        primaryQuery: "AI visibility benchmark",
        intent: "Branded commercial category entry",
        uniqueJob: "Understand the outcome and fixed-benchmark promise before choosing a product path.",
        cta: "Buy the $9 introductory benchmark",
      },
      {
        path: "/ai-visibility-audit",
        primaryQuery: "AI visibility audit",
        intent: "Deliverable and process evaluation",
        uniqueJob: "Inspect what the audit contains, how it runs, and when to rerun it.",
        cta: "Run the evidence-linked audit",
      },
      {
        path: "/pricing",
        primaryQuery: "AI visibility benchmark pricing",
        intent: "Price and package evaluation",
        uniqueJob: "Compare prepaid packages, inclusions, fit, limitations, and checkout paths.",
        cta: "Buy the right benchmark package",
      },
      {
        path: "/ai-search-visibility-tool",
        primaryQuery: "AI search visibility tool",
        intent: "Product and methodology evaluation",
        uniqueJob: "Evaluate the tool's 25-question by four-provider benchmark and sample output.",
        cta: "Buy a frozen 100-answer benchmark",
      },
      {
        path: "/chatgpt-seo-tool",
        primaryQuery: "ChatGPT SEO tool",
        intent: "Single-provider tool comparison",
        uniqueJob: "Choose among manual ChatGPT checks, recurring monitoring, and a cross-model benchmark.",
        cta: "Compare the cross-model benchmark",
      },
    ],
  },
  {
    id: "technical-discovery",
    pages: [
      {
        path: "/ai-visibility-checker",
        primaryQuery: "AI visibility checker",
        intent: "Broad technical readiness check",
        uniqueJob: "Test indexability, crawler access, page signals, schema, sitemaps, and llms.txt in one preflight.",
        cta: "Run the free readiness check",
      },
      {
        path: "/how-to-check-if-oai-searchbot-is-blocked",
        primaryQuery: "check if OAI-SearchBot is blocked",
        intent: "OpenAI crawler troubleshooting",
        uniqueJob: "Diagnose robots, path, CDN, firewall, HTTP, and rendering blocks for OAI-SearchBot.",
        cta: "Verify crawler access",
      },
      {
        path: "/llms-txt-checker",
        primaryQuery: "llms.txt checker",
        intent: "Optional machine-discovery file validation",
        uniqueJob: "Generate, validate, and discover llms.txt without presenting it as a crawler-control mechanism.",
        cta: "Check or generate llms.txt",
      },
    ],
  },
  {
    id: "optimization-frameworks",
    pages: [
      {
        path: "/ai-search-optimization",
        primaryQuery: "AI search optimization",
        intent: "End-to-end operating workflow",
        uniqueJob: "Coordinate access, entities, evidence, distribution, and measurement as one program.",
        cta: "Benchmark the workflow's current state",
      },
      {
        path: "/answer-engine-optimization",
        primaryQuery: "answer engine optimization",
        intent: "Answer selection and citation",
        uniqueJob: "Make a specific answer extractable, supportable, and attributable.",
        cta: "Compare AEO with GEO",
      },
      {
        path: "/generative-engine-optimization",
        primaryQuery: "generative engine optimization",
        intent: "Entity and source presence",
        uniqueJob: "Improve how generative engines understand, corroborate, and recommend a brand.",
        cta: "Measure cross-engine visibility",
      },
      {
        path: "/llm-seo",
        primaryQuery: "LLM SEO",
        intent: "Language-model retrieval and citation",
        uniqueJob: "Understand crawler access, retrieval, citable content, and answer-level measurement.",
        cta: "Inspect citations across models",
      },
      {
        path: "/ai-visibility",
        primaryQuery: "AI visibility",
        intent: "Metric definition and improvement",
        uniqueJob: "Define mentions, prominence, citations, share of voice, and coverage without hiding uncertainty.",
        cta: "Measure a frozen baseline",
      },
    ],
  },
  {
    id: "tool-selection",
    pages: [
      {
        path: "/ai-seo-tools",
        primaryQuery: "AI SEO tools",
        intent: "Vendor shortlist",
        uniqueJob: "Compare representative products by cadence, evidence, workflow, and commercial model.",
        cta: "Choose a measurement model",
      },
      {
        path: "/ai-visibility-tools",
        primaryQuery: "AI visibility tools",
        intent: "Tool category and job routing",
        uniqueJob: "Route from readiness and templates to benchmarks, trackers, and enterprise suites.",
        cta: "Open the tool for the current job",
      },
      {
        path: "/answer-engine-optimization-tools",
        primaryQuery: "answer engine optimization tools",
        intent: "AEO-specific software evaluation",
        uniqueJob: "Compare tools specifically for answer inclusion, citations, monitoring, and evidence.",
        cta: "Compare AEO tool fit",
      },
    ],
  },
] as const;

export const SEARCH_INTENT_PAGES = SEARCH_INTENT_CLUSTERS.flatMap(
  ({ id, pages }) => pages.map((page) => ({ ...page, cluster: id })),
);

export function getSearchIntentPage(path: string) {
  return SEARCH_INTENT_PAGES.find((page) => page.path === path);
}
