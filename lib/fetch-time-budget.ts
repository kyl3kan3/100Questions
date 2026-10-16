export const DEFAULT_SITE_FETCH_BUDGET_MS = 25_000;

export class FetchTimeBudget {
  private readonly startedAt = Date.now();

  constructor(private readonly budgetMs: number) {}

  get exhausted(): boolean {
    return this.remainingMs() <= 0;
  }

  remainingMs(): number {
    return Math.max(0, this.budgetMs - (Date.now() - this.startedAt));
  }

  /**
   * Per-hop timeout capped by whatever budget remains.
   * @throws when the overall budget is already spent
   */
  timeoutForNextHop(perHopCapMs: number): number {
    const remaining = this.remainingMs();
    if (remaining <= 0) {
      throw new Error("fetch_time_budget_exceeded");
    }
    return Math.min(perHopCapMs, remaining);
  }

  assertTimeRemaining(): void {
    if (this.exhausted) {
      throw new Error("fetch_time_budget_exceeded");
    }
  }
}
