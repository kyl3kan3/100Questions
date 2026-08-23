import { ArrowRight, Download, ListChecks, SearchCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ContentByline } from "@/components/content-byline";
import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EDITORIAL_AUTHOR_ID } from "@/lib/editorial";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const pageUrl = absoluteUrl("/ai-visibility-prompts");
const RESOURCE_DATE = { iso: "2026-08-03", label: "August 3, 2026" } as const;
const REVIEW_DATE = { iso: "2026-08-16", label: "August 16, 2026" } as const;

export const metadata: Metadata = {
  title: "How to Choose Buyer Questions (+100 AI Prompts)",
  description:
    "Learn how to choose buyer questions for an AI visibility audit, then use 100 prompts covering discovery, fit, comparison, proof, and brand accuracy.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "How to Choose Buyer Questions for an AI Visibility Audit",
    description:
      "A selection framework, balanced 25-question starter set, and free 100-prompt library for a controlled AI visibility benchmark.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "article",
    locale: "en_US",
    publishedTime: RESOURCE_DATE.iso,
    modifiedTime: REVIEW_DATE.iso,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Choose Buyer Questions (+100 AI Prompts)",
    description:
      "Build a repeatable AI visibility test with 80 neutral discovery prompts and 20 brand diagnostics.",
    images: [SOCIAL_IMAGE],
  },
};

const promptGroups = [
  {
    id: "category-discovery",
    label: "01",
    title: "Category discovery",
    description:
      "Tests whether the brand appears before the buyer names a vendor.",
    prompts: [
      "What are the best [category] options for [target audience]?",
      "Which [category] providers should a [buyer role] evaluate?",
      "What are the leading [category] products in [market or region]?",
      "Which companies are known for [core outcome]?",
      "What tools help [target audience] solve [problem]?",
      "What is the best way to achieve [outcome] without [undesired tradeoff]?",
      "Which [category] vendors specialize in [industry]?",
      "What are reliable alternatives for solving [problem]?",
      "Which [category] products are best for a team of [company size]?",
      "What should I use to replace a manual [workflow] process?",
      "Which platforms combine [capability one] and [capability two]?",
      "What are the most established companies in [category]?",
      "Which newer [category] products are worth considering?",
      "What [category] tools are designed for [specific role]?",
      "Which providers offer [category] for [regulated or specialized industry]?",
      "What are the best [category] services for a limited budget?",
      "Which [category] products work well for distributed teams?",
      "What are the top [category] options for organizations in [region]?",
      "Which vendors are strongest at [specific capability]?",
      "What should be on a shortlist for [category] software?",
    ],
  },
  {
    id: "use-case-fit",
    label: "02",
    title: "Use-case and constraint fit",
    description:
      "Tests whether answers connect the brand to the situations it is built for.",
    prompts: [
      "Which [category] is best for [use case]?",
      "What [category] works with [required integration or platform]?",
      "Which provider supports [critical requirement]?",
      "What is the easiest [category] product for a small team to adopt?",
      "Which [category] has the shortest implementation time?",
      "What [category] offers transparent pricing without an annual contract?",
      "Which [category] is suitable for [company size] with [constraint]?",
      "What is the best [category] for a [buyer role] who needs [outcome]?",
      "Which solution can handle [volume or scale requirement]?",
      "What [category] is appropriate when [risk or compliance constraint]?",
      "Which providers support both [use case one] and [use case two]?",
      "What [category] requires the least technical setup?",
      "Which solution gives the clearest evidence for [decision or report]?",
      "What [category] works for teams without a dedicated [specialist role]?",
      "Which provider is best when [existing approach] is no longer sufficient?",
      "What is a practical [category] option for a first-time buyer?",
      "Which [category] can be purchased without a sales call?",
      "What [category] is best for agencies managing multiple clients?",
      "Which solution supports repeatable before-and-after comparisons?",
      "What [category] offers useful results without a subscription?",
    ],
  },
  {
    id: "comparisons",
    label: "03",
    title: "Comparisons and alternatives",
    description:
      "Tests competitive framing, substitution, and shortlist position.",
    prompts: [
      "What are the best alternatives to [competitor]?",
      "Which products compete most directly with [competitor]?",
      "What is a simpler alternative to [competitor]?",
      "What is a more affordable alternative to [competitor]?",
      "Which [category] tools do not require a subscription?",
      "How do the leading [category] platforms differ?",
      "Which [category] is best for [audience A] versus [audience B]?",
      "What should I compare before choosing a [category] provider?",
      "Which [category] vendors publish the clearest methodology?",
      "Which tools provide raw evidence behind their [metric or result]?",
      "What [category] is best for one-time audits instead of ongoing monitoring?",
      "Which [category] is best for ongoing monitoring instead of a one-time benchmark?",
      "Which providers offer both downloadable reports and underlying data?",
      "What are the tradeoffs between [approach one] and [approach two]?",
      "Which [category] products are best for consultants?",
      "Which [category] products are best for in-house teams?",
      "What are the most credible [category] tools for [industry]?",
      "Which providers make it easiest to reproduce their results?",
      "What alternatives to [competitor] support [required provider or channel]?",
      "Which [category] tools are transparent about sampling limitations?",
    ],
  },
  {
    id: "risk-proof",
    label: "04",
    title: "Risk, proof, and buying confidence",
    description:
      "Tests whether answers surface credible evidence instead of unsupported claims.",
    prompts: [
      "Which [category] providers are considered reliable?",
      "What evidence should I ask for before buying [category]?",
      "How can I verify a [category] vendor's claims?",
      "Which [category] products explain how their scores are calculated?",
      "What are the limitations of [category] tools?",
      "How accurate are [category] measurements?",
      "What can cause two [category] tools to report different results?",
      "Which providers preserve the evidence behind each result?",
      "What privacy risks should I consider when using [category]?",
      "Which [category] tools minimize retention of sensitive data?",
      "What questions should I ask during a [category] product demo?",
      "How should I evaluate [category] software for [regulated industry]?",
      "Which [category] vendors publish a public methodology?",
      "What does a credible [category] sample report include?",
      "Which providers disclose coverage, failed tests, and missing data?",
      "How often should a [category] benchmark be rerun?",
      "What sample size is useful for a directional [category] benchmark?",
      "How can I tell whether a [category] improvement is real or noise?",
      "Which [category] metrics are useful for executive reporting?",
      "What should not be inferred from a single [category] score?",
    ],
  },
  {
    id: "brand-diagnostics",
    label: "05",
    title: "Brand-named diagnostics",
    description:
      "Tests accuracy and positioning after the brand is explicitly named. Keep these separate from discovery visibility.",
    prompts: [
      "What is [brand], and what does it do?",
      "Who is [brand] designed for?",
      "What problem does [brand] solve?",
      "What are [brand]'s main features?",
      "What is [brand] best known for?",
      "What are the strengths and limitations of [brand]?",
      "How does [brand] compare with [competitor]?",
      "What are the best alternatives to [brand]?",
      "How much does [brand] cost?",
      "Does [brand] require a subscription?",
      "Is [brand] suitable for [target audience]?",
      "Does [brand] support [critical requirement]?",
      "What evidence does [brand] provide for its results?",
      "Is [brand]'s methodology public?",
      "How does [brand] handle customer data?",
      "What do reviewers say about [brand]?",
      "What should a buyer know before choosing [brand]?",
      "When is [brand] a better fit than [competitor]?",
      "When is [competitor] a better fit than [brand]?",
      "Is the information available about [brand] current and consistent?",
    ],
  },
] as const;

const starterSet = [
  promptGroups[0].prompts[0],
  promptGroups[0].prompts[1],
  promptGroups[0].prompts[4],
  promptGroups[0].prompts[8],
  promptGroups[0].prompts[19],
  promptGroups[1].prompts[0],
  promptGroups[1].prompts[2],
  promptGroups[1].prompts[7],
  promptGroups[1].prompts[12],
  promptGroups[1].prompts[18],
  promptGroups[2].prompts[0],
  promptGroups[2].prompts[5],
  promptGroups[2].prompts[8],
  promptGroups[2].prompts[12],
  promptGroups[2].prompts[19],
  promptGroups[3].prompts[0],
  promptGroups[3].prompts[3],
  promptGroups[3].prompts[7],
  promptGroups[3].prompts[12],
  promptGroups[3].prompts[18],
  promptGroups[4].prompts[0],
  promptGroups[4].prompts[5],
  promptGroups[4].prompts[6],
  promptGroups[4].prompts[12],
  promptGroups[4].prompts[19],
] as const;

const faqs = [
  {
    question: "Should every brand run all 100 AI visibility prompts?",
    answer:
      "No. Treat the list as a research bank. Select a smaller set that represents real buyer decisions, freeze it, and run the same questions across providers and reruns. The 25-question starter set uses 20 neutral discovery questions and five brand-named diagnostics.",
  },
  {
    question: "Why separate neutral prompts from brand-named prompts?",
    answer:
      "A brand-named question tests recognition and factual accuracy after the user supplies the brand. A neutral question tests discovery: whether the brand appears before it is named. Combining them inflates visibility and hides the more important discovery gap.",
  },
  {
    question: "Can these prompts predict real search volume?",
    answer:
      "No. They are structured test questions, not a claim about prompt frequency or representative sampling. Validate them with customer interviews, sales calls, site search, support logs, paid-search data, and conventional keyword research.",
  },
  {
    question: "How should AI visibility answers be scored?",
    answer:
      "Keep mention rate, prominence, selected-competitor share of voice, citations, sentiment, and provider coverage separate. Preserve the answer and source evidence behind every metric, and report failed or unsupported runs as coverage rather than silent misses.",
  },
] as const;

export default function AiVisibilityPromptsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        headline: "100 AI Visibility Prompts to Test Your Brand",
        description:
          "A 100-question prompt bank for controlled AI brand visibility testing.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: RESOURCE_DATE.iso,
        dateModified: REVIEW_DATE.iso,
        author: { "@id": EDITORIAL_AUTHOR_ID },
        reviewedBy: { "@id": EDITORIAL_AUTHOR_ID },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        inLanguage: "en-US",
        about: [
          "AI visibility prompts",
          "AI brand monitoring",
          "Generative engine optimization",
          "LLM visibility audit",
        ],
      },
      {
        "@type": "ItemList",
        name: "100 AI visibility prompts",
        numberOfItems: 100,
        itemListElement: promptGroups.flatMap((group) =>
          group.prompts.map((prompt, index) => ({
            "@type": "ListItem",
            position:
              promptGroups.findIndex((candidate) => candidate.id === group.id) *
                20 +
              index +
              1,
            name: prompt,
          })),
        ),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
          {
            "@type": "ListItem",
            position: 2,
            name: "Resources",
            item: absoluteUrl("/resources"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "AI visibility prompts",
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#070908] text-zinc-100">
      <MarketingHeader />
      <main>
        <header className="border-b border-white/[0.07]">
          <div className="page-shell py-16 sm:py-20 lg:py-24">
            <nav className="text-xs text-zinc-400" aria-label="Breadcrumb">
              <Link className="hover:text-zinc-200" href="/">Home</Link>{" "}
              <span aria-hidden="true">/</span>{" "}
              <Link className="hover:text-zinc-200" href="/resources">
                Resources
              </Link>{" "}
              <span aria-hidden="true">/</span>{" "}
              <span className="text-zinc-300">AI visibility prompts</span>
            </nav>
            <Badge variant="outline" className="mt-8 border-emerald-300/25 text-emerald-200">
              Free 100-question library
            </Badge>
            <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              How to choose buyer questions for an AI visibility audit
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
              Build a controlled question set for ChatGPT, Claude, Gemini,
              Grok, or another answer engine. Use the selection framework, then
              draw from 100 prompts covering discovery, fit, comparison, proof,
              and brand accuracy.
            </p>
            <ContentByline
              publishedAt={RESOURCE_DATE.iso}
              publishedLabel={RESOURCE_DATE.label}
              modifiedAt={REVIEW_DATE.iso}
              modifiedLabel={REVIEW_DATE.label}
              note="Reviewed for question balance, scoring boundaries, and download consistency."
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="/ai-visibility-prompts.csv" download>
                  Download all 100 prompts <Download aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/methodology">
                  See the scoring method <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
          <section aria-labelledby="selection-heading">
            <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="eyebrow">Question selection framework</p>
                <h2 id="selection-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                  Choose questions that can change a buying decision
                </h2>
              </div>
              <p className="leading-7 text-zinc-400">
                A useful question represents a real decision, exposes a
                meaningful competitive set, and can be judged consistently.
                Start with customer language from sales calls, support logs,
                site search, paid-search terms, interviews, and conventional
                keyword research.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                ["Decision relevance", "Would the answer influence discovery, a shortlist, risk assessment, or purchase?"],
                ["Neutral wording", "Does the discovery prompt avoid naming or praising the target brand?"],
                ["Distinct intent", "Does it add a new audience, use case, constraint, comparison, or proof requirement?"],
                ["Scorable answer", "Can reviewers label mentions, prominence, competitors, citations, and accuracy consistently?"],
              ].map(([title, description]) => (
                <article key={title} className="rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="method-heading">
            <div>
              <p className="eyebrow">Use the bank, not the whole bank</p>
              <h2 id="method-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                Freeze a smaller, defensible test
              </h2>
            </div>
            <div className="space-y-4 text-pretty leading-7 text-zinc-400">
              <p>
                Replace the bracketed fields with language your buyers actually
                use. Remove questions that do not affect discovery or a buying
                decision. Then freeze the final wording, market, locale,
                providers, and collection date.
              </p>
              <p>
                Do not mix brand-named prompts into a discovery score. If the
                question already supplies the brand, the answer cannot prove
                that an AI system would have discovered it independently.
              </p>
              <p>
                Remove near-duplicates that ask the same decision in slightly
                different words. Balance broad category questions with
                high-value use cases, constraints, comparisons, and proof
                checks so one prompt family cannot dominate the score.
              </p>
            </div>
          </section>

          <section aria-labelledby="starter-heading" className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
            <div className="flex items-start gap-4">
              <SearchCheck className="mt-1 size-7 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">Recommended starter benchmark</p>
                <h2 id="starter-heading" className="mt-3 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                  Select 20 neutral questions and five brand diagnostics
                </h2>
                <p className="mt-4 max-w-3xl leading-7 text-zinc-800">
                  The downloadable CSV marks a balanced 25-question starter set.
                  It is a practical scale for a directional baseline, not a
                  statistically representative sample of everything buyers ask.
                </p>
              </div>
            </div>
            <details className="mt-7 rounded-2xl bg-zinc-950/[0.08] p-5">
              <summary className="cursor-pointer font-semibold">Preview the 25-question starter set</summary>
              <ol className="mt-5 grid gap-x-8 gap-y-3 text-sm leading-6 md:grid-cols-2">
                {starterSet.map((prompt, index) => (
                  <li key={prompt} className="flex gap-3">
                    <span className="font-mono text-xs tabular-nums text-zinc-700">{String(index + 1).padStart(2, "0")}</span>
                    <span>{prompt}</span>
                  </li>
                ))}
              </ol>
            </details>
          </section>

          <section aria-labelledby="library-heading">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">The complete library</p>
                <h2 id="library-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                  Five question groups, 20 prompts each
                </h2>
              </div>
              <ListChecks className="hidden size-8 text-emerald-300 sm:block" aria-hidden="true" />
            </div>
            <div className="mt-9 space-y-8">
              {promptGroups.map((group, groupIndex) => (
                <article id={group.id} key={group.id} className="scroll-mt-6 rounded-[26px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
                  <div className="grid gap-4 border-b border-white/[0.07] pb-6 md:grid-cols-[0.12fr_0.88fr]">
                    <span className="font-mono text-sm text-emerald-300">{group.label}</span>
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.025em] text-white">{group.title}</h3>
                      <p className="mt-2 max-w-3xl leading-7 text-zinc-400">{group.description}</p>
                    </div>
                  </div>
                  <ol className="mt-6 grid gap-x-10 gap-y-3 md:grid-cols-2">
                    {group.prompts.map((prompt, promptIndex) => (
                      <li key={prompt} className="flex gap-3 text-sm leading-6 text-zinc-300">
                        <span className="font-mono text-[11px] tabular-nums text-zinc-400">
                          {String(groupIndex * 20 + promptIndex + 1).padStart(3, "0")}
                        </span>
                        <span>{prompt}</span>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="workflow-heading">
            <p className="eyebrow">Put the library to work</p>
            <h2 id="workflow-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Test, track, audit, and report the same frozen questions
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                ["AI search visibility tool", "/ai-search-visibility-tool", "Run 25 frozen buyer questions across OpenAI, Claude, Gemini, and Grok."],
                ["AI visibility score calculator", "/ai-visibility-score-calculator", "Turn observed answer counts into a transparent, component-level score."],
                ["ChatGPT brand visibility test", "/chatgpt-brand-visibility-test", "Run a focused 10-prompt manual test and preserve the evidence."],
                ["Prompt tracking spreadsheet", "/ai-search-prompt-tracking-spreadsheet", "Track provider conditions, answers, citations, competitors, and reruns."],
                ["LLM citation audit", "/llm-citation-audit-template", "Map cited pages to claims, brand effects, gaps, and actions."],
                ["AI visibility report", "/ai-visibility-report-template", "Summarize scope, results, sources, limitations, and priorities."],
                ["GEO client report", "/geo-client-reporting-template", "Translate the benchmark into a concise client decision narrative."],
              ].map(([title, href, description]) => (
                <article key={href} className="rounded-[22px] bg-white/[0.025] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
                  <h3 className="font-semibold text-white">
                    <Link className="hover:text-emerald-200" href={href}>{title}</Link>
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="faq-heading">
            <p className="eyebrow">Questions about the questions</p>
            <h2 id="faq-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              How to keep the test honest
            </h2>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-[22px] bg-white/[0.025] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
                  <h3 className="font-semibold leading-6 text-white">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/[0.025] p-7 sm:p-9">
            <p className="eyebrow">From worksheet to evidence</p>
            <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                  See what a completed four-provider benchmark looks like
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-zinc-400">
                  Review the stored answers, citations, competitor mentions,
                  coverage, limitations, and prioritized actions before running
                  your own benchmark.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/ai-search-visibility-tool">See the AI visibility tool <ArrowRight aria-hidden="true" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/sample-report">View the sample report</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
