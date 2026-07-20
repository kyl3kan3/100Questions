"use client";

import { AlertTriangle, ExternalLink, LoaderCircle, Search } from "lucide-react";
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
            <Stat label="Eligible" value={String(run.eligibleProviderCalls)} />
            <Stat label="Failed" value={String(run.failedProviderCalls)} />
            <Stat
              label="Recorded cost"
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
        <MetricGrid payload={payload} providers={availableProviders} />
      ) : (
        <LoadingCard terminal={terminalStatuses.has(run.status)} />
      )}

      <Card className="bg-[#0b0e0c]">
        <CardHeader className="border-b border-white/[0.07] pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle>Answer evidence</CardTitle>
              <CardDescription className="mt-1">
                Exact frozen questions, normalized answers, and source links.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Filter value={cohort} onChange={(value) => setCohort(value as typeof cohort)} options={["all", "discovery", "diagnostic"]} label="Cohort" />
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

function MetricGrid({
  payload,
  providers,
}: {
  payload: ResultsPayload;
  providers: Provider[];
}) {
  const metrics = payload.metrics;
  const providerEntries = providers.flatMap((provider) => {
    const metrics = payload.providerMetrics[provider];
    return metrics ? [{ provider, metrics }] : [];
  });
  return (
    <section aria-labelledby="metrics-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="metrics-heading" className="text-sm font-semibold text-zinc-200">Headline metrics</h2>
        {metrics.provisional ? <Badge variant="warning">Provisional · coverage below 90%</Badge> : <Badge variant="success">Coverage threshold met</Badge>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Discovery visibility" metric={metrics.discoveryVisibility} />
        <ValueCard label="Prominence index" value={percent(metrics.prominence.value)} detail={`${metrics.prominence.denominator} eligible discovery answers`} />
        <MetricCard label="Positive sentiment" metric={metrics.sentiment.positive} />
        <MetricCard label="Conservative floor" metric={metrics.conservativeVisibilityFloor} />
        <MetricCard label="Share of voice" metric={metrics.shareOfVoice} />
        <MetricCard label="Owned citations" metric={metrics.claimedDomainCitationRate} />
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-400">
        Coverage {percent(metrics.coverage.value)} ({metrics.coverage.numerator}/{metrics.coverage.denominator}). Failed or ungrounded calls remain in coverage and do not enter eligible-score denominators.
      </p>
      <div
        className={
          providerEntries.length >= 4
            ? "mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            : "mt-5 grid gap-3 sm:grid-cols-3"
        }
      >
        {providerEntries.map(({ provider, metrics: providerMetric }) => {
          return (
            <Card key={provider} className="bg-[#0a0d0b]">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-zinc-300">
                  {providerLabels[provider]}
                </p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold text-white tabular-nums">{percent(providerMetric.discoveryVisibility.value)}</p>
                    <p className="mt-1 text-[11px] text-zinc-400">discovery visibility</p>
                  </div>
                  <p className="font-mono text-[10px] text-zinc-400 tabular-nums">{percent(providerMetric.coverage.value)} coverage</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function MetricCard({ label, metric }: { label: string; metric: RatioMetric }) {
  return (
    <Card className="bg-[#0b0e0c]">
      <CardContent className="p-5">
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white tabular-nums">{percent(metric.value)}</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-zinc-400 tabular-nums">{metric.numerator}/{metric.denominator} eligible</p>
      </CardContent>
    </Card>
  );
}

function AnswerRow({ row }: { row: ResultRow }) {
  const answer = row.result;
  return (
    <details className="group rounded-2xl bg-white/[0.025] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.065)] open:bg-white/[0.04]">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 marker:hidden">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{row.question.cohort}</Badge>
            {row.job ? (
              <Badge variant="outline">{providerLabels[row.job.provider]}</Badge>
            ) : null}
            {answer?.scoreEligible ? <Badge variant="success">grounded</Badge> : answer ? <Badge variant="warning">excluded</Badge> : <Badge variant="secondary">pending</Badge>}
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
  return <Card className="bg-[#0b0e0c]"><CardContent className="flex min-h-32 items-center justify-center gap-2 text-sm text-zinc-400"><LoaderCircle className="size-4 animate-spin" /> {terminal ? "Loading benchmark metrics…" : "Metrics and evidence appear when processing completes."}</CardContent></Card>;
}

function ValueCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="bg-[#0b0e0c]">
      <CardContent className="p-5">
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white tabular-nums">{value}</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-zinc-400">{detail}</p>
      </CardContent>
    </Card>
  );
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
