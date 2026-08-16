import { ArrowRight, Check, Database, Scale, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AeoGeoScorecard } from "@/components/aeo-geo-scorecard";
import { AnalyticsEvent } from "@/components/analytics-event";
import { ContentByline } from "@/components/content-byline";
import { JsonLd } from "@/components/json-ld";
import { MarketingCheckoutButton } from "@/components/marketing-checkout-button";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const path = "/aeo-vs-geo" as const;
const pageUrl = absoluteUrl(path);
const publishedAt = "2026-08-16";

export const metadata: Metadata = {
  title: "AEO vs GEO: Differences, Overlap & Metrics",
  description:
    "Compare AEO vs GEO by target surface, optimization inputs, measurement, and reporting. Use the decision framework and interactive scorecard.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AEO vs GEO: What Changes, What Overlaps, and What to Measure",
    description:
      "A direct, evidence-led comparison of answer engine optimization, generative engine optimization, and SEO.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "article",
    locale: "en_US",
    publishedTime: publishedAt,
    modifiedTime: publishedAt,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "AEO vs GEO: Differences, Overlap & Metrics",
    description:
      "Choose the right optimization program and measurement model for search results, composed answers, and generative engines.",
    images: [SOCIAL_IMAGE],
  },
};

const comparisonRows = [
  [
    "Primary surface",
    "Direct answers, featured snippets, voice results, AI summaries, and assistant responses",
    "Brand inclusion, interpretation, recommendations, and citations across generative engines",
    "Ranked organic search results and the pages that earn clicks",
  ],
  [
    "Optimization inputs",
    "Question-led pages, concise answers, extractable facts, schema where accurate, and citable sources",
    "Entity clarity, authoritative corroboration, original evidence, broad source presence, and answer-ready content",
    "Technical access, search intent, useful pages, internal links, backlinks, and user experience",
  ],
  [
    "Measurement",
    "Answer inclusion, citation rate, answer accuracy, and prominence for a frozen question set",
    "Brand mentions, competitor share of voice, source patterns, sentiment, and provider coverage",
    "Rankings, impressions, clicks, organic conversions, and revenue",
  ],
  [
    "Reporting",
    "Question-level answer and citation evidence, grouped by answer surface",
    "Cross-model benchmark with provider splits, competitors, citations, and representation gaps",
    "Query, landing-page, and conversion performance in analytics and Search Console",
  ],
] as const;

const examples = [
  {
    provider: "OpenAI / ChatGPT model family",
    model: "GPT-5.4 mini via API",
    question: "What are the best AI visibility tools for a small marketing team?",
    mentions: "Otterly.AI led; Peec AI and Profound made the shortlist.",
    sources: "The grounded answer returned five source domains, including optiseo.ai and layzr.ai.",
  },
  {
    provider: "Claude",
    model: "Claude Sonnet 5 via API",
    question: "What software shows which sources AI assistants cite about a brand?",
    mentions: "Analyze AI was the lead mention.",
    sources: "The answer returned five source domains, including demandsphere.com and tryanalyze.ai.",
  },
  {
    provider: "Gemini",
    model: "Gemini 3.1 Flash Lite via API",
    question: "What are the best AI visibility tools for a small marketing team?",
    mentions: "Otterly.AI was the lead mention.",
    sources: "The grounded answer returned five source domains, including visiblee.ai and indexor.ai.",
  },
  {
    provider: "Grok",
    model: "Grok 4.5 via API",
    question: "What software shows which sources AI assistants cite about a brand?",
    mentions: "Analyze AI was the lead mention.",
    sources: "The answer returned five source domains, including sophyx.io and rankr.so.",
  },
] as const;

const faqs = [
  {
    question: "What is the difference between AEO and GEO?",
    answer:
      "AEO focuses on making a specific answer easy to select, summarize, and cite. GEO covers the broader work of making a brand and its evidence understandable, retrievable, and recommendable across generative engines. In practice, their tactics overlap heavily and should share one roadmap.",
  },
  {
    question: "Is GEO vs AEO just a terminology debate?",
    answer:
      "Partly. Teams use the labels differently, and neither has one universal industry definition. The useful distinction is operational: AEO emphasizes answer-level content and citations, while GEO emphasizes cross-engine brand visibility, source authority, and representation. Define the measured surface before choosing the label.",
  },
  {
    question: "How does AEO SEO work together?",
    answer:
      "AEO and SEO use the same technical and editorial foundation: crawlable pages, clear intent, useful information, internal links, and earned authority. SEO measures visibility and conversions from ranked results; AEO adds whether answer systems select and cite the content.",
  },
  {
    question: "Does a company need SEO, AEO, GEO, or all three?",
    answer:
      "Most companies need all three as one integrated program. Use SEO for discoverability in traditional results, AEO for direct answer inclusion, and GEO for cross-engine brand understanding and recommendations. Smaller teams can prioritize the surface closest to buyer behavior while reusing the same content and evidence work.",
  },
  {
    question: "How should AEO and GEO results be measured?",
    answer:
      "Freeze realistic buyer questions, run the same set across the relevant providers, and preserve each answer and source. Report mentions, prominence, competitor share of voice, claimed-domain citations, accuracy, and coverage separately. Compare only like-for-like reruns.",
  },
] as const;

export default function AeoVsGeoPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        headline: "AEO vs GEO: What Changes, What Overlaps, and What to Measure",
        description:
          "A direct comparison of AEO, GEO, and SEO by target surface, optimization inputs, measurement, and reporting.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: publishedAt,
        dateModified: publishedAt,
        author: { "@id": `${absoluteUrl()}#organization` },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        inLanguage: "en-US",
        about: [
          "Answer engine optimization",
          "Generative engine optimization",
          "Search engine optimization",
          "AI visibility measurement",
        ],
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
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
          {
            "@type": "ListItem",
            position: 2,
            name: "Resources",
            item: absoluteUrl("/resources"),
          },
          { "@type": "ListItem", position: 3, name: "AEO vs GEO", item: pageUrl },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#070908] text-zinc-100">
      <AnalyticsEvent
        event="seo_landing_viewed"
        onceKey={`seo-landing:${path}`}
        properties={{ landing_page: path, keyword_cluster: "aeo_vs_geo" }}
      />
      <MarketingHeader />
      <main>
        <article>
          <header className="border-b border-white/[0.07]">
            <div className="page-shell py-16 sm:py-20 lg:py-24">
              <nav className="text-xs text-zinc-400" aria-label="Breadcrumb">
                <Link className="hover:text-zinc-200" href="/">Home</Link>{" "}
                <span aria-hidden="true">/</span>{" "}
                <Link className="hover:text-zinc-200" href="/resources">Resources</Link>{" "}
                <span aria-hidden="true">/</span>{" "}
                <span className="text-zinc-300">AEO vs GEO</span>
              </nav>
              <Badge variant="outline" className="mt-8 border-emerald-300/25 text-emerald-200">
                Direct comparison + scorecard
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                AEO vs GEO: what changes, what overlaps, and what to measure
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                AEO makes individual answers easier to select and cite. GEO
                makes a brand easier to understand, retrieve, and recommend
                across generative engines. The work overlaps; the reporting
                lens is what changes most.
              </p>
              <ContentByline
                publishedAt={publishedAt}
                publishedLabel="August 16, 2026"
                note="Examples come from the open 2026 AI Visibility Index dataset."
              />
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <MarketingCheckoutButton label="Run a 100-question audit — $9" />
                <Button asChild size="lg" variant="outline">
                  <Link href="/sample-report">View the sample report <ArrowRight aria-hidden="true" /></Link>
                </Button>
              </div>
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section aria-labelledby="short-answer-heading" className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="eyebrow">The short answer</p>
                <h2 id="short-answer-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                  Different lenses on one discoverability system
                </h2>
              </div>
              <div className="space-y-5 text-pretty leading-7 text-zinc-400">
                <p>
                  AEO asks, “Can an answer engine extract and attribute the
                  right response?” GEO asks, “Does a generative engine
                  understand and trust the brand enough to include it?” SEO
                  asks, “Can the page earn qualified visibility and clicks in
                  ranked results?”
                </p>
                <p>
                  A useful program does not create three content teams. It
                  fixes access once, clarifies the entity once, publishes the
                  strongest answer once, earns corroboration once, then
                  measures the outcome on each surface.
                </p>
              </div>
            </section>

            <section aria-labelledby="comparison-heading">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="eyebrow">Side-by-side framework</p>
                  <h2 id="comparison-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                    AEO vs GEO vs SEO
                  </h2>
                </div>
                <Scale className="hidden size-8 text-emerald-300 sm:block" aria-hidden="true" />
              </div>
              <div className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-zinc-200">
                    <tr>
                      <th className="p-4 font-semibold">Dimension</th>
                      <th className="p-4 font-semibold">AEO</th>
                      <th className="p-4 font-semibold">GEO</th>
                      <th className="p-4 font-semibold">SEO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08] text-zinc-400">
                    {comparisonRows.map(([dimension, aeo, geo, seo]) => (
                      <tr key={dimension}>
                        <th className="p-4 align-top font-medium text-zinc-200">{dimension}</th>
                        <td className="p-4 align-top leading-6">{aeo}</td>
                        <td className="p-4 align-top leading-6">{geo}</td>
                        <td className="p-4 align-top leading-6">{seo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="decision-heading">
              <p className="eyebrow">Practical decision framework</p>
              <h2 id="decision-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                Choose by the surface where the buying decision happens
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Use SEO when", "Buyers still discover and compare through result pages, and organic sessions or revenue are the primary outcome."],
                  ["Add AEO when", "Featured answers, AI summaries, voice results, or assistant responses can satisfy the question before a click."],
                  ["Add GEO when", "Your category is researched across multiple generative engines and brand inclusion or representation affects the shortlist."],
                  ["Use all three when", "Buyers move between search results and AI answers—which is the normal case for most considered purchases."],
                ].map(([title, description]) => (
                  <article key={title} className="rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                    <Target className="size-5 text-emerald-300" aria-hidden="true" />
                    <h3 className="mt-4 font-semibold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="examples-heading">
              <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
                <div>
                  <p className="eyebrow">Observed cross-model examples</p>
                  <h2 id="examples-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                    The same market produces different mentions and sources
                  </h2>
                </div>
                <p className="leading-7 text-zinc-400">
                  These are answer-level observations from the open 2026 AI
                  Visibility Index, collected July 30, 2026. They illustrate
                  the need for provider splits; they are not current rankings
                  or consumer-interface claims.
                </p>
              </div>
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {examples.map((example) => (
                  <article key={example.provider} className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white">{example.provider}</h3>
                        <p className="mt-1 font-mono text-xs text-zinc-500">{example.model}</p>
                      </div>
                      <Database className="size-5 shrink-0 text-emerald-300" aria-hidden="true" />
                    </div>
                    <p className="mt-5 text-sm font-medium leading-6 text-zinc-200">“{example.question}”</p>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
                      <li className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-emerald-300" aria-hidden="true" />{example.mentions}</li>
                      <li className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-emerald-300" aria-hidden="true" />{example.sources}</li>
                    </ul>
                  </article>
                ))}
              </div>
              <Button asChild variant="link" className="mt-5">
                <a href="/data/ai-visibility-index-2026-answer-evidence.csv" download>
                  Download the answer-level evidence <ArrowRight aria-hidden="true" />
                </a>
              </Button>
            </section>

            <section aria-labelledby="buyer-question-heading" className="rounded-[28px] bg-white/[0.025] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-9">
              <p className="eyebrow">Test buyer questions, not vanity prompts</p>
              <h2 id="buyer-question-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                A brand-named prompt cannot prove discoverability
              </h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="font-semibold text-zinc-200">Weak vanity prompt</p>
                  <p className="mt-3 rounded-2xl border border-red-300/15 bg-red-300/[0.035] p-5 text-sm leading-6 text-zinc-400">
                    “Why is Acme the best analytics platform?”
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-200">Useful buyer question</p>
                  <p className="mt-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.035] p-5 text-sm leading-6 text-zinc-400">
                    “Which analytics platforms support privacy-first reporting for a regulated mid-market team?”
                  </p>
                </div>
              </div>
              <p className="mt-6 max-w-3xl leading-7 text-zinc-400">
                Neutral discovery questions test whether a brand enters the
                answer before it is named. Keep brand-named diagnostics for
                factual accuracy and positioning, then report the two groups
                separately. See the guide to{" "}
                <Link className="text-emerald-300 underline underline-offset-4" href="/ai-visibility-prompts">
                  choosing buyer questions
                </Link>.
              </p>
            </section>

            <section aria-labelledby="scorecard-heading">
              <p className="eyebrow">Interactive scorecard</p>
              <h2 id="scorecard-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                Map the program to your actual outcomes
              </h2>
              <div className="mt-8"><AeoGeoScorecard /></div>
            </section>

            <section id="faq" aria-labelledby="faq-heading">
              <p className="eyebrow">Related terminology</p>
              <h2 id="faq-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                AEO, GEO, and SEO questions
              </h2>
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {faqs.map(({ question, answer }) => (
                  <article key={question} className="rounded-[22px] bg-white/[0.025] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
                    <h3 className="font-semibold leading-6 text-white">{question}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{answer}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">Turn the framework into evidence</p>
              <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">Measure 25 buyer questions across four AI providers.</h2>
                  <p className="mt-3 max-w-2xl leading-7 text-zinc-800">Get 100 planned answers, provider splits, citations, competitors, and five prioritized actions.</p>
                </div>
                <MarketingCheckoutButton
                  label="Buy my first audit — $9"
                  variant="secondary"
                  buttonClassName="bg-zinc-950 text-white hover:bg-zinc-800"
                />
              </div>
            </section>
          </div>
        </article>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
