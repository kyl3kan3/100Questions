"use client";

import {
  AlertTriangle,
  BookOpenText,
  ChevronDown,
  ExternalLink,
  LoaderCircle,
  Network,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trackEvent } from "@/lib/analytics";
import {
  buildCompetitorSignals,
  buildOpportunityThemes,
  buildQuestionInsights,
  buildSourceSignals,
  summarizeQuestionInsights,
  type CompetitorSignal,
  type InsightSummary,
  type OpportunityTheme,
  type QuestionInsight,
  type SourceSignal,
} from "@/lib/result-insights";

type Provider = "openai" | "anthropic" | "google" | "xai";

const providerOrder: Provider[] = ["openai", "anthropic", "google", "xai"];
const providerLabels: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Claude",
  google: "Gemini",
  xai: "Grok",
};

type RunState = {
  id: string;
  subjectName: string;
  canonicalDomain: string;
  status: string;
  questionCountPlanned: number;
  providerCallsPlanned: number;
  questionsGenerated: number;
  eligibleProviderCalls: number;
  succeededProviderCalls: number;
  failedProviderCalls: number;
  createdAt: string;
  competitors: string[];
  frozenModels: Record<string, string>;
  failureMessage: string | null;
  workflowRunId: string | null;
  baselineRunId: string | null;
};

type ResultRow = {
  question: {
    id: string;
    text: string;
    category: string;
    cohort: "discovery" | "diagnostic";
    sortOrder: number;
  };
  job: null | {
    id: string;
    provider: Provider;
    status: string;
    errorMessage: string | null;
  };
  result: null | {
    id: string;
    answerText: string;
    sources: Array<{ url: string; title: string | null; publisher: string | null }>;
    requiredAttribution: Array<{
      label: string;
      url: string | null;
      text: string | null;
    }>;
    groundingStatus: string;
    scoreEligible: boolean;
    exclusionReason: string | null;
    targetMentioned: boolean;
    prominence: string;
    sentiment: string | null;
    ownedDomainCited: boolean;
    competitorMentions: Array<{
      name: string;
      sentiment: "positive" | "neutral" | "negative" | null;
    }>;
  };
};

type RatioMetric = { numerator: number; denominator: number; value: number | null };

type MetricsPayload = {
  coverage: RatioMetric;
  discoveryVisibility: RatioMetric;
  conservativeVisibilityFloor: RatioMetric;
  claimedDomainCitationRate: RatioMetric;
  shareOfVoice: RatioMetric;
  prominence: { value: number | null; denominator: number };
  sentiment: {
    denominator: number;
    positive: RatioMetric;
    neutral: RatioMetric;
    negative: RatioMetric;
    unknown: RatioMetric;
  };
  provisional: boolean;
};

type ResultsPayload = {
  run: RunState;
  rows: ResultRow[];
  metrics: MetricsPayload;
  providerMetrics: Partial<Record<Provider, MetricsPayload>>;
  providers?: Provider[];
  categories: string[];
  actionPlan: Array<{
    id: string;
    rank: number;
    category: string;
    title: string;
    rationale: string;
    action: string;
    evidenceResultIds: string[];
    sourceUrls: string[];
    confidence: "high" | "medium" | "low";
    analysisVersion: string;
  }>;
};

type ComparisonPayload = {
  metrics: Record<"visibility" | "citations" | "coverage", { baseline: number | null; current: number | null; delta: number | null }> & {
    competitorMentions: { baseline: number; current: number; delta: number };
  };
  modelChanges: Array<{ key: string; baseline: string | null; current: string | null }>;
  history: Array<{
    runId: string;
    completedAt: string | null;
    status: string;
    metrics: {
      visibility: number | null;
      citations: number | null;
      coverage: number | null;
      competitorMentions: number;
    };
    modelChanges: Array<{
      key: string;
      baseline: string | null;
      current: string | null;
    }>;
  }>;
};

const terminalStatuses = new Set(["complete", "partial", "failed", "cancelled"]);
const MAX_CONSECUTIVE_AUTHENTICATION_FAILURES = 3;

export function RunProgress({ initialRun }: { initialRun: RunState }) {
  const [payload, setPayload] = useState<ResultsPayload | null>(null);
  const [run, setRun] = useState(initialRun);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateWillRetry, setUpdateWillRetry] = useState(false);
  const [updateNeedsSignIn, setUpdateNeedsSignIn] = useState(false);
  const [cohort, setCohort] = useState<"all" | "discovery" | "diagnostic">("all");
  const [category, setCategory] = useState("all");
  const [comparison, setComparison] = useState<ComparisonPayload | null>(null);
  const viewedResult = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;
    let resultAuthenticationFailures = 0;
    let statusAuthenticationFailures = 0;
    let lastDispatchRetryAt = 0;
    const controller = new AbortController();

    function schedule(refresh: () => Promise<void>) {
      if (cancelled) return;
      const delay = Math.min(30_000, 3_000 * 2 ** Math.min(failures, 3));
      timer = setTimeout(() => void refresh(), delay);
    }

    function setPollingIssue(
      message: string,
      { retrying = false, needsSignIn = false } = {},
    ) {
      if (cancelled) return;
      setUpdateError(message);
      setUpdateWillRetry(retrying);
      setUpdateNeedsSignIn(needsSignIn);
    }

    function clearPollingIssue() {
      if (cancelled) return;
      setUpdateError(null);
      setUpdateWillRetry(false);
      setUpdateNeedsSignIn(false);
    }

    function registerAuthenticationFailure(
      source: "results" | "status",
    ): "retry" | "stop" {
      if (source === "results") {
        resultAuthenticationFailures += 1;
      } else {
        statusAuthenticationFailures += 1;
      }

      const count =
        source === "results"
          ? resultAuthenticationFailures
          : statusAuthenticationFailures;

      if (count >= MAX_CONSECUTIVE_AUTHENTICATION_FAILURES) {
        setPollingIssue("Your sign-in session expired.", { needsSignIn: true });
        return "stop";
      }

      setPollingIssue("Checking your sign-in session.", { retrying: true });
      return "retry";
    }

    async function loadResults(): Promise<"success" | "retry" | "stop"> {
      try {
        const response = await fetch(`/api/runs/${initialRun.id}/results`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          return registerAuthenticationFailure("results");
        }

        if (response.status === 404) {
          setPollingIssue("This benchmark is not available for the signed-in account.");
          return "stop";
        }

        if (!response.ok) {
          throw new Error("Result evidence is temporarily unavailable.");
        }

        resultAuthenticationFailures = 0;

        if (!cancelled) {
          const next = (await response.json()) as ResultsPayload;
          setPayload(next);
          setRun(next.run);
          clearPollingIssue();
        }

        return "success";
      } catch (error) {
        if (!cancelled && error instanceof Error && error.name !== "AbortError") {
          setPollingIssue(error.message, { retrying: true });
        }
        return "retry";
      }
    }

    async function refreshStatus() {
      try {
        if (terminalStatuses.has(initialRun.status)) {
          if ((await loadResults()) === "retry") {
            failures += 1;
            schedule(refreshStatus);
          }
          return;
        }

        const response = await fetch(`/api/runs/${initialRun.id}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          if (registerAuthenticationFailure("status") === "retry") {
            failures += 1;
            schedule(refreshStatus);
          }
          return;
        }

        if (response.status === 404) {
          setPollingIssue("This benchmark is not available for the signed-in account.");
          return;
        }

        if (!response.ok) {
          throw new Error("Live progress is temporarily unavailable.");
        }

        const next = (await response.json()) as { run: RunState };

        if (cancelled) return;
        failures = 0;
        statusAuthenticationFailures = 0;
        setRun(next.run);
        clearPollingIssue();

        if (
          next.run.status === "queued" &&
          !next.run.workflowRunId &&
          Date.now() - lastDispatchRetryAt >= 60_000 &&
          Date.now() - new Date(next.run.createdAt).getTime() >= 60_000
        ) {
          lastDispatchRetryAt = Date.now();
          await fetch(`/api/runs/${initialRun.id}/dispatch`, {
            method: "POST",
            signal: controller.signal,
          });
        }

        if (terminalStatuses.has(next.run.status)) {
          if ((await loadResults()) === "retry") {
            failures += 1;
            schedule(refreshStatus);
          }
          return;
        }

        schedule(refreshStatus);
      } catch (error) {
        if (cancelled || (error instanceof Error && error.name === "AbortError")) {
          return;
        }

        failures += 1;
        setPollingIssue(
          error instanceof Error
            ? error.message
            : "Live progress is temporarily unavailable.",
          { retrying: true },
        );
        schedule(refreshStatus);
      }
    }

    void refreshStatus();
    return () => {
      cancelled = true;
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [initialRun.id, initialRun.status]);

  useEffect(() => {
    if (!payload || viewedResult.current) return;
    viewedResult.current = true;
    trackEvent("result_viewed", { run_id: payload.run.id, status: payload.run.status });
  }, [payload]);

  useEffect(() => {
    if (!payload?.run.baselineRunId) return;
    const controller = new AbortController();
    void fetch(`/api/runs/${payload.run.id}/comparison`, { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: ComparisonPayload | null) => setComparison(data))
      .catch(() => undefined);
    return () => controller.abort();
  }, [payload?.run.baselineRunId, payload?.run.id]);

  const completedCalls = run.succeededProviderCalls + run.failedProviderCalls;
  const progress = Math.round((completedCalls / Math.max(run.providerCallsPlanned, 1)) * 100);
  const availableProviders = useMemo(() => {
    const declaredProviders = payload?.providers ?? [];
    const metricProviders = Object.keys(payload?.providerMetrics ?? {});
    const rowProviders = (payload?.rows ?? []).flatMap((row) =>
      row.job ? [row.job.provider] : [],
    );
    const frozenProviders = Object.keys(payload?.run.frozenModels ?? run.frozenModels);
    const candidates = declaredProviders.length
      ? declaredProviders
      : metricProviders.length
        ? metricProviders
        : rowProviders.length
          ? rowProviders
          : frozenProviders;

    return providerOrder.filter((candidate) => candidates.includes(candidate));
  }, [payload, run.frozenModels]);

  const questionInsights = useMemo(
    () => buildQuestionInsights(payload?.rows ?? [], availableProviders),
    [availableProviders, payload?.rows],
  );

  const filteredQuestions = useMemo(
    () =>
      questionInsights.filter(
        ({ question }) =>
          (cohort === "all" || question.cohort === cohort) &&
          (category === "all" || question.category === category),
      ),
    [category, cohort, questionInsights],
  );

  return (
    <div className="space-y-6">
      <Card className="bg-[#0b0e0c]">
        <CardHeader className="border-b border-white/[0.07] pb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow mb-2">Benchmark run</p>
              <h1 className="text-balance text-2xl font-semibold tracking-[-0.025em] text-zinc-50">
                {run.subjectName}
              </h1>
              <CardDescription className="mt-1">{run.canonicalDomain}</CardDescription>
            </div>
            <StatusBadge status={run.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div aria-live="polite" className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
            <span className="min-w-0">{statusMessage(run.status)}</span>
            <span className="shrink-0 font-mono tabular-nums">{completedCalls}/{run.providerCallsPlanned} calls</span>
          </div>
          <Progress value={progress} aria-label="Benchmark progress" />
          <div className="mt-5 grid gap-3 text-xs text-zinc-400 sm:grid-cols-3">
            <Stat label="Questions" value={`${run.questionsGenerated}/${run.questionCountPlanned}`} />
            <Stat label="Grounded answers" value={String(run.eligibleProviderCalls)} />
            <Stat label="Unavailable" value={String(run.failedProviderCalls)} />
          </div>
          {run.failureMessage ? (
            <p className="mt-5 flex items-start gap-2 rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {run.failureMessage}
            </p>
          ) : null}
          {updateError ? (
            <p role="status" aria-live="polite" className="mt-3 text-xs text-amber-200">
              {updateError}{" "}
              {updateNeedsSignIn ? (
                <Link
                  className="font-semibold underline underline-offset-4 hover:text-amber-100"
                  href="/auth/sign-in"
                >
                  Sign in again, then reopen this benchmark from the dashboard.
                </Link>
              ) : updateWillRetry ? (
                "Retrying with backoff."
              ) : null}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {payload ? (
        <ResultsOverview
          payload={payload}
          providers={availableProviders}
          comparison={comparison}
          questionInsights={questionInsights}
        />
      ) : (
        <LoadingCard terminal={terminalStatuses.has(run.status)} />
      )}

      <Card
        aria-labelledby="evidence-heading"
        className="bg-[#0b0e0c]"
        role="region"
      >
        <CardHeader className="border-b border-white/[0.07] pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <CardTitle as="h2" id="evidence-heading">Question evidence</CardTitle>
              <CardDescription className="mt-1">
                One row per buyer question. Open a row to inspect each provider&apos;s complete answer and sources.
              </CardDescription>
            </div>
            <div className="grid w-full min-w-0 gap-2 sm:grid-cols-2 md:w-auto">
              <Filter
                value={cohort}
                onChange={(value) => setCohort(value as typeof cohort)}
                options={["all", "discovery", "diagnostic"]}
                label="Question type"
                formatOption={questionTypeLabel}
              />
              <Filter value={category} onChange={setCategory} options={["all", ...(payload?.categories ?? [])]} label="Category" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredQuestions.length ? (
            filteredQuestions.map((question) => (
              <QuestionEvidenceRow key={question.question.id} insight={question} />
            ))
          ) : (
            <div className="flex min-h-36 flex-col items-center justify-center text-center">
              <Search aria-hidden="true" className="mb-3 size-5 text-zinc-400" />
              <p className="text-sm text-zinc-400">No answers in this view yet.</p>
              <p className="mt-1 text-xs text-zinc-400">Answer evidence loads once the run reaches a terminal state.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResultsOverview({
  payload,
  providers,
  comparison,
  questionInsights,
}: {
  payload: ResultsPayload;
  providers: Provider[];
  comparison: ComparisonPayload | null;
  questionInsights: Array<QuestionInsight<ResultRow>>;
}) {
  const metrics = payload.metrics;
  const discoveryRows = payload.rows.filter(
    (row) =>
      row.question.cohort === "discovery" &&
      row.job &&
      row.result?.scoreEligible,
  );
  const unscoredDiscoveryCount = Math.max(
    metrics.conservativeVisibilityFloor.denominator - discoveryRows.length,
    0,
  );
  const discoveryQuestions = questionInsights.filter(
    ({ question }) => question.cohort === "discovery",
  );
  const summary = summarizeQuestionInsights(discoveryQuestions);
  const themes = buildOpportunityThemes(discoveryQuestions);
  const competitors = buildCompetitorSignals(
    discoveryRows,
    payload.run.competitors ?? [],
  );
  const sources = buildSourceSignals(
    discoveryRows,
    payload.run.canonicalDomain,
  );
  const providerEntries = providers.flatMap((provider) => {
    const providerMetrics = payload.providerMetrics[provider];
    return providerMetrics ? [{ provider, metrics: providerMetrics }] : [];
  });
  const visibility = metrics.discoveryVisibility;
  const evidenceQuestions = new Map(
    questionInsights.flatMap((question) =>
      question.resultIds.map((resultId) => [resultId, question] as const),
    ),
  );

  return (
    <section aria-labelledby="results-heading" className="space-y-6">
      <ExecutiveVerdict
        subjectName={payload.run.subjectName}
        summary={summary}
        visibility={visibility}
        provisional={metrics.provisional}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PlainMetric
          label="Buyer-question reach"
          value={`${summary.reachedDiscoveryQuestionCount}/${summary.evaluatedDiscoveryQuestionCount}`}
          detail="Distinct discovery questions where at least one grounded AI answer mentioned you"
          tone={summary.reachedDiscoveryQuestionCount > 0 ? "positive" : "negative"}
        />
        <PlainMetric
          label="Mixed provider signals"
          value={`${summary.mixedCount} questions`}
          detail="Questions where grounded providers disagreed on whether to mention you"
          tone={summary.mixedCount > 0 ? "negative" : "positive"}
        />
        <PlainMetric
          label="Unanimous misses"
          value={`${summary.unanimousMissCount} questions`}
          detail="Distinct questions where no grounded provider mentioned you"
          tone={summary.unanimousMissCount > 0 ? "negative" : "positive"}
        />
        <PlainMetric
          label="Your site was cited"
          value={percent(metrics.claimedDomainCitationRate.value)}
          detail={`${metrics.claimedDomainCitationRate.numerator} of ${metrics.claimedDomainCitationRate.denominator} grounded answers`}
        />
      </div>

      <OpportunityThemesSection themes={themes} />

      <ProviderAgreement
        entries={providerEntries}
        overallVisibility={visibility.value}
        summary={summary}
      />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <CompetitorComparison
          subjectName={payload.run.subjectName}
          subjectCount={visibility.numerator}
          subjectQuestionCount={summary.reachedDiscoveryQuestionCount}
          competitors={competitors}
          denominator={discoveryRows.length}
        />
        <SourceIntelligence sources={sources} />
      </div>

      <ActionPlanSection
        evidenceQuestions={evidenceQuestions}
        items={payload.actionPlan}
      />

      {comparison ? <BaselineComparison comparison={comparison} /> : null}

      <ReliabilityPanel
        metrics={metrics}
        summary={summary}
        unscoredDiscoveryCount={unscoredDiscoveryCount}
      />
    </section>
  );
}

function ExecutiveVerdict({
  subjectName,
  summary,
  visibility,
  provisional,
}: {
  subjectName: string;
  summary: InsightSummary;
  visibility: RatioMetric;
  provisional: boolean;
}) {
  const verdict = executiveVerdict(subjectName, summary, visibility);

  return (
    <Card className="bg-[#0b0e0c] shadow-[0_20px_60px_rgba(0,0,0,0.22),inset_0_0_0_1px_rgba(255,255,255,0.07)]">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">Executive verdict</p>
              <Badge variant={provisional ? "warning" : "success"}>
                {provisional ? "Directional coverage" : "Coverage threshold met"}
              </Badge>
            </div>
            <h2
              id="results-heading"
              className="mt-4 text-balance text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl"
            >
              {verdict}
            </h2>
            <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-zinc-400">
              Reached {summary.reachedDiscoveryQuestionCount} of{" "}
              {summary.evaluatedDiscoveryQuestionCount} evaluated buyer questions across{" "}
              {summary.groundedProviderCount} {plural(summary.groundedProviderCount, "grounded provider")}. Question reach and provider breadth are counted separately.
            </p>
          </div>
          <div className="shrink-0 lg:text-right">
            <p className="text-5xl font-semibold tracking-[-0.06em] text-white tabular-nums">
              {percent(visibility.value)}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              of grounded discovery answers
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OpportunityThemesSection({ themes }: { themes: OpportunityTheme[] }) {
  return (
    <section aria-labelledby="opportunity-themes-heading">
      <div className="mb-4">
        <p className="eyebrow">Opportunity themes</p>
        <h2
          id="opportunity-themes-heading"
          className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white"
        >
          Where visibility breaks down
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          Ranked by missed grounded provider answers, grouped into distinct buyer-question themes.
        </p>
      </div>
      {themes.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {themes.map((theme, index) => (
            <Card key={theme.category} className="bg-[#0b0e0c]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-amber-300/12 text-xs font-semibold text-amber-200">
                    {index + 1}
                  </span>
                  <Badge variant="secondary">
                    {theme.questionCount} {plural(theme.questionCount, "question")}
                  </Badge>
                </div>
                <h3 className="mt-4 text-base font-semibold text-zinc-100">
                  {theme.category}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Missed in {theme.missedProviderAnswerCount} of{" "}
                  {theme.groundedProviderAnswerCount} grounded provider answers.
                </p>
                <p className="mt-3 text-xs leading-5 text-zinc-400">
                  {theme.unanimousMissCount > 0
                    ? `${theme.unanimousMissCount} unanimous ${plural(theme.unanimousMissCount, "miss")}. `
                    : ""}
                  {theme.mixedCount > 0
                    ? `${theme.mixedCount} mixed-signal ${plural(theme.mixedCount, "question")}.`
                    : ""}
                  {theme.topCompetitor
                    ? ` Most frequent competitor: ${theme.topCompetitor}.`
                    : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-[#0b0e0c]">
          <CardContent className="p-5 text-sm text-zinc-400">
            No question theme contained a grounded visibility gap.
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function ProviderAgreement({
  entries,
  overallVisibility,
  summary,
}: {
  entries: Array<{ provider: Provider; metrics: MetricsPayload }>;
  overallVisibility: number | null;
  summary: InsightSummary;
}) {
  return (
    <Card className="bg-[#0b0e0c]">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200">
            <Network aria-hidden="true" className="size-4" />
          </div>
          <div>
            <CardTitle as="h2">AI agreement and provider differences</CardTitle>
            <CardDescription className="mt-1">
              Agreement is measured per distinct question. Provider rates describe mention behavior, not answer accuracy.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <AgreementStat label="All mentioned you" value={summary.unanimousMentionCount} />
          <AgreementStat label="Providers disagreed" value={summary.mixedCount} />
          <AgreementStat label="All missed you" value={summary.unanimousMissCount} />
          <AgreementStat label="Partial provider coverage" value={summary.partialCoverageCount} />
        </div>
        <div className="space-y-2">
          {entries.map(({ provider, metrics }) => {
            const visibility = metrics.discoveryVisibility;
            const delta =
              visibility.value === null || overallVisibility === null
                ? null
                : visibility.value - overallVisibility;
            return (
              <div
                key={provider}
                className="flex flex-col gap-2 rounded-xl bg-white/[0.025] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {providerLabels[provider]}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400 tabular-nums">
                    {visibility.numerator} of {visibility.denominator} grounded discovery answers
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xl font-semibold text-white tabular-nums">
                    {percent(visibility.value)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {providerDifference(delta)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function AgreementStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/[0.025] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-400">distinct questions</p>
    </div>
  );
}

function SourceIntelligence({ sources }: { sources: SourceSignal[] }) {
  const recurringSources = sources.filter(
    (source) => source.questionCount > 1 || source.providerCount > 1,
  );

  return (
    <Card className="bg-[#0b0e0c]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
            <BookOpenText aria-hidden="true" className="size-4" />
          </div>
          <div>
            <CardTitle as="h2" className="text-base">Recurring cited domains</CardTitle>
            <CardDescription className="mt-1">
              External domains repeatedly cited in grounded discovery answers. Recurrence does not prove source quality or influence.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {recurringSources.slice(0, 6).map((source) => (
          <div
            key={source.domain}
            className="rounded-xl bg-white/[0.025] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]"
          >
            <a
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-200 underline-offset-4 hover:text-white hover:underline"
              href={source.url}
              rel="noreferrer"
              target="_blank"
            >
              {source.domain}
              <ExternalLink aria-hidden="true" className="size-3" />
            </a>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {source.questionCount} {plural(source.questionCount, "question")} · {source.providerCount} {plural(source.providerCount, "provider")} · {source.missedAnswerCount} missed answer {plural(source.missedAnswerCount, "event")}
            </p>
          </div>
        ))}
        {recurringSources.length === 0 ? (
          <p className="rounded-xl bg-white/[0.025] p-4 text-sm text-zinc-400">
            No recurring external source domains were detected.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ReliabilityPanel({
  metrics,
  summary,
  unscoredDiscoveryCount,
}: {
  metrics: MetricsPayload;
  summary: InsightSummary;
  unscoredDiscoveryCount: number;
}) {
  return (
    <Card className="bg-[#0b0e0c]">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300">
            <ShieldCheck aria-hidden="true" className="size-4" />
          </div>
          <div>
            <CardTitle as="h2">Reliability, coverage, and limits</CardTitle>
            <CardDescription className="mt-1">
              Execution quality for this benchmark—not a claim that every AI answer is factually correct.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ReliabilityStat label="Distinct questions" value={summary.discoveryQuestionCount} />
          <ReliabilityStat label="Grounded provider breadth" value={summary.groundedProviderCount} />
          <ReliabilityStat label="Grounded answers" value={metrics.coverage.numerator} />
          <ReliabilityStat label="Excluded discovery answers" value={unscoredDiscoveryCount} />
        </div>
        <p className="mt-4 text-pretty text-xs leading-5 text-zinc-400">
          {metrics.provisional
            ? "Overall answer coverage was below 90%, so percentages should be treated as directional."
            : "Overall answer coverage met the 90% reliability threshold."}{" "}
          Failed or ungrounded answers are excluded rather than counted as brand misses.
        </p>
      </CardContent>
    </Card>
  );
}

function ReliabilityStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/[0.025] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white tabular-nums">{value}</p>
    </div>
  );
}

function ActionPlanSection({
  evidenceQuestions,
  items,
}: {
  evidenceQuestions: Map<string, QuestionInsight<ResultRow>>;
  items: ResultsPayload["actionPlan"];
}) {
  const primary = items.slice(0, 3);
  const additional = items.slice(3);

  return (
    <Card className="border border-emerald-300/15 bg-emerald-300/[0.025]">
      <CardHeader>
        <p className="eyebrow">Prioritized action plan</p>
        <CardTitle as="h2" className="text-xl">What to do next</CardTitle>
        <CardDescription>
          The three highest-priority actions, linked to distinct buyer questions and their stored evidence. Opportunities do not guarantee ranking gains.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {primary.length ? (
          primary.map((item) => (
            <ActionPlanItem
              evidenceQuestions={evidenceQuestions}
              item={item}
              key={item.id}
            />
          ))
        ) : (
          <p className="rounded-xl bg-white/[0.03] p-4 text-sm text-zinc-400">
            This run did not contain enough stored evidence for a responsible action plan.
          </p>
        )}
        {additional.length ? (
          <details className="group rounded-2xl bg-black/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-200 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300/60">
              Show {additional.length} additional {plural(additional.length, "action")}
              <ChevronDown aria-hidden="true" className="size-4 text-zinc-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-3 border-t border-white/[0.07] p-3">
              {additional.map((item) => (
                <ActionPlanItem
                  evidenceQuestions={evidenceQuestions}
                  item={item}
                  key={item.id}
                />
              ))}
            </div>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ActionPlanItem({
  evidenceQuestions,
  item,
}: {
  evidenceQuestions: Map<string, QuestionInsight<ResultRow>>;
  item: ResultsPayload["actionPlan"][number];
}) {
  const linkedQuestions = [
    ...new Map(
      item.evidenceResultIds.flatMap((resultId) => {
        const question = evidenceQuestions.get(resultId);
        return question
          ? [[question.question.id, question] as const]
          : [];
      }),
    ).values(),
  ];

  return (
    <article className="rounded-2xl bg-black/20 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
      <div className="flex items-start gap-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-300 text-sm font-semibold text-emerald-950">
          {item.rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-medium text-zinc-100">{item.title}</h3>
            <Badge variant="secondary">{item.confidence} confidence</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{item.action}</p>
          <p className="mt-2 text-xs leading-5 text-zinc-400">
            Why: {item.rationale}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {linkedQuestions.slice(0, 4).map((question, index) => (
              <a
                aria-label={`View evidence for ${question.question.text}`}
                className="text-emerald-300 underline-offset-4 hover:text-emerald-200 hover:underline"
                href={`#question-evidence-${question.question.id}`}
                key={question.question.id}
              >
                Evidence question {index + 1}
              </a>
            ))}
            {item.sourceUrls.slice(0, 3).map((url, index) => (
              <a
                aria-label={`Open source ${index + 1} for ${item.title}`}
                className="inline-flex items-center gap-1 text-zinc-300 underline-offset-4 hover:text-white hover:underline"
                href={url}
                key={url}
                rel="noreferrer"
                target="_blank"
              >
                Source {index + 1} <ExternalLink aria-hidden="true" className="size-3" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function BaselineComparison({ comparison }: { comparison: ComparisonPayload }) {
  const entries = [
    ["Visibility", comparison.metrics.visibility, true],
    ["Owned citations", comparison.metrics.citations, true],
    ["Answer coverage", comparison.metrics.coverage, true],
    ["Competitor mentions", comparison.metrics.competitorMentions, false],
  ] as const;
  return (
    <Card className="bg-[#0b0e0c]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <TrendingUp className="size-5 text-emerald-300" />
          <div>
            <CardTitle as="h2" className="text-base">Benchmark history</CardTitle>
            <CardDescription>
              The same frozen questions measured across reruns, with model updates called out.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BenchmarkTrend history={comparison.history} />
        <div className="my-6 border-t border-white/[0.07]" />
        <div className="mb-3">
          <p className="text-sm font-medium text-zinc-200">Change from previous run</p>
          <p className="mt-1 text-pretty text-xs leading-5 text-zinc-400">
            Directional movement between the latest snapshot and its direct baseline.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {entries.map(([label, metric, ratio]) => <div key={label} className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-zinc-400">{label}</p><p className="mt-2 text-xl font-semibold tabular-nums">{ratio ? percent(metric.current) : metric.current}</p><p className={`mt-1 text-xs tabular-nums ${metric.delta !== null && metric.delta > 0 ? "text-emerald-300" : metric.delta !== null && metric.delta < 0 ? "text-red-300" : "text-zinc-400"}`}>{formatDelta(metric.delta, ratio)}</p></div>)}
        </div>
        {comparison.modelChanges.length ? (
          <p className="mt-4 rounded-xl bg-amber-300/[0.06] px-4 py-3 text-xs leading-5 text-amber-100">
            Model versions changed for {comparison.modelChanges.map(({ key }) => humanize(key)).join(", ")}. Treat deltas as directional because both product changes and model changes may contribute.
          </p>
        ) : (
          <p className="mt-4 text-xs leading-5 text-zinc-400">
            Provider model versions were unchanged between the baseline and this run.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

type HistoryPoint = ComparisonPayload["history"][number];
type HistoryMetric = "visibility" | "citations" | "coverage";

const historySeries: Array<{
  key: HistoryMetric;
  label: string;
  color: string;
}> = [
  { key: "visibility", label: "Visibility", color: "#6ee7b7" },
  { key: "citations", label: "Owned citations", color: "#7dd3fc" },
  { key: "coverage", label: "Coverage", color: "#fcd34d" },
];

function BenchmarkTrend({ history }: { history: HistoryPoint[] }) {
  const width = 640;
  const height = 220;
  const left = 44;
  const right = 18;
  const top = 18;
  const bottom = 32;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const x = (index: number) =>
    left + (history.length === 1 ? plotWidth / 2 : (index / (history.length - 1)) * plotWidth);
  const y = (value: number) => top + (1 - value) * plotHeight;

  return (
    <div>
      <div className="rounded-2xl bg-white/[0.025] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          {historySeries.map((series) => (
            <span className="inline-flex items-center gap-2 text-xs text-zinc-300" key={series.key}>
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              {series.label}
            </span>
          ))}
        </div>
        <svg
          aria-labelledby="benchmark-trend-title benchmark-trend-description"
          className="h-auto w-full overflow-visible"
          role="img"
          viewBox={`0 0 ${width} ${height}`}
        >
          <title id="benchmark-trend-title">Benchmark metrics over time</title>
          <desc id="benchmark-trend-description">
            Visibility, owned citation rate, and answer coverage for each rerun of the same question set.
          </desc>
          {[0, 0.5, 1].map((tick) => (
            <g key={tick}>
              <line
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray={tick === 0 ? undefined : "4 6"}
                x1={left}
                x2={width - right}
                y1={y(tick)}
                y2={y(tick)}
              />
              <text
                fill="#71717a"
                fontSize="11"
                textAnchor="end"
                x={left - 9}
                y={y(tick) + 4}
              >
                {Math.round(tick * 100)}%
              </text>
            </g>
          ))}
          {historySeries.map((series) => (
            <g key={series.key}>
              {metricSegments(history, series.key, x, y).map((segment, index) => (
                <path
                  d={segment.map((point, pointIndex) => `${pointIndex ? "L" : "M"} ${point.x} ${point.y}`).join(" ")}
                  fill="none"
                  key={`${series.key}-${index}`}
                  stroke={series.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              ))}
              {history.map((snapshot, index) => {
                const value = snapshot.metrics[series.key];
                if (value === null) return null;
                return (
                  <circle
                    cx={x(index)}
                    cy={y(value)}
                    fill="#0b0e0c"
                    key={`${series.key}-${snapshot.runId}`}
                    r="4"
                    stroke={series.color}
                    strokeWidth="2.5"
                  >
                    <title>
                      {series.label}: {percent(value)} on {formatSnapshotDate(snapshot.completedAt)}
                    </title>
                  </circle>
                );
              })}
            </g>
          ))}
          <text fill="#71717a" fontSize="11" x={left} y={height - 7}>
            {formatSnapshotDate(history[0]?.completedAt ?? null)}
          </text>
          <text
            fill="#71717a"
            fontSize="11"
            textAnchor="end"
            x={width - right}
            y={height - 7}
          >
            {formatSnapshotDate(history.at(-1)?.completedAt ?? null)}
          </text>
        </svg>
      </div>

      <ol className="mt-3 grid grid-flow-col auto-cols-[minmax(13rem,1fr)] gap-2 overflow-x-auto pb-2">
        {history.map((snapshot, index) => {
          const current = index === history.length - 1;
          return (
            <li
              className="rounded-2xl bg-white/[0.025] p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]"
              key={snapshot.runId}
            >
              <Link
                className="block min-h-28 rounded-lg p-3 transition-[background-color] duration-150 hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
                href={`/runs/${snapshot.runId}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-zinc-400">
                    {formatSnapshotDate(snapshot.completedAt)}
                  </p>
                  {current ? <Badge variant="success">Current</Badge> : null}
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white tabular-nums">
                  {percent(snapshot.metrics.visibility)}
                </p>
                <p className="text-xs text-zinc-400">visibility</p>
                <p className="mt-3 text-pretty text-[11px] leading-4 text-zinc-400">
                  {index === 0
                    ? "Baseline snapshot"
                    : snapshot.modelChanges.length
                      ? `Model update: ${snapshot.modelChanges.map(({ key }) => humanize(key)).join(", ")}`
                      : "Provider models unchanged"}
                </p>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function metricSegments(
  history: HistoryPoint[],
  metric: HistoryMetric,
  x: (index: number) => number,
  y: (value: number) => number,
) {
  const segments: Array<Array<{ x: number; y: number }>> = [];
  let current: Array<{ x: number; y: number }> = [];

  history.forEach((snapshot, index) => {
    const value = snapshot.metrics[metric];
    if (value === null) {
      if (current.length) segments.push(current);
      current = [];
      return;
    }
    current.push({ x: x(index), y: y(value) });
  });

  if (current.length) segments.push(current);
  return segments;
}

function formatSnapshotDate(value: string | null) {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDelta(value: number | null, ratio: boolean) {
  if (value === null) return "No comparable value";
  const formatted = ratio ? `${Math.abs(value * 100).toFixed(1)} points` : String(Math.abs(value));
  return value === 0 ? "No change" : `${value > 0 ? "+" : "−"}${formatted} from baseline`;
}

function PlainMetric({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <Card className="bg-[#0b0e0c] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.065)]">
      <CardContent className="p-5">
        <p className="text-xs text-zinc-400">{label}</p>
        <p
          className={`mt-3 text-2xl font-semibold tracking-[-0.035em] tabular-nums ${
            tone === "positive"
              ? "text-emerald-300"
              : tone === "negative"
                ? "text-amber-200"
                : "text-white"
          }`}
        >
          {value}
        </p>
        <p className="mt-2 text-pretty text-[11px] leading-5 text-zinc-400">
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}

function CompetitorComparison({
  subjectName,
  subjectCount,
  subjectQuestionCount,
  competitors,
  denominator,
}: {
  subjectName: string;
  subjectCount: number;
  subjectQuestionCount: number;
  competitors: CompetitorSignal[];
  denominator: number;
}) {
  const entries = [
    {
      name: subjectName,
      answerCount: subjectCount,
      questionCount: subjectQuestionCount,
      subject: true,
    },
    ...competitors.slice(0, 7).map((competitor) => ({
      name: competitor.name,
      answerCount: competitor.answerCount,
      questionCount: competitor.questionCount,
      subject: false,
    })),
  ];

  return (
    <Card className="bg-[#0b0e0c]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
            <Users className="size-4" />
          </div>
          <div>
            <CardTitle as="h2" className="text-base">Competitor mention frequency</CardTitle>
            <CardDescription className="mt-1 text-pretty leading-5">
              Answer-event frequency plus the number of distinct buyer questions each name reached.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => {
          const value = denominator > 0 ? entry.answerCount / denominator : 0;
          return (
            <div key={`${entry.subject ? "subject" : "competitor"}:${entry.name}`}>
              <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
                <span className={`min-w-0 break-words ${entry.subject ? "font-medium text-emerald-300" : "text-zinc-300"}`}>
                  {entry.name}{entry.subject ? " (you)" : ""}
                </span>
                <span className="shrink-0 font-mono text-zinc-400 tabular-nums">
                  {entry.answerCount}/{denominator} · {percent(value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className={`h-full rounded-full ${entry.subject ? "bg-emerald-300" : "bg-zinc-500"}`}
                  style={{ width: `${Math.round(value * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-zinc-400">
                {entry.questionCount} distinct {plural(entry.questionCount, "question")}
              </p>
            </div>
          );
        })}
        {competitors.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No competitors were detected in grounded discovery answers.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function QuestionEvidenceRow({
  insight,
}: {
  insight: QuestionInsight<ResultRow>;
}) {
  const rows = [...insight.rows].sort(
    (left, right) =>
      providerOrder.indexOf(left.job?.provider ?? "openai") -
      providerOrder.indexOf(right.job?.provider ?? "openai"),
  );
  const agreement = agreementPresentation(insight.agreement);

  return (
    <details
      className="group scroll-mt-24 rounded-2xl bg-white/[0.025] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.065)] open:bg-white/[0.04]"
      id={`question-evidence-${insight.question.id}`}
    >
      <summary className="cursor-pointer list-none rounded-2xl px-4 py-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300/60 sm:px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="secondary">
                {questionTypeLabel(insight.question.cohort)}
              </Badge>
              <Badge variant={agreement.variant}>{agreement.label}</Badge>
              {insight.unavailableProviderCount > 0 ? (
                <Badge variant="warning">
                  {insight.unavailableProviderCount} unavailable
                </Badge>
              ) : null}
            </div>
            <p className="break-words text-pretty text-sm font-medium leading-6 text-zinc-200">
              {insight.question.text}
            </p>
          </div>
          <ChevronDown
            aria-hidden="true"
            className="mt-1 size-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
          />
        </div>
        <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
          <QuestionSignal
            label="Brand outcome"
            value={`${insight.mentionedProviderCount} of ${insight.eligibleProviderCount} grounded AIs mentioned you`}
          />
          <QuestionSignal
            label="Leading competitor"
            value={
              insight.leadingCompetitors.length
                ? insight.leadingCompetitors.map(({ name }) => name).join(", ")
                : "None detected"
            }
          />
          <QuestionSignal
            label="Key cited domain"
            value={insight.keySources[0]?.domain ?? "No valid source returned"}
          />
        </div>
      </summary>
      <div className="space-y-3 border-t border-white/[0.07] p-3 sm:p-4">
        {rows.map((row) => (
          <ProviderAnswer key={row.job?.id ?? `${row.question.id}:pending`} row={row} />
        ))}
      </div>
    </details>
  );
}

function QuestionSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/15 px-3 py-2.5">
      <p className="text-zinc-400">{label}</p>
      <p className="mt-1 leading-5 text-zinc-300">{value}</p>
    </div>
  );
}

function ProviderAnswer({ row }: { row: ResultRow }) {
  const answer = row.result;
  const providerName = row.job ? providerLabels[row.job.provider] : "Provider pending";

  return (
    <article
      className="rounded-xl bg-black/20 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]"
      id={answer ? `evidence-${answer.id}` : undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-zinc-200">{providerName}</h3>
        <div className="flex flex-wrap gap-2">
          {answer?.scoreEligible ? (
            <Badge variant={answer.targetMentioned ? "success" : "warning"}>
              {answer.targetMentioned ? "Brand mentioned" : "Brand not mentioned"}
            </Badge>
          ) : answer ? (
            <Badge variant="warning">Not counted</Badge>
          ) : (
            <Badge variant="secondary">Unavailable</Badge>
          )}
        </div>
      </div>
      {answer ? (
        <>
          <p className="mt-4 whitespace-pre-wrap text-pretty text-sm leading-7 text-zinc-400">
            {answer.answerText}
          </p>
          {answer.sources.length ? (
            <div className="mt-5">
              <p className="eyebrow mb-3">Sources cited by {providerName}</p>
              <ul className="space-y-2">
                {answer.sources
                  .filter((source) => isSafeUrl(source.url))
                  .map((source) => (
                    <li key={source.url}>
                      <a
                        className="flex items-start gap-2 text-xs leading-5 text-emerald-300 underline-offset-4 hover:text-emerald-200 hover:underline"
                        href={source.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <ExternalLink aria-hidden="true" className="mt-0.5 size-3 shrink-0" />
                        <span className="min-w-0 [overflow-wrap:anywhere]">
                          {source.title ?? source.publisher ?? new URL(source.url).hostname}
                        </span>
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-xs text-amber-200">
              No valid grounding sources were returned.
            </p>
          )}
          {answer.requiredAttribution.length ? (
            <div className="mt-5">
              <p className="eyebrow mb-3">Required provider attribution</p>
              <div className="space-y-3">
                {answer.requiredAttribution.map((attribution, index) =>
                  attribution.text ? (
                    <iframe
                      className="h-40 w-full rounded-xl border-0 bg-white"
                      key={`${attribution.label}:${index}`}
                      referrerPolicy="no-referrer"
                      sandbox="allow-popups allow-popups-to-escape-sandbox"
                      srcDoc={attribution.text}
                      title={attribution.label}
                    />
                  ) : attribution.url && isSafeUrl(attribution.url) ? (
                    <a
                      className="text-xs text-emerald-300 underline-offset-4 hover:text-emerald-200 hover:underline"
                      href={attribution.url}
                      key={`${attribution.label}:${index}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {attribution.label}
                    </a>
                  ) : null,
                )}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm text-zinc-400">
          {row.job?.errorMessage ?? "This provider call has not finished."}
        </p>
      )}
    </article>
  );
}

function Filter({
  value,
  onChange,
  options,
  label,
  formatOption,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
  formatOption?: (option: string) => string;
}) {
  return (
    <label className="block min-w-0">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full min-w-0 rounded-xl bg-white/[0.06] px-3 text-xs capitalize text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09)] outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60">
        {options.map((option) => (
          <option key={option} value={option}>
            {formatOption?.(option) ??
              (option === "all"
                ? `All ${label.toLocaleLowerCase("en-US")}s`
                : option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="rounded-xl bg-white/[0.03] px-3 py-3"><p>{label}</p><p className="mt-1 font-mono text-zinc-300 tabular-nums">{value}</p>{detail ? <p className="mt-1 text-[10px] text-zinc-400">{detail}</p> : null}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const complete = status === "complete";
  const partial = status === "partial";
  const failed = status === "failed" || status === "cancelled";
  const settled = complete || partial || failed;
  return <Badge variant={complete ? "success" : partial ? "warning" : failed ? "destructive" : "info"}>{!settled ? <LoaderCircle className="animate-spin" /> : null}{humanize(status)}</Badge>;
}

function LoadingCard({ terminal }: { terminal: boolean }) {
  return <Card className="bg-[#0b0e0c]"><CardContent className="flex min-h-32 items-center justify-center gap-2 text-sm text-zinc-400"><LoaderCircle className="size-4 animate-spin" /> {terminal ? "Loading your search results…" : "Your search results will appear when processing completes."}</CardContent></Card>;
}

function statusMessage(status: string) {
  const messages: Record<string, string> = {
    queued: "Waiting for the durable workflow",
    generating: "Generating and validating the frozen question set",
    querying: "Collecting web-grounded provider answers",
    analyzing: "Normalizing evidence and calculating metrics",
    complete: "Benchmark complete",
    partial: "Benchmark complete with partial provider coverage",
    failed: "Benchmark stopped before completion",
    cancelled: "Benchmark cancelled",
  };
  return messages[status] ?? humanize(status);
}

function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/^./u, (letter) => letter.toUpperCase());
}

function questionTypeLabel(value: string) {
  const labels: Record<string, string> = {
    all: "All question types",
    discovery: "Unprompted searches",
    diagnostic: "Brand-specific checks",
  };
  return labels[value] ?? humanize(value);
}

function executiveVerdict(
  subjectName: string,
  summary: InsightSummary,
  visibility: RatioMetric,
) {
  if (visibility.denominator === 0 || summary.evaluatedDiscoveryQuestionCount === 0) {
    return "There is not enough grounded discovery evidence for a verdict yet.";
  }
  if (summary.reachedDiscoveryQuestionCount === 0) {
    return `${subjectName} was not surfaced in any evaluated buyer question.`;
  }
  if (
    summary.unanimousMentionCount === summary.evaluatedDiscoveryQuestionCount
  ) {
    return `${subjectName} was consistently visible across every evaluated buyer question.`;
  }
  if (summary.mixedCount > 0 || summary.unanimousMissCount > 0) {
    return `${subjectName} has uneven visibility across buyer questions and AI providers.`;
  }
  return `${subjectName} reached some buyer questions, with clear room to expand coverage.`;
}

function providerDifference(value: number | null) {
  if (value === null) return "No overall comparison";
  if (Math.abs(value) < 0.005) return "Matches the overall rate";
  return `${Math.abs(value * 100).toFixed(0)} points ${value > 0 ? "above" : "below"} overall`;
}

function agreementPresentation(agreement: QuestionInsight["agreement"]): {
  label: string;
  variant: "secondary" | "success" | "warning";
} {
  if (agreement === "unanimous_mention") {
    return { label: "All grounded AIs mentioned you", variant: "success" };
  }
  if (agreement === "unanimous_miss") {
    return { label: "All grounded AIs missed you", variant: "warning" };
  }
  if (agreement === "mixed") {
    return { label: "Mixed provider result", variant: "warning" };
  }
  if (agreement === "partial") {
    return { label: "Partial provider coverage", variant: "warning" };
  }
  return { label: "Insufficient grounded evidence", variant: "secondary" };
}

function plural(count: number, singular: string) {
  if (count === 1) return singular;
  return singular.endsWith("s") ? `${singular}es` : `${singular}s`;
}

function percent(value: number | null) {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

function isSafeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
