import { ArrowRight, Bot, FileSearch, Server, ShieldCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { AnalyticsEvent } from "@/components/analytics-event";
import { EvidenceNotes } from "@/components/evidence-notes";
import { SeoResourceShell } from "@/components/seo-resource-shell";
import { Badge } from "@/components/ui/badge";
import { buildResourceMetadata } from "@/lib/resource-metadata";

const path = "/how-to-check-if-oai-searchbot-is-blocked" as const;
const published = { iso: "2026-08-28", label: "August 28, 2026" } as const;

export const metadata = buildResourceMetadata({
  path,
  title: "How to Check If OAI-SearchBot Is Blocked",
  description:
    "Check OAI-SearchBot access in robots.txt, page paths, CDN rules, and server rendering without confusing search discovery with GPTBot training access.",
  publishedTime: published.iso,
  modifiedTime: published.iso,
});

const checks = [
  {
    icon: FileSearch,
    title: "Read robots.txt",
    description:
      "Check both an OAI-SearchBot group and the wildcard group. A specific path rule can matter even when the homepage is allowed.",
  },
  {
    icon: ShieldCheck,
    title: "Request the exact page",
    description:
      "Test the public URL you want discovered. Homepage access does not prove that a guide, product page, or directory is reachable.",
  },
  {
    icon: Server,
    title: "Inspect the hosting layer",
    description:
      "A CDN, firewall, bot challenge, server error, or client-only render can block retrieval independently of robots.txt.",
  },
] as const;

const faqs = [
  {
    question: "What is OAI-SearchBot?",
    answer:
      "OAI-SearchBot is OpenAI's crawler for discovering public content that may be surfaced in ChatGPT search experiences. Allowing access removes one technical barrier; it does not guarantee a citation, recommendation, ranking, or visit.",
  },
  {
    question: "Is OAI-SearchBot the same as GPTBot?",
    answer:
      "No. OpenAI documents OAI-SearchBot for search discovery and GPTBot for potential model training. A site can make different choices for those user agents.",
  },
  {
    question: "Does an Allow rule guarantee that OpenAI can fetch the page?",
    answer:
      "No. Robots rules express crawl preferences, but a CDN, web application firewall, authentication layer, server error, or rendering failure can still prevent a successful fetch.",
  },
  {
    question: "Should private content be protected with robots.txt?",
    answer:
      "No. Robots.txt is public and is not access control. Protect private or sensitive content with authentication and appropriate server-side authorization.",
  },
] as const;

export default function OaiSearchBotGuidePage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Technical ChatGPT search guide"
      breadcrumb="OAI-SearchBot access"
      title="How to check if OAI-SearchBot is blocked"
      description="Test the crawler rule, exact page, and hosting layer that affect ChatGPT search discovery—without treating access as a ranking guarantee."
      published={published}
      modified={published}
      primaryAction={{ href: "/ai-visibility-checker", label: "Run the free access check" }}
      faqs={faqs}
    >
      <AnalyticsEvent
        event="seo_landing_viewed"
        onceKey="oai-searchbot-guide"
        properties={{ landing_page: path, keyword_cluster: "oai_searchbot" }}
      />

      <section className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="quick-answer-heading">
        <div>
          <p className="eyebrow">Quick answer</p>
          <h2 id="quick-answer-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            Check more than the crawler name
          </h2>
        </div>
        <div className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
          <ol className="space-y-4 text-sm leading-6 text-zinc-300">
            <li><strong className="text-white">1.</strong> Open the canonical site&apos;s public <code>/robots.txt</code>.</li>
            <li><strong className="text-white">2.</strong> Review any OAI-SearchBot group and the wildcard group.</li>
            <li><strong className="text-white">3.</strong> Test the exact page path you want discovered.</li>
            <li><strong className="text-white">4.</strong> Confirm the CDN or firewall returns normal page content instead of an error or challenge.</li>
            <li><strong className="text-white">5.</strong> Verify that meaningful text is present in the server-rendered response.</li>
          </ol>
        </div>
      </section>

      <section aria-labelledby="crawler-differences-heading">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Different controls, different purposes</p>
            <h2 id="crawler-differences-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Do not confuse search discovery with model training
            </h2>
          </div>
          <Bot className="hidden size-8 text-emerald-300 sm:block" aria-hidden="true" />
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["OAI-SearchBot", "Discovers public pages for ChatGPT search summaries, snippets, citations, and links."],
            ["GPTBot", "Crawls content that may be used to improve OpenAI's generative models."],
            ["ChatGPT-User", "May fetch a page in response to a user's direct request or interaction."],
          ].map(([name, description]) => (
            <article key={name} className="rounded-[22px] bg-white/[0.025] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
              <h3 className="font-mono text-sm font-semibold text-emerald-200">{name}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="access-checks-heading">
        <p className="eyebrow">Three access layers</p>
        <h2 id="access-checks-heading" className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
          Robots rules are only the first check
        </h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {checks.map(({ icon: Icon, title, description }, index) => (
            <article key={title} className="rounded-[24px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-emerald-300" aria-hidden="true" />
                <span className="font-mono text-xs text-zinc-500">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2" aria-labelledby="robots-examples-heading">
        <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <Badge variant="outline" className="border-red-300/25 text-red-200">Full-site block</Badge>
          <h2 id="robots-examples-heading" className="mt-5 text-2xl font-semibold text-white">A rule that blocks every path</h2>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/30 p-5 text-sm leading-6 text-zinc-300"><code>{"User-agent: OAI-SearchBot\nDisallow: /"}</code></pre>
          <p className="mt-4 text-sm leading-6 text-zinc-400">The slash represents the entire site for that user-agent group.</p>
        </article>
        <article className="rounded-[26px] bg-[#0b0e0c] p-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <Badge variant="outline" className="border-emerald-300/25 text-emerald-200">Explicit access</Badge>
          <h2 className="mt-5 text-2xl font-semibold text-white">A simple allow rule</h2>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/30 p-5 text-sm leading-6 text-zinc-300"><code>{"User-agent: OAI-SearchBot\nAllow: /"}</code></pre>
          <p className="mt-4 text-sm leading-6 text-zinc-400">Do not paste this blindly; existing groups and path rules can change the correct configuration.</p>
        </article>
      </section>

      <section aria-labelledby="mistakes-heading">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Common mistakes</p>
            <h2 id="mistakes-heading" className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Access is necessary, but it is not visibility evidence
            </h2>
          </div>
          <TriangleAlert className="hidden size-8 text-amber-300 sm:block" aria-hidden="true" />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["Checking only the homepage", "A path-specific rule or hosting behavior can block the resource that matters."],
            ["Ignoring wildcard rules", "A wildcard group may apply when no more specific user-agent group matches."],
            ["Treating robots.txt as security", "The file is public and cannot protect private information."],
            ["Assuming allowed means cited", "Access removes one possible barrier; providers still control retrieval and answer composition."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-[20px] bg-white/[0.025] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <EvidenceNotes
        sourceIds={["openAiPublishers", "methodology"]}
        context="OpenAI documents crawler purposes and discovery controls. The 100 Questions methodology separates technical readiness from observed answer visibility and does not treat crawler access as a ranking guarantee."
      />

      <section className="rounded-[28px] bg-emerald-300 p-7 text-zinc-950 sm:p-9">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">Run the technical preflight</p>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-[-0.035em]">Check crawler access alongside the rest of the public foundation.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-zinc-800">The free checker reviews indexability, canonicals, metadata, schema, sitemaps, question content, AI crawler rules, and optional llms.txt discovery.</p>
          </div>
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800" href="/ai-visibility-checker">
            Run the free checker <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </SeoResourceShell>
  );
}
