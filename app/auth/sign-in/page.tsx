import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth-form";
import { BrandMark } from "@/components/brand-mark";
import { getBillingPackage } from "@/lib/billing/packages";
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

type SignInPageProps = {
  searchParams: Promise<{
    package?: string | string[];
    next?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const query = await searchParams;
  const packageRaw = typeof query.package === "string" ? query.package : "";
  const packageId = getBillingPackage(packageRaw) ? packageRaw : undefined;
  const nextRaw = typeof query.next === "string" ? query.next : undefined;
  const nextPath =
    nextRaw &&
    nextRaw.startsWith("/") &&
    !nextRaw.startsWith("//") &&
    !nextRaw.includes("\\")
      ? nextRaw
      : undefined;

  return (
    <main className="grid min-h-screen place-items-center bg-[#070908] px-4 py-12">
      <div className="flex w-full flex-col items-center gap-8">
        <Link href="/" aria-label="Return to 100 Questions home">
          <BrandMark />
        </Link>
        <div className="flex w-full flex-col items-center gap-4">
          <AuthForm mode="sign-in" packageId={packageId} nextPath={nextPath} />
        </div>
      </div>
    </main>
  );
}
