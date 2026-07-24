import { ArrowRight, Check, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatPackagePrice,
  getPublicBillingPackages,
} from "@/lib/billing/packages";
import {
  absoluteUrl,
  SITE_NAME,
  SITE_UPDATED_AT,
  SOCIAL_IMAGE,
} from "@/lib/site";

const pageUrl = absoluteUrl("/for-agencies");

export const metadata: Metadata = {
  title: "AI Visibility Reports for Agencies & Consultants",
  description:
    "Deliver client-ready AI visibility audits without another subscription: prepaid credits, evidence-linked findings, PDF and CSV exports, and comparable reruns.",
  keywords: [
    "AI visibility report",
    "AI visibility audit for agencies",
    "GEO services",
    "AI search audit",
    "client SEO report",
    "AI visibility for clients",
    "agency AI report",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI Visibility Reports for Agencies & Consultants",
    description:
      "Answer “are we showing up in AI?” with a defensible, evidence-linked report you can hand to any client.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Visibility Reports for Agencies & Consultants",
    description:
      "Prepaid AI visibility audits with stored evidence, five prioritized actions, and exports built for client delivery.",
    images: [SOCIAL_IMAGE],
  },
};

const workflow = [
  {
    title: "Pitch with a baseline",
    description:
      "Run a benchmark during the audit or proposal stage. “Here is where AI mentions you, who appears instead, and the sources models trust” is a sharper opener than a promise.",
  },
  {
    title: "Deliver the report",
    description:
      "Every run produces a client-ready report: visibility, prominence, share of voice, citations, sentiment, and coverage, each linked to stored answer evidence, plus five prioritized actions and PDF and CSV exports.",
  },
  {
    title: "Prove the movement",
    description:
      "After you ship content, entity, and authority fixes, rerun the identical frozen question set and present the before-and-after comparison at the next review.",
  },
] as const;

const fits = [
  "Evidence-linked findings you can defend in a client meeting",
  "Competitor share of voice with the competitors you choose",
  "Five prioritized actions mapped to stored answers and sources",
  "PDF and CSV exports for decks, audits, and deliverables",
  "Reruns that reuse the same questions for honest comparisons",
  "Prepaid credits—no per-client subscription or seat fees",
] as const;

const faqs = [
  {
    question: "Can I use the reports with my clients?",
    answer:
      "Yes. Runs are private to your account, and each completed benchmark includes PDF and CSV exports designed as client-ready deliverables. Your client does not need an account—you run the benchmark, export the report, and present it alongside your recommendations.",
  },
  {
    question: "How does pricing work for multiple clients?",
    answer:
      "Credits are prepaid and valid for 12 months: one credit runs one complete benchmark for one subject. Agencies typically buy the three-pack or ten-pack and allocate credits across clients as audits, deliverables, or rerun comparisons come up. There is no subscription, seat fee, or per-provider add-on.",
  },
  {
    question: "How do reruns work for retainer clients?",
    answer:
      "A rerun reuses the exact question set from the original benchmark, then compares visibility, citations, competitor mentions, and coverage against that baseline. That makes it a natural artifact for quarterly reviews: same test, new timestamp, directional movement you can show.",
  },
  {
    question: "What should I tell clients about the methodology?",
    answer:
      "Point them at the public methodology page. Results are directional, API-grounded snapshots across OpenAI, Claude, Gemini, and Grok with shared web-search grounding—not replicas of any individual's consumer chat session. Metrics with under 90% provider coverage are marked provisional, and every number links to stored evidence, which is exactly the transparency a skeptical client wants.",
  },
] as const;

export default function ForAgenciesPage() {
  const packages = getPublicBillingPackages(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "AI Visibility Reports for Agencies & Consultants",
        description:
          "Client-ready AI visibility audits with prepaid credits, evidence-linked findings, exports, and comparable reruns.",
        isPartOf: { "@id": `${absoluteUrl()}#website` },
        dateModified: SITE_UPDATED_AT,
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
            name: "For agencies",
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
        <header className="border-b border-white/[0.07]">
          <div className="page-shell py-16 sm:py-20 lg:py-24">
            <nav className="text-xs text-zinc-400" aria-label="Breadcrumb">
              <Link className="hover:text-zinc-200" href="/">
                Home
              </Link>{" "}
              <span aria-hidden="true">/</span>{" "}
              <span className="text-zinc-300">For agencies</span>
            </nav>
            <Badge
              variant="outline"
              className="mt-8 border-emerald-300/25 text-emerald-200"
            >
              For agencies &amp; consultants
            </Badge>
            <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              Client-ready AI visibility reports, without another subscription
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
              Your clients are already asking whether AI recommends them. 100
              Questions turns that conversation into a deliverable: a scored,
              evidence-linked audit across OpenAI, Claude, Gemini, and Grok
              that you run per client, export, and present—paid per benchmark,
              not per seat.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">
                  Run a client benchmark <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sample-report">See the deliverable first</Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
          <section aria-labelledby="agency-workflow-heading">
            <p className="eyebrow">Where it fits</p>
            <h2
              id="agency-workflow-heading"
              className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
            >
              Pitch, deliver, prove
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {workflow.map(({ title, description }, index) => (
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

          <section aria-labelledby="agency-fit-heading">
            <div className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/[0.025] p-7 sm:p-9">
              <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
                <div>
                  <p className="eyebrow">Built for client work</p>
                  <h2
                    id="agency-fit-heading"
                    className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
                  >
                    A deliverable, not another dashboard login
                  </h2>
                  <Button asChild variant="link" className="mt-4">
                    <Link href="/sample-report">
                      Open the complete sample report
                    </Link>
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {fits.map((item) => (
                    <p
                      key={item}
                      className="flex items-center gap-3 rounded-xl bg-black/20 px-4 py-3 text-sm text-zinc-200"
                    >
                      <Check className="size-4 shrink-0 text-emerald-300" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="agency-pricing-heading">
            <p className="eyebrow">Per-benchmark economics</p>
            <h2
              id="agency-pricing-heading"
              className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
            >
              Fixed cost in, billable deliverable out
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
              Credits are prepaid and valid for 12 months. Most agencies fold
              the benchmark into an audit, GEO engagement, or quarterly
              review—your margin is the packaging, analysis, and remediation
              work around it.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {packages.map((billingPackage) => (
                <Card
                  key={billingPackage.id}
                  className={
                    billingPackage.id === "ten"
                      ? "border border-emerald-300/25 bg-emerald-300/[0.035]"
                      : "bg-[#0a0d0b]"
                  }
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle>{billingPackage.name}</CardTitle>
                      {billingPackage.id === "ten" ? (
                        <Badge variant="success">Agency pick</Badge>
                      ) : null}
                    </div>
                    <p className="pt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
                      {formatPackagePrice(billingPackage.priceCents)}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="size-4 text-emerald-300" />
                      {billingPackage.credits} complete benchmark
                      {billingPackage.credits === 1 ? "" : "s"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section aria-labelledby="agency-faq-heading">
            <p className="eyebrow">Agency questions</p>
            <h2
              id="agency-faq-heading"
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
                  First client audit
                </p>
                <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                  Run the first benchmark for $9. Bill it inside your next
                  audit.
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
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
