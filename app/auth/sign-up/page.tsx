import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth-form";
import { AnalyticsEvent } from "@/components/analytics-event";
import { BrandMark } from "@/components/brand-mark";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a private 100 Questions workspace to benchmark your brand across leading AI answer engines and receive a source-backed report.",
  alternates: { canonical: absoluteUrl("/auth/sign-up") },
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#070908] px-4 py-12">
      <AnalyticsEvent event="signup_started" />
      <div className="flex w-full flex-col items-center gap-8">
        <Link href="/" aria-label="Return to 100 Questions home">
          <BrandMark />
        </Link>
        <AuthForm mode="sign-up" />
      </div>
    </main>
  );
}
