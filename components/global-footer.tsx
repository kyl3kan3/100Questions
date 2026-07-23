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
            <Link
              className="hover:text-zinc-200"
              href="/generative-engine-optimization"
            >
              GEO guide
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
        </div>
      </div>
    </footer>
  );
}
