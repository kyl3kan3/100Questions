"use client";

import {
  AlertTriangle,
  Check,
  ClipboardCopy,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type RiskStatus = "unchecked" | "clear" | "risk";

type Profile = {
  domain: string;
  industry: string;
};

const riskAreas = [
  {
    id: "incorrect-claims",
    title: "Incorrect claims",
    description:
      "Detect facts that are outdated, invented, or unsupported by current public evidence.",
    checks: ({ domain, industry }: Profile) => [
      `Across the tested answers, are ${domain}'s products, audience, locations, pricing model, and capabilities described accurately?`,
      `Do answers avoid assigning ${domain} unsupported certifications, customers, outcomes, or ${industry} features?`,
    ],
  },
  {
    id: "missing-citations",
    title: "Missing citations",
    description:
      "Find claims that lack an owned or trustworthy third-party source a reviewer can inspect.",
    checks: ({ domain, industry }: Profile) => [
      `When ${domain} is mentioned, does the answer cite a page that supports the specific claim?`,
      `For important ${industry} buyer questions, are authoritative third-party sources corroborating ${domain}?`,
    ],
  },
  {
    id: "competitor-substitution",
    title: "Competitor substitution",
    description:
      "Spot questions where another company is recommended instead of, or incorrectly confused with, the target.",
    checks: ({ domain, industry }: Profile) => [
      `Which competitors replace ${domain} in ${industry} shortlists, and what evidence appears to justify the substitution?`,
      `Does any answer confuse ${domain} with a similarly named company, product, or domain?`,
    ],
  },
  {
    id: "inconsistent-descriptions",
    title: "Inconsistent descriptions",
    description:
      "Compare the category, audience, and differentiators used across providers and questions.",
    checks: ({ domain, industry }: Profile) => [
      `Do ChatGPT, Claude, Gemini, and Grok place ${domain} in the same primary ${industry} category?`,
      `Are the audience, use cases, and differentiators materially consistent across the tested answers?`,
    ],
  },
  {
    id: "unanswered-buyer-questions",
    title: "Unanswered buyer questions",
    description:
      "Identify decision-stage questions where the brand is absent or the answer lacks useful evidence.",
    checks: ({ domain, industry }: Profile) => [
      `Is ${domain} present for neutral discovery, comparison, pricing, implementation, risk, and proof questions in ${industry}?`,
      `Which high-intent question produces no eligible grounded answer, no target mention, or no useful source?`,
    ],
  },
] as const;

export function AiBrandRiskChecker() {
  const [domain, setDomain] = useState("");
  const [industry, setIndustry] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [statuses, setStatuses] = useState<Record<string, RiskStatus>>({});
  const [copied, setCopied] = useState(false);

  function build(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextDomain = readableDomain(domain);
    const nextIndustry = industry.trim();
    if (!nextDomain || !nextIndustry) return;

    setProfile({ domain: nextDomain, industry: nextIndustry });
    setStatuses({});
    setCopied(false);
  }

  function updateStatus(id: string, status: RiskStatus) {
    setStatuses((current) => ({ ...current, [id]: status }));
  }

  async function copyChecklist() {
    if (!profile) return;
    const text = [
      `AI brand risk review: ${profile.domain}`,
      `Industry: ${profile.industry}`,
      "",
      ...riskAreas.flatMap((area) => [
        `${area.title} — ${statusLabel(statuses[area.id] ?? "unchecked")}`,
        ...area.checks(profile).map((check) => `- ${check}`),
        "",
      ]),
      "Review method: preserve the provider, model, question, answer, source URLs, and timestamp for every finding.",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      setCopied(false);
    }
  }

  const reviewed = Object.values(statuses).filter(
    (status) => status !== "unchecked",
  ).length;
  const flagged = Object.values(statuses).filter(
    (status) => status === "risk",
  ).length;

  return (
    <section
      id="checker"
      className="scroll-mt-24 rounded-[28px] bg-[#0a0d0b] p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_18px_60px_-32px_rgba(0,0,0,0.9)]"
      aria-labelledby="brand-risk-checker-heading"
    >
      <div className="rounded-[20px] bg-[#0d110f] p-5 sm:p-7 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="eyebrow">Free planning tool</p>
            <h2
              id="brand-risk-checker-heading"
              className="mt-4 max-w-xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
            >
              Build a structured AI brand risk review
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-sm leading-6 text-zinc-400">
              Enter a domain and industry to create a review checklist for the
              five risks that matter most. The checklist organizes evidence;
              it does not pretend to have queried AI models.
            </p>
          </div>

          <form onSubmit={build} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="risk-domain">Website domain</Label>
              <Input
                id="risk-domain"
                name="domain"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="example.com"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-industry">Industry or category</Label>
              <Input
                id="risk-industry"
                name="industry"
                placeholder="B2B analytics software"
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={!domain.trim() || !industry.trim()}
              className="sm:col-span-2"
            >
              Build my risk checklist <ShieldCheck aria-hidden="true" />
            </Button>
          </form>
        </div>

        {profile ? (
          <div className="animate-enter mt-8 border-t border-white/[0.08] pt-8">
            <div className="grid gap-4 lg:grid-cols-[0.6fr_1.4fr]">
              <aside className="rounded-[20px] bg-emerald-300 p-6 text-zinc-950">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Review progress
                </p>
                <p className="mt-4 text-5xl font-semibold tracking-[-0.06em] tabular-nums">
                  {flagged}
                </p>
                <p className="mt-1 text-sm font-semibold">risk areas flagged</p>
                <p className="mt-5 text-sm leading-6 text-zinc-800">
                  {reviewed} of {riskAreas.length} areas reviewed for {profile.domain}.
                  A flag is an investigation priority, not a severity score.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void copyChecklist()}
                    className="bg-zinc-950 text-white hover:bg-zinc-800"
                  >
                    {copied ? <Check aria-hidden="true" /> : <ClipboardCopy aria-hidden="true" />}
                    {copied ? "Checklist copied" : "Copy checklist"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-zinc-950 hover:bg-zinc-950/10 hover:text-zinc-950"
                    onClick={() => setStatuses({})}
                  >
                    <RotateCcw aria-hidden="true" /> Reset review
                  </Button>
                </div>
              </aside>

              <div className="space-y-3">
                {riskAreas.map((area) => {
                  const status = statuses[area.id] ?? "unchecked";
                  return (
                    <article
                      key={area.id}
                      className={cn(
                        "rounded-[20px] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-6",
                        status === "risk"
                          ? "bg-amber-300/[0.08]"
                          : status === "clear"
                            ? "bg-emerald-300/[0.055]"
                            : "bg-black/20",
                      )}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{area.title}</h3>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                            {area.description}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2" aria-label={`${area.title} status`}>
                          <StatusButton
                            active={status === "clear"}
                            onClick={() => updateStatus(area.id, "clear")}
                          >
                            Clear
                          </StatusButton>
                          <StatusButton
                            active={status === "risk"}
                            risk
                            onClick={() => updateStatus(area.id, "risk")}
                          >
                            Flag risk
                          </StatusButton>
                        </div>
                      </div>
                      <ul className="mt-5 space-y-3">
                        {area.checks(profile).map((check) => (
                          <li key={check} className="flex gap-3 text-sm leading-6 text-zinc-300">
                            <AlertTriangle className="mt-1 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                            <span>{check}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function StatusButton({
  active,
  risk = false,
  onClick,
  children,
}: {
  active: boolean;
  risk?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-10 rounded-xl px-3 text-xs font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-colors",
        active && !risk && "bg-emerald-300 text-zinc-950",
        active && risk && "bg-amber-300 text-zinc-950",
        !active && "bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]",
      )}
    >
      {children}
    </button>
  );
}

function readableDomain(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`)
      .hostname.replace(/^www\./u, "");
  } catch {
    return trimmed.replace(/^https?:\/\//u, "").split("/")[0];
  }
}

function statusLabel(status: RiskStatus) {
  if (status === "clear") return "reviewed: clear";
  if (status === "risk") return "risk flagged";
  return "not reviewed";
}
