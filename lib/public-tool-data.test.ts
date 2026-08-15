import { describe, expect, it } from "vitest";

import {
  calculateVisibilityScores,
  CHATGPT_BRAND_VISIBILITY_PROMPTS,
  DEFAULT_VISIBILITY_SCORE_COUNTS,
} from "./public-tool-data";

describe("public tool server fallbacks", () => {
  it("shares the calculator formula with server-rendered content", () => {
    expect(calculateVisibilityScores(DEFAULT_VISIBILITY_SCORE_COUNTS)).toEqual({
      visibility: 25,
      prominence: 40,
      citation: 12,
      accuracy: 88,
      composite: 32,
    });
  });

  it("keeps the complete manual prompt set available without JavaScript", () => {
    expect(CHATGPT_BRAND_VISIBILITY_PROMPTS).toHaveLength(10);
    expect(CHATGPT_BRAND_VISIBILITY_PROMPTS[0]).toContain("[category]");
    expect(CHATGPT_BRAND_VISIBILITY_PROMPTS.at(-1)).toContain("[brand]");
  });
});
