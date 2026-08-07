import {
  Check,
  CircleGauge,
  Database,
  Globe2,
  LockKeyhole,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { JsonLd } from "@/components/json-ld";
import { MarketingCheckoutButton } from "@/components/marketing-checkout-button";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatPackagePrice,
  getPublicBillingPackages,
} from "@/lib/billing/packages";
import { buildHomeStructuredData } from "@/lib/home-structured-data";
import {
  PRODUCT_BEST_FITS,
  PRODUCT_FAQS,
  PRODUCT_FEATURES,
  PRODUCT_LIMITATIONS,
} from "@/lib/product-facts";
import {
  absoluteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SOCIAL_IMAGE,
} from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  other: {
    "directree-verify":
      "directree-verify=b3246ee4e6e1b1ca893315f9b6ca5310",
    "stackscope-claim": "ee5e56jq",
  },
  keywords: [
    "AI visibility tool",
    "AI search visibility",
    "AI brand visibility",
    "LLM visibility tool",
    "AI search monitoring",
    "AI citation tracking",
    "AI share of voice",
  ],
  alternates: { canonical: absoluteUrl() },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: absoluteUrl(),
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
};

const providerRows = [
  ["OpenAI", "GPT-5.4 mini", "Native web search"],
  ["Claude", "Claude Sonnet 4.6", "Native web search"],
  ["Gemini", "Gemini 3.1 Flash Lite", "Google Search"],
  ["Grok", "Grok 4.5", "Native web search"],
] as const;

const scoreCards = [
  ["Visibility", "How often your brand appears in neutral discovery answers."],
  ["Prominence", "Whether you lead the answer, make a shortlist, or appear incidentally."],
  ["Share of voice", "Your answer-level mentions compared with selected competitors."],
  ["Citations", "How often eligible answers cite your claimed domain."],
] as const;

export default function Home() {
  const structuredData = buildHomeStructuredData();

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-[#070908] text-zinc-100">
      <MarketingHeader />

      <section className="page-shell grid gap-14 py-20 md:grid-cols-[1.12fr_0.88fr] md:items-center md:py-28">
        <div className="animate-enter">
          <Badge variant="outline" className="mb-7 border-emerald-300/25 text-emerald-200">
            AI visibility audit · Four web-grounded models
          </Badge>
          <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
            Find where AI models overlook your brand—and what to fix next.
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-zinc-400 sm:text-xl">
            A $9 AI visibility audit across OpenAI, Claude, Gemini, and Grok:
            missed buyer questions, competitors shown instead, sources models
            trust, and five evidence-backed actions—no subscription.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <MarketingCheckoutButton />
            <Button asChild size="lg" variant="outline">
              <Link href="/sample-report">View a sample report</Link>
            </Button>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-zinc-400">
            <LockKeyhole className="size-3.5" /> Private by default · 30-day answer retention
          </p>
        </div>

        <Card className="animate-enter relative overflow-hidden border border-white/[0.08] bg-[#0c0f0d] [animation-delay:120ms]">
          <figure className="relative aspect-[1.85/1] overflow-hidden border-b border-white/[0.07]">
            <Image
              src="/sample-report-preview.png"
              alt="Sample report showing visibility, missed questions, competitors, sources, and recommended actions"
              fill
              priority
              unoptimized
              sizes="(min-width: 768px) 42vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(7,9,8,0.88)_100%)]" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-200">
                  A real deliverable, before you buy
                </p>
                <p className="mt-1 text-xs text-zinc-300">
                  Metrics, missed questions, sources, and five next actions.
                </p>
              </div>
              <Badge variant="success" className="shrink-0">Live evidence</Badge>
            </figcaption>
          </figure>
          <CardHeader className="border-b border-white/[0.07] pb-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">Example benchmark</p>
                <CardTitle as="h2" className="text-xl">
                  Northstar analytics
                </CardTitle>
              </div>
              <Badge variant="success">Complete</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <MetricPreview label="Discovery visibility" value="38%" detail="91% coverage" />
              <MetricPreview label="Owned citations" value="24%" detail="73 eligible" />
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between text-xs text-zinc-400">
                <span>Model visibility</span>
                <span className="font-mono tabular-nums">0–100%</span>
              </div>
              <div className="space-y-3">
                <ProviderBar label="OpenAI" width="46%" value="46%" />
                <ProviderBar label="Claude" width="34%" value="34%" />
                <ProviderBar label="Gemini" width="31%" value="31%" />
                <ProviderBar label="Grok" width="39%" value="39%" />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3.5 py-3 text-xs leading-5 text-zinc-400 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              <CircleGauge className="size-4 shrink-0 text-emerald-300" />
              Every metric and recommendation links back to stored evidence.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y border-white/[0.07] bg-white/[0.018]">
        <div className="page-shell grid divide-y divide-white/[0.07] md:grid-cols-4 md:divide-x md:divide-y-0">
          {providerRows.map(([provider, model, grounding]) => (
            <div key={provider} className="px-1 py-7 md:px-7 first:md:pl-0 last:md:pr-0">
              <p className="text-sm font-semibold text-zinc-100">{provider}</p>
              <p className="mt-1 text-xs text-zinc-400">{model} · {grounding}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell py-20 md:py-24">
        <div className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/[0.025] p-7 sm:p-9">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div>
              <p className="eyebrow">Know what you receive</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">A client-ready audit, not another monitoring dashboard.</h2>
              <Button asChild variant="link" className="mt-4"><Link href="/sample-report">Open the complete sample report</Link></Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PRODUCT_FEATURES.map((item) => (
                <p key={item} className="flex items-center gap-3 rounded-xl bg-black/20 px-4 py-3 text-sm text-zinc-200"><Check className="size-4 shrink-0 text-emerald-300" />{item}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="methodology" className="page-shell py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="eyebrow">The benchmark</p>
            <h2 className="mt-4 max-w-md text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              A defensible answer to “are we visible?”
            </h2>
            <p className="mt-5 max-w-md text-pretty text-base leading-7 text-zinc-400">
              The shared test uses 20 neutral discovery questions that avoid planting
              your name in the prompt, plus 5 diagnostic questions that ask directly.
              Each model receives the identical 25-question set, making the 100
              planned provider answers a directional comparison.
            </p>
            <Button asChild variant="link" className="mt-5">
              <Link href="/methodology">See definitions, eligibility, and limitations</Link>
            </Button>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[24px] bg-white/[0.08] sm:grid-cols-2">
            {scoreCards.map(([title, description], index) => (
              <article key={title} className="bg-[#0b0e0c] p-6 sm:p-7">
                <span className="font-mono text-xs tabular-nums text-emerald-300">
                  0{index + 1}
                </span>
                <h3 className="mt-5 font-semibold text-zinc-100">{title}</h3>
                <p className="mt-2 text-pretty text-sm leading-6 text-zinc-400">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell pb-20 md:pb-28">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard icon={<Globe2 />} title="Grounding required">
            A response without valid web sources is excluded from scoring and remains visible in coverage.
          </FeatureCard>
          <FeatureCard icon={<Database />} title="Evidence becomes action">
            See the buyer questions you missed, who appeared instead, which sources recur, and what page or third-party mention is likely needed.
          </FeatureCard>
          <FeatureCard icon={<Check />} title="Same frozen test">
            All four models receive the same 25 questions, locale, and prompt
            version; the run freezes its timestamp with the results.
          </FeatureCard>
        </div>
      </section>

      <section className="border-t border-white/[0.07]">
        <div className="page-shell py-20 md:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">Choose the right measurement model</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Best for a controlled benchmark—not an always-on dashboard.
            </h2>
            <p className="mt-5 text-pretty leading-7 text-zinc-400">
              100 Questions trades monitoring frequency for a frozen test,
              inspectable evidence, and a bounded project cost. That makes it a
              strong fit for specific decisions, but not every AI visibility job.
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <DecisionCard title="Use 100 Questions for" items={PRODUCT_BEST_FITS} />
            <DecisionCard
              title="Choose continuous monitoring when"
              items={PRODUCT_LIMITATIONS}
            />
          </div>
          <Button asChild variant="link" className="mt-5">
            <Link href="/ai-seo-tools">Compare monitoring, suites, and fixed benchmarks</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-white/[0.07]">
        <div className="page-shell py-16 md:py-20">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[24px] bg-[#0a0d0b] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
              <p className="eyebrow">Guide</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                What AI visibility means—and how to measure it
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Learn the difference between mentions, prominence, competitor
                share of voice, citations, and coverage in AI-generated answers.
              </p>
              <Button asChild variant="link" className="mt-4">
                <Link href="/ai-visibility">Read the AI visibility guide</Link>
              </Button>
            </article>
            <article className="rounded-[24px] bg-[#0a0d0b] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
              <p className="eyebrow">Practical framework</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                Generative engine optimization without the hype
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Build clearer entity signals, useful source material, and a
                repeatable measurement loop for AI search visibility.
              </p>
              <Button asChild variant="link" className="mt-4">
                <Link href="/generative-engine-optimization">Read the GEO guide</Link>
              </Button>
            </article>
            <article className="rounded-[24px] bg-[#0a0d0b] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
              <p className="eyebrow">Guide</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                Answer engine optimization, explained
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                How AEO differs from SEO and GEO, the practices that earn
                citations, and how to tell whether any of it worked.
              </p>
              <Button asChild variant="link" className="mt-4">
                <Link href="/answer-engine-optimization">Read the AEO guide</Link>
              </Button>
            </article>
            <article className="rounded-[24px] bg-[#0a0d0b] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
              <p className="eyebrow">Checklist</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                Check technical AI readiness today
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Run a free instant check for indexability, AI crawler access,
                schema, page signals, sitemaps, and llms.txt.
              </p>
              <Button asChild variant="link" className="mt-4">
                <Link href="/ai-visibility-checker">Run the free checker</Link>
              </Button>
            </article>
            <article className="rounded-[24px] bg-[#0a0d0b] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
              <p className="eyebrow">Commercial guide</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                Choose a ChatGPT SEO tool
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Compare manual spot checks, continuous monitoring, and frozen
                evidence-linked benchmarks for ChatGPT visibility.
              </p>
              <Button asChild variant="link" className="mt-4">
                <Link href="/chatgpt-seo-tool">
                  Explore the ChatGPT SEO tool
                </Link>
              </Button>
            </article>
            <article className="rounded-[24px] bg-[#0a0d0b] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
              <p className="eyebrow">Comparison</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                Compare answer engine optimization tools
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Six AEO platforms compared by monitoring model, evidence,
                cadence, workflow, and the tradeoffs to verify.
              </p>
              <Button asChild variant="link" className="mt-4">
                <Link href="/answer-engine-optimization-tools">
                  Compare AEO tools
                </Link>
              </Button>
            </article>
            <article className="rounded-[24px] bg-[#0a0d0b] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
              <p className="eyebrow">Workflow</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                AI search optimization, step by step
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Connect technical access, entity clarity, answer-ready content,
                evidence, distribution, and repeatable measurement.
              </p>
              <Button asChild variant="link" className="mt-4">
                <Link href="/ai-search-optimization">Read the practical guide</Link>
              </Button>
            </article>
            <article className="rounded-[24px] bg-[#0a0d0b] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
              <p className="eyebrow">Comparison</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                Choose the right AI SEO tool
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Compare monitoring, large-scale research, enterprise suites, and
                fixed evidence-linked benchmarks by the job each one does.
              </p>
              <Button asChild variant="link" className="mt-4">
                <Link href="/ai-seo-tools">Compare AI SEO tools</Link>
              </Button>
            </article>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.07]">
        <div className="page-shell py-20 md:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">Product questions</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Clear answers before you buy.
            </h2>
          </div>
          <div className="mt-10 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {PRODUCT_FAQS.map(({ id, question, answer }) => (
              <article key={id} id={id} className="scroll-mt-8 py-7 sm:py-8">
                <h3 className="text-balance text-xl font-semibold tracking-[-0.02em] text-zinc-100 sm:text-2xl">
                  {question}
                </h3>
                <p className="mt-4 max-w-3xl text-pretty leading-7 text-zinc-400">
                  {answer}
                </p>
              </article>
            ))}
          </div>
          <Button asChild variant="link" className="mt-5">
            <Link href="/faq">Read every product and methodology question</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-white/[0.07]">
        <div id="pricing" className="page-shell scroll-mt-8 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Simple, prepaid pricing</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              One credit. One complete benchmark.
            </h2>
            <p className="mt-4 text-pretty text-sm leading-6 text-zinc-400">
              No subscription, seat fees, or provider add-ons. Every run includes the audit, evidence, prioritized action plan, and exports.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
            {getPublicBillingPackages(false).map((billingPackage) => (
              <Card
                key={billingPackage.id}
                className={billingPackage.id === "three" ? "border border-emerald-300/25 bg-emerald-300/[0.035]" : "bg-[#0a0d0b]"}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>{billingPackage.name}</CardTitle>
                    {billingPackage.id === "three" ? <Badge variant="success">Best value</Badge> : null}
                  </div>
                  <p className="pt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
                    {formatPackagePrice(billingPackage.priceCents)}
                  </p>
                  <CardDescription>{billingPackage.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="size-4 text-emerald-300" />
                    {billingPackage.credits} complete benchmark{billingPackage.credits === 1 ? "" : "s"}
                  </p>
                  {billingPackage.id === "intro" ? (
                    <MarketingCheckoutButton
                      className="mt-6"
                      label="Buy first benchmark — $9"
                      size="default"
                      variant="secondary"
                    />
                  ) : (
                    <Button asChild className="mt-6 w-full" variant={billingPackage.id === "three" ? "default" : "secondary"}>
                      <Link href="/auth/sign-up">Choose package</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-zinc-400">
            Introductory price is limited to the first purchase. Credits are valid for 12 months. Normal single-benchmark price after the introductory purchase is $15. Taxes may apply.
          </p>
        </div>
      </section>

      <section className="border-t border-white/[0.07]">
        <div className="page-shell flex flex-col gap-8 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Prepaid, not a subscription</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
              Buy one run. Review 30 days of evidence.
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Packages start at $9. Stripe confirms the price and applicable taxes before payment.
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Need details first?{" "}
              <Link className="text-emerald-300 underline underline-offset-4 decoration-emerald-300/40 hover:text-emerald-200 hover:decoration-emerald-200" href="/faq">
                Read the FAQ
              </Link>
              .
            </p>
          </div>
          <MarketingCheckoutButton />
        </div>
      </section>
      </main>
      <JsonLd data={structuredData} />
    </>
  );
}

function MetricPreview({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white tabular-nums">
        {value}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
        {detail}
      </p>
    </div>
  );
}

function DecisionCard({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <article className="rounded-[24px] bg-[#0a0d0b] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-zinc-300">
            <Check className="mt-1 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ProviderBar({ label, width, value }: { label: string; width: string; value: string }) {
  return (
    <div className="grid grid-cols-[5rem_1fr_2.5rem] items-center gap-3 text-xs">
      <span className="text-zinc-400">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-emerald-300" style={{ width }} />
      </div>
      <span className="text-right font-mono text-zinc-400 tabular-nums">{value}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-[#0a0d0b]">
      <CardHeader>
        <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300 [&>svg]:size-4">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{children}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0" />
    </Card>
  );
}
