import { AiVisibilityScoreCalculator } from "@/components/ai-visibility-score-calculator";
import { SeoResourceShell } from "@/components/seo-resource-shell";
import { buildResourceMetadata } from "@/lib/resource-metadata";

const path = "/ai-visibility-score-calculator" as const;

export const metadata = buildResourceMetadata({
  path,
  title: "AI Visibility Score Calculator with Formula",
  description:
    "Calculate AI visibility from observed answers using a transparent formula for mention rate, prominence, owned citations, accuracy, and coverage.",
  keywords: [
    "AI visibility score calculator",
    "GEO score calculator",
    "AI search visibility score",
    "LLM visibility calculator",
  ],
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

export default function AiVisibilityScoreCalculatorPage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Free transparent calculator"
      breadcrumb="AI visibility score calculator"
      title="AI visibility score calculator"
      description="Turn real prompt-test counts into a transparent composite while keeping visibility, prominence, citations, accuracy, and coverage separate."
      faqs={faqs}
    >
      <AiVisibilityScoreCalculator />

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
        </div>
      </section>
    </SeoResourceShell>
  );
}
