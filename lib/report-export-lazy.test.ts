import { describe, expect, it, vi } from "vitest";

const moduleMocks = vi.hoisted(() => ({
  createRequire: vi.fn(() => {
    throw new Error("font resolution should not run for CSV exports");
  }),
}));

vi.mock("node:module", () => ({
  createRequire: moduleMocks.createRequire,
}));

describe("CSV export font isolation", () => {
  it(
    "does not resolve PDF font files while importing or building CSV",
    async () => {
      const { buildResultsCsv } = await import("./report-export");
      const csv = buildResultsCsv({ rows: [] } as never);

      expect(csv).toContain("Question,Cohort,Category,Provider");
      expect(moduleMocks.createRequire).not.toHaveBeenCalled();
    },
    10_000,
  );
});
