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
            className="mt-2 flex items-center justify-center gap-4 sm:justify-start"
            aria-label="Footer navigation"
          >
            <Link className="hover:text-zinc-200" href="/">
              Home
            </Link>
            <Link className="hover:text-zinc-200" href="/methodology">
              Methodology
            </Link>
            <Link className="hover:text-zinc-200" href="/faq">
              FAQ
            </Link>
          </nav>
        </div>
        <div className="flex max-w-full flex-wrap items-center justify-center gap-4 sm:justify-end [&_img]:block [&_img]:h-auto [&_img]:max-w-full">
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
          <a href="https://daniellaunches.com" target="_blank">
            <img
              src="https://daniellaunches.com/badge-light.svg"
              alt="Featured on DanielLaunches"
              width="220"
              height="48"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
