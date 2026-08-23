import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Database,
  Download,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EDITORIAL_AUTHOR_ID } from "@/lib/editorial";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import results from "@/public/data/ai-visibility-index-2026-results.json";

const pageUrl = absoluteUrl("/ai-visibility-index");
const INDEX_DATE = {
  iso: "2026-07-30",
  label: "July 30, 2026",
} as const;
const PAGE_UPDATED_AT = "2026-08-15";

const questionSetUrl = absoluteUrl(
  "/data/ai-visibility-index-2026-question-set.csv",
);
const dataDictionaryUrl = absoluteUrl(
  "/data/ai-visibility-index-2026-data-dictionary.csv",
);
const cohortUrl = absoluteUrl("/data/ai-visibility-index-2026-cohort.csv");
const protocolUrl = absoluteUrl("/data/ai-visibility-index-2026-protocol.json");
const brandResultsUrl = absoluteUrl(
  "/data/ai-visibility-index-2026-brand-results.csv",
);
const providerResultsUrl = absoluteUrl(
  "/data/ai-visibility-index-2026-provider-results.csv",
);
const sourceResultsUrl = absoluteUrl(
  "/data/ai-visibility-index-2026-source-results.csv",
);
const answerEvidenceUrl = absoluteUrl(
  "/data/ai-visibility-index-2026-answer-evidence.csv",
);
const resultManifestUrl = absoluteUrl(
  "/data/ai-visibility-index-2026-results-manifest.json",
);
const adjudicationsUrl = absoluteUrl(
  "/data/ai-visibility-index-2026-match-adjudications.csv",
);

export const metadata: Metadata = {
  title: "2026 AI Visibility Index: AI SEO Software",
  description:
    "Peec AI led the 25-product 2026 AI Visibility Index. Explore 80 grounded answers, four-provider results, cited sources, methodology, and downloadable data.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "2026 AI Visibility Index",
    description:
      "Peec AI led a frozen 25-product study across 80 grounded answers. Explore the rankings, provider splits, sources, and open data.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "article",
    locale: "en_US",
    publishedTime: INDEX_DATE.iso,
    modifiedTime: PAGE_UPDATED_AT,
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 AI Visibility Index",
    description:
      "A preregistered comparison of 25 AI visibility software brands across OpenAI, Anthropic, Google, and xAI.",
  },
};

const studyFacts = [
  {
    value: "100%",
    label: "Provider coverage",
    detail: "All 80 planned answers were grounded and score-eligible.",
  },
  {
    value: "25",
    label: "Frozen cohort brands",
    detail: "Products with a public first-party AI visibility offering.",
  },
  {
    value: "20",
    label: "Frozen discovery questions",
    detail: "Neutral category and buyer questions used for ranking.",
  },
  {
    value: "80",
    label: "Grounded discovery answers",
    detail: "Twenty shared questions across four frozen provider models.",
  },
] as const;

const visibleRankings = results.rankings.filter(
  (result) => result.mentionCount > 0,
);
const maximumVisibility = Math.max(
  ...visibleRankings.map((result) => result.discoveryVisibility),
);
const providerLabels = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  xai: "xAI",
} as const;
const providerLeaders = Object.entries(providerLabels).map(
  ([provider, label]) => {
    const rows = results.providerResults.filter(
      (result) => result.provider === provider && result.mention_count > 0,
    );
    const bestRank = Math.min(...rows.map((result) => result.rank));
    return {
      provider,
      label,
      brands: rows
        .filter((result) => result.rank === bestRank)
        .map((result) => result.brand),
      mentions: Math.max(
        ...rows
          .filter((result) => result.rank === bestRank)
          .map((result) => result.mention_count),
      ),
    };
  },
);

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(value > 0 && value < 0.1 ? 1 : 0)}%`;
}

const previewQuestions = [
  "What are the best tools for measuring whether a brand appears in AI-generated answers?",
  "Which tools track brand mentions across ChatGPT, Claude, Gemini, and Grok?",
  "How can a company measure its share of voice in AI search?",
  "What software shows which sources AI assistants cite about a brand?",
  "Which AI visibility tools use repeatable or frozen question sets?",
] as const;

const metrics = [
  {
    name: "Discovery visibility",
    definition:
      "Eligible discovery answers mentioning a cohort brand divided by eligible discovery answers.",
  },
  {
    name: "Prominence",
    definition:
      "Mean placement score when a brand is lead, shortlisted, incidental, or absent.",
  },
  {
    name: "Provider coverage",
    definition:
      "Eligible web-grounded answers divided by planned answers, reported beside every result.",
  },
  {
    name: "Citation presence",
    definition:
      "Eligible answers citing a cohort brand's claimed domain, kept separate from mentions.",
  },
  {
    name: "Source frequency",
    definition:
      "The domains cited most often across eligible answers, with repeat citations counted transparently.",
  },
] as const;

const datasetFileGuide = [
  {
    name: "Cited-source results",
    filename: "ai-visibility-index-2026-source-results.csv",
    format: "CSV",
    href: "/data/ai-visibility-index-2026-source-results.csv",
    description:
      "Ranks the 210 domains cited across eligible answers and reports each domain's cited-answer count and share.",
  },
  {
    name: "Frozen question set",
    filename: "ai-visibility-index-2026-question-set.csv",
    format: "CSV",
    href: "/data/ai-visibility-index-2026-question-set.csv",
    description:
      "Contains the 20 neutral discovery questions used for ranking and five diagnostic templates, with IDs, cohort labels, ranking flags, and notes.",
  },
  {
    name: "Provider-level results",
    filename: "ai-visibility-index-2026-provider-results.csv",
    format: "CSV",
    href: "/data/ai-visibility-index-2026-provider-results.csv",
    description:
      "Breaks out brand results for OpenAI, Anthropic, Google, and xAI, including model IDs, ranks, eligible answers, visibility, prominence, and citation metrics.",
  },
  {
    name: "Registered study protocol",
    filename: "ai-visibility-index-2026-protocol.json",
    format: "JSON",
    href: "/data/ai-visibility-index-2026-protocol.json",
    description:
      "Records the frozen inputs and hashes, collection setup and model IDs, eligibility and matching rules, metric definitions, and study limitations.",
  },
  {
    name: "Metric data dictionary",
    filename: "ai-visibility-index-2026-data-dictionary.csv",
    format: "CSV",
    href: "/data/ai-visibility-index-2026-data-dictionary.csv",
    description:
      "Defines the 17 public-release fields, their data types, and the denominator or allowed values needed to interpret the tables consistently.",
  },
] as const;

const faq = [
  {
    question: "What is the 2026 AI Visibility Index?",
    answer:
      "It is a public study of which AI visibility, AEO, GEO, and LLM SEO software brands appear in web-grounded answers to a frozen set of buyer questions. The protocol is published before collection so the questions and headline metrics cannot be changed to fit the results.",
  },
  {
    question: "Does this page contain rankings yet?",
    answer:
      "Yes. The results include all 25 cohort products, provider-level splits, cited-domain frequency, and answer-level evidence. Seven cohort brands appeared at least once across the 80 eligible discovery answers.",
  },
  {
    question: "Which AI providers did the study test?",
    answer:
      "The study tested OpenAI, Anthropic, Google, and xAI through their APIs with required web-search grounding. The exact model identifiers, collection timestamps, and result-file hashes are included in the downloadable manifest.",
  },
  {
    question: "Will the Index represent every consumer AI session?",
    answer:
      "No. API responses can differ from consumer chat products because prompts, routing, personalization, models, and search behavior can differ. The Index is a time-stamped directional comparison of one controlled test.",
  },
] as const;

export default function AiVisibilityIndexPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Report",
        "@id": `${pageUrl}#report`,
        name: "2026 AI Visibility Index",
        headline: "2026 AI Visibility Index: AI SEO Software Results",
        description:
          "Results for a preregistered public study of 25 AI visibility software brands across 80 web-grounded answers from four providers.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: INDEX_DATE.iso,
        dateModified: PAGE_UPDATED_AT,
        author: { "@id": EDITORIAL_AUTHOR_ID },
        reviewedBy: { "@id": EDITORIAL_AUTHOR_ID },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        inLanguage: "en-US",
        about: [
          "AI visibility",
          "Answer engine optimization",
          "Generative engine optimization",
          "LLM SEO software",
        ],
      },
      {
        "@type": "Dataset",
        "@id": `${pageUrl}#protocol-dataset`,
        name: "2026 AI Visibility Index dataset",
        description:
          "Brand rankings, provider splits, cited-source frequency, answer-level evidence, frozen inputs, and adjudications for the 2026 AI Visibility Index.",
        url: pageUrl,
        datePublished: INDEX_DATE.iso,
        dateModified: results.publishedAt,
        creator: { "@id": `${absoluteUrl()}#organization` },
        isAccessibleForFree: true,
        inLanguage: "en-US",
        measurementTechnique:
          "A frozen question set with required web-search grounding across OpenAI, Anthropic, Google, and xAI APIs.",
        temporalCoverage: `${results.collectionStartedAt}/${results.collectionCompletedAt}`,
        variableMeasured: metrics.map(({ name, definition }) => ({
          "@type": "PropertyValue",
          name,
          description: definition,
        })),
        distribution: [
          {
            "@type": "DataDownload",
            name: "Frozen product cohort",
            encodingFormat: "text/csv",
            contentUrl: cohortUrl,
          },
          {
            "@type": "DataDownload",
            name: "Frozen question set",
            description:
              "Twenty neutral discovery questions used for ranking and five diagnostic templates, with identifiers, cohort labels, ranking flags, and notes.",
            encodingFormat: "text/csv",
            contentUrl: questionSetUrl,
          },
          {
            "@type": "DataDownload",
            name: "Metric data dictionary",
            description:
              "Definitions, data types, denominators, and allowed values for the 17 fields used across the public release.",
            encodingFormat: "text/csv",
            contentUrl: dataDictionaryUrl,
          },
          {
            "@type": "DataDownload",
            name: "Registered study protocol",
            description:
              "The frozen inputs and hashes, collection configuration, model identifiers, eligibility and matching rules, metrics, and limitations.",
            encodingFormat: "application/json",
            contentUrl: protocolUrl,
          },
          {
            "@type": "DataDownload",
            name: "Brand results",
            encodingFormat: "text/csv",
            contentUrl: brandResultsUrl,
          },
          {
            "@type": "DataDownload",
            name: "Provider results",
            description:
              "Provider-by-brand ranks, eligible-answer counts, visibility, prominence, and citation metrics for OpenAI, Anthropic, Google, and xAI.",
            encodingFormat: "text/csv",
            contentUrl: providerResultsUrl,
          },
          {
            "@type": "DataDownload",
            name: "Cited-source results",
            description:
              "Cited domains ranked by the number and share of eligible answers in which each domain appeared.",
            encodingFormat: "text/csv",
            contentUrl: sourceResultsUrl,
          },
          {
            "@type": "DataDownload",
            name: "Answer-level evidence",
            encodingFormat: "text/csv",
            contentUrl: answerEvidenceUrl,
          },
          {
            "@type": "DataDownload",
            name: "Results manifest and file hashes",
            encodingFormat: "application/json",
            contentUrl: resultManifestUrl,
          },
          {
            "@type": "DataDownload",
            name: "Brand-match adjudications",
            encodingFormat: "text/csv",
            contentUrl: adjudicationsUrl,
          },
        ],
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
            name: "Resources",
            item: absoluteUrl("/resources"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "2026 AI Visibility Index",
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
        <header className="relative overflow-hidden border-b border-white/[0.07]">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle at 82% 16%, rgba(110,231,183,0.13), transparent 31%), radial-gradient(circle at 18% 90%, rgba(56,189,248,0.07), transparent 28%)",
            }}
          />
          <div className="page-shell relative py-16 sm:py-20 lg:py-28">
            <nav className="text-xs text-zinc-400" aria-label="Breadcrumb">
              <Link className="hover:text-zinc-200" href="/">
                Home
              </Link>{" "}
              <span aria-hidden="true">/</span>{" "}
              <Link className="hover:text-zinc-200" href="/resources">
                Resources
              </Link>{" "}
              <span aria-hidden="true">/</span>{" "}
              <span className="text-zinc-300">AI Visibility Index</span>
            </nav>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="border-emerald-300/25 text-emerald-200"
              >
                2026 public dataset
              </Badge>
              <span className="rounded-full bg-emerald-300/[0.08] px-3 py-1 text-xs text-emerald-200 shadow-[inset_0_0_0_1px_rgba(110,231,183,0.16)]">
                Results published
              </span>
            </div>
            <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl lg:text-7xl">
              The 2026 AI Visibility Index
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400 sm:text-xl">
              A transparent study of which AI visibility software brands appear
              in web-grounded answers—and which sources the models cite. Peec
              AI led the frozen cohort; seven of 25 products appeared at least
              once.
            </p>
            <p className="mt-5 flex items-center gap-2 text-sm text-zinc-400">
              <CalendarDays className="size-4 text-emerald-300" aria-hidden="true" />
              Registered and collected{" "}
              <time dateTime={INDEX_DATE.iso}>{INDEX_DATE.label}</time>
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="/data/ai-visibility-index-2026-brand-results.csv" download>
                  Download the results <Download aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#results">
                  Explore the findings <ArrowRight aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </header>

        <section
          className="page-shell py-12 sm:py-16"
          aria-labelledby="study-status-heading"
        >
          <h2 id="study-status-heading" className="sr-only">
            Study status
          </h2>
          <div className="grid gap-px overflow-hidden rounded-[24px] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
            {studyFacts.map(({ value, label, detail }) => (
              <div key={label} className="bg-[#0b0e0c] p-6">
                <p className="font-mono text-2xl font-semibold tracking-[-0.04em] text-emerald-300">
                  {value}
                </p>
                <p className="mt-2 font-medium text-zinc-100">{label}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="page-shell space-y-20 pb-20 pt-6 lg:pb-28">
          <section id="results" className="scroll-mt-8" aria-labelledby="results-heading">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="eyebrow">Headline results · 100% coverage</p>
                <h2
                  id="results-heading"
                  className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
                >
                  Peec AI led a fragmented field
                </h2>
              </div>
              <div className="space-y-5 text-pretty leading-7 text-zinc-400">
                <p>
                  Peec AI appeared in 6 of 80 eligible answers, producing 7.5%
                  discovery visibility. Semrush, Otterly.AI, and Profound each
                  appeared five times. No cohort product appeared in more than
                  one in thirteen answers.
                </p>
                <p>
                  Only seven of the 25 frozen products were mentioned at all.
                  The result is a directional snapshot of this question set and
                  collection window, not a permanent category ranking.
                </p>
              </div>
            </div>

            <div className="mt-9 overflow-hidden rounded-[24px] bg-[#0b0e0c] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <div className="grid grid-cols-[3rem_minmax(9rem,1fr)_5rem_5rem] gap-3 border-b border-white/[0.08] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-zinc-400 sm:grid-cols-[3rem_minmax(12rem,1fr)_7rem_7rem]">
                <span>Rank</span>
                <span>Brand</span>
                <span className="text-right">Visibility</span>
                <span className="text-right">Mentions</span>
              </div>
              {visibleRankings.map((result) => (
                <div
                  key={result.brand}
                  className="grid grid-cols-[3rem_minmax(9rem,1fr)_5rem_5rem] items-center gap-3 border-b border-white/[0.06] px-5 py-4 last:border-0 sm:grid-cols-[3rem_minmax(12rem,1fr)_7rem_7rem]"
                >
                  <span className="font-mono text-sm text-emerald-300">
                    {String(result.rank).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-100">
                      {result.brand}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-emerald-300"
                        style={{
                          width: `${(result.discoveryVisibility / maximumVisibility) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-right font-mono text-sm text-zinc-300">
                    {formatPercent(result.discoveryVisibility)}
                  </span>
                  <span className="text-right font-mono text-sm text-zinc-400">
                    {result.mentionCount}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-zinc-400">
              The complete CSV includes all 25 cohort products, prominence,
              claimed-domain citations, and zero-mention rows.
            </p>
          </section>

          <section aria-labelledby="provider-findings-heading">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Provider differences</p>
                <h2
                  id="provider-findings-heading"
                  className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
                >
                  The leader changed by model
                </h2>
              </div>
              <BarChart3
                className="hidden size-8 text-emerald-300 sm:block"
                aria-hidden="true"
              />
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {providerLeaders.map(({ provider, label, brands, mentions }) => (
                <article
                  key={provider}
                  className="rounded-[22px] bg-[#0b0e0c] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-emerald-300">
                    {label}
                  </p>
                  <h3 className="mt-4 font-semibold text-white">
                    {brands.join(" + ")}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    {mentions} mention{mentions === 1 ? "" : "s"} in 20 answers
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="source-findings-heading">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="eyebrow">Cited-source analysis</p>
                <h2
                  id="source-findings-heading"
                  className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
                >
                  The answers drew from 210 domains
                </h2>
                <p className="mt-5 text-sm leading-6 text-zinc-400">
                  The leading cited domains were mostly specialist AI visibility
                  sites rather than the largest SEO publishers. A domain is
                  counted at most once per answer.
                </p>
              </div>
              <ol className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {results.topSources.slice(0, 8).map((source) => (
                  <li
                    key={source.domain}
                    className="grid grid-cols-[2rem_1fr_auto] gap-4 py-4 text-sm"
                  >
                    <span className="font-mono text-xs text-emerald-300">
                      {String(source.rank).padStart(2, "0")}
                    </span>
                    <span className="text-zinc-300">{source.domain}</span>
                    <span className="font-mono text-zinc-400">
                      {source.cited_answer_count} answers
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section
            aria-labelledby="why-register-heading"
            className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]"
          >
            <div>
              <p className="eyebrow">Why register it first</p>
              <h2
                id="why-register-heading"
                className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                The method should not move after the answers arrive
              </h2>
            </div>
            <div className="space-y-5 text-pretty leading-7 text-zinc-400">
              <p>
                AI answers vary by provider, model, search result, and time.
                Publishing the protocol first creates an auditable record of
                what will be asked, what counts as an eligible answer, and how
                each metric will be calculated.
              </p>
              <p>
                The published results keep answer coverage beside every
                headline number. Four exact-string collisions found during
                manual review were excluded with their question, provider, and
                rationale preserved in the adjudication file.
              </p>
            </div>
          </section>

          <section id="method" className="scroll-mt-8" aria-labelledby="method-heading">
            <div className="max-w-3xl">
              <p className="eyebrow">Study design</p>
              <h2
                id="method-heading"
                className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                One shared discovery test across four providers
              </h2>
              <p className="mt-5 text-pretty leading-7 text-zinc-400">
                The first edition focuses on software sold for AI visibility,
                AEO, GEO, or LLM SEO. The frozen 25-product cohort includes only
                products with a public first-party page offering measurement,
                monitoring, benchmarking, or optimization of visibility,
                mentions, citations, or positioning in AI-generated answers.
                Inclusion is not an endorsement.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <article className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <FlaskConical className="size-6 text-emerald-300" aria-hidden="true" />
                <h3 className="mt-5 font-semibold text-white">Freeze before collection</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  The cohort, question text, locale, model IDs, matching rules,
                  and scoring version are downloadable before any counted
                  answer collection.
                </p>
              </article>
              <article className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <ShieldCheck className="size-6 text-emerald-300" aria-hidden="true" />
                <h3 className="mt-5 font-semibold text-white">Require sources</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  An answer is score-eligible only when the provider call
                  succeeds and returns valid web sources. Exclusions remain
                  visible in coverage.
                </p>
              </article>
              <article className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <Database className="size-6 text-emerald-300" aria-hidden="true" />
                <h3 className="mt-5 font-semibold text-white">Release the evidence</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Publish brand-level metrics, provider splits, cited-domain
                  counts, answer-level evidence where permitted, and machine-readable
                  CSV files.
                </p>
              </article>
            </div>
          </section>

          <section aria-labelledby="questions-heading">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="eyebrow">Frozen question bank</p>
                <h2
                  id="questions-heading"
                  className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
                >
                  Questions a buyer might actually ask
                </h2>
                <p className="mt-5 text-sm leading-6 text-zinc-400">
                  Discovery prompts do not name a cohort brand. Five diagnostic
                  templates are included in the download for qualitative
                  product checks but will not enter the ranking metrics.
                </p>
              </div>
              <ol className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {previewQuestions.map((question, index) => (
                  <li
                    key={question}
                    className="grid grid-cols-[2rem_1fr] gap-4 py-5 text-sm leading-6 text-zinc-300"
                  >
                    <span className="font-mono text-xs text-emerald-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {question}
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a href="/data/ai-visibility-index-2026-cohort.csv" download>
                  Frozen 25-product cohort <Download aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/data/ai-visibility-index-2026-question-set.csv" download>
                  All 25 prompts and templates <Download aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="ghost">
                <a href="/data/ai-visibility-index-2026-data-dictionary.csv" download>
                  Metric data dictionary <Download aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="ghost">
                <a href="/data/ai-visibility-index-2026-protocol.json" download>
                  Registered protocol JSON <Download aria-hidden="true" />
                </a>
              </Button>
            </div>
          </section>

          <section aria-labelledby="metrics-heading">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Registered metrics</p>
                <h2
                  id="metrics-heading"
                  className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
                >
                  No composite score without its components
                </h2>
              </div>
              <BarChart3
                className="hidden size-8 text-emerald-300 sm:block"
                aria-hidden="true"
              />
            </div>
            <dl className="mt-8 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {metrics.map(({ name, definition }) => (
                <div
                  key={name}
                  className="grid gap-2 py-5 sm:grid-cols-[14rem_1fr] sm:gap-8"
                >
                  <dt className="font-semibold text-zinc-100">{name}</dt>
                  <dd className="text-sm leading-6 text-zinc-400">{definition}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="dataset-files" aria-labelledby="dataset-files-heading">
            <div className="grid gap-5 lg:grid-cols-[0.68fr_1.32fr] lg:items-end">
              <div>
                <p className="eyebrow">Dataset file guide</p>
                <h2
                  id="dataset-files-heading"
                  className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
                >
                  What each public data file contains
                </h2>
              </div>
              <p className="max-w-2xl text-pretty leading-7 text-zinc-400">
                These five files document the study inputs, protocol, provider
                breakdowns, cited sources, and field definitions. Each link
                opens the original machine-readable file used in this release.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {datasetFileGuide.map((file) => (
                <article
                  key={file.href}
                  className="flex h-full flex-col rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold text-white">
                      {file.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-emerald-300/25 text-emerald-200"
                    >
                      {file.format}
                    </Badge>
                  </div>
                  <p className="mt-3 break-all font-mono text-xs leading-5 text-zinc-400">
                    {file.filename}
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-6 text-zinc-400">
                    {file.description}
                  </p>
                  <a
                    className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                    href={file.href}
                  >
                    Open {file.name.toLowerCase()} {file.format}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="release-heading"
            className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9"
          >
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
              Open results release
            </p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.75fr]">
              <div>
                <h2
                  id="release-heading"
                  className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]"
                >
                  Every result can be traced back to the collected evidence
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-950/80">
                  Download brand and provider tables, cited-source frequency,
                  full answer text with source URLs, the registered inputs,
                  manual adjudications, and a manifest containing file hashes.
                </p>
              </div>
              <div className="rounded-2xl bg-zinc-950/[0.08] p-5">
                <p className="text-sm font-semibold">Release checks passed</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-950/80">
                  <li>• 80 of 80 answers grounded</li>
                  <li>• All four model IDs matched</li>
                  <li>• 34 positive alias matches reviewed</li>
                  <li>• Six result files hashed in a manifest</li>
                </ul>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                variant="secondary"
                className="bg-zinc-950 text-white hover:bg-zinc-800"
              >
                <a href="/data/ai-visibility-index-2026-answer-evidence.csv" download>
                  Download answer evidence <Download aria-hidden="true" />
                </a>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="bg-zinc-950 text-white hover:bg-zinc-800"
              >
                <a href="/data/ai-visibility-index-2026-provider-results.csv" download>
                  Provider-level results <Download aria-hidden="true" />
                </a>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="bg-zinc-950 text-white hover:bg-zinc-800"
              >
                <a href="/data/ai-visibility-index-2026-source-results.csv" download>
                  Cited-source results <Download aria-hidden="true" />
                </a>
              </Button>
            </div>
          </section>

          <section aria-labelledby="limits-heading">
            <p className="eyebrow">Limits</p>
            <h2
              id="limits-heading"
              className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
            >
              What the Index shows—and what it cannot prove
            </h2>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <h3 className="font-semibold text-emerald-200">It can show</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
                  <li>Directional inclusion and prominence in one frozen test.</li>
                  <li>Differences among provider APIs using required web search.</li>
                  <li>Which domains were cited in eligible answers.</li>
                  <li>How answer coverage affects the reported metrics.</li>
                </ul>
              </div>
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <h3 className="font-semibold text-amber-200">It cannot prove</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
                  <li>Permanent rankings or every possible buyer question.</li>
                  <li>Parity with consumer chat interfaces or personalized sessions.</li>
                  <li>That a citation caused a recommendation.</li>
                  <li>Statistical representativeness beyond the registered question set.</li>
                </ul>
              </div>
            </div>
          </section>

          <section aria-labelledby="faq-heading">
            <p className="eyebrow">Study questions</p>
            <h2
              id="faq-heading"
              className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
            >
              About this first release
            </h2>
            <div className="mt-7 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {faq.map(({ question, answer }) => (
                <article key={question} className="py-6">
                  <h3 className="font-semibold text-zinc-100">{question}</h3>
                  <p className="mt-3 max-w-4xl text-sm leading-6 text-zinc-400">
                    {answer}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-6 rounded-[28px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:flex-row sm:items-end sm:justify-between sm:p-9">
            <div>
              <p className="eyebrow">Related research</p>
              <h2 className="mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                Inspect the benchmark method behind the Index
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                Review grounding eligibility, metric denominators, evidence
                retention, and interpretation limits in the full methodology.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/methodology">
                Read the methodology <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </section>
        </div>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
