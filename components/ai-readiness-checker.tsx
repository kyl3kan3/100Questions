"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  SearchCheck,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  AiReadinessResult,
  ReadinessCheck,
} from "@/lib/ai-readiness";
import { cn } from "@/lib/utils";

export function AiReadinessChecker() {
  const [website, setWebsite] = useState("");
  const [result, setResult] = useState<AiReadinessResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = website.trim();
    if (!value || isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/tools/ai-readiness", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ website: value }),
      });
      const payload = (await response.json().catch(() => null)) as
        | AiReadinessResult
        | { error?: string }
        | null;

      if (!response.ok || !payload || !("score" in payload)) {
        throw new Error(
          payload && "error" in payload && payload.error
            ? payload.error
            : "The website could not be checked.",
        );
      }

      setResult(payload);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The website could not be checked.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-[28px] bg-[#0a0d0b] p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_18px_60px_-32px_rgba(0,0,0,0.9)]">
      <div className="rounded-[20px] bg-[#0d110f] p-5 sm:p-7 lg:p-8">
        <div className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="eyebrow">Free technical preflight</p>
            <h2 className="mt-4 max-w-xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
              Is your site ready to be found and understood?
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-sm leading-6 text-zinc-400">
              Check the public signals AI search systems depend on. No account,
              API key, or model spend required.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <Label htmlFor="readiness-website">Website domain</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="readiness-website"
                name="website"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="example.com"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby="readiness-help readiness-error"
                className="h-12"
              />
              <Button
                type="submit"
                size="lg"
                disabled={isLoading || !website.trim()}
                className="sm:min-w-44"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Checking site
                  </>
                ) : (
                  <>
                    Run free check
                    <SearchCheck />
                  </>
                )}
              </Button>
            </div>
            <p id="readiness-help" className="text-pretty text-xs leading-5 text-zinc-400">
              We fetch only public HTTPS pages and do not store the submitted
              site or its contents.
            </p>
            <p
              id="readiness-error"
              role="alert"
              className={cn(
                "min-h-5 text-pretty text-xs leading-5 text-red-300",
                !error && "sr-only",
              )}
            >
              {error}
            </p>
          </form>
        </div>

        <div aria-live="polite" aria-busy={isLoading}>
          {result ? <ReadinessResults result={result} /> : null}
        </div>
      </div>
    </div>
  );
}

function ReadinessResults({ result }: { result: AiReadinessResult }) {
  const passed = result.checks.filter((check) => check.status === "pass").length;

  return (
    <section
      className="animate-enter mt-8 border-t border-white/[0.08] pt-8"
      aria-labelledby="readiness-results-heading"
    >
      <div className="grid gap-4 md:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[20px] bg-emerald-300 p-6 text-zinc-950">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
            Technical readiness
          </p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-6xl font-semibold tracking-[-0.07em] tabular-nums">
              {result.score}
            </span>
            <span className="pb-1 text-sm font-medium">/ 100</span>
          </div>
          <h3
            id="readiness-results-heading"
            className="mt-5 text-balance text-xl font-semibold"
          >
            {result.grade}
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-800">
            {passed} of {result.checks.length} checks passed. This measures
            technical readiness, not whether ChatGPT currently recommends the
            brand.
          </p>
          <a
            href={result.checkedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-10 max-w-full items-center gap-2 break-all text-xs font-semibold underline underline-offset-4"
          >
            {readableHost(result.checkedUrl)}
            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
          </a>
        </div>

        <div className="rounded-[20px] bg-black/20 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] sm:p-6">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
            Fix these first
          </p>
          {result.topActions.length ? (
            <ol className="mt-4 space-y-3">
              {result.topActions.map((action, index) => (
                <li
                  key={action}
                  className="flex gap-3 text-pretty text-sm leading-6 text-zinc-300"
                >
                  <span className="font-mono text-xs tabular-nums text-emerald-300">
                    0{index + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-pretty text-sm leading-6 text-zinc-300">
              The public technical foundation looks complete. The next step is
              measuring real mentions, citations, and competitor visibility
              across a frozen buyer-question set.
            </p>
          )}
          <Button asChild variant="link" className="mt-4">
            <Link href="/auth/sign-up">
              Measure actual AI visibility <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {result.checks.map((check) => (
          <CheckRow key={check.id} check={check} />
        ))}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-[16px] bg-amber-300/[0.08] px-4 py-3 text-xs leading-5 text-amber-100 shadow-[inset_0_0_0_1px_rgba(252,211,77,0.14)]">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p className="text-pretty">
          Robots.txt is only one access layer. CDN firewalls, bot-management
          rules, JavaScript rendering, and provider-specific indexes can still
          affect discovery.
        </p>
      </div>
    </section>
  );
}

function CheckRow({ check }: { check: ReadinessCheck }) {
  const Icon =
    check.status === "pass"
      ? CheckCircle2
      : check.status === "warning"
        ? AlertTriangle
        : XCircle;

  return (
    <article className="rounded-[16px] bg-black/20 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Icon
            className={cn(
              "size-4 shrink-0",
              check.status === "pass" && "text-emerald-300",
              check.status === "warning" && "text-amber-300",
              check.status === "fail" && "text-red-300",
            )}
            aria-hidden="true"
          />
          <h4 className="font-semibold text-zinc-100">{check.label}</h4>
        </div>
        <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-400">
          {check.score}/{check.maxScore}
        </span>
      </div>
      <p className="mt-3 text-pretty text-xs leading-5 text-zinc-400">
        {check.evidence}
      </p>
    </article>
  );
}

function readableHost(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}
