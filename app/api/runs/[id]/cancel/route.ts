import { getRun as getWorkflowRun } from "workflow/api";

import { getAuthenticatedUser } from "@/lib/auth/session";
import { isSameOrigin, jsonError } from "@/lib/http";
import { cancelRunForUser } from "@/lib/runs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError("Cross-origin request rejected.", 403, "invalid_origin");
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    return jsonError("Sign in to cancel this run.", 401, "unauthorized");
  }

  const { id } = await context.params;
  const cancelled = await cancelRunForUser(id, user.id);

  if (cancelled.state === "not_found") {
    return jsonError("Benchmark run not found.", 404, "not_found");
  }

  if (cancelled.state === "not_active") {
    return jsonError(
      "This benchmark is no longer running.",
      409,
      "run_not_active",
    );
  }

  let workflowCancellationRequested = false;

  if (cancelled.workflowRunId) {
    workflowCancellationRequested = await getWorkflowRun(
      cancelled.workflowRunId,
    )
      .cancel()
      .then(() => true)
      .catch(() => false);
  }

  return Response.json({
    cancelled: true,
    creditReleased: cancelled.creditReleased,
    workflowCancellationRequested,
  });
}
