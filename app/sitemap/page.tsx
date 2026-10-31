import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { buildHtmlSitemapSections } from "@/lib/html-sitemap";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const path = "/sitemap" as const;
const pageUrl = absoluteUrl(path);

export const metadata: Metadata = {
  title: "HTML Sitemap",
  description:
    "Browse every public page on 100 Questions — product, free tools, guides, comparisons, and company policies.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "HTML Sitemap · 100 Questions",
    description:
      "Index of all public marketing pages on the AI search visibility platform.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "HTML Sitemap · 100 Questions",
    description: "Index of all public marketing pages on 100 Questions.",
    images: [SOCIAL_IMAGE],
  },
};

export default function HtmlSitemapPage() {
  const sections = buildHtmlSitemapSections();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: "HTML Sitemap",
    description:
      "Human-readable index of public pages on 100 Questions, grouped by section.",
    isPartOf: { "@id": `${absoluteUrl()}#website` },
    inLanguage: "en-US",
  };

  return (
    <div className="min-h-screen bg-[#070908] text-zinc-100">
      <JsonLd data={structuredData} />
      <MarketingHeader />
      <main className="page-shell py-16 sm:py-20 lg:py-24">
        <nav className="text-xs text-zinc-400" aria-label="Breadcrumb">
          <Link className="hover:text-zinc-200" href="/">
            Home
          </Link>{" "}
          <span aria-hidden="true">/</span>{" "}
          <span className="text-zinc-300">Sitemap</span>
        </nav>
        <h1 className="mt-8 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
          HTML sitemap
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-zinc-400">
          Every indexable public page on{" "}
          <strong className="font-semibold text-zinc-200">100 Questions</strong>
          , grouped by section. Machine-readable URLs also appear in{" "}
          <Link
            className="text-emerald-300 underline underline-offset-4"
            href="/sitemap.xml"
          >
            sitemap.xml
          </Link>
          .
        </p>

        <div className="mt-14 space-y-14">
          {sections.map(({ title, links }) => (
            <section key={title} aria-labelledby={`sitemap-${title}`}>
              <h2
                id={`sitemap-${title}`}
                className="text-xl font-semibold tracking-[-0.03em] text-white"
              >
                {title}
              </h2>
              <ul className="mt-5 columns-1 gap-x-10 text-sm leading-7 text-zinc-300 sm:columns-2 lg:columns-3">
                {links.map(({ path: linkPath, label }) => (
                  <li key={linkPath} className="break-inside-avoid py-1">
                    <Link
                      className="text-emerald-300 underline decoration-emerald-300/30 underline-offset-4 hover:text-emerald-200"
                      href={linkPath}
                    >
                      {label}
                    </Link>
                    {linkPath === path ? (
                      <span className="text-zinc-500"> (this page)</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
