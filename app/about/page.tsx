import {
  ArrowRight,
  BadgeCheck,
  Eye,
  LockKeyhole,
  Scale,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FeaturedOnSection } from "@/components/featured-on-section";
import { JsonLd } from "@/components/json-ld";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VERIFIED_BRAND_PROFILES } from "@/lib/product-facts";
import {
  absoluteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SOCIAL_IMAGE,
} from "@/lib/site";

const pageUrl = absoluteUrl("/about");
const aboutUpdatedAt = "2026-08-10T00:00:00.000Z";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why 100 Questions exists, what its AI visibility benchmark measures, and the evidence, privacy, and interpretation principles behind each report.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "About 100 Questions",
    description: SITE_DESCRIPTION,
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "About 100 Questions",
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
};

const principles = [
  {
    icon: Eye,
    title: "Evidence before conclusions",
    description:
      "Reports retain normalized answers and source URLs so metrics and recommendations can be reviewed against the underlying evidence.",
  },
  {
    icon: Scale,
    title: "Comparable tests",
    description:
      "Each provider receives the same frozen question set. Failed or ungrounded answers remain visible in coverage instead of silently changing a score.",
  },
  {
    icon: BadgeCheck,
    title: "Limits in plain sight",
    description:
      "A benchmark is a time-stamped directional snapshot, not proof of causation, factual accuracy, or parity with consumer chat products.",
  },
  {
    icon: LockKeyhole,
    title: "Private by default",
    description:
      "Runs belong to the authenticated account owner. The default answer-retention window is 30 days, and reports are not public profile pages.",
  },
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: "About 100 Questions",
      description:
        "The purpose, measurement principles, privacy posture, and interpretation limits behind the 100 Questions AI visibility benchmark.",
      isPartOf: { "@id": `${absoluteUrl()}#website` },
      about: [
        { "@id": `${absoluteUrl()}#organization` },
        { "@id": `${absoluteUrl()}#product` },
      ],
      dateModified: aboutUpdatedAt,
      mentions: VERIFIED_BRAND_PROFILES.map(({ name, url }) => ({
        "@type": "WebPage",
        name,
        url,
      })),
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
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
          name: "About",
          item: pageUrl,
        },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <main className="min-h-screen bg-[#070908] text-zinc-100">
        <MarketingHeader />

        <section className="page-shell py-20 md:py-28">
          <div className="max-w-3xl animate-enter">
            <Badge
              variant="outline"
              className="mb-7 border-emerald-300/25 text-emerald-200"
            >
              About 100 Questions
            </Badge>
            <h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl">
              A clearer way to measure whether AI finds your brand.
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-zinc-400">
              100 Questions turns a vague concern—“do AI systems recommend
              us?”—into a reviewable benchmark with frozen questions,
              web-grounded answers, source evidence, and explicit limits.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/sample-report">
                  Review a sample report <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/methodology">Read the methodology</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.07] bg-white/[0.018]">
          <div className="page-shell grid gap-12 py-16 md:grid-cols-2 md:py-20">
            <div>
              <p className="eyebrow">Why it exists</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                AI visibility should be inspectable, not mystical.
              </h2>
            </div>
            <div className="space-y-5 text-pretty text-base leading-7 text-zinc-400">
              <p>
                AI answer systems can mention a brand, omit it, cite its
                website, or favor a competitor. A single unexplained score
                cannot show which of those events occurred or whether the
                underlying provider calls were usable.
              </p>
              <p>
                The benchmark keeps visibility, prominence, selected-competitor
                share of voice, claimed-domain citations, and provider coverage
                separate. Reports link those measures back to the buyer
                questions, answers, and sources that produced them.
              </p>
            </div>
          </div>
        </section>

        <section className="page-shell py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow">Measurement principles</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Trust comes from showing the work.
            </h2>
            <p className="mt-5 text-pretty text-base leading-7 text-zinc-400">
              These principles shape the product, the public methodology, and
              the way every result is described.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {principles.map(({ icon: Icon, title, description }) => (
              <Card className="bg-[#0b0e0c]" key={title}>
                <CardContent className="p-6 sm:p-7">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(110,231,183,0.12)]">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                  <h3 className="mt-5 text-balance font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-6 text-zinc-400">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-white/[0.07] bg-white/[0.018]">
          <div className="page-shell grid gap-10 py-16 md:grid-cols-[0.75fr_1.25fr] md:py-20">
            <div>
              <p className="eyebrow">Editorial accountability</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                Every guide has a visible owner and review date.
              </h2>
            </div>
            <div className="space-y-5 text-pretty text-base leading-7 text-zinc-400">
              <p>
                The 100 Questions editorial team publishes and reviews the
                guides, templates, comparisons, and research on this site.
                Comparisons identify their evidence boundary and link to the
                first-party documentation used for claims about other products.
              </p>
              <p>
                Corrections should be sent through the <Link className="text-emerald-300 hover:text-emerald-200" href="/contact">contact page</Link>.
                Measurement definitions and known limits remain available in
                the <Link className="text-emerald-300 hover:text-emerald-200" href="/methodology">public methodology</Link>.
              </p>
            </div>
          </div>
        </section>

        <FeaturedOnSection />

        <section className="border-t border-white/[0.07]">
          <div className="page-shell py-20 md:py-24">
            <div className="grid gap-10 rounded-[28px] bg-emerald-300/[0.025] p-7 shadow-[inset_0_0_0_1px_rgba(110,231,183,0.15)] sm:p-9 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="eyebrow">What it is—and is not</p>
                <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                  Directional evidence for better decisions.
                </h2>
              </div>
              <dl className="grid gap-5 text-sm sm:grid-cols-2">
                <Fact
                  term="The benchmark is"
                  detail="A frozen, source-backed comparison across four model providers."
                />
                <Fact
                  term="The benchmark is not"
                  detail="A guarantee of future mentions or a ranking factor sold as certainty."
                />
                <Fact
                  term="Reports include"
                  detail="Coverage, citations, competitor evidence, retained answers, and prioritized actions."
                />
                <Fact
                  term="Reports do not claim"
                  detail="Statistical representativeness, model causation, or consumer-chat parity."
                />
              </dl>
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.07]">
          <div className="page-shell flex flex-col gap-7 py-16 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Verify the details</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.035em] text-white">
                Read the definitions before trusting the score.
              </h2>
              <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-zinc-400">
                The methodology documents question construction, grounding
                eligibility, denominators, coverage rules, retention, and known
                limitations.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/methodology">
                Open the methodology <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <JsonLd data={structuredData} />
    </>
  );
}

function Fact({ term, detail }: { term: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
      <dt className="font-medium text-zinc-200">{term}</dt>
      <dd className="mt-2 text-pretty leading-6 text-zinc-400">{detail}</dd>
    </div>
  );
}
