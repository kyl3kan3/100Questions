import Link from "next/link";
import type { ReactNode } from "react";

import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { absoluteUrl } from "@/lib/site";

type PolicyPageProps = {
  path: `/${string}`;
  eyebrow: string;
  title: string;
  description: string;
  showEffectiveDate?: boolean;
  children: ReactNode;
};

export function PolicyPage({
  path,
  eyebrow,
  title,
  description,
  showEffectiveDate = true,
  children,
}: PolicyPageProps) {
  const pageUrl = absoluteUrl(path);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        isPartOf: { "@id": `${absoluteUrl()}#website` },
        dateModified: "2026-08-10",
        inLanguage: "en-US",
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
            name: title,
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
          <div className="page-shell py-16 sm:py-20">
            <nav className="text-xs text-zinc-400" aria-label="Breadcrumb">
              <Link className="hover:text-zinc-200" href="/">
                Home
              </Link>{" "}
              <span aria-hidden="true">/</span>{" "}
              <span className="text-zinc-300">{title}</span>
            </nav>
            <Badge
              variant="outline"
              className="mt-8 border-emerald-300/25 text-emerald-200"
            >
              {eyebrow}
            </Badge>
            <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
              {description}
            </p>
            {showEffectiveDate ? (
              <p className="mt-4 text-xs text-zinc-400">
                Effective <time dateTime="2026-08-10">August 10, 2026</time>
              </p>
            ) : null}
          </div>
        </header>

        <div className="page-shell py-16 sm:py-20">
          <div className="max-w-3xl space-y-10 text-pretty leading-7 text-zinc-300 [&_a]:text-emerald-300 [&_a]:underline [&_a]:decoration-emerald-300/40 [&_a]:underline-offset-4 [&_a:hover]:text-emerald-200 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.025em] [&_h2]:text-white [&_li]:pl-1 [&_p]:text-zinc-400 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
            {children}
          </div>
        </div>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
