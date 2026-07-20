"use client";

import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type RunFormProps = {
  estimatedMicrosPerProviderCall: number;
  ceilingMicrosPerProviderCall: number;
  aiCallsPerProviderJob: number;
  questionGenerationCallAllowance: number;
  creditBalance: number;
};

export function RunForm({
  estimatedMicrosPerProviderCall,
  ceilingMicrosPerProviderCall,
  aiCallsPerProviderJob,
  questionGenerationCallAllowance,
  creditBalance,
}: RunFormProps) {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState(100);
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  );
  const providerCalls = questionCount * 3;
  const plannedAiCalls =
    providerCalls * aiCallsPerProviderJob + questionGenerationCallAllowance;
  const estimate = useMemo(
    () => formatMicros(plannedAiCalls * estimatedMicrosPerProviderCall),
    [estimatedMicrosPerProviderCall, plannedAiCalls],
  );
  const ceiling = useMemo(
    () => formatMicros(plannedAiCalls * ceilingMicrosPerProviderCall),
    [ceilingMicrosPerProviderCall, plannedAiCalls],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      subjectName: formData.get("subjectName"),
      canonicalDomain: formData.get("canonicalDomain"),
      description: formData.get("description"),
      aliases: parseList(formData.get("aliases")),
      competitors: parseList(formData.get("competitors")),
      market: formData.get("market"),
      locale: formData.get("locale"),
      questionCount,
      confirmedBudget: confirmed,
    };

    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        error?: string;
        run?: { id: string };
      };

      if (!response.ok || !data.run) {
        throw new Error(data.error ?? "The benchmark could not be started.");
      }

      setIdempotencyKey(crypto.randomUUID());
      router.push(`/runs/${data.run.id}`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The benchmark could not be started.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="bg-[#0b0e0c]">
      <form onSubmit={onSubmit}>
        <CardHeader className="border-b border-white/[0.07] pb-6">
          <CardTitle className="text-xl">New visibility benchmark</CardTitle>
          <CardDescription>
            Describe the subject precisely. Discovery prompts will omit its name,
            aliases, and domain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Brand or product name" htmlFor="subjectName">
              <Input
                id="subjectName"
                name="subjectName"
                placeholder="Northstar Analytics"
                required
                minLength={2}
                maxLength={120}
                autoComplete="organization"
              />
            </Field>
            <Field label="Canonical domain" htmlFor="canonicalDomain">
              <Input
                id="canonicalDomain"
                name="canonicalDomain"
                placeholder="northstar.example"
                required
                maxLength={253}
                autoComplete="url"
              />
            </Field>
          </div>

          <Field label="Category and use-case description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              placeholder="A product analytics platform for B2B SaaS teams that need privacy-friendly funnels, retention cohorts, and warehouse-native reporting."
              required
              minLength={20}
              maxLength={2000}
              rows={5}
            />
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              This becomes the neutral category brief used to generate discovery questions.
            </p>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Aliases (optional)" htmlFor="aliases">
              <Textarea
                id="aliases"
                name="aliases"
                placeholder="Northstar\nNorthstar Analytics"
                rows={3}
              />
            </Field>
            <Field label="Competitors (optional)" htmlFor="competitors">
              <Textarea
                id="competitors"
                name="competitors"
                placeholder="Competitor One\nCompetitor Two"
                rows={3}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Market" htmlFor="market">
              <Input
                id="market"
                name="market"
                placeholder="United States"
                defaultValue="United States"
                required
                maxLength={120}
              />
            </Field>
            <Field label="Locale" htmlFor="locale">
              <Input
                id="locale"
                name="locale"
                defaultValue="en-US"
                required
                maxLength={32}
              />
            </Field>
            <Field label="Question set" htmlFor="questionCount">
              <select
                id="questionCount"
                name="questionCount"
                value={questionCount}
                onChange={(event) => {
                  setQuestionCount(Number(event.target.value));
                  setConfirmed(false);
                }}
                className="h-11 w-full rounded-xl bg-white/[0.055] px-3.5 text-sm text-zinc-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] outline-none focus-visible:shadow-[inset_0_0_0_1px_rgba(110,231,183,0.8),0_0_0_3px_rgba(110,231,183,0.12)]"
              >
                <option value={5}>5 questions · canary</option>
                <option value={25}>25 questions · pulse</option>
                <option value={100}>100 questions · benchmark</option>
              </select>
            </Field>
          </div>

          <div className="rounded-2xl bg-white/[0.035] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {questionCount} questions × 3 providers
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  {providerCalls} grounded queries, up to {providerCalls} contextual
                  analyses, and up to {questionGenerationCallAllowance} generation
                  calls. Estimated {estimate}; conservative scheduling guard {ceiling}.
                  One prepaid run credit is reserved.
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs text-zinc-400 tabular-nums">
                {creditBalance} {creditBalance === 1 ? "credit" : "credits"}
              </span>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3 border-t border-white/[0.07] pt-4 text-sm leading-6 text-zinc-400">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-1 size-4 shrink-0 accent-emerald-300"
              />
              <span>
                I approve this run&apos;s provider-processing plan and understand
                that retries and ambiguous provider timeouts can vary from the
                {` ${ceiling}`} scheduling estimate. Inputs pass through Vercel to
                OpenAI, Anthropic, and Google.
              </span>
            </label>
          </div>

          {error ? (
            <p role="alert" className="rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex-col items-stretch justify-between gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center">
          <p className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="size-4" /> No ungrounded fallback enters the score.
          </p>
          <Button
            type="submit"
            disabled={pending || !confirmed || creditBalance < 1}
            className="sm:min-w-40"
          >
            {pending ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
            {pending ? "Queuing…" : "Start benchmark"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-2">
        {label}
      </Label>
      {children}
    </div>
  );
}

function parseList(value: FormDataEntryValue | null) {
  return typeof value === "string"
    ? value
        .split(/[\n,]/u)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function formatMicros(micros: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(micros / 1_000_000);
}
