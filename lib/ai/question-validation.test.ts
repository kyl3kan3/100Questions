import { describe, expect, it } from "vitest";

import {
  isValidDiscoveryQuestion,
  validateDiscoveryQuestion,
} from "./question-validation";

const brand = {
  canonicalName: "Café Acme",
  aliases: ["Acme Labs", "A&B"],
  canonicalDomain: "https://www.acme.example",
};

describe("validateDiscoveryQuestion", () => {
  it.each([
    "Is CAFE ACME a good analytics tool?",
    "How does Acme—Labs compare?",
    "What does A and B cost?",
    "What is published at https://www.acme.example/pricing?",
    "Is docs.acme.example reliable?",
  ])("rejects a normalized target reference: %s", (question) => {
    const result = validateDiscoveryQuestion(question, brand);

    expect(result.valid).toBe(false);
    expect(result.issues).toContain("brand_reference");
    expect(result.brandMatch.mentioned).toBe(true);
  });

  it("does not reject a substring that is not an alias or domain boundary", () => {
    expect(
      isValidDiscoveryQuestion(
        "Which tools support macroacme labs and notacme.example exports?",
        brand,
      ),
    ).toBe(true);
  });

  it("rejects empty or punctuation-only questions", () => {
    expect(validateDiscoveryQuestion(" — ?! ", brand)).toMatchObject({
      valid: false,
      issues: ["empty"],
    });
  });

  it("accepts a neutral category question", () => {
    expect(
      validateDiscoveryQuestion(
        "Which analytics platforms work well for small retailers?",
        brand,
      ),
    ).toMatchObject({ valid: true, issues: [] });
  });
});
