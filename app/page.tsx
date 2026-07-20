import {
  ArrowRight,
  Check,
  CircleGauge,
  Database,
  Globe2,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  return (
    <main className="min-h-screen overflow-hidden bg-[#070908] text-zinc-100">
      <header className="border-b border-white/[0.07]">
        <div className="page-shell flex h-16 items-center justify-between">
          <BrandMark />
          <nav className="flex items-center gap-1" aria-label="Primary navigation">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/sign-up">
                Start a benchmark <ArrowRight />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="page-shell grid gap-14 py-20 md:grid-cols-[1.12fr_0.88fr] md:items-center md:py-28">
        <div className="animate-enter">
          <Badge variant="outline" className="mb-7 border-emerald-300/25 text-emerald-200">
            Grounded AI visibility benchmark
          </Badge>
          <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
            See whether AI puts your brand in the answer.
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-zinc-400 sm:text-xl">
            Run 25 identical questions across OpenAI, Claude, Gemini, and Grok.
            Compare 100 grounded answers with sources and transparent, directional
            results—not a mystery score.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">
                Measure my brand <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#methodology">Read the methodology</Link>
            </Button>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-zinc-400">
            <LockKeyhole className="size-3.5" /> Private by default · 30-day answer retention
          </p>
        </div>

        <Card className="animate-enter relative overflow-hidden border border-white/[0.08] bg-[#0c0f0d] [animation-delay:120ms]">
          <figure className="relative aspect-[1.85/1] overflow-hidden border-b border-white/[0.07]">
            <Image
              src="/hero-ai-visibility.png"
              alt="Four streams of evidence converging into one measured AI visibility result"
              fill
              priority
              sizes="(min-width: 768px) 42vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(7,9,8,0.88)_100%)]" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-200">
                  Evidence in. Signal out.
                </p>
                <p className="mt-1 text-xs text-zinc-300">
                  25 shared questions. 100 grounded answers.
                </p>
              </div>
              <Badge variant="success" className="shrink-0">Live evidence</Badge>
            </figcaption>
          </figure>
          <CardHeader className="border-b border-white/[0.07] pb-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">Example benchmark</p>
                <CardTitle className="text-xl">Northstar analytics</CardTitle>
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
              Every headline metric keeps its numerator, denominator, and coverage visible.
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
              grounded answers a directional comparison.
            </p>
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
          <FeatureCard icon={<Database />} title="Evidence retained">
            Inspect normalized answers, source URLs, model versions, usage, and exclusion reasons.
          </FeatureCard>
          <FeatureCard icon={<Check />} title="Same frozen test">
            All four models receive the same 25 questions, locale, prompt version, and run timestamp.
          </FeatureCard>
        </div>
      </section>

      <section className="border-t border-white/[0.07]">
        <div className="page-shell flex flex-col gap-8 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Prepaid, not a subscription</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
              Buy one run. Keep the evidence.
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Stripe shows the live price before payment. Provider processing is disclosed before every run.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/auth/sign-up">
              Create an account <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

    </main>
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
