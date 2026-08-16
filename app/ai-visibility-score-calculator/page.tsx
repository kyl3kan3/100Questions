import { AiVisibilityScoreCalculator } from "@/components/ai-visibility-score-calculator";
import { SeoResourceShell } from "@/components/seo-resource-shell";
import Link from "next/link";
import { buildResourceMetadata } from "@/lib/resource-metadata";
import {
  calculateVisibilityScores,
  DEFAULT_VISIBILITY_SCORE_COUNTS,
} from "@/lib/public-tool-data";

const path = "/ai-visibility-score-calculator" as const;
const modified = { iso: "2026-08-16", label: "August 16, 2026" } as const;

export const metadata = buildResourceMetadata({
  path,
  title: "AI Visibility Score: Definition & Calculator",
  description:
    "Learn what an AI visibility score means and calculate it from real answers using transparent mention, prominence, citation, accuracy, and coverage formulas.",
  modifiedTime: modified.iso,
});

const faqs = [
  {
    question: "What does this AI visibility score measure?",
    answer:
      "It summarizes observed answers from a defined prompt test. The composite weights brand visibility at 50%, prominence at 20%, claimed-domain citations at 20%, and factual accuracy at 10%.",
  },
  {
    question: "Does the calculator scan a website?",
    answer:
      "No. Website readiness and observed answer visibility are different measurements. Enter counts from real, time-stamped AI answers rather than inferring visibility from schema, word count, or other proxies.",
  },
  {
    question: "What counts as an eligible answer?",
    answer:
      "An eligible answer completed under the defined protocol and met any required grounding or source conditions. Failures and unsupported runs belong in coverage, not silently in the miss denominator.",
  },
  {
    question: "Is the composite comparable across tools?",
    answer:
      "Only when the tools use the same questions, providers, collection conditions, eligibility rules, and formula. Otherwise similar-looking scores can measure materially different things.",
  },
] as const;

const defaultScores = calculateVisibilityScores(
  DEFAULT_VISIBILITY_SCORE_COUNTS,
);

export default function AiVisibilityScoreCalculatorPage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Free transparent calculator"
      breadcrumb="AI visibility score calculator"
      title="AI visibility score: definition and calculation"
      description="An AI visibility score summarizes a defined prompt test. Calculate one from real answer counts while keeping visibility, prominence, citations, accuracy, and coverage separate."
      modified={modified}
      primaryAction={{ href: "/ai-search-visibility-tool", label: "Measure my AI visibility" }}
      faqs={faqs}
    >
      <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="score-definition-heading">
        <div>
          <p className="eyebrow">AI visibility score definition</p>
          <h2 id="score-definition-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
            A summary of observed answers under one protocol
          </h2>
        </div>
        <div className="space-y-4 text-pretty leading-7 text-zinc-400">
          <p>
            An AI visibility score summarizes how a target brand performed in
            a defined set of AI-generated answers. It is not a permanent rank,
            a property of the domain, or a universal grade. Its meaning depends
            on the questions, providers, market, date, grounding rules, and
            formula used to create it.
          </p>
          <p>
            The calculator below weights discovery visibility at 50%,
            prominence at 20%, claimed-domain citations at 20%, and factual
            accuracy at 10%. Coverage stays separate so failed collection
            cannot masquerade as low brand visibility. See how those metrics
            map to{" "}
            <Link className="text-emerald-300 underline underline-offset-4" href="/aeo-vs-geo">
              AEO and GEO outcomes
            </Link>.
          </p>
        </div>
      </section>

      <AiVisibilityScoreCalculator />

      <noscript>
        <section
          className="rounded-[26px] border border-amber-300/20 bg-amber-300/[0.04] p-6 sm:p-8"
          aria-labelledby="manual-score-heading"
        >
          <p className="eyebrow">No-JavaScript worksheet</p>
          <h2
            id="manual-score-heading"
            className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white"
          >
            Calculate the same score by hand
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
            Visibility = mentions ÷ eligible answers. Prominence = prominent
            mentions ÷ mentioning answers. Owned citations = claimed-domain
            citations ÷ eligible answers. Accuracy = accurate descriptions ÷
            mentioning answers. Round each rate, then calculate 50% visibility +
            20% prominence + 20% owned citations + 10% accuracy.
          </p>
          <p className="mt-4 text-sm leading-6 text-zinc-300">
            The default example (100 eligible, 25 mentions, 10 prominent, 12
            cited, and 22 accurate) produces {defaultScores.composite}/100:
            {` ${defaultScores.visibility}%`} visibility,
            {` ${defaultScores.prominence}%`} prominence,
            {` ${defaultScores.citation}%`} citations, and
            {` ${defaultScores.accuracy}%`} accuracy.
          </p>
        </section>
      </noscript>

      <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="score-interpret-heading">
        <div>
          <p className="eyebrow">Interpretation guardrail</p>
          <h2 id="score-interpret-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
            A score is a summary of a test—not a property of the brand
          </h2>
        </div>
        <div className="space-y-4 text-pretty leading-7 text-zinc-400">
          <p>
            The same brand can score differently when the question set,
            providers, locale, web-search behavior, date, or eligibility rules
            change. Save those conditions beside every score.
          </p>
          <p>
            Compare reruns only against the same frozen benchmark. Read the
            component rates before acting: a citation problem requires a
            different response from an accuracy or discovery problem.
          </p>
          <p>
            Need the underlying answer evidence rather than manual counts? The{" "}
            <Link className="text-emerald-300 underline underline-offset-4" href="/ai-search-visibility-tool">
              AI search visibility tool
            </Link>{" "}
            runs 25 frozen buyer questions across four grounded providers and
            preserves every eligible answer, source, and failure.
          </p>
        </div>
      </section>
    </SeoResourceShell>
  );
}
