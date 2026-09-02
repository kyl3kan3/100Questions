import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ContentByline } from "@/components/content-byline";
import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EDITORIAL_AUTHOR_ID } from "@/lib/editorial";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const pageUrl = absoluteUrl("/ai-visibility-tools-pricing");
const publishedAt = "2026-09-02T00:00:00.000Z";
const reviewedAt = "2026-09-02T00:00:00.000Z";

export const metadata: Metadata = {
  title: "What AI Visibility Tools Cost in 2026",
  description:
    "Sourced 2026 AI visibility tool prices: 100 Questions, Otterly, Profound, Peec, AthenaHQ. Live pages dated Sept 2, 2026. No unpublished tiers.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "What AI Visibility Tools Cost in 2026",
    description:
      "Sourced prices for prepaid audits and monitoring subscriptions—dated September 2, 2026, with explicit caveats where vendors hide dollars.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "article",
    locale: "en_US",
    publishedTime: publishedAt,
    modifiedTime: reviewedAt,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Visibility Tools Pricing (2026)",
    description:
      "Sourced prices for 100 Questions, Otterly, Profound, Peec, and AthenaHQ. No invented enterprise quotes.",
    images: [SOCIAL_IMAGE],
  },
};

const pricingRows = [
  {
    product: "100 Questions",
    model: "Prepaid credits (no subscription)",
    entry: "$9 first benchmark",
    mid: "$15 / $39 / $99 packages",
    enterprise: "Not offered",
    notes:
      "Then $15 for one credit, $39 for three, $99 for ten. Credits valid 12 months. No seat fees. 30-day answer retention.",
    source: absoluteUrl("/pricing"),
    sourceLabel: "100 Questions pricing",
  },
  {
    product: "Otterly.AI",
    model: "Monthly or annual subscription",
    entry: "Lite $29/mo (15 prompts)",
    mid: "Standard $189 · Premium $489",
    enterprise: "From $1,000/mo (custom)",
    notes:
      "Annual billing 15% off. Add-ons: AI Mode/Gemini $9/$59/$149; Claude $29/$109/$439; extra 100 prompts $99/mo.",
    source: "https://help.otterly.ai/pricing-of-otterlyai",
    sourceLabel: "Otterly.AI pricing help",
  },
  {
    product: "Profound",
    model: "Monthly subscription (yearly caveat)",
    entry: "Starter $99/mo",
    mid: "Growth $399/mo",
    enterprise: "Custom",
    notes:
      "Starter: ChatGPT, 50 prompts, 1,500 responses. Growth: three engines, 100 prompts, 9,000 responses. Confirm yearly vs monthly billing on live page.",
    source: "https://tryprofound.com/pricing",
    sourceLabel: "Profound pricing",
  },
  {
    product: "Peec AI",
    model: "Monthly subscription",
    entry: "Starter $95/mo (50 prompts)",
    mid: "Pro $245 · Advanced $495",
    enterprise: "Unpublished on public page",
    notes:
      "Dollar amounts from peec.ai/ai-instructions (July 10, 2026). September 2, 2026 HTML pricing page had no dollars—confirm live before buying.",
    source: "https://peec.ai/ai-instructions",
    sourceLabel: "Peec AI pricing instructions",
  },
  {
    product: "AthenaHQ",
    model: "Free tier + subscription",
    entry: "Essential free ($25/300 credits)",
    mid: "Starter $295/mo",
    enterprise: "Unpublished",
    notes: "API add-on prices unpublished on public pricing page reviewed September 2, 2026.",
    source: "https://www.athenahq.ai/pricing",
    sourceLabel: "AthenaHQ pricing",
  },
] as const;

const faqs = [
  {
    question: "What is the cheapest AI visibility tool?",
    answer:
      "For a one-time measurement, 100 Questions has the lowest verified upfront price at $9 for a first benchmark, but it is not continuous monitoring. For ongoing monitoring, Otterly Lite at $29/month is the lowest published subscription entry tier in this table. Total cost still depends on required engines, prompts, seats, and add-ons.",
  },
  {
    question: "Why are Peec AI prices sourced from July 2026?",
    answer:
      "On September 2, 2026, Peec's public HTML pricing page did not display dollar amounts. The last verified dollar figures in this comparison come from peec.ai/ai-instructions on July 10, 2026. Confirm current prices on the live page before purchasing.",
  },
  {
    question: "Are enterprise AI visibility tools $2,000–$5,000 per month?",
    answer:
      "Some vendors sell unpublished enterprise tiers in that range, but this page does not invent unpublished quotes. Otterly Enterprise starts from $1,000/month on its public help page. Profound and Peec enterprise pricing are custom or unpublished in the sources reviewed here.",
  },
  {
    question: "Does a higher price mean better AI visibility results?",
    answer:
      "No. Price reflects measurement model, engine coverage, prompt limits, seats, integrations, and platform scope—not a guarantee of future mentions or citations. Match the product to the job: snapshot audit, daily monitor, SEO suite, or enterprise AEO operations.",
  },
] as const;

const limitations = [
  "All dollar amounts are USD. Prices, limits, and engine coverage can change after September 2, 2026.",
  "Enterprise tiers, agency bundles, and unpublished add-ons are marked as unpublished rather than guessed.",
  "No product in this table can guarantee future mentions, citations, recommendations, or rankings.",
] as const;

export default function AiVisibilityToolsPricingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: "What AI Visibility Tools Cost in 2026",
        description:
          "Sourced 2026 prices for prepaid audits and monitoring subscriptions with explicit caveats.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: publishedAt,
        dateModified: reviewedAt,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": EDITORIAL_AUTHOR_ID },
        reviewedBy: { "@id": EDITORIAL_AUTHOR_ID },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        about: ["AI visibility tools pricing", "GEO tools", "AEO software"],
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
          {
            "@type": "ListItem",
            position: 2,
            name: "AI visibility tools pricing",
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
                <span className="text-zinc-300">AI visibility tools pricing</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                Sourced pricing · reviewed September 2, 2026
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                What AI visibility tools cost in 2026
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                This page lists published prices for five common AI visibility
                products: a prepaid audit, three monitoring subscriptions, and one
                action-oriented platform. Enterprise tiers and add-ons are marked
                when they are not published on the vendor pages reviewed here.
              </p>
              <ContentByline
                publishedAt={publishedAt}
                publishedLabel="September 2, 2026"
                modifiedAt={reviewedAt}
                modifiedLabel="September 2, 2026"
                note="First-party vendor pricing pages reviewed"
              />
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section aria-labelledby="pricing-table-heading">
              <p className="eyebrow">Sourced table</p>
              <h2
                id="pricing-table-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Published prices as of September 2, 2026
              </h2>
              <div className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <table className="min-w-[960px] text-left text-sm">
                  <thead className="bg-[#0b0e0c] text-zinc-200">
                    <tr>
                      <th className="p-5 font-semibold">Product</th>
                      <th className="p-5 font-semibold">Model</th>
                      <th className="p-5 font-semibold">Entry</th>
                      <th className="p-5 font-semibold">Mid tiers</th>
                      <th className="p-5 font-semibold">Enterprise</th>
                      <th className="p-5 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingRows.map((row) => (
                      <tr
                        key={row.product}
                        className="border-t border-white/[0.07] bg-[#0b0e0c] align-top"
                      >
                        <th className="p-5 font-semibold text-white">
                          {row.product}
                          <a
                            className="mt-2 flex items-center gap-1 text-xs font-normal text-emerald-300 hover:text-emerald-200"
                            href={row.source}
                            target={
                              row.source.startsWith("http") &&
                              !row.source.startsWith(absoluteUrl())
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              row.source.startsWith("http") &&
                              !row.source.startsWith(absoluteUrl())
                                ? "noopener noreferrer"
                                : undefined
                            }
                          >
                            Verify
                            <ExternalLink aria-hidden="true" className="size-3" />
                            <span className="sr-only"> at {row.sourceLabel}</span>
                          </a>
                        </th>
                        <td className="p-5 leading-6 text-zinc-300">{row.model}</td>
                        <td className="p-5 leading-6 text-zinc-300">{row.entry}</td>
                        <td className="p-5 leading-6 text-zinc-300">{row.mid}</td>
                        <td className="p-5 leading-6 text-zinc-300">{row.enterprise}</td>
                        <td className="max-w-xs p-5 leading-6 text-zinc-400">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-5 max-w-3xl text-xs leading-5 text-zinc-400">
                Peec AI dollar amounts are from July 10, 2026 because the September
                2, 2026 HTML page did not show dollars. All other rows were reviewed
                from first-party pages on September 2, 2026.
              </p>
            </section>

            <section className="grid gap-5 lg:grid-cols-2" aria-labelledby="audit-vs-sub-heading">
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                <p className="eyebrow">Prepaid audit</p>
                <h2
                  id="audit-vs-sub-heading"
                  className="mt-4 text-2xl font-semibold text-white"
                >
                  100 Questions is credits, not seats
                </h2>
                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  The $9 introductory benchmark is a one-time prepaid credit, not a
                  monthly subscription. Later packages are $15 for one run, $39 for
                  three, or $99 for ten. Credits remain valid for 12 months. Answer
                  evidence is retained for 30 days.
                </p>
              </div>
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                <p className="eyebrow">Subscriptions</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  Add-ons change the real total
                </h2>
                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  Otterly, Profound, Peec, and AthenaHQ prices above are entry and
                  mid-tier signals. Engine add-ons, extra prompt packs, domains,
                  seats, and unpublished enterprise tiers can raise the annual
                  total materially.
                </p>
              </div>
            </section>

            <section aria-labelledby="limitations-heading">
              <p className="eyebrow">Interpretation limits</p>
              <h2
                id="limitations-heading"
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                What this page does not claim
              </h2>
              <ul className="mt-6 list-disc space-y-3 pl-5 text-sm leading-6 text-zinc-400">
                {limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                For job-based comparisons, see{" "}
                <Link
                  className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                  href="/ai-visibility-audit-vs-monitoring"
                >
                  audit vs monitoring
                </Link>
                ,{" "}
                <Link
                  className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                  href="/profound-alternative"
                >
                  Profound alternatives
                </Link>
                , and{" "}
                <Link
                  className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                  href="/otterly-alternative"
                >
                  Otterly alternatives
                </Link>
                .
              </p>
            </section>

            <section aria-labelledby="pricing-faq-heading">
              <p className="eyebrow">Questions buyers ask</p>
              <h2
                id="pricing-faq-heading"
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                Frequently asked questions
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {faqs.map(({ question, answer }) => (
                  <section
                    key={question}
                    className="rounded-[20px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <h3 className="text-balance font-semibold text-white">{question}</h3>
                    <p className="mt-3 text-pretty text-sm leading-6 text-zinc-400">
                      {answer}
                    </p>
                  </section>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
              <CheckCircle2 className="size-6" aria-hidden="true" />
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                    Start with a sourced baseline
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    Run one prepaid benchmark for $9.
                  </h2>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-zinc-950 text-white hover:bg-zinc-800"
                >
                  <Link href="/pricing">
                    View pricing <ArrowRight />
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
