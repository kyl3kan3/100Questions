export const RESOURCE_GROUPS = [
  {
    id: "research",
    label: "Research, audits, and evidence",
    description:
      "Inspect the paid audit, measurement method, open dataset, and finished report before relying on a score.",
    resources: [
      {
        href: "/ai-visibility-audit",
        title: "AI visibility audit",
        description:
          "Run one frozen 25-question benchmark across four AI providers with evidence and prioritized actions.",
      },
      {
        href: "/ai-visibility-index",
        title: "2026 AI Visibility Index",
        description:
          "Open provider, brand, source, and answer-level evidence from a frozen 25-product study.",
      },
      {
        href: "/methodology",
        title: "Benchmark methodology",
        description:
          "Question construction, eligibility, scoring, coverage, retention, and interpretation limits.",
      },
      {
        href: "/sample-report",
        title: "Sample AI visibility report",
        description:
          "A complete illustrative report with questions, citations, competitors, coverage, and actions.",
      },
    ],
  },
  {
    id: "guides",
    label: "Practical guides",
    description:
      "Learn the distinct jobs behind AI visibility, AI search optimization, AEO, GEO, and LLM SEO.",
    resources: [
      {
        href: "/ai-visibility-tools",
        title: "AI visibility tools hub",
        description:
          "Choose free checkers, audits, trackers, calculators, templates, and platforms by measurement job.",
      },
      {
        href: "/ai-visibility",
        title: "AI visibility guide",
        description:
          "What AI visibility measures, how to interpret it, and which actions can improve it.",
      },
      {
        href: "/how-to-get-chatgpt-to-recommend-your-business",
        title: "How to get ChatGPT to recommend your business",
        description:
          "A five-input guide to crawlability, entity facts, schema, reviews, citations, and honest measurement.",
      },
      {
        href: "/ai-search-optimization",
        title: "AI search optimization workflow",
        description:
          "A six-stage workflow for retrieval, entity clarity, evidence, distribution, and measurement.",
      },
      {
        href: "/answer-engine-optimization",
        title: "Answer engine optimization guide",
        description:
          "A practical AEO framework for earning inclusion and citations in generated answers.",
      },
      {
        href: "/generative-engine-optimization",
        title: "Generative engine optimization guide",
        description:
          "A grounded GEO framework for technical access, answer-ready content, and authority.",
      },
      {
        href: "/llm-seo",
        title: "LLM SEO guide",
        description:
          "How language models retrieve brand evidence and how to measure whether the work is helping.",
      },
    ],
  },
  {
    id: "tools",
    label: "Free tools and templates",
    description:
      "Use ungated checkers, prompt libraries, calculators, spreadsheets, and reporting templates.",
    resources: [
      {
        href: "/ai-visibility-checker",
        title: "AI visibility readiness checker",
        description:
          "Check crawl access, canonicals, structured data, sitemaps, and AI crawler availability.",
      },
      {
        href: "/mcp",
        title: "AI visibility readiness MCP",
        description:
          "Connect agents to a public, read-only technical readiness check with HTML and Markdown documentation.",
      },
      {
        href: "/ai-visibility-audit-checklist",
        title: "AI visibility audit checklist",
        description:
          "A 24-point review of access, entities, answers, evidence, corroboration, and measurement.",
      },
      {
        href: "/ai-visibility-prompts",
        title: "100 AI visibility prompts",
        description:
          "Build a defensible frozen question set from neutral discovery and brand diagnostics.",
      },
      {
        href: "/ai-visibility-score-calculator",
        title: "AI visibility score calculator",
        description:
          "Calculate a transparent composite while keeping the underlying component rates visible.",
      },
      {
        href: "/chatgpt-brand-visibility-test",
        title: "ChatGPT brand visibility test",
        description:
          "Run a focused manual test and preserve the prompt, answer, citation, and date evidence.",
      },
      {
        href: "/ai-search-prompt-tracking-spreadsheet",
        title: "AI prompt tracking spreadsheet",
        description:
          "Track conditions, answers, citations, competitors, decisions, and comparable reruns.",
      },
      {
        href: "/ai-visibility-report-template",
        title: "AI visibility report template",
        description:
          "Report scope, coverage, mentions, prominence, citations, limitations, and next actions.",
      },
      {
        href: "/llm-citation-audit-template",
        title: "LLM citation audit template",
        description:
          "Map cited pages to claims, brand effects, evidence gaps, owners, and priorities.",
      },
      {
        href: "/geo-client-reporting-template",
        title: "GEO client reporting template",
        description:
          "Turn a benchmark into a concise, evidence-linked client decision narrative.",
      },
    ],
  },
  {
    id: "comparisons",
    label: "Tool comparisons",
    description:
      "Choose software by measurement model, evidence, cadence, and workflow instead of feature count.",
    resources: [
      {
        href: "/answer-engine-optimization-tools",
        title: "AEO tools compared",
        description:
          "Six answer engine optimization tools compared for different jobs and buying criteria.",
      },
      {
        href: "/ai-seo-tools",
        title: "Best AI visibility tools",
        description:
          "Compare six tracking, research, SEO, enterprise GEO, and audit tools by the job each one does.",
      },
      {
        href: "/chatgpt-seo-tool",
        title: "ChatGPT SEO tool guide",
        description:
          "Compare manual checks, recurring monitoring, and fixed evidence-linked benchmarks.",
      },
      {
        href: "/peec-ai-alternative",
        title: "Peec AI alternatives",
        description:
          "Compare four alternatives by workflow, fit, commercial model, and documented tradeoffs.",
      },
    ],
  },
] as const;

export const RESOURCE_COUNT = RESOURCE_GROUPS.reduce(
  (total, group) => total + group.resources.length,
  0,
);

export const MEASUREMENT_TOOLKIT_LINKS = [
  {
    href: "/mcp",
    title: "Technical readiness MCP",
    footerLabel: "Readiness MCP",
    description:
      "Give an agent a read-only check for indexability, canonicals, schema, sitemaps, and crawler access.",
  },
  {
    href: "/ai-visibility-prompts",
    title: "AI visibility prompt library",
    footerLabel: "100 AI visibility prompts",
    description:
      "Choose and freeze buyer questions before collecting answers across providers.",
  },
  {
    href: "/ai-search-prompt-tracking-spreadsheet",
    title: "AI prompt tracking spreadsheet",
    footerLabel: "Prompt tracking spreadsheet",
    description:
      "Preserve provider conditions, answers, citations, competitors, and comparable reruns.",
  },
  {
    href: "/llm-citation-audit-template",
    title: "LLM citation audit template",
    footerLabel: "LLM citation audit",
    description:
      "Map cited pages to supported claims, brand effects, evidence gaps, owners, and actions.",
  },
  {
    href: "/ai-visibility-report-template",
    title: "AI visibility report template",
    footerLabel: "AI visibility report",
    description:
      "Turn stored answer evidence into a transparent decision-ready report.",
  },
  {
    href: "/geo-client-reporting-template",
    title: "GEO client reporting template",
    footerLabel: "GEO client report",
    description:
      "Separate observed results, interpretation, business outcomes, and limitations for clients.",
  },
] as const;
