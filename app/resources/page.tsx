import { ArrowRight, LibraryBig } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ContentByline } from "@/components/content-byline";
import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { buildFaqPageNode } from "@/lib/faq-schema";
import { RESOURCE_COUNT, RESOURCE_GROUPS } from "@/lib/resource-catalog";
import {
  absoluteUrl,
  SITE_NAME,
  SOCIAL_IMAGE,
} from "@/lib/site";

const pageUrl = absoluteUrl("/resources");
const publishedAt = "2026-08-10";
const modifiedAt = "2026-10-15";

const resourceFaqs = [
  {
    question: "What free AI visibility resources does 100 Questions publish?",
    answer:
      "The library includes open research such as the 2026 AI Visibility Index, practical guides, free checkers and calculators, downloadable templates and spreadsheets, and software comparison pages for AEO, GEO, and AI SEO tools.",
  },
  {
    question: "Where should I start if I am comparing AI visibility software?",
    answer:
      "Start with the AI visibility tools hub for route-by-job navigation, then read the best AI SEO tools comparison, Profound alternatives, or Otterly alternatives pages depending on whether you need monitoring, enterprise AEO, or a prepaid audit.",
  },
  {
    question: "Are the templates and spreadsheets gated behind email?",
    answer:
      "No. Every download on this page is ungated. Use the on-page descriptions to choose the right template, then download the file directly.",
  },
  {
    question: "How often are comparison pages updated?",
    answer:
      "Comparison and pricing pages are updated when first-party vendor documentation changes materially. Each page shows a published or reviewed date in the byline; verify live vendor pricing before purchasing.",
  },
] as const;

export const metadata: Metadata = {
  title: "AI Visibility Resources & Tool Guides",
  description:
    "Free AI visibility guides, Profound & Otterly alternatives, SEO tool comparisons, checkers, templates, and open research—no email gate.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free AI Visibility Resources",
    description:
      "Practical guides, open research, free tools, templates, and transparent AEO and GEO comparisons from 100 Questions.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Visibility Resources",
    description:
      "Research, guides, tools, templates, and comparisons for evidence-led AI visibility work.",
    images: [SOCIAL_IMAGE],
  },
};

export default function ResourcesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#collection`,
        url: pageUrl,
        name: "100 Questions AI visibility resources",
        description:
          "A curated library of AI visibility research, guides, free tools, templates, and software comparisons.",
        isPartOf: { "@id": `${absoluteUrl()}#website` },
        datePublished: publishedAt,
        dateModified: modifiedAt,
        inLanguage: "en-US",
        mainEntity: { "@id": `${pageUrl}#resources` },
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#resources`,
        name: "AI visibility resource library",
        numberOfItems: RESOURCE_COUNT,
        itemListElement: RESOURCE_GROUPS.flatMap((group) =>
          group.resources.map((resource, index) => ({
            "@type": "ListItem",
            position:
              RESOURCE_GROUPS.slice(
                0,
                RESOURCE_GROUPS.findIndex((candidate) => candidate.id === group.id),
              ).reduce((total, candidate) => total + candidate.resources.length, 0) +
              index +
              1,
            name: resource.title,
            url: absoluteUrl(resource.href),
          })),
        ),
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
            name: "Resources",
            item: pageUrl,
          },
        ],
      },
      buildFaqPageNode(pageUrl, resourceFaqs, {
        name: "AI visibility resources FAQ",
      }),
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
              <span className="text-zinc-300">Resources</span>
            </nav>
            <Badge
              variant="outline"
              className="mt-8 border-emerald-300/25 text-emerald-200"
            >
              {RESOURCE_COUNT} ungated resources
            </Badge>
            <div className="mt-6 flex max-w-5xl items-start gap-5">
              <LibraryBig
                className="mt-1 hidden size-10 shrink-0 text-emerald-300 sm:block"
                aria-hidden="true"
              />
              <div>
                <h1 className="text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                  AI visibility resources built for evidence, not hype
                </h1>
                <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                  Start with open research and methodology, learn the core
                  workflows, use the free tools, then compare software by the
                  decision it actually supports.
                </p>
                <ContentByline
                  publishedAt={publishedAt}
                  publishedLabel="August 10, 2026"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
          <section aria-labelledby="featured-comparisons-heading">
            <div className="grid gap-5 lg:grid-cols-[0.68fr_1.32fr] lg:items-end">
              <div>
                <p className="eyebrow">Most-read comparisons</p>
                <h2
                  id="featured-comparisons-heading"
                  className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
                >
                  Software guides buyers search for
                </h2>
              </div>
              <p className="max-w-2xl text-pretty leading-7 text-zinc-400">
                These pages go deeper than a feature checklist. Each one compares
                vendors by measurement job, evidence model, cadence, and honest
                tradeoffs—with sourced pricing notes and links back to first-party
                documentation.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  href: "/ai-seo-tools",
                  title: "AI SEO tools for visibility",
                  description:
                    "Six tools for tracking, SEO suites, enterprise GEO, and prepaid audits—matched to the decision you need to make.",
                },
                {
                  href: "/profound-alternative",
                  title: "Profound alternatives",
                  description:
                    "Prepaid audit, daily monitor, prompt tracker, or cheaper AEO stack—with when Profound is still the better platform.",
                },
                {
                  href: "/otterly-alternative",
                  title: "Otterly.AI alternatives",
                  description:
                    "Daily prompt tracking vs a frozen 100-answer audit, with cadence and pricing tradeoffs spelled out.",
                },
              ].map((item) => (
                <article
                  key={item.href}
                  className="flex h-full flex-col rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                >
                  <h3 className="text-balance text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-pretty text-sm leading-6 text-zinc-400">
                    {item.description}
                  </p>
                  <Link
                    className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                    href={item.href}
                  >
                    Read comparison <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="resources-faq-heading">
            <p className="eyebrow">Library FAQ</p>
            <h2
              id="resources-faq-heading"
              className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
            >
              How to use this resource library
            </h2>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {resourceFaqs.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-[22px] bg-white/[0.025] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]"
                >
                  <h3 className="font-semibold leading-6 text-white">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {RESOURCE_GROUPS.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-8">
              <div className="grid gap-5 lg:grid-cols-[0.68fr_1.32fr] lg:items-end">
                <div>
                  <p className="eyebrow">Resource collection</p>
                  <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                    {group.label}
                  </h2>
                </div>
                <p className="max-w-2xl text-pretty leading-7 text-zinc-400">
                  {group.description}
                </p>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.resources.map((resource) => (
                  <article
                    key={resource.href}
                    className="flex h-full flex-col rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <h3 className="text-balance text-lg font-semibold text-white">
                      {resource.title}
                    </h3>
                    <p className="mt-3 flex-1 text-pretty text-sm leading-6 text-zinc-400">
                      {resource.description}
                    </p>
                    <Link
                      className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                      href={resource.href}
                    >
                      Open {resource.title} <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
