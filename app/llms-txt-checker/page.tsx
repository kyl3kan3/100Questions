import { ArrowRight, CheckCircle2, ExternalLink, FileSearch, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { AiReadinessChecker } from "@/components/ai-readiness-checker";
import { AnalyticsEvent } from "@/components/analytics-event";
import { JsonLd } from "@/components/json-ld";
import { LlmsTxtBuilder } from "@/components/llms-txt-builder";
import { SeoResourceShell } from "@/components/seo-resource-shell";
import { buildResourceMetadata } from "@/lib/resource-metadata";
import { absoluteUrl } from "@/lib/site";

const path = "/llms-txt-checker" as const;
const date = { iso: "2026-08-16", label: "August 16, 2026" } as const;

export const metadata = buildResourceMetadata({
  path,
  title: "llms.txt Checker & Generator",
  description:
    "Generate a standards-aligned llms.txt file, check whether your deployed site exposes it, and understand what llms.txt can and cannot do for AI visibility.",
  publishedTime: date.iso,
  modifiedTime: date.iso,
});

const faqs = [
  {
    question: "What is llms.txt?",
    answer:
      "llms.txt is a proposed Markdown-based format, published at a site's /llms.txt path, that gives language models a concise overview and links to important resources. The proposal requires an H1 project name and defines optional summary and link sections.",
  },
  {
    question: "Does llms.txt improve AI rankings?",
    answer:
      "No universal ranking benefit is established. Treat llms.txt as an optional machine-readable map that complements crawlable HTML, accurate canonical facts, internal links, sitemaps, structured data, and useful source pages.",
  },
  {
    question: "How do I check whether llms.txt is installed?",
    answer:
      "Request /llms.txt from the site's canonical HTTPS origin and confirm it returns a public text or Markdown response. The readiness checker on this page checks discovery of the file alongside other public technical signals.",
  },
  {
    question: "What should an llms.txt file contain?",
    answer:
      "Start with the site or project name, a concise canonical summary, and a short list of the most important public pages with descriptive labels. Avoid unsupported marketing claims, private URLs, duplicate navigation, and stale facts.",
  },
] as const;

export default function LlmsTxtCheckerPage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Free checker and generator"
      breadcrumb="llms.txt checker"
      title="llms.txt checker and generator"
      description="Create a concise llms.txt starting file, validate its basic structure, and check whether your deployed site makes the file publicly discoverable."
      published={date}
      modified={date}
      primaryAction={{ href: "#generator", label: "Generate llms.txt" }}
      faqs={faqs}
    >
      <AnalyticsEvent
        event="seo_landing_viewed"
        onceKey="llms-txt-checker"
        properties={{ landing_page: path, keyword_cluster: "llms_txt" }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "llms.txt Checker and Generator",
          url: absoluteUrl(path),
          serviceType: "llms.txt generation and public discovery check",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          featureList: [
            "llms.txt Markdown generator",
            "Basic format validation",
            "Public llms.txt discovery check",
            "Implementation guidance",
          ],
          provider: { "@id": `${absoluteUrl()}#organization` },
        }}
      />

      <LlmsTxtBuilder />

      <section className="grid gap-5 lg:grid-cols-2" aria-labelledby="limits-heading">
        <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
          <CheckCircle2 className="size-6 text-emerald-300" aria-hidden="true" />
          <p className="eyebrow mt-5">What it can do</p>
          <h2 id="limits-heading" className="mt-3 text-2xl font-semibold text-white">Provide a concise map</h2>
          <p className="mt-4 leading-7 text-zinc-400">
            A maintained file can summarize the project and point agents or
            tools toward canonical public resources in a compact,
            machine-readable format.
          </p>
        </article>
        <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
          <ShieldAlert className="size-6 text-amber-300" aria-hidden="true" />
          <p className="eyebrow mt-5">What it cannot prove</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Adoption, retrieval, or ranking</h2>
          <p className="mt-4 leading-7 text-zinc-400">
            A valid file does not prove that a provider fetched it, used it,
            cited the site, or changed an answer. Measure those outcomes
            separately with preserved answer evidence.
          </p>
        </article>
      </section>

      <section aria-labelledby="spec-heading" className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="eyebrow">The proposed format</p>
          <h2 id="spec-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            Keep the root file small, factual, and maintained
          </h2>
        </div>
        <div className="space-y-4">
          {[
            ["Start with one H1", "Use the official project, company, or site name. This is the only required section in the proposal."],
            ["Add a blockquote summary", "State what the site is, who it serves, and the minimum context needed to interpret the links."],
            ["Group important links", "Use H2 sections and Markdown lists. Link to canonical public URLs, preferably with concise descriptions."],
            ["Remove stale or unsupported claims", "Treat the file as maintained source material, not a keyword list or a place to repeat every navigation item."],
          ].map(([title, description], index) => (
            <article key={title} className="rounded-[20px] bg-white/[0.025] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
              <div className="flex gap-4"><span className="font-mono text-xs text-emerald-300">0{index + 1}</span><div><h3 className="font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p></div></div>
            </article>
          ))}
          <a className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 underline underline-offset-4" href="https://llmstxt.org/" target="_blank" rel="noreferrer">
            Read the llms.txt proposal <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section aria-labelledby="deployed-check-heading">
        <div className="mb-8 flex items-start gap-4">
          <FileSearch className="mt-1 size-6 shrink-0 text-emerald-300" aria-hidden="true" />
          <div>
            <p className="eyebrow">Already published?</p>
            <h2 id="deployed-check-heading" className="mt-3 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Check the live file and the technical foundation around it
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-zinc-400">
              The readiness check looks for public llms.txt discovery along
              with indexability, crawler access, metadata, schema, canonical
              signals, question content, and sitemap discovery.
            </p>
          </div>
        </div>
        <AiReadinessChecker />
      </section>

      <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">Measure outcomes separately</p>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">A valid file is readiness evidence, not visibility evidence.</h2><p className="mt-3 max-w-2xl leading-7 text-zinc-800">Test real buyer questions across providers to see whether the brand is actually mentioned or cited.</p></div>
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800" href="/ai-search-visibility-tool">Measure visibility <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </section>
    </SeoResourceShell>
  );
}
