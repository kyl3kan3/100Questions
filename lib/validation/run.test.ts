import { describe, expect, it } from "vitest";

import { createRunSchema, parseDelimitedList } from "./run";

const validRun = {
  subjectName: "Northstar Analytics",
  canonicalDomain: "https://www.northstar.example/pricing",
  description:
    "A privacy-friendly product analytics platform for business-to-business software teams.",
  aliases: ["Northstar", "northstar", "Northstar Analytics"],
  competitors: ["Example One", "Example Two"],
  market: "United States",
  locale: "en-US",
  questionCount: 25,
  confirmedBudget: true,
};

describe("createRunSchema", () => {
  it("normalizes the canonical domain and deduplicates lists", () => {
    const parsed = createRunSchema.parse(validRun);

    expect(parsed.canonicalDomain).toBe("northstar.example");
    expect(parsed.aliases).toEqual(["northstar", "Northstar Analytics"]);
  });

  it("requires explicit budget confirmation", () => {
    const parsed = createRunSchema.safeParse({
      ...validRun,
      confirmedBudget: false,
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects non-HTTP domains, credentials, and non-standard question counts", () => {
    expect(
      createRunSchema.safeParse({
        ...validRun,
        canonicalDomain: "ftp://northstar.example",
      }).success,
    ).toBe(false);
    expect(
      createRunSchema.safeParse({
        ...validRun,
        canonicalDomain: "https://user:pass@northstar.example",
      }).success,
    ).toBe(false);
    expect(
      createRunSchema.safeParse({ ...validRun, questionCount: 24 }).success,
    ).toBe(false);
    expect(
      createRunSchema.safeParse({ ...validRun, questionCount: 26 }).success,
    ).toBe(false);
  });

  it("rejects domains that cannot identify a registrable claimed site", () => {
    for (const canonicalDomain of ["com", "co.uk", "localhost", "127.0.0.1"]) {
      expect(
        createRunSchema.safeParse({ ...validRun, canonicalDomain }).success,
      ).toBe(false);
    }
  });
});

describe("parseDelimitedList", () => {
  it("splits commas and lines and removes empty entries", () => {
    expect(parseDelimitedList("One, Two\nThree\n")).toEqual([
      "One",
      "Two",
      "Three",
    ]);
  });
});
