import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AiReadinessChecker } from "@/components/ai-readiness-checker";
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

const pageUrl = absoluteUrl("/ai-visibility-checker");

export const metadata: Metadata = {
  title: "Free AI Visibility Checker: Test Technical Readiness",
  description:
    "Run a free AI visibility readiness check for indexability, AI crawlers, schema, page signals, sitemaps, and llms.txt. No account required.",
  keywords: [
    "AI visibility checker",
    "AI visibility check",
    "AI visibility score",
    "check AI visibility",
    "ChatGPT brand visibility",
    "AI brand visibility check",
    "AI visibility audit",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free AI Visibility Checker: Test Technical Readiness",
    description:
      "Check whether a public website is technically ready for AI search discovery, then learn how to measure actual brand visibility.",
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
    title: "Free AI Visibility Checker: Test Technical Readiness",
    description:
      "Check indexability, AI crawler access, schema, page signals, sitemaps, and llms.txt without creating an account.",
    images: [SOCIAL_IMAGE],
  },
};

const manualSteps = [
  {
    title: "Write ten neutral buyer questions",
    description:
      "Phrase them the way a buyer who has never heard of you would: “best X for Y,” “how do I solve Z.” Do not include your brand name—discovery questions test whether AI finds you on merit.",
  },
  {
    title: "Ask them in fresh sessions",
    description:
      "Use a new chat for every question, with web search enabled where the assistant supports it. Repeat the same questions across the assistants your buyers actually use.",
  },
  {
    title: "Log mentions, position, and sources",
    description:
      "For each answer record whether you were named, whether you led the answer or trailed it, which competitors appeared, and which domains were cited.",
  },
  {
    title: "Ask a direct diagnostic question",
    description:
      "Ask each assistant what it knows about your brand by name. Wrong facts, stale descriptions, or confusion with a similarly named company are findings in themselves.",
  },
  {
    title: "Total it into a rough score",
    description:
      "Mentions divided by answers gives a crude visibility rate. Note it with the date—models change, so a check without a timestamp is unrepeatable.",
  },
] as const;

const limitations = [
  {
    title: "Personalization and memory",
    description:
      "Consumer chat apps adapt to your history and account. Your own sessions are biased toward knowing you—a stranger's answers can look very different.",
  },
  {
    title: "Sample size",
    description:
      "A handful of prompts in one assistant is an anecdote. Small samples swing hard, and one lucky mention can hide a systematic gap.",
  },
  {
    title: "No stored evidence",
    description:
      "Without logged answers and citations you cannot show a client or a boss why a score moved—or prove it moved at all.",
  },
  {
    title: "Moving targets",
    description:
      "Providers update models and search behavior continuously. Checks are only comparable when the questions are frozen and runs are timestamped.",
  },
] as const;

const metrics = [
  ["Visibility", "How often your brand appears in neutral discovery answers."],
  [
    "Prominence",
    "Whether you lead the answer, make a shortlist, or appear incidentally.",
  ],
  [
    "Share of voice",
    "Your answer-level mentions compared with selected competitors.",
  ],
  [
    "Citations",
    "How often eligible answers cite your claimed domain as a source.",
  ],
] as const;

const faqs = [
  {
    question: "Does the free checker ask ChatGPT about my brand?",
    answer:
      "No. The free check is a technical preflight: it inspects public website signals that affect whether search and AI systems can retrieve and understand a site. It does not spend model tokens or claim to measure current brand mentions. Actual visibility requires asking a controlled question set across providers and storing the resulting answers and citations.",
  },
  {
    question: "How can I check my brand's AI visibility for free?",
    answer:
      "Write ten neutral buyer questions that do not name your brand, ask each in a fresh chat session across the assistants your buyers use, and log whether you were mentioned, who appeared instead, and which sources were cited. Then ask each assistant directly what it knows about your brand. This manual check is free and worth doing—but it is a small, personalized, unrepeatable sample, so treat the result as a hint rather than a measurement.",
  },
  {
    question: "What is an AI visibility score?",
    answer:
      "An AI visibility score summarizes how often a brand appears when AI systems answer relevant questions. A useful score states its denominator—for example, brand mentions across eligible web-grounded answers to a frozen question set—and keeps visibility, prominence, competitor share of voice, and citations separate rather than blending them into one unexplained number.",
  },
  {
    question: "Why do different AI models give different answers about my brand?",
    answer:
      "Each provider uses its own models, search integration, source ranking, and prompt handling, so the same question can surface different brands and citations. That spread is itself useful information—it shows where visibility is broad versus dependent on a single provider. It is also why checking one assistant is not enough.",
  },
  {
    question: "Does an API-based check match what ChatGPT shows users?",
    answer:
      "Not exactly, and honest tools say so. Consumer apps like ChatGPT add personalization, memory, and their own routing on top of the underlying models. An API-grounded benchmark trades that away for control: identical questions, shared web grounding, stored evidence, and repeatability. Results are directional snapshots of model behavior, not replicas of any one user's chat.",
  },
  {
    question: "How often should I re-check AI visibility?",
    answer:
      "Re-check after substantive changes—new comparison pages, entity cleanups, earned coverage—rather than on a fixed calendar. Give providers time to recrawl and refresh their indexes, then rerun the same frozen question set and compare against the baseline.",
  },
] as const;

export default function AiVisibilityCheckerPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: "Free AI Visibility Checker: Test Technical Readiness",
        description:
          "A free technical readiness checker for indexability, AI crawler access, structured data, page signals, sitemap discovery, and llms.txt.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: SITE_UPDATED_AT,
        dateModified: SITE_UPDATED_AT,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": `${absoluteUrl()}#organization` },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        about: [
          "AI visibility checker",
          "AI visibility score",
          "AI brand visibility",
          "AI citations",
        ],
        inLanguage: "en-US",
      },
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#checker`,
        name: "100 Questions AI Visibility Readiness Checker",
        url: pageUrl,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires a modern web browser",
        description:
          "A free technical preflight for public website signals used in AI search discovery.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        provider: { "@id": `${absoluteUrl()}#organization` },
        featureList: [
          "Indexability check",
          "AI crawler robots check",
          "Metadata and H1 check",
          "Canonical URL check",
          "JSON-LD structured data check",
          "Question-oriented content check",
          "XML sitemap discovery",
          "llms.txt discovery",
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
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "AI visibility checker",
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
                <span className="text-zinc-300">AI visibility checker</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                AI visibility checker
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Check your site&apos;s AI visibility readiness in seconds
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                Run a free technical preflight for indexability, AI crawler
                access, schema, core page signals, sitemap discovery, and
                llms.txt. Then use the manual check below to test what AI
                assistants actually say.
              </p>
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <AiReadinessChecker />

            <section aria-labelledby="manual-check-heading">
              <p className="eyebrow">The actual-answer check</p>
              <h2
                id="manual-check-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Technical readiness is not the same as being recommended
              </h2>
              <p className="mt-4 max-w-3xl text-pretty text-sm leading-6 text-zinc-400">
                A technically perfect site can still be absent from AI answers.
                Use this five-step manual check to sample real mentions while
                keeping its limitations in view.
              </p>
              <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {manualSteps.map(({ title, description }, index) => (
                  <li
                    key={title}
                    className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <span className="font-mono text-xs text-emerald-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 font-semibold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {description}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="limitations-heading">
              <p className="eyebrow">Where manual checks break</p>
              <h2
                id="limitations-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Four reasons the quick check misleads
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {limitations.map(({ title, description }) => (
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

            <section aria-labelledby="metrics-heading">
              <p className="eyebrow">What a rigorous check measures</p>
              <h2
                id="metrics-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Four separate metrics beat one mystery score
              </h2>
              <div className="mt-8 grid gap-px overflow-hidden rounded-[24px] bg-white/[0.08] sm:grid-cols-2">
                {metrics.map(([title, description], index) => (
                  <article key={title} className="bg-[#0b0e0c] p-6 sm:p-7">
                    <span className="font-mono text-xs tabular-nums text-emerald-300">
                      0{index + 1}
                    </span>
                    <h3 className="mt-5 font-semibold text-zinc-100">{title}</h3>
                    <p className="mt-2 text-pretty text-sm leading-6 text-zinc-400">
                      {description}
                    </p>
                  </article>
                ))}
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                Coverage and sentiment complete the picture: how many planned
                answers actually returned with valid web grounding, and how the
                models talk about you when you do appear. The{" "}
                <Link
                  className="text-emerald-300 hover:text-emerald-200"
                  href="/ai-visibility"
                >
                  AI visibility guide
                </Link>{" "}
                defines each metric in depth.
              </p>
            </section>

            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">The structured version</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
                  What the $9 audit automates
                </h2>
              </div>
              <div className="space-y-5 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  100 Questions runs the same check with controls a manual pass
                  cannot match: a frozen set of 25 questions—20 neutral
                  discovery questions plus 5 direct diagnostics—sent identically
                  to OpenAI, Claude, Gemini, and Grok with shared web-search
                  grounding, for 100 planned answers per run.
                </p>
                <p>
                  Answers without valid web sources are excluded from score
                  denominators instead of quietly inflating them, every metric
                  links back to stored answers and citations, and a rerun
                  reuses the identical questions so before-and-after
                  comparisons mean something. The output is a client-ready
                  report with five evidence-linked actions—see the{" "}
                  <Link
                    className="text-emerald-300 hover:text-emerald-200"
                    href="/sample-report"
                  >
                    complete sample report
                  </Link>
                  .
                </p>
              </div>
            </section>

            <section aria-labelledby="checker-faq-heading">
              <p className="eyebrow">Checking questions</p>
              <h2
                id="checker-faq-heading"
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
                    Run the real check
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    100 answers, four providers, stored evidence—one $9 run.
                  </h2>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-zinc-950 text-white hover:bg-zinc-800"
                >
                  <Link href="/auth/sign-up">
                    Check my AI visibility <ArrowRight />
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
