import { describe, expect, it } from "vitest";

import {
  buildCompetitorSignals,
  buildOpportunityThemes,
  buildQuestionInsights,
  buildSourceSignals,
  summarizeQuestionInsights,
  type ResultInsightRow,
} from "./result-insights";

function row({
  questionId = "question-1",
  category = "warehouse_native",
  provider = "openai",
  mentioned = false,
  eligible = true,
  competitor = "Luminary",
  source = "https://analyticsweekly.example/guide",
}: {
  questionId?: string;
  category?: string;
  provider?: string;
  mentioned?: boolean;
  eligible?: boolean;
  competitor?: string | null;
  source?: string | null;
} = {}): ResultInsightRow {
  return {
    question: {
      id: questionId,
      text: `Buyer question ${questionId}`,
      category,
      cohort: "discovery",
      sortOrder: Number(questionId.replace(/\D/gu, "")) || 1,
    },
    job: { provider },
    result: {
      id: `${questionId}:${provider}`,
      scoreEligible: eligible,
      targetMentioned: mentioned,
      competitorMentions: competitor ? [{ name: competitor }] : [],
      sources: source ? [{ url: source }] : [],
    },
  };
}

describe("result insights", () => {
  it("groups provider answers into one question and identifies mixed agreement", () => {
    const questions = buildQuestionInsights(
      [
        row({ provider: "openai", mentioned: true }),
        row({ provider: "anthropic", mentioned: false }),
        row({ provider: "google", mentioned: true }),
        row({ provider: "xai", mentioned: false }),
      ],
      ["openai", "anthropic", "google", "xai"],
    );

    expect(questions).toHaveLength(1);
    expect(questions[0]).toMatchObject({
      providerBreadth: 4,
      attemptedProviderCount: 4,
      expectedProviderCount: 4,
      eligibleProviderCount: 4,
      mentionedProviderCount: 2,
      agreement: "mixed",
    });
  });

  it("counts distinct questions separately from grounded provider answers", () => {
    const questions = buildQuestionInsights([
      row({ questionId: "question-1", provider: "openai", mentioned: true }),
      row({ questionId: "question-1", provider: "anthropic", mentioned: true }),
      row({ questionId: "question-2", provider: "openai", mentioned: false }),
      row({ questionId: "question-2", provider: "anthropic", mentioned: false }),
    ]);

    expect(summarizeQuestionInsights(questions)).toMatchObject({
      discoveryQuestionCount: 2,
      evaluatedDiscoveryQuestionCount: 2,
      reachedDiscoveryQuestionCount: 1,
      unanimousMentionCount: 1,
      unanimousMissCount: 1,
      providerCount: 2,
      groundedProviderCount: 2,
      groundedProviderAnswerCount: 4,
    });
  });

  it("does not call partial provider coverage unanimous", () => {
    const questions = buildQuestionInsights(
      [
        row({ provider: "openai", mentioned: false }),
        row({ provider: "anthropic", mentioned: false, eligible: false }),
        row({ provider: "google", mentioned: false, eligible: false }),
        row({ provider: "xai", mentioned: false, eligible: false }),
      ],
      ["openai", "anthropic", "google", "xai"],
    );

    expect(questions[0]).toMatchObject({
      providerBreadth: 1,
      attemptedProviderCount: 4,
      expectedProviderCount: 4,
      unavailableProviderCount: 3,
      agreement: "partial",
    });
    expect(summarizeQuestionInsights(questions)).toMatchObject({
      unanimousMissCount: 0,
      partialCoverageCount: 1,
      providerCount: 4,
      groundedProviderCount: 1,
    });
  });

  it("ranks opportunity themes by missed provider answers", () => {
    const questions = buildQuestionInsights([
      row({ questionId: "question-1", category: "privacy", provider: "openai" }),
      row({ questionId: "question-1", category: "privacy", provider: "anthropic" }),
      row({ questionId: "question-2", category: "implementation", provider: "openai" }),
      row({ questionId: "question-2", category: "implementation", provider: "anthropic", mentioned: true }),
    ]);

    expect(buildOpportunityThemes(questions)).toMatchObject([
      {
        category: "Privacy",
        questionCount: 1,
        missedProviderAnswerCount: 2,
        unanimousMissCount: 1,
      },
      {
        category: "Implementation",
        questionCount: 1,
        missedProviderAnswerCount: 1,
        mixedCount: 1,
      },
    ]);
  });

  it("summarizes competitor displacement across questions and providers", () => {
    const signals = buildCompetitorSignals([
      row({ questionId: "question-1", provider: "openai" }),
      row({ questionId: "question-1", provider: "anthropic" }),
      row({ questionId: "question-2", provider: "openai", mentioned: true }),
    ]);

    expect(signals[0]).toEqual({
      name: "Luminary",
      answerCount: 3,
      questionCount: 2,
      providerCount: 2,
      displacedAnswerCount: 2,
    });
  });

  it("ranks recurring third-party sources and excludes owned domains", () => {
    const signals = buildSourceSignals(
      [
        row({ questionId: "question-1", provider: "openai" }),
        row({ questionId: "question-2", provider: "anthropic" }),
        row({
          questionId: "question-3",
          provider: "google",
          source: "https://docs.northstar.example/setup",
        }),
      ],
      "northstar.example",
    );

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      domain: "analyticsweekly.example",
      answerCount: 2,
      questionCount: 2,
      providerCount: 2,
      missedAnswerCount: 2,
    });
  });
});
