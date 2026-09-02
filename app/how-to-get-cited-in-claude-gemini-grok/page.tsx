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

const pageUrl = absoluteUrl("/how-to-get-cited-in-claude-gemini-grok");
const publishedAt = "2026-09-02T00:00:00.000Z";
const reviewedAt = "2026-09-02T00:00:00.000Z";

export const metadata: Metadata = {
  title: "How to Get Cited in Claude, Gemini, and Grok Answers",
  description:
    "How to get cited in Claude, Gemini, and Grok. Same frozen questions across four providers. No ranking formula. Measure, then rerun.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "How to Get Cited in Claude, Gemini, and Grok (Not Just ChatGPT)",
    description:
      "Crawlability, entity facts, corroboration, and honest cross-provider measurement—without inventing crawler shortcuts.",
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
    title: "How to Get Cited in Claude, Gemini, and Grok",
    description:
      "Five controllable inputs, mentions vs citations, and a measurement loop across four providers.",
    images: [SOCIAL_IMAGE],
  },
};

const inputs = [
  {
    number: "01",
    title: "Relevant third-party citations",
    summary:
      "Earn accurate mentions on sources buyers already trust: trade publications, specialist directories, associations, partners, and credible comparison pages that each engine can retrieve.",
  },
  {
    number: "02",
    title: "Useful structured data",
    summary:
      "Mark up the organization, product, service, location, and page purpose so machine-readable facts match the visible page across providers.",
  },
  {
    number: "03",
    title: "Real review presence",
    summary:
      "Maintain current profiles and authentic reviews on platforms relevant to the category or location. Never manufacture consensus.",
  },
  {
    number: "04",
    title: "Consistent entity information",
    summary:
      "Keep the same name, domain, category, location, pricing facts, and short description wherever the business appears.",
  },
  {
    number: "05",
    title: "Search crawlability",
    summary:
      "Let each provider's documented crawlers reach public pages. Check robots rules, CDN controls, bot protection, and rendering without confusing training access with search retrieval.",
  },
] as const;

const crawlerFacts = [
  {
    provider: "Claude / Anthropic",
    detail:
      "Anthropic documents ClaudeBot, Claude-User, and Claude-SearchBot in its Help Center (updated April 7, 2026). Claude-SearchBot is the retrieval-oriented crawler to verify for answer and search use cases.",
    source: "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
    sourceLabel: "Anthropic crawler documentation",
  },
  {
    provider: "Gemini / Google",
    detail:
      "Google-Extended is a product token for generative-AI training use on some Google products. It is not a crawler and is not a Google Search ranking lever. Verify access for Googlebot and other documented retrieval systems separately.",
    source: "https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers",
    sourceLabel: "Google common crawlers list (updated July 14, 2026)",
  },
  {
    provider: "Grok / xAI",
    detail:
      "Do not invent an unpublished Grok robots token. Treat Grok visibility as an outcome to measure on a frozen question set rather than as a shortcut controlled by a single documented crawler string.",
    source: absoluteUrl("/methodology"),
    sourceLabel: "100 Questions cross-provider methodology",
  },
] as const;

const faqs = [
  {
    question: "Is getting cited in Claude the same as getting cited in ChatGPT?",
    answer:
      "The controllable inputs overlap—crawlability, entity consistency, structured data, reviews, and third-party corroboration—but each provider retrieves, ranks, and cites sources differently. Measure each provider on the same frozen question set instead of assuming one ChatGPT win generalizes everywhere.",
  },
  {
    question: "What is the difference between a mention and a citation?",
    answer:
      "A mention is when the brand appears in the generated answer text. A citation is when the answer attributes a specific claim to a URL, often your domain or a third-party page. You can be mentioned without being cited, cited without being mentioned, or both. Fix the gap you actually have.",
  },
  {
    question: "Does blocking Google-Extended stop Gemini from citing my site?",
    answer:
      "No. Google-Extended is a product token, not a crawler, and it is not a Google Search ranking control. Blocking or allowing it is a separate decision from whether Google retrieval systems can access pages that Gemini-grounded answers may use.",
  },
  {
    question: "How should I measure progress across Claude, Gemini, and Grok?",
    answer:
      "Freeze buyer questions, run the identical set across the providers your buyers use, store answer and citation evidence, and rerun later under the same conditions. 100 Questions does this as a prepaid 25×4 benchmark; a spreadsheet or monitoring tool can work if you preserve conditions and evidence with equal discipline.",
  },
] as const;

const limitations = [
  "No provider publishes a guaranteed citation formula. Crawler access, entity clarity, and corroboration are useful inputs—not confirmed ranking levers.",
  "100 Questions measures API-grounded answers through a shared web-search harness. It does not claim parity with consumer chat interfaces.",
  "Do not invent unpublished crawler tokens or pricing for tools you have not verified on first-party pages.",
] as const;

export default function HowToGetCitedInClaudeGeminiGrokPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: "How to Get Cited in Claude, Gemini, and Grok Answers",
        description:
          "Five controllable inputs, provider-specific crawler facts, mentions vs citations, and an honest cross-provider measurement loop.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: publishedAt,
        dateModified: reviewedAt,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": EDITORIAL_AUTHOR_ID },
        reviewedBy: { "@id": EDITORIAL_AUTHOR_ID },
        publisher: { "@id": `${absoluteUrl()}#organization` },
        about: [
          "Claude citations",
          "Gemini citations",
          "Grok citations",
          "AI visibility measurement",
        ],
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
          {
            "@type": "ListItem",
            position: 2,
            name: "Claude, Gemini, and Grok citations",
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
                <span className="text-zinc-300">Claude, Gemini, and Grok citations</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                Practical AI visibility guide · reviewed September 2, 2026
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                How to get cited in Claude, Gemini, and Grok answers
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                ChatGPT is not the only answer engine your buyers use. The same
                public-signal work still matters—crawlability, entity facts,
                structured data, reviews, and corroboration—but you must measure
                each provider on the same frozen questions instead of assuming one
                surface generalizes everywhere.
              </p>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400">
                For ChatGPT-specific guidance, start with{" "}
                <Link
                  className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                  href="/how-to-get-chatgpt-to-recommend-your-business"
                >
                  how to get ChatGPT to recommend your business
                </Link>
                . This page extends that framework to Claude, Gemini, and Grok
                without duplicating the ChatGPT-only sections.
              </p>
              <ContentByline
                publishedAt={publishedAt}
                publishedLabel="September 2, 2026"
                modifiedAt={reviewedAt}
                modifiedLabel="September 2, 2026"
                note="Anthropic and Google crawler documentation reviewed"
              />
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">Mentions vs citations</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
                  Name inclusion and source attribution are different jobs
                </h2>
              </div>
              <div className="space-y-5 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  A <strong className="font-medium text-zinc-300">mention</strong>{" "}
                  means the brand appears in the answer text. A{" "}
                  <strong className="font-medium text-zinc-300">citation</strong>{" "}
                  means the answer attributes a claim to a URL—often your domain or
                  a third-party page about you.
                </p>
                <p>
                  Teams often optimize for mentions when the business problem is
                  missing owned citations, or chase citations when the real gap is
                  that the brand is absent from shortlists entirely. Separate the
                  metrics before prioritizing work.
                </p>
                <p>
                  See{" "}
                  <Link
                    className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                    href="/chatgpt-citations-vs-brand-mentions"
                  >
                    ChatGPT citations vs brand mentions
                  </Link>{" "}
                  for formulas and reporting patterns that apply across providers.
                </p>
              </div>
            </section>

            <section aria-labelledby="inputs-heading">
              <p className="eyebrow">Five inputs you can control</p>
              <h2
                id="inputs-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Build eligibility and evidence, not a magic ranking signal
              </h2>
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {inputs.map((input) => (
                  <section
                    key={input.number}
                    className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8"
                  >
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      Input {input.number}
                    </p>
                    <h3 className="mt-4 text-xl font-semibold text-white">
                      {input.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {input.summary}
                    </p>
                  </section>
                ))}
              </div>
            </section>

            <section aria-labelledby="crawlers-heading">
              <p className="eyebrow">Provider-specific crawl facts</p>
              <h2
                id="crawlers-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Verify documented access—do not invent shortcuts
              </h2>
              <div className="mt-8 space-y-6">
                {crawlerFacts.map((fact) => (
                  <section
                    key={fact.provider}
                    className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8"
                  >
                    <h3 className="text-xl font-semibold text-white">{fact.provider}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{fact.detail}</p>
                    <a
                      className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-emerald-300 hover:text-emerald-200"
                      href={fact.source}
                      target={
                        fact.source.startsWith("http") &&
                        !fact.source.startsWith(absoluteUrl())
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        fact.source.startsWith("http") &&
                        !fact.source.startsWith(absoluteUrl())
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      Verify source
                      <ExternalLink aria-hidden="true" className="size-4" />
                      <span className="sr-only"> at {fact.sourceLabel}</span>
                    </a>
                  </section>
                ))}
              </div>
            </section>

            <section aria-labelledby="measure-heading">
              <p className="eyebrow">Measurement loop</p>
              <h2
                id="measure-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Measure, then rerun the identical set
              </h2>
              <div className="mt-8 rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
                <ol className="list-decimal space-y-4 pl-5 text-sm leading-6 text-zinc-400">
                  <li>
                    Freeze neutral buyer questions and any brand-named diagnostics
                    you will reuse.
                  </li>
                  <li>
                    Run the same set across OpenAI, Claude, Gemini, and Grok under
                    documented conditions.
                  </li>
                  <li>
                    Store mentions, prominence, owned citations, competitor
                    presence, and failures—not just a composite score.
                  </li>
                  <li>
                    Implement the highest-confidence fixes: crawl access, entity
                    mismatches, missing corroboration, or weak answer pages.
                  </li>
                  <li>
                    Rerun the identical set later. Compare like for like; do not
                    swap questions mid-program.
                  </li>
                </ol>
                <p className="mt-6 text-sm leading-6 text-zinc-400">
                  100 Questions automates steps 1–3 as a prepaid 25×4 benchmark with
                  PDF and CSV exports. A disciplined spreadsheet workflow can work
                  if you preserve evidence with equal rigor.
                </p>
              </div>
            </section>

            <section aria-labelledby="limitations-heading">
              <p className="eyebrow">Interpretation limits</p>
              <h2
                id="limitations-heading"
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white"
              >
                What this guide does not claim
              </h2>
              <ul className="mt-6 list-disc space-y-3 pl-5 text-sm leading-6 text-zinc-400">
                {limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="citations-faq-heading">
              <p className="eyebrow">Questions teams ask</p>
              <h2
                id="citations-faq-heading"
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
            </section>

            <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
              <CheckCircle2 className="size-6" aria-hidden="true" />
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                    Measure all four providers
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    Run one frozen cross-provider benchmark for $9.
                  </h2>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-zinc-950 text-white hover:bg-zinc-800"
                >
                  <Link href="/auth/sign-up">
                    Start a benchmark <ArrowRight />
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        </article>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
