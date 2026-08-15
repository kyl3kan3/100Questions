import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
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

const pageUrl = absoluteUrl("/ai-search-optimization");

export const metadata: Metadata = {
  title: "AI Search Optimization: Practical Workflow",
  description:
    "AI search optimization improves how answer systems retrieve, understand, cite, and recommend your brand. Use this six-stage workflow and measurement plan.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI Search Optimization: A Practical, Measurable Workflow",
    description:
      "A six-stage workflow for crawlability, entity clarity, answer-ready content, evidence, distribution, and repeated measurement.",
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
    title: "AI Search Optimization: A Practical Workflow",
    description:
      "Make your brand easier for AI search systems to retrieve, understand, cite, and compare.",
    images: [SOCIAL_IMAGE],
  },
};

const stages = [
  {
    title: "How do you make public pages retrievable?",
    description:
      "Keep important pages indexable, linked, fast, server-rendered, and reachable by the search crawlers you intend to allow. Check both robots.txt and CDN bot controls.",
  },
  {
    title: "How do you establish a consistent brand entity for AI search?",
    description:
      "Use one company name, canonical domain, category description, product vocabulary, pricing story, and set of official profiles across owned and third-party pages.",
  },
  {
    title: "How do you map content to buyer questions?",
    description:
      "Build pages around real discovery, comparison, implementation, risk, pricing, and alternative questions. Lead with a direct answer before supporting detail.",
  },
  {
    title: "What makes content worth citing?",
    description:
      "Add original data, methods, examples, limitations, dates, and source links. Generic summaries are easy to reproduce and give an answer engine little reason to cite you.",
  },
  {
    title: "How do you earn off-site corroboration?",
    description:
      "Accurate directory listings, expert references, reviews, and category roundups help answer systems verify claims that would be weak if they appeared only on your own domain.",
  },
  {
    title: "How do you measure AI search answers?",
    description:
      "Freeze a representative question set, record model and coverage details, ship meaningful changes, and rerun the same test. Separate mentions, prominence, citations, and coverage.",
  },
] as const;

const faqs = [
  {
    question: "What is AI search optimization?",
    answer:
      "AI search optimization is the work of making a brand and its information easier for AI-powered search and answer systems to retrieve, understand, verify, cite, and recommend. It combines durable SEO foundations with answer-ready content, consistent entity facts, third-party corroboration, and measurement inside generated answers.",
  },
  {
    question: "Is AI search optimization different from SEO, AEO, and GEO?",
    answer:
      "It is an umbrella operating term. SEO makes public pages discoverable and competitive in search indexes. AEO focuses on direct, extractable answers to specific questions. GEO focuses on the credibility and source signals that make generated systems willing to cite or recommend a brand. A practical program needs all three.",
  },
  {
    question: "How do I optimize a site for ChatGPT search?",
    answer:
      "Start by allowing OAI-SearchBot to crawl the public pages you want included, then make those pages indexable, internally linked, clear about the brand and category, and supported by current evidence. OpenAI states that public sites can appear in ChatGPT search and specifically calls out OAI-SearchBot access. Access creates eligibility, not guaranteed inclusion.",
  },
  {
    question: "Does llms.txt improve AI search rankings?",
    answer:
      "There is no universal AI-search ranking guarantee for llms.txt. It can provide a concise, maintained map of canonical facts and public pages, but it should complement rather than replace crawlable HTML, sitemaps, internal links, structured data, and useful content.",
  },
  {
    question: "How long does AI search optimization take?",
    answer:
      "Technical fixes can make a page eligible immediately, but crawling, indexing, citations, and brand mentions move on different schedules. New domains often need time and external corroboration. Use a baseline and compare again after meaningful changes rather than promising a fixed ranking timeline.",
  },
  {
    question: "How should AI search optimization be measured?",
    answer:
      "Keep separate measures for brand mentions, prominence, competitor share of voice, owned-domain citations, sentiment, and provider coverage. Record the exact questions, model identifiers, timestamp, sources, and exclusion rules. Traffic and conversions matter too, but they answer a different question from visibility inside the answer.",
  },
] as const;

const sources = [
  {
    label: "OpenAI publisher guidance",
    detail: "ChatGPT search eligibility and OAI-SearchBot access",
    href: "https://help.openai.com/en/articles/12627856",
  },
  {
    label: "Google Search Central",
    detail: "Official generative AI optimization guidance",
    href: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
  },
  {
    label: "Bing Webmaster Tools",
    detail: "AI Performance measurement and content guidance",
    href: "https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c",
  },
  {
    label: "Microsoft Advertising",
    detail: "From discovery to influence: AEO and GEO guide",
    href: "https://about.ads.microsoft.com/content/dam/sites/msa-about/global/common/content-lib/pdf/from-discovery-to-influence-a-guide-to-aeo-and-geo.pdf",
  },
] as const;

export default function AiSearchOptimizationPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: "AI Search Optimization: A Practical Workflow That You Can Measure",
        description:
          "A six-stage workflow for improving crawlability, entity clarity, answer-ready content, evidence, third-party corroboration, and AI visibility measurement.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: SITE_UPDATED_AT,
        dateModified: SITE_UPDATED_AT,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": `${absoluteUrl()}#organization` },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        about: [
          "AI search optimization",
          "answer engine optimization",
          "generative engine optimization",
          "AI visibility",
        ],
        inLanguage: "en-US",
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
            name: "AI search optimization",
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
                <span className="text-zinc-300">AI search optimization</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                Practical guide
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                AI search optimization: make your brand retrievable, citable,
                and measurable.
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                AI search optimization is not a schema trick or a promise to
                rank in ChatGPT. It is a connected workflow: open the technical
                path, clarify the entity, answer real buyer questions, publish
                evidence, earn corroboration, and measure what models actually
                return.
              </p>
              <ContentByline
                publishedAt={SITE_UPDATED_AT}
                publishedLabel="July 24, 2026"
              />
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="eyebrow">Start with the definition</p>
                <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                  What does AI search optimization mean?
                </h2>
              </div>
              <div className="space-y-5 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  AI search optimization means improving a page&apos;s
                  eligibility for retrieval and the evidence that makes it
                  useful source material.
                </p>
                <p>
                  Search-powered AI answers still depend on accessible pages,
                  indexes, retrieval systems, and source quality. Google says
                  its existing SEO foundations remain relevant to generative
                  features. OpenAI tells publishers not to block
                  OAI-SearchBot if they want public content considered for
                  ChatGPT search.
                </p>
                <p>
                  That creates eligibility, not selection. To become useful
                  source material, a page also needs a clear answer, specific
                  facts, visible evidence, consistent brand identity, and a
                  reason to trust it over interchangeable summaries.
                </p>
              </div>
            </section>

            <section aria-labelledby="workflow-heading">
              <p className="eyebrow">Six-stage workflow</p>
              <h2
                id="workflow-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                How do you optimize for AI search?
              </h2>
              <p className="mt-4 max-w-3xl text-pretty text-base leading-7 text-zinc-400">
                Work from technical access to consistent entity facts,
                answer-ready content, citable evidence, off-site corroboration,
                and then measurement.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stages.map(({ title, description }, index) => (
                  <Card key={title} className="bg-[#0a0d0b]">
                    <CardHeader>
                      <span className="font-mono text-xs text-emerald-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <CardTitle className="mt-3 text-balance">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-pretty pt-0 text-sm leading-6 text-zinc-400">
                      {description}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section aria-labelledby="thirty-day-heading">
              <p className="eyebrow">A bounded first cycle</p>
              <h2
                id="thirty-day-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                What is a practical 30-day AI search optimization plan?
              </h2>
              <p className="mt-4 max-w-3xl text-pretty text-base leading-7 text-zinc-400">
                A practical 30-day plan moves from baselining and technical
                access through entity, intent, evidence, distribution, and
                review.
              </p>
              <div className="mt-8 overflow-hidden rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                {[
                  ["Days 1-3", "Baseline", "Freeze buyer questions, providers, locale, model details, and scoring rules. Save answer and citation evidence."],
                  ["Days 4-7", "Technical access", "Verify indexability, canonical URLs, sitemaps, internal links, rendered content, robots.txt, and CDN crawler controls."],
                  ["Days 8-14", "Entity and intent", "Normalize product facts and build or improve pages for the highest-value discovery and comparison questions."],
                  ["Days 15-21", "Evidence", "Add original examples, methods, source links, dates, limitations, and structured data that matches visible content."],
                  ["Days 22-27", "Distribution", "Correct important profiles and pursue accurate inclusion in sources and directories models already retrieve."],
                  ["Days 28-30", "Review", "Check indexing and crawler activity. Rerun only after meaningful changes have had time to become retrievable."],
                ].map(([period, title, detail]) => (
                  <div
                    className="grid gap-2 border-b border-white/[0.07] bg-[#0b0e0c] p-5 last:border-b-0 sm:grid-cols-[7rem_10rem_1fr] sm:gap-5"
                    key={period}
                  >
                    <p className="font-mono text-xs text-emerald-300">{period}</p>
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="text-pretty text-sm leading-6 text-zinc-400">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-5 max-w-3xl text-pretty text-sm leading-6 text-zinc-400">
                When original research is ready to distribute, a creator tool
                such as{" "}
                <a
                  className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                  href="https://climbx.so/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ClimbX
                </a>{" "}
                can help turn proven topics into posts written in the
                creator&apos;s voice and maintain a consistent publishing rhythm
                on X. Social distribution can earn attention and independent
                discussion, but it does not replace an indexable source page.
              </p>
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
              {[
                {
                  label: "SEO",
                  title: "How does SEO support AI search optimization?",
                  body: "SEO supports AI search optimization by making public pages crawlable, indexable, useful, internally linked, and competitive in search systems that ground AI answers.",
                  href: "/llm-seo",
                  link: "Read the LLM SEO guide",
                },
                {
                  label: "AEO",
                  title: "How does AEO support AI search optimization?",
                  body: "AEO supports AI search optimization by mapping pages to real questions and making definitions, facts, comparisons, and caveats easy to extract without losing context.",
                  href: "/answer-engine-optimization",
                  link: "Read the AEO guide",
                },
                {
                  label: "GEO",
                  title: "How does GEO support AI search optimization?",
                  body: "GEO supports AI search optimization with original evidence, consistent entities, and credible third-party sources an answer can justify citing.",
                  href: "/generative-engine-optimization",
                  link: "Read the GEO guide",
                },
              ].map((item) => (
                <section
                  className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8"
                  key={item.label}
                >
                  <p className="eyebrow">{item.label}</p>
                  <h2 className="mt-4 text-balance text-2xl font-semibold text-white">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-pretty text-sm leading-6 text-zinc-400">
                    {item.body}
                  </p>
                  <Button asChild variant="link" className="mt-4">
                    <Link href={item.href}>{item.link}</Link>
                  </Button>
                </section>
              ))}
            </section>

            <section aria-labelledby="sources-heading">
              <p className="eyebrow">Primary guidance</p>
              <h2
                id="sources-heading"
                className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                Verify the principles at the source
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {sources.map((source) => (
                  <a
                    className="flex min-h-20 items-center justify-between gap-5 rounded-2xl bg-white/[0.025] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] hover:bg-white/[0.04]"
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={source.href}
                  >
                    <span>
                      <span className="block font-semibold text-white">
                        {source.label}
                      </span>
                      <span className="mt-1 block text-pretty text-sm leading-6 text-zinc-400">
                        {source.detail}
                      </span>
                    </span>
                    <ExternalLink
                      aria-hidden="true"
                      className="size-4 shrink-0 text-emerald-300"
                    />
                  </a>
                ))}
              </div>
            </section>

            <section aria-labelledby="optimization-faq-heading">
              <p className="eyebrow">AI search optimization questions</p>
              <h2
                id="optimization-faq-heading"
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
              <p className="mt-5 text-sm text-zinc-800">
                Comparing tool categories first? Read the{" "}
                <Link className="font-semibold underline" href="/ai-seo-tools">
                  AI SEO tools guide
                </Link>
                .
              </p>
            </section>
          </div>
        </article>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
