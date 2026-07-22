import { start } from "workflow/api";

import { hasUnlimitedAccess } from "@/lib/access";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { isSameOrigin, jsonError } from "@/lib/http";
import {
  createReservedRun,
  getRunForUser,
  markWorkflowStarted,
  recordWorkflowDispatchAttemptFailure,
  toPublicRun,
} from "@/lib/runs";
import { runVisibilityWorkflow } from "@/workflows/visibility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError("Cross-origin request rejected.", 403, "invalid_origin");
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonError("Sign in to rerun this benchmark.", 401, "unauthorized");
  }

  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 128) {
    return jsonError(
      "Send an Idempotency-Key header between 8 and 128 characters.",
      400,
      "invalid_idempotency_key",
    );
  }

  const { id } = await context.params;
  const baseline = await getRunForUser(id, user.id);
  if (!baseline) {
    return jsonError("Baseline benchmark not found.", 404, "not_found");
  }
  if (!["complete", "partial"].includes(baseline.status)) {
    return jsonError(
      "Only a completed benchmark can be rerun.",
      409,
      "baseline_not_complete",
    );
  }
  if (
    baseline.benchmarkVersion !== "benchmark-v2" ||
    baseline.questionCountPlanned !== 25
  ) {
    return jsonError(
      "This historical benchmark is not compatible with reruns.",
      409,
      "baseline_incompatible",
    );
  }

  const reservation = await createReservedRun(
    user.id,
    idempotencyKey,
    {
      subjectName: baseline.subjectName,
      canonicalDomain: baseline.canonicalDomain,
      description: baseline.description,
      aliases: baseline.aliases,
      competitors: baseline.competitors,
      market: baseline.market,
      locale: baseline.locale,
      questionCount: baseline.questionCountPlanned,
      confirmedBudget: true,
    },
    {
      unlimitedAccess: hasUnlimitedAccess(user.id),
      baselineRunId: baseline.id,
    },
  );

  if (reservation.state === "no_credit") {
    return jsonError(
      "A run credit is required before rerunning this benchmark.",
      402,
      "credit_required",
    );
  }
  if (reservation.state === "active_run") {
    return jsonError(
      "Finish or cancel the active benchmark before starting another.",
      409,
      "active_run_exists",
    );
  }
  if (reservation.state === "daily_limit") {
    return jsonError(
      "The daily run limit has been reached.",
      429,
      "daily_limit_reached",
    );
  }
  if (!("run" in reservation)) {
    return jsonError("The rerun could not be reserved.", 503, "reservation_failed");
  }

  if (reservation.state === "existing" && reservation.run.workflowRunId) {
    return Response.json({ run: toPublicRun(reservation.run), idempotent: true });
  }

  let workflowRun: Awaited<ReturnType<typeof start>>;
  try {
    workflowRun = await start(runVisibilityWorkflow, [reservation.run.id]);
  } catch (error) {
    await recordWorkflowDispatchAttemptFailure(
      reservation.run.id,
      "workflow_start_uncertain",
      error instanceof Error ? error.message : "Workflow start failed",
    );
    return Response.json(
      {
        run: toPublicRun(reservation.run),
        warning: "workflow_start_pending_reconciliation",
      },
      { status: 202 },
    );
  }

  try {
    await markWorkflowStarted(reservation.run.id, workflowRun.runId);
  } catch {
    return Response.json(
      {
        run: toPublicRun(reservation.run),
        workflowRunId: workflowRun.runId,
        warning: "workflow_started_dispatch_record_pending",
      },
      { status: 202 },
    );
  }

  return Response.json(
    {
      run: toPublicRun({
        ...reservation.run,
        workflowRunId: workflowRun.runId,
        dispatchStatus: "started",
      }),
    },
    { status: reservation.state === "created" ? 201 : 200 },
  );
}
