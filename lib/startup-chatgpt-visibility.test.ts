import { describe, expect, it } from "vitest";

import type { AiReadinessResult } from "./ai-readiness";

import {
  buildStartupVisibilityFromReadiness,
  normalizeStartupVisibilityInput,
} from "./startup-chatgpt-visibility";

function mockReadiness(score: number): AiReadinessResult {
  return {
    score,
    grade: "B",
    checkedUrl: "https://example.com/",
    checkedAt: "2026-10-16T00:00:00.000Z",
    checks: [
      {
        id: "indexability",
        label: "Indexability",
        status: "pass",
        score: 20,
        maxScore: 20,
        evidence: "ok",
        action: null,
      },
      {
        id: "crawler-access",
        label: "AI crawler access",
        status: "warning",
        score: 10,
        maxScore: 15,
        evidence: "partial",
        action: "Fix robots",
      },
    ],
    topActions: ["Fix robots"],
    detected: {
      title: "Example SaaS platform",
      description: "Software for teams",
      h1: "Example SaaS",
      canonical: "https://example.com/",
      schemaTypes: ["SoftwareApplication"],
      questionHeadingCount: 2,
      blockedCrawlers: [],
    },
  };
}

describe("startup ChatGPT visibility preview", () => {
  it("normalizes domains into brand guesses", () => {
    const normalized = normalizeStartupVisibilityInput("acme.com");
    expect(normalized.domain).toBe("acme.com");
    expect(normalized.brandName).toBe("Acme");
  });

  it("keeps brand-only input without inventing a domain", () => {
    const normalized = normalizeStartupVisibilityInput("Acme Robotics");
    expect(normalized.domain).toBeNull();
    expect(normalized.brandName).toBe("Acme Robotics");
  });

  it("labels methodology honestly and returns three sample questions", () => {
    const result = buildStartupVisibilityFromReadiness(
      normalizeStartupVisibilityInput("example.com"),
      mockReadiness(72),
    );
    expect(result.score).toBe(72);
    expect(result.methodology).toMatch(/does not query ChatGPT/i);
    expect(result.questions).toHaveLength(3);
    expect(result.questions[0].summary).not.toMatch(/ChatGPT said/i);
  });
});
