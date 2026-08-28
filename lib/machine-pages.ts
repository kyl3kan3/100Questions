import { absoluteUrl, SITE_NAME } from "./site";

export type MachineMarkdownPage = {
  htmlPath: string;
  markdownPath: string;
  slug: string;
  title: string;
  markdown: string;
};

function markdownDocument({
  title,
  summary,
  htmlPath,
  sections,
}: {
  title: string;
  summary: string;
  htmlPath: string;
  sections: string[];
}) {
  return [
    "# " + title,
    "",
    summary,
    "",
    "Canonical HTML: " + absoluteUrl(htmlPath),
    "Publisher: " + SITE_NAME,
    "Last reviewed: 2026-08-28",
    "",
    ...sections,
    "",
    "## Important limitation",
    "",
    "AI answers vary by provider, model, search source, locale, and time. No technical or content tactic guarantees a recommendation, citation, or ranking.",
    "",
  ].join("\n");
}

export const MACHINE_MARKDOWN_PAGES: MachineMarkdownPage[] = [
  {
    slug: "ai-visibility-checker",
    htmlPath: "/ai-visibility-checker",
    markdownPath: "/ai-visibility-checker.md",
    title: "Free AI Visibility Checker",
    markdown: markdownDocument({
      title: "Free AI Visibility Checker",
      summary:
        "A free technical preflight for public website signals that affect AI-search retrieval and interpretation. No account is required.",
      htmlPath: "/ai-visibility-checker",
      sections: [
        "## What it checks",
        "",
        "- Indexability and canonical URL",
        "- AI crawler access in robots.txt",
        "- Title, description, and primary heading",
        "- Relevant JSON-LD structured data",
        "- Question-oriented page content",
        "- XML sitemap discovery",
        "- Optional llms.txt discovery",
        "",
        "The result is a readiness score, not a measurement of current ChatGPT, Claude, Gemini, or Grok recommendations.",
        "",
        "## Measure actual visibility",
        "",
        "To measure actual visibility, freeze neutral buyer questions, run the same set across the providers your buyers use, and preserve answer and citation evidence. The paid benchmark sends 25 frozen questions to four providers for 100 planned answers.",
        "",
        "- Free checker: " + absoluteUrl("/ai-visibility-checker"),
        "- Measurement guide: " + absoluteUrl("/ai-visibility"),
        "- Paid audit: " + absoluteUrl("/ai-visibility-audit"),
      ],
    }),
  },
  {
    slug: "ai-visibility",
    htmlPath: "/ai-visibility",
    markdownPath: "/ai-visibility.md",
    title: "AI Visibility: How to Measure and Improve It",
    markdown: markdownDocument({
      title: "AI Visibility: How to Measure and Improve It",
      summary:
        "AI visibility describes how often and how prominently a brand appears when AI systems answer relevant category and buyer questions.",
      htmlPath: "/ai-visibility",
      sections: [
        "## Core measures",
        "",
        "- Discovery visibility: whether neutral buyer answers mention the brand",
        "- Prominence: lead recommendation, shortlist, incidental mention, or absence",
        "- Competitor share of voice: target mentions compared with selected competitors",
        "- Claimed-domain citation rate: answers citing the submitted domain",
        "- Coverage: eligible grounded answers divided by planned answers",
        "",
        "Keep these measures separate. One unexplained composite can hide missing answers, weak prominence, or a citation problem.",
        "",
        "## Improvement loop",
        "",
        "1. Remove crawl and rendering barriers.",
        "2. Keep entity facts consistent across owned and third-party pages.",
        "3. Publish direct, extractable answers to buyer questions.",
        "4. Support claims with original evidence and relevant corroboration.",
        "5. Rerun the identical question set and compare stored evidence.",
        "",
        "- Free technical checker: " + absoluteUrl("/ai-visibility-checker"),
        "- Best AI visibility tools: " + absoluteUrl("/ai-seo-tools"),
        "- Full methodology: " + absoluteUrl("/methodology"),
      ],
    }),
  },
  {
    slug: "ai-seo-tools",
    htmlPath: "/ai-seo-tools",
    markdownPath: "/ai-seo-tools.md",
    title: "Best AI Visibility Tools for 2026",
    markdown: markdownDocument({
      title: "Best AI Visibility Tools for 2026",
      summary:
        "Six AI visibility tools compared by measurement model and operating job rather than by one unsupported universal ranking.",
      htmlPath: "/ai-seo-tools",
      sections: [
        "## Shortlist by job",
        "",
        "- 100 Questions: prepaid evidence-linked benchmark and prioritized action list",
        "- Ahrefs Brand Radar: broad visibility research",
        "- Semrush: combined SEO and AI workflows",
        "- Profound: enterprise answer-engine operations",
        "- Otterly.AI: focused recurring prompt tracking",
        "- Peec AI: ongoing visibility monitoring and reporting",
        "",
        "## Platform or point tool",
        "",
        "Choose an AI visibility platform when multiple teams need recurring monitoring, alerts, integrations, and shared workflows. Choose a point tool when the job is narrower: technical access, market research, or one fixed evidence-linked baseline.",
        "",
        "There is no defensible best-rated winner without one current, attributable review dataset covering the whole category. Verify provider coverage, evidence access, pricing, limits, and review sample sizes before buying.",
        "",
        "- AEO tools comparison: " + absoluteUrl("/answer-engine-optimization-tools"),
        "- Free alternatives: " + absoluteUrl("/ai-visibility-tools#free-alternatives"),
        "- AI visibility audit: " + absoluteUrl("/ai-visibility-audit"),
      ],
    }),
  },
  {
    slug: "answer-engine-optimization-tools",
    htmlPath: "/answer-engine-optimization-tools",
    markdownPath: "/answer-engine-optimization-tools.md",
    title: "Answer Engine Optimization Tools Compared",
    markdown: markdownDocument({
      title: "Answer Engine Optimization Tools Compared",
      summary:
        "AEO software spans technical SEO, prompt monitoring, citation research, enterprise workflows, and controlled benchmarks.",
      htmlPath: "/answer-engine-optimization-tools",
      sections: [
        "## Choose by measurement model",
        "",
        "- Technical access tools test crawlability, rendering, metadata, and structured data.",
        "- Prompt trackers rerun configured questions and monitor mentions over time.",
        "- Research databases analyze larger collections of AI answers and citations.",
        "- SEO suites connect AI visibility signals to established search workflows.",
        "- Enterprise platforms coordinate research, content operations, and reporting.",
        "- Fixed benchmarks preserve one question set, answer evidence, and a prioritized action list.",
        "",
        "## Buying questions",
        "",
        "Confirm how prompts are selected, which providers and locales are covered, whether answer and citation evidence is inspectable, how failures affect denominators, whether identical reruns are possible, and whether the commercial model fits continuous monitoring or a bounded project.",
        "",
        "- AEO implementation guide: " + absoluteUrl("/answer-engine-optimization"),
        "- Best AI visibility tools: " + absoluteUrl("/ai-seo-tools"),
        "- Free readiness checker: " + absoluteUrl("/ai-visibility-checker"),
      ],
    }),
  },
  {
    slug: "how-to-get-chatgpt-to-recommend-your-business",
    htmlPath: "/how-to-get-chatgpt-to-recommend-your-business",
    markdownPath: "/how-to-get-chatgpt-to-recommend-your-business.md",
    title: "How to Get ChatGPT to Recommend Your Business",
    markdown: markdownDocument({
      title: "How to Get ChatGPT to Recommend Your Business",
      summary:
        "You cannot force a ChatGPT recommendation. You can make a business easier to retrieve, identify, verify, and compare, then measure whether it appears more often.",
      htmlPath: "/how-to-get-chatgpt-to-recommend-your-business",
      sections: [
        "## Five controllable inputs",
        "",
        "1. Earn accurate, relevant third-party citations.",
        "2. Publish structured data that matches visible facts.",
        "3. Maintain authentic reviews on category-relevant platforms.",
        "4. Keep the company name, domain, category, location, pricing, and description consistent.",
        "5. Allow OAI-SearchBot and other relevant search crawlers to reach useful public pages.",
        "",
        "These inputs improve accessibility and corroboration. OpenAI does not publish a business-recommendation formula, and none of them is a guaranteed ranking factor.",
        "",
        "## Measure the result",
        "",
        "Use a technical checker to remove access problems, then freeze neutral buyer questions and record mentions, competitors, prominence, and cited sources. Rerun identical questions after providers have had time to refresh.",
        "",
        "- Free AI visibility checker: " + absoluteUrl("/ai-visibility-checker"),
        "- Free ChatGPT brand test: " + absoluteUrl("/chatgpt-brand-visibility-test"),
        "- Evidence-linked audit: " + absoluteUrl("/ai-visibility-audit"),
      ],
    }),
  },
  {
    slug: "pricing",
    htmlPath: "/pricing",
    markdownPath: "/pricing.md",
    title: "AI Visibility Benchmark Pricing",
    markdown: markdownDocument({
      title: "AI Visibility Benchmark Pricing",
      summary:
        "100 Questions sells prepaid AI visibility benchmark credits with no subscription, seat fee, or automatic renewal.",
      htmlPath: "/pricing",
      sections: [
        "## Packages",
        "",
        "- First benchmark: $9 for one credit",
        "- Single benchmark: $15 for one credit",
        "- Three benchmarks: $39 total",
        "- Ten benchmarks: $99 total",
        "",
        "Credits remain valid for 12 months. Stripe shows the final amount and applicable taxes before payment.",
        "",
        "## Included with each benchmark",
        "",
        "- One frozen set of 25 buyer questions",
        "- The same questions sent to OpenAI, Claude, Gemini, and Grok",
        "- 100 planned web-grounded answers",
        "- Brand mentions, prominence, competitor share of voice, claimed-domain citations, and coverage",
        "- Inspectable answer and source evidence",
        "- Up to five prioritized actions plus PDF and CSV exports",
        "",
        "This is a point-in-time benchmark, not continuous monitoring. It does not currently test Perplexity or reproduce consumer chat interfaces.",
        "",
        "- Pricing and checkout: " + absoluteUrl("/pricing"),
        "- Sample report: " + absoluteUrl("/sample-report"),
        "- Methodology: " + absoluteUrl("/methodology"),
      ],
    }),
  },
  {
    slug: "how-to-check-if-oai-searchbot-is-blocked",
    htmlPath: "/how-to-check-if-oai-searchbot-is-blocked",
    markdownPath: "/how-to-check-if-oai-searchbot-is-blocked.md",
    title: "How to Check If OAI-SearchBot Is Blocked",
    markdown: markdownDocument({
      title: "How to Check If OAI-SearchBot Is Blocked",
      summary:
        "Check robots.txt, path-specific directives, edge security, and rendered page access before assuming OpenAI search discovery is a content problem.",
      htmlPath: "/how-to-check-if-oai-searchbot-is-blocked",
      sections: [
        "## Quick check",
        "",
        "1. Fetch /robots.txt and find the OAI-SearchBot group.",
        "2. Check whether a broad wildcard rule or a more specific path rule blocks the page you care about.",
        "3. Request the exact canonical page with an OAI-SearchBot user agent and inspect the HTTP status, redirects, and returned HTML.",
        "4. Review CDN, web application firewall, bot-management, and rate-limit logs for denied requests.",
        "5. Confirm the final HTML contains the title, primary heading, body answer, canonical URL, and structured data without requiring interaction.",
        "",
        "## Do not confuse the OpenAI user agents",
        "",
        "OAI-SearchBot supports search discovery. GPTBot is used for model-training controls. ChatGPT-User may fetch a page in response to a user request. Decide and document access for each user agent separately.",
        "",
        "Allowing a crawler does not guarantee crawling, indexing, citation, or recommendation. llms.txt also does not override robots.txt, authentication, CDN rules, or a noindex directive.",
        "",
        "- Free technical checker: " + absoluteUrl("/ai-visibility-checker"),
        "- ChatGPT recommendation guide: " + absoluteUrl("/how-to-get-chatgpt-to-recommend-your-business"),
        "- Measurement methodology: " + absoluteUrl("/methodology"),
      ],
    }),
  },
] as const;

export const MCP_LANDING_MARKDOWN = markdownDocument({
  title: "100 Questions AI Visibility Readiness MCP",
  summary:
    "A public, read-only Model Context Protocol endpoint that checks a public website for technical AI-search crawlability and discovery signals.",
  htmlPath: "/mcp",
  sections: [
    "## Endpoint",
    "",
    "Streamable HTTP endpoint: " + absoluteUrl("/mcp"),
    "Method: POST",
    "Authentication: none",
    "Tool: check_ai_visibility_readiness",
    "",
    "The tool accepts one public website hostname and returns a readiness score, individual checks, and prioritized actions. Do not submit secrets, private network addresses, or personal data.",
    "",
    "## Discovery",
    "",
    "- MCP server card: " + absoluteUrl("/.well-known/mcp/server-card.json"),
    "- OpenAPI description: " + absoluteUrl("/openapi.json"),
    "- Agent authentication guidance: " + absoluteUrl("/auth.md"),
    "- Concise site index: " + absoluteUrl("/llms.txt"),
    "- Full product reference: " + absoluteUrl("/llms-full.txt"),
    "",
    "## Human-readable guides",
    "",
    "- Free checker: " + absoluteUrl("/ai-visibility-checker"),
    "- AI visibility guide: " + absoluteUrl("/ai-visibility"),
    "- Methodology: " + absoluteUrl("/methodology"),
  ],
});

export const MCP_MARKDOWN_PAGE: MachineMarkdownPage = {
  slug: "mcp",
  htmlPath: "/mcp",
  markdownPath: "/mcp.md",
  title: "100 Questions AI Visibility Readiness MCP",
  markdown: MCP_LANDING_MARKDOWN,
};

export const ALL_MACHINE_MARKDOWN_PAGES = [
  MCP_MARKDOWN_PAGE,
  ...MACHINE_MARKDOWN_PAGES,
] as const;

export function machineMarkdownForHtmlPath(pathname: string) {
  return ALL_MACHINE_MARKDOWN_PAGES.find(
    (page) => page.htmlPath === pathname,
  );
}

export function machineMarkdownForSlug(slug: string) {
  return ALL_MACHINE_MARKDOWN_PAGES.find((page) => page.slug === slug);
}

export function machineMarkdownResponse(
  page: MachineMarkdownPage,
  method: "GET" | "HEAD" = "GET",
) {
  return new Response(method === "HEAD" ? null : page.markdown, {
    headers: {
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "content-location": page.markdownPath,
      "content-type": "text/markdown; charset=utf-8",
      link:
        "<" +
        absoluteUrl(page.htmlPath) +
        '>; rel="canonical"; type="text/html"',
      vary: "Accept",
    },
  });
}

export function buildMcpLandingHtml() {
  const pageUrl = absoluteUrl("/mcp");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "100 Questions AI Visibility Readiness MCP",
        url: pageUrl,
        description:
          "Public documentation for the 100 Questions AI visibility readiness MCP endpoint.",
        dateModified: "2026-08-14",
      },
      {
        "@type": "WebAPI",
        name: "100 Questions AI Visibility Readiness MCP",
        url: pageUrl,
        description:
          "A public, read-only MCP tool for checking technical AI-search readiness.",
        documentation: pageUrl,
        provider: { "@id": `${absoluteUrl()}#organization` },
        isAccessibleForFree: true,
      },
    ],
  };

  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>Free AI Visibility Readiness MCP | 100 Questions</title>",
    '<meta name="description" content="Use the free 100 Questions MCP endpoint to check public website crawlability, structured data, sitemaps, AI crawler access, and llms.txt availability.">',
    '<meta name="robots" content="index, follow, max-snippet:-1">',
    '<link rel="canonical" href="' + pageUrl + '">',
    '<link rel="alternate" type="text/markdown" href="' + absoluteUrl("/mcp.md") + '">',
    '<script type="application/ld+json">' + JSON.stringify(schema) + "</script>",
    "<style>",
    "body{margin:0;background:#070908;color:#e4e4e7;font:16px/1.65 system-ui,sans-serif}main{max-width:880px;margin:auto;padding:64px 24px 96px}a{color:#6ee7b7}h1{font-size:clamp(2.4rem,7vw,5rem);line-height:1;letter-spacing:-.05em;margin:.35em 0}h2{margin-top:2.4em;color:#fff}.eyebrow{color:#6ee7b7;font:700 12px ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase}.lede{font-size:1.2rem;color:#a1a1aa;max-width:720px}.card{background:#0b0e0c;border:1px solid #27272a;border-radius:24px;padding:24px;margin-top:24px}code{color:#a7f3d0}ul{padding-left:1.3em}.cta{display:inline-block;background:#6ee7b7;color:#07100b;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:999px;margin-top:18px}",
    "</style>",
    "</head>",
    "<body>",
    "<main>",
    '<p class="eyebrow">Public agent endpoint</p>',
    "<h1>Free AI visibility readiness MCP</h1>",
    '<p class="lede">A crawlable guide and public, read-only Model Context Protocol endpoint for checking the technical signals that help AI search systems reach and interpret a website.</p>',
    '<section class="card">',
    "<h2>Connect</h2>",
    "<p><strong>Streamable HTTP endpoint:</strong> <code>" + pageUrl + "</code><br><strong>Method:</strong> POST<br><strong>Authentication:</strong> none<br><strong>Tool:</strong> <code>check_ai_visibility_readiness</code></p>",
    '<p><a href="' + absoluteUrl("/.well-known/mcp/server-card.json") + '">MCP server card</a> · <a href="' + absoluteUrl("/openapi.json") + '">OpenAPI</a> · <a href="' + absoluteUrl("/auth.md") + '">Agent authentication guidance</a></p>',
    "</section>",
    "<section>",
    "<h2>What the free tool checks</h2>",
    "<ul><li>Indexability and canonical URL</li><li>AI crawler access in robots.txt</li><li>Metadata, H1, and structured data</li><li>Question-oriented page content</li><li>XML sitemap discovery</li><li>Optional llms.txt discovery</li></ul>",
    "<p>The result is a technical preflight, not a guarantee that an AI assistant will mention or recommend the website.</p>",
    "</section>",
    "<section>",
    "<h2>Canonical resources for AI clients</h2>",
    '<ul><li><a href="' + absoluteUrl("/llms.txt") + '">Concise llms.txt site index</a></li><li><a href="' + absoluteUrl("/llms-full.txt") + '">Full product and methodology reference</a></li><li><a href="' + absoluteUrl("/ai-visibility-checker.md") + '">Free checker in Markdown</a></li><li><a href="' + absoluteUrl("/ai-visibility.md") + '">AI visibility guide in Markdown</a></li><li><a href="' + absoluteUrl("/how-to-get-chatgpt-to-recommend-your-business.md") + '">ChatGPT recommendation guide in Markdown</a></li></ul>',
    "</section>",
    "<section>",
    "<h2>Measure actual answers</h2>",
    "<p>Technical access is only the first layer. The paid audit freezes 25 buyer questions, sends the same set to four AI providers, preserves answer and citation evidence, and produces a prioritized action list.</p>",
    '<a class="cta" href="' + absoluteUrl("/pricing") + '">Review the $9 audit</a>',
    "</section>",
    "</main>",
    "</body>",
    "</html>",
  ].join("");
}

export function mcpLandingResponse(
  request: Request,
  acceptsMarkdown: (acceptHeader: string | null) => boolean,
) {
  if (acceptsMarkdown(request.headers.get("accept"))) {
    return machineMarkdownResponse(
      MCP_MARKDOWN_PAGE,
      request.method === "HEAD" ? "HEAD" : "GET",
    );
  }

  return new Response(request.method === "HEAD" ? null : buildMcpLandingHtml(), {
    headers: {
      allow: "GET, HEAD, POST, OPTIONS",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "content-type": "text/html; charset=utf-8",
      link: [
        "<" + absoluteUrl("/mcp.md") + '>; rel="alternate"; type="text/markdown"',
        "<" +
          absoluteUrl("/.well-known/mcp/server-card.json") +
          '>; rel="describedby"; type="application/json"',
        "<" + absoluteUrl("/llms.txt") + '>; rel="describedby"; type="text/plain"',
      ].join(", "),
      vary: "Accept",
    },
  });
}
