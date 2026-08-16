import { ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ContentByline } from "@/components/content-byline";
import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { MeasurementToolkitLinks } from "@/components/measurement-toolkit-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";

type Faq = {
  question: string;
  answer: string;
};

type SeoResourceShellProps = {
  path: `/${string}`;
  eyebrow: string;
  breadcrumb: string;
  title: string;
  description: string;
  published?: {
    iso: string;
    label: string;
  };
  modified?: {
    iso: string;
    label: string;
  };
  primaryAction?: {
    href: string;
    label: string;
  };
  download?: {
    href: string;
    label: string;
  };
  faqs: readonly Faq[];
  children: ReactNode;
};

export function SeoResourceShell({
  path,
  eyebrow,
  breadcrumb,
  title,
  description,
  published = { iso: "2026-08-03", label: "August 3, 2026" },
  modified = { iso: "2026-08-14", label: "August 14, 2026" },
  primaryAction,
  download,
  faqs,
  children,
}: SeoResourceShellProps) {
  const pageUrl = absoluteUrl(path);
  const faqId = `${breadcrumb.split(" ").join("-")}-faq`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        headline: title,
        description,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: published.iso,
        dateModified: modified.iso,
        author: { "@id": `${absoluteUrl()}#organization` },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        inLanguage: "en-US",
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
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
            name: "Resources",
            item: absoluteUrl("/resources"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: breadcrumb,
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
              <Link className="hover:text-zinc-200" href="/resources">
                Resources
              </Link>{" "}
              <span aria-hidden="true">/</span>{" "}
              <span className="text-zinc-300">{breadcrumb}</span>
            </nav>
            <Badge
              variant="outline"
              className="mt-8 border-emerald-300/25 text-emerald-200"
            >
              {eyebrow}
            </Badge>
            <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
              {description}
            </p>
            <ContentByline
              publishedAt={published.iso}
              publishedLabel={published.label}
              modifiedAt={modified.iso}
              modifiedLabel={modified.label}
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {download ? (
                <Button asChild size="lg">
                  <a href={download.href} download>
                    {download.label} <Download aria-hidden="true" />
                  </a>
                </Button>
              ) : null}
              <Button asChild size="lg" variant={download ? "outline" : "default"}>
                <Link href={primaryAction?.href ?? "/ai-visibility-prompts"}>
                  {primaryAction?.label ?? "Build a question set"} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
          {children}

          <MeasurementToolkitLinks currentPath={path} />

          <section aria-labelledby={faqId}>
            <p className="eyebrow">Common questions</p>
            <h2
              id={faqId}
              className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
            >
              Use the resource without overstating the result
            </h2>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {faqs.map((faq) => (
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

          <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
              Evidence before conclusions
            </p>
            <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                  See a complete benchmark before running your own
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-zinc-800">
                  Review the questions, stored answers, citations, competitors,
                  coverage, and five prioritized actions in the sample report.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-zinc-950 text-white hover:bg-zinc-800"
              >
                <Link href="/sample-report">
                  View the sample report <ArrowRight aria-hidden="true" />
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
