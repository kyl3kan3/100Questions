import { describe, expect, it } from "vitest";

import { FetchTimeBudget } from "./fetch-time-budget";

describe("FetchTimeBudget", () => {
  it("caps per-hop timeout by remaining budget", () => {
    const budget = new FetchTimeBudget(5_000);
    expect(budget.timeoutForNextHop(15_000)).toBe(5_000);
  });

  it("throws when the budget is exhausted", () => {
    const budget = new FetchTimeBudget(0);
    expect(budget.exhausted).toBe(true);
    expect(() => budget.timeoutForNextHop(1_000)).toThrow(
      /fetch_time_budget_exceeded/i,
    );
  });
});
