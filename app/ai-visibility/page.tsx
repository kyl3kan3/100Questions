import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { absoluteUrl, SITE_UPDATED_AT, SOCIAL_IMAGE } from "@/lib/site";

const pageUrl = absoluteUrl("/ai-visibility");

export const metadata: Metadata = {
  title: "AI Visibility: Measure Brand Visibility in AI Search",
  description:
    "Learn what AI visibility means, how to measure brand mentions, citations, prominence, competitor share of voice, and coverage across AI search answers.",
  keywords: [
    "AI visibility",
    "AI search visibility",
    "AI brand visibility",
    "AI visibility tool",
    "LLM visibility",
    "AI brand monitoring",
    "AI citation tracking",
    "AI share of voice",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "What Is AI Visibility? A Practical Measurement Guide",
    description:
      "A clear framework for measuring brand mentions, prominence, competitors, citations, and coverage across AI answers.",
    url: pageUrl,
    type: "article",
    publishedTime: SITE_UPDATED_AT,
    modifiedTime: SITE_UPDATED_AT,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "What Is AI Visibility?",
    description:
      "Measure how often AI answers mention your brand, cite your site, and surface competitors.",
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

export default function AiVisibilityGuidePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: "What Is AI Visibility? How to Measure Brand Visibility in AI Search",
        description:
          "A practical framework for measuring brand mentions, prominence, competitor share of voice, citations, and coverage across AI answers.",
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
                <span className="text-zinc-300">AI visibility</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                AI visibility guide
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                What is AI visibility, and how should a brand measure it?
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                AI visibility describes how often and how prominently a brand appears
                when AI systems answer relevant category and buyer questions. A useful
                measurement also shows competitors, citations, missing answers, and the
                exact evidence behind every percentage.
              </p>
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

            <section aria-labelledby="seo-comparison-heading">
              <p className="eyebrow">SEO and AI search</p>
              <h2
                id="seo-comparison-heading"
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                AI visibility complements traditional SEO
              </h2>
              <div className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
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
