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

const pageUrl = absoluteUrl("/answer-engine-optimization");

export const metadata: Metadata = {
  title: "Answer Engine Optimization (AEO): Practical Guide",
  description:
    "What answer engine optimization is, how AEO differs from SEO and GEO, the practices that earn citations in AI answers, and how to measure the results.",
  keywords: [
    "answer engine optimization",
    "AEO",
    "AEO tool",
    "answer engine optimization tool",
    "AEO audit",
    "AI answer optimization",
    "AI citations",
    "AI visibility",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Answer Engine Optimization (AEO): A Practical Guide",
    description:
      "Earn a place in AI-generated answers: question-mapped content, extractable facts, credible sources, and repeatable measurement.",
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
    title: "A Practical Guide to Answer Engine Optimization",
    description:
      "How AEO differs from SEO and GEO, which practices earn citations, and how to measure whether any of it worked.",
    images: [SOCIAL_IMAGE],
  },
};

const practices = [
  {
    title: "Map content to real questions",
    description:
      "List the questions buyers actually ask at each stage—category discovery, comparison, pricing, implementation—and give each important question a page or section that answers it directly.",
  },
  {
    title: "Lead with the answer",
    description:
      "Put a clear, self-contained answer in the first paragraph, then expand with context. Answer systems extract passages; buried conclusions are harder to select and cite.",
  },
  {
    title: "Keep facts extractable",
    description:
      "State names, numbers, definitions, and comparisons in plain prose and structured markup such as FAQ and product schema. Ambiguous claims and vague copy give engines nothing to quote.",
  },
  {
    title: "Hold entity facts consistent",
    description:
      "One company name, one canonical domain, one category description, and matching key facts across your site, profiles, and directories reduce retrieval confusion.",
  },
  {
    title: "Publish citable evidence",
    description:
      "Original data, transparent methodology, worked examples, and maintained reference pages are the material answer engines prefer to cite over marketing claims.",
  },
  {
    title: "Earn third-party corroboration",
    description:
      "Independent reviews, directories, expert references, and category roundups help engines associate your brand with the category even when your own site is not cited.",
  },
] as const;

const faqs = [
  {
    question: "What is answer engine optimization (AEO)?",
    answer:
      "Answer engine optimization is the practice of making your content and brand easier for answer-generating systems—AI assistants, AI-augmented search results, and voice assistants—to select, summarize, and cite when they answer a user's question. Where classic SEO optimizes for a ranked list of links, AEO optimizes for inclusion in the single composed answer.",
  },
  {
    question: "How is AEO different from SEO and GEO?",
    answer:
      "SEO targets rankings and clicks in traditional search results. GEO (generative engine optimization) covers the broader work of making a brand easier for generative AI systems to understand, retrieve, and cite. AEO is the answer-focused slice of that work: mapping content to real questions and structuring pages so an engine can lift a correct, attributable answer. The three overlap heavily and share the same foundation of crawlable, useful, well-linked content.",
  },
  {
    question: "Do I need an AEO tool?",
    answer:
      "You need a way to measure whether answers include you—otherwise AEO is guesswork. Options range from continuous monitoring subscriptions to prepaid benchmarks. A benchmark with a frozen question set, like 100 Questions, shows where you stand across OpenAI, Claude, Gemini, and Grok for a fixed price, and a rerun after your changes shows directional movement without a subscription.",
  },
  {
    question: "How long does AEO take to show results?",
    answer:
      "There is no guaranteed timeline. Models refresh their indexes and knowledge at different rates, and different providers select different sources. A practical approach is to benchmark first, ship substantive content and entity fixes, wait for recrawling and index refresh, then rerun the same question set and compare the evidence.",
  },
  {
    question: "Does schema markup guarantee inclusion in AI answers?",
    answer:
      "No. Structured data such as FAQ, product, and organization schema makes facts easier to parse and associate with your entity, which helps retrieval. But no markup guarantees that a generated answer will include or cite you—which is why measurement belongs in every AEO loop.",
  },
] as const;

export default function AeoGuidePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: "Answer Engine Optimization (AEO): A Practical Guide",
        description:
          "What AEO is, how it differs from SEO and GEO, the practices that earn citations in AI answers, and how to measure the results.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: SITE_UPDATED_AT,
        dateModified: SITE_UPDATED_AT,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": `${absoluteUrl()}#organization` },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        about: [
          "Answer engine optimization",
          "AI answers",
          "AI citations",
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
            name: "Answer engine optimization guide",
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
                <span className="text-zinc-300">Answer engine optimization</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                AEO guide
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Answer engine optimization: earn a place in the answer
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                Answer engine optimization, or AEO, is the work of making your
                content easy for answer-generating systems to select, summarize,
                and cite. When assistants compose one answer instead of listing
                ten links, being rankable stops being enough—you have to be
                quotable.
              </p>
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">Why AEO exists</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
                  One composed answer replaces ten blue links
                </h2>
              </div>
              <div className="space-y-5 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  A growing share of buyer research now ends inside a generated
                  answer: an AI assistant, an AI-augmented results page, or a
                  voice response. Those systems retrieve a handful of sources,
                  synthesize them, and mention a handful of brands. If your
                  pages are not selected, the user may never see a link to
                  click.
                </p>
                <p>
                  AEO adapts your content strategy to that selection step. It
                  overlaps heavily with{" "}
                  <Link
                    className="text-emerald-300 hover:text-emerald-200"
                    href="/generative-engine-optimization"
                  >
                    generative engine optimization
                  </Link>{" "}
                  and rests on the same foundation as SEO—crawlable pages,
                  useful content, earned authority. The difference is the unit
                  of success: inclusion and citation in an answer, measured as{" "}
                  <Link
                    className="text-emerald-300 hover:text-emerald-200"
                    href="/ai-visibility"
                  >
                    AI visibility
                  </Link>
                  , rather than a ranking position.
                </p>
              </div>
            </section>

            <section aria-labelledby="aeo-comparison-heading">
              <p className="eyebrow">Three overlapping disciplines</p>
              <h2
                id="aeo-comparison-heading"
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                AEO vs. SEO vs. GEO
              </h2>
              <div className="mt-8 grid gap-px overflow-hidden rounded-[24px] bg-white/[0.08] md:grid-cols-3">
                <div className="bg-[#0b0e0c] p-6 sm:p-8">
                  <h3 className="font-semibold text-white">SEO</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Optimizes for ranked results in traditional search. Success
                    is measured in rankings, impressions, clicks, and
                    conversions from result pages.
                  </p>
                </div>
                <div className="bg-[#0b0e0c] p-6 sm:p-8">
                  <h3 className="font-semibold text-white">AEO</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Optimizes for the composed answer. Success is inclusion:
                    your brand named, your facts used, your domain cited when a
                    system answers a buyer&apos;s question.
                  </p>
                </div>
                <div className="bg-[#0b0e0c] p-6 sm:p-8">
                  <h3 className="font-semibold text-white">GEO</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    The broader program covering entity clarity, source
                    authority, technical access, and measurement across
                    generative engines. AEO is its answer-focused core.
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                Treat the labels loosely: the practices below serve all three.
                What matters is doing the work once and measuring the outcome in
                the answers themselves.
              </p>
            </section>

            <section aria-labelledby="aeo-practices-heading">
              <p className="eyebrow">Six practices</p>
              <h2
                id="aeo-practices-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                The work that makes answers include you
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

            <section aria-labelledby="aeo-tools-heading">
              <p className="eyebrow">Choosing an AEO tool</p>
              <h2
                id="aeo-tools-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Monitor continuously, or benchmark when it matters
              </h2>
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                  <h3 className="font-semibold text-white">
                    Monitoring subscriptions
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Track prompts on a schedule and alert on changes. Useful for
                    large brands with dedicated owners, ongoing budgets, and
                    dashboards someone actually reviews. The trade-off is
                    recurring cost and a stream of data that still needs
                    interpretation.
                  </p>
                </div>
                <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                  <h3 className="font-semibold text-white">
                    Prepaid benchmarks
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Freeze one question set, run it across providers, and get a
                    scored, evidence-linked report with recommended actions.
                    Useful when you need a defensible baseline, a client
                    deliverable, or a before-and-after comparison around
                    substantive changes—without a subscription.
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                100 Questions is the second kind: one prepaid credit runs a
                frozen 25-question set across OpenAI, Claude, Gemini, and Grok
                with shared web grounding, then turns the stored answers and
                citations into a prioritized action plan. See{" "}
                <Link
                  className="text-emerald-300 hover:text-emerald-200"
                  href="/methodology"
                >
                  the methodology
                </Link>{" "}
                for definitions and limits, or compare six current platforms in
                the{" "}
                <Link
                  className="text-emerald-300 hover:text-emerald-200"
                  href="/answer-engine-optimization-tools"
                >
                  answer engine optimization tools guide
                </Link>
                .
              </p>
            </section>

            <section aria-labelledby="aeo-faq-heading">
              <p className="eyebrow">AEO questions</p>
              <h2
                id="aeo-faq-heading"
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
                    Measure before you optimize
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    Find out which answers already include you—and which
                    don&apos;t.
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
