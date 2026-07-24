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

const pageUrl = absoluteUrl("/llm-seo");

export const metadata: Metadata = {
  title: "LLM SEO: How to Show Up When Language Models Answer",
  description:
    "LLM SEO is the work of earning mentions and citations in AI answers. How models choose brands, what ChatGPT SEO involves, and how to measure progress.",
  keywords: [
    "LLM SEO",
    "LLM SEO tool",
    "ChatGPT SEO",
    "AI search optimization",
    "LLM optimization",
    "AI visibility",
    "LLM visibility",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "LLM SEO: How to Show Up When Language Models Answer",
    description:
      "How LLMs choose which brands to mention, what ChatGPT SEO involves in practice, and how to measure whether it's working.",
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
    title: "LLM SEO: How to Show Up When Language Models Answer",
    description:
      "The two channels that put brands into AI answers, practical LLM SEO work, and honest measurement.",
    images: [SOCIAL_IMAGE],
  },
};

const practices = [
  {
    title: "Open the door to AI crawlers",
    description:
      "Check robots.txt and your CDN's bot settings for blocks on crawlers like GPTBot, OAI-SearchBot, ClaudeBot, and PerplexityBot. Many sites block them by default without deciding to.",
  },
  {
    title: "Publish llms.txt and keep it honest",
    description:
      "A concise llms.txt gives models a canonical summary of what you do, your key pages, and your facts. Treat it like your most compressed sales page, maintained as carefully as your homepage.",
  },
  {
    title: "Keep entity facts identical everywhere",
    description:
      "Language models resolve brands as entities. One name, one domain, one category description, and matching facts across your site, directories, and profiles reduce confusion and misattribution.",
  },
  {
    title: "Be present where models already look",
    description:
      "Grounded answers repeatedly cite the same comparison sites, directories, reviews, and category roundups. Earning accurate inclusion in those recurring sources often moves visibility faster than another blog post.",
  },
  {
    title: "Date your facts and keep them fresh",
    description:
      "Retrieval favors pages that look current and specific. Dated pricing, changelogs, and maintained comparison pages beat timeless marketing copy that a model cannot safely quote.",
  },
  {
    title: "Measure in the answers themselves",
    description:
      "Rankings do not prove inclusion. Benchmark a frozen question set across providers, ship changes, and rerun the same test to see whether mentions and citations actually moved.",
  },
] as const;

const faqs = [
  {
    question: "What is LLM SEO?",
    answer:
      "LLM SEO is the practice of improving how large language models—the systems behind ChatGPT, Claude, Gemini, and Grok—mention, describe, and cite your brand when they answer relevant questions. It spans two channels: what models absorbed during training, and what they retrieve from the live web when a question triggers search. The retrieval channel responds to your work in weeks; the training channel moves slowly, over model release cycles.",
  },
  {
    question: "How is LLM SEO different from traditional SEO?",
    answer:
      "Traditional SEO earns a position on a results page; LLM SEO earns a place inside a composed answer. The foundations overlap almost completely—crawlable pages, clear entities, useful content, earned authority—but success is measured differently: brand mentions, answer prominence, and citations rather than rankings and clicks. Related frameworks: answer engine optimization (AEO) for the answer-focused work, and generative engine optimization (GEO) for the broader program.",
  },
  {
    question: "What does ChatGPT SEO involve specifically?",
    answer:
      "Three practical things. First, crawler access: OpenAI uses separate bots for training (GPTBot), search (OAI-SearchBot), and user-triggered fetches (ChatGPT-User), and blocking them removes you from the corresponding surfaces. Second, index coverage: ChatGPT's web search has drawn on partner search indexes alongside OpenAI's own crawling, so clean indexing in both Google and Bing keeps you reachable. Third, citable content: direct answers, dated facts, and third-party corroboration give the model something safe to quote and attribute.",
  },
  {
    question: "Does blocking GPTBot hurt my AI visibility?",
    answer:
      "Blocking training crawlers keeps your content out of future training corpora, which reduces the chance models learn your brand organically. Blocking search and fetch bots is more immediately costly: it can remove you from web-grounded answers entirely. Some publishers accept that trade to protect content; for most brands that want to be discovered, blocking AI crawlers works against the goal.",
  },
  {
    question: "How do I measure LLM SEO results?",
    answer:
      "Freeze a set of realistic buyer questions, run them across multiple providers with web grounding, and record mentions, prominence, competitor share of voice, and citations with stored evidence. Repeat the identical test after substantive changes and compare. A 100 Questions benchmark automates exactly this loop across OpenAI, Claude, Gemini, and Grok for a fixed prepaid price.",
  },
] as const;

const opportunitySnapshot = [
  ["LLM SEO", "1,500", "13", "Existing guide; fastest editorial target"],
  ["ChatGPT SEO tool", "900", "1", "Commercial landing-page opportunity"],
  [
    "Answer engine optimization tools",
    "800",
    "10",
    "Dedicated comparison opportunity",
  ],
  ["AI search optimization", "3,400", "50", "Long-term authority page"],
  [
    "Generative engine optimization",
    "7,900",
    "59",
    "High-volume, high-authority category",
  ],
] as const;

export default function LlmSeoGuidePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: "LLM SEO: How to Show Up When Language Models Answer",
        description:
          "How LLMs choose which brands to mention, what ChatGPT SEO involves in practice, and how to measure whether it's working.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: SITE_UPDATED_AT,
        dateModified: SITE_UPDATED_AT,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": `${absoluteUrl()}#organization` },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        about: [
          "LLM SEO",
          "ChatGPT SEO",
          "AI search optimization",
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
            name: "LLM SEO guide",
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
                <span className="text-zinc-300">LLM SEO</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                LLM SEO guide
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                LLM SEO: how to show up when language models answer
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                LLM SEO is the work of earning mentions and citations from
                large language models—the systems behind ChatGPT, Claude,
                Gemini, and Grok. It is not a bag of tricks. It is knowing the
                two channels that put brands into answers, doing the work each
                channel rewards, and measuring the answers instead of guessing.
              </p>
              <p className="mt-5 font-mono text-xs text-zinc-500">
                Reviewed July 24, 2026
              </p>
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section aria-labelledby="channels-heading">
              <p className="eyebrow">Two channels into an answer</p>
              <h2
                id="channels-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Training knowledge and live retrieval work differently
              </h2>
              <div className="mt-8 grid gap-px overflow-hidden rounded-[24px] bg-white/[0.08] md:grid-cols-2">
                <div className="bg-[#0b0e0c] p-6 sm:p-8">
                  <h3 className="font-semibold text-white">
                    Training knowledge
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    What the model absorbed about your brand before its
                    training cutoff: your site, third-party coverage,
                    directories, discussions. It changes slowly—over model
                    release cycles—and rewards years of consistent entity
                    signals and independent corroboration.
                  </p>
                </div>
                <div className="bg-[#0b0e0c] p-6 sm:p-8">
                  <h3 className="font-semibold text-white">Live retrieval</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    What the model fetches from the web while answering. This
                    channel responds to your work in days to weeks: crawlable
                    pages, direct answers, clean indexing, and presence in the
                    sources models repeatedly cite all raise your odds of
                    selection.
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                Most practical LLM SEO effort belongs on the retrieval channel,
                because you can influence it now and verify the effect. The
                same work—clear entities, citable evidence, earned
                coverage—compounds into the training channel over time. The{" "}
                <Link
                  className="text-emerald-300 hover:text-emerald-200"
                  href="/generative-engine-optimization"
                >
                  GEO guide
                </Link>{" "}
                covers the full program;{" "}
                <Link
                  className="text-emerald-300 hover:text-emerald-200"
                  href="/answer-engine-optimization"
                >
                  the AEO guide
                </Link>{" "}
                covers answer-ready content structure.
              </p>
            </section>

            <section aria-labelledby="opportunity-heading">
              <p className="eyebrow">July 2026 search opportunity snapshot</p>
              <h2
                id="opportunity-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                The quickest opportunities are narrower than the biggest terms
              </h2>
              <p className="mt-4 max-w-3xl text-pretty text-sm leading-6 text-zinc-400">
                Current U.S. Ahrefs estimates show why a new site should not
                treat every AI-search keyword equally. Lower-difficulty,
                intent-specific pages create a more realistic entry point while
                broader guides build authority over time.
              </p>
              <div className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <table className="min-w-[720px] w-full text-left text-sm">
                  <thead className="bg-white/[0.045] text-xs uppercase tracking-[0.12em] text-zinc-400">
                    <tr>
                      <th className="px-5 py-4 font-medium">Query</th>
                      <th className="px-5 py-4 text-right font-medium">
                        US volume
                      </th>
                      <th className="px-5 py-4 text-right font-medium">KD</th>
                      <th className="px-5 py-4 font-medium">Practical role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.07]">
                    {opportunitySnapshot.map(
                      ([query, volume, difficulty, role]) => (
                        <tr key={query} className="bg-[#0b0e0c]">
                          <th className="px-5 py-5 font-semibold text-zinc-100">
                            {query}
                          </th>
                          <td className="px-5 py-5 text-right font-mono tabular-nums text-zinc-300">
                            {volume}
                          </td>
                          <td className="px-5 py-5 text-right font-mono tabular-nums text-zinc-300">
                            {difficulty}
                          </td>
                          <td className="px-5 py-5 text-zinc-400">{role}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 max-w-3xl text-pretty text-xs leading-5 text-zinc-500">
                Source: Ahrefs Keywords Explorer, United States, July 24, 2026.
                Search volume and keyword difficulty are estimates and change
                over time.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                <Link
                  href="/chatgpt-seo-tool"
                  className="text-emerald-300 hover:text-emerald-200"
                >
                  See the ChatGPT SEO tool page
                </Link>
                <Link
                  href="/answer-engine-optimization-tools"
                  className="text-emerald-300 hover:text-emerald-200"
                >
                  Compare AEO tools
                </Link>
              </div>
            </section>

            <section aria-labelledby="llm-practices-heading">
              <p className="eyebrow">Six practices</p>
              <h2
                id="llm-practices-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                The LLM SEO work that pays off
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {practices.map(({ title, description }, index) => (
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

            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">LLM SEO tools</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
                  Pick the measurement that fits the job
                </h2>
              </div>
              <div className="space-y-5 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  LLM SEO tooling falls into a few honest categories: crawler
                  analytics that show which AI bots hit your site, monitoring
                  subscriptions that track prompts daily, large prompt
                  databases, and fixed benchmarks. See the full{" "}
                  <Link
                    className="text-emerald-300 hover:text-emerald-200"
                    href="/ai-seo-tools"
                  >
                    AI SEO tools comparison
                  </Link>
                  , the focused{" "}
                  <Link
                    className="text-emerald-300 hover:text-emerald-200"
                    href="/answer-engine-optimization-tools"
                  >
                    AEO tools comparison
                  </Link>
                  , the{" "}
                  <Link
                    className="text-emerald-300 hover:text-emerald-200"
                    href="/chatgpt-seo-tool"
                  >
                    ChatGPT SEO tool guide
                  </Link>{" "}
                  or our{" "}
                  <Link
                    className="text-emerald-300 hover:text-emerald-200"
                    href="/peec-ai-alternative"
                  >
                    comparison with Peec AI
                  </Link>
                  .
                </p>
                <p>
                  100 Questions is the benchmark kind: one credit sends 25
                  frozen questions to OpenAI, Claude, Gemini, and Grok with
                  required web grounding, scores visibility, prominence, share
                  of voice, and citations against eligible answers only, and
                  returns five evidence-linked actions. Run it before your LLM
                  SEO work for a baseline, and again after to prove movement—
                  start with the{" "}
                  <Link
                    className="text-emerald-300 hover:text-emerald-200"
                    href="/ai-visibility-checker"
                  >
                    free technical checker
                  </Link>{" "}
                  if you want a rough read first.
                </p>
              </div>
            </section>

            <section aria-labelledby="llm-faq-heading">
              <p className="eyebrow">LLM SEO questions</p>
              <h2
                id="llm-faq-heading"
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                Frequently asked questions
              </h2>
              <div className="mt-8 space-y-4">
                {faqs.map(({ question, answer }) => (
                  <details
                    key={question}
                    className="group rounded-[20px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <summary className="cursor-pointer list-none font-semibold text-white [&::-webkit-details-marker]:hidden">
                      {question}
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
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
                    Baseline first
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    See what the models say before you try to change it.
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
