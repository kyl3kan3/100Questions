import { Output } from "ai";
import { describe, expect, it } from "vitest";

import {
  gatewayBriefOutputSchema,
  gatewayQuestionSetOutputSchema,
  parseGeneratedBrief,
  parseGeneratedQuestionSet,
} from "./question-output-schemas";

const UNSUPPORTED_GATEWAY_KEYWORDS = new Set([
  "minLength",
  "maxLength",
  "minItems",
  "maxItems",
]);

describe("question-generation output schemas", () => {
  it("keeps Gateway contracts free of unsupported constraints", async () => {
    const responseFormats = await Promise.all([
      Output.object({ schema: gatewayBriefOutputSchema }).responseFormat,
      Output.object({ schema: gatewayQuestionSetOutputSchema }).responseFormat,
    ]);

    for (const responseFormat of responseFormats) {
      if (responseFormat?.type !== "json" || !responseFormat.schema) {
        throw new Error("Expected an AI SDK JSON response format with a schema");
      }

      expect(responseFormat.schema).toMatchObject({
        type: "object",
        additionalProperties: false,
      });
      expect(
        findKeys(responseFormat.schema, UNSUPPORTED_GATEWAY_KEYWORDS),
      ).toEqual([]);
    }
  });

  it("enforces brief constraints locally and trims accepted output", () => {
    expect(
      parseGeneratedBrief({
        neutralBrief:
          "  Analytics platforms for growing retail teams evaluating reporting tools.  ",
        themes: [" Reporting ", "Integrations", "Support"],
      }),
    ).toEqual({
      neutralBrief:
        "Analytics platforms for growing retail teams evaluating reporting tools.",
      themes: ["Reporting", "Integrations", "Support"],
    });

    expect(() =>
      parseGeneratedBrief({
        neutralBrief: "Too short",
        themes: ["Only", "Two"],
      }),
    ).toThrow();
  });

  it("enforces question content and the requested count locally", () => {
    const validQuestion = {
      category: "Pricing",
      text: "Which analytics tools offer predictable pricing for small teams?",
    };

    expect(parseGeneratedQuestionSet({ questions: [validQuestion] }, 1)).toEqual({
      questions: [validQuestion],
    });
    expect(() =>
      parseGeneratedQuestionSet({ questions: [validQuestion] }, 2),
    ).toThrow();
    expect(() =>
      parseGeneratedQuestionSet(
        { questions: [{ category: "A", text: "Too short" }] },
        1,
      ),
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
