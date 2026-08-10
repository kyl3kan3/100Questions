/* eslint-disable @next/next/no-img-element */

import { ExternalLink } from "lucide-react";

const featuredBadges = [
  {
    name: "VerifiedDR",
    href: "https://verifieddr.com/website/100questionsai-com",
    image: {
      src: "https://verifieddr.com/badge/100questionsai-com.svg?metric=truedr",
      alt: "Verified domain rating for 100questionsai.com",
      width: 220,
      height: 68,
    },
  },
  {
    name: "DanielLaunches",
    href: "https://daniellaunches.com",
    image: {
      src: "https://daniellaunches.com/badge-light.svg",
      alt: "Featured on DanielLaunches",
      width: 220,
      height: 48,
    },
  },
  {
    name: "FoundrList",
    href: "https://www.foundrlist.com/product/100questions?utm_source=badge&utm_medium=embed",
    image: {
      src: "https://www.foundrlist.com/api/badge/100questions",
      alt: "Featured on FoundrList",
      width: 150,
      height: 48,
    },
  },
  {
    name: "SaaSGrow",
    href: "https://saasgrow.app?ref=100questionsai.com",
    image: {
      src: "https://saasgrow.app/api/badge?type=featured&style=blue",
      alt: "100 Questions featured on SaaSGrow",
      width: 240,
      height: 54,
    },
  },
  {
    name: "Findly.tools",
    href: "https://findly.tools/100-questions?utm_source=100-questions",
    image: {
      src: "https://findly.tools/badges/findly-tools-badge-light.svg",
      alt: "Featured on Findly.tools",
      width: 175,
      height: 55,
    },
  },
  {
    name: "neeed.directory",
    href: "https://neeed.directory/products/100-questions?utm_source=100-questions",
    image: {
      src: "https://neeed.directory/badges/neeed-badge-light.svg",
      alt: "Featured on neeed.directory",
      width: 139,
      height: 44,
    },
  },
  {
    name: "Launch Llama",
    href: "https://tools.launchllama.co?utm_source=badge&utm_medium=referral",
    image: {
      src: "https://tools.launchllama.co/featured-badge.png?v=2",
      alt: "As seen on Launch Llama Newsletter",
      width: 200,
      height: 50,
    },
  },
  {
    name: "Directree",
    href: "https://www.directree.io",
    image: {
      src: "https://www.directree.io/badge/directree-badge-lightmode.svg",
      alt: "Verified on Directree",
      width: 200,
      height: 33,
    },
  },
  {
    name: "Peerlist",
    href: "https://peerlist.io/kyl3kan3/project/100-questions",
    label: "Featured project",
  },
  {
    name: "SEOReceipts",
    href: "https://seoreceipts.com/site/100questionsai/?ref=badge&utm_source=embed&utm_medium=badge&utm_campaign=status-auto",
    rel: "nofollow sponsored noopener noreferrer",
    image: {
      src: "https://seoreceipts.com/api/badge?slug=100questionsai&mode=auto&theme=paper&size=card",
      alt: "Google Search Console stats for 100questionsai.com",
      width: 330,
      height: 68,
    },
  },
] as const;

export function FeaturedOnSection() {
  return (
    <section className="border-t border-white/[0.07] bg-white/[0.018]">
      <div className="page-shell py-20 md:py-24">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="eyebrow">Featured on</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              Find 100 Questions around the web.
            </h2>
          </div>
          <p className="max-w-2xl text-pretty leading-7 text-zinc-400">
            These launch, product, and search-performance profiles provide
            independent places to verify the product. Inclusion is not a rating,
            customer review, or endorsement.
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredBadges.map((badge) => (
            <li key={badge.name}>
              <a
                href={badge.href}
                target="_blank"
                rel={"rel" in badge ? badge.rel : "nofollow noopener noreferrer"}
                aria-label={`View 100 Questions on ${badge.name}`}
                className="group flex min-h-28 items-center justify-center rounded-[22px] bg-[#f7f7f5] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_45px_-32px_rgba(0,0,0,0.9)] transition-[scale,box-shadow] duration-150 ease-out hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_22px_52px_-30px_rgba(0,0,0,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070908] active:scale-[0.96]"
              >
                {"image" in badge ? (
                  <img
                    src={badge.image.src}
                    alt={badge.image.alt}
                    width={badge.image.width}
                    height={badge.image.height}
                    loading="lazy"
                    decoding="async"
                    className="max-h-16 w-auto max-w-full object-contain outline outline-1 -outline-offset-1 outline-black/10"
                  />
                ) : (
                  <span className="flex items-center gap-3 rounded-xl bg-[#111] px-5 py-3 text-left text-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)]">
                    <span>
                      <span className="block text-base font-semibold">
                        {badge.name}
                      </span>
                      <span className="block text-xs text-zinc-400">
                        {badge.label}
                      </span>
                    </span>
                    <ExternalLink className="size-4 text-emerald-300" aria-hidden="true" />
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
