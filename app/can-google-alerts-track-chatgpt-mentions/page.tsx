import { ArrowRight, BellRing, Check, ExternalLink, MessageSquareText, X } from "lucide-react";
import Link from "next/link";

import { AnalyticsEvent } from "@/components/analytics-event";
import { SeoResourceShell } from "@/components/seo-resource-shell";
import { buildResourceMetadata } from "@/lib/resource-metadata";

const path = "/can-google-alerts-track-chatgpt-mentions" as const;
const date = { iso: "2026-08-16", label: "August 16, 2026" } as const;

export const metadata = buildResourceMetadata({
  path,
  title: "Can Google Alerts Track ChatGPT Mentions?",
  description:
    "Learn what Google Alerts can monitor, why it does not measure mentions inside ChatGPT answers, and how to combine web alerts with cross-model visibility testing.",
  publishedTime: date.iso,
  modifiedTime: date.iso,
});

const faqs = [
  {
    question: "Can Google Alerts track mentions inside ChatGPT?",
    answer:
      "No. Google describes Alerts as email notifications when new matching results appear in Google Search. That can surface public webpages about a brand, but it does not record whether ChatGPT named the brand in a generated answer.",
  },
  {
    question: "Can Google Alerts track AI citations to my website?",
    answer:
      "Not directly. A Google Alert may discover a public page that later becomes a source, but it does not preserve a ChatGPT answer or identify which URLs that answer cited. Citation measurement requires collecting the answer and returned source links under a known test condition.",
  },
  {
    question: "Should brands still use Google Alerts?",
    answer:
      "Yes, for its intended job: discovering new Google Search results related to a name, product, topic, or query. Use a separate method for AI answer mentions, citations, competitors, accuracy, and provider coverage.",
  },
  {
    question: "What is the simplest way to monitor ChatGPT brand mentions?",
    answer:
      "For a small baseline, freeze a set of neutral buyer questions, collect answers and citations under consistent conditions, label target and competitor mentions, and preserve timestamps. Use recurring monitoring only when the decision requires continuous change detection.",
  },
] as const;

const comparison = [
  ["Google Alerts", "New matching results in Google Search", true, false, false, "Ongoing web mention discovery"],
  ["Manual AI checks", "Answers visible in the tested chat session", false, true, true, "Quick qualitative spot checks"],
  ["Frozen cross-model audit", "Stored answers and sources from a controlled question set", false, true, true, "Comparable baseline and rerun"],
] as const;

export default function GoogleAlertsChatGptMentionsPage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Monitoring comparison"
      breadcrumb="Google Alerts and ChatGPT mentions"
      title="Can Google Alerts track ChatGPT mentions?"
      description="Google Alerts and AI visibility testing observe different surfaces. Use each for the job it can actually verify."
      published={date}
      modified={date}
      primaryAction={{ href: "/ai-search-visibility-tool", label: "Measure AI mentions" }}
      faqs={faqs}
    >
      <AnalyticsEvent
        event="seo_landing_viewed"
        onceKey="google-alerts-chatgpt-mentions"
        properties={{ landing_page: path, keyword_cluster: "google_alerts" }}
      />

      <section className="grid gap-5 lg:grid-cols-2" aria-labelledby="short-answer-heading">
        <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
          <BellRing className="size-6 text-emerald-300" aria-hidden="true" />
          <p className="eyebrow mt-5">What Google Alerts sees</p>
          <h2 id="short-answer-heading" className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
            New matching Google Search results
          </h2>
          <p className="mt-4 leading-7 text-zinc-400">
            Google says Alerts sends email when new results for a topic appear
            in Google Search. It is useful for public web mentions, news,
            product references, and named-query discovery.
          </p>
          <a className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 underline underline-offset-4" href="https://support.google.com/websearch/answer/4815696?hl=en" target="_blank" rel="noreferrer">
            Read Google Search Help <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </article>
        <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
          <MessageSquareText className="size-6 text-amber-300" aria-hidden="true" />
          <p className="eyebrow mt-5">What it does not see</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
            Brand inclusion inside a generated answer
          </h2>
          <p className="mt-4 leading-7 text-zinc-400">
            A matching web result does not prove ChatGPT mentioned the brand,
            recommended it, used its site as a source, or described it
            correctly. Those are answer-level events that must be collected
            from the AI test itself.
          </p>
        </article>
      </section>

      <section aria-labelledby="comparison-heading">
        <p className="eyebrow">Three different monitoring jobs</p>
        <h2 id="comparison-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
          Google Alerts complements AI visibility testing; it does not replace it
        </h2>
        <div className="mt-8 overflow-x-auto rounded-[26px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-white/[0.05] text-zinc-200">
              <tr>
                {['Method', 'Evidence captured', 'Web results', 'AI mentions', 'AI citations', 'Best use'].map((heading) => (
                  <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map(([method, evidence, web, mentions, citations, use]) => (
                <tr key={method} className="border-t border-white/[0.08] bg-[#0b0e0c] text-zinc-400">
                  <th className="px-5 py-4 font-semibold text-white">{method}</th>
                  <td className="max-w-xs px-5 py-4 leading-6">{evidence}</td>
                  {[web, mentions, citations].map((value, index) => (
                    <td key={index} className="px-5 py-4">
                      {value ? <Check className="size-4 text-emerald-300" aria-label="Yes" /> : <X className="size-4 text-zinc-600" aria-label="No" />}
                    </td>
                  ))}
                  <td className="px-5 py-4 leading-6">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="stack-heading">
        <div>
          <p className="eyebrow">A practical monitoring stack</p>
          <h2 id="stack-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            Preserve two evidence streams
          </h2>
        </div>
        <ol className="space-y-4">
          {[
            ["Run Google Alerts for public-web change detection", "Track the brand name, important product names, executive names, and a few high-signal category queries. Review false positives before acting."],
            ["Freeze buyer questions for AI answer measurement", "Use the same discovery and diagnostic questions across providers so differences are interpretable."],
            ["Store answers, citations, competitors, and failures", "A result without its source evidence and test condition is not a reliable benchmark."],
            ["Rerun only when the decision calls for it", "Use a bounded rerun after meaningful content, entity, authority, or product changes. Buy continuous tracking only when daily alerts create value."],
          ].map(([title, description], index) => (
            <li key={title} className="rounded-[20px] bg-white/[0.025] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
              <div className="flex gap-4">
                <span className="font-mono text-xs text-emerald-300">0{index + 1}</span>
                <div><h3 className="font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p></div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">Measure the missing surface</p>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">See whether four AI providers mention, cite, or replace your brand.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-zinc-800">Use one frozen 25-question set and preserve the evidence behind every finding.</p>
          </div>
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800" href="/ai-search-visibility-tool">
            See the tool <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </SeoResourceShell>
  );
}
