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
    return jsonError("Sign in to view these results.", 401, "unauthorized");
  }

  const { id } = await context.params;
  const payload = await getRunResultsForUser(id, user.id);

  if (!payload) {
    return jsonError("Benchmark run not found.", 404, "not_found");
  }

  const observations: MetricObservation[] = payload.rows
    .filter((row) => row.job && row.result)
    .map((row) => ({
      cohort: row.question.cohort,
      eligible: row.result!.scoreEligible,
      targetMentioned: row.result!.targetMentioned,
      prominence: row.result!.prominence,
      ownedDomainCited: row.result!.ownedDomainCited,
      sentiment: row.result!.sentiment,
      competitorMentions: row.result!.competitorMentions.map(
        (mention) => mention.name,
      ),
    }));
  const providers = [
    ...new Set(
      payload.rows.flatMap((row) => (row.job ? [row.job.provider] : [])),
    ),
  ];
  const providerCount = Math.max(
    providers.length,
    Math.round(
      payload.run.providerCallsPlanned /
        Math.max(payload.run.questionCountPlanned, 1),
    ),
    1,
  );
  const metrics = computeBenchmarkMetrics(observations, {
    discovery: payload.run.discoveryCountPlanned * providerCount,
    diagnostic: payload.run.diagnosticCountPlanned * providerCount,
  });
  const providerMetrics = Object.fromEntries(
    providers.map((provider) => {
      const providerObservations: MetricObservation[] = payload.rows
        .filter((row) => row.job?.provider === provider && row.result)
        .map((row) => ({
          cohort: row.question.cohort,
          eligible: row.result!.scoreEligible,
          targetMentioned: row.result!.targetMentioned,
          prominence: row.result!.prominence,
          ownedDomainCited: row.result!.ownedDomainCited,
          sentiment: row.result!.sentiment,
          competitorMentions: row.result!.competitorMentions.map(
            (mention) => mention.name,
          ),
        }));

      return [
        provider,
        computeBenchmarkMetrics(providerObservations, {
          discovery: payload.run.discoveryCountPlanned,
          diagnostic: payload.run.diagnosticCountPlanned,
        }),
      ];
    }),
  );
  const categories = [
    ...new Set(payload.rows.map((row) => row.question.category)),
  ].sort((left, right) => left.localeCompare(right));

  return Response.json({
    ...payload,
    metrics,
    providerMetrics,
    providers,
    categories,
  });
}
