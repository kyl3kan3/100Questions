/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export function GlobalFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#070908] text-zinc-400">
      <div className="page-shell flex flex-col items-center gap-5 py-7 text-center text-xs sm:flex-row sm:justify-between sm:text-left">
        <BrandMark showName={false} />
        <div className="max-w-md leading-5">
          <p>
            Directional, API-grounded benchmark; results may differ from consumer
            chat products.
          </p>
          <nav
            className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start"
            aria-label="Footer navigation"
          >
            <Link className="hover:text-zinc-200" href="/">
              Home
            </Link>
            <Link className="hover:text-zinc-200" href="/about">
              About
            </Link>
            <Link className="hover:text-zinc-200" href="/methodology">
              Methodology
            </Link>
            <Link className="hover:text-zinc-200" href="/ai-visibility">
              AI visibility
            </Link>
            <Link className="hover:text-zinc-200" href="/ai-visibility-index">
              AI Visibility Index
            </Link>
            <Link className="hover:text-zinc-200" href="/ai-visibility-checker">
              AI visibility checker
            </Link>
            <Link className="hover:text-zinc-200" href="/ai-search-optimization">
              AI search optimization
            </Link>
            <Link className="hover:text-zinc-200" href="/ai-seo-tools">
              AI SEO tools
            </Link>
            <Link
              className="hover:text-zinc-200"
              href="/answer-engine-optimization-tools"
            >
              AEO tools
            </Link>
            <Link className="hover:text-zinc-200" href="/chatgpt-seo-tool">
              ChatGPT SEO tool
            </Link>
            <Link
              className="hover:text-zinc-200"
              href="/generative-engine-optimization"
            >
              GEO guide
            </Link>
            <Link
              className="hover:text-zinc-200"
              href="/answer-engine-optimization"
            >
              AEO guide
            </Link>
            <Link className="hover:text-zinc-200" href="/llm-seo">
              LLM SEO
            </Link>
            <Link className="hover:text-zinc-200" href="/peec-ai-alternative">
              Peec AI alternative
            </Link>
            <Link className="hover:text-zinc-200" href="/for-agencies">
              For agencies
            </Link>
            <Link
              className="hover:text-zinc-200"
              href="/ai-visibility-audit-checklist"
            >
              Audit checklist
            </Link>
            <Link className="hover:text-zinc-200" href="/faq">
              FAQ
            </Link>
            <Link className="hover:text-zinc-200" href="/sample-report">
              Sample report
            </Link>
          </nav>
        </div>
        <div className="flex max-w-full flex-col items-center gap-3 sm:items-end">
          <div className="rounded-xl bg-white/[0.03] px-4 py-3 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
            <p className="font-medium text-zinc-300">
              Private · API-grounded · No subscription
            </p>
            <Link
              href="/sample-report"
              className="mt-1 block text-emerald-300 hover:text-emerald-200"
            >
              See the complete deliverable →
            </Link>
          </div>
          <div className="flex max-w-full flex-wrap items-center justify-center gap-3 sm:justify-end [&_img]:block [&_img]:h-auto [&_img]:max-w-full">
            <a
              href="https://verifieddr.com/website/100questionsai-com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View the verified domain rating for 100questionsai.com"
              className="shrink-0 opacity-80 transition-opacity hover:opacity-100"
            >
              <img
                src="https://verifieddr.com/badge/100questionsai-com.svg?metric=truedr"
                alt="Verified DR - Verified Domain Rating for 100questionsai.com"
                width="220"
                height="68"
                loading="lazy"
              />
            </a>
            <a
              href="https://daniellaunches.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View 100 Questions on DanielLaunches"
              className="opacity-85 transition-opacity hover:opacity-100"
            >
              <img
                src="https://daniellaunches.com/badge-light.svg"
                alt="Featured on DanielLaunches"
                width="220"
                height="48"
                loading="lazy"
              />
            </a>
            <a
              href="https://www.foundrlist.com/product/100questions?utm_source=badge&amp;utm_medium=embed"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View 100 Questions on FoundrList"
              className="opacity-85 transition-opacity hover:opacity-100"
            >
              <img
                src="https://www.foundrlist.com/api/badge/100questions"
                alt="Featured on FoundrList"
                width="150"
                height="48"
                loading="lazy"
              />
            </a>
            <a
              href="https://saasgrow.app?ref=100questionsai.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View 100 Questions on SaaSGrow"
              className="opacity-85 transition-opacity hover:opacity-100"
            >
              <img
                src="https://saasgrow.app/api/badge?type=featured&style=blue"
                alt="100 Questions on SaaSGrow"
                width="240"
                height="54"
                loading="lazy"
              />
            </a>
            <a
              href="https://findly.tools/100-questions?utm_source=100-questions"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View 100 Questions on Findly.tools"
              className="opacity-85 transition-opacity hover:opacity-100"
            >
              <img
                src="https://findly.tools/badges/findly-tools-badge-light.svg"
                alt="Featured on Findly.tools"
                width="175"
                height="55"
                loading="lazy"
              />
            </a>
            <a
              href="https://neeed.directory/products/100-questions?utm_source=100-questions"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View 100 Questions on neeed.directory"
              className="opacity-85 transition-opacity hover:opacity-100"
            >
              <img
                src="https://neeed.directory/badges/neeed-badge-light.svg"
                alt="Featured on neeed.directory"
                width="139"
                loading="lazy"
              />
            </a>
            <a
              href="https://tools.launchllama.co?utm_source=badge&amp;utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View 100 Questions on Launch Llama"
              className="opacity-85 transition-opacity hover:opacity-100"
            >
              <img
                src="https://tools.launchllama.co/featured-badge.png?v=2"
                alt="As seen on Launch Llama Newsletter"
                width="200"
                height="50"
                loading="lazy"
              />
            </a>
            <a
              href="https://www.directree.io"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View 100 Questions on Directree"
              className="opacity-85 transition-opacity hover:opacity-100"
            >
              <img
                src="https://www.directree.io/badge/directree-badge-lightmode.svg"
                alt="Verified on Directree"
                width="200"
                height="37"
                loading="lazy"
              />
            </a>
            <a
              href="https://peerlist.io/kyl3kan3/project/100-questions"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View 100 Questions on Peerlist"
              className="opacity-85 transition-opacity hover:opacity-100"
            >
              <img
                src="https://peerlist.io/api/v1/projects/embed/PRJHLKLOEN7QGO8BKIL6BJP6RP6R7P?showUpvote=false&amp;theme=light"
                alt="100 Questions on Peerlist"
                style={{ width: "auto", height: "72px" }}
                loading="lazy"
              />
            </a>
            <a
              href="https://seoreceipts.com/site/100questionsai/?ref=badge&amp;utm_source=embed&amp;utm_medium=badge&amp;utm_campaign=status-auto"
              target="_blank"
              rel="nofollow sponsored noopener"
              title="View 100questionsai.com's Google Search Console stats"
              aria-label="View 100 Questions Google Search Console stats on SEOReceipts"
              className="opacity-85 transition-opacity hover:opacity-100"
            >
              <img
                src="https://seoreceipts.com/api/badge?slug=100questionsai&amp;mode=auto&amp;theme=paper&amp;size=card"
                alt="Google Search Console stats for 100questionsai.com"
                height="68"
                loading="lazy"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
