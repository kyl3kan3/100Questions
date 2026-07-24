import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  absoluteUrl,
  SITE_NAME,
  SITE_UPDATED_AT,
  SOCIAL_IMAGE,
} from "@/lib/site";

const pageUrl = absoluteUrl("/generative-engine-optimization");

export const metadata: Metadata = {
  title: "Generative Engine Optimization (GEO): Practical Guide",
  description:
    "A practical guide to generative engine optimization: improve entity clarity, answer-ready content, source authority, technical access, and AI visibility measurement.",
  keywords: [
    "generative engine optimization",
    "GEO",
    "GEO strategy",
    "AI search optimization",
    "AI answer optimization",
    "LLM optimization",
    "AI citation optimization",
    "AI search monitoring",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Generative Engine Optimization (GEO): A Practical Guide",
    description:
      "Improve how AI answer systems understand, retrieve, and cite your brand without abandoning the fundamentals of SEO.",
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
    title: "A Practical Guide to Generative Engine Optimization",
    description:
      "Clear entities, answer-ready pages, credible sources, technical access, and repeatable AI visibility measurement.",
    images: [SOCIAL_IMAGE],
  },
};

const priorities = [
  {
    title: "Make the entity unambiguous",
    description:
      "Use one consistent company name, domain, category, product description, locations, and key facts across owned profiles and important third-party references.",
  },
  {
    title: "Answer real evaluation questions",
    description:
      "Publish direct, useful pages for use cases, comparisons, pricing, implementation, limitations, and evidence instead of vague marketing copy.",
  },
  {
    title: "Create source-worthy evidence",
    description:
      "Original research, transparent methodology, definitions, examples, and clearly maintained facts give answer systems something concrete to retrieve and cite.",
  },
  {
    title: "Earn relevant third-party corroboration",
    description:
      "Independent coverage, expert references, directories, customer stories, and industry sources help establish category relationships beyond your own site.",
  },
  {
    title: "Keep public content technically accessible",
    description:
      "Use stable URLs, internal links, canonical tags, sitemaps, structured data, fast rendering, and crawler rules that do not accidentally block public guides.",
  },
  {
    title: "Measure with a frozen question set",
    description:
      "Track mentions, prominence, competitors, citations, and coverage across providers, then compare snapshots after substantive changes.",
  },
] as const;

const loop = [
  ["Benchmark", "Capture the current answer evidence across a fixed set of relevant questions."],
  ["Diagnose", "Separate missing mentions, weak prominence, competitor wins, source gaps, and provider failures."],
  ["Improve", "Prioritize the clearest content, entity, technical, and authority gaps you can substantively address."],
  ["Re-run", "Repeat the same test after enough time and meaningful changes, then compare directional movement."],
] as const;

export default function GeoGuidePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: "Generative Engine Optimization (GEO): A Practical Guide",
        description:
          "A practical framework for entity clarity, answer-ready content, source authority, technical access, and AI visibility measurement.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: SITE_UPDATED_AT,
        dateModified: SITE_UPDATED_AT,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": `${absoluteUrl()}#organization` },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        about: [
          "Generative engine optimization",
          "AI search optimization",
          "AI visibility",
          "AI citations",
        ],
        inLanguage: "en-US",
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
            name: "Generative engine optimization guide",
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
                <span className="text-zinc-300">Generative engine optimization</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                GEO guide
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Generative engine optimization: a practical framework without the hype
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                Generative engine optimization, or GEO, is the work of making a
                brand and its expertise easier for AI answer systems to understand,
                retrieve, and cite. It extends good SEO and content practice; it does
                not create a guaranteed way to control generated answers.
              </p>
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">What GEO actually changes</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
                  Better inputs for retrieval and citation
                </h2>
              </div>
              <div className="space-y-5 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  AI answer systems draw from model knowledge, web search, retrieval
                  systems, and provider-specific ranking. GEO improves the public
                  information available to those systems: what the company is, which
                  problems it solves, what evidence supports its claims, and whether
                  independent sources associate it with the category.
                </p>
                <p>
                  The outcome should be measured in answer evidence - not promised as
                  a permanent ranking. Models and search indexes change, different
                  providers select different sources, and the same question can produce
                  different answers over time.
                </p>
              </div>
            </section>

            <section aria-labelledby="geo-priorities-heading">
              <p className="eyebrow">Six priorities</p>
              <h2
                id="geo-priorities-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                A defensible GEO program starts with clarity and evidence
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {priorities.map(({ title, description }, index) => (
                  <Card key={title} className="bg-[#0a0d0b]">
                    <CardHeader>
                      <span className="font-mono text-xs text-emerald-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <CardTitle className="mt-3">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm leading-6 text-zinc-400">
                      {description}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section aria-labelledby="seo-geo-heading">
              <p className="eyebrow">Shared foundation, different observation</p>
              <h2
                id="seo-geo-heading"
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                GEO does not replace SEO
              </h2>
              <div className="mt-8 grid gap-px overflow-hidden rounded-[24px] bg-white/[0.08] md:grid-cols-3">
                <div className="bg-[#0b0e0c] p-6 sm:p-8">
                  <h3 className="font-semibold text-white">Shared foundation</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Crawlable pages, useful content, clear information architecture,
                    consistent entities, earned authority, and good user experience.
                  </p>
                </div>
                <div className="bg-[#0b0e0c] p-6 sm:p-8">
                  <h3 className="font-semibold text-white">SEO observation</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Rankings, impressions, clicks, landing pages, engagement, and
                    conversions from traditional search results.
                  </p>
                </div>
                <div className="bg-[#0b0e0c] p-6 sm:p-8">
                  <h3 className="font-semibold text-white">GEO observation</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Brand mentions, answer prominence, competitor inclusion, citations,
                    source domains, and provider coverage.
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                Search performance can help AI visibility because strong pages are more
                discoverable and citeable. But a high organic rank does not guarantee
                inclusion in a generated answer, so the answer itself must be measured.
              </p>
            </section>

            <section aria-labelledby="measurement-loop-heading">
              <p className="eyebrow">Repeatable process</p>
              <h2
                id="measurement-loop-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Use a benchmark, diagnosis, improvement, and re-run loop
              </h2>
              <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {loop.map(([title, description], index) => (
                  <li
                    key={title}
                    className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <span className="font-mono text-xs text-emerald-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 font-semibold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                <p className="eyebrow">Measure the outcome</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  Learn the AI visibility metrics first
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  A useful baseline separates mentions, prominence, share of voice,
                  citations, and coverage so you can see what actually changed.
                </p>
                <Button asChild variant="link" className="mt-4">
                  <Link href="/ai-visibility">
                    Read the AI visibility guide <ArrowRight />
                  </Link>
                </Button>
              </div>
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                <p className="eyebrow">Go answer-first</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  Pair GEO with answer engine optimization
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  AEO is the answer-focused core of this work: question-mapped
                  pages, extractable facts, and structure engines can quote.
                </p>
                <Button asChild variant="link" className="mt-4">
                  <Link href="/answer-engine-optimization">Read the AEO guide</Link>
                </Button>
              </div>
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                <p className="eyebrow">Inspect the benchmark</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  Keep methodology and limits visible
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Question construction, source eligibility, denominators, frozen model
                  IDs, and time-stamped evidence determine whether a comparison is useful.
                </p>
                <Button asChild variant="link" className="mt-4">
                  <Link href="/methodology">Review the methodology</Link>
                </Button>
              </div>
            </section>

            <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
              <CheckCircle2 className="size-6" aria-hidden="true" />
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                    Establish the baseline
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    Measure the answers before deciding what to optimize.
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
