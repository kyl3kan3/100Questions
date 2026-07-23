import {
  computeBenchmarkMetrics,
  type MetricObservation,
} from "./metrics";

export type BenchmarkSummary = {
  visibility: number | null;
  citations: number | null;
  coverage: number | null;
  competitorMentions: number;
};

export type BenchmarkComparison = {
  visibility: RatioComparison;
  citations: RatioComparison;
  coverage: RatioComparison;
  competitorMentions: {
    baseline: number;
    current: number;
    delta: number;
  };
};

type RatioComparison = {
  baseline: number | null;
  current: number | null;
  delta: number | null;
};

type BenchmarkPayload = {
  run: {
    discoveryCountPlanned: number;
    diagnosticCountPlanned: number;
  };
  rows: Array<{
    question: { cohort: MetricObservation["cohort"] };
    job: null | { provider: string };
    result: null | {
      scoreEligible: boolean;
      targetMentioned: boolean;
      prominence: MetricObservation["prominence"];
      ownedDomainCited: boolean;
      sentiment: MetricObservation["sentiment"];
      competitorMentions: Array<{ name: string }>;
    };
  }>;
};

export function summarizeBenchmark(payload: BenchmarkPayload): BenchmarkSummary {
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
  const providerCount = Math.max(
    new Set(
      payload.rows.flatMap((row) => (row.job ? [row.job.provider] : [])),
    ).size,
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
      (total, row) =>
        total +
        new Set(
          row.result?.competitorMentions.map((mention) =>
            mention.name.toLocaleLowerCase("en-US"),
          ) ?? [],
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

export function compareBenchmarkSummaries(
  baseline: BenchmarkSummary,
  current: BenchmarkSummary,
): BenchmarkComparison {
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

export function changedModels(
  baseline: Record<string, string>,
  current: Record<string, string>,
) {
  return [...new Set([...Object.keys(baseline), ...Object.keys(current)])]
    .filter((key) => baseline[key] !== current[key])
    .map((key) => ({
      key,
      baseline: baseline[key] ?? null,
      current: current[key] ?? null,
    }));
}

function ratioComparison(
  baseline: number | null,
  current: number | null,
): RatioComparison {
  return {
    baseline,
    current,
    delta: baseline === null || current === null ? null : current - baseline,
  };
}
