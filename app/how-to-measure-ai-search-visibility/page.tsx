import { ArrowRight, Check, ClipboardCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { EvidenceNotes } from "@/components/evidence-notes";
import { SeoResourceShell } from "@/components/seo-resource-shell";
import { Button } from "@/components/ui/button";
import { buildResourceMetadata } from "@/lib/resource-metadata";

const path = "/how-to-measure-ai-search-visibility" as const;
const published = { iso: "2026-08-16", label: "August 16, 2026" } as const;
const modified = { iso: "2026-08-20", label: "August 20, 2026" } as const;

export const metadata = buildResourceMetadata({
  path,
  title: "How to Measure AI Search Visibility",
  description:
    "Measure AI search visibility with a frozen buyer-question set, answer-level evidence, clear denominators, provider coverage, and comparable reruns.",
  publishedTime: published.iso,
  modifiedTime: modified.iso,
});

const faqs = [
  {
    question: "What is the best metric for AI search visibility?",
    answer:
      "There is no single best metric. Start with discovery mention rate, then keep prominence, competitor share of voice, claimed-domain citations, factual accuracy, and provider coverage separate. Each metric diagnoses a different problem.",
  },
  {
    question: "How many prompts are needed to measure AI visibility?",
    answer:
      "Enough to cover meaningful buyer decisions without pretending to be statistically representative. A balanced 20-question neutral discovery set plus five brand diagnostics is practical for a directional benchmark. Record the limits and compare only identical reruns.",
  },
  {
    question: "Should failed AI answers count as brand misses?",
    answer:
      "No. A provider failure or answer that does not meet required grounding conditions belongs in coverage. Counting it as a brand miss confuses collection reliability with brand visibility and biases the result.",
  },
  {
    question: "Can AI visibility scores be compared across tools?",
    answer:
      "Only when the question set, providers, market, collection date, grounding rules, eligibility criteria, and formula match. Similar-looking scores from different protocols are not necessarily comparable.",
  },
] as const;

const measures = [
  ["Discovery visibility", "Neutral eligible answers mentioning the target ÷ neutral eligible answers", "Can buyers discover the brand before naming it?"],
  ["Prominence", "Lead or shortlist mentions ÷ answers that mention the target", "When present, is the brand central or incidental?"],
  ["Share of voice", "Target mention events ÷ target plus selected-competitor mention events", "Who occupies the shortlist across the same questions?"],
  ["Owned citation rate", "Eligible answers citing the claimed domain ÷ eligible answers", "Does the brand's site supply source evidence?"],
  ["Accuracy", "Accurate brand descriptions ÷ target-named answers", "Is the brand represented correctly after it is named?"],
  ["Coverage", "Eligible grounded answers ÷ planned answers", "How much of the benchmark produced usable evidence?"],
] as const;

export default function HowToMeasureAiSearchVisibilityPage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Measurement framework"
      breadcrumb="How to measure AI search visibility"
      title="How to measure AI search visibility"
      description="Build a controlled benchmark around real buyer questions, preserve the answer-level evidence, and keep visibility, citations, competitors, accuracy, and coverage distinct."
      published={published}
      modified={modified}
      primaryAction={{ href: "/ai-search-visibility-tool", label: "Use the AI visibility tool" }}
      faqs={faqs}
    >
      <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="definition-heading">
        <div>
          <p className="eyebrow">Start with the measured surface</p>
          <h2 id="definition-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            Visibility means appearing in the answer—not merely being crawlable
          </h2>
        </div>
        <div className="space-y-5 text-pretty leading-7 text-zinc-400">
          <p>
            AI search visibility measures whether a brand appears, how
            prominently it appears, and which sources support the answer when
            an AI system responds to relevant questions. A technical readiness
            check can show that a site is accessible; it cannot prove that a
            provider actually mentioned the brand.
          </p>
          <p>
            Define whether the program is measuring answer-level AEO, broader
            cross-engine GEO, or both. The{" "}
            <Link className="text-emerald-300 underline underline-offset-4" href="/aeo-vs-geo">
              AEO vs GEO comparison
            </Link>{" "}
            maps each surface to the right metrics.
          </p>
        </div>
      </section>

      <section aria-labelledby="steps-heading">
        <p className="eyebrow">Seven-step protocol</p>
        <h2 id="steps-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
          Make the test repeatable before collecting the first answer
        </h2>
        <ol className="mt-8 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {[
            ["Define the market", "Write down the category, audience, use cases, constraints, country, language, target brand, claimed domain, and selected competitors."],
            ["Choose buyer questions", "Cover category discovery, use-case fit, comparisons, risk, and proof. Keep neutral discovery questions separate from brand-named diagnostics."],
            ["Freeze provider conditions", "Record provider, model identifier, web-grounding requirement, locale, collection date, and any exclusion rules."],
            ["Collect answer evidence", "Preserve the exact question, full answer, source URLs, timestamp, target and competitor mentions, prominence, and completion state."],
            ["Apply eligibility rules", "Exclude failed or unsupported answers from relevant visibility denominators and report them transparently in coverage."],
            ["Calculate component metrics", "Report mentions, prominence, share of voice, citations, accuracy, and coverage before considering a composite score."],
            ["Rerun like for like", "After meaningful work and recrawling time, reuse the same questions and conditions. Compare the underlying answers and sources, not only the headline score."],
          ].map(([title, description], index) => (
            <li key={title} className="grid gap-3 py-6 sm:grid-cols-[3rem_14rem_1fr] sm:gap-6">
              <span className="font-mono text-sm text-emerald-300">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="font-semibold text-zinc-100">{title}</h3>
              <p className="text-sm leading-6 text-zinc-400">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="metrics-heading">
        <p className="eyebrow">Metric dictionary</p>
        <h2 id="metrics-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
          Use denominators that match the question
        </h2>
        <div className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-white/[0.04] text-zinc-200">
              <tr>
                <th className="p-4 font-semibold">Measure</th>
                <th className="p-4 font-semibold">Transparent formula</th>
                <th className="p-4 font-semibold">Decision it supports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08] text-zinc-400">
              {measures.map(([measure, formula, decision]) => (
                <tr key={measure}>
                  <th className="p-4 align-top font-medium text-zinc-200">{measure}</th>
                  <td className="p-4 align-top leading-6">{formula}</td>
                  <td className="p-4 align-top leading-6">{decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button asChild variant="link" className="mt-5">
          <Link href="/ai-visibility-score-calculator">Calculate an AI visibility score <ArrowRight aria-hidden="true" /></Link>
        </Button>
      </section>

      <section aria-labelledby="protocol-heading" className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/[0.035] p-7 sm:p-9">
        <ClipboardCheck className="size-6 text-emerald-300" aria-hidden="true" />
        <h2 id="protocol-heading" className="mt-5 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
          A minimum viable protocol to save with every score
        </h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Exact question set and question type",
            "Target, claimed domain, and selected competitors",
            "Provider and model identifiers",
            "Grounding and eligibility rules",
            "Country, language, and collection timestamp",
            "Answer, citation, and failure evidence",
          ].map((item) => (
            <div key={item} className="flex gap-3 rounded-2xl bg-white/[0.035] p-4 text-sm leading-6 text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
              <Check className="mt-1 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="mistakes-heading">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Common measurement errors</p>
            <h2 id="mistakes-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Avoid scores that look precise but answer the wrong question
            </h2>
          </div>
          <TriangleAlert className="hidden size-8 text-amber-300 sm:block" aria-hidden="true" />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["Planting the brand in discovery prompts", "A brand-named question tests recognition or accuracy. It cannot prove that a neutral buyer would discover the brand."],
            ["Treating all source links as owned citations", "A grounded answer can cite third-party pages without citing the target domain. Store domains and classify ownership explicitly."],
            ["Counting provider failures as brand misses", "Collection failures depress visibility for reasons unrelated to the brand. Put them in coverage."],
            ["Comparing unlike scores", "A different question set, model, market, grounding rule, or formula changes the measured object."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <EvidenceNotes
        sourceIds={[
          "googleAiFeatures",
          "bingAiPerformance",
          "methodology",
          "visibilityIndex",
        ]}
        context="The formulas here are transparent product methodology, not an industry standard. Preserve the raw questions, answers, sources, model identifiers, failures, and collection date with every result."
      />

      <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">Run the controlled version</p>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">Measure 25 buyer questions across four AI providers.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-zinc-800">The AI search visibility tool preserves 100 planned answers, citations, competitors, coverage, and five prioritized actions.</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="bg-zinc-950 text-white hover:bg-zinc-800">
            <Link href="/ai-search-visibility-tool">See the $9 audit <ArrowRight aria-hidden="true" /></Link>
          </Button>
        </div>
      </section>
    </SeoResourceShell>
  );
}
