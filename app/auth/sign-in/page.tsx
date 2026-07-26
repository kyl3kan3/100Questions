import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth-form";
import { BrandMark } from "@/components/brand-mark";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to your private 100 Questions workspace to run AI visibility benchmarks, review source-backed results, and manage reports.",
  alternates: { canonical: absoluteUrl("/auth/sign-in") },
  // Intentionally excluded from search: this is a private sign-in form with
  // no unique content for searchers. Links remain followable so the utility
  // page does not block internal link discovery.
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#070908] px-4 py-12">
      <div className="flex w-full flex-col items-center gap-8">
        <Link href="/" aria-label="Return to 100 Questions home">
          <BrandMark />
        </Link>
        <AuthForm mode="sign-in" />
      </div>
    </main>
  );
}
