import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AiVisibilityLinkCluster } from "@/components/ai-visibility-link-cluster";
import { ContentByline } from "@/components/content-byline";
import { JsonLd } from "@/components/json-ld";
import { MarketingCheckoutButton } from "@/components/marketing-checkout-button";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EDITORIAL_AUTHOR_ID } from "@/lib/editorial";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const pageUrl = absoluteUrl(
  "/how-to-get-chatgpt-to-recommend-your-business",
);
const publishedAt = "2026-08-13T00:00:00.000Z";

export const metadata: Metadata = {
  title: "How to Get ChatGPT to Recommend Your Business",
  description:
    "A practical, evidence-conscious guide to the five inputs you can control: crawlability, entity consistency, structured data, reviews, and third-party citations.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "How to Get ChatGPT to Recommend Your Business",
    description:
      "Improve the public signals ChatGPT can retrieve and verify, then measure the result without assuming a guaranteed recommendation.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "article",
    locale: "en_US",
    publishedTime: publishedAt,
    modifiedTime: publishedAt,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Get ChatGPT to Recommend Your Business",
    description:
      "Five controllable inputs, an honest measurement loop, and no guaranteed-ranking claims.",
    images: [SOCIAL_IMAGE],
  },
};

const inputs = [
  {
    number: "01",
    title: "Relevant third-party citations",
    summary:
      "Earn accurate mentions on sources buyers already trust: trade publications, specialist directories, associations, partners, and credible comparison pages.",
  },
  {
    number: "02",
    title: "Useful structured data",
    summary:
      "Mark up the organization, product, service, location, and page purpose so machine-readable facts match the visible page.",
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
      "Let OAI-SearchBot reach public pages, and check that robots rules, the CDN, bot protection, and server rendering do not block retrieval.",
  },
] as const;

const faqs = [
  {
    question: "Can I guarantee that ChatGPT will recommend my business?",
    answer:
      "No. OpenAI says there is no way to guarantee top placement in ChatGPT Search. You can remove crawl barriers, publish clear evidence, keep entity facts consistent, earn relevant third-party corroboration, and measure whether mentions improve, but the final answer depends on the question, available sources, location, model behavior, and timing.",
  },
  {
    question: "How does ChatGPT find businesses to recommend?",
    answer:
      "When ChatGPT Search is used, OpenAI says it may rewrite the user's prompt into targeted searches and send them to third-party search providers. It then produces an answer with links to relevant web sources. OpenAI does not publish a business-recommendation formula, so citations, reviews, schema, and consistent facts should be treated as useful inputs rather than confirmed ranking factors.",
  },
  {
    question: "Does schema markup make ChatGPT recommend a company?",
    answer:
      "No. Valid structured data can make public facts easier to parse and reconcile, but it does not create authority and does not guarantee a mention. The markup should describe content that is visible on the page and agree with the company's other public profiles.",
  },
  {
    question: "What is the difference between the free checker and the $9 audit?",
    answer:
      "The free AI visibility checker tests technical readiness such as indexability, crawler access, metadata, schema, and sitemap discovery. The $9 audit asks one frozen 25-question set across four AI providers, stores eligible answers and citations, and turns the evidence into a prioritized action list.",
  },
] as const;

export default function ChatGptRecommendationGuidePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": pageUrl + "#article",
        headline: "How to Get ChatGPT to Recommend Your Business",
        description:
          "A practical guide to crawlability, entity consistency, structured data, reviews, third-party citations, and honest AI visibility measurement.",
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        datePublished: publishedAt,
        dateModified: publishedAt,
        image: absoluteUrl("/hero-ai-visibility.png"),
        author: { "@id": EDITORIAL_AUTHOR_ID },
        reviewedBy: { "@id": EDITORIAL_AUTHOR_ID },
        publisher: { "@id": absoluteUrl() + "#organization" },
        about: [
          "ChatGPT business recommendations",
          "AI visibility",
          "OAI-SearchBot",
          "generative engine optimization",
        ],
        inLanguage: "en-US",
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
            name: "How to get ChatGPT to recommend your business",
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
                <span className="text-zinc-300">ChatGPT recommendations</span>
              </nav>
              <Badge
                variant="outline"
                className="mt-8 border-emerald-300/25 text-emerald-200"
              >
                Practical AI visibility guide
              </Badge>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                How to get ChatGPT to recommend your business
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-zinc-400">
                You cannot force a recommendation. You can make your business
                easier to retrieve, identify, verify, and compare—then measure
                whether it appears more often for the questions buyers ask.
              </p>
              <ContentByline
                publishedAt={publishedAt}
                publishedLabel="August 13, 2026"
                note="Official OpenAI guidance reviewed"
              />
            </div>
          </header>

          <div className="page-shell space-y-20 py-16 sm:py-20 lg:py-24">
            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">The direct answer</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
                  Build eligibility and evidence, not a magic ranking signal
                </h2>
              </div>
              <div className="space-y-5 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  OpenAI says any public website can appear in ChatGPT Search,
                  but there is no way to guarantee top placement. Search can
                  rewrite a user&apos;s prompt into targeted queries, use
                  third-party search providers, and return an answer with links
                  to relevant web sources.
                </p>
                <p>
                  That makes two facts important. Your public pages must be
                  reachable, and the claims ChatGPT finds should be clear enough
                  to compare with other sources. The five inputs below are a
                  practical framework for that job. OpenAI has not confirmed
                  them as a recommendation-ranking formula.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <a
                      href="https://help.openai.com/en/articles/9237897-chatgpt-search"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      OpenAI: ChatGPT Search
                      <ExternalLink aria-hidden="true" />
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <a
                      href="https://help.openai.com/en/articles/12627856-publishers-and-developers-faq"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      OpenAI: publisher guidance
                      <ExternalLink aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              </div>
            </section>

            <section aria-labelledby="selection-process-heading">
              <p className="eyebrow">What happens before a mention</p>
              <h2
                id="selection-process-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                How ChatGPT can reach a business recommendation
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  [
                    "01",
                    "Interpret the request",
                    "The wording, category, constraints, and location shape which answer would be useful.",
                  ],
                  [
                    "02",
                    "Search for evidence",
                    "When Search is used, ChatGPT may translate the prompt into one or more targeted searches.",
                  ],
                  [
                    "03",
                    "Compare candidates",
                    "Public pages and third-party sources supply claims that can be reconciled or contradicted.",
                  ],
                  [
                    "04",
                    "Compose the answer",
                    "The model selects and explains options; a search-grounded answer can cite the sources it used.",
                  ],
                ].map(([number, title, description]) => (
                  <div
                    key={number}
                    className="rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <span className="font-mono text-xs text-emerald-300">
                      {number}
                    </span>
                    <h3 className="mt-4 font-semibold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-5 max-w-3xl text-xs leading-5 text-zinc-400">
                Steps 1, 2, and 4 are consistent with OpenAI&apos;s public
                description of ChatGPT Search. Step 3 is the practical
                publishing inference behind this guide, not a disclosed ranking
                stage.
              </p>
            </section>

            <section aria-labelledby="five-inputs-heading">
              <p className="eyebrow">The five controllable inputs</p>
              <h2
                id="five-inputs-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Give retrieval systems clearer, corroborated facts
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {inputs.map(({ number, title, summary }) => (
                  <div
                    key={number}
                    className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8"
                  >
                    <span className="font-mono text-xs text-emerald-300">
                      {number}
                    </span>
                    <h3 className="mt-4 text-xl font-semibold text-white">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {summary}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">1. Citations</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
                  Earn the right references, not the most links
                </h2>
              </div>
              <div className="space-y-4 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  Start with places that help a buyer validate the choice:
                  trade publications, local or specialist directories,
                  professional associations, implementation partners, and
                  editorial comparisons. The mention should state the same
                  category, audience, and offering your own site states.
                </p>
                <p>
                  A citation is useful when it adds independent, relevant
                  evidence. A pile of thin directory pages or reciprocal links
                  does not establish the same thing. Track which sources
                  ChatGPT actually cites instead of treating backlink count as
                  the outcome.
                </p>
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">2. Structured data</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
                  Make visible facts machine-readable
                </h2>
              </div>
              <div className="space-y-4 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  Use the most specific valid Schema.org types for the business
                  and page: Organization or LocalBusiness for the entity,
                  Product or Service for the offer, and Article or
                  BreadcrumbList where the visible content supports them. Add
                  review, rating, or FAQ markup only when the content and
                  platform eligibility requirements are genuinely met.
                </p>
                <p>
                  Keep names, URLs, prices, availability, and descriptions
                  consistent with the human-readable page. Structured data is a
                  clarity layer, not a hidden place to make claims and not a
                  guarantee that ChatGPT will mention the company. Review the{" "}
                  <a
                    className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                    href="https://schema.org/Organization"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    official Organization vocabulary
                  </a>{" "}
                  before publishing.
                </p>
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">3. Reviews</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
                  Build authentic review coverage where the category lives
                </h2>
              </div>
              <div className="space-y-4 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  Claim and maintain the review profiles buyers use for your
                  industry or location. Ask real customers for honest feedback,
                  respond to factual errors, and keep the profile&apos;s company
                  facts current.
                </p>
                <p>
                  Reviews are public corroboration, not a disclosed ChatGPT
                  ranking factor. Do not buy, fabricate, or selectively gate
                  them. A smaller set of attributable, current reviews is more
                  defensible than a suspicious burst of generic praise.
                </p>
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">4. Entity consistency</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
                  Resolve who you are before asking to be compared
                </h2>
              </div>
              <div className="space-y-4 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  Write one canonical fact sheet: company name, aliases,
                  domain, category, one-sentence description, market, service
                  area, price model, founding details, and official profiles.
                  Use it to reconcile your homepage, about page, profiles,
                  directories, and press boilerplate.
                </p>
                <p>
                  Prioritize contradictions that could change a recommendation:
                  the wrong audience, stale pricing, an old product name, an
                  incorrect location, or confusion with a similarly named
                  company. Consistency makes verification easier; it does not
                  require repeating identical marketing copy everywhere.
                </p>
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="eyebrow">5. Crawlability</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
                  Let OAI-SearchBot reach the pages that prove the claim
                </h2>
              </div>
              <div className="space-y-4 text-pretty text-base leading-7 text-zinc-400">
                <p>
                  OpenAI&apos;s publisher guidance says site content must not
                  block OAI-SearchBot if it is to be included in ChatGPT
                  summaries and snippets. Check robots.txt, but also test the
                  real response: a CDN, firewall, bot challenge, login wall, or
                  client-only render can block retrieval even when robots.txt
                  allows it.
                </p>
                <pre className="overflow-x-auto rounded-[20px] bg-black/30 p-5 text-sm leading-6 text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                  <code>{"User-agent: OAI-SearchBot\nAllow: /"}</code>
                </pre>
                <p className="text-sm leading-6">
                  You do not need this separate block if a broader rule already
                  allows the crawler. OAI-SearchBot controls search discovery;
                  GPTBot is a separate control for potential model training.
                  Confirm the current distinction in{" "}
                  <a
                    className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
                    href="https://help.openai.com/en/articles/12627856-publishers-and-developers-faq"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    OpenAI&apos;s publisher FAQ
                  </a>
                  .
                </p>
              </div>
            </section>

            <section aria-labelledby="measurement-heading">
              <p className="eyebrow">Measure the result</p>
              <h2
                id="measurement-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                Separate technical readiness from actual recommendations
              </h2>
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {[
                  {
                    title: "1. Run the free preflight",
                    text: "Use the AI visibility checker to catch access, metadata, schema, canonical, and sitemap problems. A pass means the page is technically ready—not that ChatGPT recommends it.",
                    href: "/ai-visibility-checker",
                    label: "Open the AI visibility checker",
                  },
                  {
                    title: "2. Freeze buyer questions",
                    text: "Write neutral questions that do not name the brand. Keep the exact wording, location, date, session conditions, answers, competitors, and citations so a rerun is comparable.",
                    href: "/chatgpt-brand-visibility-test",
                    label: "Use the free ChatGPT test",
                  },
                  {
                    title: "3. Benchmark the evidence",
                    text: "For a broader baseline, ask the same question set across multiple providers and inspect stored answers and sources before choosing which citations, pages, or facts to improve.",
                    href: "/ai-visibility-audit",
                    label: "See the audit method",
                  },
                ].map(({ title, text, href, label }) => (
                  <div
                    key={title}
                    className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8"
                  >
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {text}
                    </p>
                    <Button asChild variant="link" className="mt-4 px-0">
                      <Link href={href}>
                        {label} <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="recommendation-faq-heading">
              <p className="eyebrow">Common questions</p>
              <h2
                id="recommendation-faq-heading"
                className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
              >
                ChatGPT business recommendation FAQ
              </h2>
              <div className="mt-8 space-y-4">
                {faqs.map(({ question, answer }) => (
                  <details
                    key={question}
                    className="group rounded-[20px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  >
                    <summary className="cursor-pointer list-none text-balance font-semibold text-white [&::-webkit-details-marker]:hidden">
                      {question}
                    </summary>
                    <p className="mt-3 text-pretty text-sm leading-6 text-zinc-400">
                      {answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <AiVisibilityLinkCluster currentPath="/how-to-get-chatgpt-to-recommend-your-business" />

            <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
              <CheckCircle2 className="size-6" aria-hidden="true" />
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">
                    Establish the baseline
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">
                    See what four AI providers say before deciding what to fix.
                  </h2>
                </div>
                <MarketingCheckoutButton
                  label="Run the $9 audit"
                  variant="secondary"
                  size="lg"
                  buttonClassName="bg-zinc-950 text-white hover:bg-zinc-800"
                />
              </div>
            </section>
          </div>
        </article>
      </main>
      <JsonLd data={structuredData} />
    </div>
  );
}
