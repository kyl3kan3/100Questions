import { ArrowRight, Check, Clock3, FileSearch, Gauge, RefreshCw } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AnalyticsEvent } from "@/components/analytics-event";
import { JsonLd } from "@/components/json-ld";
import { MarketingCheckoutButton } from "@/components/marketing-checkout-button";
import { MarketingHeader } from "@/components/marketing-header";
import { PackageSignUpButton } from "@/components/package-sign-up-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BILLING_PACKAGES,
  CREDIT_VALIDITY_MONTHS,
  formatPackagePrice,
} from "@/lib/billing/packages";
import {
  PRODUCT_BEST_FITS,
  PRODUCT_FEATURES,
  PRODUCT_LIMITATIONS,
} from "@/lib/product-facts";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const pageUrl = absoluteUrl("/pricing");
const reviewedAt = "2026-08-28";

export const metadata: Metadata = {
  title: "AI Visibility Benchmark Pricing",
  description:
    "Compare prepaid AI visibility benchmark pricing: $9 for a first audit, then $15 for one, $39 for three, or $99 for ten. No subscription or seat fees.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI Visibility Benchmark Pricing",
    description:
      "One complete, evidence-linked benchmark per credit. Compare every prepaid package and choose the right measurement cadence.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Visibility Benchmark Pricing",
    description: "Prepaid benchmarks from $9 with no subscription or seat fees.",
    images: [SOCIAL_IMAGE],
  },
};

const included = [
  ...PRODUCT_FEATURES,
  "Thirty-day access to stored answer evidence",
  "Like-for-like rerun comparisons",
] as const;

const pricingFaqs = [
  {
    question: "What does one benchmark credit include?",
    answer:
      "One credit runs one complete benchmark: 25 frozen buyer questions across four web-grounded providers, producing 100 planned answers with metrics, competitor and citation evidence, five prioritized actions, and PDF and CSV exports.",
  },
  {
    question: "Is the $9 price a subscription?",
    answer:
      "No. The $9 introductory price is a one-time first purchase. Later purchases are prepaid credits: $15 for one, $39 for three, or $99 for ten. There are no recurring seat or provider fees.",
  },
  {
    question: "When do credits expire?",
    answer: `Credits remain valid for ${CREDIT_VALIDITY_MONTHS} months. Answer evidence for a completed benchmark is retained for 30 days, so export the report and CSV before that window closes.`,
  },
  {
    question: "When is a subscription tracker a better choice?",
    answer:
      "Choose continuous monitoring when you need daily or weekly trend lines, alerts, a large prompt program, Perplexity coverage, or ongoing multi-project dashboards. 100 Questions is designed for controlled baselines and comparable reruns.",
  },
] as const;

export default function PricingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "AI Visibility Benchmark Pricing",
        description:
          "Prepaid pricing and fit guidance for the 100 Questions AI visibility benchmark.",
        isPartOf: { "@id": `${absoluteUrl()}#website` },
        about: { "@id": `${absoluteUrl()}#product` },
        dateModified: reviewedAt,
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
          { "@type": "ListItem", position: 2, name: "Pricing", item: pageUrl },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#070908] text-zinc-100">
      <AnalyticsEvent
        event="seo_landing_viewed"
        onceKey="pricing"
        properties={{ landing_page: "/pricing", keyword_cluster: "benchmark_pricing" }}
      />
      <MarketingHeader />
      <main>
        <header className="border-b border-white/[0.07]">
          <div className="page-shell py-16 sm:py-20 lg:py-24">
            <nav className="text-xs text-zinc-400" aria-label="Breadcrumb">
              <Link className="hover:text-zinc-200" href="/">Home</Link>{" "}
              <span aria-hidden="true">/</span>{" "}
              <span className="text-zinc-300">Pricing</span>
            </nav>
            <Badge variant="outline" className="mt-8 border-emerald-300/25 text-emerald-200">
              Prepaid · No subscription
            </Badge>
            <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              One credit. One complete AI visibility benchmark.
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
              Start with a complete $9 benchmark. Buy more only when you need a fresh baseline, a post-implementation rerun, or additional client capacity.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <MarketingCheckoutButton label="Buy my first benchmark — $9" />
              <Button asChild size="lg" variant="outline">
                <Link href="/sample-report">Inspect the complete sample <ArrowRight aria-hidden="true" /></Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
          <section aria-labelledby="packages-heading">
            <p className="eyebrow">Choose the project size</p>
            <h2 id="packages-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Pay for finished benchmarks, not dashboard access
            </h2>
            <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {BILLING_PACKAGES.map((billingPackage) => {
                const featured = billingPackage.id === "three";
                return (
                  <Card key={billingPackage.id} className={featured ? "border border-emerald-300/25 bg-emerald-300/[0.035]" : "bg-[#0a0d0b]"}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle>{billingPackage.name}</CardTitle>
                        {featured ? <Badge variant="success">Best value</Badge> : null}
                      </div>
                      <p className="pt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
                        {formatPackagePrice(billingPackage.priceCents)}
                      </p>
                      <CardDescription>{billingPackage.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="flex items-center gap-2 text-sm text-zinc-300">
                        <Check className="size-4 text-emerald-300" aria-hidden="true" />
                        {billingPackage.credits} complete benchmark{billingPackage.credits === 1 ? "" : "s"}
                      </p>
                      {billingPackage.id === "intro" ? (
                        <MarketingCheckoutButton className="mt-6" label="Buy first benchmark" size="default" variant="secondary" />
                      ) : (
                        <PackageSignUpButton
                          className="mt-6 w-full"
                          packageId={billingPackage.id}
                          variant={featured ? "default" : "secondary"}
                        >
                          Choose package
                        </PackageSignUpButton>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="mt-6 text-sm leading-6 text-zinc-400">
              The introductory price is available once per customer. Credits remain valid for {CREDIT_VALIDITY_MONTHS} months. Stripe confirms applicable taxes before payment.
            </p>
          </section>

          <section className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr]" aria-labelledby="included-heading">
            <div>
              <p className="eyebrow">Included in every run</p>
              <h2 id="included-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                The same evidence, regardless of package
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {included.map((item) => (
                <p key={item} className="flex gap-3 rounded-2xl bg-white/[0.035] p-4 text-sm leading-6 text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
                  <Check className="mt-1 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-[26px] border border-emerald-300/15 bg-emerald-300/[0.025] p-7 sm:p-9" aria-labelledby="research-proof-heading">
            <p className="eyebrow">Inspect the measurement work</p>
            <h2 id="research-proof-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
              The open Index publishes the evidence standard behind the product
            </h2>
            <p className="mt-4 max-w-3xl text-pretty leading-7 text-zinc-400">
              Review a frozen 25-product study with 80 grounded answers, 210
              cited domains, provider-level results, answer evidence, protocol,
              adjudications, and file hashes before buying a private benchmark.
            </p>
            <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 underline underline-offset-4" href="/ai-visibility-index">
              Explore the 2026 AI Visibility Index <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </section>

          <section aria-labelledby="fit-heading">
            <p className="eyebrow">Choose the right measurement model</p>
            <h2 id="fit-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Best for a bounded decision—not continuous monitoring
            </h2>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <Gauge className="size-6 text-emerald-300" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-semibold text-white">Use 100 Questions for</h3>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-400">
                  {PRODUCT_BEST_FITS.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </article>
              <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <Clock3 className="size-6 text-amber-300" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-semibold text-white">Choose continuous monitoring when</h3>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-400">
                  {PRODUCT_LIMITATIONS.map((item) => <li key={item}>• {item}</li>)}
                </ul>
                <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 underline underline-offset-4" href="/ai-seo-tools">
                  Compare measurement models <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-3" aria-label="How benchmark credits are used">
            {[
              [Gauge, "Baseline", "Measure the same 25 buyer questions across four providers before the project starts."],
              [FileSearch, "Implementation review", "Use answer and source evidence to prioritize technical, content, and authority work."],
              [RefreshCw, "Comparable rerun", "Reuse the frozen questions after meaningful work and compare directional movement."],
            ].map(([Icon, title, description]) => {
              const IconComponent = Icon as typeof Gauge;
              return (
                <article key={String(title)} className="rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                  <IconComponent className="size-5 text-emerald-300" aria-hidden="true" />
                  <h3 className="mt-5 font-semibold text-white">{String(title)}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{String(description)}</p>
                </article>
              );
            })}
          </section>

          <section aria-labelledby="pricing-faq-heading">
            <p className="eyebrow">Pricing questions</p>
            <h2 id="pricing-faq-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Know what you are buying before checkout
            </h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {pricingFaqs.map(({ question, answer }) => (
                <article key={question} className="rounded-[22px] bg-white/[0.025] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
                  <h3 className="font-semibold text-white">{question}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{answer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">First benchmark</p>
            <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">Start with one complete $9 benchmark.</h2>
                <p className="mt-3 max-w-2xl leading-7 text-zinc-800">Review the evidence, export the report, and decide whether a later rerun is worth buying.</p>
              </div>
              <MarketingCheckoutButton buttonClassName="bg-zinc-950 text-white hover:bg-zinc-800" label="Buy my first benchmark — $9" variant="secondary" />
            </div>
          </section>
        </div>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
