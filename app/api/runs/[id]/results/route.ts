import { getAuthenticatedUser } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { computeBenchmarkMetrics, type MetricObservation } from "@/lib/metrics";
import { getRunResultsForUser } from "@/lib/runs";
import { PROVIDERS } from "@/lib/config";

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
  const metrics = computeBenchmarkMetrics(observations, {
    discovery: payload.run.discoveryCountPlanned * 3,
    diagnostic: payload.run.diagnosticCountPlanned * 3,
  });
  const providerMetrics = Object.fromEntries(
    PROVIDERS.map((provider) => {
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

  return Response.json({ ...payload, metrics, providerMetrics, categories });
}
