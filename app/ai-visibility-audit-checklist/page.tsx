import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Download,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const pageUrl = absoluteUrl("/ai-visibility-audit-checklist");
const RESOURCE_DATE = {
  iso: "2026-07-29",
  label: "July 29, 2026",
} as const;

export const metadata: Metadata = {
  title: "Free AI Visibility Audit Checklist",
  description:
    "Use this free AI visibility audit checklist to review crawl access, brand entities, answer-ready content, citation evidence, off-site corroboration, and measurement.",
  keywords: [
    "AI visibility audit checklist",
    "AI search readiness checklist",
    "GEO audit checklist",
    "AEO checklist",
    "LLM SEO checklist",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free AI Visibility Audit Checklist",
    description:
      "A practical, downloadable checklist for auditing AI search access, entity clarity, content, evidence, corroboration, and measurement.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "article",
    locale: "en_US",
    publishedTime: RESOURCE_DATE.iso,
    modifiedTime: RESOURCE_DATE.iso,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Visibility Audit Checklist",
    description:
      "A reusable AI search readiness worksheet for agencies, consultants, and in-house teams.",
    images: [SOCIAL_IMAGE],
  },
};

const checklist = [
  {
    title: "Define the audit",
    description:
      "Freeze the subject and test conditions before collecting answers.",
    items: [
      "Record the brand name, canonical domain, category, market, and locale.",
      "List known aliases and the competitors you want to compare.",
      "Save the audit date, providers, model identifiers, and question set.",
      "Separate neutral discovery questions from brand-named diagnostic questions.",
    ],
  },
  {
    title: "Check technical access",
    description:
      "Confirm that the public pages you want retrieved are actually available.",
    items: [
      "Verify indexability, canonical URLs, XML sitemaps, and internal links.",
      "Confirm important content is present in rendered HTML.",
      "Review robots.txt and CDN bot controls for the crawlers you intend to allow.",
      "Check that important pages are fast and reachable without authentication.",
    ],
  },
  {
    title: "Clarify the brand entity",
    description:
      "Make core facts consistent across owned and third-party pages.",
    items: [
      "Use one company name, canonical domain, and category description.",
      "Keep product vocabulary, pricing facts, and audience descriptions consistent.",
      "Align official profiles and important directory listings.",
      "Correct outdated or conflicting company information.",
    ],
  },
  {
    title: "Audit answers and evidence",
    description:
      "Give answer systems clear, supportable material to retrieve and cite.",
    items: [
      "Map pages to discovery, comparison, implementation, risk, pricing, and alternative questions.",
      "Lead answer-focused sections with a direct response before supporting detail.",
      "Add relevant examples, methods, source links, dates, and limitations.",
      "Identify generic pages that offer no original evidence or useful distinction.",
    ],
  },
  {
    title: "Review off-site corroboration",
    description:
      "Find the independent sources that confirm or contradict owned claims.",
    items: [
      "Audit important profiles, reviews, expert references, and category roundups.",
      "Find unlinked brand mentions and confirm that linked mentions use the canonical URL.",
      "Note recurring third-party domains cited in answers where the brand is absent.",
      "Prioritize accurate, relevant listings with real editorial or user value.",
    ],
  },
  {
    title: "Measure and plan the rerun",
    description:
      "Keep visibility, citations, and execution coverage separate.",
    items: [
      "Record mentions, prominence, competitor share of voice, owned citations, and sentiment separately.",
      "Track provider coverage and preserve the answers and sources behind each metric.",
      "Document exclusions instead of counting failed or ungrounded answers as misses.",
      "Rerun the same frozen questions after meaningful changes become retrievable.",
    ],
  },
] as const;

export default function AiVisibilityAuditChecklistPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        headline: "Free AI Visibility Audit Checklist",
        description:
          "A practical checklist for reviewing AI search access, entity clarity, answer-ready content, evidence, corroboration, and measurement.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: RESOURCE_DATE.iso,
        dateModified: RESOURCE_DATE.iso,
        author: { "@id": `${absoluteUrl()}#organization` },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        inLanguage: "en-US",
        about: [
          "AI visibility audit",
          "Answer engine optimization",
          "Generative engine optimization",
          "LLM SEO",
        ],
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
            name: "AI visibility audit checklist",
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
              <span className="text-zinc-300">
                AI visibility audit checklist
              </span>
            </nav>
            <Badge
              variant="outline"
              className="mt-8 border-emerald-300/25 text-emerald-200"
            >
              Free agency resource
            </Badge>
            <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              AI visibility audit checklist
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
              A reusable 24-point worksheet for reviewing whether a brand can
              be retrieved, understood, supported, and measured across
              AI-generated answers.
            </p>
            <p className="mt-4 text-sm text-zinc-400">
              Published:{" "}
              <time dateTime={RESOURCE_DATE.iso}>{RESOURCE_DATE.label}</time>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="/ai-visibility-audit-checklist.csv" download>
                  Download the CSV worksheet <Download aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/methodology">
                  Review the methodology <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="page-shell space-y-16 py-16 sm:py-20 lg:py-24">
          <section
            aria-labelledby="use-checklist-heading"
            className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]"
          >
            <div>
              <p className="eyebrow">How to use it</p>
              <h2
                id="use-checklist-heading"
                className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                Audit first, prioritize second
              </h2>
            </div>
            <div className="space-y-4 text-pretty leading-7 text-zinc-400">
              <p>
                Complete the checklist against one brand and one defined
                market. Attach URLs or evidence in the worksheet notes rather
                than relying on a simple yes or no.
              </p>
              <p>
                This is a readiness framework, not a ranking guarantee. Pair it
                with a frozen question set and preserve the answers, citations,
                provider details, and coverage behind the result.
              </p>
            </div>
          </section>

          <section aria-labelledby="checklist-heading">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">24-point worksheet</p>
                <h2
                  id="checklist-heading"
                  className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
                >
                  Work from access to evidence, then measurement
                </h2>
              </div>
              <ClipboardCheck
                className="hidden size-8 text-emerald-300 sm:block"
                aria-hidden="true"
              />
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {checklist.map((section, sectionIndex) => (
                <article
                  key={section.title}
                  className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-7"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs text-emerald-300">
                      {String(sectionIndex + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">
                        {section.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm leading-6 text-zinc-300"
                      >
                        <span
                          className="mt-1.5 size-3.5 shrink-0 rounded-sm border border-zinc-600"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
            <CheckCircle2 className="size-6" aria-hidden="true" />
            <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                  See a completed example
                </p>
                <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                  Review the questions, provider differences, sources, and
                  actions in a full sample report.
                </h2>
              </div>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="bg-zinc-950 text-white hover:bg-zinc-800"
              >
                <Link href="/sample-report">
                  Open the sample report <ArrowRight aria-hidden="true" />
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
