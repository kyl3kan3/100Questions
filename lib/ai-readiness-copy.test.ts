import { describe, expect, it } from "vitest";

import type { AiReadinessResult } from "./ai-readiness";
import {
  buildReadinessAgentPrompt,
  buildReadinessSuggestionCopy,
} from "./ai-readiness-copy";

const result: AiReadinessResult = {
  score: 75,
  grade: "Good, with gaps to close",
  checkedUrl: "https://northstar.example/",
  checkedAt: "2026-07-25T12:00:00.000Z",
  checks: [
    {
      id: "indexability",
      label: "Indexability",
      status: "pass",
      score: 20,
      maxScore: 20,
      evidence: "No noindex directive was detected.",
      action: null,
    },
    {
      id: "structured-data",
      label: "Structured data",
      status: "warning",
      score: 5,
      maxScore: 15,
      evidence: "No relevant JSON-LD type was detected.",
      action: "Add truthful structured data that matches the visible page.",
    },
    {
      id: "sitemap",
      label: "Sitemap discovery",
      status: "warning",
      score: 0,
      maxScore: 10,
      evidence: "No public XML sitemap was found.",
      action: "Publish an XML sitemap and reference canonical public URLs.",
    },
  ],
  topActions: [
    "Add truthful structured data that matches the visible page.",
    "Publish an XML sitemap and reference canonical public URLs.",
  ],
  detected: {
    title: "Northstar",
    description: null,
    h1: "Analytics for SaaS",
    canonical: "https://northstar.example/",
    schemaTypes: [],
    questionHeadingCount: 0,
    blockedCrawlers: [],
  },
};

describe("AI readiness copy", () => {
  it("builds a standalone suggestion with its evidence and caveat", () => {
    const copy = buildReadinessSuggestionCopy(
      result,
      result.topActions[0],
    );

    expect(copy).toContain("AI readiness suggestion for https://northstar.example/");
    expect(copy).toContain(
      "Add truthful structured data that matches the visible page.",
    );
    expect(copy).toContain("Evidence: No relevant JSON-LD type was detected.");
    expect(copy).toContain("Current check: 5/15");
    expect(copy).toContain("not proof of visibility");
  });

  it("builds a scoped implementation prompt for an AI agent", () => {
    const prompt = buildReadinessAgentPrompt(result);

    expect(prompt).toContain(
      "Improve the technical AI-search readiness of https://northstar.example/.",
    );
    expect(prompt).toContain("Current technical-readiness score: 75/100");
    expect(prompt).toContain("Area: Structured data");
    expect(prompt).toContain("Area: Sitemap discovery");
    expect(prompt).toContain("Inspect the actual code, CMS, hosting");
    expect(prompt).toContain("Do not use cloaking");
    expect(prompt).toContain("Do not claim improved ChatGPT visibility");
  });
});
