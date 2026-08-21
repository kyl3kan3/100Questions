import { ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { AiBrandRiskChecker } from "@/components/ai-brand-risk-checker";
import { AnalyticsEvent } from "@/components/analytics-event";
import { JsonLd } from "@/components/json-ld";
import { MarketingCheckoutButton } from "@/components/marketing-checkout-button";
import { SeoResourceShell } from "@/components/seo-resource-shell";
import { buildResourceMetadata } from "@/lib/resource-metadata";
import { absoluteUrl } from "@/lib/site";

const path = "/ai-brand-risk-checker" as const;
const published = { iso: "2026-08-16", label: "August 16, 2026" } as const;
const modified = { iso: "2026-08-20", label: "August 20, 2026" } as const;

export const metadata = buildResourceMetadata({
  path,
  title: "AI Brand Risk Checker: Find Visibility Gaps",
  description:
    "Build an AI brand risk review for incorrect claims, missing citations, competitor substitution, inconsistent descriptions, and unanswered questions.",
  publishedTime: published.iso,
  modifiedTime: modified.iso,
});

const faqs = [
  {
    question: "What are AI brand risks?",
    answer:
      "AI brand risks are observable problems in generated answers that can distort buyer understanding: incorrect claims, missing or weak source support, competitor substitution, inconsistent descriptions, and unanswered decision questions.",
  },
  {
    question: "Does this checker query ChatGPT, Claude, Gemini, or Grok?",
    answer:
      "No. The free checker creates a domain- and industry-specific review plan and records which risk areas you flag. A 100 Questions audit is the separate paid step that sends one frozen 25-question set across four providers and preserves eligible answers and citations.",
  },
  {
    question: "How should AI brand risk be measured?",
    answer:
      "Use repeatable buyer questions, preserve the provider, model, timestamp, answer, and sources, then label each finding by risk type and business importance. Keep coverage failures visible instead of treating them as clean results.",
  },
  {
    question: "Is a missing ChatGPT mention a brand risk?",
    answer:
      "It can be a commercial discovery gap when the question represents a real buying decision and relevant competitors appear instead. Absence from vanity prompts is not automatically a material risk.",
  },
] as const;

const riskTypes = [
  ["Incorrect claims", "Outdated, invented, or unsupported facts about the company, product, audience, pricing, locations, or capabilities."],
  ["Missing citations", "A claim appears without an inspectable source, or the cited page does not actually support what the answer says."],
  ["Competitor substitution", "Another company wins the shortlist, or the target is confused with a similarly named entity."],
  ["Inconsistent descriptions", "Providers disagree about the brand's category, audience, use cases, or differentiators."],
  ["Unanswered buyer questions", "High-intent discovery or evaluation questions produce no useful answer, target mention, or supporting source."],
] as const;

export default function AiBrandRiskCheckerPage() {
  const pageUrl = absoluteUrl(path);

  return (
    <SeoResourceShell
      path={path}
      eyebrow="Free interactive checker"
      breadcrumb="AI brand risk checker"
      title="AI brand risk checker"
      description="Turn a domain and industry into a structured review for hallucinations, missing citations, competitor displacement, inconsistent positioning, and unanswered buyer questions."
      published={published}
      modified={modified}
      primaryAction={{ href: "#checker", label: "Build the checklist" }}
      faqs={faqs}
    >
      <AnalyticsEvent
        event="seo_landing_viewed"
        onceKey="ai-brand-risk-checker"
        properties={{ landing_page: path, keyword_cluster: "brand_risks" }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "AI Brand Risk Checker",
          description:
            "A free interactive checklist for reviewing five categories of AI brand risk.",
          url: pageUrl,
          serviceType: "AI brand risk planning checklist",
          isAccessibleForFree: true,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: riskTypes.map(([name]) => name),
          provider: { "@id": `${absoluteUrl()}#organization` },
        }}
      />

      <AiBrandRiskChecker />

      <section aria-labelledby="risk-types-heading">
        <p className="eyebrow">Five observable risk types</p>
        <h2
          id="risk-types-heading"
          className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
        >
          Treat “brand risk” as evidence, not a vague reputation score
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {riskTypes.map(([title, description], index) => (
            <article
              key={title}
              className="rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
            >
              <span className="font-mono text-xs text-emerald-300">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="buyer-risk-heading">
        <div>
          <p className="eyebrow">Prioritize commercial exposure</p>
          <h2 id="buyer-risk-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            Test buyer questions, not vanity prompts
          </h2>
        </div>
        <div className="space-y-5 text-pretty leading-7 text-zinc-400">
          <p>
            A wrong answer matters more when it appears during discovery,
            comparison, pricing, implementation, or risk evaluation. Start
            with questions a prospect could reasonably ask before choosing a
            provider. Then add named diagnostics to inspect factual knowledge.
          </p>
          <p>
            Preserve the full answer and source set. A screenshot without the
            question, provider condition, timestamp, and citation evidence is
            difficult to reproduce or prioritize.
          </p>
          <Link className="inline-flex items-center gap-2 font-semibold text-emerald-300 underline underline-offset-4" href="/ai-visibility-prompts">
            Choose defensible buyer questions <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="response-heading">
        <p className="eyebrow">From finding to response</p>
        <h2 id="response-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
          Match the corrective action to the observed failure
        </h2>
        <div className="mt-8 overflow-hidden rounded-[26px] bg-white/[0.08]">
          {[
            ["A factual error", "Correct the canonical owned page, make the fact extractable, align major profiles, and document the source used for the correction."],
            ["A source gap", "Publish or improve the page that directly supports the claim, then pursue legitimate third-party corroboration where it helps the buyer."],
            ["Competitor displacement", "Compare the winning competitor's answer evidence and source set before changing messaging or content."],
            ["Inconsistent positioning", "Standardize the entity name, primary category, audience, and defensible differentiators across owned and important third-party surfaces."],
            ["Question coverage gap", "Create a useful answer for the actual buyer decision, connect it internally, and re-run the same question after recrawl time."],
          ].map(([finding, action]) => (
            <div key={finding} className="grid gap-3 border-b border-white/[0.08] bg-[#0b0e0c] p-6 last:border-b-0 md:grid-cols-[0.35fr_0.65fr]">
              <h3 className="font-semibold text-white">{finding}</h3>
              <p className="text-sm leading-6 text-zinc-400">{action}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-amber-300/15 bg-amber-300/[0.05] p-7 sm:p-9">
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-3 text-amber-200">
              <ShieldAlert className="size-5" aria-hidden="true" />
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">Checklist versus observed evidence</p>
            </div>
            <h2 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
              The free checker plans the review. The audit runs it across four providers.
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-zinc-400">
              The $9 first audit freezes 25 buyer questions, collects 100
              planned answers, and reports mentions, competitors, citations,
              coverage, and evidence-linked actions.
            </p>
            <ul className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
              {["No subscription", "Answers and sources preserved", "Four-provider comparison", "Comparable question set for reruns"].map((item) => (
                <li key={item} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-emerald-300" aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>
          <MarketingCheckoutButton className="min-w-64" label="Run the $9 audit" />
        </div>
      </section>
    </SeoResourceShell>
  );
}
