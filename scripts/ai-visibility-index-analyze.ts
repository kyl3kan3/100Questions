import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { getDomain } from "tldts";

type Provider = "openai" | "anthropic" | "google" | "xai";
type Prominence = "lead" | "shortlist" | "incidental" | "absent";

type Protocol = {
  studyId: string;
  questionSet: { sha256: string; rankingQuestionCount: number };
  cohort: { sha256: string; brandCount: number };
  collection: {
    plannedAnswerCount: number;
    models: Record<Provider, string>;
  };
  eligibility: { coverageThreshold: number };
};

type CohortRow = {
  brand: string;
  aliases: string;
  claimed_domain: string;
  eligibility_source: string;
  match_policy:
    | "case_insensitive_exact_alias"
    | "case_sensitive_exact_alias";
};

type AdjudicationRow = {
  question_id: string;
  provider: Provider;
  matched_brand: string;
  decision: "exclude";
  reason: string;
};

type Source = {
  url: string;
  title: string | null;
  publisher: string | null;
};

type CompletedAttempt = {
  status: "completed";
  questionId: string;
  question: string;
  provider: Provider;
  startedAt: string;
  completedAt: string;
  answer: {
    provider: Provider;
    model: string;
    text: string;
    sources: Source[];
    groundingStatus: "grounded" | "no_sources" | "unsupported";
  };
};

type FailedAttempt = {
  status: "failed";
  questionId: string;
  question: string;
  provider: Provider;
  model: string;
  startedAt: string;
  completedAt: string;
  error: { code: string; message: string };
};

type RawCollection = {
  studyId: string;
  protocolSha256: string;
  questionSetSha256: string;
  cohortSha256: string;
  startedAt: string;
  completedAt: string;
  attempts: Array<CompletedAttempt | FailedAttempt>;
};

type Mention = {
  brand: string;
  alias: string;
  index: number;
  prominence: Exclude<Prominence, "absent">;
};

type Observation = {
  questionId: string;
  question: string;
  provider: Provider;
  model: string;
  collectedAt: string;
  eligible: boolean;
  exclusionReason: string;
  answerText: string;
  mentions: Mention[];
  sourceUrls: string[];
  sourceDomains: string[];
};

type BrandAggregate = {
  rank: number;
  brand: string;
  claimedDomain: string;
  eligibilitySource: string;
  eligibleAnswers: number;
  mentionCount: number;
  discoveryVisibility: number;
  leadCount: number;
  shortlistCount: number;
  incidentalCount: number;
  prominenceScore: number;
  claimedDomainCitationCount: number;
  citationPresence: number;
};

const providers: Provider[] = ["openai", "anthropic", "google", "xai"];
const prominenceScores: Record<Prominence, number> = {
  lead: 1,
  shortlist: 0.67,
  incidental: 0.33,
  absent: 0,
};
const root = process.cwd();
const dataDirectory = join(root, "public", "data");
const rawDirectory = join(
  root,
  "research",
  "ai-visibility-index",
  "2026",
  "raw",
);
const protocolPath = join(
  dataDirectory,
  "ai-visibility-index-2026-protocol.json",
);
const cohortPath = join(
  dataDirectory,
  "ai-visibility-index-2026-cohort.csv",
);
const questionPath = join(
  dataDirectory,
  "ai-visibility-index-2026-question-set.csv",
);
const adjudicationPath = join(
  dataDirectory,
  "ai-visibility-index-2026-match-adjudications.csv",
);
const rawPath = join(rawDirectory, "answers.json");
const reviewPath = join(rawDirectory, "positive-brand-matches.csv");

async function main() {
  const publish = process.argv.includes("--publish");
  const protocolText = await readFile(protocolPath, "utf8");
  const cohortText = await readFile(cohortPath, "utf8");
  const questionText = await readFile(questionPath, "utf8");
  const adjudicationText = await readFile(adjudicationPath, "utf8");
  const rawText = await readFile(rawPath, "utf8");
  const protocol = JSON.parse(protocolText) as Protocol;
  const cohort = parseCsv(cohortText) as CohortRow[];
  const adjudications = parseCsv(adjudicationText) as AdjudicationRow[];
  const raw = JSON.parse(rawText) as RawCollection;

  validateInputs(protocol, protocolText, cohortText, questionText, cohort, raw);

  const unadjudicatedObservations = raw.attempts.map((attempt) =>
    normalizeObservation(attempt, cohort),
  );
  const observations = applyAdjudications(
    unadjudicatedObservations,
    adjudications,
  );
  const eligible = observations.filter((observation) => observation.eligible);
  const coverage = eligible.length / protocol.collection.plannedAnswerCount;

  const brandResults = buildBrandResults(eligible, cohort);
  const providerResults = buildProviderResults(eligible, cohort);
  const sourceResults = buildSourceResults(eligible);
  const positiveMatches = buildPositiveMatchReview(
    unadjudicatedObservations.filter((observation) => observation.eligible),
    adjudications,
  );
  const includedMatchCount = positiveMatches.filter(
    (match) => match.decision === "include",
  ).length;

  await writeAtomic(reviewPath, toCsv(positiveMatches));
  console.log(
    `Review file: ${includedMatchCount} included and ${adjudications.length} excluded brand-answer matches across ${eligible.length} eligible answers.`,
  );
  console.log(
    `Coverage: ${eligible.length}/${protocol.collection.plannedAnswerCount} (${formatPercent(coverage)}).`,
  );
  console.log(
    `Unique cited domains: ${sourceResults.length}. Top five: ${sourceResults
      .slice(0, 5)
      .map((source) => `${source.domain} (${source.cited_answer_count})`)
      .join(", ")}.`,
  );

  if (!publish) {
    console.log(
      "No public result files were written. Review the positive matches, then rerun with --publish.",
    );
    return;
  }

  const publishedAt = new Date().toISOString();
  const resultPaths = {
    brandResults: join(
      dataDirectory,
      "ai-visibility-index-2026-brand-results.csv",
    ),
    providerResults: join(
      dataDirectory,
      "ai-visibility-index-2026-provider-results.csv",
    ),
    sourceResults: join(
      dataDirectory,
      "ai-visibility-index-2026-source-results.csv",
    ),
    answerEvidence: join(
      dataDirectory,
      "ai-visibility-index-2026-answer-evidence.csv",
    ),
    resultsJson: join(
      dataDirectory,
      "ai-visibility-index-2026-results.json",
    ),
    manifest: join(
      dataDirectory,
      "ai-visibility-index-2026-results-manifest.json",
    ),
  };

  await writeAtomic(
    resultPaths.brandResults,
    toCsv(
      brandResults.map((result) => ({
        rank: result.rank,
        brand: result.brand,
        claimed_domain: result.claimedDomain,
        eligibility_source: result.eligibilitySource,
        eligible_answers: result.eligibleAnswers,
        mention_count: result.mentionCount,
        discovery_visibility: formatRatio(result.discoveryVisibility),
        lead_count: result.leadCount,
        shortlist_count: result.shortlistCount,
        incidental_count: result.incidentalCount,
        prominence_score: formatRatio(result.prominenceScore),
        claimed_domain_citation_count: result.claimedDomainCitationCount,
        citation_presence: formatRatio(result.citationPresence),
      })),
    ),
  );
  await writeAtomic(resultPaths.providerResults, toCsv(providerResults));
  await writeAtomic(resultPaths.sourceResults, toCsv(sourceResults));
  await writeAtomic(
    resultPaths.answerEvidence,
    toCsv(
      observations.map((observation) => ({
        question_id: observation.questionId,
        provider: observation.provider,
        model_id: observation.model,
        collected_at: observation.collectedAt,
        eligible: observation.eligible,
        exclusion_reason: observation.exclusionReason,
        question: observation.question,
        answer_text: observation.answerText,
        brand_mentions: observation.mentions
          .map((mention) => mention.brand)
          .join(" | "),
        brand_prominence: observation.mentions
          .map((mention) => `${mention.brand}:${mention.prominence}`)
          .join(" | "),
        source_urls: observation.sourceUrls.join(" | "),
        source_domains: observation.sourceDomains.join(" | "),
      })),
    ),
  );

  const resultJson = {
    studyId: protocol.studyId,
    status: "published",
    publishedAt,
    collectionStartedAt: raw.startedAt,
    collectionCompletedAt: raw.completedAt,
    coverage: {
      eligibleAnswers: eligible.length,
      plannedAnswers: protocol.collection.plannedAnswerCount,
      value: round(coverage),
      threshold: protocol.eligibility.coverageThreshold,
      provisional: coverage < protocol.eligibility.coverageThreshold,
    },
    models: protocol.collection.models,
    cohortSize: protocol.cohort.brandCount,
    questionCount: protocol.questionSet.rankingQuestionCount,
    rankings: brandResults,
    providerResults,
    topSources: sourceResults.slice(0, 25),
  };
  await writeAtomic(
    resultPaths.resultsJson,
    `${JSON.stringify(resultJson, null, 2)}\n`,
  );

  const distributions = await Promise.all(
    [
      ...Object.entries(resultPaths).filter(([name]) => name !== "manifest"),
      ["matchAdjudications", adjudicationPath] as const,
    ]
      .map(async ([name, path]) => ({
        name,
        url: `https://100questionsai.com/data/${path.split(/[\\/]/u).at(-1)}`,
        sha256: sha256CanonicalText(await readFile(path, "utf8")),
      })),
  );
  const manifest = {
    studyId: protocol.studyId,
    status: "published",
    publishedAt,
    collectionStartedAt: raw.startedAt,
    collectionCompletedAt: raw.completedAt,
    protocolSha256: raw.protocolSha256,
    questionSetSha256: raw.questionSetSha256,
    cohortSha256: raw.cohortSha256,
    eligibleAnswers: eligible.length,
    plannedAnswers: protocol.collection.plannedAnswerCount,
    coverage: round(coverage),
    uniqueCitedDomains: sourceResults.length,
    distributions,
  };
  await writeAtomic(
    resultPaths.manifest,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log(
    `Published ${Object.keys(resultPaths).length} normalized result files locally.`,
  );
}

function normalizeObservation(
  attempt: CompletedAttempt | FailedAttempt,
  cohort: CohortRow[],
): Observation {
  if (attempt.status === "failed") {
    return {
      questionId: attempt.questionId,
      question: attempt.question,
      provider: attempt.provider,
      model: attempt.model,
      collectedAt: attempt.completedAt,
      eligible: false,
      exclusionReason: attempt.error.code,
      answerText: "",
      mentions: [],
      sourceUrls: [],
      sourceDomains: [],
    };
  }

  const eligible = attempt.answer.groundingStatus === "grounded";
  const sourceUrls = eligible
    ? unique(attempt.answer.sources.map((source) => sanitizeUrl(source.url)))
        .filter(Boolean)
    : [];
  const sourceDomains = unique(
    sourceUrls.map((url) => registrableDomain(url)).filter(Boolean),
  );

  return {
    questionId: attempt.questionId,
    question: attempt.question,
    provider: attempt.provider,
    model: attempt.answer.model,
    collectedAt: attempt.completedAt,
    eligible,
    exclusionReason: eligible ? "" : attempt.answer.groundingStatus,
    answerText: eligible ? normalizeAnswerText(attempt.answer.text) : "",
    mentions: eligible ? findMentions(attempt.answer.text, cohort) : [],
    sourceUrls,
    sourceDomains,
  };
}

function applyAdjudications(
  observations: Observation[],
  adjudications: AdjudicationRow[],
): Observation[] {
  const exclusions = new Map(
    adjudications.map((adjudication) => [
      `${adjudication.question_id}:${adjudication.provider}:${adjudication.matched_brand}`,
      adjudication,
    ]),
  );
  const matchedExclusions = new Set<string>();

  const result = observations.map((observation) => {
    const mentions = observation.mentions.filter((mention) => {
      const key = `${observation.questionId}:${observation.provider}:${mention.brand}`;
      if (!exclusions.has(key)) return true;
      matchedExclusions.add(key);
      return false;
    });

    return {
      ...observation,
      mentions: mentions.map((mention, index) => {
        const prominence: Mention["prominence"] =
          index === 0 ? "lead" : index <= 4 ? "shortlist" : "incidental";
        return { ...mention, prominence };
      }),
    };
  });

  if (matchedExclusions.size !== exclusions.size) {
    const missing = [...exclusions.keys()].filter(
      (key) => !matchedExclusions.has(key),
    );
    throw new Error(
      `Match adjudications did not resolve to raw matches: ${missing.join(", ")}.`,
    );
  }

  return result;
}

function findMentions(text: string, cohort: CohortRow[]): Mention[] {
  const matches = cohort
    .map((brand) => {
      const caseInsensitive =
        brand.match_policy === "case_insensitive_exact_alias";
      const aliasMatches = brand.aliases.split("|").map((alias) => {
        const expression = new RegExp(
          `(?<![\\p{L}\\p{N}])${escapeRegExp(alias)}(?![\\p{L}\\p{N}])`,
          caseInsensitive ? "iu" : "u",
        );
        const match = expression.exec(text);
        return {
          alias,
          index: match?.index ?? -1,
        };
      });
      const first = aliasMatches
        .filter((match) => match.index >= 0)
        .sort((left, right) => left.index - right.index)[0];

      return first
        ? { brand: brand.brand, alias: first.alias, index: first.index }
        : null;
    })
    .filter(
      (
        match,
      ): match is { brand: string; alias: string; index: number } =>
        match !== null,
    )
    .sort(
      (left, right) =>
        left.index - right.index ||
        left.brand.localeCompare(right.brand, "en-US"),
    );

  return matches.map((match, index) => ({
    ...match,
    prominence:
      index === 0 ? "lead" : index <= 4 ? "shortlist" : "incidental",
  }));
}

function buildBrandResults(
  observations: Observation[],
  cohort: CohortRow[],
): BrandAggregate[] {
  const results = cohort.map((brand) => {
    const mentions = observations
      .map((observation) =>
        observation.mentions.find((mention) => mention.brand === brand.brand),
      )
      .filter((mention): mention is Mention => mention !== undefined);
    const countProminence = (value: Mention["prominence"]) =>
      mentions.filter((mention) => mention.prominence === value).length;
    const claimedDomainCitationCount = observations.filter((observation) =>
      observation.sourceDomains.some(
        (domain) =>
          domain === brand.claimed_domain ||
          domain.endsWith(`.${brand.claimed_domain}`),
      ),
    ).length;
    const prominenceTotal = mentions.reduce(
      (total, mention) => total + prominenceScores[mention.prominence],
      0,
    );

    return {
      rank: 0,
      brand: brand.brand,
      claimedDomain: brand.claimed_domain,
      eligibilitySource: brand.eligibility_source,
      eligibleAnswers: observations.length,
      mentionCount: mentions.length,
      discoveryVisibility: mentions.length / observations.length,
      leadCount: countProminence("lead"),
      shortlistCount: countProminence("shortlist"),
      incidentalCount: countProminence("incidental"),
      prominenceScore: prominenceTotal / observations.length,
      claimedDomainCitationCount,
      citationPresence: claimedDomainCitationCount / observations.length,
    };
  });

  results.sort(
    (left, right) =>
      right.discoveryVisibility - left.discoveryVisibility ||
      right.prominenceScore - left.prominenceScore ||
      right.citationPresence - left.citationPresence ||
      left.brand.localeCompare(right.brand, "en-US"),
  );

  let currentRank = 0;
  let previousKey = "";
  results.forEach((result, index) => {
    const key = [
      result.discoveryVisibility,
      result.prominenceScore,
      result.citationPresence,
    ].join(":");
    if (key !== previousKey) currentRank = index + 1;
    result.rank = currentRank;
    previousKey = key;
  });

  return results;
}

function buildProviderResults(
  observations: Observation[],
  cohort: CohortRow[],
) {
  return providers.flatMap((provider) => {
    const providerObservations = observations.filter(
      (observation) => observation.provider === provider,
    );

    return buildBrandResults(providerObservations, cohort).map((result) => ({
      provider,
      model_id:
        providerObservations[0]?.model ?? "",
      rank: result.rank,
      brand: result.brand,
      eligible_answers: result.eligibleAnswers,
      mention_count: result.mentionCount,
      discovery_visibility: formatRatio(result.discoveryVisibility),
      prominence_score: formatRatio(result.prominenceScore),
      claimed_domain_citation_count: result.claimedDomainCitationCount,
      citation_presence: formatRatio(result.citationPresence),
    }));
  });
}

function buildSourceResults(observations: Observation[]) {
  const counts = new Map<string, number>();

  for (const observation of observations) {
    for (const domain of new Set(observation.sourceDomains)) {
      counts.set(domain, (counts.get(domain) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([domain, citedAnswerCount]) => ({
      domain,
      citedAnswerCount,
      citedAnswerShare: formatRatio(citedAnswerCount / observations.length),
    }))
    .sort(
      (left, right) =>
        right.citedAnswerCount - left.citedAnswerCount ||
        left.domain.localeCompare(right.domain, "en-US"),
    )
    .map((source, index) => ({
      rank: index + 1,
      domain: source.domain,
      cited_answer_count: source.citedAnswerCount,
      cited_answer_share: source.citedAnswerShare,
    }));
}

function buildPositiveMatchReview(
  observations: Observation[],
  adjudications: AdjudicationRow[],
) {
  const decisions = new Map(
    adjudications.map((adjudication) => [
      `${adjudication.question_id}:${adjudication.provider}:${adjudication.matched_brand}`,
      adjudication,
    ]),
  );

  return observations.flatMap((observation) =>
    observation.mentions.map((mention) => {
      const adjudication = decisions.get(
        `${observation.questionId}:${observation.provider}:${mention.brand}`,
      );
      return {
        question_id: observation.questionId,
        provider: observation.provider,
        brand: mention.brand,
        matched_alias: mention.alias,
        decision: adjudication?.decision ?? "include",
        reason: adjudication?.reason ?? "",
        prominence: mention.prominence,
        match_index: mention.index,
        context: contextAround(
          observation.answerText,
          mention.index,
          mention.alias,
        ),
      };
    }),
  );
}

function contextAround(text: string, index: number, alias: string): string {
  const start = Math.max(0, index - 90);
  const end = Math.min(text.length, index + alias.length + 160);
  return text
    .slice(start, end)
    .replace(/\s+/gu, " ")
    .trim();
}

function validateInputs(
  protocol: Protocol,
  protocolText: string,
  cohortText: string,
  questionText: string,
  cohort: CohortRow[],
  raw: RawCollection,
) {
  if (raw.studyId !== protocol.studyId) {
    throw new Error("The raw collection study ID does not match the protocol.");
  }
  if (raw.protocolSha256 !== sha256(protocolText)) {
    throw new Error("The raw collection protocol hash does not match.");
  }
  if (
    sha256CanonicalText(cohortText) !== protocol.cohort.sha256 ||
    raw.cohortSha256 !== protocol.cohort.sha256
  ) {
    throw new Error("The cohort hash does not match the registered protocol.");
  }
  if (
    sha256CanonicalText(questionText) !== protocol.questionSet.sha256 ||
    raw.questionSetSha256 !== protocol.questionSet.sha256
  ) {
    throw new Error(
      "The question-set hash does not match the registered protocol.",
    );
  }
  if (cohort.length !== protocol.cohort.brandCount) {
    throw new Error("The cohort row count does not match the protocol.");
  }
  if (
    raw.attempts.length !== protocol.collection.plannedAnswerCount ||
    !raw.completedAt
  ) {
    throw new Error("The raw collection is incomplete.");
  }
  for (const provider of providers) {
    const attempts = raw.attempts.filter(
      (attempt) => attempt.provider === provider,
    );
    if (attempts.length !== protocol.questionSet.rankingQuestionCount) {
      throw new Error(`The ${provider} answer count is incomplete.`);
    }
    if (
      attempts.some((attempt) => {
        const model =
          attempt.status === "completed" ? attempt.answer.model : attempt.model;
        return model !== protocol.collection.models[provider];
      })
    ) {
      throw new Error(`The ${provider} model does not match the protocol.`);
    }
  }
}

function parseCsv(input: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];
    if (character === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...data] = rows;
  if (!header) return [];
  return data.map((values) =>
    Object.fromEntries(
      header.map((name, index) => [name, values[index] ?? ""]),
    ),
  );
}

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(csvField).join(","),
    ...rows.map((row) =>
      headers.map((header) => csvField(row[header])).join(","),
    ),
  ];
  return `${lines.join("\n")}\n`;
}

function csvField(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/gu, '""')}"`;
}

function sanitizeUrl(value: string): string {
  try {
    const url = new URL(value);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password
    ) {
      return "";
    }
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^utm_|^(gclid|fbclid|msclkid)$/iu.test(key)) {
        url.searchParams.delete(key);
      }
    }
    return url.toString();
  } catch {
    return "";
  }
}

function normalizeAnswerText(value: string): string {
  return value
    .replace(/\r\n?/gu, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function registrableDomain(value: string): string {
  return getDomain(value, { allowPrivateDomains: true })?.toLowerCase() ?? "";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function round(value: number): number {
  return Number(value.toFixed(4));
}

function formatRatio(value: number): string {
  return value.toFixed(4);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function sha256CanonicalText(value: string): string {
  return sha256(value.replace(/\r\n?/gu, "\n"));
}

async function writeAtomic(path: string, value: string) {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, value, "utf8");
  await rename(temporaryPath, path);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Analysis failed.");
  process.exitCode = 1;
});
