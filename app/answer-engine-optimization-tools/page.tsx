import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Scale,
} from "lucide-react";
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

const pageUrl = absoluteUrl("/answer-engine-optimization-tools");

export const metadata: Metadata = {
  title: "Answer Engine Optimization Tools: 6 AEO Tools Compared",
  description:
    "Compare six answer engine optimization tools for AI visibility monitoring, fixed benchmarks, citations, enterprise workflows, and broader SEO research.",
  keywords: [
    "answer engine optimization tools",
    "AEO tools",
    "AEO tool",
    "best AEO tools",
    "AI answer optimization tools",
    "answer engine visibility software",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Answer Engine Optimization Tools: 6 AEO Tools Compared",
    description:
      "Choose an AEO tool by measurement model, evidence, cadence, and workflow rather than the longest feature list.",
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
    title: "Answer Engine Optimization Tools: 6 AEO Tools Compared",
    description:
      "A practical comparison of monitoring, benchmarking, research, and enterprise AEO workflows.",
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
        headline: "Answer Engine Optimization Tools: 6 AEO Tools Compared",
        description:
          "A job-based comparison of AEO tools for monitoring, fixed benchmarks, citation research, enterprise workflows, and broader SEO.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: SITE_UPDATED_AT,
        dateModified: SITE_UPDATED_AT,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": `${absoluteUrl()}#organization` },
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
              <p className="mt-5 max-w-3xl text-pretty text-xs leading-5 text-zinc-400">
                Reviewed July 24, 2026 from public product documentation. Verify
                current platform coverage and terms before purchasing.
              </p>
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section aria-labelledby="tools-heading">
              <p className="eyebrow">The comparison</p>
              <h2
                id="tools-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Match the tool to the decision
              </h2>
              <div className="mt-8 space-y-4">
                {tools.map((tool, index) => (
                  <article
                    key={tool.name}
                    className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-7"
                  >
                    <div className="grid gap-5 lg:grid-cols-[0.5fr_1fr_1fr]">
                      <div>
                        <span className="font-mono text-xs tabular-nums text-emerald-300">
                          {String(index + 1).padStart(2, "0")}
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
                  for access signals, and the{" "}
                  <Link
                    href="/ai-seo-tools"
                    className="text-emerald-300 underline underline-offset-4 decoration-emerald-300/40 hover:text-emerald-200 hover:decoration-emerald-200"
                  >
                    broader AI SEO tools comparison
                  </Link>{" "}
                  for adjacent SEO suites.
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
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-zinc-950 text-white hover:bg-zinc-800"
                >
                  <Link href="/auth/sign-up">
                    Run a $9 benchmark <ArrowRight />
                  </Link>
                </Button>
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
