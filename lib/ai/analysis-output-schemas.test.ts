import { Output } from "ai";
import { describe, expect, it } from "vitest";

import {
  gatewayAnalysisOutputSchema,
  parseGeneratedAnalysis,
} from "./analysis-output-schemas";

const UNSUPPORTED_GATEWAY_KEYWORDS = new Set([
  "minLength",
  "maxLength",
  "minItems",
  "maxItems",
]);

describe("answer-analysis output schema", () => {
  it("keeps the Gateway contract free of unsupported constraints", async () => {
    const responseFormat = await Output.object({
      schema: gatewayAnalysisOutputSchema,
    }).responseFormat;

    if (responseFormat?.type !== "json" || !responseFormat.schema) {
      throw new Error("Expected an AI SDK JSON response format with a schema");
    }

    expect(findKeys(responseFormat.schema, UNSUPPORTED_GATEWAY_KEYWORDS)).toEqual(
      [],
    );
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
