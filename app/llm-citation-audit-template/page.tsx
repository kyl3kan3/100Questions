import { Link2 } from "lucide-react";

import { SeoResourceShell } from "@/components/seo-resource-shell";
import { buildResourceMetadata } from "@/lib/resource-metadata";

const path = "/llm-citation-audit-template" as const;

export const metadata = buildResourceMetadata({
  path,
  title: "Free LLM Citation Audit Template",
  description:
    "Download an LLM citation audit template for recording cited URLs, source ownership, claims supported, competitor citations, gaps, and evidence-based actions.",
  keywords: [
    "LLM citation audit template",
    "AI citation audit",
    "ChatGPT citation tracking template",
    "AI search source audit",
  ],
});

const fields = [
  ["Prompt and provider", "Preserves the question and answer surface that produced the citation."],
  ["Cited URL and domain", "Identifies the exact page and source owner instead of counting a domain without context."],
  ["Source class", "Separates owned, independent editorial, directory, community, competitor, and unknown sources."],
  ["Claim supported", "Records the statement or decision the source appears to support in the answer."],
  ["Brand and competitor effect", "Shows whether the citation supports your brand, a competitor, both, or neither."],
  ["Accuracy and freshness", "Flags outdated, contradictory, inaccessible, or weakly supported source material."],
  ["Action and owner", "Turns a source gap into a specific correction, publication, outreach, or monitoring task."],
] as const;

const faqs = [
  {
    question: "What is an LLM citation audit?",
    answer:
      "It is a structured review of the URLs and domains cited in AI-generated answers, the claims those sources support, which brands benefit, and what evidence gaps or inaccuracies require action.",
  },
  {
    question: "Should all cited domains be treated equally?",
    answer:
      "No. Record the exact page, source type, supported claim, freshness, independence, and relevance. A generic directory mention and a detailed independent evaluation are different evidence.",
  },
  {
    question: "What if an answer mentions the brand without citing it?",
    answer:
      "Record the mention in the answer-level tracker and leave the claimed-domain citation field empty. Mentions and citations are separate signals and should not be substituted for one another.",
  },
  {
    question: "Does earning a link guarantee an AI citation?",
    answer:
      "No. The template documents observed citations and source opportunities; it does not imply that publishing or earning a link will cause a future model to retrieve or cite it.",
  },
] as const;

export default function LlmCitationAuditTemplatePage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Free evidence worksheet"
      breadcrumb="LLM citation audit template"
      title="LLM citation audit template"
      description="Map the exact pages shaping AI answers, the claims they support, the brands they benefit, and the evidence gaps worth fixing."
      download={{
        href: "/llm-citation-audit-template.csv",
        label: "Download the citation audit",
      }}
      faqs={faqs}
    >
      <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="citation-method-heading">
        <div>
          <p className="eyebrow">Audit pages, not domain counts</p>
          <h2 id="citation-method-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
            A citation matters because of what it supports
          </h2>
        </div>
        <div className="space-y-4 text-pretty leading-7 text-zinc-400">
          <p>
            Start from stored answers, not a backlink export. For every visible
            citation, record the exact URL, its role in the answer, and whether
            the page actually supports the generated claim.
          </p>
          <p>
            Aggregate only after reviewing the evidence. A domain-level total
            can hide that one outdated page is repeatedly shaping inaccurate
            comparisons or that one independent guide drives several prompts.
          </p>
        </div>
      </section>

      <section aria-labelledby="citation-fields-heading">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Audit fields</p>
            <h2 id="citation-fields-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Preserve the source-to-claim connection
            </h2>
          </div>
          <Link2 className="hidden size-8 text-emerald-300 sm:block" aria-hidden="true" />
        </div>
        <div className="mt-8 divide-y divide-white/[0.07] rounded-[24px] bg-[#0b0e0c] px-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:px-8">
          {fields.map(([field, purpose], index) => (
            <div key={field} className="grid gap-2 py-5 md:grid-cols-[0.08fr_0.28fr_0.64fr] md:gap-5">
              <span className="font-mono text-xs text-emerald-300">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="font-medium text-zinc-200">{field}</h3>
              <p className="text-sm leading-6 text-zinc-400">{purpose}</p>
            </div>
          ))}
        </div>
      </section>
    </SeoResourceShell>
  );
}
