import "server-only";

import { createHash } from "node:crypto";

import { generateText, Output } from "ai";

import {
  matchBrand,
  normalizeMatchText,
  type BrandIdentity,
} from "./matching";
import { assertGatewayModelId } from "./models";
import {
  combineCostProvenance,
  combineUsage,
  getGenerationAccounting,
  type CostProvenance,
  type GenerationAccounting,
} from "./providers";
import {
  gatewayBriefOutputSchema,
  gatewayQuestionSetOutputSchema,
  parseGeneratedBrief,
  parseGeneratedQuestionSet,
} from "./question-output-schemas";
import { validateDiscoveryQuestion } from "./question-validation";

export interface QuestionGenerationInput {
  subjectName: string;
  canonicalDomain: string;
  description: string;
  aliases: string[];
  competitors: string[];
  market: string;
  locale: string;
  discoveryCount: number;
  diagnosticCount: number;
  model: string;
  gatewayUserId: string;
  runId: string;
  promptVersion: string;
}

export interface GeneratedQuestion {
  cohort: "discovery" | "diagnostic";
  category: string;
  text: string;
  sortOrder: number;
  normalizedHash: string;
}

export interface GeneratedQuestionSet {
  questions: GeneratedQuestion[];
  generatorModel: string;
  promptVersion: string;
  usage: GenerationAccounting["usage"];
  costMicros: number;
  costProvenance: CostProvenance;
  generationCallCount: number;
  gatewayGenerationIds: string[];
}

const QUESTION_TIMEOUT_MS = 90_000;
const MAX_GENERATION_PASSES = 3;

const QUESTION_SYSTEM_PROMPT = `You design neutral, reproducible benchmark questions for
measuring how web-grounded AI assistants answer category and brand research questions.
Return only the requested structured data. Questions must be natural, specific enough to
search the web, non-leading, and varied across use cases, trust, pricing, alternatives,
support, implementation, and buying criteria. Do not invent facts.`;

/**
 * Generates a two-stage, frozen question set. Discovery candidates are
 * deterministically rejected when they reveal the subject, an alias, or its
 * domain; there is no hard-coded question fallback.
 */
export async function generateBenchmarkQuestions(
  input: QuestionGenerationInput,
): Promise<GeneratedQuestionSet> {
  const model = assertGatewayModelId(input.model);
  assertCounts(input.discoveryCount, input.diagnosticCount);

  const identity: BrandIdentity = {
    canonicalName: input.subjectName,
    canonicalDomain: input.canonicalDomain,
    aliases: input.aliases,
  };
  let accounting = emptyAccounting();
  const gatewayGenerationIds: string[] = [];

  const briefResult = await generateText({
    model,
    system: QUESTION_SYSTEM_PROMPT,
    output: Output.object({ schema: gatewayBriefOutputSchema }),
    prompt: `Create a category/use-case brief that does not name or identify the subject.

Subject description: ${input.description}
Market: ${input.market}
Locale: ${input.locale}

Forbidden in the returned brief: ${formatForbiddenIdentity(identity)}. Describe only the
general category, audience needs, decision criteria, and use cases.`,
    maxOutputTokens: 1_000,
    maxRetries: 0,
    abortSignal: AbortSignal.timeout(QUESTION_TIMEOUT_MS),
    providerOptions: gatewayOptions(input, "brief"),
  });

  const briefAccounting = getGenerationAccounting(briefResult);
  accounting = mergeAccounting(accounting, briefAccounting);
  collectGenerationId(gatewayGenerationIds, briefAccounting.gatewayGenerationId);
  const brief = parseGeneratedBrief(briefResult.output);

  if (matchBrand(brief.neutralBrief, identity).mentioned) {
    throw new Error("The generated neutral brief exposed the benchmark subject");
  }

  const discovery = await generateCohort({
    input,
    model,
    cohort: "discovery",
    count: input.discoveryCount,
    brief: brief.neutralBrief,
    themes: brief.themes,
    identity,
    initialNormalized: new Set<string>(),
  });
  accounting = mergeAccounting(accounting, discovery.accounting);
  gatewayGenerationIds.push(...discovery.gatewayGenerationIds);

  const diagnostic = await generateCohort({
    input,
    model,
    cohort: "diagnostic",
    count: input.diagnosticCount,
    brief: brief.neutralBrief,
    themes: brief.themes,
    identity,
    initialNormalized: new Set(
      discovery.questions.map(({ text }) => normalizeMatchText(text)),
    ),
  });
  accounting = mergeAccounting(accounting, diagnostic.accounting);
  gatewayGenerationIds.push(...diagnostic.gatewayGenerationIds);

  const questions = [...discovery.questions, ...diagnostic.questions].map(
    (question, sortOrder) => ({
      ...question,
      sortOrder,
      normalizedHash: createHash("sha256")
        .update(normalizeMatchText(question.text), "utf8")
        .digest("hex"),
    }),
  );

  return {
    questions,
    generatorModel: model,
    promptVersion: input.promptVersion,
    usage: accounting.usage,
    costMicros: accounting.costMicros,
    costProvenance: accounting.costProvenance,
    generationCallCount: 1 + discovery.callCount + diagnostic.callCount,
    gatewayGenerationIds: [...new Set(gatewayGenerationIds)],
  };
}

interface GenerateCohortOptions {
  input: QuestionGenerationInput;
  model: string;
  cohort: "discovery" | "diagnostic";
  count: number;
  brief: string;
  themes: string[];
  identity: BrandIdentity;
  initialNormalized: Set<string>;
}

async function generateCohort(options: GenerateCohortOptions): Promise<{
  questions: Pick<GeneratedQuestion, "cohort" | "category" | "text">[];
  accounting: GenerationAccounting;
  callCount: number;
  gatewayGenerationIds: string[];
}> {
  if (options.count === 0) {
    return {
      questions: [],
      accounting: emptyAccounting(),
      callCount: 0,
      gatewayGenerationIds: [],
    };
  }

  const accepted: Pick<GeneratedQuestion, "cohort" | "category" | "text">[] = [];
  const normalized = new Set(options.initialNormalized);
  let accounting = emptyAccounting();
  let callCount = 0;
  const gatewayGenerationIds: string[] = [];

  for (
    let pass = 0;
    pass < MAX_GENERATION_PASSES && accepted.length < options.count;
    pass += 1
  ) {
    const needed = options.count - accepted.length;
    const result = await generateText({
      model: options.model,
      system: QUESTION_SYSTEM_PROMPT,
      output: Output.object({
        schema: gatewayQuestionSetOutputSchema,
      }),
      prompt: buildCohortPrompt(options, needed, accepted, pass),
      maxOutputTokens: Math.min(12_000, Math.max(1_500, needed * 105)),
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(QUESTION_TIMEOUT_MS),
      providerOptions: gatewayOptions(options.input, options.cohort),
    });

    callCount += 1;
    const generationAccounting = getGenerationAccounting(result);
    accounting = mergeAccounting(accounting, generationAccounting);
    collectGenerationId(
      gatewayGenerationIds,
      generationAccounting.gatewayGenerationId,
    );

    const output = parseGeneratedQuestionSet(result.output, needed);

    for (const candidate of output.questions) {
      const text = candidate.text.replace(/\s+/gu, " ").trim();
      const key = normalizeMatchText(text);

      if (!key || normalized.has(key)) continue;
      if (options.cohort === "discovery") {
        if (!validateDiscoveryQuestion(text, options.identity).valid) continue;
      } else {
        const brandMatch = matchBrand(text, options.identity);
        const namesCanonicalSubject = brandMatch.matches.some(
          ({ kind }) => kind === "canonical_name",
        );
        if (!namesCanonicalSubject) continue;
      }

      normalized.add(key);
      accepted.push({
        cohort: options.cohort,
        category: candidate.category.replace(/\s+/gu, " ").trim(),
        text,
      });

      if (accepted.length === options.count) break;
    }
  }

  if (accepted.length !== options.count) {
    throw new Error(
      `Question generation produced ${accepted.length}/${options.count} valid ${options.cohort} questions`,
    );
  }

  return { questions: accepted, accounting, callCount, gatewayGenerationIds };
}

function buildCohortPrompt(
  options: GenerateCohortOptions,
  needed: number,
  accepted: Pick<GeneratedQuestion, "cohort" | "category" | "text">[],
  pass: number,
): string {
  const common = `Neutral category brief: ${options.brief}
Themes: ${options.themes.join(", ")}
Market: ${options.input.market}
Locale: ${options.input.locale}
Return exactly ${needed} unique questions. Do not repeat these accepted questions:
${accepted.length > 0 ? accepted.map(({ text }) => `- ${text}`).join("\n") : "- none"}
Generation pass: ${pass + 1}`;

  if (options.cohort === "discovery") {
    return `${common}

Write neutral category-discovery questions. None may contain, hint at, or identify the
benchmark subject, its aliases, or its domain. Forbidden values:
${formatForbiddenIdentity(options.identity)}

The questions should elicit category recommendations or comparisons without leading an
assistant toward any particular company.`;
  }

  return `${common}

Write diagnostic questions that explicitly include the exact subject name
"${options.input.subjectName}". Cover trust, factual knowledge, comparisons, pricing,
support, implementation, strengths, weaknesses, and alternatives. Questions must remain
neutral rather than presupposing a positive or negative answer.`;
}

function gatewayOptions(
  input: QuestionGenerationInput,
  stage: string,
): { gateway: { user: string; tags: string[] } } {
  return {
    gateway: {
      user: input.gatewayUserId,
      tags: [
        "feature:visibility-questions",
        `stage:${stage}`,
        `prompt:${input.promptVersion}`,
      ],
    },
  };
}

function formatForbiddenIdentity(identity: BrandIdentity): string {
  return [
    identity.canonicalName,
    ...(identity.aliases ?? []),
    identity.canonicalDomain ?? "",
  ]
    .filter(Boolean)
    .map((value) => JSON.stringify(value))
    .join(", ");
}

function emptyAccounting(): GenerationAccounting {
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
    providerRequestId: null,
    gatewayRequestId: null,
  };
}

function mergeAccounting(
  current: GenerationAccounting,
  next: GenerationAccounting,
): GenerationAccounting {
  return {
    usage: combineUsage(current.usage, next.usage),
    costMicros: current.costMicros + next.costMicros,
    costProvenance: combineCostProvenance(
      current.costProvenance,
      next.costProvenance,
    ),
    gatewayGenerationId:
      next.gatewayGenerationId ?? current.gatewayGenerationId,
    providerRequestId: next.providerRequestId ?? current.providerRequestId,
    gatewayRequestId: next.gatewayRequestId ?? current.gatewayRequestId,
  };
}

function collectGenerationId(output: string[], generationId: string | null): void {
  if (generationId && !output.includes(generationId)) output.push(generationId);
}

function assertCounts(discovery: number, diagnostic: number): void {
  if (
    !Number.isSafeInteger(discovery) ||
    discovery < 0 ||
    !Number.isSafeInteger(diagnostic) ||
    diagnostic < 0 ||
    discovery + diagnostic < 1 ||
    discovery + diagnostic > 100
  ) {
    throw new RangeError("Question cohort counts must total between 1 and 100");
  }
}
