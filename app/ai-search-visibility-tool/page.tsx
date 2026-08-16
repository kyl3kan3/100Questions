import {
  ArrowRight,
  Check,
  FileSearch,
  Gauge,
  Globe2,
  ListChecks,
  LockOpen,
  RefreshCw,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ContentByline } from "@/components/content-byline";
import { AnalyticsEvent } from "@/components/analytics-event";
import { JsonLd } from "@/components/json-ld";
import { MarketingCheckoutButton } from "@/components/marketing-checkout-button";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BILLING_PACKAGES } from "@/lib/billing/packages";
import {
  PRODUCT_BEST_FITS,
  PRODUCT_FEATURES,
  PRODUCT_LIMITATIONS,
  PRODUCT_NAME,
  PRODUCT_SKU,
} from "@/lib/product-facts";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const path = "/ai-search-visibility-tool" as const;
const pageUrl = absoluteUrl(path);
const publishedAt = "2026-08-16";
const introPrice = BILLING_PACKAGES[0].priceCents / 100;

export const metadata: Metadata = {
  title: "AI Search Visibility Tool — Mentions & Citations",
  description:
    "Measure AI search mentions, citations, competitors, and share of voice across OpenAI, Claude, Gemini, and Grok with a frozen 100-answer benchmark.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI Search Visibility Tool — Measure Mentions, Citations, and Share of Voice",
    description:
      "Run 25 buyer questions across four grounded AI providers and preserve the answers, sources, competitors, and measurement conditions.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Search Visibility Tool — 100-Answer Benchmark",
    description:
      "A frozen, repeatable AI visibility audit with evidence—not an always-on rank tracker.",
    images: [SOCIAL_IMAGE],
  },
};

const metrics = [
  {
    icon: Gauge,
    label: "Mentions",
    value: "28 / 80",
    detail: "Illustrative neutral discovery answers that name the brand.",
  },
  {
    icon: FileSearch,
    label: "Owned citations",
    value: "12 / 80",
    detail: "Illustrative eligible answers citing the claimed domain.",
  },
  {
    icon: Globe2,
    label: "Share of voice",
    value: "31%",
    detail: "Illustrative target mentions divided by tracked brand mentions.",
  },
  {
    icon: ListChecks,
    label: "Coverage",
    value: "94 / 100",
    detail: "Illustrative planned answers that finished with usable evidence.",
  },
] as const;

const faqs = [
  {
    question: "What is an AI search visibility tool?",
    answer:
      "An AI search visibility tool measures whether and how a brand appears when AI systems answer relevant questions. Useful tools preserve the questions, provider conditions, answers, sources, competitors, and failures behind each metric instead of reporting an unexplained score.",
  },
  {
    question: "Which AI models does 100 Questions test?",
    answer:
      "Each audit sends the same 25-question set to OpenAI, Claude, Gemini, and Grok through model APIs with web grounding, creating 100 planned answers. It does not currently test Perplexity or reproduce personalized consumer chat interfaces.",
  },
  {
    question: "Is this an AI rank tracker?",
    answer:
      "No. It is a frozen, point-in-time benchmark designed for a baseline and comparable reruns after meaningful work. Choose a continuous tracker when you need daily or weekly prompts, alerts, trend lines, or always-on multi-project reporting.",
  },
  {
    question: "How much does the AI visibility audit cost?",
    answer:
      "The introductory first audit costs $9. The normal single-audit price after the first purchase is $15, with prepaid three- and ten-audit packages. There is no subscription, and credits remain valid for 12 months.",
  },
  {
    question: "Can I see an AI visibility report before buying?",
    answer:
      "Yes. The complete sample report is public and requires no account. It shows the question set, provider coverage, mentions, citations, competitors, share of voice, limitations, stored evidence, and five prioritized actions.",
  },
  {
    question: "Does the tool guarantee future AI mentions or citations?",
    answer:
      "No. Results are a time-stamped, directional API-grounded sample. Answers vary by provider, model, search results, prompt, market, and time, so the benchmark cannot guarantee a future mention, citation, recommendation, or ranking.",
  },
] as const;

export default function AiSearchVisibilityToolPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Product", "SoftwareApplication"],
        "@id": `${pageUrl}#product`,
        name: PRODUCT_NAME,
        alternateName: "100 Questions AI Search Visibility Tool",
        description:
          "A prepaid, source-backed AI search visibility benchmark across OpenAI, Claude, Gemini, and Grok.",
        url: pageUrl,
        sku: PRODUCT_SKU,
        brand: { "@id": `${absoluteUrl()}#brand` },
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "AI search visibility measurement",
        operatingSystem: "Web",
        browserRequirements: "Requires a modern web browser",
        featureList: PRODUCT_FEATURES.join(", "),
        audience: {
          "@type": "Audience",
          audienceType: "Consultants, agencies, and in-house marketing teams",
        },
        offers: {
          "@type": "Offer",
          price: String(introPrice),
          priceCurrency: "USD",
          availability: "https://schema.org/OnlineOnly",
          url: pageUrl,
          description: "Introductory first-purchase price for one benchmark",
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
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
          {
            "@type": "ListItem",
            position: 2,
            name: "AI search visibility tool",
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#070908] text-zinc-100">
      <AnalyticsEvent
        event="seo_landing_viewed"
        onceKey={`seo-landing:${path}`}
        properties={{
          landing_page: path,
          keyword_cluster: "ai_search_visibility_tool",
        }}
      />
      <MarketingHeader />
      <main>
        <article>
          <header className="border-b border-white/[0.07]">
            <div className="page-shell grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-24">
              <div>
                <nav className="text-xs text-zinc-400" aria-label="Breadcrumb">
                  <Link className="hover:text-zinc-200" href="/">Home</Link>{" "}
                  <span aria-hidden="true">/</span>{" "}
                  <span className="text-zinc-300">AI search visibility tool</span>
                </nav>
                <Badge variant="outline" className="mt-8 border-emerald-300/25 text-emerald-200">
                  25 buyer questions × 4 models
                </Badge>
                <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                  AI search visibility tool for mentions, citations, and share of voice
                </h1>
                <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                  See where AI overlooks your brand, which competitors appear
                  instead, and which sources shape the answer. One frozen
                  benchmark produces 100 planned answers and keeps the evidence
                  attached.
                </p>
                <ContentByline
                  publishedAt={publishedAt}
                  publishedLabel="August 16, 2026"
                  note="Product facts and pricing are shared with checkout."
                />
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <MarketingCheckoutButton label="Buy my first audit — $9" />
                  <Button asChild size="lg" variant="outline">
                    <Link href="/sample-report">View sample report <ArrowRight aria-hidden="true" /></Link>
                  </Button>
                </div>
                <p className="mt-4 max-w-2xl text-xs leading-5 text-zinc-500">
                  First-purchase price. No subscription. Results are directional
                  and do not guarantee future placement.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0b0e0c] p-3 shadow-2xl shadow-emerald-950/20">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-zinc-950">
                  <Image
                    src="/sample-report-preview.png"
                    alt="Sample AI visibility report showing metrics, provider coverage, competitor evidence, and prioritized actions"
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover object-top"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 px-3 pb-2 pt-4 text-sm">
                  <span className="flex items-center gap-2 text-zinc-300">
                    <LockOpen className="size-4 text-emerald-300" aria-hidden="true" />
                    Full report visible without signup
                  </span>
                  <Link className="font-semibold text-emerald-300 hover:text-emerald-200" href="/sample-report">
                    Open report
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section aria-labelledby="sample-metrics-heading">
              <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
                <div>
                  <p className="eyebrow">What the report separates</p>
                  <h2 id="sample-metrics-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                    One score cannot explain why a brand is missing
                  </h2>
                </div>
                <p className="leading-7 text-zinc-400">
                  The illustrative values below show how a report keeps
                  mentions, citations, competitor share of voice, and provider
                  coverage distinct. Every result links back to the stored
                  question, answer, and sources.
                </p>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map(({ icon: Icon, label, value, detail }) => (
                  <article key={label} className="rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                    <Icon className="size-5 text-emerald-300" aria-hidden="true" />
                    <p className="mt-5 text-sm text-zinc-400">{label}</p>
                    <p className="mt-1 font-mono text-3xl font-semibold tracking-[-0.04em] text-white">{value}</p>
                    <p className="mt-3 text-xs leading-5 text-zinc-500">{detail}</p>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="method-heading" className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="eyebrow">The 25 × 4 method</p>
                <h2 id="method-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                  One question set, four grounded provider views
                </h2>
              </div>
              <ol className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {[
                  ["01", "Freeze 25 buyer questions", "Use 20 neutral discovery questions and five brand-named diagnostics. Lock the wording, market, competitors, and collection conditions."],
                  ["02", "Send the same set to four providers", "OpenAI, Claude, Gemini, and Grok each receive the identical questions through model APIs with web grounding."],
                  ["03", "Preserve up to 100 answer records", "Store the answer text, source URLs, brand mentions, prominence, competitor evidence, timestamp, model identifier, and eligibility status."],
                  ["04", "Turn gaps into five actions", "Connect missed buyer questions, recurring competitors, and cited-source patterns to technical, content, or authority work."],
                ].map(([number, title, description]) => (
                  <li key={number} className="grid gap-3 py-6 sm:grid-cols-[3rem_14rem_1fr] sm:gap-6">
                    <span className="font-mono text-sm text-emerald-300">{number}</span>
                    <h3 className="font-semibold text-zinc-100">{title}</h3>
                    <p className="text-sm leading-6 text-zinc-400">{description}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="manual-heading">
              <p className="eyebrow">Tool vs manual prompt testing</p>
              <h2 id="manual-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                Automate the audit trail, not the judgment
              </h2>
              <div className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-zinc-200">
                    <tr>
                      <th className="p-4 font-semibold">Decision factor</th>
                      <th className="p-4 font-semibold">Manual prompt test</th>
                      <th className="p-4 font-semibold">100 Questions benchmark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08] text-zinc-400">
                    {[
                      ["Cost", "Free except for team time", "$9 first audit; no subscription"],
                      ["Collection", "Copy prompts and answers by hand", "25 frozen questions sent through one shared four-provider harness"],
                      ["Evidence", "Only as complete as the worksheet", "Answers, sources, models, timestamps, failures, and eligibility stored together"],
                      ["Scoring", "Build and maintain formulas manually", "Mentions, prominence, share of voice, citations, sentiment, and coverage"],
                      ["Best use", "A small exploratory spot check", "A client-ready baseline or comparable before-and-after rerun"],
                    ].map(([factor, manual, tool]) => (
                      <tr key={factor}>
                        <th className="p-4 align-top font-medium text-zinc-200">{factor}</th>
                        <td className="p-4 align-top leading-6">{manual}</td>
                        <td className="p-4 align-top leading-6">{tool}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                Prefer a manual workflow? Use the free{" "}
                <Link className="text-emerald-300 underline underline-offset-4" href="/chatgpt-brand-visibility-test">
                  ChatGPT brand visibility test
                </Link>{" "}
                and prompt-tracking spreadsheet. The measurement definitions
                are public either way.
              </p>
            </section>

            <section aria-labelledby="benchmark-heading" className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/[0.035] p-7 sm:p-9">
              <RefreshCw className="size-6 text-emerald-300" aria-hidden="true" />
              <div className="mt-5 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
                <div>
                  <p className="eyebrow">Frozen benchmark, not rank tracking</p>
                  <h2 id="benchmark-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                    Repeat the same test after meaningful work
                  </h2>
                </div>
                <div className="space-y-4 text-pretty leading-7 text-zinc-400">
                  <p>
                    Permanent rank tracking implies one stable position. AI
                    answers are composed from changing model, prompt, source,
                    market, and time conditions. 100 Questions freezes the
                    test so the conditions are inspectable.
                  </p>
                  <p>
                    Use the first audit as a directional baseline. Ship a
                    meaningful technical, content, or authority change, allow
                    time for recrawling, then rerun the identical questions.
                    Compare the stored evidence—not just two composite scores.
                  </p>
                </div>
              </div>
            </section>

            <section aria-labelledby="fit-heading">
              <p className="eyebrow">Choose the right model</p>
              <h2 id="fit-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                Best for a bounded audit, not an always-on dashboard
              </h2>
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {[
                  ["Use 100 Questions for", PRODUCT_BEST_FITS],
                  ["Choose continuous tracking when", PRODUCT_LIMITATIONS],
                ].map(([title, items]) => (
                  <article key={title as string} className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <ul className="mt-5 space-y-3">
                      {(items as readonly string[]).map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-6 text-zinc-300">
                          <Check className="mt-1 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="learn-heading">
              <p className="eyebrow">Build a defensible benchmark</p>
              <h2 id="learn-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                Understand every input before you buy
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  ["AEO vs GEO", "/aeo-vs-geo", "Choose the optimization lens and the metric that belongs to it."],
                  ["How to measure AI visibility", "/how-to-measure-ai-search-visibility", "Set the protocol, denominators, metrics, and rerun rules."],
                  ["AI visibility score", "/ai-visibility-score-calculator", "Calculate a transparent score without hiding the component rates."],
                  ["Mentions vs citations", "/chatgpt-citations-vs-brand-mentions", "Separate being named in an answer from being used as a source."],
                  ["Choose buyer questions", "/ai-visibility-prompts", "Build a balanced question set around real buying decisions."],
                  ["AI Overviews vs cross-model", "/ai-overviews-tracker-vs-cross-model-visibility-testing", "Choose single-surface tracking or a four-provider benchmark."],
                ].map(([title, href, description]) => (
                  <article key={href} className="rounded-[22px] bg-white/[0.025] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
                    <h3 className="font-semibold text-white"><Link className="hover:text-emerald-200" href={href}>{title}</Link></h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="faq" aria-labelledby="faq-heading">
              <p className="eyebrow">Before you run an audit</p>
              <h2 id="faq-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">AI search visibility tool questions</h2>
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
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">One prepaid benchmark</p>
              <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">Find the buyer questions where AI overlooks your brand.</h2>
                  <p className="mt-3 max-w-2xl leading-7 text-zinc-800">Run 25 frozen questions across four grounded providers and keep the evidence behind every result.</p>
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
