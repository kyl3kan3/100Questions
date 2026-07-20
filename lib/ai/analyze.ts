import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";

import type {
  CompetitorMention,
  NormalizedSource,
  NormalizedUsage,
} from "@/lib/db/schema";

import {
  isOwnedDomainCitation,
  matchBrand,
  normalizeMatchText,
} from "./matching";
import { assertGatewayModelId } from "./models";
import {
  getGenerationAccounting,
  type CostProvenance,
} from "./providers";

export interface AnalyzeAnswerInput {
  subjectName: string;
  canonicalDomain: string;
  aliases: string[];
  competitors: string[];
  answerText: string;
  sources: NormalizedSource[];
  model: string;
  gatewayUserId: string;
  runId: string;
  analysisVersion: string;
}

export interface AnswerAnalysis {
  targetMentioned: boolean;
  matchedAliases: string[];
  ownedDomainCited: boolean;
  prominence: "lead" | "shortlist" | "incidental" | "absent";
  sentiment: "positive" | "neutral" | "negative" | null;
  competitorMentions: CompetitorMention[];
  usage: NormalizedUsage;
  costMicros: number;
  costProvenance: CostProvenance;
  gatewayGenerationId: string | null;
  gatewayRequestId: string | null;
  providerRequestId: string | null;
  latencyMs: number;
}

const analysisSchema = z.object({
  prominence: z.enum(["lead", "shortlist", "incidental", "absent"]),
  sentiment: z.enum(["positive", "neutral", "negative"]).nullable(),
  competitors: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(150),
        sentiment: z.enum(["positive", "neutral", "negative"]).nullable(),
      }),
    )
    .max(30),
});

const ANALYSIS_TIMEOUT_MS = 55_000;
const ANALYSIS_SYSTEM_PROMPT = `You analyze a single AI answer using only the text provided.
Return structured labels, never new facts. Prominence means: lead = the target is the primary
recommendation or focus; shortlist = one of a small set of substantive recommendations;
incidental = a passing or secondary mention; absent = not mentioned. Sentiment describes
how the answer portrays the target, not the tone of the writing. Only return competitors
from the supplied detected list.`;

/**
 * Uses deterministic matching for presence/citations and structured Gateway
 * analysis only for contextual labels. Model output cannot create a mention
 * that was not present in the answer text.
 */
export async function analyzeAnswer(
  input: AnalyzeAnswerInput,
): Promise<AnswerAnalysis> {
  const model = assertGatewayModelId(input.model);
  const targetMatch = matchBrand(input.answerText, {
    canonicalName: input.subjectName,
    aliases: input.aliases,
    canonicalDomain: input.canonicalDomain,
  });
  const deterministicCompetitors = input.competitors
    .map((name) => ({
      name,
      match: matchBrand(input.answerText, { canonicalName: name }),
    }))
    .filter(({ match }) => match.mentioned);
  const ownedDomainCited = input.sources.some(({ url }) =>
    isOwnedDomainCitation(url, input.canonicalDomain),
  );

  if (!targetMatch.mentioned && deterministicCompetitors.length === 0) {
    return {
      targetMentioned: false,
      matchedAliases: [],
      ownedDomainCited,
      prominence: "absent",
      sentiment: null,
      competitorMentions: [],
      ...emptyAnalysisAccounting(),
    };
  }

  const startedAt = performance.now();
  const result = await generateText({
    model,
    system: ANALYSIS_SYSTEM_PROMPT,
    output: Output.object({ schema: analysisSchema }),
    prompt: `Target: ${input.subjectName}
Known target aliases: ${input.aliases.join(", ") || "none"}
Deterministically detected competitors: ${
      deterministicCompetitors.map(({ name }) => name).join(", ") || "none"
    }

Answer to label:
${input.answerText}`,
    maxOutputTokens: 500,
    maxRetries: 0,
    abortSignal: AbortSignal.timeout(ANALYSIS_TIMEOUT_MS),
    providerOptions: {
      gateway: {
        user: input.gatewayUserId,
        tags: [
          "feature:visibility-analysis",
          `analysis:${input.analysisVersion}`,
        ],
      },
    },
  });
  const latencyMs = Math.max(0, Math.round(performance.now() - startedAt));
  const accounting = getGenerationAccounting(result);
  const modelCompetitors = new Map(
    result.output.competitors.map((competitor) => [
      normalizeMatchText(competitor.name),
      competitor,
    ]),
  );
  const competitorMentions: CompetitorMention[] = deterministicCompetitors.map(
    ({ name, match }) => {
      const modelLabel = modelCompetitors.get(normalizeMatchText(name));
      return {
        name,
        matchedAlias: match.matchedAliases[0] ?? null,
        sentiment: modelLabel?.sentiment ?? null,
      };
    },
  );

  return {
    targetMentioned: targetMatch.mentioned,
    matchedAliases: [...targetMatch.matchedAliases],
    ownedDomainCited,
    prominence: targetMatch.mentioned ? result.output.prominence : "absent",
    sentiment: targetMatch.mentioned ? result.output.sentiment : null,
    competitorMentions,
    usage: accounting.usage,
    costMicros: accounting.costMicros,
    costProvenance: accounting.costProvenance,
    gatewayGenerationId: accounting.gatewayGenerationId,
    gatewayRequestId: accounting.gatewayRequestId,
    providerRequestId: accounting.providerRequestId,
    latencyMs,
  };
}

function emptyAnalysisAccounting(): Pick<
  AnswerAnalysis,
  | "usage"
  | "costMicros"
  | "costProvenance"
  | "gatewayGenerationId"
  | "gatewayRequestId"
  | "providerRequestId"
  | "latencyMs"
> {
  return {
    usage: {
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      reasoningTokens: null,
      cachedInputTokens: null,
      searchUses: null,
    },
    costMicros: 0,
    costProvenance: "unavailable",
    gatewayGenerationId: null,
    gatewayRequestId: null,
    providerRequestId: null,
    latencyMs: 0,
  };
}
