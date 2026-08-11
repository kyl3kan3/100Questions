import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileSearch,
  Gauge,
  Globe2,
  ListChecks,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ContentByline } from "@/components/content-byline";
import { JsonLd } from "@/components/json-ld";
import { MarketingCheckoutButton } from "@/components/marketing-checkout-button";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BILLING_PACKAGES, formatPackagePrice } from "@/lib/billing/packages";
import {
  PRODUCT_BEST_FITS,
  PRODUCT_FEATURES,
  PRODUCT_LIMITATIONS,
} from "@/lib/product-facts";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const pageUrl = absoluteUrl("/ai-visibility-audit");
const publishedAt = "2026-08-11T00:00:00.000Z";
const introPrice = formatPackagePrice(BILLING_PACKAGES[0].priceCents);

export const metadata: Metadata = {
  title: "AI Visibility Audit: 100 Answers, 4 Models",
  description:
    "Run a source-backed AI visibility audit across OpenAI, Claude, Gemini, and Grok. Get 100 planned answers, competitor evidence, and five actions from $9.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI Visibility Audit: 100 Answers Across Four AI Models",
    description:
      "Benchmark brand mentions, prominence, competitors, and citations with a frozen question set and inspectable evidence.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Visibility Audit: 100 Answers Across Four AI Models",
    description:
      "A prepaid, source-backed brand visibility benchmark with a prioritized action plan.",
    images: [SOCIAL_IMAGE],
  },
};

const metrics = [
  {
    icon: Gauge,
    title: "Discovery visibility",
    description:
      "How often your brand appears in neutral buyer answers that do not name it in the prompt.",
  },
  {
    icon: ListChecks,
    title: "Prominence",
    description:
      "Whether the brand leads an answer, makes a shortlist, or appears only in passing.",
  },
  {
    icon: Globe2,
    title: "Competitor share of voice",
    description:
      "Which alternatives appear when your brand does not, measured against the same question set.",
  },
  {
    icon: FileSearch,
    title: "Citation evidence",
    description:
      "Which owned and third-party sources support each grounded answer, with the evidence preserved.",
  },
] as const;

const workflow = [
  {
    title: "Define the brand and market",
    description:
      "Enter the canonical domain, audience, category, locale, and competitors that make the benchmark useful.",
  },
  {
    title: "Freeze 25 buyer questions",
    description:
      "The audit uses 20 neutral discovery questions and 5 direct brand diagnostics. Every provider receives the identical set.",
  },
  {
    title: "Collect up to 100 grounded answers",
    description:
      "OpenAI, Claude, Gemini, and Grok answer through one shared web-search harness. Failed or ungrounded answers stay visible as coverage gaps.",
  },
  {
    title: "Turn evidence into five actions",
    description:
      "The report connects missed questions, competitor wins, and recurring sources to a prioritized technical, content, or authority action plan.",
  },
] as const;

const faqs = [
  {
    question: "What is an AI visibility audit?",
    answer:
      "An AI visibility audit is a time-stamped test of whether a brand appears in AI-generated answers for relevant buyer questions. A useful audit separates mentions, prominence, competitors, citations, sentiment, and answer coverage, then preserves the underlying answers and sources so every finding can be checked.",
  },
  {
    question: "Which AI systems does the audit test?",
    answer:
      "100 Questions sends the same frozen 25-question set to OpenAI, Claude, Gemini, and Grok through model APIs with web grounding. It does not currently test Perplexity or reproduce personalized consumer chat interfaces.",
  },
  {
    question: "How many answers are included?",
    answer:
      "Each run plans 100 answers: 25 questions across four providers. Provider failures and answers without valid web grounding are reported in coverage and excluded from applicable score denominators rather than silently counted as brand misses.",
  },
  {
    question: "How much does an AI visibility audit cost?",
    answer: `The introductory first benchmark costs ${introPrice}. The normal single-benchmark price after the first purchase is $15, with prepaid three- and ten-run packages available. There is no subscription, and applicable taxes are shown before payment.`,
  },
  {
    question: "What do I receive after the audit?",
    answer:
      "You receive the frozen question set, provider-level answers, source evidence, visibility and citation metrics, competitor comparisons, up to five prioritized actions, and PDF and CSV exports. Evidence remains available for 30 days, while purchased credits remain valid for 12 months.",
  },
  {
    question: "Is this the same as the free AI visibility checker?",
    answer:
      "No. The free checker reviews public technical signals such as crawl access, metadata, schema, sitemaps, and llms.txt. The paid audit asks actual AI providers the same buyer questions and measures the resulting brand mentions, prominence, competitors, and citations.",
  },
  {
    question: "Does the audit guarantee that ChatGPT will recommend my business?",
    answer:
      "No. AI answers vary by model, search results, prompt, locale, and time. The audit supplies a controlled directional baseline and inspectable evidence; it cannot guarantee a future mention, citation, recommendation, or ranking.",
  },
] as const;

export default function AiVisibilityAuditPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: "100 Questions AI Visibility Audit",
        serviceType: "AI visibility audit",
        description:
          "A prepaid, source-backed AI brand visibility benchmark across OpenAI, Claude, Gemini, and Grok.",
        url: pageUrl,
        provider: { "@id": `${absoluteUrl()}#organization` },
        audience: {
          "@type": "Audience",
          audienceType: "Consultants, agencies, and in-house marketing teams",
        },
        offers: {
          "@type": "Offer",
          price: String(BILLING_PACKAGES[0].priceCents / 100),
          priceCurrency: "USD",
          availability: "https://schema.org/OnlineOnly",
          url: pageUrl,
          description: "Introductory first-purchase price for one complete benchmark",
        },
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
            name: "AI visibility audit",
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
                <span className="text-zinc-300">AI visibility audit</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                AI visibility audit · From {introPrice}
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                AI visibility audit: see where four AI models recommend your brand
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                Run one frozen set of 25 buyer questions across OpenAI, Claude,
                Gemini, and Grok. See who mentions you, which competitors win
                instead, what sources shape the answers, and what to fix next.
              </p>
              <ContentByline
                publishedAt={publishedAt}
                publishedLabel="August 11, 2026"
                note="Product facts and pricing are shared with checkout."
              />
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start">
                <MarketingCheckoutButton
                  label={`Run my first audit — ${introPrice}`}
                />
                <Button asChild size="lg" variant="outline">
                  <Link href="/sample-report">
                    View a sample report <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <p className="mt-4 max-w-2xl text-xs leading-5 text-zinc-500">
                First-purchase price. No subscription. Normal single-run price
                is $15. Results are directional and do not guarantee placement.
              </p>
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section aria-labelledby="audit-definition-heading">
              <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
                <div>
                  <p className="eyebrow">What the audit measures</p>
                  <h2
                    id="audit-definition-heading"
                    className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
                  >
                    One score cannot explain AI visibility
                  </h2>
                </div>
                <p className="text-pretty text-lg leading-8 text-zinc-300">
                  A brand mention is only the start. The audit separates whether
                  you appeared, where you appeared, who displaced you, which
                  domains were cited, and how much of the planned test completed
                  with usable evidence.
                </p>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map(({ icon: Icon, title, description }) => (
                  <Card key={title} className="bg-[#0a0d0b]">
                    <CardHeader>
                      <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300">
                        <Icon className="size-4" aria-hidden="true" />
                      </div>
                      <CardTitle>{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm leading-6 text-zinc-400">
                      {description}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section aria-labelledby="deliverables-heading">
              <p className="eyebrow">What you receive</p>
              <h2
                id="deliverables-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                A client-ready AI visibility audit with the evidence attached
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PRODUCT_FEATURES.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 rounded-[20px] bg-[#0b0e0c] p-5 text-sm text-zinc-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <Check className="size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                    {feature}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="link">
                  <Link href="/sample-report">
                    Inspect every report section <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="link">
                  <Link href="/methodology">Review scoring and exclusions</Link>
                </Button>
              </div>
            </section>

            <section aria-labelledby="workflow-heading">
              <p className="eyebrow">How it works</p>
              <h2
                id="workflow-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                From buyer questions to a prioritized action plan
              </h2>
              <ol className="mt-8 divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {workflow.map(({ title, description }, index) => (
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

            <section aria-labelledby="checker-comparison-heading">
              <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
                <div>
                  <p className="eyebrow">Checker or audit?</p>
                  <h2
                    id="checker-comparison-heading"
                    className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
                  >
                    Technical readiness and real answer visibility are different tests
                  </h2>
                </div>
                <div className="overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="bg-white/[0.04] text-zinc-200">
                      <tr>
                        <th className="p-4 font-semibold">Question</th>
                        <th className="p-4 font-semibold">Free checker</th>
                        <th className="p-4 font-semibold">Paid audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.08] text-zinc-400">
                      <tr>
                        <th className="p-4 font-medium text-zinc-200">What it tests</th>
                        <td className="p-4">Public website readiness signals</td>
                        <td className="p-4">Actual grounded AI answers</td>
                      </tr>
                      <tr>
                        <th className="p-4 font-medium text-zinc-200">Providers</th>
                        <td className="p-4">None</td>
                        <td className="p-4">OpenAI, Claude, Gemini, and Grok</td>
                      </tr>
                      <tr>
                        <th className="p-4 font-medium text-zinc-200">Output</th>
                        <td className="p-4">Readiness findings and fixes</td>
                        <td className="p-4">Metrics, evidence, competitors, actions, exports</td>
                      </tr>
                      <tr>
                        <th className="p-4 font-medium text-zinc-200">Cost</th>
                        <td className="p-4">Free</td>
                        <td className="p-4">From {introPrice}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <Button asChild variant="link" className="mt-5">
                <Link href="/ai-visibility-checker">
                  Run the free readiness checker <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </section>

            <section aria-labelledby="fit-heading">
              <p className="eyebrow">Choose the right measurement model</p>
              <h2
                id="fit-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Best for a bounded benchmark, not an always-on tracker
              </h2>
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <DecisionCard
                  icon={<ShieldCheck aria-hidden="true" />}
                  title="Use this AI visibility audit for"
                  items={PRODUCT_BEST_FITS}
                />
                <DecisionCard
                  icon={<RefreshCw aria-hidden="true" />}
                  title="Choose continuous tracking when"
                  items={PRODUCT_LIMITATIONS}
                />
              </div>
              <Button asChild variant="link" className="mt-5">
                <Link href="/ai-seo-tools">
                  Compare the best AI visibility tools <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="link" className="mt-5">
                <Link href="/ai-visibility-tools">Browse the AI visibility tools hub</Link>
              </Button>
            </section>

            <section id="faq" aria-labelledby="faq-heading">
              <p className="eyebrow">AI visibility audit questions</p>
              <h2
                id="faq-heading"
                className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Clear answers before you buy
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
                    <p className="mt-3 max-w-3xl text-pretty text-sm leading-6 text-zinc-400">
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
                    One prepaid benchmark
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    Find the buyer questions where AI overlooks your brand.
                  </h2>
                </div>
                <MarketingCheckoutButton
                  label={`Run my first audit — ${introPrice}`}
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

function DecisionCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: readonly string[];
}) {
  return (
    <article className="rounded-[24px] bg-[#0a0d0b] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
      <div className="text-emerald-300 [&>svg]:size-5">{icon}</div>
      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-zinc-300">
            <Check className="mt-1 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
