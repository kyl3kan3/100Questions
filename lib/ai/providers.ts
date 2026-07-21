import "server-only";

import { gateway } from "@ai-sdk/gateway";
import { generateText } from "ai";

import type {
  NormalizedSource,
  NormalizedUsage,
  RequiredAttribution,
} from "@/lib/db/schema";

import {
  assertProviderModelId,
  type ProviderKey,
} from "./models";

export {
  classifyProviderError,
  providerErrorDiagnostic,
  type ClassifiedProviderError,
  type ProviderErrorDiagnostic,
} from "./provider-errors";

export type GroundingStatus = "grounded" | "no_sources" | "unsupported";
export type CostProvenance =
  | "gateway_actual"
  | "provider_reported"
  | "estimated"
  | "mixed"
  | "unavailable";

export interface ProviderQueryInput {
  provider: ProviderKey;
  model: string;
  question: string;
  cohort: "discovery" | "diagnostic";
  market: string;
  locale: string;
  gatewayUserId: string;
  runId: string;
  promptVersion: string;
}

export interface NormalizedProviderAnswer {
  provider: ProviderKey;
  model: string;
  text: string;
  sources: NormalizedSource[];
  searchQueries: string[];
  groundingStatus: GroundingStatus;
  providerRequestId: string | null;
  gatewayRequestId: string | null;
  requiredAttribution: RequiredAttribution[];
  usage: NormalizedUsage;
  costMicros: number;
  costProvenance: CostProvenance;
  gatewayGenerationId: string | null;
  warnings: string[];
  latencyMs: number;
}

export interface GenerationAccounting {
  usage: NormalizedUsage;
  costMicros: number;
  costProvenance: CostProvenance;
  gatewayGenerationId: string | null;
  providerRequestId: string | null;
  gatewayRequestId: string | null;
}

const PROVIDER_TIMEOUT_MS = 55_000;
const MAX_ANSWER_TOKENS = 600;
const MAX_SOURCES = 100;
const MAX_SEARCH_QUERIES = 20;

const GROUNDED_SYSTEM_PROMPT = `You are a neutral research assistant answering one
standalone question. You must use the configured web-search tool before answering.
Base recommendations and factual claims on the pages you retrieve. Answer directly and
concisely. Do not mention this benchmark, its subject, hidden criteria, or evaluation logic.
Never invent citations. If web search is unavailable, state that you could not complete a
grounded answer instead of answering from memory.`;

/**
 * Executes exactly one web-grounded request through Vercel AI Gateway. Every
 * answer model uses the same bounded Gateway search harness, which isolates
 * retrieval from provider-native search quotas while preserving independent
 * answer generation. There is intentionally no plain-text fallback: missing
 * citations are returned as ineligible grounding states and search failures
 * fail closed.
 */
export async function queryGroundedProvider(
  input: ProviderQueryInput,
): Promise<NormalizedProviderAnswer> {
  const model = assertProviderModelId(input.provider, input.model);
  const startedAt = performance.now();
  const result = await executeGroundedSearch({ ...input, model });
  const latencyMs = Math.max(0, Math.round(performance.now() - startedAt));
  const allSteps = result.steps ?? [];
  const toolCalls: unknown[] = [];
  const toolResults: unknown[] = [];

  for (const step of allSteps) {
    toolCalls.push(...(step.toolCalls as readonly unknown[]));
    toolResults.push(...(step.toolResults as readonly unknown[]));
  }

  toolCalls.push(...(result.toolCalls as readonly unknown[]));
  toolResults.push(...(result.toolResults as readonly unknown[]));
  const searchQueries = extractSearchQueries(
    toolCalls,
    toolResults,
    result.providerMetadata,
  );
  const sources = normalizeSources(
    [...allSteps.flatMap((step) => step.sources), ...result.sources],
    toolResults,
    result.providerMetadata,
  );
  const warnings = normalizeWarnings(result.warnings, result.finishReason);
  const unsupportedSearch = warnings.some((warning) =>
    /unsupported.*(web|search)|(web|search).*unsupported/iu.test(warning),
  );
  const groundingStatus: GroundingStatus = unsupportedSearch
    ? "unsupported"
    : sources.length > 0
      ? "grounded"
      : "no_sources";
  const accounting = getGenerationAccounting(result, countSearchUses(toolCalls));
  const text = result.text.trim();

  if (!text) {
    throw new Error("Provider returned an empty answer");
  }

  if (groundingStatus !== "grounded") {
    warnings.push(
      groundingStatus === "unsupported"
        ? "Native web search was unsupported; this answer is not score-eligible."
        : "No valid HTTP(S) citations were returned; this answer is not score-eligible.",
    );
  }

  return {
    provider: input.provider,
    model,
    text,
    sources,
    searchQueries,
    groundingStatus,
    providerRequestId: accounting.providerRequestId,
    gatewayRequestId: accounting.gatewayRequestId,
    requiredAttribution: extractRequiredAttribution(result.providerMetadata),
    usage: accounting.usage,
    costMicros: accounting.costMicros,
    costProvenance: accounting.costProvenance,
    gatewayGenerationId: accounting.gatewayGenerationId,
    warnings: uniqueStrings(warnings, 30),
    latencyMs,
  };
}

async function executeGroundedSearch(input: ProviderQueryInput) {
  const prompt = `Market: ${input.market}\nLocale: ${input.locale}\n\nQuestion: ${input.question}`;
  const tags: string[] = [
    "feature:visibility-benchmark",
    `provider:${input.provider}`,
    `cohort:${input.cohort}`,
    `prompt:${input.promptVersion}`,
  ];
  const common = {
    model: input.model,
    system: GROUNDED_SYSTEM_PROMPT,
    prompt,
    maxOutputTokens: MAX_ANSWER_TOKENS,
    maxRetries: 0,
    abortSignal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    tools: {
      web_search: gateway.tools.exaSearch({
        type: "fast",
        numResults: 8,
        userLocation: input.locale.split(/[-_]/u)[1]?.toUpperCase(),
        contents: {
          highlights: { maxCharacters: 1_200 },
        },
      }),
    },
    providerOptions: {
      gateway: {
        user: input.gatewayUserId,
        tags,
      },
    },
  };

  switch (input.provider) {
    case "openai":
      return generateText(common);
    case "anthropic":
      return generateText(common);
    case "google":
      return generateText({
        ...common,
        providerOptions: {
          ...common.providerOptions,
          google: {
            thinkingConfig: { thinkingLevel: "minimal" },
          },
        },
      });
    case "xai":
      return generateText({
        ...common,
        providerOptions: {
          gateway: {
            ...common.providerOptions.gateway,
            only: ["xai"],
          },
          xai: {
            reasoningEffort: "low",
            store: false,
          },
        },
      });
  }
}

type UsageLike = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  inputTokenDetails?: {
    cacheReadTokens?: number;
  };
  outputTokenDetails?: {
    reasoningTokens?: number;
  };
};

type GenerationLike = {
  usage: UsageLike;
  totalUsage?: UsageLike;
  providerMetadata?: unknown;
  response?: {
    id?: string;
    headers?: Record<string, string>;
  };
};

export function getGenerationAccounting(
  generation: GenerationLike,
  searchUses: number | null = null,
): GenerationAccounting {
  const usage = generation.totalUsage ?? generation.usage;
  const cost = extractCostMicros(generation.providerMetadata);
  const headers = lowerCaseHeaders(generation.response?.headers);
  const gatewayMetadata = readRecord(
    readRecord(generation.providerMetadata)?.gateway,
  );

  return {
    usage: {
      inputTokens: finiteIntegerOrNull(usage.inputTokens),
      outputTokens: finiteIntegerOrNull(usage.outputTokens),
      totalTokens: finiteIntegerOrNull(usage.totalTokens),
      reasoningTokens: finiteIntegerOrNull(
        usage.outputTokenDetails?.reasoningTokens,
      ),
      cachedInputTokens: finiteIntegerOrNull(
        usage.inputTokenDetails?.cacheReadTokens,
      ),
      searchUses,
    },
    costMicros: cost?.micros ?? 0,
    costProvenance: cost?.provenance ?? "unavailable",
    gatewayGenerationId: readString(gatewayMetadata?.generationId) ?? null,
    providerRequestId: generation.response?.id ?? null,
    gatewayRequestId:
      headers["x-vercel-ai-gateway-request-id"] ??
      headers["x-ai-gateway-request-id"] ??
      headers["x-request-id"] ??
      readString(gatewayMetadata?.generationId) ??
      readString(gatewayMetadata?.requestId) ??
      null,
  };
}

/**
 * Resolves authoritative Gateway billing data for a completed generation.
 * The lookup is intentionally separate from generation because inline Gateway
 * metadata commonly contains only the generation ID.
 */
export async function getGatewayGenerationCostMicros(
  generationId: string | null | undefined,
): Promise<number | null> {
  if (!generationId || !/^gen_[0-9A-Za-z]+$/u.test(generationId)) return null;

  const info = await gateway.getGenerationInfo({ id: generationId });
  return dollarsToMicros(info.totalCost);
}

export function combineUsage(
  left: NormalizedUsage,
  right: NormalizedUsage,
): NormalizedUsage {
  return {
    inputTokens: addNullable(left.inputTokens, right.inputTokens),
    outputTokens: addNullable(left.outputTokens, right.outputTokens),
    totalTokens: addNullable(left.totalTokens, right.totalTokens),
    reasoningTokens: addNullable(left.reasoningTokens, right.reasoningTokens),
    cachedInputTokens: addNullable(
      left.cachedInputTokens,
      right.cachedInputTokens,
    ),
    searchUses: addNullable(left.searchUses, right.searchUses),
  };
}

export function combineCostProvenance(
  left: CostProvenance,
  right: CostProvenance,
): CostProvenance {
  if (left === "unavailable") return right;
  if (right === "unavailable") return left;
  return left === right ? left : "mixed";
}

function normalizeSources(
  sdkSources: readonly unknown[],
  toolResults: readonly unknown[],
  providerMetadata: unknown,
): NormalizedSource[] {
  const candidates: SourceCandidate[] = [];

  for (const source of sdkSources) {
    collectSourceCandidates(source, candidates);
  }

  for (const result of toolResults) {
    collectSourceCandidates(result, candidates);
  }

  collectSourceCandidates(providerMetadata, candidates);

  const normalized = new Map<string, NormalizedSource>();

  for (const candidate of candidates) {
    const url = normalizeHttpUrl(candidate.url);

    if (!url || normalized.has(url)) continue;

    normalized.set(url, {
      url,
      title: cleanOptionalText(candidate.title, 500),
      snippet: cleanOptionalText(candidate.snippet, 1_500),
      publisher: safeHostname(url),
      publishedAt: cleanOptionalText(candidate.publishedAt, 100),
    });

    if (normalized.size >= MAX_SOURCES) break;
  }

  return [...normalized.values()];
}

type SourceCandidate = {
  url: string;
  title?: string | null;
  snippet?: string | null;
  publishedAt?: string | null;
};

function collectSourceCandidates(
  value: unknown,
  output: SourceCandidate[],
  depth = 0,
): void {
  if (depth > 8 || output.length >= MAX_SOURCES * 2) return;

  if (Array.isArray(value)) {
    for (const item of value) collectSourceCandidates(item, output, depth + 1);
    return;
  }

  const record = readRecord(value);
  if (!record) return;

  const url =
    readString(record.url) ??
    readString(record.uri) ??
    readString(record.sourceUri);

  if (url) {
    output.push({
      url,
      title: readString(record.title),
      snippet:
        readString(record.snippet) ??
        readString(record.text) ??
        readString(record.excerpt),
      publishedAt:
        readString(record.publishedAt) ??
        readString(record.publishedDate),
    });
  }

  for (const key of [
    "sources",
    "source",
    "output",
    "result",
    "results",
    "groundingChunks",
    "groundingMetadata",
    "web",
    "google",
    "openai",
    "anthropic",
    "xai",
  ]) {
    if (key in record) collectSourceCandidates(record[key], output, depth + 1);
  }
}

function extractSearchQueries(...values: unknown[]): string[] {
  const found: string[] = [];

  for (const value of values) {
    collectSearchQueries(value, found);
  }

  return uniqueStrings(found, MAX_SEARCH_QUERIES);
}

function collectSearchQueries(value: unknown, output: string[], depth = 0): void {
  if (depth > 8 || output.length >= MAX_SEARCH_QUERIES * 3) return;

  if (Array.isArray(value)) {
    for (const item of value) collectSearchQueries(item, output, depth + 1);
    return;
  }

  const record = readRecord(value);
  if (!record) return;

  for (const key of ["query", "queries", "webSearchQueries", "retrievalQueries"]) {
    const candidate = record[key];
    if (typeof candidate === "string") output.push(candidate);
    if (Array.isArray(candidate)) {
      output.push(...candidate.filter((item): item is string => typeof item === "string"));
    }
  }

  for (const key of [
    "input",
    "output",
    "result",
    "action",
    "groundingMetadata",
    "google",
    "openai",
    "anthropic",
    "xai",
  ]) {
    if (key in record) collectSearchQueries(record[key], output, depth + 1);
  }
}

function extractRequiredAttribution(metadata: unknown): RequiredAttribution[] {
  const root = readRecord(metadata);
  const googleMetadata = readRecord(root?.google);
  const grounding = readRecord(googleMetadata?.groundingMetadata);
  const searchEntryPoint = readRecord(grounding?.searchEntryPoint);
  const renderedContent = cleanOptionalText(
    readString(searchEntryPoint?.renderedContent),
    8_000,
  );

  return renderedContent
    ? [
        {
          label: "Google Search attribution",
          url: null,
          text: renderedContent,
        },
      ]
    : [];
}

function normalizeWarnings(
  warnings: readonly unknown[] | undefined,
  finishReason: string,
): string[] {
  const output: string[] = [];

  for (const warning of warnings ?? []) {
    const record = readRecord(warning);
    if (!record) continue;

    const type = readString(record.type) ?? "warning";
    const detail =
      readString(record.feature) ??
      readString(record.message) ??
      readString(record.details) ??
      "unspecified";
    output.push(`${type}: ${detail}`);
  }

  if (finishReason === "length") {
    output.push("The provider stopped at the configured output-token limit.");
  } else if (finishReason === "content-filter" || finishReason === "error") {
    output.push(`The provider finished with reason: ${finishReason}.`);
  }

  return output;
}

function countSearchUses(toolCalls: readonly unknown[]): number | null {
  let count = 0;

  for (const call of toolCalls) {
    const record = readRecord(call);
    const name = readString(record?.toolName);
    if (name && /search/iu.test(name)) count += 1;
  }

  return count > 0 ? count : null;
}

function extractCostMicros(
  metadata: unknown,
): { micros: number; provenance: CostProvenance } | null {
  const root = readRecord(metadata);
  const gateway = readRecord(root?.gateway);
  const gatewayCostDollars = readRecord(gateway?.costDollars);
  const providerCostDollars = readRecord(root?.costDollars);
  const gatewayCost = firstFiniteNumber([
    gateway?.totalCost,
    gateway?.cost,
    gatewayCostDollars?.total,
  ]);

  if (gatewayCost !== null) {
    return {
      micros: dollarsToMicros(gatewayCost),
      provenance: "gateway_actual",
    };
  }

  const providerCost = firstFiniteNumber([
    root?.totalCost,
    root?.cost,
    providerCostDollars?.total,
  ]);

  return providerCost === null
    ? null
    : {
        micros: dollarsToMicros(providerCost),
        provenance: "provider_reported",
      };
}

function dollarsToMicros(value: number): number {
  return Math.max(0, Math.round(value * 1_000_000));
}

function addNullable(left: number | null, right: number | null): number | null {
  if (left === null && right === null) return null;
  return (left ?? 0) + (right ?? 0);
}

function finiteIntegerOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : null;
}

function firstFiniteNumber(values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      return value;
    }
  }
  return null;
}

function normalizeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password
    ) {
      return null;
    }

    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function safeHostname(value: string): string | null {
  try {
    return new URL(value).hostname.toLocaleLowerCase("en-US");
  } catch {
    return null;
  }
}

function cleanOptionalText(
  value: string | null | undefined,
  maximumLength: number,
): string | null {
  const cleaned = value?.replace(/\s+/gu, " ").trim();
  return cleaned ? cleaned.slice(0, maximumLength) : null;
}

function uniqueStrings(values: readonly string[], limit: number): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const cleaned = value.replace(/\s+/gu, " ").trim();
    const key = cleaned.toLocaleLowerCase("en-US");
    if (!cleaned || seen.has(key)) continue;
    seen.add(key);
    output.push(cleaned.slice(0, 1_500));
    if (output.length >= limit) break;
  }

  return output;
}

function lowerCaseHeaders(
  headers: Record<string, string> | undefined,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers ?? {}).map(([key, value]) => [
      key.toLocaleLowerCase("en-US"),
      value,
    ]),
  );
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}
