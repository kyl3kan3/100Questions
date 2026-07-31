import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth-form";
import { BrandMark } from "@/components/brand-mark";
import { getBillingPackage } from "@/lib/billing/packages";
import { absoluteUrl } from "@/lib/site";
import { cookies } from "next/headers";
import {
  GUEST_CHECKOUT_COOKIE,
  getGuestCheckoutSummary,
} from "@/lib/billing/guest-checkout";

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
    checkout_session?: string | string[];
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
  const checkoutSessionId =
    typeof query.checkout_session === "string"
      ? query.checkout_session
      : undefined;
  const cookieStore = await cookies();
  const checkout = checkoutSessionId
    ? await getGuestCheckoutSummary(
        checkoutSessionId,
        cookieStore.get(GUEST_CHECKOUT_COOKIE)?.value,
      ).catch(() => ({ state: "invalid" as const }))
    : null;

  return (
    <main className="grid min-h-screen place-items-center bg-[#070908] px-4 py-12">
      <div className="flex w-full flex-col items-center gap-8">
        <Link href="/" aria-label="Return to 100 Questions home">
          <BrandMark />
        </Link>
        <div className="flex w-full flex-col items-center gap-4">
          <AuthForm
            mode="sign-in"
            checkoutSessionId={
              checkout?.state === "paid" ? checkoutSessionId : undefined
            }
            email={checkout?.state === "paid" ? checkout.email : undefined}
            packageId={packageId}
            nextPath={nextPath}
          />
        </div>
      </div>
    </main>
  );
}
