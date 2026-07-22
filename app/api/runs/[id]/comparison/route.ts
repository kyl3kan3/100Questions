import { getAuthenticatedUser } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { computeBenchmarkMetrics, type MetricObservation } from "@/lib/metrics";
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

  return Response.json({
    baselineRunId: baseline.run.id,
    currentRunId: current.run.id,
    baselineCompletedAt: baseline.run.completedAt,
    currentCompletedAt: current.run.completedAt,
    modelChanges: changedModels(baseline.run.frozenModels, current.run.frozenModels),
    metrics: compareSummaries(summarize(baseline), summarize(current)),
  });
}

function summarize(payload: NonNullable<Awaited<ReturnType<typeof getRunResultsForUser>>>) {
  const observations: MetricObservation[] = payload.rows
    .filter((row) => row.job && row.result)
    .map((row) => ({
      cohort: row.question.cohort,
      eligible: row.result!.scoreEligible,
      targetMentioned: row.result!.targetMentioned,
      prominence: row.result!.prominence,
      ownedDomainCited: row.result!.ownedDomainCited,
      sentiment: row.result!.sentiment,
      competitorMentions: row.result!.competitorMentions.map((mention) => mention.name),
    }));
  const providerCount = Math.max(
    new Set(payload.rows.flatMap((row) => (row.job ? [row.job.provider] : []))).size,
    1,
  );
  const metrics = computeBenchmarkMetrics(observations, {
    discovery: payload.run.discoveryCountPlanned * providerCount,
    diagnostic: payload.run.diagnosticCountPlanned * providerCount,
  });
  const competitorMentions = payload.rows
    .filter(
      (row) =>
        row.question.cohort === "discovery" &&
        row.result?.scoreEligible,
    )
    .reduce(
      (total, row) => total + new Set(
        row.result?.competitorMentions.map((mention) => mention.name.toLocaleLowerCase("en-US")) ?? [],
      ).size,
      0,
    );

  return {
    visibility: metrics.discoveryVisibility.value,
    citations: metrics.claimedDomainCitationRate.value,
    coverage: metrics.coverage.value,
    competitorMentions,
  };
}

function compareSummaries(
  baseline: ReturnType<typeof summarize>,
  current: ReturnType<typeof summarize>,
) {
  return {
    visibility: ratioComparison(baseline.visibility, current.visibility),
    citations: ratioComparison(baseline.citations, current.citations),
    coverage: ratioComparison(baseline.coverage, current.coverage),
    competitorMentions: {
      baseline: baseline.competitorMentions,
      current: current.competitorMentions,
      delta: current.competitorMentions - baseline.competitorMentions,
    },
  };
}

function ratioComparison(baseline: number | null, current: number | null) {
  return {
    baseline,
    current,
    delta: baseline === null || current === null ? null : current - baseline,
  };
}

function changedModels(
  baseline: Record<string, string>,
  current: Record<string, string>,
) {
  return [...new Set([...Object.keys(baseline), ...Object.keys(current)])]
    .filter((key) => baseline[key] !== current[key])
    .map((key) => ({ key, baseline: baseline[key] ?? null, current: current[key] ?? null }));
}
