export type BenchmarkCohort = "discovery" | "diagnostic";
export type Prominence = "lead" | "shortlist" | "incidental" | "absent";
export type Sentiment = "positive" | "neutral" | "negative";

export interface MetricObservation {
  cohort: BenchmarkCohort;
  eligible: boolean;
  targetMentioned: boolean;
  prominence?: Prominence | null;
  ownedDomainCited?: boolean;
  competitorMentions?: readonly string[];
  sentiment?: Sentiment | null;
}

export interface PlannedAnswerCounts {
  discovery: number;
  diagnostic: number;
}

export interface RatioMetric {
  numerator: number;
  denominator: number;
  value: number | null;
}

export interface MeanMetric {
  total: number;
  denominator: number;
  value: number | null;
  missing: number;
}

export interface SentimentMetric {
  denominator: number;
  positive: RatioMetric;
  neutral: RatioMetric;
  negative: RatioMetric;
  unknown: RatioMetric;
}

export interface BenchmarkMetrics {
  coverage: RatioMetric;
  discoveryVisibility: RatioMetric;
  conservativeVisibilityFloor: RatioMetric;
  prominence: MeanMetric;
  shareOfVoice: RatioMetric & {
    targetEvents: number;
    competitorEvents: number;
  };
  claimedDomainCitationRate: RatioMetric;
  sentiment: SentimentMetric;
  provisional: boolean;
  coverageThreshold: number;
}

export const DEFAULT_COVERAGE_THRESHOLD = 0.9;

export const PROMINENCE_SCORES: Readonly<Record<Prominence, number>> = {
  lead: 1,
  shortlist: 0.67,
  incidental: 0.33,
  absent: 0,
};

export function ratioMetric(
  numerator: number,
  denominator: number,
): RatioMetric {
  assertNonNegativeInteger(numerator, "numerator");
  assertNonNegativeInteger(denominator, "denominator");

  if (numerator > denominator) {
    throw new RangeError("Metric numerator cannot exceed its denominator.");
  }

  return {
    numerator,
    denominator,
    value: denominator === 0 ? null : numerator / denominator,
  };
}

/**
 * Computes the versioned benchmark metrics described in PLAN.md.
 *
 * Headline visibility, prominence, and share of voice use discovery answers
 * only so explicit-brand diagnostic prompts cannot inflate them. Coverage and
 * owned-domain citation rate use all cohorts. Only grounded, successful
 * (`eligible`) observations enter score-eligible denominators.
 */
export function computeBenchmarkMetrics(
  observations: readonly MetricObservation[],
  planned: PlannedAnswerCounts,
  coverageThreshold = DEFAULT_COVERAGE_THRESHOLD,
): BenchmarkMetrics {
  validatePlannedCounts(planned);

  if (
    !Number.isFinite(coverageThreshold) ||
    coverageThreshold < 0 ||
    coverageThreshold > 1
  ) {
    throw new RangeError("Coverage threshold must be between 0 and 1.");
  }

  const plannedTotal = planned.discovery + planned.diagnostic;
  const eligible = observations.filter(({ eligible: isEligible }) => isEligible);
  const discovery = observations.filter(
    ({ cohort }) => cohort === "discovery",
  );
  const eligibleDiscovery = discovery.filter(
    ({ eligible: isEligible }) => isEligible,
  );

  if (observations.length > plannedTotal) {
    throw new RangeError("Observed answers cannot exceed planned answers.");
  }

  if (discovery.length > planned.discovery) {
    throw new RangeError(
      "Observed discovery answers cannot exceed planned discovery answers.",
    );
  }

  const diagnosticCount = observations.length - discovery.length;

  if (diagnosticCount > planned.diagnostic) {
    throw new RangeError(
      "Observed diagnostic answers cannot exceed planned diagnostic answers.",
    );
  }

  const mentionedDiscovery = eligibleDiscovery.filter(
    ({ targetMentioned }) => targetMentioned,
  ).length;
  const coverage = ratioMetric(eligible.length, plannedTotal);
  const discoveryVisibility = ratioMetric(
    mentionedDiscovery,
    eligibleDiscovery.length,
  );
  const conservativeVisibilityFloor = ratioMetric(
    mentionedDiscovery,
    planned.discovery,
  );
  const prominence = computeProminence(eligibleDiscovery);
  const shareOfVoice = computeShareOfVoice(eligibleDiscovery);
  const claimedDomainCitationRate = ratioMetric(
    eligible.filter(({ ownedDomainCited }) => ownedDomainCited === true).length,
    eligible.length,
  );
  const sentiment = computeSentiment(eligible);

  return {
    coverage,
    discoveryVisibility,
    conservativeVisibilityFloor,
    prominence,
    shareOfVoice,
    claimedDomainCitationRate,
    sentiment,
    provisional:
      coverage.value === null || coverage.value < coverageThreshold,
    coverageThreshold,
  };
}

export function computeProminence(
  eligibleDiscovery: readonly MetricObservation[],
): MeanMetric {
  let total = 0;
  let denominator = 0;
  let missing = 0;

  for (const observation of eligibleDiscovery) {
    // A deterministic absence always contributes zero, even if no analyzer ran.
    const prominence = observation.targetMentioned
      ? observation.prominence
      : "absent";

    if (!prominence) {
      missing += 1;
      continue;
    }

    total += PROMINENCE_SCORES[prominence];
    denominator += 1;
  }

  return {
    total,
    denominator,
    value: denominator === 0 ? null : total / denominator,
    missing,
  };
}

export function computeShareOfVoice(
  eligibleDiscovery: readonly MetricObservation[],
): BenchmarkMetrics["shareOfVoice"] {
  let targetEvents = 0;
  let competitorEvents = 0;

  for (const observation of eligibleDiscovery) {
    if (observation.targetMentioned) {
      targetEvents += 1;
    }

    const uniqueCompetitors = new Set(
      (observation.competitorMentions ?? [])
        .map(normalizeEntityKey)
        .filter(Boolean),
    );
    competitorEvents += uniqueCompetitors.size;
  }

  const metric = ratioMetric(targetEvents, targetEvents + competitorEvents);

  return {
    ...metric,
    targetEvents,
    competitorEvents,
  };
}

export function computeSentiment(
  eligible: readonly MetricObservation[],
): SentimentMetric {
  const mentioned = eligible.filter(({ targetMentioned }) => targetMentioned);
  const denominator = mentioned.length;
  const count = (sentiment: Sentiment) =>
    mentioned.filter((observation) => observation.sentiment === sentiment).length;
  const knownCount =
    count("positive") + count("neutral") + count("negative");

  return {
    denominator,
    positive: ratioMetric(count("positive"), denominator),
    neutral: ratioMetric(count("neutral"), denominator),
    negative: ratioMetric(count("negative"), denominator),
    unknown: ratioMetric(denominator - knownCount, denominator),
  };
}

function normalizeEntityKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

function validatePlannedCounts(planned: PlannedAnswerCounts): void {
  assertNonNegativeInteger(planned.discovery, "planned.discovery");
  assertNonNegativeInteger(planned.diagnostic, "planned.diagnostic");
}

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer.`);
  }
}
