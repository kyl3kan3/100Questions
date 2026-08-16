import { ArrowRight, CheckCircle2, MessagesSquare, Search, Sparkles } from "lucide-react";
import Link from "next/link";

import { AnalyticsEvent } from "@/components/analytics-event";
import { SeoResourceShell } from "@/components/seo-resource-shell";
import { buildResourceMetadata } from "@/lib/resource-metadata";

const path = "/customer-research-methods" as const;
const date = { iso: "2026-08-16", label: "August 16, 2026" } as const;

export const metadata = buildResourceMetadata({
  path,
  title: "Customer Research Methods for the AI Search Era",
  description:
    "Compare customer research methods and learn where AI visibility testing fits: traditional research measures customers; AI benchmarks measure what answer engines say to them.",
  publishedTime: date.iso,
  modifiedTime: date.iso,
});

const faqs = [
  {
    question: "What are the main customer research methods?",
    answer:
      "Common methods include customer interviews, surveys, usability tests, sales and support review, behavioral analytics, site-search analysis, review mining, search-demand research, and market or competitive research. Choose the method based on the decision and the evidence needed.",
  },
  {
    question: "Is AI visibility testing a customer research method?",
    answer:
      "It is better treated as an adjacent market-perception method. Interviews and surveys study what customers think or do; an AI visibility benchmark studies what answer engines say to prospective customers under a defined question set.",
  },
  {
    question: "How do customer interviews improve an AI visibility audit?",
    answer:
      "Interview language can reveal real discovery, comparison, risk, pricing, and implementation questions. Those questions make the audit more commercially relevant than generic or vanity prompts.",
  },
  {
    question: "How many methods should a small team use?",
    answer:
      "Use the smallest triangulated set that answers the decision: one qualitative method for why, one behavioral or demand source for observed action, and one market or AI-perception source for the external information environment.",
  },
] as const;

const methods = [
  ["Customer interviews", "Why people choose, hesitate, switch, or describe the problem", "Depth, language, decision context", "Small and non-random samples"],
  ["Surveys", "How stated attitudes or needs distribute across a defined audience", "Structured comparison at larger scale", "Question wording and sample quality"],
  ["Usability tests", "Where people struggle to complete a task", "Observed behavior with rich context", "A test session is not natural use"],
  ["Sales and support review", "Objections, questions, confusion, and implementation friction", "High-intent, operational language", "Biased toward people who contacted the company"],
  ["Product and web analytics", "What users actually click, complete, abandon, or revisit", "Behavior at scale", "Shows what happened more clearly than why"],
  ["Review mining", "Recurring praise, complaints, alternatives, and category vocabulary", "Unprompted public language", "Reviewer and platform selection bias"],
  ["Search and site-search data", "Expressed information demand and gaps", "Question and intent discovery", "Volume does not equal buyer importance"],
  ["AI visibility benchmark", "What answer engines say when prospects ask defined buyer questions", "External answer evidence across providers", "Stochastic outputs and bounded question coverage"],
] as const;

export default function CustomerResearchMethodsPage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Research method guide"
      breadcrumb="Customer research methods"
      title="Customer research methods for the AI search era"
      description="Traditional research measures customers. AI visibility testing measures the information environment answer engines create around their decisions."
      published={date}
      modified={date}
      primaryAction={{ href: "/ai-visibility-prompts", label: "Build buyer questions" }}
      faqs={faqs}
    >
      <AnalyticsEvent
        event="seo_landing_viewed"
        onceKey="customer-research-methods"
        properties={{ landing_page: path, keyword_cluster: "customer_research_methods" }}
      />

      <section className="grid gap-5 lg:grid-cols-3" aria-labelledby="thesis-heading">
        <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <MessagesSquare className="size-6 text-emerald-300" aria-hidden="true" />
          <p className="eyebrow mt-5">Ask customers</p>
          <h2 id="thesis-heading" className="mt-3 text-xl font-semibold text-white">What do people think and need?</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Interviews, surveys, and support evidence reveal language, motivations, objections, and stated needs.</p>
        </article>
        <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <Search className="size-6 text-emerald-300" aria-hidden="true" />
          <p className="eyebrow mt-5">Observe behavior</p>
          <h2 className="mt-3 text-xl font-semibold text-white">What do people actually do?</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Analytics, usability tests, sales records, and search data reveal actions and friction.</p>
        </article>
        <article className="rounded-[26px] border border-emerald-300/20 bg-emerald-300/[0.055] p-7">
          <Sparkles className="size-6 text-emerald-300" aria-hidden="true" />
          <p className="eyebrow mt-5">Test answer engines</p>
          <h2 className="mt-3 text-xl font-semibold text-white">What information meets the prospect?</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">AI visibility testing records the brands, claims, competitors, and sources presented for buyer questions.</p>
        </article>
      </section>

      <section aria-labelledby="method-matrix-heading">
        <p className="eyebrow">Method selection matrix</p>
        <h2 id="method-matrix-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
          Choose the method by the question it can answer
        </h2>
        <div className="mt-8 overflow-x-auto rounded-[26px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="bg-white/[0.05] text-zinc-200"><tr>{["Method", "Best question", "Strength", "Primary limitation"].map((heading) => <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>)}</tr></thead>
            <tbody>
              {methods.map(([method, question, strength, limitation]) => (
                <tr key={method} className="border-t border-white/[0.08] bg-[#0b0e0c] text-zinc-400">
                  <th className="px-5 py-4 font-semibold text-white">{method}</th><td className="px-5 py-4 leading-6">{question}</td><td className="px-5 py-4 leading-6">{strength}</td><td className="px-5 py-4 leading-6">{limitation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="triangulation-heading">
        <div>
          <p className="eyebrow">Triangulate the decision</p>
          <h2 id="triangulation-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            Build a question set from customer evidence
          </h2>
        </div>
        <ol className="space-y-4">
          {[
            ["Collect the language", "Pull discovery questions, comparison criteria, objections, and risk concerns from interviews, calls, support logs, reviews, site search, and paid-search data."],
            ["Map the decision stages", "Balance early discovery with use case, comparison, proof, pricing, implementation, and risk questions."],
            ["Separate neutral discovery from named diagnostics", "Neutral questions measure inclusion; target-named questions inspect factual knowledge and source support."],
            ["Freeze the test", "Use the same wording and provider conditions for the baseline, then preserve answers, sources, failures, and timestamps."],
          ].map(([title, description], index) => (
            <li key={title} className="rounded-[20px] bg-white/[0.025] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]"><div className="flex gap-4"><span className="font-mono text-xs text-emerald-300">0{index + 1}</span><div><h3 className="font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p></div></div></li>
          ))}
        </ol>
      </section>

      <section className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/[0.035] p-7 sm:p-9">
        <p className="eyebrow">A useful division of labor</p>
        <h2 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
          Customer research tells you what to test. AI visibility evidence shows what the engines return.
        </h2>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {[
            ["Do not infer customer truth from AI output", "Generated answers are part of the information environment, not a representative sample of customer beliefs or behavior."],
            ["Do not infer AI visibility from keyword volume", "Search demand can help choose topics, but it does not reveal whether an answer engine names or cites the brand."],
            ["Do not turn every interview phrase into a prompt", "Prioritize recurring, decision-relevant questions and keep the final benchmark bounded."],
            ["Do not collapse the evidence into one opaque score", "Keep mentions, prominence, competitors, citations, accuracy findings, and coverage separately inspectable."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-[20px] bg-black/20 p-5"><h3 className="flex gap-3 font-semibold text-white"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden="true" />{title}</h3><p className="mt-3 pl-7 text-sm leading-6 text-zinc-400">{description}</p></article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">Turn research into a benchmark</p>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">Start with buyer questions you can defend.</h2><p className="mt-3 max-w-2xl leading-7 text-zinc-800">Use the free prompt library to structure discovery and diagnostic questions, then measure them across four providers.</p></div>
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800" href="/ai-visibility-prompts">Build the question set <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </section>
    </SeoResourceShell>
  );
}
