import { describe, expect, it } from "vitest";

import {
  computeBenchmarkMetrics,
  computeProminence,
  computeSentiment,
  ratioMetric,
  type MetricObservation,
} from "./metrics";

const discovery = (
  overrides: Partial<MetricObservation> = {},
): MetricObservation => ({
  cohort: "discovery",
  eligible: true,
  targetMentioned: false,
  prominence: "absent",
  ownedDomainCited: false,
  competitorMentions: [],
  sentiment: null,
  ...overrides,
});

const diagnostic = (
  overrides: Partial<MetricObservation> = {},
): MetricObservation => ({
  ...discovery(overrides),
  cohort: "diagnostic",
});

describe("ratioMetric", () => {
  it("returns null rather than zero for an empty denominator", () => {
    expect(ratioMetric(0, 0)).toEqual({
      numerator: 0,
      denominator: 0,
      value: null,
    });
  });

  it("rejects invalid counts", () => {
    expect(() => ratioMetric(2, 1)).toThrow(RangeError);
    expect(() => ratioMetric(-1, 2)).toThrow(RangeError);
    expect(() => ratioMetric(0.5, 2)).toThrow(RangeError);
  });
});

describe("computeBenchmarkMetrics", () => {
  it("uses explicit, cohort-safe denominators", () => {
    const observations = [
      discovery({
        targetMentioned: true,
        prominence: "lead",
        ownedDomainCited: true,
        competitorMentions: ["Rival One", "RIVAL-ONE", "Rival Two"],
        sentiment: "positive",
      }),
      discovery({ competitorMentions: ["Rival One"] }),
      discovery({ eligible: false }),
      diagnostic({
        targetMentioned: true,
        prominence: "lead",
        ownedDomainCited: true,
        sentiment: "negative",
      }),
    ];

    const metrics = computeBenchmarkMetrics(observations, {
      discovery: 3,
      diagnostic: 1,
    });

    expect(metrics.coverage).toMatchObject({
      numerator: 3,
      denominator: 4,
      value: 0.75,
    });
    expect(metrics.discoveryVisibility).toMatchObject({
      numerator: 1,
      denominator: 2,
      value: 0.5,
    });
    expect(metrics.conservativeVisibilityFloor).toMatchObject({
      numerator: 1,
      denominator: 3,
      value: 1 / 3,
    });
    // Diagnostic prompts do not inflate discovery prominence or share of voice.
    expect(metrics.prominence).toMatchObject({
      total: 1,
      denominator: 2,
      value: 0.5,
      missing: 0,
    });
    expect(metrics.shareOfVoice).toMatchObject({
      targetEvents: 1,
      competitorEvents: 3,
      numerator: 1,
      denominator: 4,
      value: 0.25,
    });
    expect(metrics.claimedDomainCitationRate).toMatchObject({
      numerator: 2,
      denominator: 3,
      value: 2 / 3,
    });
    expect(metrics.sentiment.positive.value).toBe(0.5);
    expect(metrics.sentiment.negative.value).toBe(0.5);
    expect(metrics.provisional).toBe(true);
  });

  it("does not let ungrounded target mentions enter score numerators", () => {
    const metrics = computeBenchmarkMetrics(
      [
        discovery({
          eligible: false,
          targetMentioned: true,
          prominence: "lead",
          ownedDomainCited: true,
          sentiment: "positive",
        }),
      ],
      { discovery: 1, diagnostic: 0 },
    );

    expect(metrics.coverage.value).toBe(0);
    expect(metrics.discoveryVisibility.value).toBeNull();
    expect(metrics.conservativeVisibilityFloor.value).toBe(0);
    expect(metrics.claimedDomainCitationRate.value).toBeNull();
    expect(metrics.sentiment.denominator).toBe(0);
  });

  it("returns null scoring metrics for a benchmark with no planned answers", () => {
    const metrics = computeBenchmarkMetrics([], {
      discovery: 0,
      diagnostic: 0,
    });

    expect(metrics.coverage.value).toBeNull();
    expect(metrics.discoveryVisibility.value).toBeNull();
    expect(metrics.conservativeVisibilityFloor.value).toBeNull();
    expect(metrics.prominence.value).toBeNull();
    expect(metrics.shareOfVoice.value).toBeNull();
    expect(metrics.claimedDomainCitationRate.value).toBeNull();
    expect(metrics.provisional).toBe(true);
  });

  it("marks exactly-threshold coverage as non-provisional", () => {
    const observations = Array.from({ length: 10 }, (_, index) =>
      discovery({ eligible: index < 9 }),
    );

    expect(
      computeBenchmarkMetrics(
        observations,
        { discovery: 10, diagnostic: 0 },
        0.9,
      ).provisional,
    ).toBe(false);
  });

  it("rejects observed counts that exceed the frozen plan", () => {
    expect(() =>
      computeBenchmarkMetrics([discovery(), discovery()], {
        discovery: 1,
        diagnostic: 0,
      }),
    ).toThrow(RangeError);

    expect(() =>
      computeBenchmarkMetrics([discovery(), diagnostic(), diagnostic()], {
        discovery: 2,
        diagnostic: 1,
      }),
    ).toThrow("Observed diagnostic answers cannot exceed planned diagnostic answers.");
  });
});

describe("analysis edge cases", () => {
  it("reports missing prominence analysis without treating it as absent", () => {
    expect(
      computeProminence([
        discovery({ targetMentioned: true, prominence: null }),
        discovery({ targetMentioned: false, prominence: null }),
      ]),
    ).toEqual({ total: 0, denominator: 1, value: 0, missing: 1 });
  });

  it("keeps unknown sentiment visible in the mentioned-answer denominator", () => {
    const sentiment = computeSentiment([
      discovery({ targetMentioned: true, sentiment: "positive" }),
      discovery({ targetMentioned: true, sentiment: null }),
      discovery({ targetMentioned: false, sentiment: "negative" }),
    ]);

    expect(sentiment.denominator).toBe(2);
    expect(sentiment.positive.value).toBe(0.5);
    expect(sentiment.negative.value).toBe(0);
    expect(sentiment.unknown.value).toBe(0.5);
  });
});
