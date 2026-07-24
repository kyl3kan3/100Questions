import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  absoluteUrl,
  SITE_NAME,
  SITE_UPDATED_AT,
  SOCIAL_IMAGE,
} from "@/lib/site";

const pageUrl = absoluteUrl("/peec-ai-alternative");

export const metadata: Metadata = {
  title: "Peec AI Alternative for Prepaid AI Visibility Audits",
  description:
    "Comparing Peec AI's monitoring subscription with 100 Questions' prepaid benchmark: tracking model, providers, scoring, deliverables, and when each fits.",
  keywords: [
    "Peec AI alternative",
    "Peec AI vs 100 Questions",
    "AI visibility tool comparison",
    "AI search monitoring alternative",
    "AI visibility audit",
    "GEO tool comparison",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Peec AI Alternative for Prepaid AI Visibility Audits",
    description:
      "Monitoring subscription or prepaid benchmark? An honest comparison of two different jobs, with a clear answer on when each fits.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "article",
    locale: "en_US",
    publishedTime: SITE_UPDATED_AT,
    modifiedTime: SITE_UPDATED_AT,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Peec AI Alternative for Prepaid AI Visibility Audits",
    description:
      "Continuous monitoring vs. point-in-time benchmarking: what each does well and when you'd choose one over the other.",
    images: [SOCIAL_IMAGE],
  },
};

const rows = [
  {
    label: "Billing model",
    peec: "Subscription tiers (Starter, Pro, Advanced, Enterprise); pricing via trial or sales",
    hundred: "Prepaid credits: $9 first benchmark, then $15 for one, $39 for three, $99 for ten",
  },
  {
    label: "Tracking model",
    peec: "Continuous: your chosen prompts tracked daily, trends over time",
    hundred: "Point-in-time: a frozen 25-question run, repeatable on demand for before/after deltas",
  },
  {
    label: "Question set",
    peec: "Custom prompts you configure (50–350+ depending on plan)",
    hundred: "Generated and frozen per run: 20 neutral discovery questions plus 5 direct diagnostics",
  },
  {
    label: "Providers",
    peec: "ChatGPT, Perplexity, Gemini, and other configurable models",
    hundred: "OpenAI, Claude, Gemini, and Grok via APIs, with required shared web-search grounding",
  },
  {
    label: "Scoring",
    peec: "Visibility, position, and sentiment across tracked prompts",
    hundred: "Visibility, prominence, share of voice, claimed-domain citations, sentiment, and coverage, scored against grounded answers only",
  },
  {
    label: "Output",
    peec: "Dashboards, CSV export, Looker Studio, API and MCP integrations",
    hundred: "A client-ready report with stored answer evidence, five prioritized actions, and PDF and CSV exports",
  },
  {
    label: "Best for",
    peec: "Teams with ongoing budget who want daily trend lines and alerts",
    hundred: "Baselines, client deliverables, and proving movement without a subscription",
  },
] as const;

const faqs = [
  {
    question: "Is 100 Questions a full replacement for Peec AI?",
    answer:
      "Only if your job is point-in-time measurement. Peec AI is built for continuous daily monitoring of prompts you configure, with dashboards and integrations; 100 Questions is built for prepaid, evidence-linked audits you run when a decision or deliverable needs one. If you need daily trend lines and alerts, a monitoring tool fits better. If you need a defensible baseline, a client-ready report, or a before-and-after comparison without recurring cost, the benchmark fits better. Some teams use both.",
  },
  {
    question: "Why choose a prepaid audit over a monitoring subscription?",
    answer:
      "Three reasons: cost shape, evidence, and comparability. A prepaid credit is a fixed cost you can bill into a project instead of an ongoing line item. Every metric in a 100 Questions report links to stored answers and citations, which matters when a skeptical client or executive asks why a number is what it is. And because each run freezes its question set, a rerun is a genuine like-for-like comparison rather than a moving dashboard.",
  },
  {
    question: "Does 100 Questions track Perplexity?",
    answer:
      "No. 100 Questions benchmarks four providers—OpenAI, Claude, Gemini, and Grok—through their APIs with required web-search grounding. If Perplexity coverage is essential to you, a monitoring tool that includes it, like Peec AI, is the right complement.",
  },
  {
    question: "Can agencies run it per client?",
    answer:
      "Yes, that is the core agency workflow: buy a credit pack, run one benchmark per client subject, export the PDF and CSV, and rerun after your GEO work to show deltas at the next review. There are no seats or per-client subscriptions. See the agencies page for details.",
  },
] as const;

export default function PeecAiAlternativePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: "Peec AI Alternative for Prepaid AI Visibility Audits",
        description:
          "Comparing Peec AI's monitoring subscription with 100 Questions' prepaid benchmark: tracking model, providers, scoring, deliverables, and fit.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: SITE_UPDATED_AT,
        dateModified: SITE_UPDATED_AT,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": `${absoluteUrl()}#organization` },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        about: [
          "Peec AI alternative",
          "AI visibility tools",
          "AI search monitoring",
          "AI visibility audit",
        ],
        inLanguage: "en-US",
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faqs.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Peec AI alternative",
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
              <nav className="text-xs text-zinc-500" aria-label="Breadcrumb">
                <Link className="hover:text-zinc-200" href="/">
                  Home
                </Link>{" "}
                <span aria-hidden="true">/</span>{" "}
                <span className="text-zinc-300">Peec AI alternative</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                Comparison
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Looking at Peec AI? Decide monitoring vs. benchmarking first.
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                Peec AI and 100 Questions both measure brand visibility in AI
                answers, but they do different jobs. Peec AI is a monitoring
                subscription: prompts tracked daily, dashboards, trend lines.
                100 Questions is a prepaid benchmark: a frozen, evidence-linked
                audit you run when a baseline, a client report, or a
                before-and-after comparison actually matters.
              </p>
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section aria-labelledby="comparison-table-heading">
              <p className="eyebrow">Side by side</p>
              <h2
                id="comparison-table-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Two tools, two jobs
              </h2>
              <div className="mt-8 overflow-hidden rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <div className="grid grid-cols-[0.8fr_1.1fr_1.1fr] gap-px bg-white/[0.08] text-sm">
                  <div className="bg-[#0b0e0c] p-4 font-semibold text-zinc-400 sm:p-5">
                    &nbsp;
                  </div>
                  <div className="bg-[#0b0e0c] p-4 font-semibold text-white sm:p-5">
                    Peec AI
                  </div>
                  <div className="bg-[#0b0e0c] p-4 font-semibold text-emerald-300 sm:p-5">
                    100 Questions
                  </div>
                  {rows.map(({ label, peec, hundred }) => (
                    <div key={label} className="contents">
                      <div className="bg-[#0b0e0c] p-4 font-medium text-zinc-300 sm:p-5">
                        {label}
                      </div>
                      <div className="bg-[#0b0e0c] p-4 leading-6 text-zinc-400 sm:p-5">
                        {peec}
                      </div>
                      <div className="bg-[#0b0e0c] p-4 leading-6 text-zinc-300 sm:p-5">
                        {hundred}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-xs leading-5 text-zinc-500">
                Peec AI details summarized from peec.ai as of July 2026; plans
                and features change, so verify current specifics on their site.
                100 Questions details are documented on the{" "}
                <Link
                  className="text-emerald-300 hover:text-emerald-200"
                  href="/methodology"
                >
                  methodology page
                </Link>
                .
              </p>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                <p className="eyebrow">Choose Peec AI when</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
                  <li>
                    You have ongoing budget and an owner who reviews dashboards
                    weekly.
                  </li>
                  <li>
                    Daily trend data across many custom prompts drives your
                    decisions.
                  </li>
                  <li>Perplexity coverage is a requirement.</li>
                  <li>
                    You want Looker Studio, API, or MCP integrations feeding
                    internal reporting.
                  </li>
                </ul>
              </div>
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                <p className="eyebrow">Choose 100 Questions when</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
                  <li>
                    You need a defensible baseline before investing in GEO
                    work.
                  </li>
                  <li>
                    A client or executive needs a report with evidence, not a
                    dashboard login.
                  </li>
                  <li>
                    You want to prove before-and-after movement with an
                    identical rerun.
                  </li>
                  <li>
                    You want a fixed prepaid cost—$9 to start—instead of
                    another subscription.
                  </li>
                </ul>
              </div>
            </section>

            <section aria-labelledby="peec-faq-heading">
              <p className="eyebrow">Comparison questions</p>
              <h2
                id="peec-faq-heading"
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                Frequently asked questions
              </h2>
              <div className="mt-8 space-y-4">
                {faqs.map(({ question, answer }) => (
                  <details
                    key={question}
                    className="group rounded-[20px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <summary className="cursor-pointer list-none font-semibold text-white [&::-webkit-details-marker]:hidden">
                      {question}
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {answer}
                    </p>
                  </details>
                ))}
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                Agencies comparing options for client work should also see the{" "}
                <Link
                  className="text-emerald-300 hover:text-emerald-200"
                  href="/for-agencies"
                >
                  agencies page
                </Link>{" "}
                and the{" "}
                <Link
                  className="text-emerald-300 hover:text-emerald-200"
                  href="/sample-report"
                >
                  complete sample report
                </Link>
                .
              </p>
            </section>

            <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
              <CheckCircle2 className="size-6" aria-hidden="true" />
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                    No subscription required
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    Run one complete, evidence-linked audit for $9.
                  </h2>
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
