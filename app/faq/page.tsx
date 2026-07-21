import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const faqUrl = absoluteUrl("/faq");

export const metadata: Metadata = {
  title: "AI Visibility Benchmark FAQ",
  description:
    "Answers about 100 Questions pricing, privacy, AI providers, web grounding, scoring, coverage, and how to interpret an AI visibility benchmark.",
  keywords: [
    "AI visibility FAQ",
    "AI brand monitoring",
    "GEO benchmark questions",
    "AI answer citations",
  ],
  alternates: { canonical: faqUrl },
  openGraph: {
    title: "AI Visibility Benchmark FAQ · 100 Questions",
    description:
      "Plain-language answers about providers, questions, sources, scoring, privacy, and benchmark limitations.",
    url: faqUrl,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Visibility Benchmark FAQ · 100 Questions",
    description:
      "What 100 Questions measures, how it scores, and what a run can and cannot tell you.",
  },
};

const faqs = [
  {
    id: "what-is-ai-visibility",
    question: "What does an AI visibility benchmark measure?",
    answer:
      "It measures whether web-grounded AI answers mention a target brand, how prominently it appears, how its answer-level mentions compare with selected competitors, and whether answers cite the submitted domain. 100 Questions presents those signals with their denominators and source evidence.",
  },
  {
    id: "which-providers",
    question: "Which AI providers are included?",
    answer:
      "A benchmark sends the same frozen 25-question set to OpenAI, Anthropic, Google, and xAI through Vercel AI Gateway. The exact model IDs are configurable and are frozen with each run so the result records what was tested.",
  },
  {
    id: "why-100-answers",
    question: "Why is it called 100 Questions if each run uses 25 questions?",
    answer:
      "Each run uses 25 unique questions and asks all 25 across four providers. That creates 100 planned provider answers: 25 × 4. The shared set makes the provider comparison more consistent than asking a different set to each model.",
  },
  {
    id: "question-types",
    question: "What is the difference between discovery and diagnostic questions?",
    answer:
      "Twenty discovery questions ask neutral category or use-case questions without naming the target, its aliases, or its domain. Five diagnostic questions name the target to examine trust, comparisons, pricing, support, implementation, and factual knowledge.",
  },
  {
    id: "score-eligibility",
    question: "What makes an answer eligible for scoring?",
    answer:
      "The provider call must succeed and return valid HTTP or HTTPS web sources. Missing-source, unsupported-search, and failed results do not enter eligible-score denominators. They remain visible in coverage so a missing answer cannot silently improve or weaken a metric.",
  },
  {
    id: "consumer-chat",
    question: "Are these results identical to ChatGPT, Claude, Gemini, or Grok apps?",
    answer:
      "No. This is an API-grounded benchmark. Consumer chat products can use different prompts, personalization, routing, models, and search behavior. A run should be treated as a time-stamped directional comparison, not a prediction of every consumer session.",
  },
  {
    id: "statistical-ranking",
    question: "Is the visibility score a statistically representative market ranking?",
    answer:
      "No. The generated question set is not claimed to be a random or representative sample. With only 25 questions, a simple worst-case interval is roughly plus or minus 20 percentage points. The benchmark is designed to expose directional evidence and gaps, not manufacture false precision.",
  },
  {
    id: "private-retention",
    question: "Are benchmark runs private, and how long are answers retained?",
    answer:
      "Runs are private to the authenticated owner. The default answer-retention window is 30 days. The product retains normalized evidence and the versions needed to explain results, rather than complete raw provider payloads.",
  },
  {
    id: "price-subscription",
    question: "Is 100 Questions a subscription?",
    answer:
      "No. The first benchmark is $29, three benchmarks are $99, and ten are $249. After the introductory purchase, a single benchmark is $39. Every credit buys the same complete benchmark, remains valid for 12 months, and is purchased through Stripe-hosted Checkout. Taxes may apply.",
  },
  {
    id: "required-input",
    question: "What information is needed to run a benchmark?",
    answer:
      "You provide a subject name, canonical domain, category and use-case description, market, and locale. You can also provide aliases and selected competitors. Those inputs are frozen with the run and used to construct and analyze the shared question set.",
  },
  {
    id: "seo-replacement",
    question: "Does this replace SEO analytics or prove why a model answered a certain way?",
    answer:
      "No. It complements search, content, and brand research by showing answer evidence at one point in time. Citations show sources returned with an answer, but they do not prove a model's internal reasoning or establish that one page caused a mention.",
  },
] as const;

export default function FaqPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${faqUrl}#faq`,
        name: "100 Questions AI Visibility Benchmark FAQ",
        url: faqUrl,
        mainEntity: faqs.map(({ question, answer }) => ({
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
            name: "FAQ",
            item: faqUrl,
          },
        ],
      },
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: absoluteUrl(),
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
              <span className="text-zinc-300">FAQ</span>
            </nav>
            <Badge variant="outline" className="mt-8 border-emerald-300/25 text-emerald-200">
              Product and methodology
            </Badge>
            <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              Questions about measuring AI visibility
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
              Clear answers about the providers, question set, source rules,
              calculations, billing model, privacy, and limits of a 100 Questions run.
            </p>
          </div>
        </section>

        <section className="page-shell grid gap-12 py-16 lg:grid-cols-[15rem_minmax(0,1fr)] lg:py-24">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <p className="eyebrow">Quick links</p>
            <nav className="mt-4 flex flex-col items-start gap-3 text-sm text-zinc-400" aria-label="Frequently asked questions">
              {faqs.slice(0, 6).map(({ id, question }) => (
                <a key={id} className="hover:text-white" href={`#${id}`}>
                  {question}
                </a>
              ))}
            </nav>
          </aside>

          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {faqs.map(({ id, question, answer }) => (
              <article key={id} id={id} className="scroll-mt-8 py-7 sm:py-8">
                <h2 className="text-balance text-xl font-semibold tracking-[-0.02em] text-zinc-100 sm:text-2xl">
                  {question}
                </h2>
                <p className="mt-4 max-w-3xl text-pretty leading-7 text-zinc-400">
                  {answer}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="page-shell pb-20 lg:pb-28">
          <div className="flex flex-col gap-6 rounded-[28px] bg-white/[0.035] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div>
              <p className="eyebrow">Ready for the evidence?</p>
              <h2 className="mt-3 text-balance text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                Build a private benchmark for your brand.
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Or review the <Link className="text-emerald-300 hover:text-emerald-200" href="/methodology">full methodology</Link> first.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/auth/sign-up">
                Start a benchmark <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
