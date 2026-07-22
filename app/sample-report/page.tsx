import { ArrowRight, CheckCircle2, ExternalLink, FileText, Target, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AnalyticsEvent } from "@/components/analytics-event";
import { MarketingHeader } from "@/components/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { absoluteUrl, SOCIAL_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sample AI Visibility Audit",
  description: "See a complete fictional 100 Questions report with visibility metrics, missed questions, competitor evidence, citations, and prioritized actions.",
  alternates: { canonical: absoluteUrl("/sample-report") },
  openGraph: { title: "Sample AI Visibility Audit | 100 Questions", description: "A complete example of the evidence and action plan included with every benchmark.", url: absoluteUrl("/sample-report"), images: [SOCIAL_IMAGE] },
};

const actions = [
  ["Publish a warehouse-native analytics comparison", "Content gap", "Northstar was absent from 9 of 14 eligible answers about warehouse-native analytics, while Luminary appeared in 7.", "Create an owned comparison page covering deployment model, supported warehouses, migration effort, limitations, and verifiable customer evidence."],
  ["Earn inclusion in two repeatedly cited buyer guides", "Authority source", "Analytics Weekly and Modern Data Stack were cited across six missed answers.", "Pitch a factual product profile or hands-on review to those publishers, with documentation and customer proof they can independently verify."],
  ["Strengthen the implementation page", "Citation gap", "Models mentioned Northstar in four implementation answers but cited third-party summaries instead of northstar.example.", "Add prerequisites, setup steps, time-to-value ranges, architecture diagrams, and dated documentation on the owned implementation page."],
  ["Answer privacy and data-residency questions directly", "Missed question", "Northstar did not appear in three grounded answers about privacy-first analytics for regulated teams.", "Publish a plain-language security and data-residency page with regions, retention controls, subprocessors, certifications, and review dates."],
  ["Clarify the best-fit customer profile", "Mention quality", "Five mentions were incidental rather than shortlist or primary recommendations.", "Add concrete best-fit and not-a-fit sections to the homepage and relevant use-case pages, supported by specific workflows and outcomes."],
] as const;

const missed = [
  ["Which product analytics tools work directly on a data warehouse?", "Luminary, MetricFlow", "Analytics Weekly"],
  ["What are the best privacy-first analytics platforms for healthcare SaaS?", "Beacon, MetricFlow", "Modern Data Stack"],
  ["Which analytics platform is easiest to implement for a small data team?", "Luminary", "SaaS Ops Review"],
] as const;

export default function SampleReportPage() {
  return (
    <main className="min-h-screen bg-[#070908] text-zinc-100">
      <AnalyticsEvent event="sample_report_viewed" />
      <MarketingHeader />
      <div className="page-shell py-10 md:py-16">
        <div className="mb-8 flex flex-col gap-6 border-b border-white/[0.07] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3"><Badge variant="success">Sample report</Badge><span className="text-xs text-zinc-500">Fictional company · illustrative evidence</span></div>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">Northstar Analytics AI visibility audit</h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-zinc-400">A point-in-time, web-grounded model benchmark across 25 shared questions, four providers, competitors, and citation evidence.</p>
          </div>
          <Button asChild size="lg"><Link href="/auth/sign-up">Run my first audit — $9 <ArrowRight /></Link></Button>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Report summary">
          <Metric label="Discovery visibility" value="38%" detail="28 of 73 eligible answers" />
          <Metric label="Owned citation rate" value="24%" detail="18 of 73 eligible answers" />
          <Metric label="Answer coverage" value="91%" detail="91 of 100 planned answers" />
          <Metric label="Top competitor" value="Luminary" detail="Appeared in 41 answers" />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="border border-emerald-300/15 bg-emerald-300/[0.025]">
            <CardHeader><p className="eyebrow">Prioritized action plan</p><CardTitle>What Northstar should do next</CardTitle><CardDescription>Every recommendation links back to stored answer and source evidence. Actions identify an opportunity; they do not promise ranking improvements.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {actions.map(([title, category, rationale, action], index) => (
                <article key={title} className="rounded-2xl bg-black/25 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
                  <div className="flex gap-4"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-300 font-semibold text-emerald-950">{index + 1}</span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-medium text-white">{title}</h2><Badge variant="secondary">{category}</Badge></div><p className="mt-2 text-sm leading-6 text-zinc-300">{action}</p><p className="mt-2 text-xs leading-5 text-zinc-500">Evidence: {rationale}</p><div className="mt-3 flex gap-4 text-xs text-emerald-300"><a href="#answer-evidence">View supporting answers</a><a href="https://example.com" rel="noreferrer" target="_blank" className="inline-flex items-center gap-1">Example source <ExternalLink className="size-3" /></a></div></div></div>
                </article>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="bg-[#0b0e0c]"><CardHeader><CardTitle className="text-base">Provider visibility</CardTitle><CardDescription>Grounded discovery answers mentioning Northstar.</CardDescription></CardHeader><CardContent className="space-y-4"><Bar label="OpenAI" value={46} /><Bar label="Claude" value={34} /><Bar label="Gemini" value={31} /><Bar label="Grok" value={39} /></CardContent></Card>
            <Card className="bg-[#0b0e0c]"><CardHeader><CardTitle className="text-base">What is included</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-zinc-300">{["25 shared buyer questions", "Four web-grounded model providers", "Competitor comparison", "Answer and citation evidence", "Five prioritized actions", "PDF and CSV exports"].map((item) => <p key={item} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-300" />{item}</p>)}</CardContent></Card>
          </div>
        </section>

        <section id="answer-evidence" className="mt-6 scroll-mt-24">
          <Card className="bg-[#0b0e0c]"><CardHeader><p className="eyebrow">Stored evidence</p><CardTitle>Missed buyer questions</CardTitle><CardDescription>The questions where competitors appeared and the domains models cited for the answer.</CardDescription></CardHeader><CardContent className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-white/[0.08] text-xs text-zinc-500"><tr><th className="px-3 py-3 font-medium">Buyer question</th><th className="px-3 py-3 font-medium">Shown instead</th><th className="px-3 py-3 font-medium">Repeated source</th><th className="px-3 py-3 font-medium">Signal</th></tr></thead><tbody>{missed.map(([question, competitors, source]) => <tr key={question} className="border-b border-white/[0.06] last:border-0"><td className="max-w-md px-3 py-4 leading-6 text-zinc-200">{question}</td><td className="px-3 py-4 text-zinc-400">{competitors}</td><td className="px-3 py-4 text-zinc-400">{source}</td><td className="px-3 py-4"><Badge variant="warning">Missing</Badge></td></tr>)}</tbody></table></CardContent></Card>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Trust icon={<Target />} title="Identical test">All four providers receive the same frozen question set.</Trust>
          <Trust icon={<FileText />} title="API-grounded evidence">Results come from model APIs with web grounding and can differ from consumer chat interfaces.</Trust>
          <Trust icon={<TrendingUp />} title="Designed for follow-up">Rerun the exact questions after implementation and compare the deltas.</Trust>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <Card className="bg-[#0b0e0c]"><CardContent className="p-5"><p className="text-xs text-zinc-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{value}</p><p className="mt-1 text-xs text-zinc-400">{detail}</p></CardContent></Card>; }
function Bar({ label, value }: { label: string; value: number }) { return <div><div className="mb-2 flex justify-between text-xs"><span className="text-zinc-300">{label}</span><span className="font-mono text-zinc-400">{value}%</span></div><div className="h-2 rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${value}%` }} /></div></div>; }
function Trust({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) { return <Card className="bg-[#0b0e0c]"><CardContent className="p-6"><div className="text-emerald-300 [&>svg]:size-5">{icon}</div><h2 className="mt-4 font-medium text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{children}</p></CardContent></Card>; }
