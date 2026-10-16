import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parse as parseDomain } from "tldts";

import type { AiReadinessResult } from "./ai-readiness";
import { normalizeCanonicalDomain } from "./ai/matching";

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
  checkedAt = new Date().toISOString(),
): StartupChatgptVisibilityResult {
  const category = inferCategory(readiness);
  const benchmark = input.domain
    ? loadIndexRankingsByDomain().get(input.domain.toLowerCase())
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
    domain: input.domain,
    brandName: input.brandName,
    score,
    grade,
    methodology:
      "Score is a technical AI-discovery readiness preview from your public site (crawl access, page signals, schema, sitemaps, question-shaped content). It does not query ChatGPT and is not a brand-mention rate.",
    checkedAt,
    readiness,
    benchmarkNote,
    questions,
    topActions: readiness?.topActions ?? defaultBrandOnlyActions(),
  };
}

export function cacheKeyForStartupVisibility(inputLabel: string): string {
  const normalized = inputLabel.trim().toLowerCase();
  return createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}

function inferCategory(readiness: AiReadinessResult | null): string {
  if (!readiness) return "your category";
  const title = readiness.detected.title ?? "";
  const h1 = readiness.detected.h1 ?? "";
  const description = readiness.detected.description ?? "";
  const combined = `${title} ${h1} ${description}`.toLowerCase();
  if (/saas|software|platform|tool|api/iu.test(combined)) return "B2B software";
  if (/agency|marketing|seo|visibility/iu.test(combined)) return "marketing services";
  if (/e-?commerce|shop|store/iu.test(combined)) return "e-commerce";
  return "your category";
}

function buildBuyerQuestions(
  brandName: string,
  category: string,
  readiness: AiReadinessResult | null,
  benchmark: IndexRanking | undefined,
): StartupVisibilityQuestion[] {
  const templates = [
    `What are the best ${category} options for a growing startup?`,
    `Which ${category} tools should a founder evaluate this quarter?`,
    `What evidence should I check before buying ${category}?`,
  ];

  const baseSignal = readiness
    ? signalFromReadiness(readiness)
    : ("weak" as DiscoverySignal);

  const benchmarkBoost =
    benchmark && benchmark.discoveryVisibility >= 0.05 ? 1 : 0;

  return templates.map((text, index) => {
    const signal = adjustSignal(baseSignal, index, benchmarkBoost);
    return {
      text,
      signal,
      summary: signalSummary(signal, brandName, readiness),
    };
  });
}

function signalFromReadiness(readiness: AiReadinessResult): DiscoverySignal {
  if (readiness.checks.some((check) => check.id === "indexability" && check.status === "fail")) {
    return "blocked";
  }
  if (readiness.score >= 75) return "strong";
  if (readiness.score >= 45) return "moderate";
  return "weak";
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

function signalSummary(
  signal: DiscoverySignal,
  brandName: string,
  readiness: AiReadinessResult | null,
): string {
  switch (signal) {
    case "strong":
      return `Public signals suggest ${brandName} is easier for AI crawlers to interpret; a neutral prompt could still omit you without a live test.`;
    case "moderate":
      return `Some discovery signals are present, but gaps remain in ${weakLabels(readiness).join(", ") || "page evidence"}.`;
    case "weak":
      return `Thin or missing public evidence — discovery-style answers often skip ${brandName} without brand-named prompts.`;
    case "blocked":
      return `Crawl or index blockers detected — AI systems may not reliably see ${brandName}'s site.`;
  }
}

function weakLabels(readiness: AiReadinessResult | null): string[] {
  if (!readiness) return [];
  return readiness.checks
    .filter((check) => check.status !== "pass")
    .map((check) => check.label.toLowerCase())
    .slice(0, 2);
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
