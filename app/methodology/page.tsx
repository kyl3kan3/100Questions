import { ArrowRight, CheckCircle2, CircleAlert, Scale } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { absoluteUrl, SITE_NAME, SITE_UPDATED_AT } from "@/lib/site";

const methodologyUrl = absoluteUrl("/methodology");

export const metadata: Metadata = {
  title: "AI Visibility Benchmark Methodology",
  description:
    "Learn how 100 Questions builds a frozen 25-question test, collects 100 planned web-grounded answers, and calculates transparent AI visibility metrics.",
  keywords: [
    "AI visibility methodology",
    "generative engine optimization benchmark",
    "LLM brand visibility measurement",
    "AI search share of voice",
  ],
  alternates: { canonical: methodologyUrl },
  openGraph: {
    title: "AI Visibility Benchmark Methodology · 100 Questions",
    description:
      "Question construction, grounding eligibility, metric definitions, and the limits of a directional AI visibility benchmark.",
    url: methodologyUrl,
    type: "article",
    publishedTime: SITE_UPDATED_AT,
    modifiedTime: SITE_UPDATED_AT,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Visibility Benchmark Methodology · 100 Questions",
    description:
      "See how 25 shared questions become a transparent, source-backed comparison across four AI providers.",
  },
};

const benchmarkFacts = [
  ["25", "questions frozen per run"],
  ["20 + 5", "discovery and diagnostic questions"],
  ["4", "AI providers tested with the same set"],
  ["100", "planned provider answers per run"],
] as const;

const metrics = [
  {
    term: "Discovery visibility",
    definition:
      "Eligible discovery answers that mention the target divided by all eligible discovery answers.",
  },
  {
    term: "Conservative visibility floor",
    definition:
      "Discovery answers that mention the target divided by all planned discovery answers, including failures and ungrounded results in the denominator.",
  },
  {
    term: "Coverage",
    definition:
      "Score-eligible answers divided by planned answers. Results are marked provisional when coverage is below 90%.",
  },
  {
    term: "Prominence",
    definition:
      "The mean position of the target in eligible discovery answers: lead = 1, shortlist = 0.67, incidental = 0.33, and absent = 0.",
  },
  {
    term: "Share of voice",
    definition:
      "Target mention events divided by target and selected-competitor mention events, with each entity counted at most once in an answer.",
  },
  {
    term: "Claimed-domain citation rate",
    definition:
      "Eligible answers that cite the submitted canonical domain or one of its subdomains divided by all eligible answers.",
  },
  {
    term: "Sentiment",
    definition:
      "Positive, neutral, and negative labels among answers that mention the target. It is not treated as a factual-accuracy score.",
  },
] as const;

export default function MethodologyPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${methodologyUrl}#article`,
        headline: "100 Questions AI Visibility Benchmark Methodology",
        description:
          "How 100 Questions constructs, runs, scores, and interprets its four-provider AI visibility benchmark.",
        url: methodologyUrl,
        mainEntityOfPage: methodologyUrl,
        datePublished: SITE_UPDATED_AT,
        dateModified: SITE_UPDATED_AT,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@type": "Organization", name: SITE_NAME },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: absoluteUrl(),
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/logo-mark.svg"),
          },
        },
        about: [
          "AI visibility",
          "Generative engine optimization",
          "Web-grounded AI answers",
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
            name: "Methodology",
            item: methodologyUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#070908] text-zinc-100">
      <MarketingHeader />
      <main>
        <section className="border-b border-white/[0.07]">
          <div className="page-shell py-16 sm:py-20 lg:py-24">
            <nav className="text-xs text-zinc-500" aria-label="Breadcrumb">
              <Link className="hover:text-zinc-200" href="/">
                Home
              </Link>{" "}
              <span aria-hidden="true">/</span>{" "}
              <span className="text-zinc-300">Methodology</span>
            </nav>
            <Badge variant="outline" className="mt-8 border-emerald-300/25 text-emerald-200">
              Benchmark v2
            </Badge>
            <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              How the 100 Questions AI visibility benchmark works
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
              Each run is a time-stamped, directional comparison. It freezes one
              question set, asks it across four AI providers with web search, and
              keeps coverage and metric denominators visible beside the results.
            </p>
          </div>
        </section>

        <section className="page-shell py-12 sm:py-16" aria-labelledby="benchmark-at-a-glance">
          <h2 id="benchmark-at-a-glance" className="sr-only">
            Benchmark at a glance
          </h2>
          <div className="grid gap-px overflow-hidden rounded-[24px] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
            {benchmarkFacts.map(([value, label]) => (
              <div key={label} className="bg-[#0b0e0c] p-6">
                <p className="font-mono text-3xl font-semibold tracking-[-0.04em] text-emerald-300">
                  {value}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <article className="page-shell grid gap-12 pb-20 lg:grid-cols-[15rem_minmax(0,1fr)] lg:pb-28">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <p className="eyebrow">On this page</p>
            <nav className="mt-4 flex flex-col items-start gap-3 text-sm text-zinc-400" aria-label="Methodology sections">
              <a className="hover:text-white" href="#questions">Question construction</a>
              <a className="hover:text-white" href="#grounding">Grounding and eligibility</a>
              <a className="hover:text-white" href="#metrics">Metric definitions</a>
              <a className="hover:text-white" href="#interpretation">How to interpret results</a>
              <a className="hover:text-white" href="#evidence">Evidence and retention</a>
            </nav>
          </aside>

          <div className="min-w-0 space-y-16">
            <section id="questions" className="scroll-mt-8">
              <p className="eyebrow">01 · Question construction</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                One frozen test, two question cohorts
              </h2>
              <p className="mt-5 text-pretty leading-7 text-zinc-400">
                A run starts from the subject name, canonical domain, aliases,
                category description, market, locale, and optional competitors. The
                system first creates a neutral category brief, then generates the two
                cohorts separately.
              </p>
              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <Card className="bg-[#0b0e0c]">
                  <CardContent>
                    <p className="font-mono text-sm text-emerald-300">20 discovery questions</p>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      Neutral category and use-case questions. A question is rejected
                      or regenerated if it contains the subject, an alias, or the
                      canonical domain.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-[#0b0e0c]">
                  <CardContent>
                    <p className="font-mono text-sm text-emerald-300">5 diagnostic questions</p>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      Target-named questions that probe trust, comparisons, pricing,
                      support, implementation, and factual knowledge for manual review.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <p className="mt-7 text-pretty leading-7 text-zinc-400">
                The exact 25-question set, locale, prompt versions, model IDs, run
                timestamp, cohort mix, grounding mode, and scoring version are frozen.
                Every provider receives the same question text and neutral system
                instruction, without hidden target context.
              </p>
            </section>

            <section id="grounding" className="scroll-mt-8">
              <p className="eyebrow">02 · Grounding and eligibility</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                Sources are a scoring requirement
              </h2>
              <p className="mt-5 text-pretty leading-7 text-zinc-400">
                OpenAI, Anthropic, Google, and xAI requests use provider-native web
                search through Vercel AI Gateway. There is no plain-text fallback. A
                provider result enters score-eligible denominators only when the call
                succeeds and returns valid web sources.
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-emerald-300/[0.06] p-5 shadow-[inset_0_0_0_1px_rgba(110,231,183,0.16)]">
                  <CheckCircle2 className="size-5 text-emerald-300" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-zinc-100">Eligible</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    A successful provider answer with normalized, valid HTTP or HTTPS
                    source URLs.
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-300/[0.05] p-5 shadow-[inset_0_0_0_1px_rgba(252,211,77,0.14)]">
                  <CircleAlert className="size-5 text-amber-300" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-zinc-100">Excluded, but visible</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Unsupported search, missing sources, and failed calls stay visible
                    in coverage instead of silently entering a score.
                  </p>
                </div>
              </div>
            </section>

            <section id="metrics" className="scroll-mt-8">
              <p className="eyebrow">03 · Metric definitions</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                Every number keeps its denominator
              </h2>
              <dl className="mt-7 divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {metrics.map(({ term, definition }) => (
                  <div key={term} className="grid gap-2 py-5 sm:grid-cols-[13rem_1fr] sm:gap-8">
                    <dt className="font-semibold text-zinc-100">{term}</dt>
                    <dd className="text-sm leading-6 text-zinc-400">{definition}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section id="interpretation" className="scroll-mt-8">
              <p className="eyebrow">04 · Interpretation</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                Treat the result as a directional snapshot
              </h2>
              <div className="mt-7 rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
                <Scale className="size-6 text-emerald-300" aria-hidden="true" />
                <ul className="mt-5 space-y-4 text-sm leading-6 text-zinc-400">
                  <li>
                    Search results and model responses vary, so a run measures one
                    provider and web snapshot rather than a permanent rank.
                  </li>
                  <li>
                    The API-grounded benchmark does not claim parity with consumer chat
                    products, where routing, personalization, prompts, and search can differ.
                  </li>
                  <li>
                    With 25 questions, a simple worst-case sampling interval is roughly
                    ±20 percentage points. That is a scale cue, not a claim that the
                    generated set is a random or representative statistical sample.
                  </li>
                  <li>
                    Coverage should be read beside visibility. Below 90% coverage, the
                    product labels metrics provisional.
                  </li>
                </ul>
              </div>
            </section>

            <section id="evidence" className="scroll-mt-8">
              <p className="eyebrow">05 · Evidence and retention</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                Inspect the answers behind the metrics
              </h2>
              <p className="mt-5 text-pretty leading-7 text-zinc-400">
                Runs are private to their authenticated owner. The product stores the
                frozen questions, normalized answers and sources, model and prompt
                versions, usage, metric labels, and exclusion reasons needed to explain
                a result. Complete raw provider payloads are not retained. The default
                answer-retention window is 30 days.
              </p>
            </section>

            <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                Run the same test across four providers
              </p>
              <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="max-w-xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                  See the questions, sources, coverage, and calculations for your brand.
                </h2>
                <Button asChild variant="secondary" size="lg" className="bg-zinc-950 text-white hover:bg-zinc-800">
                  <Link href="/auth/sign-up">
                    Start a benchmark <ArrowRight />
                  </Link>
                </Button>
              </div>
              <p className="mt-5 text-sm text-zinc-800">
                Still evaluating? <Link className="font-semibold underline underline-offset-4" href="/faq">Read common questions</Link>.
              </p>
            </section>
          </div>
        </article>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
