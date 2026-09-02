import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ContentByline } from "@/components/content-byline";
import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EDITORIAL_AUTHOR_ID } from "@/lib/editorial";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const pageUrl = absoluteUrl("/ai-visibility-audit-vs-monitoring");
const publishedAt = "2026-09-02T00:00:00.000Z";
const reviewedAt = "2026-09-02T00:00:00.000Z";

export const metadata: Metadata = {
  title: "Do You Need an AI Visibility Subscription?",
  description:
    "Prepaid AI visibility audit vs daily GEO monitoring. 100 Questions is a snapshot with evidence, not a replacement for tracking. Dated Sept 2026.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI Visibility Audit vs Monitoring: When a Snapshot Is Enough",
    description:
      "Compare a prepaid frozen benchmark with daily GEO monitoring—cadence, cost, evidence, and when each job is the better buy.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "article",
    locale: "en_US",
    publishedTime: publishedAt,
    modifiedTime: reviewedAt,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Visibility Audit vs Monitoring",
    description:
      "When a prepaid snapshot is enough—and when to pay for daily GEO monitoring instead.",
    images: [SOCIAL_IMAGE],
  },
};

const comparisonRows = [
  {
    dimension: "Primary job",
    snapshot:
      "One bounded baseline, client deliverable, or like-for-like rerun",
    monitor: "Ongoing trend lines, alerts, and configurable prompt programs",
  },
  {
    dimension: "Question set",
    snapshot: "Frozen 25 questions at a fixed timestamp",
    monitor: "User-configured prompts, often edited over time",
  },
  {
    dimension: "Cadence",
    snapshot: "Point-in-time (run when needed)",
    monitor: "Daily or weekly checks on a schedule",
  },
  {
    dimension: "Evidence",
    snapshot: "Stored answers, citations, and exports for one run",
    monitor: "Dashboard history and trend charts",
  },
  {
    dimension: "Commercial model",
    snapshot: "Prepaid credits, no subscription, 12-month validity",
    monitor: "Monthly or annual subscription, often per seat or domain",
  },
  {
    dimension: "Perplexity / AI Overviews",
    snapshot: "Not tested by 100 Questions",
    monitor: "Often included on monitoring products such as Otterly.AI",
  },
  {
    dimension: "Best decision signal",
    snapshot: "Did this specific change move the frozen set?",
    monitor: "Is visibility drifting up or down over time?",
  },
] as const;

const cashRows = [
  {
    scenario: "One baseline this quarter",
    snapshot: "$9 first run, then $15–$99 prepaid packages",
    monitor: "$29–$99+/month recurring (vendor-dependent)",
  },
  {
    scenario: "Four comparable reruns in 12 months",
    snapshot: "$39 three-pack or $99 ten-pack (credits valid 12 months)",
    monitor: "$348–$1,188+ at $29–$99/month before add-ons",
  },
  {
    scenario: "Daily alerts for 12 months",
    snapshot: "Not the product job",
    monitor: "Subscription required; 100 Questions does not replace this",
  },
  {
    scenario: "Client deliverable with PDF evidence",
    snapshot: "Built into each prepaid benchmark run",
    monitor: "Depends on vendor reporting; may need manual export work",
  },
] as const;

const snapshotEnough = [
  "You need one defensible baseline before a project starts.",
  "A client or stakeholder wants a bounded report with inspectable evidence.",
  "You will rerun the same frozen question set after a specific implementation.",
  "Budget is fixed and a subscription would be underused.",
  "You want Claude, Gemini, and Grok in one run without engine add-ons.",
] as const;

const monitoringBetter = [
  "An owner will check visibility every day or week.",
  "Perplexity, Google AI Overviews, or AI Mode coverage is required.",
  "You need alerts when a competitor overtakes you on a prompt list.",
  "Multiple projects, regions, or large prompt libraries are in scope.",
  "Reporting integrations, API access, or enterprise governance matter.",
] as const;

const faqs = [
  {
    question: "What is the difference between an AI visibility audit and monitoring?",
    answer:
      "An audit freezes the questions, providers, scoring rules, and timestamp so one result can be inspected as a controlled baseline. Monitoring repeatedly checks a configured prompt set and is useful for trends, reporting, and alerts. Tracking favors continuity; an audit favors a bounded deliverable and like-for-like implementation check.",
  },
  {
    question: "Is 100 Questions a subscription?",
    answer:
      "No. 100 Questions sells prepaid benchmark credits, not seats. The first benchmark is $9; later packages are $15 for one credit, $39 for three, or $99 for ten. Credits are valid for 12 months. It does not replace daily tracking products.",
  },
  {
    question: "When is a snapshot enough?",
    answer:
      "A snapshot is enough when the decision is whether to start a project, what to fix first, or whether a specific change moved the needle on a frozen question set. It is not enough when the team needs continuous alerts, Perplexity coverage, or long-running trend lines.",
  },
  {
    question: "Does an audit guarantee better AI visibility?",
    answer:
      "No. An audit measures a time-stamped sample and preserves the evidence behind it. AI answers vary by provider, model, search results, prompt, location, and time. No credible product can guarantee future mentions or citations.",
  },
] as const;

const limitations = [
  "100 Questions is a prepaid snapshot with API-grounded evidence. It does not track Perplexity or Google AI Overviews and does not send daily alerts.",
  "Monitoring subscription prices in the 12-month cash table use published entry tiers as of September 2, 2026. Add-ons, seats, domains, and enterprise tiers can raise total cost.",
  "Some teams use both: a frozen audit for baselines and reruns, plus a monitor for ongoing prompts that matter commercially.",
] as const;

export default function AiVisibilityAuditVsMonitoringPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline:
          "Do you need an AI visibility subscription? Snapshot benchmark vs continuous GEO monitoring",
        description:
          "A practical comparison of prepaid AI visibility audits and daily GEO monitoring by job, evidence, and 12-month cost.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: publishedAt,
        dateModified: reviewedAt,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": EDITORIAL_AUTHOR_ID },
        reviewedBy: { "@id": EDITORIAL_AUTHOR_ID },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        about: [
          "AI visibility audit",
          "GEO monitoring",
          "AI visibility subscription",
        ],
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
          {
            "@type": "ListItem",
            position: 2,
            name: "Audit vs monitoring",
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#070908] text-zinc-100">
      <MarketingHeader />
      <main>
        <article>
          <header className="border-b border-white/[0.07]">
            <div className="page-shell py-16 sm:py-20 lg:py-24">
              <nav className="text-xs text-zinc-400" aria-label="Breadcrumb">
                <Link className="hover:text-zinc-200" href="/">
                  Home
                </Link>{" "}
                <span aria-hidden="true">/</span>{" "}
                <span className="text-zinc-300">Audit vs monitoring</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                Buying guide · reviewed September 2, 2026
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Do you need an AI visibility subscription? Snapshot benchmark vs
                continuous GEO monitoring
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                Many teams buy a subscription because monitoring is the default
                category story. The better question is which measurement job you
                are hiring a product to do: a frozen evidence-linked snapshot, or
                daily checks on a living prompt program.
              </p>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                <strong className="font-medium text-zinc-300">Disclosure:</strong>{" "}
                100 Questions publishes this page and sells prepaid benchmark
                credits. It is a snapshot with evidence, not a replacement for
                daily tracking, Perplexity monitoring, or enterprise AEO operations.
              </p>
              <ContentByline
                publishedAt={publishedAt}
                publishedLabel="September 2, 2026"
                modifiedAt={reviewedAt}
                modifiedLabel="September 2, 2026"
                note="First-party product and vendor pricing review"
              />
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section aria-labelledby="comparison-heading">
              <p className="eyebrow">Side by side</p>
              <h2
                id="comparison-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Snapshot benchmark vs continuous monitor
              </h2>
              <div className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <table className="min-w-[820px] text-left text-sm">
                  <thead className="bg-[#0b0e0c] text-zinc-200">
                    <tr>
                      <th className="p-5 font-semibold">Dimension</th>
                      <th className="p-5 font-semibold">Prepaid audit (snapshot)</th>
                      <th className="p-5 font-semibold">Subscription (monitor)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr
                        key={row.dimension}
                        className="border-t border-white/[0.07] bg-[#0b0e0c] align-top"
                      >
                        <th className="p-5 font-semibold text-white">{row.dimension}</th>
                        <td className="max-w-sm p-5 leading-6 text-zinc-300">
                          {row.snapshot}
                        </td>
                        <td className="max-w-sm p-5 leading-6 text-zinc-400">
                          {row.monitor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2" aria-labelledby="when-snapshot-heading">
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                <p className="eyebrow">When a snapshot is enough</p>
                <h2
                  id="when-snapshot-heading"
                  className="mt-4 text-2xl font-semibold text-white"
                >
                  You need a bounded deliverable
                </h2>
                <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-zinc-400">
                  {snapshotEnough.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                <p className="eyebrow">When to pay for monitoring</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  Continuity is the actual job
                </h2>
                <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-zinc-400">
                  {monitoringBetter.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section aria-labelledby="cash-heading">
              <p className="eyebrow">12-month cash view</p>
              <h2
                id="cash-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                What each model costs over a year
              </h2>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                This table compares common jobs, not every vendor bundle. Monitoring
                figures use published entry tiers; add-ons and enterprise plans can
                cost more. 100 Questions uses prepaid credits with no seat fees.
              </p>
              <div className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <table className="min-w-[820px] text-left text-sm">
                  <thead className="bg-[#0b0e0c] text-zinc-200">
                    <tr>
                      <th className="p-5 font-semibold">Scenario (12 months)</th>
                      <th className="p-5 font-semibold">Prepaid snapshot</th>
                      <th className="p-5 font-semibold">Typical monitor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashRows.map((row) => (
                      <tr
                        key={row.scenario}
                        className="border-t border-white/[0.07] bg-[#0b0e0c] align-top"
                      >
                        <th className="p-5 font-semibold text-white">{row.scenario}</th>
                        <td className="max-w-sm p-5 leading-6 text-zinc-300">
                          {row.snapshot}
                        </td>
                        <td className="max-w-sm p-5 leading-6 text-zinc-400">
                          {row.monitor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-5 max-w-3xl text-xs leading-5 text-zinc-400">
                See sourced vendor prices in{" "}
                <Link
                  className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                  href="/ai-visibility-tools-pricing"
                >
                  what AI visibility tools cost in 2026
                </Link>
                .
              </p>
            </section>

            <section aria-labelledby="limitations-heading">
              <p className="eyebrow">Interpretation limits</p>
              <h2
                id="limitations-heading"
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                What this guide does not claim
              </h2>
              <ul className="mt-6 list-disc space-y-3 pl-5 text-sm leading-6 text-zinc-400">
                {limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="audit-faq-heading">
              <p className="eyebrow">Questions buyers ask</p>
              <h2
                id="audit-faq-heading"
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                Frequently asked questions
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {faqs.map(({ question, answer }) => (
                  <section
                    key={question}
                    className="rounded-[20px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <h3 className="text-balance font-semibold text-white">{question}</h3>
                    <p className="mt-3 text-pretty text-sm leading-6 text-zinc-400">
                      {answer}
                    </p>
                  </section>
                ))}
              </div>
              <p className="mt-6 max-w-3xl text-sm leading-6 text-zinc-400">
                For product-specific alternatives, compare{" "}
                <Link
                  className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                  href="/otterly-alternative"
                >
                  Otterly.AI alternatives
                </Link>{" "}
                and{" "}
                <Link
                  className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                  href="/profound-alternative"
                >
                  Profound alternatives
                </Link>
                .
              </p>
            </section>

            <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
              <CheckCircle2 className="size-6" aria-hidden="true" />
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                    Start with evidence
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    Run one frozen benchmark for $9.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-800">
                    Read the{" "}
                    <Link
                      className="font-medium underline underline-offset-4"
                      href="/sample-report"
                    >
                      sample report
                    </Link>{" "}
                    to see what a snapshot deliverable includes.
                  </p>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-zinc-950 text-white hover:bg-zinc-800"
                >
                  <Link href="/auth/sign-up">
                    Start a benchmark <ArrowRight />
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        </article>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
