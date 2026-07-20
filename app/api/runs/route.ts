import { start } from "workflow/api";

import { hasUnlimitedAccess } from "@/lib/access";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { isSameOrigin, jsonError } from "@/lib/http";
import {
  createReservedRun,
  listRunsForUser,
  markWorkflowStarted,
  recordWorkflowDispatchAttemptFailure,
} from "@/lib/runs";
import { createRunSchema } from "@/lib/validation/run";
import { runVisibilityWorkflow } from "@/workflows/visibility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return jsonError("Sign in to view benchmark runs.", 401, "unauthorized");
  }

  return Response.json({ runs: await listRunsForUser(user.id) });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Cross-origin request rejected.", 403, "invalid_origin");
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    return jsonError("Sign in to start a benchmark.", 401, "unauthorized");
  }

  const idempotencyKey = request.headers.get("idempotency-key")?.trim();

  if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 128) {
    return jsonError(
      "Send an Idempotency-Key header between 8 and 128 characters.",
      400,
      "invalid_idempotency_key",
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400, "invalid_json");
  }

  const parsed = createRunSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: "Review the benchmark details and try again.",
        code: "validation_error",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const reservation = await createReservedRun(
    user.id,
    idempotencyKey,
    parsed.data,
    { unlimitedAccess: hasUnlimitedAccess(user.id) },
  );

  if (reservation.state === "no_credit") {
    return jsonError(
      "A run credit is required. Purchase one through Stripe Checkout first.",
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
      "The daily run or reserved-cost limit has been reached.",
      429,
      "daily_limit_reached",
    );
  }

  if (!("run" in reservation)) {
    return jsonError(
      "The benchmark could not be reserved.",
      503,
      "reservation_failed",
    );
  }

  if (
    reservation.state === "existing" &&
    reservation.run.workflowRunId
  ) {
    return Response.json(
      { run: reservation.run, idempotent: true },
      { status: 200 },
    );
  }

  if (
    reservation.state === "existing" &&
    reservation.run.status !== "queued"
  ) {
    return Response.json(
      { run: reservation.run, idempotent: true },
      { status: 200 },
    );
  }

  let workflowRun: Awaited<ReturnType<typeof start>>;

  try {
    workflowRun = await start(runVisibilityWorkflow, [reservation.run.id]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workflow start failed";
    await recordWorkflowDispatchAttemptFailure(
      reservation.run.id,
      "workflow_start_uncertain",
      message,
    );

    // A transport error can arrive after Workflow accepted the start. Keep
    // the durable dispatch pending and its credit reserved; retrying is safe
    // because the workflow hook and DB claim deduplicate application work.
    return Response.json(
      {
        run: reservation.run,
        idempotent: reservation.state === "existing",
        warning: "workflow_start_pending_reconciliation",
      },
      { status: 202 },
    );
  }

  try {
    await markWorkflowStarted(reservation.run.id, workflowRun.runId);
  } catch {
    // Workflow start is the irreversible boundary. If recording its ID fails,
    // leave the credit reserved and let the workflow's DB claim plus the
    // workflow claim repair state. Never report a refund while work runs.
    return Response.json(
      {
        run: reservation.run,
        workflowRunId: workflowRun.runId,
        idempotent: reservation.state === "existing",
        warning: "workflow_started_dispatch_record_pending",
      },
      { status: 202 },
    );
  }

  return Response.json(
    {
      run: {
        ...reservation.run,
        workflowRunId: workflowRun.runId,
        dispatchStatus: "started",
      },
      idempotent: reservation.state === "existing",
    },
    { status: reservation.state === "created" ? 201 : 200 },
  );
}
