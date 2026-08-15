import {
  ArrowRight,
  BookOpen,
  CreditCard,
  ExternalLink,
  FileText,
  LifeBuoy,
  LockKeyhole,
  LogIn,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const path = "/support" as const;
const pageUrl = absoluteUrl(path);

export const metadata: Metadata = {
  title: "Support Center",
  description:
    "Get help with 100 Questions accounts, credits, billing, AI visibility benchmarks, reports, exports, the readiness checker, and public APIs.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Support Center · 100 Questions",
    description:
      "Self-service help for accounts, billing, benchmarks, reports, exports, and public developer tools.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Support Center · 100 Questions",
    description:
      "Self-service help for accounts, billing, benchmarks, reports, exports, and public developer tools.",
    images: [SOCIAL_IMAGE],
  },
};

const supportRoutes = [
  {
    icon: LogIn,
    title: "Account and access",
    description:
      "Sign in, find your private dashboard, and review the runs and credits attached to your account.",
    href: "/auth/sign-in",
    label: "Sign in",
  },
  {
    icon: FileText,
    title: "Benchmarks and reports",
    description:
      "Understand run status, provider coverage, evidence, scoring, exports, and comparable reruns.",
    href: "/faq#score-eligibility",
    label: "Read benchmark help",
  },
  {
    icon: CreditCard,
    title: "Billing and credits",
    description:
      "Review prepaid credits and billing controls. Keep the Stripe receipt for any purchase investigation.",
    href: "/dashboard",
    label: "Open billing controls",
  },
  {
    icon: Wrench,
    title: "Free tools and API",
    description:
      "Troubleshoot the readiness checker, MCP endpoint, downloadable templates, and public API surfaces.",
    href: "/ai-visibility-checker",
    label: "Open the free checker",
  },
] as const;

const troubleshootingSteps = [
  {
    title: "Open the affected item",
    description:
      "Use the same signed-in account and open the exact run, report, export, checkout return page, or public tool that has the problem.",
  },
  {
    title: "Preserve the identifiers",
    description:
      "Copy the benchmark run ID and note the time, browser, action, and visible error. For billing, keep the Stripe receipt private.",
  },
  {
    title: "Choose a safe route",
    description:
      "Use private account or receipt channels for sensitive issues. Use GitHub only for reproducible public-site or API problems with secrets removed.",
  },
] as const;

const supportFaqs = [
  {
    question: "I cannot sign in. What should I check first?",
    answer:
      "Return to the sign-in page in the browser and email account used for checkout. If the problem follows a purchase, keep the Stripe receipt and checkout return link available, but do not post either one publicly.",
  },
  {
    question: "My payment succeeded but I do not see a credit.",
    answer:
      "Open the checkout return link in the same browser that started payment, then refresh the dashboard. If the credit still does not appear, use the private route on the Stripe receipt or applicable service notification and include the receipt plus the account email used at checkout.",
  },
  {
    question: "Why is a provider missing from my report?",
    answer:
      "A provider call must succeed and return valid web sources to be score-eligible. Failed, unsupported, or unsourced calls remain visible in coverage rather than being counted as silent misses. Open the run to review the recorded exclusion reason.",
  },
  {
    question: "What should I send when an export fails?",
    answer:
      "Include the run ID, export type, time of the attempt, browser, and visible error text. Do not attach a private report to a public issue. First try the export again from the run page after the benchmark is complete.",
  },
  {
    question: "Where should I report a public checker or API bug?",
    answer:
      "Use the public GitHub issue tracker for a reproducible problem involving public pages, downloads, the readiness API, or MCP endpoint. Remove private domains, tokens, receipts, personal data, and report contents before posting.",
  },
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "100 Questions Support Center",
      description:
        "Self-service help for 100 Questions accounts, billing, benchmarks, reports, exports, and public developer tools.",
      isPartOf: { "@id": `${absoluteUrl()}#website` },
      dateModified: "2026-08-15",
      inLanguage: "en-US",
    },
    {
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: supportFaqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
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
          name: "Support",
          item: pageUrl,
        },
      ],
    },
  ],
};

export default function SupportPage() {
  return (
    <>
      <main className="min-h-screen bg-[#070908] text-zinc-100">
        <MarketingHeader />

        <header className="border-b border-white/[0.07]">
          <div className="page-shell py-16 sm:py-20 lg:py-24">
            <nav className="text-xs text-zinc-400" aria-label="Breadcrumb">
              <Link className="hover:text-zinc-200" href="/">
                Home
              </Link>{" "}
              <span aria-hidden="true">/</span>{" "}
              <span className="text-zinc-300">Support</span>
            </nav>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_19rem] lg:items-end">
              <div className="max-w-4xl">
                <Badge
                  variant="outline"
                  className="border-emerald-300/25 text-emerald-200"
                >
                  Support center
                </Badge>
                <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                  Get unstuck without losing the evidence.
                </h1>
                <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                  Find the right next step for account access, prepaid credits,
                  benchmark runs, reports, exports, and the public readiness
                  tools. Sensitive account and payment details stay private.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild size="lg">
                  <Link href="/auth/sign-in">
                    Sign in to your account <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#common-questions">Browse common questions</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <section className="page-shell py-16 sm:py-20" aria-labelledby="choose-help-heading">
          <div className="max-w-2xl">
            <p className="eyebrow">Choose a help route</p>
            <h2
              id="choose-help-heading"
              className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
            >
              Start with the part of the product you are using.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {supportRoutes.map(({ icon: Icon, title, description, href, label }) => (
              <article
                key={title}
                className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-7"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(110,231,183,0.14)]">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-white">
                  {title}
                </h3>
                <p className="mt-3 text-pretty text-sm leading-6 text-zinc-400">
                  {description}
                </p>
                <Link
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-300 hover:text-emerald-200"
                  href={href}
                >
                  {label} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-white/[0.018]">
          <div className="page-shell py-16 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="eyebrow">Before escalating</p>
                <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                  Three details make support faster.
                </h2>
                <p className="mt-4 text-pretty text-sm leading-6 text-zinc-400">
                  Preserve enough context to reproduce the problem without
                  sharing private report or payment data in public.
                </p>
              </div>

              <ol className="grid gap-4 sm:grid-cols-3">
                {troubleshootingSteps.map(({ title, description }, index) => (
                  <li
                    key={title}
                    className="rounded-[22px] bg-[#0b0e0c] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]"
                  >
                    <span className="font-mono text-xs text-emerald-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="page-shell py-16 sm:py-20" aria-labelledby="safe-report-heading">
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="rounded-[26px] border border-emerald-300/15 bg-emerald-300/[0.035] p-6 sm:p-8">
              <BookOpen className="size-6 text-emerald-300" aria-hidden="true" />
              <h2
                id="safe-report-heading"
                className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white"
              >
                Include useful context
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-400">
                <li>• Run ID or exact public URL</li>
                <li>• Time of the problem and action attempted</li>
                <li>• Browser, export type, or public endpoint used</li>
                <li>• Exact visible error text and a safe reproduction sequence</li>
              </ul>
            </article>

            <article className="rounded-[26px] border border-amber-300/15 bg-amber-300/[0.03] p-6 sm:p-8">
              <LockKeyhole className="size-6 text-amber-200" aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">
                Keep sensitive details private
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-400">
                <li>• Do not post receipts, tokens, or account email addresses</li>
                <li>• Do not attach private reports or raw benchmark answers</li>
                <li>• Do not disclose security findings in a public issue</li>
                <li>• Use the private route on the applicable receipt or service notice</li>
              </ul>
            </article>
          </div>
        </section>

        <section
          id="common-questions"
          className="border-y border-white/[0.07] bg-white/[0.018]"
          aria-labelledby="common-questions-heading"
        >
          <div className="page-shell py-16 sm:py-20">
            <div className="max-w-2xl">
              <p className="eyebrow">Common questions</p>
              <h2
                id="common-questions-heading"
                className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Resolve the most common issues first.
              </h2>
            </div>

            <div className="mt-10 grid gap-3">
              {supportFaqs.map(({ question, answer }) => (
                <details
                  key={question}
                  className="group rounded-[20px] bg-[#0b0e0c] px-5 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] open:bg-white/[0.035] sm:px-6"
                >
                  <summary className="cursor-pointer list-none pr-8 font-medium text-zinc-100 marker:content-none">
                    {question}
                  </summary>
                  <p className="mt-4 max-w-4xl text-pretty text-sm leading-6 text-zinc-400">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="page-shell py-16 sm:py-20">
          <div className="grid gap-8 rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.13em]">
                <LifeBuoy className="size-5" aria-hidden="true" />
                Still need help?
              </div>
              <h2 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.04em]">
                Use the route that matches the sensitivity of the issue.
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-zinc-800">
                Account, billing, privacy, and security issues need a private
                path. Reproducible public-site, download, checker, or API bugs
                can use the public issue tracker after sensitive details are
                removed.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg" className="bg-zinc-950 text-white hover:bg-zinc-800">
                <Link href="/contact">Open contact options</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-zinc-950/20 bg-transparent text-zinc-950 hover:bg-zinc-950/10"
              >
                <a
                  href="https://github.com/kyl3kan3/100Questions/issues"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                >
                  Public issue tracker <ExternalLink aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <JsonLd data={structuredData} />
    </>
  );
}
