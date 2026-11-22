"use client";

import { usePathname } from "next/navigation";

import { FeaturedBadgeGrid } from "@/components/featured-on-section";

export function FooterDirectoryBadges() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <div className="border-t border-white/[0.07]">
      <div className="page-shell py-12 md:py-14">
        <h2 className="text-balance text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
          Find 100 Questions around the web.
        </h2>
        <FeaturedBadgeGrid className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" />
      </div>
    </div>
  );
}