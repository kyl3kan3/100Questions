import { PUBLIC_MARKETING_PATHS } from "./seo";
import { canonicalUrl } from "./site";

export const HTML_SITEMAP_PATH_LABELS: Readonly<Record<string, string>> = {
  "/": "Home — AI search visibility platform",
  "/about": "About",
  "/resources": "Resource library",
  "/pricing": "Pricing",
  "/contact": "Contact",
  "/support": "Support",
  "/privacy": "Privacy policy",
  "/terms": "Terms of service",
  "/faq": "FAQ",
  "/sitemap": "HTML sitemap",
  "/ai-visibility": "What is AI visibility? (guide)",
  "/ai-visibility-tools": "AI visibility tools hub",
  "/ai-visibility-checker": "Free AI visibility checker",
  "/ai-brand-risk-checker": "AI brand risk checker",
  "/llms-txt-checker": "llms.txt checker",
  "/mcp": "MCP integration",
  "/ai-visibility-audit": "AI visibility audit service",
  "/ai-search-visibility-tool": "AI search visibility tool",
  "/how-to-measure-ai-search-visibility": "How to measure AI search visibility",
  "/customer-research-methods": "Customer research methods",
  "/ai-search-optimization": "AI search optimization workflow",
  "/how-to-get-chatgpt-to-recommend-your-business":
    "How to get ChatGPT to recommend your business",
  "/how-to-check-if-oai-searchbot-is-blocked":
    "How to check if OAI-SearchBot is blocked",
  "/ai-seo-tools": "Compare AI SEO tools",
  "/ai-visibility-index": "2026 AI Visibility Index",
  "/ai-visibility-audit-checklist": "AI visibility audit checklist",
  "/ai-visibility-prompts": "AI visibility prompt builder",
  "/ai-visibility-report-template": "AI visibility report template",
  "/ai-visibility-score-calculator": "AI visibility score calculator",
  "/ai-search-prompt-tracking-spreadsheet":
    "AI search prompt tracking spreadsheet",
  "/answer-engine-optimization": "Answer engine optimization (AEO)",
  "/aeo-vs-geo": "AEO vs GEO",
  "/answer-engine-optimization-tools": "Answer engine optimization tools",
  "/chatgpt-brand-visibility-test": "ChatGPT brand visibility test",
  "/chatgpt-citations-vs-brand-mentions": "ChatGPT citations vs brand mentions",
  "/can-google-alerts-track-chatgpt-mentions":
    "Can Google Alerts track ChatGPT mentions?",
  "/chatgpt-seo-tool": "ChatGPT SEO tool",
  "/generative-engine-optimization": "Generative engine optimization (GEO)",
  "/ai-overviews-tracker-vs-cross-model-visibility-testing":
    "AI Overviews tracker vs cross-model visibility testing",
  "/geo-client-reporting-template": "GEO client reporting template",
  "/llm-citation-audit-template": "LLM citation audit template",
  "/llm-seo": "LLM SEO",
  "/peec-ai-alternative": "Peec AI alternative",
  "/profound-alternative": "Profound alternative",
  "/otterly-alternative": "Otterly alternative",
  "/ai-visibility-audit-vs-monitoring": "AI visibility audit vs monitoring",
  "/how-to-get-cited-in-claude-gemini-grok":
    "How to get cited in Claude, Gemini, and Grok",
  "/ai-visibility-tools-pricing": "AI visibility tools pricing comparison",
  "/for-agencies": "For agencies",
  "/methodology": "Benchmark methodology",
  "/sample-report": "Sample AI visibility report",
};

export const HTML_SITEMAP_SECTIONS = [
  {
    title: "Product & pricing",
    paths: [
      "/",
      "/ai-search-visibility-tool",
      "/ai-visibility-audit",
      "/sample-report",
      "/pricing",
      "/methodology",
      "/for-agencies",
      "/mcp",
    ],
  },
  {
    title: "Free tools & checkers",
    paths: [
      "/ai-visibility-checker",
      "/ai-brand-risk-checker",
      "/llms-txt-checker",
      "/chatgpt-brand-visibility-test",
      "/ai-visibility-score-calculator",
      "/ai-visibility-prompts",
      "/ai-visibility-report-template",
      "/ai-search-prompt-tracking-spreadsheet",
      "/llm-citation-audit-template",
      "/geo-client-reporting-template",
    ],
  },
  {
    title: "Guides & definitions",
    paths: [
      "/resources",
      "/ai-visibility",
      "/ai-visibility-tools",
      "/how-to-measure-ai-search-visibility",
      "/customer-research-methods",
      "/how-to-get-chatgpt-to-recommend-your-business",
      "/how-to-get-cited-in-claude-gemini-grok",
      "/how-to-check-if-oai-searchbot-is-blocked",
      "/ai-search-optimization",
      "/answer-engine-optimization",
      "/generative-engine-optimization",
      "/aeo-vs-geo",
      "/llm-seo",
      "/ai-visibility-audit-vs-monitoring",
      "/ai-visibility-audit-checklist",
      "/can-google-alerts-track-chatgpt-mentions",
      "/chatgpt-citations-vs-brand-mentions",
    ],
  },
  {
    title: "Research & comparisons",
    paths: [
      "/ai-visibility-index",
      "/ai-seo-tools",
      "/answer-engine-optimization-tools",
      "/ai-visibility-tools-pricing",
      "/ai-overviews-tracker-vs-cross-model-visibility-testing",
      "/chatgpt-seo-tool",
      "/peec-ai-alternative",
      "/profound-alternative",
      "/otterly-alternative",
    ],
  },
  {
    title: "Company & policies",
    paths: [
      "/about",
      "/contact",
      "/support",
      "/faq",
      "/privacy",
      "/terms",
      "/sitemap",
    ],
  },
] as const;

function labelForPath(path: string): string {
  return HTML_SITEMAP_PATH_LABELS[path] ?? path;
}

export type HtmlSitemapLink = {
  path: string;
  href: string;
  label: string;
};

export type HtmlSitemapSection = {
  title: string;
  links: HtmlSitemapLink[];
};

export function buildHtmlSitemapSections(): HtmlSitemapSection[] {
  const allowed = new Set<string>(PUBLIC_MARKETING_PATHS);
  const listed = new Set<string>();

  const sections = HTML_SITEMAP_SECTIONS.map(({ title, paths }) => {
    const links: HtmlSitemapLink[] = [];

    for (const path of paths) {
      if (!allowed.has(path)) {
        throw new Error(`HTML sitemap path missing from PUBLIC_MARKETING_PATHS: ${path}`);
      }
      if (listed.has(path)) {
        throw new Error(`HTML sitemap path listed twice: ${path}`);
      }
      listed.add(path);
      links.push({
        path,
        href: canonicalUrl(path),
        label: labelForPath(path),
      });
    }

    return { title, links };
  });

  for (const path of PUBLIC_MARKETING_PATHS) {
    if (!listed.has(path)) {
      throw new Error(`PUBLIC_MARKETING_PATHS entry missing from HTML sitemap: ${path}`);
    }
  }

  return sections;
}
