export type InsightCohort = "discovery" | "diagnostic";

export type ResultInsightRow = {
  question: {
    id: string;
    text: string;
    category: string;
    cohort: InsightCohort;
    sortOrder: number;
  };
  job: null | {
    provider: string;
  };
  result: null | {
    id: string;
    scoreEligible: boolean;
    targetMentioned: boolean;
    competitorMentions: readonly { name: string }[];
    sources: readonly { url: string }[];
  };
};

export type QuestionAgreement =
  | "unanimous_mention"
  | "unanimous_miss"
  | "mixed"
  | "partial"
  | "insufficient";

export type QuestionInsight<TRow extends ResultInsightRow = ResultInsightRow> = {
  question: TRow["question"];
  rows: TRow[];
  providerBreadth: number;
  attemptedProviderCount: number;
  expectedProviderCount: number;
  eligibleProviderCount: number;
  mentionedProviderCount: number;
  unavailableProviderCount: number;
  agreement: QuestionAgreement;
  leadingCompetitors: Array<{ name: string; count: number }>;
  keySources: Array<{ domain: string; count: number; url: string }>;
  resultIds: string[];
};

export type InsightSummary = {
  discoveryQuestionCount: number;
  evaluatedDiscoveryQuestionCount: number;
  reachedDiscoveryQuestionCount: number;
  unanimousMentionCount: number;
  unanimousMissCount: number;
  mixedCount: number;
  partialCoverageCount: number;
  insufficientCount: number;
  providerCount: number;
  groundedProviderCount: number;
  groundedProviderAnswerCount: number;
};

export type OpportunityTheme = {
  category: string;
  questionCount: number;
  unanimousMissCount: number;
  mixedCount: number;
  missedProviderAnswerCount: number;
  groundedProviderAnswerCount: number;
  topCompetitor: string | null;
};

export type CompetitorSignal = {
  name: string;
  answerCount: number;
  questionCount: number;
  providerCount: number;
  displacedAnswerCount: number;
};

export type SourceSignal = {
  domain: string;
  answerCount: number;
  questionCount: number;
  providerCount: number;
  missedAnswerCount: number;
  url: string;
};

export function buildQuestionInsights<TRow extends ResultInsightRow>(
  rows: readonly TRow[],
  expectedProviders: readonly string[] = [],
): Array<QuestionInsight<TRow>> {
  const grouped = new Map<string, TRow[]>();

  for (const row of rows) {
    grouped.set(row.question.id, [...(grouped.get(row.question.id) ?? []), row]);
  }

  return [...grouped.values()]
    .map((questionRows) => {
      const question = questionRows[0]!.question;
      const attemptedProviders = unique(
        questionRows.flatMap((row) => (row.job ? [row.job.provider] : [])),
      );
      const expectedProviderCount = Math.max(
        expectedProviders.length,
        attemptedProviders.length,
      );
      const eligibleRows = questionRows.filter(
        (row) => row.result?.scoreEligible === true,
      );
      const groundedProviders = unique(
        eligibleRows.flatMap((row) => (row.job ? [row.job.provider] : [])),
      );
      const mentionedProviderCount = eligibleRows.filter(
        (row) => row.result?.targetMentioned === true,
      ).length;

      return {
        question,
        rows: [...questionRows].sort((left, right) =>
          (left.job?.provider ?? "").localeCompare(right.job?.provider ?? ""),
        ),
        providerBreadth: groundedProviders.length,
        attemptedProviderCount: attemptedProviders.length,
        expectedProviderCount,
        eligibleProviderCount: eligibleRows.length,
        mentionedProviderCount,
        unavailableProviderCount: Math.max(
          expectedProviderCount - groundedProviders.length,
          0,
        ),
        agreement: questionAgreement(
          mentionedProviderCount,
          eligibleRows.length,
          groundedProviders.length,
          expectedProviderCount,
        ),
        leadingCompetitors: rankNames(
          eligibleRows.flatMap((row) =>
            uniqueByNormalizedName(row.result?.competitorMentions ?? []).map(
              (mention) => mention.name,
            ),
          ),
        ).slice(0, 3),
        keySources: rankSourceDomains(eligibleRows).slice(0, 3),
        resultIds: eligibleRows.flatMap((row) =>
          row.result ? [row.result.id] : [],
        ),
      } satisfies QuestionInsight<TRow>;
    })
    .sort(
      (left, right) =>
        left.question.sortOrder - right.question.sortOrder ||
        left.question.text.localeCompare(right.question.text),
    );
}

export function summarizeQuestionInsights(
  questions: readonly QuestionInsight[],
): InsightSummary {
  const discovery = questions.filter(
    ({ question }) => question.cohort === "discovery",
  );
  const evaluated = discovery.filter(
    ({ eligibleProviderCount }) => eligibleProviderCount > 0,
  );
  const providerCount = new Set(
    questions.flatMap(({ rows }) =>
      rows.flatMap((row) => (row.job ? [row.job.provider] : [])),
    ),
  ).size;
  const groundedProviderCount = new Set(
    questions.flatMap(({ rows }) =>
      rows.flatMap((row) =>
        row.job && row.result?.scoreEligible ? [row.job.provider] : [],
      ),
    ),
  ).size;

  return {
    discoveryQuestionCount: discovery.length,
    evaluatedDiscoveryQuestionCount: evaluated.length,
    reachedDiscoveryQuestionCount: evaluated.filter(
      ({ mentionedProviderCount }) => mentionedProviderCount > 0,
    ).length,
    unanimousMentionCount: evaluated.filter(
      ({ agreement }) => agreement === "unanimous_mention",
    ).length,
    unanimousMissCount: evaluated.filter(
      ({ agreement }) => agreement === "unanimous_miss",
    ).length,
    mixedCount: evaluated.filter(({ agreement }) => agreement === "mixed")
      .length,
    partialCoverageCount: evaluated.filter(
      ({ agreement }) => agreement === "partial",
    ).length,
    insufficientCount: discovery.filter(
      ({ agreement }) => agreement === "insufficient",
    ).length,
    providerCount,
    groundedProviderCount,
    groundedProviderAnswerCount: discovery.reduce(
      (total, question) => total + question.eligibleProviderCount,
      0,
    ),
  };
}

export function buildOpportunityThemes(
  questions: readonly QuestionInsight[],
  limit = 3,
): OpportunityTheme[] {
  const groups = new Map<string, QuestionInsight[]>();

  for (const question of questions) {
    if (
      question.question.cohort !== "discovery" ||
      question.eligibleProviderCount === 0 ||
      question.mentionedProviderCount === question.eligibleProviderCount
    ) {
      continue;
    }

    const category = cleanLabel(question.question.category) || "Other";
    groups.set(category, [...(groups.get(category) ?? []), question]);
  }

  return [...groups.entries()]
    .map(([category, categoryQuestions]) => {
      const competitors = rankNames(
        categoryQuestions.flatMap((question) =>
          question.leadingCompetitors.flatMap(({ name, count }) =>
            Array.from({ length: count }, () => name),
          ),
        ),
      );

      return {
        category,
        questionCount: categoryQuestions.length,
        unanimousMissCount: categoryQuestions.filter(
          ({ agreement }) => agreement === "unanimous_miss",
        ).length,
        mixedCount: categoryQuestions.filter(
          ({ agreement }) => agreement === "mixed",
        ).length,
        missedProviderAnswerCount: categoryQuestions.reduce(
          (total, question) =>
            total +
            question.eligibleProviderCount -
            question.mentionedProviderCount,
          0,
        ),
        groundedProviderAnswerCount: categoryQuestions.reduce(
          (total, question) => total + question.eligibleProviderCount,
          0,
        ),
        topCompetitor: competitors[0]?.name ?? null,
      };
    })
    .sort(
      (left, right) =>
        right.missedProviderAnswerCount - left.missedProviderAnswerCount ||
        right.questionCount - left.questionCount ||
        left.category.localeCompare(right.category),
    )
    .slice(0, Math.max(limit, 0));
}

export function buildCompetitorSignals(
  rows: readonly ResultInsightRow[],
  configuredCompetitors: readonly string[] = [],
): CompetitorSignal[] {
  const signals = new Map<
    string,
    CompetitorSignal & { questionIds: Set<string>; providers: Set<string> }
  >();

  for (const name of configuredCompetitors) {
    const key = normalizeName(name);
    if (!key) continue;
    signals.set(key, {
      name,
      answerCount: 0,
      questionCount: 0,
      providerCount: 0,
      displacedAnswerCount: 0,
      questionIds: new Set(),
      providers: new Set(),
    });
  }

  for (const row of rows) {
    if (!row.result?.scoreEligible) continue;

    for (const mention of uniqueByNormalizedName(row.result.competitorMentions)) {
      const key = normalizeName(mention.name);
      if (!key) continue;
      const signal = signals.get(key) ?? {
        name: mention.name.trim(),
        answerCount: 0,
        questionCount: 0,
        providerCount: 0,
        displacedAnswerCount: 0,
        questionIds: new Set<string>(),
        providers: new Set<string>(),
      };
      signal.answerCount += 1;
      if (!row.result.targetMentioned) signal.displacedAnswerCount += 1;
      signal.questionIds.add(row.question.id);
      if (row.job) signal.providers.add(row.job.provider);
      signals.set(key, signal);
    }
  }

  return [...signals.values()]
    .map(({ questionIds, providers, ...signal }) => ({
      ...signal,
      questionCount: questionIds.size,
      providerCount: providers.size,
    }))
    .sort(
      (left, right) =>
        right.answerCount - left.answerCount ||
        left.name.localeCompare(right.name),
    );
}

export function buildSourceSignals(
  rows: readonly ResultInsightRow[],
  canonicalDomain: string,
): SourceSignal[] {
  const owned = normalizeDomain(canonicalDomain);
  const signals = new Map<
    string,
    SourceSignal & { questionIds: Set<string>; providers: Set<string> }
  >();

  for (const row of rows) {
    if (!row.result?.scoreEligible) continue;
    const sources = uniqueSourcesByDomain(row.result.sources);

    for (const source of sources) {
      if (
        !source.domain ||
        source.domain === owned ||
        source.domain.endsWith(`.${owned}`)
      ) {
        continue;
      }

      const signal = signals.get(source.domain) ?? {
        domain: source.domain,
        answerCount: 0,
        questionCount: 0,
        providerCount: 0,
        missedAnswerCount: 0,
        url: source.url,
        questionIds: new Set<string>(),
        providers: new Set<string>(),
      };
      signal.answerCount += 1;
      if (!row.result.targetMentioned) signal.missedAnswerCount += 1;
      signal.questionIds.add(row.question.id);
      if (row.job) signal.providers.add(row.job.provider);
      signals.set(source.domain, signal);
    }
  }

  return [...signals.values()]
    .map(({ questionIds, providers, ...signal }) => ({
      ...signal,
      questionCount: questionIds.size,
      providerCount: providers.size,
    }))
    .sort(
      (left, right) =>
        right.missedAnswerCount - left.missedAnswerCount ||
        right.questionCount - left.questionCount ||
        right.answerCount - left.answerCount ||
        left.domain.localeCompare(right.domain),
    );
}

function questionAgreement(
  mentionedProviderCount: number,
  eligibleProviderCount: number,
  groundedProviderCount: number,
  expectedProviderCount: number,
): QuestionAgreement {
  if (eligibleProviderCount === 0) return "insufficient";
  if (groundedProviderCount < expectedProviderCount) return "partial";
  if (mentionedProviderCount === 0) return "unanimous_miss";
  if (mentionedProviderCount === eligibleProviderCount) {
    return "unanimous_mention";
  }
  return "mixed";
}

function rankNames(values: readonly string[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, { name: string; count: number }>();

  for (const value of values) {
    const key = normalizeName(value);
    if (!key) continue;
    const current = counts.get(key);
    counts.set(key, {
      name: current?.name ?? value.trim(),
      count: (current?.count ?? 0) + 1,
    });
  }

  return [...counts.values()].sort(
    (left, right) =>
      right.count - left.count || left.name.localeCompare(right.name),
  );
}

function rankSourceDomains(
  rows: readonly ResultInsightRow[],
): Array<{ domain: string; count: number; url: string }> {
  const counts = new Map<
    string,
    { domain: string; count: number; url: string }
  >();

  for (const row of rows) {
    for (const source of uniqueSourcesByDomain(row.result?.sources ?? [])) {
      const current = counts.get(source.domain);
      counts.set(source.domain, {
        domain: source.domain,
        count: (current?.count ?? 0) + 1,
        url: current?.url ?? source.url,
      });
    }
  }

  return [...counts.values()].sort(
    (left, right) =>
      right.count - left.count || left.domain.localeCompare(right.domain),
  );
}

function uniqueByNormalizedName<T extends { name: string }>(
  values: readonly T[],
): T[] {
  return [
    ...new Map(
      values
        .map((value) => [normalizeName(value.name), value] as const)
        .filter(([key]) => key.length > 0),
    ).values(),
  ];
}

function uniqueSourcesByDomain(
  sources: readonly { url: string }[],
): Array<{ domain: string; url: string }> {
  const byDomain = new Map<string, string>();

  for (const source of sources) {
    const domain = safeHostname(source.url);
    if (domain && !byDomain.has(domain)) byDomain.set(domain, source.url);
  }

  return [...byDomain.entries()].map(([domain, url]) => ({ domain, url }));
}

function safeHostname(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return normalizeDomain(url.hostname);
  } catch {
    return null;
  }
}

function normalizeDomain(value: string): string {
  return value.replace(/^https?:\/\//u, "").split("/")[0]!.replace(/^www\./u, "").toLocaleLowerCase("en-US");
}

function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function cleanLabel(value: string): string {
  return value
    .replace(/[_-]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
    .replace(/^./u, (character) => character.toLocaleUpperCase("en-US"));
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
