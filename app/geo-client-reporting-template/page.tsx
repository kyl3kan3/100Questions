import { Presentation } from "lucide-react";

import { SeoResourceShell } from "@/components/seo-resource-shell";
import { buildResourceMetadata } from "@/lib/resource-metadata";

const path = "/geo-client-reporting-template" as const;

export const metadata = buildResourceMetadata({
  path,
  title: "Free GEO Client Reporting Template",
  description:
    "Download a GEO client reporting template for explaining AI visibility, citations, competitor evidence, coverage, limitations, actions, and rerun plans.",
});

const reportFlow = [
  ["Client decision", "Open with the business decision, market, buyer questions, and reporting period—not a generic explanation of AI search."],
  ["What was tested", "Show the frozen prompt mix, providers, model or product surfaces, dates, eligibility rules, and coverage."],
  ["What changed", "Compare like-for-like visibility, prominence, citations, accuracy, competitors, and coverage against the prior benchmark."],
  ["Why it likely changed", "Separate observed evidence from hypotheses about content, technical access, third-party sources, or platform variability."],
  ["What happens next", "Limit the action plan to a few evidence-linked priorities with owners, completion proof, and a planned validation date."],
] as const;

const faqs = [
  {
    question: "How is a GEO client report different from an SEO report?",
    answer:
      "A GEO report adds answer-level brand visibility, prominence, cited sources, competitor inclusion, representation accuracy, and provider coverage. It should complement—not replace—organic search and conversion reporting.",
  },
  {
    question: "How long should a client report be?",
    answer:
      "Keep the decision-facing narrative concise and move prompt-level results, source URLs, and full answers into an appendix or controlled evidence file. The template is structured for a short main report plus evidence.",
  },
  {
    question: "How should agencies report flat or declining results?",
    answer:
      "Show the eligible data, distinguish observation from explanation, note coverage or protocol changes, and recommend the smallest evidence-backed next action. Do not hide an unfavorable collection or invent causation.",
  },
  {
    question: "Can GEO work be tied directly to revenue?",
    answer:
      "AI referrals and conversions can be reported when instrumentation supports them, but many mentions produce no direct click. Keep observed answer visibility, traffic, assisted behavior, and revenue attribution as separate layers.",
  },
] as const;

export default function GeoClientReportingTemplatePage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Free agency template"
      breadcrumb="GEO client reporting template"
      title="GEO client reporting template"
      description="A concise, evidence-first report structure for agencies explaining what was tested, what changed, what remains uncertain, and what the client should do next."
      download={{
        href: "/geo-client-reporting-template.md",
        label: "Download the client template",
      }}
      faqs={faqs}
    >
      <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="geo-client-heading">
        <div>
          <p className="eyebrow">Decision-facing first</p>
          <h2 id="geo-client-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
            Teach the metric without burying the decision
          </h2>
        </div>
        <div className="space-y-4 text-pretty leading-7 text-zinc-400">
          <p>
            Client reporting should translate answer-level evidence into a
            decision, not overwhelm readers with a new vocabulary. Define each
            metric once, show the comparison conditions, and lead with the
            finding that changes the work.
          </p>
          <p>
            Keep raw prompts, answers, and citations available for review. The
            narrative may be concise, but the conclusion should never become
            impossible to audit.
          </p>
        </div>
      </section>

      <section aria-labelledby="geo-flow-heading">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Five-part client narrative</p>
            <h2 id="geo-flow-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Scope, evidence, interpretation, action
            </h2>
          </div>
          <Presentation className="hidden size-8 text-emerald-300 sm:block" aria-hidden="true" />
        </div>
        <div className="mt-8 space-y-4">
          {reportFlow.map(([title, description], index) => (
            <article key={title} className="grid gap-3 rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] md:grid-cols-[0.08fr_0.25fr_0.67fr] md:items-start">
              <span className="font-mono text-xs text-emerald-300">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm leading-6 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </SeoResourceShell>
  );
}
