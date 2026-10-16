"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildReadinessOffer } from "@/lib/readiness-offer";
import type {
  DiscoverySignal,
  StartupChatgptVisibilityResult,
} from "@/lib/startup-chatgpt-visibility";
import { cn } from "@/lib/utils";

type Props = {
  embed?: boolean;
};

export function ChatgptStartupVisibilityWidget({ embed = false }: Props) {
  const [query, setQuery] = useState("");
  const [result, setResult] =
    useState<StartupChatgptVisibilityResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value || loading) return;

    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/tools/chatgpt-startup-visibility", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: value }),
      });
      const payload = (await response.json().catch(() => null)) as
        | StartupChatgptVisibilityResult
        | { error?: string }
        | null;

      if (!response.ok || !payload || !("score" in payload)) {
        throw new Error(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Check failed.",
        );
      }

      setResult(payload);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Check failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  const offer = buildReadinessOffer(
    result?.domain ?? result?.brandName ?? "",
    result?.score ?? 0,
    "website",
  );

  return (
    <div
      className={cn(
        embed
          ? "min-h-[480px] bg-[#070908] px-3 py-3 text-zinc-100 sm:px-4"
          : "rounded-[26px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8",
      )}
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className={cn("font-medium text-white", embed ? "text-sm" : "text-base")}>
            Your startup domain or brand
          </span>
          <Input
            className={cn("mt-2", embed && "h-10 text-sm")}
            placeholder="acme.com or Acme"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            enterKeyHint="go"
          />
        </label>
        <Button
          type="submit"
          className={cn("w-full", embed && "h-10 text-sm")}
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Checking…
            </>
          ) : (
            "Get preview score"
          )}
        </Button>
      </form>

      {error ? (
        <p className="mt-3 text-sm text-red-300" role="alert">{error}</p>
      ) : null}

      {result ? (
        <section className={cn("mt-4 space-y-3", embed && "mt-3")} aria-live="polite">
          <div className="flex items-end justify-between gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">
                Discovery readiness
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                {result.domain ?? result.brandName}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-3xl font-semibold text-emerald-300">
                {result.score}
                <span className="text-lg text-zinc-500">/100</span>
              </p>
              <p className="text-xs text-zinc-400">Grade {result.grade}</p>
            </div>
          </div>

          <p className="text-xs leading-5 text-zinc-400">{result.methodology}</p>

          {result.fetchNote ? (
            <p className="rounded-lg bg-amber-300/[0.08] px-3 py-2 text-[11px] leading-5 text-amber-100">
              {result.fetchNote}
            </p>
          ) : null}

          <ul className="space-y-2">
            {result.questions.map((question) => (
              <li
                key={question.text}
                className="rounded-xl bg-white/[0.03] px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
              >
                <p className="text-xs leading-5 text-zinc-200">{question.text}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] leading-5 text-zinc-400">
                  <SignalBadge signal={question.signal} />
                  <span>{question.summary}</span>
                </p>
              </li>
            ))}
          </ul>

          {result.benchmarkNote ? (
            <p className="text-[11px] leading-5 text-amber-100/90">
              {result.benchmarkNote}
            </p>
          ) : null}

          <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-3">
            <p className="text-sm font-medium text-white">
              Full 100-question report
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-300">
              Measure real answers across OpenAI, Claude, Gemini, and Grok — not
              this technical preview.
            </p>
            <a
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-300 underline underline-offset-4 decoration-emerald-300/40 hover:text-emerald-200"
              href={offer.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {offer.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      ) : (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Sample buyer questions below are labeled by public-site discovery
          signals — not live ChatGPT answers.
        </p>
      )}
    </div>
  );
}

function SignalBadge({ signal }: { signal: DiscoverySignal }) {
  const styles: Record<DiscoverySignal, string> = {
    strong: "bg-emerald-400/15 text-emerald-200",
    moderate: "bg-amber-300/15 text-amber-100",
    weak: "bg-zinc-500/20 text-zinc-300",
    blocked: "bg-red-400/15 text-red-200",
  };
  const labels: Record<DiscoverySignal, string> = {
    strong: "Strong signals",
    moderate: "Mixed signals",
    weak: "Weak signals",
    blocked: "Blocked",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 font-medium",
        styles[signal],
      )}
    >
      {labels[signal]}
    </span>
  );
}
