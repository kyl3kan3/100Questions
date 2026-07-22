import { describe, expect, it } from "vitest";

import { buildResultsCsv, buildResultsPdf } from "./report-export";

const payload = {
  run: { subjectName: "Acme", questionCountPlanned: 25, providerCallsPlanned: 100 },
  actionPlan: [],
  rows: [{
    question: { text: "Which tool, and why?", cohort: "discovery", category: "fit", sortOrder: 1 },
    job: { provider: "openai", status: "succeeded", errorMessage: null },
    result: {
      groundingStatus: "grounded", scoreEligible: true, targetMentioned: true,
      prominence: "primary", sentiment: "positive", ownedDomainCited: false,
      competitorMentions: [{ name: "A \"rival\"" }], sources: [{ url: "https://example.com/a,b" }],
      answerText: "Line one\nLine two",
    },
  }],
} as never;

describe("report exports", () => {
  it("escapes commas, quotes, and newlines in CSV evidence", () => {
    const csv = buildResultsCsv(payload);
    expect(csv).toContain('"Which tool, and why?"');
    expect(csv).toContain('"A ""rival"""');
    expect(csv).toContain('"Line one\nLine two"');
  });

  it("creates a valid PDF document", async () => {
    const pdf = await buildResultsPdf(payload);
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");
    expect(pdf.byteLength).toBeGreaterThan(500);
  });
});
