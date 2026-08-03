import { Table2 } from "lucide-react";

import { SeoResourceShell } from "@/components/seo-resource-shell";
import { buildResourceMetadata } from "@/lib/resource-metadata";

const path = "/ai-search-prompt-tracking-spreadsheet" as const;

export const metadata = buildResourceMetadata({
  path,
  title: "Free AI Search Prompt Tracking Spreadsheet",
  description:
    "Download an AI search prompt tracking spreadsheet for time-stamped ChatGPT, Claude, Gemini, Grok, and Perplexity answer evidence and reruns.",
  keywords: [
    "AI search prompt tracking spreadsheet",
    "AI visibility tracking template",
    "LLM prompt tracker spreadsheet",
    "GEO tracking spreadsheet",
  ],
});

const columns = [
  ["Benchmark identity", "benchmark_id, subject, canonical domain, market, locale, and frozen prompt ID"],
  ["Collection conditions", "date, provider, product surface, model label, web-search state, session state, and run number"],
  ["Answer outcome", "eligible, brand mentioned, prominence, recommendation, sentiment, and representation accuracy"],
  ["Source evidence", "claimed-domain cited, cited URLs, cited domains, and stored-answer reference"],
  ["Competitive context", "competitors mentioned, leading competitor, and answer-level share-of-voice inputs"],
  ["Action mapping", "likely gap, next action, owner, priority, and rerun notes"],
] as const;

const faqs = [
  {
    question: "What should an AI prompt tracking spreadsheet include?",
    answer:
      "Use one row per prompt, provider, run, and date. Record the prompt ID, collection conditions, eligibility, brand mention, prominence, citations, competitors, sentiment, accuracy, raw-answer reference, and next action.",
  },
  {
    question: "Why use long-format rows instead of one tab per provider?",
    answer:
      "Long format makes filtering, pivoting, provider comparison, reruns, and coverage calculations easier while preserving one consistent schema as platforms change.",
  },
  {
    question: "How many prompts should I track?",
    answer:
      "Start with a small frozen core that represents important buyer decisions. A 20-to-30 prompt directional set is easier to review rigorously than hundreds of generic prompts with weak business context.",
  },
  {
    question: "How often should prompts be rerun?",
    answer:
      "Choose a cadence that matches the decisions and content changes you need to evaluate. Keep the core set and conditions stable, and do not treat normal answer variability as a trend after one rerun.",
  },
] as const;

export default function AiSearchPromptTrackingSpreadsheetPage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Free CSV spreadsheet"
      breadcrumb="AI search prompt tracking spreadsheet"
      title="AI search prompt tracking spreadsheet"
      description="A long-format worksheet for preserving prompt context, provider conditions, brand outcomes, citations, competitors, raw evidence, and comparable reruns."
      download={{
        href: "/ai-search-prompt-tracking-spreadsheet.csv",
        label: "Download the tracking spreadsheet",
      }}
      faqs={faqs}
    >
      <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="tracker-format-heading">
        <div>
          <p className="eyebrow">One row per observation</p>
          <h2 id="tracker-format-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
            Keep provider results separate until analysis
          </h2>
        </div>
        <div className="space-y-4 text-pretty leading-7 text-zinc-400">
          <p>
            The worksheet uses long-format rows: one frozen prompt, one
            provider surface, one run, and one date per row. That structure
            preserves coverage and avoids blending materially different answer
            environments into a single cell.
          </p>
          <p>
            Duplicate the starter rows for each provider and rerun. Keep raw
            answers outside the sheet when they are large or sensitive, then
            store only an owner-controlled reference in the evidence column.
          </p>
        </div>
      </section>

      <section aria-labelledby="tracker-columns-heading">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Six column groups</p>
            <h2 id="tracker-columns-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Enough context to explain every metric
            </h2>
          </div>
          <Table2 className="hidden size-8 text-emerald-300 sm:block" aria-hidden="true" />
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {columns.map(([title, description], index) => (
            <article key={title} className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <span className="font-mono text-xs text-emerald-300">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </SeoResourceShell>
  );
}
