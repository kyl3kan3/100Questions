import { FileText } from "lucide-react";

import { SeoResourceShell } from "@/components/seo-resource-shell";
import { buildResourceMetadata } from "@/lib/resource-metadata";

const path = "/ai-visibility-report-template" as const;

export const metadata = buildResourceMetadata({
  path,
  title: "Free AI Visibility Report Template",
  description:
    "Download a transparent AI visibility report template covering scope, coverage, mentions, prominence, citations, competitors, limitations, and next actions.",
  keywords: [
    "AI visibility report template",
    "AEO report template",
    "LLM visibility report",
    "AI search reporting template",
  ],
});

const sections = [
  ["Executive summary", "State the collection date, market, providers, eligible coverage, headline findings, and the decision the report supports."],
  ["Scope and protocol", "Record the frozen prompts, provider surfaces, model identifiers, grounding requirements, locale, session state, and exclusions."],
  ["Visibility and prominence", "Report neutral discovery mentions separately from brand-named diagnostics, then show whether the brand led or merely appeared."],
  ["Citations and sources", "List claimed-domain citations, recurring third-party sources, unsupported claims, and source gaps by prompt."],
  ["Competitor evidence", "Compare selected competitors at the answer level without presenting a small convenience sample as total market share."],
  ["Actions and rerun plan", "Tie each action to stored evidence, name an owner, define completion evidence, and preserve the frozen set for the rerun."],
] as const;

const faqs = [
  {
    question: "What belongs in an AI visibility report?",
    answer:
      "Include the test protocol, question set, provider coverage, brand mentions, prominence, citations, competitors, representation accuracy, raw evidence, limitations, and prioritized actions.",
  },
  {
    question: "Should an AI visibility report use one headline score?",
    answer:
      "A composite can aid scanning, but it should never replace component metrics. Visibility, prominence, citations, accuracy, sentiment, and coverage answer different questions and should remain visible.",
  },
  {
    question: "How often should the report be updated?",
    answer:
      "Update it after meaningful changes have had time to become retrievable. Use the same frozen prompts and protocol when the purpose is comparison; otherwise label the new collection as a different benchmark.",
  },
  {
    question: "Can this template be used for clients?",
    answer:
      "Yes. Replace the placeholders, keep raw evidence in an appendix, disclose the collection method, and avoid promising rankings, citations, or traffic from a directional snapshot.",
  },
] as const;

export default function AiVisibilityReportTemplatePage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Free ungated template"
      breadcrumb="AI visibility report template"
      title="AI visibility report template"
      description="A client- and leadership-ready reporting structure that keeps the raw evidence, collection coverage, and limitations behind every conclusion."
      download={{
        href: "/ai-visibility-report-template.md",
        label: "Download the report template",
      }}
      faqs={faqs}
    >
      <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="report-use-heading">
        <div>
          <p className="eyebrow">A report, not a scorecard screenshot</p>
          <h2 id="report-use-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
            Let readers reconstruct the result
          </h2>
        </div>
        <div className="space-y-4 text-pretty leading-7 text-zinc-400">
          <p>
            Fill the template only after the collection is complete. Write the
            executive summary last so it reflects eligible results rather than
            the outcome you expected before testing.
          </p>
          <p>
            Link every important statement to an answer, citation, prompt, or
            documented calculation. Put full transcripts and source URLs in an
            appendix so the main report stays readable without becoming opaque.
          </p>
        </div>
      </section>

      <section aria-labelledby="report-sections-heading">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Six required sections</p>
            <h2 id="report-sections-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              From protocol to next action
            </h2>
          </div>
          <FileText className="hidden size-8 text-emerald-300 sm:block" aria-hidden="true" />
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {sections.map(([title, description], index) => (
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
