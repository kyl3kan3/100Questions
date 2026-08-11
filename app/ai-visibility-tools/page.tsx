import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  Gauge,
  Radar,
  RefreshCw,
  SearchCheck,
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
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const pageUrl = absoluteUrl("/ai-visibility-tools");
const publishedAt = "2026-08-11T00:00:00.000Z";

export const metadata: Metadata = {
  title: "AI Visibility Tools: Check, Audit & Track",
  description:
    "Find the right AI visibility tools for technical checks, multi-model audits, prompt tracking, scoring, AEO, and GEO. Start with free tools or compare platforms.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI Visibility Tools: Check, Audit, Track, and Improve",
    description:
      "A practical hub for choosing AI visibility checkers, audits, trackers, score calculators, and AEO or GEO platforms.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "article",
    locale: "en_US",
    publishedTime: publishedAt,
    modifiedTime: publishedAt,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Visibility Tools: Check, Audit, Track, and Improve",
    description:
      "Choose an AI visibility tool by the question you need it to answer.",
    images: [SOCIAL_IMAGE],
  },
};

const startingPoints = [
  {
    icon: SearchCheck,
    label: "Free technical check",
    title: "AI visibility readiness checker",
    description:
      "Check indexability, AI crawler access, metadata, schema, sitemaps, and llms.txt without an account.",
    href: "/ai-visibility-checker",
    cta: "Run the free checker",
  },
  {
    icon: Radar,
    label: "Actual-answer benchmark",
    title: "AI visibility audit",
    description:
      "Test one frozen set of 25 buyer questions across four grounded AI providers and preserve the evidence.",
    href: "/ai-visibility-audit",
    cta: "Explore the audit",
  },
  {
    icon: BarChart3,
    label: "Software shortlist",
    title: "Best AI visibility tools",
    description:
      "Compare tracking, broad research, SEO suites, enterprise GEO, and fixed audits by the job each does.",
    href: "/ai-seo-tools",
    cta: "Compare six tools",
  },
] as const;

const toolMap = [
  {
    icon: Gauge,
    name: "AI visibility score calculator",
    job: "Turn observed answers into a transparent composite without hiding the component rates.",
    href: "/ai-visibility-score-calculator",
    cost: "Free",
  },
  {
    icon: FileSearch,
    name: "ChatGPT brand visibility test",
    job: "Run a focused manual test and preserve prompts, answers, citations, and dates.",
    href: "/chatgpt-brand-visibility-test",
    cost: "Free",
  },
  {
    icon: ClipboardCheck,
    name: "AI visibility audit checklist",
    job: "Review technical access, entity clarity, content, evidence, corroboration, and measurement.",
    href: "/ai-visibility-audit-checklist",
    cost: "Free",
  },
  {
    icon: RefreshCw,
    name: "AI prompt tracking spreadsheet",
    job: "Track provider conditions, answers, citations, competitors, decisions, and comparable reruns.",
    href: "/ai-search-prompt-tracking-spreadsheet",
    cost: "Free",
  },
  {
    icon: Radar,
    name: "AEO tools comparison",
    job: "Compare six answer engine optimization tools by workflow, cadence, evidence, and tradeoffs.",
    href: "/answer-engine-optimization-tools",
    cost: "Guide",
  },
  {
    icon: BarChart3,
    name: "AI visibility report template",
    job: "Report scope, coverage, mentions, prominence, citations, limitations, and next actions.",
    href: "/ai-visibility-report-template",
    cost: "Free",
  },
] as const;

const faqs = [
  {
    question: "What are AI visibility tools?",
    answer:
      "AI visibility tools measure or improve how a brand appears in AI-generated answers. The category includes technical readiness checkers, prompt trackers, large answer databases, score calculators, citation tools, content workflows, and fixed multi-model audits. These products solve different problems and should not be compared by feature count alone.",
  },
  {
    question: "What does an AI visibility platform do?",
    answer:
      "An AI visibility platform usually combines recurring prompt collection with brand mentions, position or prominence, sentiment, citations, competitors, reporting, and team workflows. Some platforms add content recommendations or broader SEO data. Confirm how answers are collected, which providers and markets are included, and whether the evidence behind every metric is inspectable.",
  },
  {
    question: "How do I choose an AI visibility tool?",
    answer:
      "Start with the decision: use a checker for technical readiness, an audit for a controlled baseline, a tracker for recurring trends and alerts, a research database for market discovery, an SEO suite for combined workflows, or an enterprise platform for multi-team operations. Then compare provider coverage, prompt method, evidence access, exclusions, exports, cadence, and total cost.",
  },
  {
    question: "Is an AI visibility tracker the same as an AI visibility audit?",
    answer:
      "No. A tracker repeatedly checks a configured prompt set and is useful for trend lines and alerts. An audit freezes the questions, providers, scoring rules, and timestamp to create one inspectable baseline and a bounded deliverable. Many teams use one or the other; some use an audit to establish a baseline before adopting continuous tracking.",
  },
  {
    question: "Are there free AI visibility tools?",
    answer:
      "Yes. 100 Questions offers a free technical readiness checker, score calculator, manual ChatGPT brand visibility test, audit checklist, prompt library, tracking spreadsheet, and reporting templates. Free tools can establish a useful process, but a manual sample remains vulnerable to personalization, small sample size, and inconsistent evidence capture.",
  },
  {
    question: "Can AI visibility software guarantee a brand recommendation?",
    answer:
      "No. Generated answers vary by provider, model, prompt, locale, search results, and time. A credible tool can measure a defined sample, expose evidence, identify gaps, and support repeatable comparisons; it cannot guarantee a future mention, citation, recommendation, or rank.",
  },
] as const;

export default function AiVisibilityToolsPage() {
  const listedTools = [...startingPoints, ...toolMap];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: "AI Visibility Tools: Check, Audit, Track, and Improve",
        description:
          "A practical hub for selecting AI visibility checkers, audits, trackers, calculators, and AEO or GEO platforms by use case.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: publishedAt,
        dateModified: publishedAt,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": `${absoluteUrl()}#organization` },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        about: [
          "AI visibility tools",
          "AI visibility platform",
          "AI visibility tracker",
          "AEO tools",
          "GEO tools",
        ],
        inLanguage: "en-US",
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#tools`,
        name: "AI visibility tools and resources by use case",
        itemListElement: listedTools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: "title" in tool ? tool.title : tool.name,
          url: absoluteUrl(tool.href),
        })),
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
            name: "AI visibility tools",
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
                <span className="text-zinc-300">AI visibility tools</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                Tool hub · Free and paid options
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                AI visibility tools to check, audit, track, and improve your brand
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                Find the right tool for the question in front of you: can AI
                crawlers read the site, do answer engines mention the brand,
                which competitors win instead, and did the work improve the
                next comparable test?
              </p>
              <ContentByline
                publishedAt={publishedAt}
                publishedLabel="August 11, 2026"
                note="Organized by measurement job, not feature count."
              />
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section aria-labelledby="start-heading">
              <p className="eyebrow">Choose a starting point</p>
              <h2
                id="start-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Three different jobs, three different tools
              </h2>
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {startingPoints.map(
                  ({ icon: Icon, label, title, description, href, cta }) => (
                    <Card key={title} className="bg-[#0a0d0b]">
                      <CardHeader>
                        <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300">
                          <Icon className="size-4" aria-hidden="true" />
                        </div>
                        <p className="eyebrow">{label}</p>
                        <CardTitle as="h3" className="pt-2 text-xl">
                          {title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm leading-6 text-zinc-400">{description}</p>
                        <Button asChild variant="link" className="mt-4">
                          <Link href={href}>
                            {cta} <ArrowRight aria-hidden="true" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </section>

            <section aria-labelledby="tool-map-heading">
              <p className="eyebrow">Free tools and decision guides</p>
              <h2
                id="tool-map-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Build the rest of the measurement workflow
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {toolMap.map(({ icon: Icon, name, job, href, cost }) => (
                  <Link
                    key={name}
                    href={href}
                    className="group rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.045]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Icon className="size-5 text-emerald-300" aria-hidden="true" />
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                        {cost}
                      </span>
                    </div>
                    <h3 className="mt-5 font-semibold text-white group-hover:text-emerald-200">
                      {name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{job}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section aria-labelledby="measurement-model-heading">
              <p className="eyebrow">Measurement models</p>
              <h2
                id="measurement-model-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                An AI visibility platform is not automatically the right answer
              </h2>
              <p className="mt-5 max-w-3xl text-pretty leading-7 text-zinc-400">
                Start with the decision and required cadence. A broader platform
                earns its cost when the team will use its recurring data and
                workflow; a smaller tool or fixed audit is often enough for a
                technical check, baseline, client deliverable, or occasional rerun.
              </p>
              <div
                className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                role="region"
                aria-label="AI visibility tool type comparison"
                tabIndex={0}
              >
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-zinc-200">
                    <tr>
                      <th className="p-4 font-semibold">Tool type</th>
                      <th className="p-4 font-semibold">Question it answers</th>
                      <th className="p-4 font-semibold">Typical cadence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08] text-zinc-400">
                    <tr>
                      <th className="p-4 font-medium text-zinc-200">Readiness checker</th>
                      <td className="p-4">Can important public pages be accessed and understood?</td>
                      <td className="p-4">After technical or content changes</td>
                    </tr>
                    <tr>
                      <th className="p-4 font-medium text-zinc-200">Fixed audit</th>
                      <td className="p-4">Where does the brand appear in one controlled sample?</td>
                      <td className="p-4">Baseline and post-implementation rerun</td>
                    </tr>
                    <tr>
                      <th className="p-4 font-medium text-zinc-200">Prompt tracker</th>
                      <td className="p-4">How does a configured panel move over time?</td>
                      <td className="p-4">Daily, weekly, or monthly</td>
                    </tr>
                    <tr>
                      <th className="p-4 font-medium text-zinc-200">Research database</th>
                      <td className="p-4">What brands and sources appear across a broader market?</td>
                      <td className="p-4">Ongoing research</td>
                    </tr>
                    <tr>
                      <th className="p-4 font-medium text-zinc-200">SEO or GEO platform</th>
                      <td className="p-4">How do teams connect findings to optimization work?</td>
                      <td className="p-4">Continuous program</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="workflow-heading">
              <p className="eyebrow">A practical sequence</p>
              <h2
                id="workflow-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Use tools to support a loop, not manufacture a mystery score
              </h2>
              <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Check", "Remove access and interpretation problems on the pages AI systems need."],
                  ["Measure", "Freeze the questions and preserve answer, provider, source, and coverage evidence."],
                  ["Improve", "Prioritize the technical, content, entity, evidence, and corroboration gaps the answers reveal."],
                  ["Rerun", "Repeat the same conditions after changes become retrievable and compare the underlying metrics."],
                ].map(([title, description], index) => (
                  <li
                    key={title}
                    className="rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <span className="font-mono text-xs text-emerald-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 font-semibold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section id="faq" aria-labelledby="faq-heading">
              <p className="eyebrow">AI visibility tool questions</p>
              <h2
                id="faq-heading"
                className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Frequently asked questions
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
                    Need an actual-answer baseline?
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    Run 25 buyer questions across four grounded AI providers.
                  </h2>
                </div>
                <MarketingCheckoutButton
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
