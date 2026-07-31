import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import manifest from "../public/data/ai-visibility-index-2026-results-manifest.json";
import results from "../public/data/ai-visibility-index-2026-results.json";

describe("2026 AI Visibility Index results", () => {
  it("publishes the complete registered sample without provisional coverage", () => {
    expect(results.status).toBe("published");
    expect(results.cohortSize).toBe(25);
    expect(results.questionCount).toBe(20);
    expect(results.coverage).toEqual({
      eligibleAnswers: 80,
      plannedAnswers: 80,
      value: 1,
      threshold: 0.9,
      provisional: false,
    });
    expect(results.rankings).toHaveLength(25);
    expect(
      results.rankings.filter((result) => result.mentionCount > 0),
    ).toHaveLength(7);
  });

  it("keeps the headline result reconciled to the downloadable data", () => {
    const leader = results.rankings[0];
    expect(leader).toMatchObject({
      rank: 1,
      brand: "Peec AI",
      eligibleAnswers: 80,
      mentionCount: 6,
      discoveryVisibility: 0.075,
    });
  });

  it("matches every published distribution to its manifest hash", () => {
    expect(manifest.status).toBe("published");
    expect(manifest.eligibleAnswers).toBe(80);
    expect(manifest.plannedAnswers).toBe(80);

    for (const distribution of manifest.distributions) {
      const name = new URL(distribution.url).pathname.split("/").at(-1);
      expect(name).toBeTruthy();
      const path = join(process.cwd(), "public", "data", name!);
      expect(existsSync(path)).toBe(true);
      const content = readFileSync(path, "utf8").replace(/\r\n?/gu, "\n");
      const hash = createHash("sha256")
        .update(content, "utf8")
        .digest("hex");
      expect(hash, distribution.name).toBe(distribution.sha256);
    }
  });

  it("does not expose local authentication material in answer evidence", () => {
    const evidence = readFileSync(
      join(
        process.cwd(),
        "public",
        "data",
        "ai-visibility-index-2026-answer-evidence.csv",
      ),
      "utf8",
    );
    expect(evidence).not.toMatch(/VERCEL_OIDC_TOKEN|AI_GATEWAY_API_KEY/iu);
    expect(evidence).not.toMatch(/Bearer\s+[A-Za-z0-9._-]{12,}/u);
  });
});
