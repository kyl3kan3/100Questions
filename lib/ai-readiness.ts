export type ReadinessStatus = "pass" | "warning" | "fail";

export type ReadinessCheck = {
  id:
    | "indexability"
    | "crawler-access"
    | "page-signals"
    | "canonical"
    | "structured-data"
    | "question-content"
    | "sitemap"
    | "llms";
  label: string;
  status: ReadinessStatus;
  score: number;
  maxScore: number;
  evidence: string;
  action: string | null;
};

export type AiReadinessResult = {
  score: number;
  grade: string;
  checkedUrl: string;
  checkedAt: string;
  checks: ReadinessCheck[];
  topActions: string[];
  detected: {
    title: string | null;
    description: string | null;
    h1: string | null;
    canonical: string | null;
    schemaTypes: string[];
    questionHeadingCount: number;
    blockedCrawlers: string[];
  };
};

export type AiReadinessInput = {
  finalUrl: string;
  html: string;
  responseHeaders?: Headers | Record<string, string | null | undefined>;
  robotsText: string | null;
  sitemapFound: boolean;
  llmsText: string | null;
  checkedAt?: string;
};

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ClaudeBot",
  "PerplexityBot",
] as const;

export function analyzeAiReadiness(
  input: AiReadinessInput,
): AiReadinessResult {
  const title = cleanText(readTagText(input.html, "title")) || null;
  const description =
    cleanText(readMeta(input.html, "description")) ||
    cleanText(readMeta(input.html, "og:description")) ||
    null;
  const h1 = cleanText(readTagText(input.html, "h1")) || null;
  const canonical = readCanonical(input.html) || null;
  const schemaTypes = readSchemaTypes(input.html);
  const questionHeadingCount = countQuestionHeadings(input.html);
  const robotsDirective = [
    readMeta(input.html, "robots"),
    readHeader(input.responseHeaders, "x-robots-tag"),
  ]
    .filter(Boolean)
    .join(",");
  const noindex = /(?:^|[\s,;])noindex(?:$|[\s,;])/iu.test(robotsDirective);
  const blockedCrawlers = readBlockedCrawlers(input.robotsText);

  const pageSignalCount = [title, description, h1].filter(Boolean).length;
  const relevantSchema = schemaTypes.some((type) =>
    [
      "Article",
      "BlogPosting",
      "FAQPage",
      "HowTo",
      "Organization",
      "Product",
      "Service",
      "SoftwareApplication",
      "WebApplication",
    ].includes(type),
  );

  const checks: ReadinessCheck[] = [
    {
      id: "indexability",
      label: "Indexability",
      status: noindex ? "fail" : "pass",
      score: noindex ? 0 : 20,
      maxScore: 20,
      evidence: noindex
        ? "A noindex directive was detected in page metadata or HTTP headers."
        : "No noindex directive was detected in page metadata or HTTP headers.",
      action: noindex
        ? "Confirm the exclusion is intentional; remove noindex only if this public page should appear in search."
        : null,
    },
    {
      id: "crawler-access",
      label: "AI crawler access",
      ...crawlerAccessCheck(input.robotsText, blockedCrawlers),
    },
    {
      id: "page-signals",
      label: "Core page signals",
      status:
        pageSignalCount === 3
          ? "pass"
          : pageSignalCount > 0
            ? "warning"
            : "fail",
      score: pageSignalCount * 5,
      maxScore: 15,
      evidence:
        pageSignalCount === 3
          ? "The page exposes a title, meta description, and primary H1."
          : `Detected ${pageSignalCount} of 3 core signals: title, meta description, and H1.`,
      action:
        pageSignalCount === 3
          ? null
          : "Add the missing title, meta description, or H1 and make the brand/category relationship explicit.",
    },
    {
      id: "canonical",
      label: "Canonical URL",
      status: canonical ? "pass" : "warning",
      score: canonical ? 10 : 0,
      maxScore: 10,
      evidence: canonical
        ? `Canonical found: ${canonical}`
        : "No canonical link was detected in the fetched HTML.",
      action: canonical
        ? null
        : "Add a self-referencing canonical URL to the public page.",
    },
    {
      id: "structured-data",
      label: "Structured data",
      status: relevantSchema
        ? "pass"
        : schemaTypes.length
          ? "warning"
          : "fail",
      score: relevantSchema ? 15 : schemaTypes.length ? 7 : 0,
      maxScore: 15,
      evidence: schemaTypes.length
        ? `Detected schema types: ${schemaTypes.join(", ")}.`
        : "No valid JSON-LD schema types were detected.",
      action: relevantSchema
        ? null
        : "Add accurate Organization plus page-specific Article, Product, Service, SoftwareApplication, or FAQ markup.",
    },
    {
      id: "question-content",
      label: "Question-oriented content",
      status:
        questionHeadingCount >= 3
          ? "pass"
          : questionHeadingCount > 0
            ? "warning"
            : "fail",
      score: questionHeadingCount >= 3 ? 10 : questionHeadingCount ? 5 : 0,
      maxScore: 10,
      evidence: `${questionHeadingCount} question-oriented H2/H3 heading${questionHeadingCount === 1 ? "" : "s"} detected.`,
      action:
        questionHeadingCount >= 3
          ? null
          : "Add concise sections that answer the real comparison, pricing, fit, implementation, and trust questions buyers ask.",
    },
    {
      id: "sitemap",
      label: "Sitemap discovery",
      status: input.sitemapFound ? "pass" : "warning",
      score: input.sitemapFound ? 10 : 0,
      maxScore: 10,
      evidence: input.sitemapFound
        ? "A public XML sitemap was found."
        : "No public XML sitemap was found at the standard location or declared in robots.txt.",
      action: input.sitemapFound
        ? null
        : "Publish an XML sitemap and declare it in robots.txt.",
    },
    {
      id: "llms",
      label: "LLM guidance file",
      status: input.llmsText?.trim() ? "pass" : "warning",
      score: input.llmsText?.trim() ? 5 : 0,
      maxScore: 5,
      evidence: input.llmsText?.trim()
        ? "A public llms.txt file was found."
        : "No llms.txt file was found. This is optional and is not a ranking requirement.",
      action: input.llmsText?.trim()
        ? null
        : "Optionally publish a concise llms.txt map, but prioritize crawlable HTML, sitemaps, and useful content first.",
    },
  ];

  const score = checks.reduce((total, check) => total + check.score, 0);
  const topActions = checks
    .filter((check) => check.action)
    .sort(
      (left, right) =>
        right.maxScore - right.score - (left.maxScore - left.score),
    )
    .slice(0, 3)
    .map((check) => check.action as string);

  return {
    score,
    grade: gradeForScore(score),
    checkedUrl: input.finalUrl,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    checks,
    topActions,
    detected: {
      title,
      description,
      h1,
      canonical,
      schemaTypes,
      questionHeadingCount,
      blockedCrawlers,
    },
  };
}

function crawlerAccessCheck(
  robotsText: string | null,
  blockedCrawlers: string[],
): Pick<ReadinessCheck, "status" | "score" | "maxScore" | "evidence" | "action"> {
  if (robotsText === null) {
    return {
      status: "warning",
      score: 7,
      maxScore: 15,
      evidence:
        "robots.txt could not be confirmed. An absent file may allow crawling, but CDN-level controls are not visible here.",
      action:
        "Verify robots.txt and CDN bot controls for GPTBot, OAI-SearchBot, ClaudeBot, and PerplexityBot.",
    };
  }

  if (!blockedCrawlers.length) {
    return {
      status: "pass",
      score: 15,
      maxScore: 15,
      evidence:
        "No full-site block was detected for GPTBot, OAI-SearchBot, ClaudeBot, or PerplexityBot.",
      action: null,
    };
  }

  const allBlocked = blockedCrawlers.length === AI_CRAWLERS.length;
  return {
    status: allBlocked ? "fail" : "warning",
    score: allBlocked ? 0 : 7,
    maxScore: 15,
    evidence: `Full-site robots blocks detected for: ${blockedCrawlers.join(", ")}.`,
    action:
      "Review whether each crawler block matches your training, search, and discovery policy.",
  };
}

function readBlockedCrawlers(robotsText: string | null) {
  if (!robotsText) return [];
  const groups = parseRobotsGroups(robotsText);
  return AI_CRAWLERS.filter((crawler) => {
    const exact = groups.filter((group) =>
      group.agents.some(
        (agent) => agent.toLocaleLowerCase("en-US") === crawler.toLowerCase(),
      ),
    );
    const applicable = exact.length
      ? exact
      : groups.filter((group) => group.agents.includes("*"));
    return applicable.some((group) => {
      const disallowsRoot = group.disallow.some(
        (path) => path === "/" || path === "/*",
      );
      const allowsRoot = group.allow.some(
        (path) => path === "/" || path === "/*",
      );
      return disallowsRoot && !allowsRoot;
    });
  });
}

function parseRobotsGroups(value: string) {
  const groups: Array<{
    agents: string[];
    allow: string[];
    disallow: string[];
  }> = [];
  let current:
    | { agents: string[]; allow: string[]; disallow: string[] }
    | null = null;

  for (const rawLine of value.split(/\r?\n/u)) {
    const line = rawLine.replace(/#.*$/u, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const content = line.slice(separator + 1).trim();

    if (field === "user-agent") {
      if (!current || current.allow.length || current.disallow.length) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(content);
      continue;
    }

    if (!current) continue;
    if (field === "allow") current.allow.push(content);
    if (field === "disallow" && content) current.disallow.push(content);
  }

  return groups;
}

function readSchemaTypes(html: string) {
  const types = new Set<string>();
  const scriptPattern =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu;

  for (const match of html.matchAll(scriptPattern)) {
    try {
      collectSchemaTypes(JSON.parse(match[1]), types);
    } catch {
      // Invalid JSON-LD is intentionally ignored.
    }
  }

  return [...types].sort((left, right) => left.localeCompare(right));
}

function collectSchemaTypes(value: unknown, types: Set<string>) {
  if (Array.isArray(value)) {
    for (const item of value) collectSchemaTypes(item, types);
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [key, item] of Object.entries(value)) {
    if (key === "@type") {
      for (const type of Array.isArray(item) ? item : [item]) {
        if (typeof type === "string" && type.trim()) types.add(type.trim());
      }
    }
    collectSchemaTypes(item, types);
  }
}

function countQuestionHeadings(html: string) {
  const matches = html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/giu);
  let count = 0;
  for (const match of matches) {
    const text = cleanText(match[1]);
    if (
      /\?$/u.test(text) ||
      /^(?:how|what|when|where|which|who|why|can|does|do|is|are|should|will)\b/iu.test(
        text,
      )
    ) {
      count += 1;
    }
  }
  return count;
}

function readMeta(html: string, name: string) {
  const escaped = escapeRegex(name);
  const direct = new RegExp(
    `<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`,
    "iu",
  ).exec(html)?.[1];
  const reversed = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`,
    "iu",
  ).exec(html)?.[1];
  return direct ?? reversed ?? "";
}

function readCanonical(html: string) {
  const linkTags = html.match(/<link\b[^>]*>/giu) ?? [];
  for (const tag of linkTags) {
    if (!/\brel=["'][^"']*\bcanonical\b[^"']*["']/iu.test(tag)) continue;
    return /\bhref=["']([^"']+)["']/iu.exec(tag)?.[1] ?? "";
  }
  return "";
}

function readTagText(html: string, tag: string) {
  const escaped = escapeRegex(tag);
  return new RegExp(
    `<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`,
    "iu",
  ).exec(html)?.[1] ?? "";
}

function readHeader(
  headers: AiReadinessInput["responseHeaders"],
  name: string,
) {
  if (!headers) return "";
  if (headers instanceof Headers) return headers.get(name) ?? "";
  const match = Object.entries(headers).find(
    ([key]) => key.toLocaleLowerCase("en-US") === name.toLowerCase(),
  );
  return match?.[1] ?? "";
}

function cleanText(value: string) {
  return value
    .replace(/<[^>]+>/gu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/&quot;/giu, '"')
    .replace(/&#39;|&apos;/giu, "'")
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">")
    .replace(/\s+/gu, " ")
    .trim();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function gradeForScore(score: number) {
  if (score >= 85) return "Strong technical foundation";
  if (score >= 65) return "Good foundation with clear gaps";
  if (score >= 40) return "Several readiness gaps";
  return "High-priority fixes needed";
}
