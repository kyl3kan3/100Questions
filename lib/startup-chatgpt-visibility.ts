import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parse as parseDomain } from "tldts";

import type { AiReadinessResult } from "./ai-readiness";
import { normalizeCanonicalDomain } from "./ai/matching";
import {
  buildBuyerQuestionTexts,
  normalizeCategoryLabel,
} from "./startup-buyer-questions";

export type DiscoverySignal = "strong" | "moderate" | "weak" | "blocked";

export type StartupVisibilityQuestion = {
  text: string;
  signal: DiscoverySignal;
  summary: string;
};

export type StartupChatgptVisibilityResult = {
  inputLabel: string;
  domain: string | null;
  brandName: string;
  score: number;
  grade: string;
  methodology: string;
  checkedAt: string;
  readiness: AiReadinessResult | null;
  fetchNote: string | null;
  benchmarkNote: string | null;
  questions: StartupVisibilityQuestion[];
  topActions: string[];
};

type IndexRanking = {
  brand: string;
  claimedDomain: string;
  discoveryVisibility: number;
  mentionCount: number;
  eligibleAnswers: number;
};

let indexRankingsByDomain: Map<string, IndexRanking> | null = null;

function loadIndexRankingsByDomain(): Map<string, IndexRanking> {
  if (indexRankingsByDomain) return indexRankingsByDomain;
  try {
    const raw = readFileSync(
      join(process.cwd(), "public/data/ai-visibility-index-2026-results.json"),
      "utf8",
    );
    const payload = JSON.parse(raw) as { rankings?: IndexRanking[] };
    indexRankingsByDomain = new Map(
      (payload.rankings ?? []).map((row) => [
        row.claimedDomain.toLowerCase(),
        row,
      ]),
    );
  } catch {
    indexRankingsByDomain = new Map();
  }
  return indexRankingsByDomain;
}

export function normalizeStartupVisibilityInput(raw: string): {
  domain: string | null;
  brandName: string;
  inputLabel: string;
} {
  const trimmed = raw.trim().slice(0, 200);
  if (!trimmed) {
    return { domain: null, brandName: "", inputLabel: "" };
  }

  const hostname = normalizeCanonicalDomain(trimmed);
  if (hostname) {
    const parsed = parseDomain(hostname, { allowPrivateDomains: false });
    if (parsed.domain && !parsed.isIp && !parsed.isPrivate) {
      const brandGuess =
        parsed.domainWithoutSuffix?.split(".")[0] ??
        hostname.split(".")[0] ??
        hostname;
      return {
        domain: hostname,
        brandName: titleCase(brandGuess),
        inputLabel: hostname,
      };
    }
  }

  const brandName = trimmed.replace(/\s+/gu, " ").slice(0, 80);
  return { domain: null, brandName, inputLabel: brandName };
}

export function buildStartupVisibilityFromReadiness(
  input: {
    domain: string | null;
    brandName: string;
    inputLabel: string;
  },
  readiness: AiReadinessResult | null,
  options?: {
    checkedAt?: string;
    fetchNote?: string | null;
    resolvedDomain?: string | null;
  },
): StartupChatgptVisibilityResult {
  const checkedAt = options?.checkedAt ?? new Date().toISOString();
  const fetchNote = options?.fetchNote ?? null;
  const effectiveDomain =
    options?.resolvedDomain?.toLowerCase() ?? input.domain?.toLowerCase() ?? null;

  const category = inferCategoryContext(readiness);
  const benchmark = effectiveDomain
    ? loadIndexRankingsByDomain().get(effectiveDomain)
    : undefined;

  const score = readiness?.score ?? estimateBrandOnlyScore(input.brandName);
  const grade = readiness?.grade ?? gradeForHeuristic(score);

  const questions = buildBuyerQuestions(
    input.brandName,
    category,
    readiness,
    benchmark,
  );

  const benchmarkNote = benchmark
    ? `Benchmark cohort (Jul 2026 study): ${benchmark.mentionCount} mentions in ${benchmark.eligibleAnswers} grounded answers (${Math.round(benchmark.discoveryVisibility * 100)}% discovery visibility). This is measured API evidence, not a live ChatGPT session.`
    : null;

  return {
    inputLabel: input.inputLabel,
    domain: effectiveDomain ?? input.domain,
    brandName: input.brandName,
    score,
    grade,
    methodology:
      "Score is a technical AI-discovery readiness preview from your public site (crawl access, page signals, schema, sitemaps, question-shaped content). It does not query ChatGPT and is not a brand-mention rate.",
    checkedAt,
    readiness,
    fetchNote,
    benchmarkNote,
    questions,
    topActions: readiness?.topActions ?? defaultBrandOnlyActions(),
  };
}

export function cacheKeyForStartupVisibility(inputLabel: string): string {
  const normalized = inputLabel.trim().toLowerCase();
  return createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}

type CategoryContext = {
  label: string;
};

export function inferCategoryContext(
  readiness: AiReadinessResult | null,
): CategoryContext {
  if (!readiness) {
    return { label: "B2B software tools" };
  }

  const title = cleanMarketingPhrase(readiness.detected.title ?? "");
  const h1 = cleanMarketingPhrase(readiness.detected.h1 ?? "");
  const description = cleanMarketingPhrase(readiness.detected.description ?? "");

  const host = hostnameFromReadiness(readiness);
  const label = normalizeCategoryLabel(
    deriveCategoryLabel(`${title} ${h1} ${description}`, host),
  );

  return { label };
}

function hostnameFromReadiness(readiness: AiReadinessResult | null): string {
  if (!readiness?.checkedUrl) return "";
  try {
    return new URL(readiness.checkedUrl).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function deriveCategoryLabel(combined: string, host = ""): string {
  const text = `${combined} ${host}`.toLowerCase();
  if (/payment|billing|checkout|fintech|stripe/iu.test(text)) {
    return "payment infrastructure";
  }
  if (/vercel\.com/iu.test(host) || /deploy|hosting|edge|serverless|vercel|cloud platform/iu.test(text)) {
    return "frontend cloud platforms";
  }
  if (/stripe\.com/iu.test(host)) {
    return "payment infrastructure";
  }
  if (/linear\.app/iu.test(host)) {
    return "product development tools";
  }
  if (/posthog\.com/iu.test(host)) {
    return "product analytics stacks";
  }
  if (/notion\.(so|com)/iu.test(host)) {
    return "collaborative workspace software";
  }
  if (/100questionsai\.com/iu.test(host)) {
    return "AI visibility benchmarking tools";
  }
  if (/issue tracking|project management|linear/iu.test(text)) {
    return "product development tools";
  }
  if (/product analytics|posthog|analytics platform/iu.test(text)) {
    return "product analytics stacks";
  }
  if (/wiki|docs|notion|workspace/iu.test(text)) {
    return "collaborative workspace software";
  }
  if (/saas|software|platform|api|developer/iu.test(text)) {
    return "B2B software";
  }
  if (/agency|marketing|seo|visibility/iu.test(text)) {
    return "marketing services";
  }
  if (/e-?commerce|shop|store/iu.test(text)) {
    return "e-commerce platforms";
  }
  return "tools in this category";
}

function cleanMarketingPhrase(value: string): string {
  return value
    .replace(/\s*[|–—-]\s*.+$/u, "")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, 120);
}

function buildBuyerQuestions(
  brandName: string,
  category: CategoryContext,
  readiness: AiReadinessResult | null,
  benchmark: IndexRanking | undefined,
): StartupVisibilityQuestion[] {
  const checkGroups = [
    ["crawler-access", "question-content"] as const,
    ["structured-data", "page-signals"] as const,
    ["sitemap", "llms"] as const,
  ];

  const texts = buildBuyerQuestionTexts(category);
  const benchmarkBoost =
    benchmark && benchmark.discoveryVisibility >= 0.05 ? 1 : 0;

  return texts.map((text, index) => {
    const checks = checkGroups[index];
    const signal = signalForChecks(readiness, [...checks], index, benchmarkBoost);
    return {
      text,
      signal,
      summary: summaryForChecks(
        signal,
        brandName,
        readiness,
        checks,
        category,
      ),
    };
  });
}

function signalForChecks(
  readiness: AiReadinessResult | null,
  checkIds: string[],
  questionIndex: number,
  benchmarkBoost: number,
): DiscoverySignal {
  if (!readiness) return "weak";
  if (
    readiness.checks.some(
      (check) => check.id === "indexability" && check.status === "fail",
    )
  ) {
    return "blocked";
  }

  const targeted = readiness.checks.filter((check) =>
    checkIds.includes(check.id),
  );
  const failCount = targeted.filter((check) => check.status === "fail").length;
  const warnCount = targeted.filter((check) => check.status === "warning").length;

  let base: DiscoverySignal = "strong";
  if (failCount > 0) base = "weak";
  else if (warnCount > 0) base = "moderate";
  else if (readiness.score < 45) base = "weak";

  return adjustSignal(base, questionIndex, benchmarkBoost);
}

function adjustSignal(
  base: DiscoverySignal,
  questionIndex: number,
  benchmarkBoost: number,
): DiscoverySignal {
  if (base === "blocked") return "blocked";
  const order: DiscoverySignal[] = ["weak", "moderate", "strong"];
  let idx = order.indexOf(base) + benchmarkBoost;
  if (questionIndex === 2) idx -= 1;
  idx = Math.max(0, Math.min(order.length - 1, idx));
  return order[idx];
}

function summaryForChecks(
  signal: DiscoverySignal,
  brandName: string,
  readiness: AiReadinessResult | null,
  checkIds: readonly string[],
  category: CategoryContext,
): string {
  const checks = readiness?.checks.filter((check) => checkIds.includes(check.id)) ?? [];
  const evidence = checks
    .map((check) => `${check.label.toLowerCase()}: ${check.evidence}`)
    .join(" ");

  if (signal === "blocked") {
    return `Index/crawl blockers on ${brandName}'s public site — ${evidence || "noindex or robots rules may hide pages from AI crawlers."}`;
  }
  if (signal === "strong") {
    return `For ${category.label} prompts, ${brandName}'s public signals look solid (${evidence || "crawl access and page evidence look usable"}). Neutral answers can still omit you without a live test.`;
  }
  if (signal === "moderate") {
    return `Mixed signals for ${category.label} discovery — ${evidence || "some checks passed, others need clearer public evidence."}`;
  }
  return `Weak ${category.label} discovery signals for ${brandName} — ${evidence || "buyer-style answers may skip you unless prompts name the brand."}`;
}

function estimateBrandOnlyScore(brandName: string): number {
  const lengthScore = Math.min(brandName.length, 20);
  return Math.max(12, Math.min(35, 10 + lengthScore));
}

function gradeForHeuristic(score: number): string {
  if (score >= 85) return "Strong technical foundation";
  if (score >= 65) return "Good foundation with clear gaps";
  if (score >= 40) return "Several readiness gaps";
  return "High-priority fixes needed";
}

function defaultBrandOnlyActions(): string[] {
  return [
    "Add a public domain so we can check crawl access, schema, and buyer-question content.",
    "Publish clear category positioning on your homepage (title, H1, meta description).",
    "Run the full 100-question benchmark when you need actual provider answers.",
  ];
}

function titleCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
