import type {
  ActionPlanCategory,
  ActionPlanConfidence,
  CompetitorMention,
  NormalizedSource,
} from "@/lib/db/schema";

export const ACTION_PLAN_VERSION = "action-plan-v2";

export type ActionPlanEvidenceRow = {
  resultId: string;
  questionId: string;
  questionText: string;
  category: string;
  cohort: "discovery" | "diagnostic";
  scoreEligible: boolean;
  targetMentioned: boolean;
  prominence: "lead" | "shortlist" | "incidental" | "absent";
  ownedDomainCited: boolean;
  competitorMentions: CompetitorMention[];
  sources: NormalizedSource[];
};

export type ActionPlanRecommendation = {
  rank: number;
  category: ActionPlanCategory;
  title: string;
  rationale: string;
  action: string;
  evidenceResultIds: string[];
  sourceUrls: string[];
  confidence: ActionPlanConfidence;
  analysisVersion: typeof ACTION_PLAN_VERSION;
};

export function buildActionPlan(
  rows: ActionPlanEvidenceRow[],
  canonicalDomain: string,
): ActionPlanRecommendation[] {
  const eligible = rows.filter((row) => row.scoreEligible);
  const discovery = eligible.filter((row) => row.cohort === "discovery");
  const missed = discovery.filter((row) => !row.targetMentioned);
  const appeared = discovery.filter((row) => row.targetMentioned);
  const recommendations: Omit<ActionPlanRecommendation, "rank">[] = [];

  const missedByCategory = groupBy(missed, (row) => cleanLabel(row.category));
  const categoryGaps = [...missedByCategory.entries()]
    .filter(([category]) => category.length > 0)
    .sort(
      ([leftName, leftRows], [rightName, rightRows]) =>
        distinctQuestionCount(rightRows) - distinctQuestionCount(leftRows) ||
        leftName.localeCompare(rightName),
    )
    .slice(0, 2);

  for (const [category, categoryRows] of categoryGaps) {
    const questionCount = distinctQuestionCount(categoryRows);
    const competitors = topCompetitors(categoryRows, 3);
    recommendations.push({
      category: "content_gap",
      title: `Strengthen the ${category.toLocaleLowerCase("en-US")} answer`,
      rationale: `The brand was absent from grounded answers across ${questionCount} discovery ${plural(questionCount, "question")}${competitors.length ? ` while ${formatList(competitors)} appeared` : ""}.`,
      action: `Publish or improve one focused page that directly answers these buyer questions with specific capabilities, constraints, proof, and comparisons. Re-run the same benchmark after the page is indexed.`,
      evidenceResultIds: unique(categoryRows.map((row) => row.resultId)),
      sourceUrls: uniqueSourceUrls(categoryRows, canonicalDomain).slice(0, 5),
      confidence: confidenceForCount(questionCount),
      analysisVersion: ACTION_PLAN_VERSION,
    });
  }

  const competitorCounts = countCompetitors(missed);
  const [topCompetitor] = [...competitorCounts.entries()].sort(
    ([leftName, leftCount], [rightName, rightCount]) =>
      rightCount - leftCount || leftName.localeCompare(rightName),
  );

  if (topCompetitor) {
    const [competitor, count] = topCompetitor;
    const evidence = missed.filter((row) =>
      row.competitorMentions.some(
        (mention) => normalizeName(mention.name) === normalizeName(competitor),
      ),
    );
    recommendations.push({
      category: "competitor_gap",
      title: `Close the evidence gap with ${competitor}`,
      rationale: `${competitor} appeared in grounded answers across ${count} discovery ${plural(count, "question")} where the brand did not.`,
      action: `Review the cited evidence behind those answers, then add verifiable differentiators and comparison-ready facts to the most relevant owned page. Do not copy competitor claims or imply guaranteed placement.`,
      evidenceResultIds: unique(evidence.map((row) => row.resultId)),
      sourceUrls: uniqueSourceUrls(evidence, canonicalDomain).slice(0, 5),
      confidence: confidenceForCount(count),
      analysisVersion: ACTION_PLAN_VERSION,
    });
  }

  const authorityDomains = countSourceDomains(missed, canonicalDomain);
  const [topAuthority] = [...authorityDomains.entries()].sort(
    ([leftDomain, leftCount], [rightDomain, rightCount]) =>
      rightCount - leftCount || leftDomain.localeCompare(rightDomain),
  );

  if (topAuthority) {
    const [domain, count] = topAuthority;
    const evidence = missed.filter((row) =>
      row.sources.some((source) => safeHostname(source.url) === domain),
    );
    recommendations.push({
      category: "authority_source",
      title: `Build credible visibility on ${domain}`,
      rationale: `${domain} was cited across ${count} grounded ${plural(count, "question")} that omitted the brand.`,
      action: `Look for an editorially appropriate way to earn inclusion on this source—such as a directory profile, expert contribution, review, integration listing, or original research worth citing.`,
      evidenceResultIds: unique(evidence.map((row) => row.resultId)),
      sourceUrls: unique(
        evidence.flatMap((row) =>
          row.sources
            .filter((source) => safeHostname(source.url) === domain)
            .map((source) => source.url),
        ),
      ).slice(0, 5),
      confidence: confidenceForCount(count),
      analysisVersion: ACTION_PLAN_VERSION,
    });
  }

  const uncitedMentions = eligible.filter(
    (row) => row.targetMentioned && !row.ownedDomainCited,
  );
  if (uncitedMentions.length > 0) {
    const questionCount = distinctQuestionCount(uncitedMentions);
    recommendations.push({
      category: "citation_gap",
      title: "Make owned evidence easier to cite",
      rationale: `At least one grounded answer across ${questionCount} ${plural(questionCount, "question")} mentioned the brand without citing the claimed domain.`,
      action: `Give key claims permanent, crawlable URLs with descriptive headings, concise definitions, dates, authorship, and primary evidence. Link related proof from the canonical product page.`,
      evidenceResultIds: unique(uncitedMentions.map((row) => row.resultId)),
      sourceUrls: uniqueSourceUrls(uncitedMentions, canonicalDomain).slice(0, 5),
      confidence: confidenceForCount(questionCount),
      analysisVersion: ACTION_PLAN_VERSION,
    });
  }

  const weakMentions = appeared.filter(
    (row) => row.prominence === "incidental" || row.prominence === "absent",
  );
  if (weakMentions.length > 0) {
    const questionCount = distinctQuestionCount(weakMentions);
    recommendations.push({
      category: "mention_quality",
      title: "Turn incidental mentions into shortlist evidence",
      rationale: `Grounded answers across ${questionCount} discovery ${plural(questionCount, "question")} mentioned the brand without placing it prominently.`,
      action: `Clarify the category, ideal customer, strongest use cases, and defensible proof in concise language that third-party sources can repeat accurately.`,
      evidenceResultIds: unique(weakMentions.map((row) => row.resultId)),
      sourceUrls: uniqueSourceUrls(weakMentions, canonicalDomain).slice(0, 5),
      confidence: confidenceForCount(questionCount),
      analysisVersion: ACTION_PLAN_VERSION,
    });
  }

  return recommendations
    .filter((recommendation) => recommendation.evidenceResultIds.length > 0)
    .slice(0, 5)
    .map((recommendation, index) => ({ ...recommendation, rank: index + 1 }));
}

function groupBy<T>(rows: T[], key: (row: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const value = key(row);
    groups.set(value, [...(groups.get(value) ?? []), row]);
  }
  return groups;
}

function countCompetitors(rows: ActionPlanEvidenceRow[]): Map<string, number> {
  const counts = new Map<
    string,
    { name: string; questionIds: Set<string> }
  >();
  for (const row of rows) {
    const seen = new Set<string>();
    for (const mention of row.competitorMentions) {
      const key = normalizeName(mention.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const current = counts.get(key);
      counts.set(key, {
        name: current?.name ?? mention.name.trim(),
        questionIds: new Set([
          ...(current?.questionIds ?? []),
          row.questionId,
        ]),
      });
    }
  }
  return new Map(
    [...counts.values()].map(({ name, questionIds }) => [
      name,
      questionIds.size,
    ]),
  );
}

function topCompetitors(rows: ActionPlanEvidenceRow[], limit: number): string[] {
  return [...countCompetitors(rows).entries()]
    .sort(
      ([leftName, leftCount], [rightName, rightCount]) =>
        rightCount - leftCount || leftName.localeCompare(rightName),
    )
    .slice(0, limit)
    .map(([name]) => name);
}

function countSourceDomains(
  rows: ActionPlanEvidenceRow[],
  canonicalDomain: string,
): Map<string, number> {
  const counts = new Map<string, Set<string>>();
  const owned = canonicalDomain.toLocaleLowerCase("en-US");
  for (const row of rows) {
    const seen = new Set<string>();
    for (const source of row.sources) {
      const hostname = safeHostname(source.url);
      if (!hostname || hostname === owned || hostname.endsWith(`.${owned}`) || seen.has(hostname)) {
        continue;
      }
      seen.add(hostname);
      counts.set(
        hostname,
        new Set([...(counts.get(hostname) ?? []), row.questionId]),
      );
    }
  }
  return new Map(
    [...counts.entries()].map(([hostname, questionIds]) => [
      hostname,
      questionIds.size,
    ]),
  );
}

function uniqueSourceUrls(
  rows: ActionPlanEvidenceRow[],
  canonicalDomain: string,
): string[] {
  const owned = canonicalDomain.toLocaleLowerCase("en-US");
  return unique(
    rows.flatMap((row) =>
      row.sources
        .filter((source) => {
          const hostname = safeHostname(source.url);
          return hostname && hostname !== owned && !hostname.endsWith(`.${owned}`);
        })
        .map((source) => source.url),
    ),
  );
}

function safeHostname(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.hostname.replace(/^www\./u, "").toLocaleLowerCase("en-US");
  } catch {
    return null;
  }
}

function cleanLabel(value: string): string {
  return value.replace(/[_-]+/gu, " ").replace(/\s+/gu, " ").trim();
}

function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function confidenceForCount(count: number): ActionPlanConfidence {
  if (count >= 4) return "high";
  if (count >= 2) return "medium";
  return "low";
}

function distinctQuestionCount(rows: ActionPlanEvidenceRow[]): number {
  return new Set(rows.map((row) => row.questionId)).size;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function plural(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`;
}

function formatList(values: string[]): string {
  if (values.length <= 1) return values[0] ?? "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}
