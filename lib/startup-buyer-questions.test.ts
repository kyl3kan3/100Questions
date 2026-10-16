import { describe, expect, it } from "vitest";

import {
  assertCleanBuyerQuestion,
  buildBuyerQuestionTexts,
  finalizeBuyerQuestion,
} from "./startup-buyer-questions";
import {
  buildStartupVisibilityFromReadiness,
  inferCategoryContext,
} from "./startup-chatgpt-visibility";
import type { AiReadinessResult } from "./ai-readiness";

function readinessFromMessyHomepage(
  host: string,
  detected: Partial<AiReadinessResult["detected"]>,
): AiReadinessResult {
  return {
    score: 80,
    grade: "Strong technical foundation",
    checkedUrl: `https://${host}/`,
    checkedAt: "2026-10-16T00:00:00.000Z",
    checks: [
      {
        id: "crawler-access",
        label: "AI crawler access",
        status: "pass",
        score: 15,
        maxScore: 15,
        evidence: "No blocked AI crawlers in robots.txt.",
        action: null,
      },
      {
        id: "question-content",
        label: "Question-oriented content",
        status: "warning",
        score: 5,
        maxScore: 10,
        evidence: "1 question-oriented H2/H3 heading detected.",
        action: "Add FAQ sections.",
      },
      {
        id: "structured-data",
        label: "Structured data",
        status: "pass",
        score: 15,
        maxScore: 15,
        evidence: "Detected schema types: Organization.",
        action: null,
      },
      {
        id: "page-signals",
        label: "Core page signals",
        status: "pass",
        score: 15,
        maxScore: 15,
        evidence: "Title, meta description, and H1 present.",
        action: null,
      },
      {
        id: "sitemap",
        label: "Sitemap discovery",
        status: "pass",
        score: 10,
        maxScore: 10,
        evidence: "A public XML sitemap was found.",
        action: null,
      },
      {
        id: "llms",
        label: "LLM guidance file",
        status: "warning",
        score: 0,
        maxScore: 5,
        evidence: "No llms.txt file was found.",
        action: null,
      },
    ],
    topActions: [],
    detected: {
      title: detected.title ?? null,
      description: detected.description ?? null,
      h1: detected.h1 ?? null,
      canonical: `https://${host}/`,
      schemaTypes: ["Organization"],
      questionHeadingCount: 1,
      blockedCrawlers: [],
    },
  };
}

describe("buyer question copy", () => {
  it("uses What's the best for mass-noun categories like payment infrastructure", () => {
    const [q1] = buildBuyerQuestionTexts({ label: "payment infrastructure" });
    expect(q1).toBe("What's the best payment infrastructure for a startup?");
    assertCleanBuyerQuestion(q1);
  });

  it("uses What are the best for plural tool categories", () => {
    const [q1] = buildBuyerQuestionTexts({ label: "product development tools" });
    expect(q1).toBe(
      "What are the best product development tools for a startup?",
    );
  });

  it("keeps stripe.com questions short without pasting marketing copy", () => {
    const readiness = readinessFromMessyHomepage("stripe.com", {
      title: "Stripe | Financial Infrastructure Platform",
      h1: "Financial infrastructure to grow your revenue",
      description:
        "Accept payments, handle business banking, and implement custom revenue models.",
    });
    const result = buildStartupVisibilityFromReadiness(
      { domain: "stripe.com", brandName: "Stripe", inputLabel: "stripe.com" },
      readiness,
    );

    for (const question of result.questions) {
      assertCleanBuyerQuestion(question.text);
      expect(question.text).not.toMatch(/Accept payments/i);
      expect(question.text).not.toMatch(/evaluating Financial/i);
    }
    expect(result.questions[0].text).toBe(
      "What's the best payment infrastructure for a startup?",
    );
  });

  it("dedupes linear.app headline repetition in questions", () => {
    const readiness = readinessFromMessyHomepage("linear.app", {
      title: "Linear – Plan and build products",
      h1: "The product development system for teams and agents The product development system for teams and agents The product deve",
      description: "Issue tracking for modern software teams.",
    });
    const result = buildStartupVisibilityFromReadiness(
      { domain: "linear.app", brandName: "Linear", inputLabel: "linear.app" },
      readiness,
    );

    for (const question of result.questions) {
      assertCleanBuyerQuestion(question.text);
      expect(question.text).not.toMatch(/teams and agents/i);
      expect(question.text).not.toMatch(/The product development system/i);
    }
    expect(result.questions[0].text).toContain("product development tools");
  });

  it("falls back to a plain category question for messy 100questionsai.com copy", () => {
    const readiness = readinessFromMessyHomepage("100questionsai.com", {
      title: "100 Questions — AI Visibility Benchmark Tool",
      h1: "Find where AI models overlook your brand?",
      description:
        "Run a source-backed AI visibility benchmark across OpenAI, Claude, Gemini, and Grok.",
    });
    const category = inferCategoryContext(readiness);
    expect(category.label).toBe("AI visibility benchmarking tools");

    const result = buildStartupVisibilityFromReadiness(
      {
        domain: "100questionsai.com",
        brandName: "100 Questions",
        inputLabel: "100questionsai.com",
      },
      readiness,
    );

    for (const question of result.questions) {
      assertCleanBuyerQuestion(question.text);
      expect(question.text).not.toMatch(/overlook your brand/i);
      expect(question.text).not.toMatch(/in this category/i);
    }
    expect(result.questions[0].text).toBe(
      "What are the best AI visibility benchmarking tools for a startup?",
    );
  });

  it("finalizes questions within the character budget", () => {
    const long = finalizeBuyerQuestion(
      "What are the best enterprise payment infrastructure and banking orchestration platforms for a startup team evaluating vendors",
    );
    expect(long.length).toBeLessThanOrEqual(111);
    assertCleanBuyerQuestion(long);
  });
});
