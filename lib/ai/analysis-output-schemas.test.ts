import { Output } from "ai";
import { describe, expect, it } from "vitest";

import {
  gatewayAnalysisOutputSchema,
  gatewayAnalysisWithPickOutputSchema,
  parseGeneratedAnalysis,
  readCompetingPick,
} from "./analysis-output-schemas";

const UNSUPPORTED_GATEWAY_KEYWORDS = new Set([
  "minLength",
  "maxLength",
  "minItems",
  "maxItems",
]);

describe("answer-analysis output schema", () => {
  it.each([gatewayAnalysisOutputSchema, gatewayAnalysisWithPickOutputSchema])("keeps the Gateway contract free of unsupported constraints", async (schema) => {
    const responseFormat = await Output.object({
      schema,
    }).responseFormat;

    if (responseFormat?.type !== "json" || !responseFormat.schema) {
      throw new Error("Expected an AI SDK JSON response format with a schema");
    }

    expect(findKeys(responseFormat.schema, UNSUPPORTED_GATEWAY_KEYWORDS)).toEqual(
      [],
    );
  });

  it("keeps an unlisted competitor only with a verbatim quote naming the pick", () => {
    const target = { canonicalName: "Acme Suite", aliases: ["ACM"], canonicalDomain: "acme.test" };
    const answer = "I would choose Other Co over ACM for this buyer.";
    expect(readCompetingPick({ competingPick: { name: "Other Co", quote: answer } }, answer, target))
      .toEqual({ name: "Other Co", quote: answer });
    for (const competingPick of [
      null,
      { name: "Other Co", quote: "Other Co is the top pick." },
      { name: "Different Co", quote: answer },
      { name: "ACM", quote: answer },
    ]) {
      expect(readCompetingPick({ competingPick }, answer, target)).toBeNull();
    }
  });

  it("enforces competitor limits locally and trims accepted names", () => {
    expect(
      parseGeneratedAnalysis({
        prominence: "shortlist",
        sentiment: "positive",
        competitors: [{ name: " Example Co ", sentiment: "neutral" }],
      }),
    ).toEqual({
      prominence: "shortlist",
      sentiment: "positive",
      competitors: [{ name: "Example Co", sentiment: "neutral" }],
    });

    expect(() =>
      parseGeneratedAnalysis({
        prominence: "lead",
        sentiment: null,
        competitors: Array.from({ length: 31 }, (_, index) => ({
          name: `Competitor ${index}`,
          sentiment: null,
        })),
      }),
    ).toThrow();
    expect(() =>
      parseGeneratedAnalysis({
        prominence: "lead",
        sentiment: null,
        competitors: [{ name: " ", sentiment: null }],
      }),
    ).toThrow();
  });
});

function findKeys(value: unknown, targets: ReadonlySet<string>): string[] {
  if (!value || typeof value !== "object") return [];

  const matches: string[] = [];
  for (const [key, nested] of Object.entries(value)) {
    if (targets.has(key)) matches.push(key);
    matches.push(...findKeys(nested, targets));
  }
  return matches;
}
