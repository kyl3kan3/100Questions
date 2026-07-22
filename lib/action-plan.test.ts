import { describe, expect, it } from "vitest";

import { buildActionPlan, type ActionPlanEvidenceRow } from "./action-plan";

const row = (overrides: Partial<ActionPlanEvidenceRow> = {}): ActionPlanEvidenceRow => ({
  resultId: crypto.randomUUID(),
  questionId: crypto.randomUUID(),
  questionText: "Which analytics tool is best for warehouse-native reporting?",
  category: "warehouse_native",
  cohort: "discovery",
  scoreEligible: true,
  targetMentioned: false,
  prominence: "absent",
  ownedDomainCited: false,
  competitorMentions: [{ name: "Luminary", matchedAlias: "Luminary", sentiment: "positive" }],
  sources: [{ url: "https://analyticsweekly.example/guides/warehouse", title: "Guide", publisher: "Analytics Weekly", snippet: null, publishedAt: null }],
  ...overrides,
});

describe("buildActionPlan", () => {
  it("returns only evidence-linked recommendations in ranked order", () => {
    const rows = [row({ resultId: "result-1" }), row({ resultId: "result-2" }), row({ resultId: "result-3" })];
    const plan = buildActionPlan(rows, "northstar.example");
    expect(plan.length).toBeGreaterThan(0);
    expect(plan.length).toBeLessThanOrEqual(5);
    expect(plan.map((item) => item.rank)).toEqual(plan.map((_, index) => index + 1));
    expect(plan.every((item) => item.evidenceResultIds.length > 0)).toBe(true);
    expect(plan[0]?.evidenceResultIds).toContain("result-1");
    expect(plan.some((item) => item.sourceUrls.includes("https://analyticsweekly.example/guides/warehouse"))).toBe(true);
  });

  it("does not recommend from ineligible evidence", () => {
    expect(buildActionPlan([row({ scoreEligible: false })], "northstar.example")).toEqual([]);
  });

  it("does not treat owned subdomains as third-party authority sources", () => {
    const plan = buildActionPlan([row({ sources: [{ url: "https://docs.northstar.example/setup", title: null, publisher: null, snippet: null, publishedAt: null }] })], "northstar.example");
    expect(plan.some((item) => item.category === "authority_source")).toBe(false);
  });

  it("does not treat four provider answers to one question as four findings", () => {
    const questionId = "question-1";
    const plan = buildActionPlan(
      [
        row({ resultId: "result-1", questionId }),
        row({ resultId: "result-2", questionId }),
        row({ resultId: "result-3", questionId }),
        row({ resultId: "result-4", questionId }),
      ],
      "northstar.example",
    );
    const contentGap = plan.find((item) => item.category === "content_gap");

    expect(contentGap).toMatchObject({ confidence: "low" });
    expect(contentGap?.rationale).toContain("1 discovery question");
    expect(contentGap?.evidenceResultIds).toHaveLength(4);
  });

  it("raises confidence only when evidence spans distinct questions", () => {
    const plan = buildActionPlan(
      [
        row({ resultId: "result-1", questionId: "question-1" }),
        row({ resultId: "result-2", questionId: "question-2" }),
        row({ resultId: "result-3", questionId: "question-3" }),
        row({ resultId: "result-4", questionId: "question-4" }),
      ],
      "northstar.example",
    );

    expect(plan.find((item) => item.category === "content_gap")).toMatchObject({
      confidence: "high",
    });
  });
});
