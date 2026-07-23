import { describe, expect, it } from "vitest";

import {
  buildResultsCsv,
  buildResultsPdf,
  getBidiVisualTextRuns,
  normalizePdfText,
} from "./report-export";

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
      answerText: "Line one\nLine two", analysisVersion: "analysis-v2", exclusionReason: null,
    },
  }],
};

describe("report exports", () => {
  it("escapes commas, quotes, and newlines in CSV evidence", () => {
    const csv = buildResultsCsv(payload as never);
    expect(csv).toContain('"Which tool, and why?"');
    expect(csv).toContain('"A ""rival"""');
    expect(csv).toContain('"Line one\nLine two"');
  });

  it("neutralizes spreadsheet formulas in every CSV text field", () => {
    const malicious = {
      ...payload,
      rows: [{
        ...payload.rows[0],
        question: { ...payload.rows[0].question, text: "=WEBSERVICE(\"https://example.test\")" },
        result: {
          ...payload.rows[0].result,
          competitorMentions: [{ name: " @SUM(1+1)" }],
          answerText: "+cmd|' /C calc'!A0",
        },
      }],
    };

    const csv = buildResultsCsv(malicious as never);
    expect(csv).toContain("'=WEBSERVICE");
    expect(csv).toContain("' @SUM(1+1)");
    expect(csv).toContain("'+cmd|");
  });

  it("leaves analysis fields blank when analysis did not complete", () => {
    const incomplete = {
      ...payload,
      rows: [{
        ...payload.rows[0],
        question: { ...payload.rows[0].question, text: "Simple question" },
        result: {
          ...payload.rows[0].result,
          scoreEligible: false,
          targetMentioned: false,
          prominence: "absent",
          sentiment: null,
          ownedDomainCited: false,
          competitorMentions: [],
          analysisVersion: "__pending__",
          exclusionReason: "analysis_failed",
          answerText: "Provider response",
          sources: [],
        },
      }],
    };

    const cells = buildResultsCsv(incomplete as never).split("\r\n")[1].split(",");
    expect(cells.slice(6, 12)).toEqual(["", "", "", "", "", ""]);
    expect(cells[13]).toBe("Provider response");
  });

  it("preserves normalized Unicode instead of replacing it with ASCII placeholders", () => {
    expect(normalizePdfText("  Cafe\u0301 東京 مرحبا 😀  ")).toBe("Café 東京 مرحبا 😀");
  });

  it("orders mixed-direction runs visually while preserving logical Arabic for shaping", () => {
    expect(getBidiVisualTextRuns("مرحبا بالعالم — Acme 123")).toEqual([
      { text: "Acme 123", direction: "ltr" },
      { text: "مرحبا بالعالم — ", direction: "rtl" },
    ]);
    expect(getBidiVisualTextRuns("Report: مرحبا بالعالم")).toEqual([
      { text: "Report: ", direction: "ltr" },
      { text: "مرحبا بالعالم", direction: "rtl" },
    ]);
  });

  it("creates a valid PDF with Arabic, Japanese, emoji, and unsupported glyphs", async () => {
    const unicodePayload = {
      ...payload,
      run: { ...payload.run, subjectName: "Café 東京 مرحبا 😀" },
      rows: [{
        ...payload.rows[0],
        result: {
          ...payload.rows[0].result,
          answerText: "Report: مرحبا بالعالم — 東京 🚀 ✅. Unsupported: \u{10FFFF}",
        },
      }],
    };
    const pdf = await buildResultsPdf(unicodePayload as never);
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");
    expect(pdf.byteLength).toBeGreaterThan(10_000);
  });
});
