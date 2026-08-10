import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ContentByline } from "@/components/content-byline";
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

const pageUrl = absoluteUrl("/ai-visibility");

export const metadata: Metadata = {
  title: "AI Visibility: How to Measure and Improve It",
  description:
    "AI visibility measures how often your brand appears in AI answers. Learn the core metrics, see a worked example, and find practical ways to improve it.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI Visibility: What It Is, How to Measure and Improve It",
    description:
      "Learn the core AI visibility metrics, see a worked example, and find practical ways to improve your brand's presence in AI answers.",
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
    title: "AI Visibility: A Practical Measurement Guide",
    description:
      "Measure brand mentions, prominence, citations, competitors, and coverage across AI answers.",
    images: [SOCIAL_IMAGE],
  },
};

const visibilitySignals = [
  {
    title: "Mention rate",
    description:
      "The percentage of eligible discovery answers that mention your brand without being prompted with its name.",
  },
  {
    title: "Prominence",
    description:
      "Whether your brand leads the answer, appears in a shortlist, is mentioned incidentally, or is absent.",
  },
  {
    title: "Competitor share of voice",
    description:
      "Your answer-level mentions compared with the selected competitors that appear in the same question set.",
  },
  {
    title: "Citation rate",
    description:
      "How often eligible answers cite your submitted domain or one of its subdomains as supporting evidence.",
  },
  {
    title: "Coverage",
    description:
      "The percentage of planned answers that completed with usable web sources. Read this beside every visibility metric.",
  },
] as const;

const measurementSteps = [
  {
    title: "Define the market question set",
    description:
      "Use neutral category, problem, and use-case questions that real buyers might ask. Keep target-named diagnostic questions separate.",
  },
  {
    title: "Ask the same questions across providers",
    description:
      "A shared set makes differences between OpenAI, Claude, Gemini, and Grok easier to interpret than four unrelated tests.",
  },
  {
    title: "Require source evidence",
    description:
      "Treat failed or unsourced answers as coverage gaps instead of silently counting them as positive or negative visibility.",
  },
  {
    title: "Separate visibility from availability",
    description:
      "Report the mention numerator, eligible denominator, and coverage together so a small sample cannot masquerade as a strong score.",
  },
  {
    title: "Repeat after meaningful changes",
    description:
      "Compare time-stamped snapshots after improving product pages, evidence, entity consistency, or third-party authority.",
  },
] as const;

const improvementSteps = [
  {
    title: "Make your entity unambiguous",
    description:
      "Use consistent company, product, category, and audience language across your site and trusted profiles so answer systems can resolve who you are.",
  },
  {
    title: "Publish evidence worth citing",
    description:
      "Add original data, concrete examples, methodology, comparisons, and clear product facts that can support an answer instead of repeating generic claims.",
  },
  {
    title: "Strengthen third-party corroboration",
    description:
      "Earn accurate coverage and references from relevant independent sources. Your own website is necessary, but it is not the only evidence AI search retrieves.",
  },
  {
    title: "Keep important pages accessible",
    description:
      "Use descriptive titles and headings, internal links, crawlable text, structured data, and fast public pages so search and answer systems can retrieve the facts.",
  },
  {
    title: "Measure the same questions again",
    description:
      "Re-run a frozen question set after meaningful changes. Compare direction and evidence over time instead of treating one generated answer as a permanent rank.",
  },
] as const;

const visibilityFaqs = [
  {
    question: "What an AI visibility result looks like",
    answer:
      "An illustrative AI visibility result can show discovery visibility, owned citation rate, competitor share of voice, and answer coverage for one shared question set. In this example, 28 of 80 neutral discovery answers mention the brand, 12 of 80 eligible answers cite its domain, the brand earns 28 of 90 tracked brand mentions, and 94 of 100 planned answers finish with usable output. The 35% visibility figure is a baseline for that question set, provider mix, and date, not a universal grade.",
  },
  {
    question: "How to measure AI visibility without hiding uncertainty",
    answer:
      "Use neutral market questions, ask the same questions across providers, require source evidence, report the mention numerator, eligible denominator, and coverage together, and compare time-stamped snapshots after meaningful changes. Failed or unsourced answers should remain coverage gaps rather than being silently counted as positive or negative visibility.",
  },
  {
    question: "How to improve AI visibility",
    answer:
      "There is no single AI ranking factor to optimize. Improve the clarity, evidence, accessibility, and independent corroboration that answer systems can retrieve. Use consistent entity language, publish original evidence and clear product facts, earn accurate independent references, keep important pages crawlable and well structured, and rerun the same frozen question set after meaningful changes.",
  },
] as const;

export default function AiVisibilityGuidePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: "AI Visibility: What It Is, How to Measure and Improve It",
        description:
          "A practical guide to AI visibility metrics, interpretation, measurement, and improvement, with a worked brand example.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: SITE_UPDATED_AT,
        dateModified: SITE_UPDATED_AT,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": `${absoluteUrl()}#organization` },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        about: [
          "AI visibility",
          "AI search visibility",
          "Brand visibility",
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
            name: "AI visibility guide",
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: visibilityFaqs.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
        })),
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
                <span className="text-zinc-300">AI visibility</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                AI visibility guide
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                AI visibility: what it is, how to measure it, and how to improve it
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                AI visibility measures how often and how prominently your brand appears
                when systems such as ChatGPT, Claude, Gemini, and Grok answer relevant
                buyer questions. This guide explains the metrics, shows a worked
                example, and outlines practical ways to improve your visibility.
              </p>
              <ContentByline
                publishedAt={SITE_UPDATED_AT}
                publishedLabel="July 24, 2026"
              />
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">Plain-language definition</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
                  Visibility is more than one score
                </h2>
              </div>
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
                <p className="text-pretty text-lg leading-8 text-zinc-300">
                  A brand is visible when an AI answer selects it as relevant to the
                  question. But a mention alone does not show whether the brand led the
                  answer, trailed competitors, earned a citation, or appeared in a run
                  where most other answers failed. Those signals need separate metrics.
                </p>
              </div>
            </section>

            <section aria-labelledby="example-heading">
              <p className="eyebrow">Worked example</p>
              <h2
                id="example-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                What an AI visibility result looks like
              </h2>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                Imagine a benchmark that collects 100 planned answers from one shared
                25-question set across four AI providers. The figures below are an
                illustrative example, not a customer result.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["35%", "Discovery visibility", "28 of 80 neutral discovery answers mention the brand."],
                  ["15%", "Owned citation rate", "12 of 80 eligible answers cite the brand's domain."],
                  ["31%", "Competitor share of voice", "The brand earns 28 of 90 tracked brand mentions."],
                  ["94%", "Answer coverage", "94 of 100 planned provider answers finish with usable output."],
                ].map(([value, label, detail]) => (
                  <div
                    key={label}
                    className="rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <p className="text-3xl font-semibold tracking-[-0.04em] text-emerald-300">
                      {value}
                    </p>
                    <h3 className="mt-3 font-semibold text-zinc-100">{label}</h3>
                    <p className="mt-2 text-xs leading-5 text-zinc-400">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[22px] border border-emerald-300/15 bg-emerald-300/[0.035] p-6">
                <p className="text-sm leading-6 text-zinc-300">
                  <strong className="text-white">How to read it:</strong> 35% visibility
                  is not a universal grade. It is a baseline for this question set,
                  provider mix, and date. The 94% coverage figure shows that the
                  comparison is mostly complete, while the citations and competitor
                  mentions explain what sits behind the headline score.
                </p>
              </div>
            </section>

            <section aria-labelledby="signals-heading">
              <p className="eyebrow">Core metrics</p>
              <h2
                id="signals-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Five signals make AI search visibility understandable
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visibilitySignals.map(({ title, description }) => (
                  <Card key={title} className="bg-[#0a0d0b]">
                    <CardHeader>
                      <CardTitle>{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm leading-6 text-zinc-400">
                      {description}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section aria-labelledby="measure-heading">
              <p className="eyebrow">Measurement framework</p>
              <h2
                id="measure-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                How to measure AI visibility without hiding uncertainty
              </h2>
              <ol className="mt-8 divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {measurementSteps.map(({ title, description }, index) => (
                  <li
                    key={title}
                    className="grid gap-3 py-6 sm:grid-cols-[3rem_14rem_1fr] sm:gap-6"
                  >
                    <span className="font-mono text-sm text-emerald-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-semibold text-zinc-100">{title}</h3>
                    <p className="text-sm leading-6 text-zinc-400">{description}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="improve-heading">
              <p className="eyebrow">Practical improvement</p>
              <h2
                id="improve-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                How to improve AI visibility
              </h2>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                There is no single AI ranking factor to optimize. Improve the clarity,
                evidence, accessibility, and independent corroboration that answer
                systems can retrieve, then measure whether the same questions change.
              </p>
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {improvementSteps.map(({ title, description }, index) => (
                  <div
                    key={title}
                    className="grid grid-cols-[2.5rem_1fr] gap-4 rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <span className="font-mono text-sm text-emerald-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-semibold text-zinc-100">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="seo-comparison-heading">
              <p className="eyebrow">SEO and AI search</p>
              <h2
                id="seo-comparison-heading"
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                AI visibility complements traditional SEO
              </h2>
              <div
                className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                role="region"
                aria-label="AI visibility versus traditional SEO comparison"
                tabIndex={0}
              >
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-zinc-200">
                    <tr>
                      <th className="p-4 font-semibold">Question</th>
                      <th className="p-4 font-semibold">Traditional SEO</th>
                      <th className="p-4 font-semibold">AI visibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08] text-zinc-400">
                    <tr>
                      <th className="p-4 font-medium text-zinc-200">Primary outcome</th>
                      <td className="p-4">Rankings, impressions, clicks, conversions</td>
                      <td className="p-4">Mentions, prominence, citations, competitor presence</td>
                    </tr>
                    <tr>
                      <th className="p-4 font-medium text-zinc-200">Unit measured</th>
                      <td className="p-4">A query and a search result page</td>
                      <td className="p-4">A question and a generated answer</td>
                    </tr>
                    <tr>
                      <th className="p-4 font-medium text-zinc-200">Evidence</th>
                      <td className="p-4">Search Console and analytics data</td>
                      <td className="p-4">Answer text, sources, models, and coverage</td>
                    </tr>
                    <tr>
                      <th className="p-4 font-medium text-zinc-200">Best use</th>
                      <td className="p-4">Organic discovery and demand capture</td>
                      <td className="p-4">Understanding inclusion in AI-generated recommendations</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                Strong technical SEO makes useful pages crawlable and understandable.
                AI visibility adds a different observation layer: whether answer
                systems actually surface the brand and which sources accompany it.
                The practices work together rather than replacing one another.
              </p>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                <p className="eyebrow">Next step</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  Improve the inputs AI systems can retrieve
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Clear product language, original evidence, consistent company facts,
                  and credible third-party references make a brand easier to understand
                  and cite. The practical discipline is often called generative engine
                  optimization.
                </p>
                <Button asChild variant="link" className="mt-4">
                  <Link href="/generative-engine-optimization">
                    Read the GEO guide <ArrowRight />
                  </Link>
                </Button>
              </div>
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                <p className="eyebrow">Important limitation</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  Treat every result as a directional snapshot
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Models, search results, and generated answers change. A benchmark is
                  useful for inspecting evidence and comparing a frozen question set,
                  not for claiming a permanent rank or guaranteed recommendation.
                </p>
                <Button asChild variant="link" className="mt-4">
                  <Link href="/methodology">Review the full methodology</Link>
                </Button>
              </div>
            </section>

            <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
              <CheckCircle2 className="size-6" aria-hidden="true" />
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                    Source-backed benchmark
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    See where your brand appears, where it does not, and which competitors do.
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
