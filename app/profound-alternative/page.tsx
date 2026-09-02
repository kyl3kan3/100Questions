import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ContentByline } from "@/components/content-byline";
import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EDITORIAL_AUTHOR_ID } from "@/lib/editorial";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const pageUrl = absoluteUrl("/profound-alternative");
const publishedAt = "2026-09-02T00:00:00.000Z";
const reviewedAt = "2026-09-02T00:00:00.000Z";

const profoundBaseline = {
  does:
    "Profound describes itself as a full-stack marketing platform for answer engines: Prompt Volumes (what people ask AI), Answer Engine Insights (how a brand appears), Agents (autonomous content and AEO workers), and Agent Analytics (how sites are crawled by ChatGPT, Gemini, Claude, Perplexity, and more). Its pricing FAQ states that it runs structured prompts across AI platforms daily and tracks citations, sentiment, ranking, and competitive presence.",
  pricing:
    "Starter at $99/month and Growth at $399/month on Profound's pricing page as of September 2, 2026. Enterprise is custom. Starter is shown with ChatGPT, 50 unique prompts, and 1,500 responses monthly. Growth is shown with ChatGPT, Perplexity, and Google AI Overviews; 100 unique prompts; 9,000 responses monthly; and daily prompt frequency. Enterprise lists up to nine answer engines. Agent credits are 100/month on Starter and 400/month on Growth. SSO/SAML and SOC 2 are listed on Enterprise. An August 2, 2026 review recorded self-serve prices as billed yearly; confirm billing cadence on the live page before purchasing.",
  bestFor:
    "Larger marketing organizations that need visibility measurement, prompt intelligence, technical analytics, governance, and content operations in one platform.",
  tradeoff:
    "The broader operating platform and enterprise features can be more product—and more annual spend—than a small team needs for a straightforward measurement job. Self-serve Starter covers ChatGPT only. Claude, Gemini, and Grok appear on the Enterprise engine list, not on the Starter or Growth lists fetched on September 2, 2026.",
} as const;

export const metadata: Metadata = {
  title:
    "Profound Alternatives for Teams That Do Not Need an AEO Operating System",
  description:
    "Job-based Profound alternatives—prepaid audit, daily monitoring, or a cheaper AEO stack. Sourced prices, dated Sept 2, 2026. No ranking promises.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title:
      "Profound Alternatives for Teams That Do Not Need an AEO Operating System",
    description:
      "Four Profound alternatives by job: prepaid audit, daily monitor, prompt tracker, and action-oriented visibility—with cases where Profound remains the better fit.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "article",
    locale: "en_US",
    publishedTime: publishedAt,
    modifiedTime: reviewedAt,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Profound Alternatives (Honest 2026 Guide)",
    description:
      "Prepaid audit, daily monitoring, or a cheaper AEO stack—sourced prices dated September 2, 2026.",
    images: [SOCIAL_IMAGE],
  },
};

const alternatives = [
  {
    rank: 1,
    name: "100 Questions",
    verdict: "Best for prepaid, evidence-linked audits",
    does:
      "Runs one frozen 25-question benchmark across OpenAI, Claude, Gemini, and Grok. It stores answer and citation evidence, scores the run, recommends five prioritized actions, and exports a client-ready PDF and CSV.",
    pricing:
      "$9 for the first benchmark; then $15 for one credit, $39 for three, or $99 for ten. No subscription. Credits are valid for 12 months. Answer evidence is retained for 30 days.",
    bestFor:
      "Agencies, consultants, and in-house teams that need a baseline, a bounded deliverable, or a like-for-like before-and-after rerun.",
    tradeoff:
      "It is a point-in-time API-grounded benchmark, not daily consumer-interface monitoring. It does not track Perplexity or Google AI Overviews, provide alerts, or show continuous trend lines.",
    alternativeBetter:
      "Choose 100 Questions when a fixed project cost, inspectable evidence, and a report matter more than an always-on dashboard.",
    profoundBetter:
      "Choose Profound when you need consumer-interface collection, prompt-demand data, agent analytics, SSO, governance, integrated content agents, or enterprise AEO operations.",
    source: absoluteUrl("/methodology"),
    sourceLabel: "100 Questions methodology and pricing",
  },
  {
    rank: 2,
    name: "Otterly.AI",
    verdict: "Best focused daily-monitoring alternative",
    does:
      "Monitors configured prompts daily across ChatGPT, Google AI Overviews, Perplexity, and Microsoft Copilot. Google AI Mode, Gemini, and Claude are available as paid add-ons. Reports cover brand visibility, rankings, citations, and GEO audits.",
    pricing:
      "Lite $29/month for 15 prompts, Standard $189/month for 100 prompts, Premium $489/month for 400 prompts, and Enterprise from $1,000/month. Annual billing is 15% off. Add-ons as of September 2, 2026: AI Mode and Gemini at $9/$59/$149 by tier; Claude at $29/$109/$439; extra 100 prompts at $99/month.",
    bestFor:
      "Small and midsize teams that want a narrower recurring prompt monitor with unlimited team members and daily checks.",
    tradeoff:
      "Some engines are paid add-ons, and recurring monitoring does not create the same frozen, point-in-time test as a controlled benchmark.",
    alternativeBetter:
      "Choose Otterly when you want focused daily monitoring, a low prompt-count entry tier, or unlimited workspaces on Standard and Premium.",
    profoundBetter:
      "Choose Profound when you need prompt-volume research, agent analytics, content agents, broader enterprise engine coverage on self-serve tiers, or an integrated AEO operating stack.",
    source: "https://help.otterly.ai/pricing-of-otterlyai",
    sourceLabel: "Otterly.AI pricing documentation",
  },
  {
    rank: 3,
    name: "Peec AI",
    verdict: "Best dedicated prompt-tracking alternative",
    does:
      "Tracks configured prompts daily and reports brand visibility, position, sentiment, competitors, and cited sources across selectable AI models. Higher tiers add projects, countries, integrations, and enterprise controls.",
    pricing:
      "Published dollar amounts from peec.ai/ai-instructions on July 10, 2026: Starter $95/month for 50 prompts and three models, Pro $245/month for 150 prompts, Advanced $495/month for 350 prompts. Annual billing is discounted. On September 2, 2026, the public HTML pricing page did not display dollar amounts; confirm current prices on the live page before purchasing.",
    bestFor:
      "Marketing and SEO teams with an ongoing owner who will use daily trend data to guide content, reputation, and reporting decisions.",
    tradeoff:
      "It is a recurring monitoring system. A team that needs only an occasional baseline or client deliverable may pay for tracking cadence and dashboard features it will not use.",
    alternativeBetter:
      "Choose Peec AI when you want a dedicated AI-search analytics experience with flexible model selection, source analysis, multi-project brand plans, and reporting integrations.",
    profoundBetter:
      "Choose Profound when you need prompt-demand intelligence, agent analytics, autonomous content workers, SSO, or a broader enterprise AEO platform in one vendor.",
    source: "https://peec.ai/ai-instructions",
    sourceLabel: "Peec AI pricing instructions (July 10, 2026)",
  },
  {
    rank: 4,
    name: "AthenaHQ",
    verdict: "Best lower-cost action-oriented alternative",
    does:
      "Positions itself as an action-oriented AI visibility platform with prompt tracking, competitor analysis, and workflow features aimed at improving inclusion in AI answers.",
    pricing:
      "Essential is free with $25 in credits for 300 credits as of September 2, 2026. Starter is $295/month. API add-on prices are unpublished on the public pricing page.",
    bestFor:
      "Teams that want a mid-market visibility platform with workflow orientation between a simple monitor and a full enterprise AEO stack.",
    tradeoff:
      "Published self-serve pricing is higher than Otterly Lite or a prepaid 100 Questions audit. Enterprise tiers and API add-on pricing are not published on the public page reviewed here.",
    alternativeBetter:
      "Choose AthenaHQ when you want an action-oriented visibility platform with a free credit tier to test before committing to Starter.",
    profoundBetter:
      "Choose Profound when you need the broader Prompt Volumes dataset, agent analytics across major crawlers, enterprise governance, or integrated content agents at scale.",
    source: "https://www.athenahq.ai/pricing",
    sourceLabel: "AthenaHQ pricing",
  },
] as const;

const faqs = [
  {
    question: "What is the best Profound alternative?",
    answer:
      "The best Profound alternative depends on the job. 100 Questions is the best fit for a prepaid, evidence-linked audit; Otterly.AI for focused daily prompt monitoring; Peec AI for dedicated visibility tracking with flexible model coverage; and AthenaHQ for a lower-cost action-oriented platform. Profound remains the stronger fit when you need prompt-demand data, agent analytics, content agents, and enterprise AEO operations in one subscription.",
  },
  {
    question: "Is Profound worth $99 or $399 per month?",
    answer:
      "Profound can be worth that spend when a marketing organization needs daily structured prompts, multi-engine visibility, prompt-volume research, crawler analytics, and content operations together. It is harder to justify when the job is a one-time baseline, a client deliverable, or a bounded before-and-after test. Compare the engines you need on the self-serve tier you can afford before assuming Profound is the only credible option.",
  },
  {
    question: "Does 100 Questions replace Profound?",
    answer:
      "No. 100 Questions does not replace Profound for continuous monitoring, prompt-volume research, agent workflows, or enterprise AEO operations. It is ranked first on this page only for the specific prepaid, point-in-time audit job it is designed to do.",
  },
  {
    question: "How did Profound rank in the 2026 AI Visibility Index?",
    answer:
      "In the frozen July 30, 2026 AI Visibility Index, Profound appeared in five of 80 eligible discovery answers (6.25% discovery visibility). Peec AI led with six of 80 (7.5%). That index is a directional snapshot of one question set, not a permanent category ranking or a guarantee of future product performance.",
  },
] as const;

const limitations = [
  "Vendor features, engine coverage, and prices change. Dollar amounts on this page were reviewed from first-party product and pricing pages on September 2, 2026, except Peec AI dollar amounts which come from peec.ai/ai-instructions on July 10, 2026 because the September 2 HTML page did not display dollars.",
  "100 Questions measures API-grounded answers through a shared web-search harness. It does not claim parity with consumer chat interfaces, which can differ in prompts, personalization, routing, and search behavior.",
  "No tool in this comparison can guarantee future mentions, citations, recommendations, or rankings in AI answers.",
] as const;

export default function ProfoundAlternativePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline:
          "Profound Alternatives for Teams That Do Not Need an AEO Operating System",
        description:
          "Four Profound alternatives compared by function, price signal, best-fit user, and tradeoffs.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: publishedAt,
        dateModified: reviewedAt,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": EDITORIAL_AUTHOR_ID },
        reviewedBy: { "@id": EDITORIAL_AUTHOR_ID },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        about: ["Profound alternatives", "AI visibility tools", "AEO software"],
        inLanguage: "en-US",
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#alternatives`,
        name: "Best Profound alternatives",
        itemListElement: alternatives.map((alternative) => ({
          "@type": "ListItem",
          position: alternative.rank,
          name: alternative.name,
          url: alternative.source,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Profound alternatives",
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
        <article>
          <header className="border-b border-white/[0.07]">
            <div className="page-shell py-16 sm:py-20 lg:py-24">
              <nav className="text-xs text-zinc-400" aria-label="Breadcrumb">
                <Link className="hover:text-zinc-200" href="/">
                  Home
                </Link>{" "}
                <span aria-hidden="true">/</span>{" "}
                <span className="text-zinc-300">Profound alternatives</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                Honest comparison · reviewed September 2, 2026
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Profound alternatives for teams that do not need an AEO operating
                system
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                Profound is a full-stack answer-engine optimization platform. It
                is a strong fit when a marketing organization wants visibility
                measurement, prompt-demand data, crawler analytics, and content
                agents in one subscription. It is more product—and more spend—than
                many teams need for a baseline, a client deliverable, or a bounded
                before-and-after test.
              </p>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                <strong className="font-medium text-zinc-300">Disclosure:</strong>{" "}
                100 Questions publishes this page and is ranked first for the
                specific point-in-time audit job it is designed to do. That
                ranking is not a claim that it replaces Profound for continuous
                monitoring, prompt-volume research, agent workflows, or
                enterprise AEO operations.
              </p>
              <ContentByline
                publishedAt={publishedAt}
                publishedLabel="September 2, 2026"
                modifiedAt={reviewedAt}
                modifiedLabel="September 2, 2026"
                note="First-party documentation review of vendor pricing and product pages"
              />
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section aria-labelledby="profound-baseline-heading">
              <p className="eyebrow">The baseline</p>
              <h2
                id="profound-baseline-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                What Profound does well
              </h2>
              <div className="mt-8 grid gap-5 rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:grid-cols-2 sm:p-8">
                <Fact label="What it does" value={profoundBaseline.does} positive />
                <Fact label="Pricing signal" value={profoundBaseline.pricing} />
                <Fact label="Best-fit user" value={profoundBaseline.bestFor} />
                <Fact label="Main tradeoff" value={profoundBaseline.tradeoff} />
                <a
                  className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-emerald-300 hover:text-emerald-200 sm:col-span-2"
                  href="https://tryprofound.com/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Verify current Profound pricing
                  <ExternalLink aria-hidden="true" className="size-4" />
                </a>
              </div>
            </section>

            <section aria-labelledby="quick-answer-heading">
              <p className="eyebrow">Quick answer</p>
              <h2
                id="quick-answer-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Choose by the measurement job
              </h2>
              <div className="mt-8 overflow-x-auto rounded-[24px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <table className="min-w-[820px] text-left text-sm">
                  <thead className="bg-[#0b0e0c] text-zinc-200">
                    <tr>
                      <th className="p-5 font-semibold">Alternative</th>
                      <th className="p-5 font-semibold">Best for</th>
                      <th className="p-5 font-semibold">Pricing signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alternatives.map((alternative) => (
                      <tr
                        key={alternative.name}
                        className="border-t border-white/[0.07] bg-[#0b0e0c] align-top"
                      >
                        <th className="p-5 font-semibold text-white">
                          {alternative.rank}. {alternative.name}
                          <span className="mt-1 block font-normal text-emerald-300">
                            {alternative.verdict}
                          </span>
                        </th>
                        <td className="max-w-sm p-5 leading-6 text-zinc-300">
                          {alternative.bestFor}
                        </td>
                        <td className="max-w-sm p-5 leading-6 text-zinc-400">
                          {alternative.pricing}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="details-heading">
              <p className="eyebrow">Full comparison</p>
              <h2
                id="details-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                What each product does—and what you give up
              </h2>
              <div className="mt-8 space-y-6">
                {alternatives.map((alternative) => (
                  <section
                    key={alternative.name}
                    id={alternative.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}
                    className="scroll-mt-24 rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8"
                  >
                    <p className="eyebrow">
                      #{alternative.rank} · {alternative.verdict}
                    </p>
                    <h3 className="mt-4 text-balance text-2xl font-semibold text-white sm:text-3xl">
                      {alternative.name}
                    </h3>
                    <div className="mt-6 grid gap-5 lg:grid-cols-2">
                      <Fact label="What it does" value={alternative.does} />
                      <Fact label="Pricing signal" value={alternative.pricing} />
                      <Fact label="Best-fit user" value={alternative.bestFor} />
                      <Fact label="Main tradeoff" value={alternative.tradeoff} />
                      <Fact
                        label={`When ${alternative.name} is better`}
                        value={alternative.alternativeBetter}
                        positive
                      />
                      <Fact
                        label="When Profound is better"
                        value={alternative.profoundBetter}
                      />
                    </div>
                    <a
                      className="mt-6 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-emerald-300 hover:text-emerald-200"
                      href={alternative.source}
                      target={
                        alternative.source.startsWith("http") &&
                        !alternative.source.startsWith(absoluteUrl())
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        alternative.source.startsWith("http") &&
                        !alternative.source.startsWith(absoluteUrl())
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      Verify current details
                      <ExternalLink aria-hidden="true" className="size-4" />
                      <span className="sr-only">
                        {" "}
                        at {alternative.sourceLabel}
                      </span>
                    </a>
                  </section>
                ))}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2" aria-labelledby="profound-fit-heading">
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                <p className="eyebrow">Profound is still better when</p>
                <h2 id="profound-fit-heading" className="mt-4 text-2xl font-semibold text-white">
                  You need an AEO operating system
                </h2>
                <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-zinc-400">
                  <li>You want prompt-demand data and structured daily prompts across engines.</li>
                  <li>You need agent analytics for how AI crawlers access your site.</li>
                  <li>Content agents and integrated AEO workflows are part of the operating model.</li>
                  <li>Enterprise governance, SSO/SAML, and SOC 2 are requirements.</li>
                </ul>
              </div>
              <div className="rounded-[24px] bg-[#0b0e0c] p-6 sm:p-8">
                <p className="eyebrow">An alternative is better when</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  Your constraint points elsewhere
                </h2>
                <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-zinc-400">
                  <li>You need one report, not another subscription: 100 Questions.</li>
                  <li>You want a focused daily monitor with a low entry tier: Otterly.AI.</li>
                  <li>You want dedicated visibility tracking with flexible models: Peec AI.</li>
                  <li>You want a mid-market action platform with a free credit tier: AthenaHQ.</li>
                </ul>
              </div>
            </section>

            <section aria-labelledby="limitations-heading">
              <p className="eyebrow">Interpretation limits</p>
              <h2
                id="limitations-heading"
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                What this comparison does not claim
              </h2>
              <ul className="mt-6 list-disc space-y-3 pl-5 text-sm leading-6 text-zinc-400">
                {limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                For independent context, see the{" "}
                <Link
                  className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                  href="/ai-visibility-index"
                >
                  2026 AI Visibility Index
                </Link>
                , collected July 30, 2026. Peec AI appeared in 6 of 80 eligible
                discovery answers (7.5% discovery visibility). Profound appeared
                in 5 of 80 (6.25%). That snapshot does not predict which product
                will perform best for your brand.
              </p>
            </section>

            <section aria-labelledby="profound-faq-heading">
              <p className="eyebrow">Questions buyers ask</p>
              <h2
                id="profound-faq-heading"
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                Frequently asked questions
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {faqs.map(({ question, answer }) => (
                  <section
                    key={question}
                    className="rounded-[20px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <h3 className="text-balance font-semibold text-white">{question}</h3>
                    <p className="mt-3 text-pretty text-sm leading-6 text-zinc-400">
                      {answer}
                    </p>
                  </section>
                ))}
              </div>
              <p className="mt-6 max-w-3xl text-sm leading-6 text-zinc-400">
                Compare wider pricing in{" "}
                <Link
                  className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                  href="/ai-visibility-tools-pricing"
                >
                  what AI visibility tools cost in 2026
                </Link>{" "}
                or review{" "}
                <Link
                  className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                  href="/peec-ai-alternative"
                >
                  Peec AI alternatives
                </Link>
                .
              </p>
            </section>

            <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
              <CheckCircle2 className="size-6" aria-hidden="true" />
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                    Need a point-in-time baseline?
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    Run one complete, evidence-linked audit for $9.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-800">
                    See a finished example on the{" "}
                    <Link
                      className="font-medium underline underline-offset-4"
                      href="/sample-report"
                    >
                      sample report
                    </Link>{" "}
                    page before you buy.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    variant="secondary"
                    size="lg"
                    className="bg-zinc-950 text-white hover:bg-zinc-800"
                  >
                    <Link href="/pricing">
                      View pricing <ArrowRight />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-zinc-950/20 bg-transparent text-zinc-950 hover:bg-zinc-950/10"
                  >
                    <Link href="/auth/sign-up">
                      Start a benchmark <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </article>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}

function Fact({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.025] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
      <p className={positive ? "eyebrow text-emerald-300" : "eyebrow"}>{label}</p>
      <p className="mt-3 text-pretty text-sm leading-6 text-zinc-300">{value}</p>
    </div>
  );
}
