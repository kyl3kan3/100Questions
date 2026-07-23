import { getRun } from "workflow/api";

import { getAuthenticatedUser } from "@/lib/auth/session";
import { isSameOrigin, jsonError } from "@/lib/http";
import {
  cancelQueuedRunForUser,
  deleteRunForUser,
  getRunForUser,
  getRunProgressForUser,
} from "@/lib/runs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return jsonError("Sign in to view this run.", 401, "unauthorized");
  }

  const { id } = await context.params;
  const run = await getRunProgressForUser(id, user.id);

  if (!run) {
    return jsonError("Benchmark run not found.", 404, "not_found");
  }

  return Response.json({ run });
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError("Cross-origin request rejected.", 403, "invalid_origin");
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    return jsonError("Sign in to delete this run.", 401, "unauthorized");
  }

  const { id } = await context.params;
  const run = await getRunForUser(id, user.id);

  if (!run) {
    return jsonError("Benchmark run not found.", 404, "not_found");
  }

  if (["generating", "querying", "analyzing"].includes(run.status)) {
    return jsonError(
      "Wait for the active benchmark to finish before deleting it.",
      409,
      "run_active",
    );
  }

  if (run.status === "queued") {
    const cancelled = await cancelQueuedRunForUser(run.id, user.id);

    if (!cancelled) {
      return jsonError(
        "The benchmark began processing before cancellation completed.",
        409,
        "run_active",
      );
    }

    if (cancelled.workflowRunId) {
      // The database cancellation is authoritative. Remote cancellation is a
      // best-effort optimization; the workflow claim also observes terminal
      // state and exits without provider work.
      await getRun(cancelled.workflowRunId).cancel().catch(() => undefined);
    }

    // The queued cancellation and reservation release commit atomically.
  }

  const deleted = await deleteRunForUser(id, user.id);

  if (!deleted) {
    return jsonError(
      "The run changed state before it could be deleted.",
      409,
      "run_state_changed",
    );
  }

  return new Response(null, { status: 204 });
}
