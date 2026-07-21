"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CircleX,
  ExternalLink,
  LoaderCircle,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
  estimatedCostMicros: number;
  actualCostMicros: number;
  costProvenance: string;
  createdAt: string;
  competitors: string[];
  frozenModels: Record<string, string>;
  failureMessage: string | null;
  workflowRunId: string | null;
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
};

const terminalStatuses = new Set(["complete", "partial", "failed", "cancelled"]);

export function RunProgress({ initialRun }: { initialRun: RunState }) {
  const [payload, setPayload] = useState<ResultsPayload | null>(null);
  const [run, setRun] = useState(initialRun);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [cohort, setCohort] = useState<"all" | "discovery" | "diagnostic">("all");
  const [provider, setProvider] = useState<"all" | Provider>("all");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;
    let lastDispatchRetryAt = 0;
    const controller = new AbortController();

    function schedule(refresh: () => Promise<void>) {
      if (cancelled) return;
      const delay = Math.min(30_000, 3_000 * 2 ** Math.min(failures, 3));
      timer = setTimeout(() => void refresh(), delay);
    }

    async function loadResults(): Promise<boolean> {
      try {
        const response = await fetch(`/api/runs/${initialRun.id}/results`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Result evidence is temporarily unavailable.");
        }

        if (!cancelled) {
          const next = (await response.json()) as ResultsPayload;
          setPayload(next);
          setRun(next.run);
          setUpdateError(null);
        }

        return true;
      } catch (error) {
        if (!cancelled && error instanceof Error && error.name !== "AbortError") {
          setUpdateError(error.message);
        }
        return false;
      }
    }

    async function refreshStatus() {
      try {
        if (terminalStatuses.has(initialRun.status)) {
          if (!(await loadResults())) {
            failures += 1;
            schedule(refreshStatus);
          }
          return;
        }

        const response = await fetch(`/api/runs/${initialRun.id}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 404) {
          setUpdateError("This benchmark is no longer available to this session.");
          return;
        }

        if (!response.ok) {
          throw new Error("Live progress is temporarily unavailable.");
        }

        const next = (await response.json()) as { run: RunState };

        if (cancelled) return;
        failures = 0;
        setRun(next.run);
        setUpdateError(null);

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
          if (!(await loadResults())) {
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
        setUpdateError(
          error instanceof Error
            ? error.message
            : "Live progress is temporarily unavailable.",
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

  const effectiveProvider =
    provider === "all" || availableProviders.includes(provider) ? provider : "all";

  const filteredRows = useMemo(
    () =>
      (payload?.rows ?? []).filter(
        (row) =>
          (cohort === "all" || row.question.cohort === cohort) &&
          (effectiveProvider === "all" || row.job?.provider === effectiveProvider) &&
          (category === "all" || row.question.category === category),
      ),
    [category, cohort, effectiveProvider, payload?.rows],
  );

  return (
    <div className="space-y-6">
      <Card className="bg-[#0b0e0c]">
        <CardHeader className="border-b border-white/[0.07] pb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow mb-2">Benchmark run</p>
              <CardTitle className="text-2xl">{run.subjectName}</CardTitle>
              <CardDescription className="mt-1">{run.canonicalDomain}</CardDescription>
            </div>
            <StatusBadge status={run.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div aria-live="polite" className="mb-3 flex items-center justify-between text-xs text-zinc-400">
            <span>{statusMessage(run.status)}</span>
            <span className="font-mono tabular-nums">{completedCalls}/{run.providerCallsPlanned} calls</span>
          </div>
          <Progress value={progress} aria-label="Benchmark progress" />
          <div className="mt-5 grid gap-3 text-xs text-zinc-400 sm:grid-cols-4">
            <Stat label="Questions" value={`${run.questionsGenerated}/${run.questionCountPlanned}`} />
            <Stat label="Grounded answers" value={String(run.eligibleProviderCalls)} />
            <Stat label="Unavailable" value={String(run.failedProviderCalls)} />
            <Stat
              label="Run cost"
              value={formatMicros(run.actualCostMicros)}
              detail={humanize(run.costProvenance)}
            />
          </div>
          {run.failureMessage ? (
            <p className="mt-5 flex items-start gap-2 rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {run.failureMessage}
            </p>
          ) : null}
          {updateError ? (
            <p role="status" aria-live="polite" className="mt-3 text-xs text-amber-200">
              {updateError} Retrying with backoff.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {payload ? (
        <ResultsOverview payload={payload} providers={availableProviders} />
      ) : (
        <LoadingCard terminal={terminalStatuses.has(run.status)} />
      )}

      <Card className="bg-[#0b0e0c]">
        <CardHeader className="border-b border-white/[0.07] pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle>Every search and answer</CardTitle>
              <CardDescription className="mt-1">
                Open any question to see the complete AI answer and its sources.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Filter
                value={cohort}
                onChange={(value) => setCohort(value as typeof cohort)}
                options={["all", "discovery", "diagnostic"]}
                label="Question type"
                formatOption={questionTypeLabel}
              />
              <Filter
                value={effectiveProvider}
                onChange={(value) =>
                  setProvider(value === "all" || isProvider(value) ? value : "all")
                }
                options={["all", ...availableProviders]}
                label="Provider"
                formatOption={(option) =>
                  option === "all" ? "All providers" : providerLabels[option as Provider]
                }
              />
              <Filter value={category} onChange={setCategory} options={["all", ...(payload?.categories ?? [])]} label="Category" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredRows.length ? (
            filteredRows.map((row) => <AnswerRow key={`${row.question.id}:${row.job?.id ?? "pending"}`} row={row} />)
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
}: {
  payload: ResultsPayload;
  providers: Provider[];
}) {
  const metrics = payload.metrics;
  const discoveryRows = payload.rows.filter(
    (row) =>
      row.question.cohort === "discovery" &&
      row.job &&
      row.result?.scoreEligible,
  );
  const appearedRows = discoveryRows.filter(
    (row) => row.result?.targetMentioned,
  );
  const missedRows = discoveryRows.filter(
    (row) => !row.result?.targetMentioned,
  );
  const unscoredDiscoveryCount = Math.max(
    metrics.conservativeVisibilityFloor.denominator - discoveryRows.length,
    0,
  );
  const competitors = rankCompetitors(
    discoveryRows,
    payload.run.competitors ?? [],
  );
  const providerEntries = providers.flatMap((provider) => {
    const providerMetrics = payload.providerMetrics[provider];
    return providerMetrics ? [{ provider, metrics: providerMetrics }] : [];
  });
  const visibility = metrics.discoveryVisibility;

  return (
    <section aria-labelledby="results-heading" className="space-y-6">
      <Card className="bg-[#0b0e0c] shadow-[0_20px_60px_rgba(0,0,0,0.22),inset_0_0_0_1px_rgba(255,255,255,0.07)]">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Your search visibility</p>
              <h2
                id="results-heading"
                className="mt-3 text-balance text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl"
              >
                {visibility.denominator > 0 ? (
                  <>
                    {payload.run.subjectName} appeared in{" "}
                    <span className="text-emerald-300 tabular-nums">
                      {visibility.numerator} of {visibility.denominator}
                    </span>{" "}
                    completed discovery searches.
                  </>
                ) : (
                  "There are not enough grounded discovery searches to measure visibility yet."
                )}
              </h2>
              <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-zinc-400">
                Discovery searches do not name your brand. They show whether an AI
                recommends or mentions you without being prompted.
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PlainMetric
          label="You appeared"
          value={`${visibility.numerator} searches`}
          detail={`Out of ${visibility.denominator} grounded discovery searches`}
          tone="positive"
        />
        <PlainMetric
          label="You were missing"
          value={`${missedRows.length} searches`}
          detail="Completed searches that did not mention your brand"
          tone={missedRows.length > 0 ? "negative" : "positive"}
        />
        <PlainMetric
          label="Your site was cited"
          value={percent(metrics.claimedDomainCitationRate.value)}
          detail={`${metrics.claimedDomainCitationRate.numerator} of ${metrics.claimedDomainCitationRate.denominator} grounded answers`}
        />
        <PlainMetric
          label="Positive mentions"
          value={percent(metrics.sentiment.positive.value)}
          detail={`${metrics.sentiment.positive.numerator} of ${metrics.sentiment.denominator} brand mentions`}
        />
      </div>

      <p className="rounded-2xl bg-white/[0.025] px-4 py-3 text-pretty text-xs leading-5 text-zinc-400 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
        Based on {visibility.denominator} grounded discovery answers. {unscoredDiscoveryCount}{" "}
        failed or ungrounded discovery answers are excluded rather than counted as misses.
        {metrics.provisional
          ? " Treat these percentages as directional because overall answer coverage was below 90%."
          : " Overall answer coverage met the 90% reliability threshold."}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <SearchOutcomeList
          title="Where you appeared"
          description="Questions where the AI mentioned your brand without being prompted."
          rows={appearedRows}
          empty="Your brand did not appear in any grounded discovery searches."
          outcome="appeared"
        />
        <SearchOutcomeList
          title="Where you did not appear"
          description="Completed searches where the AI did not mention your brand."
          rows={missedRows}
          empty="Your brand appeared in every grounded discovery search."
          outcome="missed"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <CompetitorComparison
          subjectName={payload.run.subjectName}
          subjectCount={appearedRows.length}
          competitors={competitors}
          denominator={discoveryRows.length}
        />
        <ProviderBreakdown entries={providerEntries} />
      </div>
    </section>
  );
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

function SearchOutcomeList({
  title,
  description,
  rows,
  empty,
  outcome,
}: {
  title: string;
  description: string;
  rows: ResultRow[];
  empty: string;
  outcome: "appeared" | "missed";
}) {
  const shown = rows.slice(0, 6);

  return (
    <Card className="bg-[#0b0e0c]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${
              outcome === "appeared"
                ? "bg-emerald-300/10 text-emerald-300"
                : "bg-amber-300/10 text-amber-200"
            }`}
          >
            {outcome === "appeared" ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <CircleX className="size-4" />
            )}
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="mt-1 text-pretty leading-5">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {shown.length ? (
          shown.map((row) => (
            <div
              key={row.job?.id ?? row.question.id}
              className="rounded-xl bg-white/[0.025] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {row.job ? (
                  <Badge variant="outline">{providerLabels[row.job.provider]}</Badge>
                ) : null}
                {outcome === "appeared" && row.result?.prominence ? (
                  <span className="text-[10px] capitalize text-zinc-400">
                    {humanize(row.result.prominence)} mention
                  </span>
                ) : null}
                {outcome === "appeared" && row.result?.sentiment ? (
                  <span className="text-[10px] capitalize text-zinc-400">
                    {row.result.sentiment} tone
                  </span>
                ) : null}
                {outcome === "appeared" && row.result?.ownedDomainCited ? (
                  <span className="text-[10px] text-emerald-300">
                    Your site was cited
                  </span>
                ) : null}
              </div>
              <p className="text-pretty text-sm leading-6 text-zinc-200">
                {row.question.text}
              </p>
              {outcome === "missed" && row.result?.competitorMentions.length ? (
                <p className="mt-2 text-pretty text-[11px] leading-5 text-zinc-400">
                  Mentioned instead: {uniqueCompetitorNames(row).slice(0, 3).join(", ")}
                </p>
              ) : null}
            </div>
          ))
        ) : (
          <p className="rounded-xl bg-white/[0.025] px-4 py-6 text-center text-sm text-zinc-400">
            {empty}
          </p>
        )}
        {rows.length > shown.length ? (
          <p className="pt-2 text-xs text-zinc-400">
            +{rows.length - shown.length} more in the full answer evidence below.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CompetitorComparison({
  subjectName,
  subjectCount,
  competitors,
  denominator,
}: {
  subjectName: string;
  subjectCount: number;
  competitors: Array<{ name: string; count: number }>;
  denominator: number;
}) {
  const entries = [
    { name: subjectName, count: subjectCount, subject: true },
    ...competitors.slice(0, 7).map((competitor) => ({
      ...competitor,
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
            <CardTitle className="text-base">You versus competitors</CardTitle>
            <CardDescription className="mt-1 text-pretty leading-5">
              How often each name appeared across grounded discovery searches.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => {
          const value = denominator > 0 ? entry.count / denominator : 0;
          return (
            <div key={`${entry.subject ? "subject" : "competitor"}:${entry.name}`}>
              <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
                <span className={entry.subject ? "font-medium text-emerald-300" : "text-zinc-300"}>
                  {entry.name}{entry.subject ? " (you)" : ""}
                </span>
                <span className="shrink-0 font-mono text-zinc-400 tabular-nums">
                  {entry.count}/{denominator} · {percent(value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className={`h-full rounded-full ${entry.subject ? "bg-emerald-300" : "bg-zinc-500"}`}
                  style={{ width: `${Math.round(value * 100)}%` }}
                />
              </div>
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

function ProviderBreakdown({
  entries,
}: {
  entries: Array<{ provider: Provider; metrics: MetricsPayload }>;
}) {
  return (
    <Card className="bg-[#0b0e0c]">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Results by AI provider</CardTitle>
        <CardDescription className="mt-1 text-pretty leading-5">
          How often each provider mentioned you in grounded discovery answers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map(({ provider, metrics }) => {
          const visibility = metrics.discoveryVisibility;
          return (
            <div
              key={provider}
              className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.025] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]"
            >
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {providerLabels[provider]}
                </p>
                <p className="mt-1 text-[11px] text-zinc-400 tabular-nums">
                  {visibility.numerator} of {visibility.denominator} searches
                </p>
              </div>
              <p className="text-xl font-semibold text-white tabular-nums">
                {percent(visibility.value)}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function rankCompetitors(
  rows: ResultRow[],
  configuredCompetitors: string[],
): Array<{ name: string; count: number }> {
  const counts = new Map<string, { name: string; count: number }>();

  for (const name of configuredCompetitors) {
    const key = normalizeEntityName(name);
    if (key) counts.set(key, { name, count: 0 });
  }

  for (const row of rows) {
    const seen = new Set<string>();

    for (const mention of row.result?.competitorMentions ?? []) {
      const key = normalizeEntityName(mention.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const current = counts.get(key);
      counts.set(key, {
        name: current?.name ?? mention.name,
        count: (current?.count ?? 0) + 1,
      });
    }
  }

  return [...counts.values()].sort(
    (left, right) => right.count - left.count || left.name.localeCompare(right.name),
  );
}

function uniqueCompetitorNames(row: ResultRow): string[] {
  return [
    ...new Map(
      (row.result?.competitorMentions ?? []).map((mention) => [
        normalizeEntityName(mention.name),
        mention.name,
      ]),
    ).values(),
  ];
}

function normalizeEntityName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function AnswerRow({ row }: { row: ResultRow }) {
  const answer = row.result;
  return (
    <details className="group rounded-2xl bg-white/[0.025] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.065)] open:bg-white/[0.04]">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 marker:hidden">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary">
              {questionTypeLabel(row.question.cohort)}
            </Badge>
            {row.job ? (
              <Badge variant="outline">{providerLabels[row.job.provider]}</Badge>
            ) : null}
            {answer?.scoreEligible ? <Badge variant="success">Grounded answer</Badge> : answer ? <Badge variant="warning">Not counted</Badge> : <Badge variant="secondary">Pending</Badge>}
          </div>
          <p className="text-pretty text-sm font-medium leading-6 text-zinc-200">{row.question.text}</p>
        </div>
        <span aria-hidden="true" className="mt-1 text-zinc-400 transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-white/[0.07] px-4 py-4">
        {answer ? (
          <>
            <p className="whitespace-pre-wrap text-pretty text-sm leading-7 text-zinc-400">{answer.answerText}</p>
            {answer.sources.length ? (
              <div className="mt-5">
                <p className="eyebrow mb-3">Sources</p>
                <ul className="space-y-2">
                  {answer.sources.filter((source) => isSafeUrl(source.url)).map((source) => (
                    <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-xs leading-5 text-emerald-300 hover:text-emerald-200">
                        <ExternalLink className="mt-0.5 size-3 shrink-0" />
                        <span>{source.title ?? source.publisher ?? new URL(source.url).hostname}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-4 text-xs text-amber-200">No valid grounding sources were returned.</p>
            )}
            {answer.requiredAttribution.length ? (
              <div className="mt-5">
                <p className="eyebrow mb-3">Required provider attribution</p>
                <div className="space-y-3">
                  {answer.requiredAttribution.map((attribution, index) =>
                    attribution.text ? (
                      <iframe
                        key={`${attribution.label}:${index}`}
                        title={attribution.label}
                        srcDoc={attribution.text}
                        sandbox="allow-popups allow-popups-to-escape-sandbox"
                        referrerPolicy="no-referrer"
                        className="h-28 w-full rounded-xl border-0 bg-white"
                      />
                    ) : attribution.url && isSafeUrl(attribution.url) ? (
                      <a
                        key={`${attribution.label}:${index}`}
                        href={attribution.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-300 hover:text-emerald-200"
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
          <p className="text-sm text-zinc-400">{row.job?.errorMessage ?? "This provider call has not finished."}</p>
        )}
      </div>
    </details>
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
    <label>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="ml-2 h-9 rounded-xl bg-white/[0.06] px-3 text-xs capitalize text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09)] outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60">
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

function percent(value: number | null) {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

function formatMicros(micros: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(micros / 1_000_000);
}

function isSafeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isProvider(value: string): value is Provider {
  return providerOrder.includes(value as Provider);
}
