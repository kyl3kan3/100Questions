import {
  ArrowRight,
  BookOpenText,
  ChevronDown,
  FileText,
  Network,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AnalyticsEvent } from "@/components/analytics-event";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { absoluteUrl, SOCIAL_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sample AI Visibility Audit",
  description:
    "See a complete fictional 100 Questions report with visibility insights, provider agreement, competitor and source evidence, and prioritized actions.",
  alternates: { canonical: absoluteUrl("/sample-report") },
  openGraph: {
    title: "Sample AI Visibility Audit | 100 Questions",
    description:
      "A complete example of the decision-ready insights and evidence included with every benchmark.",
    url: absoluteUrl("/sample-report"),
    images: [SOCIAL_IMAGE],
  },
};

const actions = [
  {
    title: "Publish a warehouse-native analytics comparison",
    category: "Content gap",
    evidenceId: "warehouse-native",
    evidenceLabel: "Warehouse-native buyer question",
    rationale:
      "Northstar was absent across four distinct warehouse-native buyer questions, while Luminary appeared repeatedly.",
    action:
      "Create an owned comparison page covering deployment model, supported warehouses, migration effort, limitations, and verifiable customer evidence.",
  },
  {
    title: "Earn inclusion in two repeatedly cited buyer guides",
    category: "Recurring source",
    evidenceId: "warehouse-native",
    evidenceLabel: "Warehouse-native buyer question",
    rationale:
      "Analytics Weekly and Modern Data Stack were cited across six missed answers spanning five buyer questions.",
    action:
      "Pitch a factual product profile or hands-on review to those publishers, with documentation and customer proof they can independently verify.",
  },
  {
    title: "Strengthen the implementation page",
    category: "Citation gap",
    evidenceId: "implementation",
    evidenceLabel: "Implementation buyer question",
    rationale:
      "Models mentioned Northstar across four implementation questions but often cited third-party summaries instead of northstar.example.",
    action:
      "Add prerequisites, setup steps, time-to-value ranges, architecture diagrams, and dated documentation on the owned implementation page.",
  },
  {
    title: "Answer privacy and data-residency questions directly",
    category: "Unanimous miss",
    evidenceId: "privacy-first",
    evidenceLabel: "Privacy-first buyer question",
    rationale:
      "Northstar was unanimously absent from three privacy-first buyer questions for regulated teams.",
    action:
      "Publish a plain-language security and data-residency page with regions, retention controls, subprocessors, certifications, and review dates.",
  },
  {
    title: "Clarify the best-fit customer profile",
    category: "Mention quality",
    evidenceId: "implementation",
    evidenceLabel: "Implementation buyer question",
    rationale:
      "Five distinct buyer questions produced incidental rather than shortlist-level mentions.",
    action:
      "Add concrete best-fit and not-a-fit sections to the homepage and relevant use-case pages, supported by specific workflows and outcomes.",
  },
] as const;

const themes = [
  {
    title: "Warehouse-native comparisons",
    questions: 4,
    misses: "9 of 14 grounded answers",
    note: "Luminary is the most frequent replacement.",
  },
  {
    title: "Privacy and compliance",
    questions: 3,
    misses: "10 of 12 grounded answers",
    note: "Two questions were unanimous misses.",
  },
  {
    title: "Implementation proof",
    questions: 4,
    misses: "7 of 15 grounded answers",
    note: "Northstar appears, but owned evidence is rarely cited.",
  },
] as const;

const providers = [
  ["OpenAI", 46, "8 points above overall"],
  ["Claude", 34, "4 points below overall"],
  ["Gemini", 31, "7 points below overall"],
  ["Grok", 39, "1 point above overall"],
] as const;

const competitors = [
  ["Northstar (you)", 28, 15],
  ["Luminary", 41, 19],
  ["MetricFlow", 25, 14],
  ["Beacon", 12, 8],
] as const;

const sources = [
  ["analyticsweekly.example", 4, 3, 5],
  ["moderndatastack.example", 3, 4, 4],
  ["saasopsreview.example", 2, 2, 2],
] as const;

const evidence = [
  {
    id: "warehouse-native",
    question: "Which product analytics tools work directly on a data warehouse?",
    agreement: "Unanimous miss",
    mentioned: "0 of 4 grounded AIs mentioned Northstar",
    competitors: "Luminary, MetricFlow",
    source: "analyticsweekly.example",
    providers: [
      ["OpenAI", "Northstar not mentioned"],
      ["Claude", "Northstar not mentioned"],
      ["Gemini", "Northstar not mentioned"],
      ["Grok", "Northstar not mentioned"],
    ],
  },
  {
    id: "privacy-first",
    question: "What are the best privacy-first analytics platforms for healthcare SaaS?",
    agreement: "Mixed result",
    mentioned: "1 of 4 grounded AIs mentioned Northstar",
    competitors: "Beacon, MetricFlow",
    source: "moderndatastack.example",
    providers: [
      ["OpenAI", "Northstar mentioned"],
      ["Claude", "Northstar not mentioned"],
      ["Gemini", "Northstar not mentioned"],
      ["Grok", "Northstar not mentioned"],
    ],
  },
  {
    id: "implementation",
    question: "Which analytics platform is easiest to implement for a small data team?",
    agreement: "Mixed result",
    mentioned: "2 of 4 grounded AIs mentioned Northstar",
    competitors: "Luminary",
    source: "saasopsreview.example",
    providers: [
      ["OpenAI", "Northstar mentioned"],
      ["Claude", "Northstar not mentioned"],
      ["Gemini", "Northstar mentioned"],
      ["Grok", "Northstar not mentioned"],
    ],
  },
] as const;

export default function SampleReportPage() {
  return (
    <main className="min-h-screen bg-[#070908] text-zinc-100">
      <AnalyticsEvent event="sample_report_viewed" />
      <MarketingHeader />
      <div className="page-shell py-10 md:py-16">
        <header className="mb-8 flex flex-col gap-6 border-b border-white/[0.07] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">Sample report</Badge>
              <span className="text-xs text-zinc-400">
                Fictional company · illustrative evidence
              </span>
            </div>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
              Northstar Analytics AI visibility audit
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-zinc-400">
              A point-in-time, web-grounded benchmark across 25 shared questions, four providers, competitors, and citation evidence.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/auth/sign-up">
              Run my first audit — $9 <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </header>

        <section aria-labelledby="sample-verdict-heading">
          <Card className="bg-[#0b0e0c] shadow-[0_20px_60px_rgba(0,0,0,0.22),inset_0_0_0_1px_rgba(255,255,255,0.07)]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="eyebrow">Executive verdict</p>
                    <Badge variant="success">Coverage threshold met</Badge>
                  </div>
                  <h2
                    className="mt-4 text-balance text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl"
                    id="sample-verdict-heading"
                  >
                    Northstar has uneven visibility across buyer questions and AI providers.
                  </h2>
                  <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-zinc-400">
                    It reached 15 of 20 evaluated discovery questions across four providers. Distinct questions and provider-answer events are counted separately.
                  </p>
                </div>
                <div className="shrink-0 lg:text-right">
                  <p className="text-5xl font-semibold tracking-[-0.06em] text-white tabular-nums">
                    38%
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    of grounded discovery answers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-label="Report summary" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Buyer-question reach" value="15/20" detail="Mentioned by at least one grounded provider" />
          <Metric label="Mixed provider signals" value="8" detail="Distinct questions where providers disagreed" />
          <Metric label="Unanimous misses" value="5" detail="Distinct questions where every grounded provider missed" />
          <Metric label="Owned site cited" value="25%" detail="18 of 73 grounded discovery answers" />
        </section>

        <section aria-labelledby="sample-themes-heading" className="mt-8">
          <p className="eyebrow">Opportunity themes</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white" id="sample-themes-heading">
            Where visibility breaks down
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Ranked by missed grounded provider answers, grouped into distinct buyer-question themes.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {themes.map((theme, index) => (
              <Card className="bg-[#0b0e0c]" key={theme.title}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-amber-300/12 text-xs font-semibold text-amber-200">
                      {index + 1}
                    </span>
                    <Badge variant="secondary">{theme.questions} questions</Badge>
                  </div>
                  <h3 className="mt-4 font-semibold text-zinc-100">{theme.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">Missed in {theme.misses}.</p>
                  <p className="mt-3 text-xs leading-5 text-zinc-400">{theme.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-6" aria-label="Provider agreement">
          <Card className="bg-[#0b0e0c]">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200">
                  <Network aria-hidden="true" className="size-4" />
                </div>
                <div>
                  <CardTitle as="h2">AI agreement and provider differences</CardTitle>
                  <CardDescription className="mt-1">
                    Agreement is measured per distinct question. Mention rates describe provider behavior, not answer accuracy.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <AgreementStat label="All mentioned Northstar" value="7" />
                <AgreementStat label="Providers disagreed" value="8" />
                <AgreementStat label="All missed Northstar" value="5" />
              </div>
              <div className="space-y-2">
                {providers.map(([provider, value, difference]) => (
                  <div className="rounded-xl bg-white/[0.025] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]" key={provider}>
                    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium text-zinc-200">{provider}</span>
                      <span className="font-semibold text-white tabular-nums">{value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-emerald-300" style={{ width: `${value}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-zinc-400">{difference}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]" aria-label="Competitor and source intelligence">
          <Card className="bg-[#0b0e0c]">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                  <Users aria-hidden="true" className="size-4" />
                </div>
                <div>
                  <CardTitle as="h2">Competitor mention frequency</CardTitle>
                  <CardDescription className="mt-1">Answer-event frequency plus distinct-question reach.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {competitors.map(([name, answers, questions]) => (
                <div key={name}>
                  <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
                    <span className={name.includes("you") ? "font-medium text-emerald-300" : "text-zinc-300"}>{name}</span>
                    <span className="font-mono text-zinc-400 tabular-nums">{answers}/73 · {Math.round((answers / 73) * 100)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div className={name.includes("you") ? "h-full rounded-full bg-emerald-300" : "h-full rounded-full bg-zinc-500"} style={{ width: `${Math.round((answers / 73) * 100)}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-400">{questions} distinct questions</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[#0b0e0c]">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                  <BookOpenText aria-hidden="true" className="size-4" />
                </div>
                <div>
                  <CardTitle as="h2">Recurring cited domains</CardTitle>
                  <CardDescription className="mt-1">Recurrence does not prove source quality or influence.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {sources.map(([domain, questions, providerCount, misses]) => (
                <div className="rounded-xl bg-white/[0.025] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]" key={domain}>
                  <p className="text-sm font-medium text-zinc-200">{domain}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">{questions} questions · {providerCount} providers · {misses} missed answer events</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-6" aria-labelledby="sample-actions-heading">
          <Card className="border border-emerald-300/15 bg-emerald-300/[0.025]">
            <CardHeader>
              <p className="eyebrow">Prioritized action plan</p>
              <CardTitle as="h2" className="text-xl" id="sample-actions-heading">What Northstar should do next</CardTitle>
              <CardDescription>Each action explains its evidence and links to a representative buyer question. Live reports also link every stored source.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {actions.slice(0, 3).map((action, index) => (
                <Action key={action.title} action={action} rank={index + 1} />
              ))}
              <details className="group rounded-2xl bg-black/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-200 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300/60">
                  Show 2 additional actions
                  <ChevronDown aria-hidden="true" className="size-4 text-zinc-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="space-y-3 border-t border-white/[0.07] p-3">
                  {actions.slice(3).map((action, index) => (
                    <Action key={action.title} action={action} rank={index + 4} />
                  ))}
                </div>
              </details>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6" id="question-evidence">
          <Card className="bg-[#0b0e0c]">
            <CardHeader>
              <p className="eyebrow">Supporting evidence</p>
              <CardTitle as="h2">One row per buyer question</CardTitle>
              <CardDescription>Provider agreement and the main competitor/source signal stay visible. Individual provider outcomes remain collapsed until needed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {evidence.map((item) => (
                <details className="group scroll-mt-24 rounded-2xl bg-white/[0.025] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.065)] open:bg-white/[0.04]" id={`evidence-${item.id}`} key={item.question}>
                  <summary className="cursor-pointer list-none rounded-2xl px-4 py-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300/60 sm:px-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap gap-2"><Badge variant={item.agreement === "Unanimous miss" ? "warning" : "secondary"}>{item.agreement}</Badge><Badge variant="secondary">Discovery</Badge></div>
                        <h3 className="text-pretty text-sm font-medium leading-6 text-zinc-200">{item.question}</h3>
                      </div>
                      <ChevronDown aria-hidden="true" className="mt-1 size-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" />
                    </div>
                    <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                      <Signal label="Brand outcome" value={item.mentioned} />
                      <Signal label="Leading competitors" value={item.competitors} />
                      <Signal label="Key cited domain" value={item.source} />
                    </div>
                  </summary>
                  <div className="grid gap-2 border-t border-white/[0.07] p-3 sm:grid-cols-2 sm:p-4">
                    {item.providers.map(([provider, result]) => (
                      <div className="rounded-xl bg-black/20 px-4 py-3 text-xs" key={provider}>
                        <p className="font-medium text-zinc-200">{provider}</p>
                        <p className="mt-1 text-zinc-400">{result}</p>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-6" aria-label="Reliability and methodology">
          <Card className="bg-[#0b0e0c]">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300"><ShieldCheck aria-hidden="true" className="size-4" /></div>
                <div><CardTitle as="h2">Reliability, coverage, and limits</CardTitle><CardDescription className="mt-1">Execution quality for this benchmark—not a claim that every AI answer is factually correct.</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ReliabilityStat label="Discovery questions" value="20" />
                <ReliabilityStat label="Grounded provider breadth" value="4" />
                <ReliabilityStat label="Grounded discovery answers" value="73" />
                <ReliabilityStat label="Excluded discovery answers" value="7" />
              </div>
              <p className="mt-4 text-xs leading-5 text-zinc-400">Discovery-answer coverage met the 90% threshold. Failed or ungrounded answers are excluded rather than counted as Northstar misses; brand-specific diagnostic questions are reported separately.</p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Trust icon={<Target />} title="Identical test">All four providers receive the same frozen question set.</Trust>
          <Trust icon={<FileText />} title="API-grounded evidence">Results come from model APIs with web grounding and can differ from consumer chat interfaces.</Trust>
          <Trust icon={<TrendingUp />} title="Designed for follow-up">Rerun the exact questions after implementation and compare the deltas.</Trust>
        </section>
      </div>
    </main>
  );
}

type ActionItem = (typeof actions)[number];

function Action({ action, rank }: { action: ActionItem; rank: number }) {
  return (
    <article className="rounded-2xl bg-black/25 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
      <div className="flex gap-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-300 font-semibold text-emerald-950">{rank}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><h3 className="font-medium text-white">{action.title}</h3><Badge variant="secondary">{action.category}</Badge></div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{action.action}</p>
          <p className="mt-2 text-xs leading-5 text-zinc-400">Why: {action.rationale}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs"><a className="text-emerald-300 underline-offset-4 hover:text-emerald-200 hover:underline" href={`#evidence-${action.evidenceId}`}>View: {action.evidenceLabel}</a></div>
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <Card className="bg-[#0b0e0c]"><CardContent className="p-5"><p className="text-xs text-zinc-400">{label}</p><p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white tabular-nums">{value}</p><p className="mt-1 text-xs leading-5 text-zinc-400">{detail}</p></CardContent></Card>;
}

function AgreementStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/[0.025] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]"><p className="text-xs text-zinc-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white tabular-nums">{value}</p><p className="mt-1 text-xs text-zinc-400">distinct questions</p></div>;
}

function Signal({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-black/15 px-3 py-2.5"><p className="text-zinc-400">{label}</p><p className="mt-1 leading-5 text-zinc-300">{value}</p></div>;
}

function ReliabilityStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/[0.025] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]"><p className="text-xs text-zinc-400">{label}</p><p className="mt-2 text-xl font-semibold text-white tabular-nums">{value}</p></div>;
}

function Trust({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <Card className="bg-[#0b0e0c]"><CardContent className="p-6"><div className="text-emerald-300 [&>svg]:size-5">{icon}</div><h2 className="mt-4 font-medium text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{children}</p></CardContent></Card>;
}
