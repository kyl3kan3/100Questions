import { start } from "workflow/api";

import { getAuthenticatedUser } from "@/lib/auth/session";
import { isSameOrigin, jsonError } from "@/lib/http";
import {
  getRunForUser,
  markWorkflowStarted,
  recordWorkflowDispatchAttemptFailure,
} from "@/lib/runs";
import { runVisibilityWorkflow } from "@/workflows/visibility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/** User-scoped recovery for a committed run whose Workflow start was uncertain. */
export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError("Cross-origin request rejected.", 403, "invalid_origin");
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    return jsonError("Sign in to retry this benchmark.", 401, "unauthorized");
  }

  const { id } = await context.params;
  const run = await getRunForUser(id, user.id);

  if (!run) {
    return jsonError("Benchmark run not found.", 404, "not_found");
  }

  if (run.status !== "queued" || run.workflowRunId) {
    return Response.json({ run, idempotent: true });
  }

  try {
    const workflowRun = await start(runVisibilityWorkflow, [run.id]);

    try {
      await markWorkflowStarted(run.id, workflowRun.runId);
    } catch {
      return Response.json(
        {
          run,
          workflowRunId: workflowRun.runId,
          warning: "workflow_started_dispatch_record_pending",
        },
        { status: 202 },
      );
    }

    return Response.json({
      run: {
        ...run,
        workflowRunId: workflowRun.runId,
        dispatchStatus: "started",
      },
    });
  } catch (error) {
    await recordWorkflowDispatchAttemptFailure(
      run.id,
      "workflow_start_uncertain",
      error instanceof Error ? error.message : "Workflow start failed",
    );

    return Response.json(
      { run, warning: "workflow_start_pending_reconciliation" },
      { status: 202 },
    );
  }
}
