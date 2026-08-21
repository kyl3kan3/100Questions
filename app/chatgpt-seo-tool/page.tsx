import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  SearchCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ContentByline } from "@/components/content-byline";
import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingCheckoutButton } from "@/components/marketing-checkout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BILLING_PACKAGES } from "@/lib/billing/packages";
import { PRODUCT_SKU, PRODUCT_UPDATED_AT } from "@/lib/product-facts";
import { PRODUCT_IMAGE } from "@/lib/product-image";
import {
  absoluteUrl,
  SITE_NAME,
  SOCIAL_IMAGE,
} from "@/lib/site";

const pageUrl = absoluteUrl("/chatgpt-seo-tool");
const introPrice = BILLING_PACKAGES.find(({ id }) => id === "intro")!;
const CHATGPT_SEO_TOOL_PUBLISHED_DATE = {
  iso: "2026-07-24",
  label: "July 24, 2026",
} as const;
const CHATGPT_SEO_TOOL_REVIEWED_DATE = {
  iso: "2026-08-07",
  label: "August 7, 2026",
} as const;

export const metadata: Metadata = {
  title: "ChatGPT SEO Tool: Measure Brand Visibility",
  description:
    "Use a ChatGPT SEO tool to measure brand mentions, prominence, competitors, and citations across a frozen question set, with evidence and multi-model context.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "ChatGPT SEO Tool: Measure Brand Visibility with Evidence",
    description:
      "A controlled ChatGPT visibility benchmark with stored answers, citations, competitors, and the same questions across four providers.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatGPT SEO Tool: Measure Brand Visibility with Evidence",
    description:
      "Measure whether AI answers mention your brand, who appears instead, and which sources shape the answer.",
    images: [SOCIAL_IMAGE],
  },
};

const measuredSignals = [
  [
    "Discovery visibility",
    "How often the brand appears in neutral buyer questions that do not plant its name.",
  ],
  [
    "Prominence",
    "Whether the brand leads the answer, makes the shortlist, or appears incidentally.",
  ],
  [
    "Competitor share of voice",
    "Which selected competitors appear across the same answer set and how often.",
  ],
  [
    "Owned citations",
    "How often eligible answers cite the submitted canonical domain or a subdomain.",
  ],
] as const;

const comparisonRows = [
  [
    "Typing prompts into ChatGPT",
    "Fast spot check",
    "Personalized sessions, changing prompts, no controlled evidence",
  ],
  [
    "Continuous AI monitoring",
    "Ongoing trend tracking",
    "Recurring subscription and changing prompt panels",
  ],
  [
    "100 Questions benchmark",
    "Comparable baseline or rerun",
    "Frozen questions, four providers, stored answers and citations",
  ],
] as const;

const steps = [
  [
    "Define the subject",
    "Submit the brand, canonical domain, category, market, aliases, and selected competitors.",
  ],
  [
    "Freeze the questions",
    "The run creates 20 neutral discovery questions and 5 direct diagnostic questions, then freezes them.",
  ],
  [
    "Run four providers",
    "The identical set is sent through web-grounded OpenAI, Claude, Gemini, and Grok provider calls.",
  ],
  [
    "Review the evidence",
    "Metrics link back to stored answers, cited URLs, missed questions, competitors, and recommended actions.",
  ],
] as const;

const faqs = [
  {
    question: "What is a ChatGPT SEO tool?",
    answer:
      "A ChatGPT SEO tool measures or improves how a brand appears in AI-generated answers. Useful tools separate technical crawlability, prompt monitoring, content optimization, and controlled visibility measurement instead of hiding them inside one unexplained score.",
  },
  {
    question: "Can a tool guarantee that my brand ranks in ChatGPT?",
    answer:
      "No. ChatGPT answers vary by model, search behavior, available sources, prompts, location, and time. A defensible tool can measure a controlled snapshot and preserve evidence; it cannot guarantee inclusion or reproduce every consumer session.",
  },
  {
    question: "Does 100 Questions use the ChatGPT consumer interface?",
    answer:
      "No. It uses API-grounded provider calls through Vercel AI Gateway. That sacrifices consumer-interface personalization in exchange for identical questions, controlled provider comparisons, stored evidence, and repeatable reruns.",
  },
  {
    question: "Why compare ChatGPT with Claude, Gemini, and Grok?",
    answer:
      "A brand can be visible in one assistant and absent in another because providers use different models, search integrations, and source-selection systems. Multi-provider context shows whether a result is broad or dependent on one ecosystem.",
  },
  {
    question: "How often should I rerun a ChatGPT visibility benchmark?",
    answer:
      "Rerun after substantive changes have had time to be crawled: new comparison pages, clearer entity facts, original research, earned third-party coverage, or important technical fixes. Reusing the frozen questions makes the comparison more meaningful.",
  },
] as const;

export default function ChatgptSeoToolPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${pageUrl}#product`,
        name: "100 Questions ChatGPT SEO Tool",
        url: pageUrl,
        image: PRODUCT_IMAGE,
        sku: `${PRODUCT_SKU}-INTRO`,
        datePublished: CHATGPT_SEO_TOOL_PUBLISHED_DATE.iso,
        dateModified: PRODUCT_UPDATED_AT,
        category: "AI visibility analytics",
        description:
          "A prepaid, evidence-linked AI visibility benchmark across OpenAI, Claude, Gemini, and Grok.",
        offers: {
          "@type": "Offer",
          price: (introPrice.priceCents / 100).toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/OnlineOnly",
          sku: `${PRODUCT_SKU}-INTRO`,
          url: absoluteUrl("/#pricing"),
          description: "Introductory first benchmark price",
        },
        brand: { "@id": `${absoluteUrl()}#brand` },
        provider: { "@id": `${absoluteUrl()}#organization` },
        featureList: measuredSignals.map(([name]) => name),
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
            name: "ChatGPT SEO tool",
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
                <span className="text-zinc-300">ChatGPT SEO tool</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                ChatGPT SEO tool
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Measure ChatGPT visibility without confusing a spot check for a
                benchmark
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                See whether AI answers mention your brand, who appears instead,
                and which sources shape the answer. Every run preserves the
                questions, answers, citations, and provider coverage behind the
                result.
              </p>
              <ContentByline
                publishedAt={CHATGPT_SEO_TOOL_PUBLISHED_DATE.iso}
                publishedLabel={CHATGPT_SEO_TOOL_PUBLISHED_DATE.label}
                modifiedAt={CHATGPT_SEO_TOOL_REVIEWED_DATE.iso}
                modifiedLabel={CHATGPT_SEO_TOOL_REVIEWED_DATE.label}
              />
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <MarketingCheckoutButton label="Run a $9 benchmark" />
                <Button asChild size="lg" variant="outline">
                  <Link href="/sample-report">Inspect the sample report</Link>
                </Button>
              </div>
              <p className="mt-5 max-w-3xl text-pretty text-xs leading-5 text-zinc-400">
                Directional API-grounded measurement, not a replica of a
                personalized ChatGPT consumer session.
              </p>
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section aria-labelledby="measures-heading">
              <p className="eyebrow">What it measures</p>
              <h2
                id="measures-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Four metrics, each tied to answer evidence
              </h2>
              <div className="mt-8 grid gap-px overflow-hidden rounded-[24px] bg-white/[0.08] sm:grid-cols-2">
                {measuredSignals.map(([title, description], index) => (
                  <article key={title} className="bg-[#0b0e0c] p-6 sm:p-7">
                    <span className="font-mono text-xs tabular-nums text-emerald-300">
                      0{index + 1}
                    </span>
                    <h3 className="mt-5 font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-pretty text-sm leading-6 text-zinc-400">
                      {description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="comparison-heading">
              <p className="eyebrow">Choose the measurement model</p>
              <h2
                id="comparison-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                The right ChatGPT SEO tool depends on the decision
              </h2>
              <div
                className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                role="region"
                aria-label="ChatGPT SEO tool comparison by decision"
                tabIndex={0}
              >
                <table className="min-w-[720px] w-full text-left text-sm">
                  <thead className="bg-white/[0.045] text-xs uppercase tracking-[0.12em] text-zinc-400">
                    <tr>
                      <th className="px-5 py-4 font-medium">Approach</th>
                      <th className="px-5 py-4 font-medium">Best for</th>
                      <th className="px-5 py-4 font-medium">
                        Important tradeoff
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.07]">
                    {comparisonRows.map(([approach, bestFor, tradeoff]) => (
                      <tr key={approach} className="bg-[#0b0e0c]">
                        <th className="px-5 py-5 font-semibold text-zinc-100">
                          {approach}
                        </th>
                        <td className="px-5 py-5 text-zinc-300">{bestFor}</td>
                        <td className="px-5 py-5 text-zinc-400">{tradeoff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-5 max-w-3xl text-pretty text-sm leading-6 text-zinc-400">
                For the broader market, compare continuous monitoring,
                enterprise research, SEO suites, and fixed benchmarks in the{" "}
                <Link
                  href="/ai-seo-tools"
                  className="text-emerald-300 underline underline-offset-4 decoration-emerald-300/40 hover:text-emerald-200 hover:decoration-emerald-200"
                >
                  AI SEO tools guide
                </Link>
                .
              </p>
            </section>

            <section aria-labelledby="workflow-heading">
              <p className="eyebrow">Controlled workflow</p>
              <h2
                id="workflow-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                From subject definition to evidence-linked action
              </h2>
              <ol className="mt-8 grid gap-4 md:grid-cols-2">
                {steps.map(([title, description], index) => (
                  <li
                    key={title}
                    className="rounded-[20px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <span className="font-mono text-xs tabular-nums text-emerald-300">
                      0{index + 1}
                    </span>
                    <h3 className="mt-4 font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-pretty text-sm leading-6 text-zinc-400">
                      {description}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">ChatGPT discovery foundation</p>
                <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                  Access matters, but access does not guarantee inclusion
                </h2>
              </div>
              <div className="space-y-5 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  OpenAI documents OAI-SearchBot separately from GPTBot:
                  publishers can control search discovery independently from
                  model training. A public page still needs clear entity facts,
                  useful answers, trustworthy evidence, and third-party
                  corroboration before it becomes a safe recommendation.
                </p>
                <p>
                  Read the{" "}
                  <a
                    href="https://help.openai.com/en/articles/12627856"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-300 underline underline-offset-4 decoration-emerald-300/40 hover:text-emerald-200 hover:decoration-emerald-200"
                  >
                    official OpenAI publisher guidance
                    <ExternalLink className="ml-1 inline size-3" />
                  </a>
                  , then use the{" "}
                  <Link
                    href="/llm-seo"
                    className="text-emerald-300 underline underline-offset-4 decoration-emerald-300/40 hover:text-emerald-200 hover:decoration-emerald-200"
                  >
                    LLM SEO guide
                  </Link>{" "}
                  for the broader content and authority workflow.
                </p>
              </div>
            </section>

            <section aria-labelledby="chatgpt-tool-faq-heading">
              <p className="eyebrow">Questions before choosing a tool</p>
              <h2
                id="chatgpt-tool-faq-heading"
                className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                ChatGPT SEO tool FAQ
              </h2>
              <div className="mt-8 space-y-4">
                {faqs.map(({ question, answer }) => (
                  <details
                    key={question}
                    className="group rounded-[20px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <summary className="min-h-10 cursor-pointer list-none font-semibold text-white [&::-webkit-details-marker]:hidden">
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
              <SearchCheck className="size-6" aria-hidden="true" />
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                    Start with evidence
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    One frozen test. Four providers. No subscription.
                  </h2>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-zinc-950 text-white hover:bg-zinc-800"
                >
                  <Link href="/auth/sign-up">
                    Run the benchmark <ArrowRight />
                  </Link>
                </Button>
              </div>
            </section>

            <p className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="size-4 text-emerald-300" />
              Review definitions, denominators, and limitations in the{" "}
              <Link
                href="/methodology"
                className="text-emerald-300 underline underline-offset-4 decoration-emerald-300/40 hover:text-emerald-200 hover:decoration-emerald-200"
              >
                public methodology
              </Link>
              .
            </p>
          </div>
        </article>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
