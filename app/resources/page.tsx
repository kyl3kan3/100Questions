import { ArrowRight, LibraryBig } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ContentByline } from "@/components/content-byline";
import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { RESOURCE_COUNT, RESOURCE_GROUPS } from "@/lib/resource-catalog";
import {
  absoluteUrl,
  SITE_NAME,
  SOCIAL_IMAGE,
} from "@/lib/site";

const pageUrl = absoluteUrl("/resources");
const publishedAt = "2026-08-10";

export const metadata: Metadata = {
  title: "Free AI Visibility Resources",
  description:
    "Explore free AI visibility guides, research, checkers, prompt libraries, calculators, comparison pages, spreadsheets, and reporting templates.",
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
        dateModified: publishedAt,
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
