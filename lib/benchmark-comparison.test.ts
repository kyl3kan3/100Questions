import { describe, expect, it } from "vitest";

import {
  changedModels,
  compareBenchmarkSummaries,
  summarizeBenchmark,
} from "./benchmark-comparison";

function row({
  cohort = "discovery",
  provider = "openai",
  eligible = true,
  mentioned = false,
  cited = false,
  competitors = [],
}: {
  cohort?: "discovery" | "diagnostic";
  provider?: string;
  eligible?: boolean;
  mentioned?: boolean;
  cited?: boolean;
  competitors?: string[];
} = {}) {
  return {
    question: { cohort },
    job: { provider },
    result: {
      scoreEligible: eligible,
      targetMentioned: mentioned,
      prominence: mentioned ? ("lead" as const) : ("absent" as const),
      ownedDomainCited: cited,
      sentiment: null,
      competitorMentions: competitors.map((name) => ({ name })),
    },
  };
}

describe("benchmark comparison", () => {
  it("summarizes a completed snapshot with explicit denominators", () => {
    const summary = summarizeBenchmark({
      run: {
        discoveryCountPlanned: 2,
        diagnosticCountPlanned: 1,
      },
      rows: [
        row({
          mentioned: true,
          cited: true,
          competitors: ["Rival One", "RIVAL ONE"],
        }),
        row({ competitors: ["Rival Two"] }),
        row({ cohort: "diagnostic", cited: true }),
      ],
    });

    expect(summary).toEqual({
      visibility: 0.5,
      citations: 2 / 3,
      coverage: 1,
      competitorMentions: 2,
    });
  });

  it("computes point and count movement from the baseline", () => {
    const comparison = compareBenchmarkSummaries(
      {
        visibility: 0.25,
        citations: null,
        coverage: 0.9,
        competitorMentions: 8,
      },
      {
        visibility: 0.5,
        citations: 0.2,
        coverage: 1,
        competitorMentions: 5,
      },
    );

    expect(comparison).toMatchObject({
      visibility: { baseline: 0.25, current: 0.5, delta: 0.25 },
      citations: { baseline: null, current: 0.2, delta: null },
      coverage: { baseline: 0.9, current: 1 },
      competitorMentions: { baseline: 8, current: 5, delta: -3 },
    });
    expect(comparison.coverage.delta).toBeCloseTo(0.1);
  });

  it("identifies provider model changes between snapshots", () => {
    expect(
      changedModels(
        { openai: "gpt-old", google: "gemini-same" },
        { openai: "gpt-new", google: "gemini-same", xai: "grok-new" },
      ),
    ).toEqual([
      { key: "openai", baseline: "gpt-old", current: "gpt-new" },
      { key: "xai", baseline: null, current: "grok-new" },
    ]);
  });
});
