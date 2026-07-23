import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  changedModels,
  compareBenchmarkSummaries,
  summarizeBenchmark,
} from "@/lib/benchmark-comparison";
import { jsonError } from "@/lib/http";
import { getRunResultsForUser } from "@/lib/runs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonError("Sign in to compare benchmark runs.", 401, "unauthorized");
  }

  const { id } = await context.params;
  const current = await getRunResultsForUser(id, user.id);
  if (!current) {
    return jsonError("Benchmark run not found.", 404, "not_found");
  }
  if (!current.run.baselineRunId) {
    return jsonError(
      "This benchmark is not linked to a baseline.",
      404,
      "baseline_not_linked",
    );
  }

  const baseline = await getRunResultsForUser(current.run.baselineRunId, user.id);
  if (!baseline) {
    return jsonError("Baseline benchmark not found.", 404, "baseline_not_found");
  }
  if (
    baseline.run.benchmarkVersion !== current.run.benchmarkVersion ||
    baseline.run.questionCountPlanned !== current.run.questionCountPlanned
  ) {
    return jsonError(
      "These benchmark versions cannot be compared directly.",
      409,
      "incompatible_benchmarks",
    );
  }

  const history = await loadHistory(current, baseline, user.id);

  return Response.json({
    baselineRunId: baseline.run.id,
    currentRunId: current.run.id,
    baselineCompletedAt: baseline.run.completedAt,
    currentCompletedAt: current.run.completedAt,
    modelChanges: changedModels(baseline.run.frozenModels, current.run.frozenModels),
    metrics: compareBenchmarkSummaries(
      summarizeBenchmark(baseline),
      summarizeBenchmark(current),
    ),
    history: history.map((snapshot, index) => ({
      runId: snapshot.run.id,
      completedAt: snapshot.run.completedAt,
      status: snapshot.run.status,
      metrics: summarizeBenchmark(snapshot),
      modelChanges:
        index === 0
          ? []
          : changedModels(
              history[index - 1].run.frozenModels,
              snapshot.run.frozenModels,
            ),
    })),
  });
}

type RunResults = NonNullable<
  Awaited<ReturnType<typeof getRunResultsForUser>>
>;

async function loadHistory(
  current: RunResults,
  baseline: RunResults,
  userId: string,
) {
  const newestFirst = [current, baseline];
  const seen = new Set(newestFirst.map((snapshot) => snapshot.run.id));
  let ancestorId = baseline.run.baselineRunId;

  while (ancestorId && newestFirst.length < 20 && !seen.has(ancestorId)) {
    const ancestor = await getRunResultsForUser(ancestorId, userId);
    if (
      !ancestor ||
      ancestor.run.benchmarkVersion !== current.run.benchmarkVersion ||
      ancestor.run.questionCountPlanned !== current.run.questionCountPlanned
    ) {
      break;
    }

    newestFirst.push(ancestor);
    seen.add(ancestor.run.id);
    ancestorId = ancestor.run.baselineRunId;
  }

  return newestFirst.reverse();
}
