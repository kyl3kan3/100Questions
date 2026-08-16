import { ArrowRight, Check, GitCompareArrows, Radar } from "lucide-react";
import Link from "next/link";

import { SeoResourceShell } from "@/components/seo-resource-shell";
import { Button } from "@/components/ui/button";
import { buildResourceMetadata } from "@/lib/resource-metadata";

const path = "/ai-overviews-tracker-vs-cross-model-visibility-testing" as const;
const date = { iso: "2026-08-16", label: "August 16, 2026" } as const;

export const metadata = buildResourceMetadata({
  path,
  title: "AI Overviews Tracker vs Cross-Model Visibility Testing",
  description:
    "Compare an AI Overviews tracker with cross-model AI visibility testing by surface, questions, evidence, cadence, metrics, and best-fit use case.",
  publishedTime: date.iso,
  modifiedTime: date.iso,
});

const faqs = [
  {
    question: "What does an AI Overviews tracker measure?",
    answer:
      "An AI Overviews tracker measures Google search result pages for selected queries, including whether an AI Overview appears and, depending on the tool, which domains or brands are included or cited. Confirm the market, device, collection method, and evidence retained by the specific tool.",
  },
  {
    question: "What is cross-model AI visibility testing?",
    answer:
      "Cross-model testing sends one frozen buyer-question set to multiple AI providers and compares mentions, prominence, competitors, citations, and coverage under recorded conditions. It measures provider differences rather than one search surface.",
  },
  {
    question: "Do I need both an AI Overviews tracker and a cross-model benchmark?",
    answer:
      "Use both when Google AI Overviews materially affect organic search performance and buyers also use standalone assistants. Use one when the buying journey is concentrated on a single surface or the team cannot act on two measurement programs.",
  },
  {
    question: "Is cross-model visibility testing a rank tracker?",
    answer:
      "No. A fixed cross-model benchmark is a time-stamped sample of composed answers. It is most useful as a baseline and like-for-like rerun, not as a claim that a brand holds one permanent AI ranking.",
  },
] as const;

const comparisonRows = [
  ["Surface", "Google search results containing AI Overviews", "Multiple answer providers under one test protocol"],
  ["Input", "Tracked search queries, usually with market and device settings", "Buyer questions, target entity, competitors, locale, and grounding rules"],
  ["Typical evidence", "SERP capture, overview text, links, domains, and occurrence", "Full answer, sources, mentions, prominence, model, timestamp, and eligibility"],
  ["Primary measures", "Overview presence, cited domains, brand inclusion, and query-level change", "Discovery visibility, prominence, share of voice, citations, accuracy, and coverage"],
  ["Cadence", "Often recurring because the job is surface monitoring", "Point-in-time baseline and controlled reruns after substantive work"],
  ["Best decision", "What changed in Google's AI search surface?", "How does brand visibility differ across providers and buyer questions?"],
] as const;

export default function AiOverviewsTrackerComparisonPage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Measurement model comparison"
      breadcrumb="AI Overviews tracker vs cross-model testing"
      title="AI Overviews tracker vs cross-model visibility testing"
      description="One follows a specific Google search surface; the other compares the same buyer questions across multiple AI providers. Choose by the decision you need to make."
      published={date}
      modified={date}
      primaryAction={{ href: "/ai-search-visibility-tool", label: "See cross-model visibility testing" }}
      faqs={faqs}
    >
      <section className="grid gap-5 lg:grid-cols-2" aria-labelledby="models-heading">
        <h2 id="models-heading" className="sr-only">Two AI visibility measurement models</h2>
        <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
          <Radar className="size-6 text-emerald-300" aria-hidden="true" />
          <p className="eyebrow mt-5">AI Overviews tracker</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Monitor one changing search surface</h3>
          <p className="mt-4 leading-7 text-zinc-400">
            Track selected Google queries and record whether an AI Overview
            appears, which domains or brands it includes, and how that result
            changes over time. This is closest to traditional SERP monitoring.
          </p>
        </article>
        <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
          <GitCompareArrows className="size-6 text-emerald-300" aria-hidden="true" />
          <p className="eyebrow mt-5">Cross-model visibility test</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Compare one question set across providers</h3>
          <p className="mt-4 leading-7 text-zinc-400">
            Freeze realistic buyer questions, ask each provider the same set,
            and preserve the answers and sources. This reveals provider splits,
            competitor patterns, citation gaps, and question-level differences.
          </p>
        </article>
      </section>

      <section aria-labelledby="comparison-heading">
        <p className="eyebrow">Side-by-side comparison</p>
        <h2 id="comparison-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
          The surface determines the protocol
        </h2>
        <div className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/[0.04] text-zinc-200">
              <tr>
                <th className="p-4 font-semibold">Dimension</th>
                <th className="p-4 font-semibold">AI Overviews tracker</th>
                <th className="p-4 font-semibold">Cross-model visibility test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08] text-zinc-400">
              {comparisonRows.map(([dimension, overviews, crossModel]) => (
                <tr key={dimension}>
                  <th className="p-4 align-top font-medium text-zinc-200">{dimension}</th>
                  <td className="p-4 align-top leading-6">{overviews}</td>
                  <td className="p-4 align-top leading-6">{crossModel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="choose-heading">
        <p className="eyebrow">Choose by operating need</p>
        <h2 id="choose-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
          Use the smallest measurement program that changes a decision
        </h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {[
            ["Choose an AI Overviews tracker when", ["Google is the priority acquisition surface", "You need recurring SERP-level change data", "Query, country, and device tracking drive the workflow"]],
            ["Choose cross-model testing when", ["Buyers use multiple assistants", "You need one evidence-linked baseline", "Provider differences and competitor answers matter"]],
            ["Use both when", ["AI Overviews affect traffic while assistants affect shortlists", "Separate owners can act on each dataset", "The reporting connects surface metrics to one business outcome"]],
          ].map(([title, items]) => (
            <article key={title as string} className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-7">
              <h3 className="font-semibold text-white">{title}</h3>
              <ul className="mt-5 space-y-3">
                {(items as readonly string[]).map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-zinc-300">
                    <Check className="mt-1 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="workflow-heading" className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/[0.035] p-7 sm:p-9">
        <p className="eyebrow">A combined workflow</p>
        <h2 id="workflow-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
          Keep the datasets separate; connect the decisions
        </h2>
        <ol className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["01", "Map buyer questions to conventional queries without assuming they are identical."],
            ["02", "Collect AI Overviews and cross-model answers under explicit market and date conditions."],
            ["03", "Classify mentions, prominence, citations, competitors, and coverage within each surface."],
            ["04", "Prioritize work supported by repeated question and source patterns, then rerun like for like."],
          ].map(([number, description]) => (
            <li key={number} className="rounded-2xl bg-white/[0.035] p-5 text-sm leading-6 text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
              <span className="font-mono text-xs text-emerald-300">{number}</span>
              <p className="mt-3">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="pitfalls-heading">
        <p className="eyebrow">Avoid false equivalence</p>
        <h2 id="pitfalls-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
          Do not collapse both surfaces into one unexplained score
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["A search query is not automatically a buyer prompt", "People frame conversational questions differently from compact search queries. Validate both against real buyer language."],
            ["A citation is not automatically a brand mention", "A domain can support an answer without the answer recommending that brand. Preserve the text and classify the events separately."],
            ["A provider split is not a universal rank", "Different systems retrieve different sources and compose different answers. Report the model and date beside every result."],
            ["More frequent tracking is not always more useful", "Choose a cadence that matches how quickly the team can make meaningful changes and how long recrawling or source updates take."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-[22px] bg-white/[0.025] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 max-w-3xl leading-7 text-zinc-400">
          Single-surface tracking aligns most closely with SEO and AEO
          reporting. Cross-provider brand interpretation aligns more closely
          with GEO. See the full{" "}
          <Link className="text-emerald-300 underline underline-offset-4" href="/aeo-vs-geo">AEO vs GEO framework</Link>.
        </p>
      </section>

      <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">Run the cross-model benchmark</p>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">Compare 25 buyer questions across OpenAI, Claude, Gemini, and Grok.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-zinc-800">Get a frozen, evidence-linked baseline with no subscription.</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="bg-zinc-950 text-white hover:bg-zinc-800">
            <Link href="/ai-search-visibility-tool">See the $9 audit <ArrowRight aria-hidden="true" /></Link>
          </Button>
        </div>
      </section>
    </SeoResourceShell>
  );
}
