import {
  CheckCircle2,
  ExternalLink,
  Scale,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AiVisibilityLinkCluster } from "@/components/ai-visibility-link-cluster";
import { ContentByline } from "@/components/content-byline";
import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingCheckoutButton } from "@/components/marketing-checkout-button";
import { Badge } from "@/components/ui/badge";
import { EDITORIAL_AUTHOR_ID } from "@/lib/editorial";
import {
  absoluteUrl,
  SITE_NAME,
  SOCIAL_IMAGE,
} from "@/lib/site";

const pageUrl = absoluteUrl("/answer-engine-optimization-tools");
const publishedAt = "2026-07-24T00:00:00.000Z";
const reviewedAt = "2026-08-13T00:00:00.000Z";

export const metadata: Metadata = {
  // Layout appends " · 100 Questions" (target ≤60 full).
  title: "Answer Engine Optimization Tools (2026)",
  description:
    "Compare six answer engine optimization tools by job, evidence, and cadence. See when a frozen benchmark beats a monitor, and when it does not.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Answer Engine Optimization Tools (2026) · 100 Questions",
    description:
      "Compare six answer engine optimization tools by job, evidence, and cadence. See when a frozen benchmark beats a monitor, and when it does not.",
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
    title: "Answer Engine Optimization Tools (2026) · 100 Questions",
    description:
      "Compare six answer engine optimization tools by job, evidence, and cadence. See when a frozen benchmark beats a monitor, and when it does not.",
    images: [SOCIAL_IMAGE],
  },
};

const tools = [
  {
    name: "100 Questions",
    category: "Fixed evidence-linked benchmark",
    bestFor:
      "Baselines, client deliverables, and identical before-and-after reruns without a subscription.",
    measurement:
      "One frozen 25-question set across OpenAI, Claude, Gemini, and Grok, with web grounding and stored answer evidence.",
    tradeoff:
      "Point-in-time benchmarking rather than continuous monitoring; Perplexity is not included.",
    source: absoluteUrl("/methodology"),
    sourceLabel: "Public methodology",
  },
  {
    name: "Ahrefs Brand Radar",
    category: "Large-scale visibility research",
    bestFor:
      "Teams combining AI visibility research with an established SEO and backlink workflow.",
    measurement:
      "Search-backed prompt indexes and custom prompt tracking with brand, citation, and share-of-voice analysis.",
    tradeoff:
      "Broad research depth can be more than a small team needs for a single controlled baseline.",
    source:
      "https://help.ahrefs.com/en/articles/11064852-what-is-brand-radar-and-how-to-use-it",
    sourceLabel: "Ahrefs documentation",
  },
  {
    name: "Semrush AI Visibility Toolkit",
    category: "Integrated SEO and AI visibility suite",
    bestFor:
      "Marketing teams that want AI answer research inside a wider SEO, content, and competitor platform.",
    measurement:
      "AI visibility, prompt research, competitor tracking, source analysis, and adjacent SEO workflows.",
    tradeoff:
      "The broader suite model differs from a frozen, evidence-linked benchmark.",
    source: "https://www.semrush.com/kb/1626-ai-visibility-features",
    sourceLabel: "Semrush documentation",
  },
  {
    name: "Profound",
    category: "Enterprise AI visibility platform",
    bestFor:
      "Larger organizations coordinating AI visibility research, content, and reporting across teams.",
    measurement:
      "Answer-engine insights, citation analysis, agent analytics, and enterprise workflow features.",
    tradeoff:
      "Designed for a broader enterprise program rather than a lightweight one-off audit.",
    source: "https://www.tryprofound.com/features",
    sourceLabel: "Profound features",
  },
  {
    name: "Otterly.AI",
    category: "Focused prompt monitoring",
    bestFor:
      "Teams that want a straightforward recurring view of brand mentions and citations across selected AI searches.",
    measurement:
      "Scheduled AI search monitoring across supported platforms with visibility and citation tracking.",
    tradeoff:
      "Monitoring a changing prompt program answers a different question than repeating one frozen benchmark.",
    source:
      "https://help.otterly.ai/which-ai-searches-does-otterlyai-support",
    sourceLabel: "Otterly documentation",
  },
  {
    name: "Peec AI",
    category: "AI search analytics and monitoring",
    bestFor:
      "Growth and marketing teams that want recurring prompt, source, and competitor visibility reporting.",
    measurement:
      "Brand visibility, position, sentiment, source, and competitor analysis across AI answer platforms.",
    tradeoff:
      "A subscription monitoring workflow may be unnecessary for an occasional baseline or client audit.",
    source: "https://peec.ai/product/ai-visibility",
    sourceLabel: "Peec AI product page",
  },
] as const;

const comparisonRows = [
  {
    name: "100 Questions",
    workflow: "Frozen evidence-linked benchmark",
    cadence: "Point-in-time baseline and like-for-like rerun",
    evidence: "Stored answers, source URLs, coverage, PDF, and CSV exports",
  },
  {
    name: "Ahrefs Brand Radar",
    workflow: "Large-scale AI visibility research inside an SEO suite",
    cadence: "Index research plus configurable prompt tracking",
    evidence: "Brand, citation, source, and share-of-voice analysis",
  },
  {
    name: "Semrush AI Visibility Toolkit",
    workflow: "AI visibility research connected to wider SEO workflows",
    cadence: "Recurring research and monitoring",
    evidence: "Prompt, competitor, source, and visibility analysis",
  },
  {
    name: "Profound",
    workflow: "Enterprise answer-engine analytics and operations",
    cadence: "Ongoing multi-team program",
    evidence: "Citation, answer-engine, content, and agent analytics",
  },
  {
    name: "Otterly.AI",
    workflow: "Focused scheduled AI search monitoring",
    cadence: "Recurring prompt checks",
    evidence: "Visibility, citation, and supported-platform tracking",
  },
  {
    name: "Peec AI",
    workflow: "AI search analytics and brand monitoring",
    cadence: "Recurring prompt and source analysis",
    evidence: "Visibility, position, sentiment, sources, and competitors",
  },
] as const;

const selectionCriteria = [
  "The product has a current first-party page documenting an AI visibility, answer-engine, citation, or prompt-measurement workflow.",
  "Its measurement model represents a distinct buying job: fixed benchmarking, recurring monitoring, broad research, integrated SEO, or enterprise operations.",
  "The comparison can describe a concrete best fit and limitation without relying on affiliate commissions, undisclosed access, or invented scores.",
] as const;

const buyingQuestions = [
  [
    "Do we need a snapshot or a trend?",
    "Use a frozen benchmark for a defensible baseline. Use monitoring when weekly or monthly movement is the decision.",
  ],
  [
    "Can we inspect the evidence?",
    "Require access to the answer, prompt, provider, timestamp, cited URLs, and exclusion reason behind each metric.",
  ],
  [
    "Are prompts stable enough to compare?",
    "A changing prompt panel helps discovery research; a frozen set is stronger for before-and-after claims.",
  ],
  [
    "Which providers matter?",
    "Confirm the product covers the assistants your buyers use and disclose whether results come from APIs, consumer interfaces, or search indexes.",
  ],
  [
    "Does the tool include technical SEO?",
    "AI answer measurement does not replace crawl, indexation, internal linking, schema, or backlink analysis.",
  ],
  [
    "What happens after the score?",
    "Prefer tools that expose missed questions, recurring sources, competitors, and page-level actions instead of one opaque number.",
  ],
] as const;

const faqs = [
  {
    question: "What are the best AEO tools in 2026?",
    answer:
      "The best AEO tool depends on the workflow: 100 Questions for a fixed evidence-linked benchmark, Ahrefs Brand Radar for large-scale visibility research, Semrush for combined SEO and AI visibility work, Profound for enterprise answer-engine operations, Otterly.AI for daily prompt monitoring, and Peec AI for ongoing visibility tracking. Compare the measurement model and evidence access before feature counts.",
  },
  {
    question: "What is an answer engine optimization tool?",
    answer:
      "An answer engine optimization tool helps a team understand or improve how its brand and content appear in AI-generated answers. Different tools handle different jobs: technical SEO, prompt monitoring, citation research, content workflows, or controlled visibility benchmarks.",
  },
  {
    question: "What should an AEO tool measure?",
    answer:
      "At minimum, useful answer-level measurement should separate brand mentions, prominence, competitor share of voice, citations, sentiment, and provider coverage. The underlying questions, answers, sources, timestamps, and exclusions should remain inspectable.",
  },
  {
    question: "Is an AEO tool different from an AI SEO tool?",
    answer:
      "The categories overlap. AEO tools focus on inclusion and citation inside generated answers. AI SEO tools may also cover technical audits, keyword research, content optimization, backlinks, and conventional search performance.",
  },
  {
    question: "Can AEO software guarantee citations in AI answers?",
    answer:
      "No. Tools can reveal access problems, content gaps, recurring sources, and visibility changes, but providers control retrieval and answer composition. Any guaranteed placement claim should be treated skeptically.",
  },
  {
    question: "Should a small team buy continuous AEO monitoring?",
    answer:
      "Only if it will act on frequent trend data. A fixed benchmark can be more economical for a baseline, a client report, or an occasional rerun; recurring monitoring is more useful when a team owns an ongoing AI-search program.",
  },
] as const;

export default function AnswerEngineOptimizationToolsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: "Answer Engine Optimization Tools (2026)",
        description:
          "Compare six answer engine optimization tools by job, evidence, and cadence. See when a frozen benchmark beats a monitor, and when it does not.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: publishedAt,
        dateModified: reviewedAt,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": EDITORIAL_AUTHOR_ID },
        reviewedBy: { "@id": EDITORIAL_AUTHOR_ID },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        inLanguage: "en-US",
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#tools`,
        name: "Answer engine optimization tools",
        numberOfItems: tools.length,
        itemListElement: tools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.name,
          url: tool.source,
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
            name: "Answer engine optimization tools",
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
                <span className="text-zinc-300">
                  Answer engine optimization tools
                </span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                AEO tools comparison
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Six answer engine optimization tools, compared by the job they
                actually do
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                AEO software spans technical SEO, prompt monitoring, citation
                research, enterprise workflows, and controlled benchmarks.
                Choose the measurement model before comparing feature lists.
              </p>
              <ContentByline
                publishedAt={publishedAt}
                publishedLabel="July 24, 2026"
                modifiedAt={reviewedAt}
                modifiedLabel="August 13, 2026"
                note="First-party documentation review"
              />
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section
              className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start"
              aria-labelledby="comparison-method-heading"
            >
              <div>
                <p className="eyebrow">How this comparison was produced</p>
                <h2
                  id="comparison-method-heading"
                  className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
                >
                  Documentation review, not a fabricated hands-on ranking
                </h2>
              </div>
              <div className="space-y-5 text-pretty text-sm leading-6 text-zinc-400">
                <p>
                  100 Questions publishes this page and has direct product
                  evidence only for its own benchmark. Competitor descriptions
                  below come from the linked first-party product and help pages,
                  checked on August 10, 2026. No vendor paid for inclusion, and
                  the order is not a best-to-worst ranking.
                </p>
                <ul className="space-y-3">
                  {selectionCriteria.map((criterion) => (
                    <li className="flex gap-3" key={criterion}>
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-emerald-300"
                        aria-hidden="true"
                      />
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section aria-labelledby="matrix-heading">
              <p className="eyebrow">At-a-glance matrix</p>
              <h2
                id="matrix-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Compare workflow before comparing features
              </h2>
              <p className="mt-4 max-w-3xl text-pretty leading-7 text-zinc-400">
                These categories summarize the documented measurement model.
                Confirm current provider coverage, limits, pricing, and evidence
                access directly with each vendor before purchasing.
              </p>
              <div className="mt-8 overflow-x-auto rounded-[22px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                  <thead className="bg-white/[0.045] text-xs uppercase tracking-[0.1em] text-zinc-400">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Tool</th>
                      <th className="px-5 py-4 font-semibold">Primary workflow</th>
                      <th className="px-5 py-4 font-semibold">Cadence</th>
                      <th className="px-5 py-4 font-semibold">Documented evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.07] bg-[#0b0e0c] text-zinc-300">
                    {comparisonRows.map((row) => (
                      <tr key={row.name}>
                        <th className="px-5 py-5 font-semibold text-white">
                          {row.name}
                        </th>
                        <td className="px-5 py-5 leading-6">{row.workflow}</td>
                        <td className="px-5 py-5 leading-6 text-zinc-400">
                          {row.cadence}
                        </td>
                        <td className="px-5 py-5 leading-6 text-zinc-400">
                          {row.evidence}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="tools-heading">
              <p className="eyebrow">The comparison</p>
              <h2
                id="tools-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Match the tool to the decision
              </h2>
              <div className="mt-8 space-y-4">
                {tools.map((tool) => (
                  <article
                    key={tool.name}
                    className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-7"
                  >
                    <div className="grid gap-5 lg:grid-cols-[0.5fr_1fr_1fr]">
                      <div>
                        <span className="font-mono text-xs uppercase tracking-[0.1em] text-emerald-300">
                          Documented workflow
                        </span>
                        <h3 className="mt-3 text-xl font-semibold text-white">
                          {tool.name}
                        </h3>
                        <p className="mt-2 text-xs uppercase tracking-[0.11em] text-zinc-400">
                          {tool.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.11em] text-zinc-400">
                          Best for
                        </p>
                        <p className="mt-2 text-pretty text-sm leading-6 text-zinc-300">
                          {tool.bestFor}
                        </p>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.11em] text-zinc-400">
                          Measurement
                        </p>
                        <p className="mt-2 text-pretty text-sm leading-6 text-zinc-400">
                          {tool.measurement}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.11em] text-zinc-400">
                          Tradeoff to verify
                        </p>
                        <p className="mt-2 text-pretty text-sm leading-6 text-zinc-400">
                          {tool.tradeoff}
                        </p>
                        <a
                          href={tool.source}
                          target={
                            tool.source.startsWith("http") &&
                            !tool.source.startsWith(absoluteUrl())
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            tool.source.startsWith("http") &&
                            !tool.source.startsWith(absoluteUrl())
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="mt-4 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                        >
                          {tool.sourceLabel}
                          <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section
              className="grid gap-8 rounded-[28px] bg-white/[0.025] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
              aria-labelledby="owned-evidence-heading"
            >
              <div className="overflow-hidden rounded-[18px] bg-[#101411] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <Image
                  src="/sample-report-preview.png"
                  alt="100 Questions sample report showing AI visibility, source evidence, competitor findings, and prioritized actions"
                  width={1440}
                  height={900}
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="h-auto w-full"
                />
              </div>
              <div>
                <p className="eyebrow">First-hand evidence boundary</p>
                <h2
                  id="owned-evidence-heading"
                  className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
                >
                  Inspect our output; verify every competitor at its source
                </h2>
                <p className="mt-4 text-pretty leading-7 text-zinc-400">
                  The public sample shows the report format 100 Questions can
                  substantiate directly. For the other five tools, this page
                  links to vendor documentation and deliberately avoids
                  unsupported performance scores or claims of hands-on access.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
                  <Link
                    className="text-emerald-300 hover:text-emerald-200"
                    href="/sample-report"
                  >
                    Open the sample report
                  </Link>
                  <Link
                    className="text-emerald-300 hover:text-emerald-200"
                    href="/methodology"
                  >
                    Review the methodology
                  </Link>
                </div>
              </div>
            </section>

            <section aria-labelledby="buying-heading">
              <p className="eyebrow">Buying checklist</p>
              <h2
                id="buying-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Six questions to ask before buying an AEO tool
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {buyingQuestions.map(([question, answer]) => (
                  <article
                    key={question}
                    className="rounded-[20px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <h3 className="text-balance font-semibold text-white">
                      {question}
                    </h3>
                    <p className="mt-3 text-pretty text-sm leading-6 text-zinc-400">
                      {answer}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">Tools are only the measurement layer</p>
                <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                  AEO still depends on crawlability, answers, evidence, and
                  authority
                </h2>
              </div>
              <div className="space-y-5 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  Software can reveal where a brand is absent, which competitors
                  appear, and which sources recur. It cannot substitute for
                  technically accessible pages, direct answers to buyer
                  questions, consistent entity facts, original evidence, and
                  trustworthy third-party corroboration.
                </p>
                <p>
                  Use the{" "}
                  <Link
                    href="/answer-engine-optimization"
                    className="text-emerald-300 underline underline-offset-4 decoration-emerald-300/40 hover:text-emerald-200 hover:decoration-emerald-200"
                  >
                    AEO implementation guide
                  </Link>{" "}
                  for the work itself, the{" "}
                  <Link
                    href="/ai-visibility-checker"
                    className="text-emerald-300 underline underline-offset-4 decoration-emerald-300/40 hover:text-emerald-200 hover:decoration-emerald-200"
                  >
                    free technical checker
                  </Link>{" "}
                  for access signals, the{" "}
                  <Link
                    href="/ai-visibility-tools"
                    className="text-emerald-300 underline underline-offset-4 decoration-emerald-300/40 hover:text-emerald-200 hover:decoration-emerald-200"
                  >
                    AI visibility tools hub
                  </Link>{" "}
                  for the full tool map, and the{" "}
                  <Link
                    href="/ai-seo-tools"
                    className="text-emerald-300 underline underline-offset-4 decoration-emerald-300/40 hover:text-emerald-200 hover:decoration-emerald-200"
                  >
                    best AI visibility tools comparison
                  </Link>{" "}
                  for adjacent SEO suites, or the focused guide to the{" "}
                  <Link
                    href="/peec-ai-alternative"
                    className="text-emerald-300 underline underline-offset-4 decoration-emerald-300/40 hover:text-emerald-200 hover:decoration-emerald-200"
                  >
                    best Peec AI alternatives
                  </Link>
                  .
                </p>
              </div>
            </section>

            <section aria-labelledby="aeo-tools-faq-heading">
              <p className="eyebrow">Selection questions</p>
              <h2
                id="aeo-tools-faq-heading"
                className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                Answer engine optimization tools FAQ
              </h2>
              <div className="mt-8 space-y-4">
                {faqs.map(({ question, answer }) => (
                  <details
                    key={question}
                    className="group rounded-[20px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <summary className="min-h-10 cursor-pointer list-none font-semibold text-white [&::-webkit-details-marker]:hidden">
                      {question}
                    </summary>
                    <p className="mt-3 text-pretty text-sm leading-6 text-zinc-400">
                      {answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <AiVisibilityLinkCluster currentPath="/answer-engine-optimization-tools" />

            <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
              <Scale className="size-6" aria-hidden="true" />
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                    Need a controlled baseline?
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    Freeze the questions and keep the evidence.
                  </h2>
                </div>
                <MarketingCheckoutButton
                  label="Run a $9 benchmark"
                  variant="secondary"
                  size="lg"
                  buttonClassName="bg-zinc-950 text-white hover:bg-zinc-800"
                />
              </div>
            </section>

            <p className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="size-4 text-emerald-300" />
              Product coverage changes. Review each linked first-party source
              before making a purchase decision.
            </p>
          </div>
        </article>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
