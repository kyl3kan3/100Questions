import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
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

const pageUrl = absoluteUrl("/ai-seo-tools");

export const metadata: Metadata = {
  title: "AI SEO Tools: Compare Monitoring, Benchmarks & SEO Suites",
  description:
    "Compare AI SEO tools by the job they do: prompt monitoring, fixed benchmarks, broad AI visibility research, enterprise workflows, and technical audits.",
  keywords: [
    "AI SEO tool",
    "AI SEO tools",
    "best AI SEO tools",
    "AI visibility tools",
    "GEO tools",
    "AEO tools",
    "LLM SEO tools",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI SEO Tools: Compare Monitoring, Benchmarks & SEO Suites",
    description:
      "A job-based comparison of AI SEO tools, with honest tradeoffs for monitoring, benchmarking, research, and enterprise workflows.",
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
    title: "AI SEO Tools: Compare the Right Measurement Model",
    description:
      "Choose an AI SEO tool by the decision you need to make, not the longest feature list.",
    images: [SOCIAL_IMAGE],
  },
};

const tools = [
  {
    name: "100 Questions",
    category: "Prepaid benchmark",
    measurement:
      "One frozen 25-question set across OpenAI, Claude, Gemini, and Grok, with required web grounding.",
    bestFor:
      "Point-in-time baselines, evidence-linked client reports, and identical before-and-after reruns.",
    consideration:
      "It is not continuous monitoring and does not track Perplexity.",
    source: absoluteUrl("/methodology"),
    sourceLabel: "100 Questions methodology",
  },
  {
    name: "Ahrefs Brand Radar",
    category: "Large-scale visibility research",
    measurement:
      "Search-backed prompt indexes plus custom prompt tracking across major AI platforms, with citations and share of voice.",
    bestFor:
      "Teams that want broad market discovery alongside established SEO, web, and content research workflows.",
    consideration:
      "Its breadth and recurring access model may exceed a one-off benchmark need.",
    source: "https://help.ahrefs.com/en/articles/11064852-what-is-brand-radar-and-how-to-use-it",
    sourceLabel: "Ahrefs Brand Radar documentation",
  },
  {
    name: "Semrush AI Visibility Toolkit",
    category: "SEO and AI visibility suite",
    measurement:
      "Visibility, competitor, prompt, sentiment, position-tracking, and AI-readiness reports connected to broader SEO tooling.",
    bestFor:
      "SEO teams that want traditional search and AI visibility workflows in one vendor ecosystem.",
    consideration:
      "Choose it for the combined workflow; smaller teams may not need the full toolkit surface.",
    source: "https://www.semrush.com/kb/1626-ai-visibility-features",
    sourceLabel: "Semrush AI visibility documentation",
  },
  {
    name: "Profound",
    category: "Enterprise AEO platform",
    measurement:
      "Answer Engine Insights combines visibility, citation, traffic, and content workflows across major answer engines.",
    bestFor:
      "Larger teams that need enterprise reporting and an integrated path from analysis to content operations.",
    consideration:
      "Confirm current platform scope, onboarding, and commercial terms directly with Profound.",
    source: "https://www.tryprofound.com/features",
    sourceLabel: "Profound platform overview",
  },
  {
    name: "Otterly.AI",
    category: "Daily prompt monitoring",
    measurement:
      "Tracks configured prompts for brand mentions and website citations across six AI search engines on a daily cadence.",
    bestFor:
      "Teams that want focused recurring prompt monitoring without adopting a broader SEO suite.",
    consideration:
      "Monitoring a chosen prompt set answers a different question from a newly generated category benchmark.",
    source: "https://help.otterly.ai/which-ai-searches-does-otterlyai-support",
    sourceLabel: "Otterly.AI platform coverage",
  },
  {
    name: "Peec AI",
    category: "AI visibility monitoring",
    measurement:
      "Tracks configured prompts, visibility, position, sentiment, and competitive movement over time.",
    bestFor:
      "Teams with an ongoing monitoring owner and recurring reporting or integration needs.",
    consideration:
      "A subscription dashboard and a prepaid evidence-linked audit solve different operating jobs.",
    source: "https://peec.ai/product/ai-visibility",
    sourceLabel: "Peec AI product overview",
  },
] as const;

const faqs = [
  {
    question: "What is an AI SEO tool?",
    answer:
      "An AI SEO tool measures or improves how a brand appears in AI-generated search and answer experiences. The category includes prompt monitors, large prompt databases, technical crawler audits, content optimization systems, and fixed evidence-linked benchmarks. Those products are not interchangeable, so the first step is deciding which measurement job you need.",
  },
  {
    question: "Which AI SEO tool is best?",
    answer:
      "There is no universal winner. Use continuous monitoring when daily or weekly trend lines matter, a broad SEO suite when AI visibility must sit beside keyword and backlink workflows, an enterprise platform when multiple teams need integrated operations, and a fixed benchmark when you need a defensible baseline or client-ready before-and-after evidence.",
  },
  {
    question: "What is the difference between AI monitoring and an AI visibility benchmark?",
    answer:
      "Monitoring repeatedly checks a configured prompt set and is useful for trends and alerts. A benchmark freezes the questions, model identifiers, scoring rules, and timestamp so the result can be reviewed as one comparable test. Monitoring favors continuity; benchmarking favors controlled comparison and a bounded deliverable.",
  },
  {
    question: "Can an AI SEO tool guarantee that ChatGPT or another model mentions my brand?",
    answer:
      "No. AI answers vary with the question, model, search results, location, freshness, and provider behavior. A credible tool should expose its sample, coverage, sources, and limitations rather than promise placement.",
  },
  {
    question: "Does 100 Questions replace Ahrefs, Semrush, Profound, Otterly, or Peec AI?",
    answer:
      "Not as a full platform replacement. 100 Questions is deliberately narrower: a prepaid, source-backed benchmark with a frozen question set and report exports. It can complement a monitoring or SEO suite when a team needs a controlled baseline, a client deliverable, or a repeatable implementation check.",
  },
] as const;

export default function AiSeoToolsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: "AI SEO Tools: Compare Monitoring, Benchmarks & SEO Suites",
        description:
          "A job-based comparison of AI SEO tools for prompt monitoring, fixed benchmarking, broad visibility research, and enterprise workflows.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: SITE_UPDATED_AT,
        dateModified: SITE_UPDATED_AT,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": `${absoluteUrl()}#organization` },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        about: ["AI SEO tools", "AI visibility tools", "AEO tools", "GEO tools"],
        inLanguage: "en-US",
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#tools`,
        name: "AI SEO tools by measurement model",
        itemListElement: tools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.name,
          url: tool.source,
        })),
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
            name: "AI SEO tools",
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
                <span className="text-zinc-300">AI SEO tools</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                Independent comparison
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                The best AI SEO tool depends on what you need to measure.
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                Some tools monitor the same prompts every day. Some search huge
                answer databases. Some combine AI visibility with a traditional
                SEO suite. 100 Questions runs a fixed, evidence-linked
                benchmark. Choose the measurement model before comparing
                feature counts.
              </p>
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section aria-labelledby="tool-comparison-heading">
              <p className="eyebrow">Side-by-side guide</p>
              <h2
                id="tool-comparison-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Six tools, four different jobs
              </h2>
              <div className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <table className="min-w-[960px] text-left text-sm">
                  <thead className="bg-[#0b0e0c] text-zinc-200">
                    <tr>
                      <th className="p-5 font-semibold">Tool</th>
                      <th className="p-5 font-semibold">Model</th>
                      <th className="p-5 font-semibold">Best fit</th>
                      <th className="p-5 font-semibold">Consideration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tools.map((tool) => (
                      <tr
                        className="border-t border-white/[0.07] bg-[#0b0e0c] align-top"
                        key={tool.name}
                      >
                        <th className="p-5 font-semibold text-white">
                          {tool.name}
                          <span className="mt-1 block font-normal text-emerald-300">
                            {tool.category}
                          </span>
                        </th>
                        <td className="max-w-xs p-5 leading-6 text-zinc-400">
                          {tool.measurement}
                        </td>
                        <td className="max-w-xs p-5 leading-6 text-zinc-300">
                          {tool.bestFor}
                        </td>
                        <td className="max-w-xs p-5 leading-6 text-zinc-400">
                          {tool.consideration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="tool-details-heading">
              <p className="eyebrow">What each one is for</p>
              <h2
                id="tool-details-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Match the tool to the decision
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {tools.map((tool) => (
                  <section
                    className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8"
                    key={tool.name}
                  >
                    <p className="eyebrow">{tool.category}</p>
                    <h3 className="mt-4 text-balance text-2xl font-semibold text-white">
                      {tool.name}
                    </h3>
                    <p className="mt-3 text-pretty text-sm leading-6 text-zinc-400">
                      {tool.measurement} {tool.bestFor}
                    </p>
                    <a
                      className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-emerald-300 hover:text-emerald-200"
                      href={tool.source}
                      target={tool.source.startsWith("http") && !tool.source.startsWith(absoluteUrl()) ? "_blank" : undefined}
                      rel={tool.source.startsWith("http") && !tool.source.startsWith(absoluteUrl()) ? "noopener noreferrer" : undefined}
                    >
                      Verify current details
                      <ExternalLink aria-hidden="true" className="size-4" />
                      <span className="sr-only"> at {tool.sourceLabel}</span>
                    </a>
                  </section>
                ))}
              </div>
              <p className="mt-5 max-w-3xl text-xs leading-5 text-zinc-500">
                Vendor facts were reviewed from the linked official product or
                help pages on July 24, 2026. Platforms change; verify current
                coverage and commercial terms before buying.
              </p>
              <p className="mt-5 max-w-3xl text-pretty text-sm leading-6 text-zinc-400">
                Need a narrower decision? Compare{" "}
                <Link
                  href="/answer-engine-optimization-tools"
                  className="text-emerald-300 hover:text-emerald-200"
                >
                  answer engine optimization tools
                </Link>{" "}
                for AEO-specific workflows or review the{" "}
                <Link
                  href="/chatgpt-seo-tool"
                  className="text-emerald-300 hover:text-emerald-200"
                >
                  ChatGPT SEO tool
                </Link>{" "}
                measurement model.
              </p>
            </section>

            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="eyebrow">Buying checklist</p>
                <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                  Ask these questions before the demo
                </h2>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  "Are prompts generated, selected from a database, or supplied by you?",
                  "Are answers captured through consumer interfaces, APIs, or another collection method?",
                  "Which providers, markets, and locales are actually included?",
                  "Can you inspect the answer and source evidence behind every metric?",
                  "How are failed, ungrounded, or missing answers handled?",
                  "Can you freeze a baseline and rerun the identical test later?",
                  "Is the deliverable a dashboard, an export, a report, or all three?",
                  "Does the pricing model fit a continuous program or a bounded project?",
                ].map((item) => (
                  <li
                    className="rounded-2xl bg-white/[0.025] p-5 text-pretty text-sm leading-6 text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                    key={item}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="ai-tools-faq-heading">
              <p className="eyebrow">AI SEO tool questions</p>
              <h2
                id="ai-tools-faq-heading"
                className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                Frequently asked questions
              </h2>
              <div className="mt-8 space-y-4">
                {faqs.map(({ question, answer }) => (
                  <details
                    key={question}
                    className="group rounded-[20px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <summary className="cursor-pointer list-none text-balance font-semibold text-white [&::-webkit-details-marker]:hidden">
                      {question}
                    </summary>
                    <p className="mt-3 text-pretty text-sm leading-6 text-zinc-400">
                      {answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
              <CheckCircle2 className="size-6" aria-hidden="true" />
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                    Need a fixed baseline?
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    Run one evidence-linked AI visibility benchmark for $9.
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
