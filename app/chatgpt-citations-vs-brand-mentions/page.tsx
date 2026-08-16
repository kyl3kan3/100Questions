import { ArrowRight, Check, Link2, MessageSquareText } from "lucide-react";
import Link from "next/link";

import { SeoResourceShell } from "@/components/seo-resource-shell";
import { Button } from "@/components/ui/button";
import { buildResourceMetadata } from "@/lib/resource-metadata";

const path = "/chatgpt-citations-vs-brand-mentions" as const;
const date = { iso: "2026-08-16", label: "August 16, 2026" } as const;

export const metadata = buildResourceMetadata({
  path,
  title: "ChatGPT Citations vs Brand Mentions",
  description:
    "Learn the difference between ChatGPT citations and brand mentions, how to score each signal, and why being named is not the same as being used as a source.",
  publishedTime: date.iso,
  modifiedTime: date.iso,
});

const faqs = [
  {
    question: "What is a brand mention in ChatGPT?",
    answer:
      "A brand mention occurs when the answer names the target brand, product, or accepted alias. The answer may mention a brand without linking to or citing its website, so mention rate and citation rate must be scored separately.",
  },
  {
    question: "What is a ChatGPT citation?",
    answer:
      "A citation is a source link or attribution supplied with the answer. For brand measurement, distinguish the claimed domain from third-party domains. A citation can support the answer without naming the target brand, and a mention can appear without an owned-domain citation.",
  },
  {
    question: "Are ChatGPT mentions or citations more important?",
    answer:
      "They answer different questions. Mentions show brand inclusion in the response; citations show which sources supported the grounded answer. Commercial discovery may prioritize mentions and prominence, while content authority and referral opportunity may prioritize citations.",
  },
  {
    question: "How do you measure ChatGPT brand mentions and citations?",
    answer:
      "Freeze neutral buyer questions, use consistent web-search conditions, preserve each answer and source, and label target mentions, prominence, selected competitors, and source ownership. Report eligible-answer denominators and failures explicitly.",
  },
] as const;

export default function ChatGptCitationsVsBrandMentionsPage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Metric definition guide"
      breadcrumb="ChatGPT citations vs brand mentions"
      title="ChatGPT citations vs brand mentions"
      description="A brand can be named without being cited, cited without being named, or both. Separate the signals before deciding what to improve."
      published={date}
      modified={date}
      primaryAction={{ href: "/ai-search-visibility-tool", label: "Measure mentions and citations" }}
      faqs={faqs}
    >
      <section className="grid gap-6 lg:grid-cols-2" aria-labelledby="definitions-heading">
        <h2 id="definitions-heading" className="sr-only">Citation and mention definitions</h2>
        <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
          <MessageSquareText className="size-6 text-emerald-300" aria-hidden="true" />
          <p className="eyebrow mt-5">Brand mention</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">The answer names the brand</h3>
          <p className="mt-4 leading-7 text-zinc-400">
            Count a target mention when the answer text names the target,
            product, or a defined alias. Then classify prominence: lead
            recommendation, shortlist, incidental mention, or absence. A link
            is not required for a mention.
          </p>
        </article>
        <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
          <Link2 className="size-6 text-emerald-300" aria-hidden="true" />
          <p className="eyebrow mt-5">Citation</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">The answer supplies a source</h3>
          <p className="mt-4 leading-7 text-zinc-400">
            Count a citation when the grounded response returns a source URL
            or explicit attribution. Classify whether it belongs to the
            claimed domain or a third party. The source may support a category
            claim without naming the target brand.
          </p>
        </article>
      </section>

      <section aria-labelledby="matrix-heading">
        <p className="eyebrow">The four possible outcomes</p>
        <h2 id="matrix-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
          Mention and citation are independent answer events
        </h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-[26px] bg-white/[0.08] md:grid-cols-2">
          {[
            ["Mentioned + owned domain cited", "The brand enters the answer and its site appears in the source set. Inspect whether the cited page supports the specific claim."],
            ["Mentioned + no owned citation", "The brand is visible, but the answer may rely on third-party corroboration, model knowledge, or another source. This is still a valid mention."],
            ["Not mentioned + owned domain cited", "The site contributes evidence to the answer without winning brand inclusion. The cited page may be useful but weakly connected to the entity or buying decision."],
            ["Neither mentioned nor cited", "The question produced no direct target visibility. Review which competitors and sources appeared before choosing an action."],
          ].map(([title, description]) => (
            <article key={title} className="bg-[#0b0e0c] p-6 sm:p-8">
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="scoring-heading" className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="eyebrow">How to score the signals</p>
          <h2 id="scoring-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            Preserve the event before calculating the rate
          </h2>
        </div>
        <div className="space-y-4">
          {[
            ["Discovery mention rate", "Neutral eligible answers naming the target ÷ neutral eligible answers."],
            ["Prominence rate", "Lead or shortlist target mentions ÷ answers that mention the target."],
            ["Claimed-domain citation rate", "Eligible answers citing the submitted domain ÷ eligible answers."],
            ["Third-party source frequency", "Answer-event frequency plus the number of distinct buyer questions reached by each domain."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-[20px] bg-white/[0.025] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
              <h3 className="font-semibold text-zinc-200">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="example-heading" className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/[0.035] p-7 sm:p-9">
        <p className="eyebrow">Worked example</p>
        <h2 id="example-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
          One answer, three separate observations
        </h2>
        <p className="mt-5 max-w-3xl rounded-2xl bg-white/[0.035] p-5 text-sm leading-6 text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
          “For a small marketing team, consider Acme for simple audits and
          Beacon for continuous monitoring.” Sources: an independent category
          roundup and beacon.example/pricing.
        </p>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "Acme: shortlist mention, no owned citation",
            "Beacon: shortlist mention, owned-domain citation",
            "Category roundup: third-party citation, not a brand mention",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-zinc-300">
              <Check className="mt-1 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs leading-5 text-zinc-500">
          Illustrative answer only. Real tests must preserve the provider,
          model, timestamp, question, full response, and returned source URLs.
        </p>
      </section>

      <section aria-labelledby="actions-heading">
        <p className="eyebrow">Act on the observed gap</p>
        <h2 id="actions-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
          A mention problem and a citation problem need different work
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["Mention gap", "Clarify category and audience language, answer the exact buyer question, connect the page to the brand entity, and earn relevant third-party corroboration."],
            ["Prominence gap", "Strengthen the proof, comparison detail, use-case specificity, and independent authority needed to move from incidental inclusion to a shortlist."],
            ["Owned citation gap", "Publish an original, directly relevant source page with extractable facts, clear authorship, supporting evidence, and stable crawlable URLs."],
            ["Third-party citation gap", "Identify the domains repeatedly used for the buyer question, then pursue legitimate coverage, data contributions, listings, or expert references where editorially appropriate."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 max-w-3xl leading-7 text-zinc-400">
          These actions support both{" "}
          <Link className="text-emerald-300 underline underline-offset-4" href="/aeo-vs-geo">
            AEO and GEO
          </Link>:
          answer-ready pages help selection, while corroborating sources help
          generative engines verify the entity and its claims.
        </p>
      </section>

      <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">See both signals together</p>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">Measure mentions, prominence, citations, and competitors across four providers.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-zinc-800">The $9 first audit preserves every answer and source behind the result.</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="bg-zinc-950 text-white hover:bg-zinc-800">
            <Link href="/ai-search-visibility-tool">See the visibility tool <ArrowRight aria-hidden="true" /></Link>
          </Button>
        </div>
      </section>
    </SeoResourceShell>
  );
}
