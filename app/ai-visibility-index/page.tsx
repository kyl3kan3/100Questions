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
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const pageUrl = absoluteUrl("/ai-visibility-index");
const INDEX_DATE = {
  iso: "2026-07-30",
  label: "July 30, 2026",
} as const;

const questionSetUrl = absoluteUrl(
  "/data/ai-visibility-index-2026-question-set.csv",
);
const dataDictionaryUrl = absoluteUrl(
  "/data/ai-visibility-index-2026-data-dictionary.csv",
);
const cohortUrl = absoluteUrl("/data/ai-visibility-index-2026-cohort.csv");
const protocolUrl = absoluteUrl("/data/ai-visibility-index-2026-protocol.json");

export const metadata: Metadata = {
  title: "2026 AI Visibility Index: Registered Study",
  description:
    "The preregistered 2026 AI Visibility Index for AI search software, including its frozen question bank, provider scope, metrics, release plan, and limitations.",
  keywords: [
    "AI Visibility Index",
    "AI visibility benchmark",
    "AEO software benchmark",
    "GEO tools research",
    "LLM SEO data",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "2026 AI Visibility Index",
    description:
      "A public, preregistered study of which AI visibility software brands appear in web-grounded answers across four providers.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "article",
    locale: "en_US",
    publishedTime: INDEX_DATE.iso,
    modifiedTime: INDEX_DATE.iso,
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 AI Visibility Index",
    description:
      "The question bank, scoring rules, provider scope, and limitations are public before results are collected.",
  },
};

const studyFacts = [
  {
    value: "Registered",
    label: "Protocol status",
    detail: "No counted collection began before the design was published.",
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
    label: "Planned discovery answers",
    detail: "Twenty shared questions across four frozen provider models.",
  },
] as const;

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

const faq = [
  {
    question: "What is the 2026 AI Visibility Index?",
    answer:
      "It is a public study of which AI visibility, AEO, GEO, and LLM SEO software brands appear in web-grounded answers to a frozen set of buyer questions. The protocol is published before collection so the questions and headline metrics cannot be changed to fit the results.",
  },
  {
    question: "Does this page contain rankings yet?",
    answer:
      "No. This first release registers the study design and publishes the question set and data dictionary. Rankings, answer-level evidence, cited-source analysis, and downloadable result files will be added only after fieldwork and quality review are complete.",
  },
  {
    question: "Which AI providers will the study test?",
    answer:
      "The study will test OpenAI, Anthropic, Google, and xAI through their APIs with required web-search grounding. Exact model identifiers and collection timestamps will be frozen and published with the results.",
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
        headline: "2026 AI Visibility Index: Registered Study",
        description:
          "A preregistered public study of AI visibility software brands across web-grounded answers from four AI providers.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: INDEX_DATE.iso,
        dateModified: INDEX_DATE.iso,
        author: { "@id": `${absoluteUrl()}#organization` },
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
        name: "2026 AI Visibility Index study protocol",
        description:
          "The frozen discovery question bank and metric data dictionary registered before fieldwork for the 2026 AI Visibility Index.",
        url: pageUrl,
        datePublished: INDEX_DATE.iso,
        dateModified: INDEX_DATE.iso,
        creator: { "@id": `${absoluteUrl()}#organization` },
        isAccessibleForFree: true,
        inLanguage: "en-US",
        measurementTechnique:
          "A frozen question set with required web-search grounding across OpenAI, Anthropic, Google, and xAI APIs.",
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
            encodingFormat: "text/csv",
            contentUrl: questionSetUrl,
          },
          {
            "@type": "DataDownload",
            name: "Metric data dictionary",
            encodingFormat: "text/csv",
            contentUrl: dataDictionaryUrl,
          },
          {
            "@type": "DataDownload",
            name: "Registered study protocol",
            encodingFormat: "application/json",
            contentUrl: protocolUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
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
              <span className="text-zinc-300">AI Visibility Index</span>
            </nav>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="border-emerald-300/25 text-emerald-200"
              >
                2026 registered study
              </Badge>
              <span className="rounded-full bg-amber-300/[0.08] px-3 py-1 text-xs text-amber-200 shadow-[inset_0_0_0_1px_rgba(252,211,77,0.16)]">
                Results pending
              </span>
            </div>
            <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl lg:text-7xl">
              The 2026 AI Visibility Index
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400 sm:text-xl">
              A transparent study of which AI visibility software brands appear
              in web-grounded answers—and which sources the models cite. The
              question bank and scoring rules are public before collection.
            </p>
            <p className="mt-5 flex items-center gap-2 text-sm text-zinc-400">
              <CalendarDays className="size-4 text-emerald-300" aria-hidden="true" />
              Registered{" "}
              <time dateTime={INDEX_DATE.iso}>{INDEX_DATE.label}</time>
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="/data/ai-visibility-index-2026-question-set.csv" download>
                  Download the question set <Download aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#method">
                  Review the study design <ArrowRight aria-hidden="true" />
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
                <p className="mt-2 text-sm leading-6 text-zinc-500">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="page-shell space-y-20 pb-20 pt-6 lg:pb-28">
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
                This registration contains no inferred scores, placeholder
                rankings, or synthetic results. The results release will keep
                answer coverage beside every headline number and link the
                reported findings to downloadable data.
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

          <section
            aria-labelledby="release-heading"
            className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9"
          >
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
              Planned results release
            </p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.75fr]">
              <div>
                <h2
                  id="release-heading"
                  className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]"
                >
                  Rankings will publish only after collection and coverage review
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-950/80">
                  The release package is planned to include provider-by-provider
                  tables, cited-source analysis, methodology changes if any,
                  machine-readable results, and charts available for editorial
                  reuse with attribution.
                </p>
              </div>
              <div className="rounded-2xl bg-zinc-950/[0.08] p-5">
                <p className="text-sm font-semibold">Release gate</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-950/80">
                  <li>• Cohort and model IDs frozen</li>
                  <li>• Coverage reviewed by provider</li>
                  <li>• Brand matching manually checked</li>
                  <li>• Results CSV reconciled to charts</li>
                </ul>
              </div>
            </div>
          </section>

          <section aria-labelledby="limits-heading">
            <p className="eyebrow">Limits</p>
            <h2
              id="limits-heading"
              className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
            >
              What the Index will and will not show
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
