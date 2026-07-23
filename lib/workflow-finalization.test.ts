import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ACTION_PLAN_FINALIZATION_RETRY_CODE,
  isActionPlanFinalizationRetry,
} from "./workflow-finalization";

describe("workflow finalization recovery", () => {
  it("only resumes the action-plan checkpoint from its repairable state", () => {
    expect(
      isActionPlanFinalizationRetry(
        "analyzing",
        ACTION_PLAN_FINALIZATION_RETRY_CODE,
      ),
    ).toBe(true);
    expect(
      isActionPlanFinalizationRetry(
        "failed",
        ACTION_PLAN_FINALIZATION_RETRY_CODE,
      ),
    ).toBe(false);
    expect(isActionPlanFinalizationRetry("analyzing", null)).toBe(false);
  });

  it("keeps cron recovery keyed to the durable run state after dispatch errors", () => {
    const cronRoute = readFileSync(
      join(
        process.cwd(),
        "app",
        "api",
        "cron",
        "reconcile",
        "route.ts",
      ),
      "utf8",
    );

    expect(cronRoute).toMatch(
      /eq\(\s*runs\.failureCode,\s*ACTION_PLAN_FINALIZATION_RETRY_CODE/u,
    );
    expect(cronRoute).not.toMatch(
      /eq\(\s*workflowDispatches\.failureCode,\s*ACTION_PLAN_FINALIZATION_RETRY_CODE/u,
    );
  });
});
