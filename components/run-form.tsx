"use client";

import { ArrowLeft, ArrowRight, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/analytics";

type RunFormProps = {
  creditBalance: number;
  unlimitedAccess?: boolean;
  providerCount: number;
  questionCount: number;
};

export function RunForm({
  creditBalance,
  unlimitedAccess = false,
  providerCount,
  questionCount,
}: RunFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [pending, setPending] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestionMessage, setSuggestionMessage] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [values, setValues] = useState({
    subjectName: "",
    canonicalDomain: "",
    description: "",
    aliases: "",
    competitors: "",
    market: "United States",
    locale: "en-US",
  });
  const providerCalls = questionCount * providerCount;

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function continueToDetails() {
    if (values.subjectName.trim().length < 2 || !values.canonicalDomain.trim()) {
      setError("Add a brand name and domain first.");
      return;
    }

    setError(null);
    setSuggestionMessage(null);
    setSuggesting(true);
    try {
      const response = await fetch("/api/subjects/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subjectName: values.subjectName,
          canonicalDomain: values.canonicalDomain,
        }),
      });
      const data = (await response.json()) as {
        description?: string;
        aliases?: string[];
        sourceUrl?: string | null;
        populated?: boolean;
        error?: string;
      };

      if (!response.ok) throw new Error(data.error ?? "Website details could not be read.");
      setValues((current) => ({
        ...current,
        description: current.description || data.description || "",
        aliases: current.aliases || data.aliases?.join("\n") || current.subjectName,
      }));
      setSuggestionMessage(
        data.populated
          ? `Suggested from ${data.sourceUrl ? new URL(data.sourceUrl).hostname : "the public homepage"}. Review everything before running.`
          : "We could not find a usable public description. Add the category, ideal customer, and main use cases below.",
      );
    } catch (caught) {
      setValues((current) => ({
        ...current,
        aliases: current.aliases || current.subjectName,
      }));
      setSuggestionMessage(
        caught instanceof Error
          ? `${caught.message} You can enter the details manually below.`
          : "Website details could not be read. Enter them manually below.",
      );
    } finally {
      setSuggesting(false);
      setStep(2);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": idempotencyKey,
        },
        body: JSON.stringify({
          ...values,
          aliases: parseList(values.aliases),
          competitors: parseList(values.competitors),
          questionCount,
          confirmedBudget: true,
        }),
      });
      const data = (await response.json()) as { error?: string; run?: { id: string } };

      if (!response.ok || !data.run) {
        throw new Error(data.error ?? "The benchmark could not be started.");
      }

      trackEvent("benchmark_started", { run_id: data.run.id, is_rerun: false });
      setIdempotencyKey(crypto.randomUUID());
      router.push(`/runs/${data.run.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The benchmark could not be started.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="bg-[#0b0e0c]">
      <form onSubmit={onSubmit}>
        <CardHeader className="border-b border-white/[0.07] pb-6">
          <p className="eyebrow">Step {step} of 2</p>
          <CardTitle className="text-xl">
            {step === 1 ? "What should we audit?" : "Review the benchmark brief"}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? "Start with the brand and website. We will suggest a description and aliases from the public homepage, then you can add competitors."
              : "Edit the suggested context and add the competitors buyers are likely to compare."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Brand or product name" htmlFor="subjectName">
                <Input id="subjectName" value={values.subjectName} onChange={(event) => update("subjectName", event.target.value)} placeholder="Northstar Analytics" required minLength={2} maxLength={120} autoComplete="organization" />
              </Field>
              <Field label="Canonical domain" htmlFor="canonicalDomain">
                <Input id="canonicalDomain" value={values.canonicalDomain} onChange={(event) => update("canonicalDomain", event.target.value)} placeholder="northstar.example" required maxLength={253} autoComplete="url" />
              </Field>
            </div>
          ) : (
            <>
              {suggestionMessage ? <p className="rounded-xl bg-emerald-300/[0.06] px-4 py-3 text-xs leading-5 text-emerald-100 shadow-[inset_0_0_0_1px_rgba(110,231,183,0.12)]">{suggestionMessage}</p> : null}
              <Field label="Category and use-case description" htmlFor="description">
                <Textarea id="description" value={values.description} onChange={(event) => update("description", event.target.value)} placeholder="A product analytics platform for B2B SaaS teams that need privacy-friendly funnels, retention cohorts, and warehouse-native reporting." required minLength={20} maxLength={2000} rows={5} />
                <p className="mt-2 text-xs leading-5 text-zinc-400">This becomes the neutral brief used to generate discovery questions.</p>
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Aliases (optional)" htmlFor="aliases">
                  <Textarea id="aliases" value={values.aliases} onChange={(event) => update("aliases", event.target.value)} placeholder="Northstar\nNorthstar Analytics" rows={3} />
                </Field>
                <Field label="Competitors (recommended)" htmlFor="competitors">
                  <Textarea id="competitors" value={values.competitors} onChange={(event) => update("competitors", event.target.value)} placeholder="Competitor One\nCompetitor Two" rows={3} />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Market" htmlFor="market">
                  <Input id="market" value={values.market} onChange={(event) => update("market", event.target.value)} required maxLength={120} />
                </Field>
                <Field label="Locale" htmlFor="locale">
                  <Input id="locale" value={values.locale} onChange={(event) => update("locale", event.target.value)} required maxLength={32} />
                </Field>
              </div>
              <div className="rounded-2xl bg-white/[0.035] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">This uses one credit</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-400">{questionCount} shared questions across {providerCount} web-grounded models produce up to {providerCalls} evidence-backed answers. Results can differ from consumer ChatGPT, Gemini, Claude, or Grok interfaces.</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-zinc-400 tabular-nums">{unlimitedAccess ? "Unlimited" : `${creditBalance} ${creditBalance === 1 ? "credit" : "credits"}`}</span>
                </div>
              </div>
            </>
          )}

          {error ? <p role="alert" className="rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
        </CardContent>
        <CardFooter className="flex-col items-stretch justify-between gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center">
          <p className="flex items-center gap-2 text-xs text-zinc-400"><ShieldCheck className="size-4" /> Private by default. No ungrounded fallback enters the score.</p>
          <div className="flex gap-2">
            {step === 2 ? <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft /> Back</Button> : null}
            {step === 1 ? (
              <Button type="button" onClick={() => void continueToDetails()} disabled={suggesting} className="sm:min-w-40">
                {suggesting ? <LoaderCircle className="animate-spin" /> : <Sparkles />}{suggesting ? "Finding details…" : "Suggest details"}
              </Button>
            ) : (
              <Button type="submit" disabled={pending || (!unlimitedAccess && creditBalance < 1)} className="sm:min-w-40">
                {pending ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}{pending ? "Queuing…" : "Run benchmark"}
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div><Label htmlFor={htmlFor} className="mb-2">{label}</Label>{children}</div>;
}

function parseList(value: string) {
  return value.split(/[\n,]/u).map((item) => item.trim()).filter(Boolean);
}
