import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="border-b border-white/[0.07] bg-[#070908]">
      <div className="page-shell flex min-h-16 items-center justify-between gap-4 py-2">
        <Link href="/" aria-label="100 Questions home">
          <BrandMark className="[&>span]:hidden sm:[&>span]:inline" />
        </Link>
        <nav className="flex items-center gap-1" aria-label="Primary navigation">
          <div className="mr-2 hidden items-center md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/methodology">Methodology</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/faq">FAQ</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/#pricing">Pricing</Link>
            </Button>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth/sign-up">
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">Start a benchmark</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
