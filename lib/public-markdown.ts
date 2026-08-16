import { HOME_MARKDOWN } from "./agent-discovery";
import {
  machineMarkdownForHtmlPath,
  machineMarkdownResponse,
  type MachineMarkdownPage,
} from "./machine-pages";
import { PUBLIC_MARKETING_PATHS } from "./seo";
import { absoluteUrl, SITE_NAME } from "./site";

type PublicMarketingPath = (typeof PUBLIC_MARKETING_PATHS)[number];

type PageSummary = {
  title: string;
  summary: string;
  lastReviewed?: string;
};

const PUBLIC_PAGE_SUMMARIES: Record<PublicMarketingPath, PageSummary> = {
  "/": {
    title: "100 Questions",
    summary:
      "A source-backed AI visibility benchmark that compares one frozen buyer-question set across web-grounded answers from OpenAI, Claude, Gemini, and Grok.",
  },
  "/about": {
    title: "About 100 Questions",
    summary:
      "Product purpose, measurement principles, privacy posture, editorial approach, and interpretation limits for 100 Questions.",
  },
  "/resources": {
    title: "AI Visibility Resources",
    summary:
      "The central library for open research, practical guides, free tools, templates, and software comparisons.",
  },
  "/contact": {
    title: "Contact 100 Questions",
    summary:
      "Support routes for product questions, corrections, privacy requests, and responsible security reports.",
  },
  "/support": {
    title: "100 Questions Support Center",
    summary:
      "Self-service help for account access, prepaid credits, billing, benchmark runs, reports, exports, the readiness checker, and public APIs.",
    lastReviewed: "2026-08-15",
  },
  "/privacy": {
    title: "Privacy Policy",
    summary:
      "How 100 Questions handles account data, submitted benchmark inputs, processors, retention, deletion, and user choices.",
  },
  "/terms": {
    title: "Terms of Service",
    summary:
      "Service scope, acceptable use, prepaid credits, billing, availability, and limitations for 100 Questions.",
  },
  "/ai-visibility": {
    title: "AI Visibility: How to Measure and Improve It",
    summary:
      "A definition and measurement framework for brand mentions, prominence, competitor share of voice, citations, and provider coverage.",
  },
  "/ai-visibility-tools": {
    title: "AI Visibility Tools",
    summary:
      "A route-by-job hub for free checkers, audits, trackers, calculators, templates, AEO software, and broader platforms.",
  },
  "/ai-visibility-checker": {
    title: "Free AI Visibility Checker",
    summary:
      "A free technical readiness check for indexability, AI crawlers, page signals, schema, sitemaps, and llms.txt.",
  },
  "/mcp": {
    title: "AI Visibility Readiness MCP",
    summary:
      "Public documentation and a read-only Model Context Protocol endpoint for technical AI-search readiness checks.",
  },
  "/ai-visibility-audit": {
    title: "AI Visibility Audit",
    summary:
      "A prepaid 25-question benchmark across four AI providers with 100 planned answers, stored evidence, citations, and prioritized actions.",
  },
  "/ai-search-visibility-tool": {
    title: "AI Search Visibility Tool",
    summary:
      "A frozen 100-answer benchmark for measuring mentions, citations, competitors, share of voice, and provider coverage.",
    lastReviewed: "2026-08-16",
  },
  "/how-to-measure-ai-search-visibility": {
    title: "How to Measure AI Search Visibility",
    summary:
      "A controlled measurement framework covering buyer questions, eligibility, denominators, answer evidence, and comparable reruns.",
    lastReviewed: "2026-08-16",
  },
  "/ai-search-optimization": {
    title: "AI Search Optimization",
    summary:
      "A six-stage workflow for crawlability, entity clarity, answer-ready content, evidence, distribution, and measurement.",
  },
  "/how-to-get-chatgpt-to-recommend-your-business": {
    title: "How to Get ChatGPT to Recommend Your Business",
    summary:
      "Five controllable inputs—crawlability, entity consistency, structured data, authentic reviews, and relevant citations—plus an evidence-conscious measurement loop.",
  },
  "/ai-seo-tools": {
    title: "Best AI Visibility Tools for 2026",
    summary:
      "Six tracking, research, SEO, enterprise GEO, and audit tools compared by measurement model and use case.",
  },
  "/ai-visibility-index": {
    title: "2026 AI Visibility Index",
    summary:
      "Open results from a preregistered 25-product AI visibility software study with provider, brand, source, and answer-level evidence, plus a file-by-file guide to the public dataset.",
    lastReviewed: "2026-08-15",
  },
  "/ai-visibility-audit-checklist": {
    title: "AI Visibility Audit Checklist",
    summary:
      "A free 24-point worksheet for technical access, entity clarity, content, evidence, corroboration, and measurement.",
  },
  "/ai-visibility-prompts": {
    title: "100 AI Visibility Prompts",
    summary:
      "A downloadable bank of 80 neutral discovery questions and 20 brand-named diagnostics, including a balanced starter benchmark.",
  },
  "/ai-visibility-report-template": {
    title: "AI Visibility Report Template",
    summary:
      "An ungated report structure for scope, coverage, results, sources, limitations, actions, and comparable reruns.",
  },
  "/ai-visibility-score-calculator": {
    title: "AI Visibility Score Calculator",
    summary:
      "A transparent observed-answer calculator that keeps visibility, prominence, owned citations, accuracy, and coverage separate.",
  },
  "/ai-search-prompt-tracking-spreadsheet": {
    title: "AI Search Prompt Tracking Spreadsheet",
    summary:
      "A downloadable long-format worksheet for provider conditions, answers, citations, competitors, evidence, and reruns.",
  },
  "/answer-engine-optimization": {
    title: "Answer Engine Optimization",
    summary:
      "What AEO is, how it differs from SEO and GEO, and practical techniques for earning inclusion and citations in AI answers.",
    lastReviewed: "2026-08-16",
  },
  "/aeo-vs-geo": {
    title: "AEO vs GEO",
    summary:
      "A direct comparison of target surfaces, optimization inputs, measurement, reporting, and when a company needs SEO too.",
    lastReviewed: "2026-08-16",
  },
  "/answer-engine-optimization-tools": {
    title: "Answer Engine Optimization Tools Compared",
    summary:
      "Six AEO tools compared by monitoring model, evidence, cadence, workflow, and tradeoffs.",
  },
  "/chatgpt-brand-visibility-test": {
    title: "ChatGPT Brand Visibility Test",
    summary:
      "A free 10-prompt manual test for brand mentions, owned citations, discovery gaps, and factual accuracy.",
  },
  "/chatgpt-citations-vs-brand-mentions": {
    title: "ChatGPT Citations vs Brand Mentions",
    summary:
      "Definitions, formulas, and actions for separating brand inclusion from source attribution in AI answers.",
    lastReviewed: "2026-08-16",
  },
  "/chatgpt-seo-tool": {
    title: "ChatGPT SEO Tool Guide",
    summary:
      "A comparison of manual checks, recurring monitoring, and fixed evidence-linked benchmarks for ChatGPT visibility.",
  },
  "/generative-engine-optimization": {
    title: "Generative Engine Optimization",
    summary:
      "A grounded GEO framework for technical access, answer-ready content, corroborating evidence, and repeatable measurement.",
  },
  "/ai-overviews-tracker-vs-cross-model-visibility-testing": {
    title: "AI Overviews Tracker vs Cross-Model Visibility Testing",
    summary:
      "A comparison of single-surface Google AI Overviews monitoring and multi-provider buyer-question benchmarking.",
    lastReviewed: "2026-08-16",
  },
  "/geo-client-reporting-template": {
    title: "GEO Client Reporting Template",
    summary:
      "An agency-ready outline that separates observed results, interpretation, business outcomes, limitations, and actions.",
  },
  "/llm-citation-audit-template": {
    title: "LLM Citation Audit Template",
    summary:
      "A downloadable source-to-claim audit for cited pages, ownership, accuracy, brand effect, evidence gaps, and actions.",
  },
  "/llm-seo": {
    title: "LLM SEO Guide",
    summary:
      "How language models retrieve brand evidence, what ChatGPT SEO means in practice, and how to measure whether the work is helping.",
  },
  "/peec-ai-alternative": {
    title: "Peec AI Alternatives",
    summary:
      "Four alternatives compared by function, commercial model, best-fit user, documented tradeoffs, and cases where Peec AI remains the better fit.",
  },
  "/for-agencies": {
    title: "AI Visibility Reporting for Agencies",
    summary:
      "Client-ready AI visibility reports with prepaid credits, evidence exports, explicit limitations, and comparable reruns.",
  },
  "/methodology": {
    title: "AI Visibility Benchmark Methodology",
    summary:
      "Question construction, grounding eligibility, metric definitions, evidence retention, coverage, and interpretation limits.",
  },
  "/faq": {
    title: "100 Questions FAQ",
    summary:
      "Answers about providers, scoring, coverage, privacy, billing, evidence, exports, and common benchmark questions.",
  },
  "/sample-report": {
    title: "Sample AI Visibility Report",
    summary:
      "A complete fictional audit with metrics, missed questions, competitor evidence, citations, limitations, and recommended actions.",
  },
};

function markdownPathForHtmlPath(htmlPath: PublicMarketingPath) {
  return htmlPath === "/" ? "/index.md" : `${htmlPath}.md`;
}

function markdownForSummary(
  htmlPath: PublicMarketingPath,
  markdownPath: string,
  { title, summary, lastReviewed }: PageSummary,
) {
  return [
    `# ${title}`,
    "",
    summary,
    "",
    `Canonical HTML: ${absoluteUrl(htmlPath)}`,
    `Markdown alternate: ${absoluteUrl(markdownPath)}`,
    `Publisher: ${SITE_NAME}`,
    `Last reviewed: ${lastReviewed ?? "2026-08-14"}`,
    "",
    "## Canonical resources",
    "",
    `- [Site index](${absoluteUrl("/llms.txt")})`,
    `- [Full product and methodology reference](${absoluteUrl("/llms-full.txt")})`,
    `- [Resource library](${absoluteUrl("/resources")})`,
    `- [Measurement methodology](${absoluteUrl("/methodology")})`,
    "",
    "## Important limitation",
    "",
    "AI answers vary by provider, model, grounding source, locale, and time. A technical or content change cannot guarantee a mention, citation, recommendation, or ranking.",
    "",
  ].join("\n");
}

export const ALL_PUBLIC_MARKDOWN_PAGES: readonly MachineMarkdownPage[] =
  PUBLIC_MARKETING_PATHS.map((htmlPath) => {
    const existingPage = machineMarkdownForHtmlPath(htmlPath);
    if (existingPage) return existingPage;

    const markdownPath = markdownPathForHtmlPath(htmlPath);
    const summary = PUBLIC_PAGE_SUMMARIES[htmlPath];

    return {
      htmlPath,
      markdownPath,
      slug: htmlPath === "/" ? "index" : htmlPath.slice(1),
      title: summary.title,
      markdown:
        htmlPath === "/"
          ? HOME_MARKDOWN
          : markdownForSummary(htmlPath, markdownPath, summary),
    };
  });

export function publicMarkdownForHtmlPath(pathname: string) {
  return ALL_PUBLIC_MARKDOWN_PAGES.find(
    (page) => page.htmlPath === pathname,
  );
}

export function publicMarkdownForMarkdownPath(pathname: string) {
  return ALL_PUBLIC_MARKDOWN_PAGES.find(
    (page) => page.markdownPath === pathname,
  );
}

export function publicMarkdownResponse(
  page: MachineMarkdownPage,
  method: "GET" | "HEAD" = "GET",
) {
  return machineMarkdownResponse(page, method);
}
