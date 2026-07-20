import { and, eq, inArray, lte } from "drizzle-orm";
import { start } from "workflow/api";

import { getDb } from "@/lib/db";
import { runs, workflowDispatches } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { markWorkflowStarted } from "@/lib/runs";
import { runVisibilityWorkflow } from "@/workflows/visibility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function maintain(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return jsonError("Unauthorized.", 401, "unauthorized");
  }

  const db = getDb();
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
    expiredRunsDeleted: expired.length,
    attempted: dispatches.length,
    started: settled.filter((result) => result.status === "fulfilled").length,
    failed: settled.filter((result) => result.status === "rejected").length,
  });
}

export const GET = maintain;
export const POST = maintain;
