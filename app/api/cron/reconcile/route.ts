import { and, eq, inArray, lte, sql } from "drizzle-orm";
import { getRun as getWorkflowRun, start } from "workflow/api";

import { releaseReservedCreditForRun } from "@/lib/billing/credits";
import { getBenchmarkConfig } from "@/lib/config";
import { getDb } from "@/lib/db";
import { runs, workflowDispatches } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { cancelRunForUser, markWorkflowStarted } from "@/lib/runs";
import { runVisibilityWorkflow } from "@/workflows/visibility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function maintain(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return jsonError("Unauthorized.", 401, "unauthorized");
  }

  const db = getDb();
  const config = getBenchmarkConfig();
  const staleCutoff = new Date(
    Date.now() - config.workflow.maxRunDurationMs,
  );
  const staleRuns = await db
    .select({
      id: runs.id,
      userId: runs.userId,
    })
    .from(runs)
    .where(
      and(
        inArray(runs.status, ["queued", "generating", "querying", "analyzing"]),
        sql`coalesce(${runs.startedAt}, ${runs.createdAt}) <= ${staleCutoff}`,
      ),
    )
    .limit(20);
  const stopped = await Promise.allSettled(
    staleRuns.map(async (run) => {
      const cancelled = await cancelRunForUser(run.id, run.userId, {
        failureCode: "RUN_DURATION_LIMIT",
        failureMessage:
          "The run reached its maximum duration. Completed evidence was retained and further calls were stopped.",
      });

      if (cancelled.state !== "cancelled") return false;

      if (cancelled.workflowRunId) {
        await getWorkflowRun(cancelled.workflowRunId)
          .cancel()
          .catch(() => undefined);
      }

      if (cancelled.creditMayBeReleased) {
        await releaseReservedCreditForRun({
          userId: run.userId,
          runId: run.id,
          reason: "duration_limit_before_provider_work",
        });
      }

      return true;
    }),
  );
  const expired = await db
    .delete(runs)
    .where(
      and(
        lte(runs.retentionExpiresAt, new Date()),
        inArray(runs.status, ["complete", "partial", "failed", "cancelled"]),
      ),
    )
    .returning({ id: runs.id });
  const dispatches = await db
    .select({ runId: workflowDispatches.runId })
    .from(workflowDispatches)
    .innerJoin(runs, eq(workflowDispatches.runId, runs.id))
    .where(
      and(
        inArray(workflowDispatches.status, ["pending", "starting"]),
        eq(runs.status, "queued"),
        lte(workflowDispatches.createdAt, new Date(Date.now() - 60_000)),
      ),
    )
    .limit(10);
  const settled = await Promise.allSettled(
    dispatches.map(async (dispatch) => {
      const workflowRun = await start(runVisibilityWorkflow, [dispatch.runId]);
      await markWorkflowStarted(dispatch.runId, workflowRun.runId);
      return dispatch.runId;
    }),
  );

  return Response.json({
    staleRunsFound: staleRuns.length,
    staleRunsStopped: stopped.filter(
      (result) => result.status === "fulfilled" && result.value,
    ).length,
    expiredRunsDeleted: expired.length,
    attempted: dispatches.length,
    started: settled.filter((result) => result.status === "fulfilled").length,
    failed: settled.filter((result) => result.status === "rejected").length,
  });
}

export const GET = maintain;
export const POST = maintain;
