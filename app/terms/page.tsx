import type { Metadata } from "next";
import Link from "next/link";

import { PolicyPage } from "@/components/policy-page";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const pageUrl = absoluteUrl("/terms");

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Plain-language terms for accounts, prepaid benchmark credits, acceptable use, outputs, availability, and limitations at 100 Questions.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "100 Questions Service Terms",
    description:
      "Terms for using the 100 Questions website, free readiness checker, and prepaid AI visibility benchmark.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "100 Questions Service Terms",
    description:
      "Terms for accounts, acceptable use, prepaid credits, billing, outputs, and service availability.",
    images: [SOCIAL_IMAGE],
  },
};

export default function TermsPage() {
  return (
    <PolicyPage
      path="/terms"
      eyebrow="Service terms"
      title="100 Questions service terms"
      description="These terms describe the practical rules for using the public website, free readiness service, account workspace, and prepaid benchmark product."
    >
      <section>
        <h2>Service scope</h2>
        <p className="mt-4">
          100 Questions provides a directional, time-stamped AI visibility
          benchmark and related public resources. A benchmark uses a frozen
          question set across configured AI providers and reports the completed
          answers, citations, coverage, analysis, and limitations available for
          that run.
        </p>
      </section>

      <section>
        <h2>Accounts and authorized use</h2>
        <ul className="mt-4">
          <li>Provide accurate account and benchmark information.</li>
          <li>Keep account credentials private and use only accounts you control.</li>
          <li>
            Submit only public website domains and lawful content that you are
            authorized to evaluate.
          </li>
          <li>
            Do not probe private networks, submit secrets or personal data,
            evade limits, disrupt the service, or use outputs for unlawful or
            deceptive claims.
          </li>
        </ul>
      </section>

      <section>
        <h2>Prepaid credits and billing</h2>
        <p className="mt-4">
          Benchmark credits are prepaid rather than a subscription. Current
          package details are shown before checkout, applicable taxes are shown
          by Stripe, and credits remain valid for 12 months from purchase unless
          a different term is explicitly shown at checkout. A credit is consumed
          when a benchmark run is accepted for processing under the product&apos;s
          fulfillment rules.
        </p>
      </section>

      <section>
        <h2>Outputs and interpretation</h2>
        <p className="mt-4">
          AI answers vary by provider, model, grounding source, locale, and
          time. Results are directional evidence, not a statistically
          representative market ranking, guarantee of future placement, legal
          advice, or proof that a specific optimization caused a later change.
          Review the <Link href="/methodology">public methodology</Link> before
          presenting or comparing results.
        </p>
      </section>

      <section>
        <h2>Availability and changes</h2>
        <p className="mt-4">
          Provider support, model identifiers, pricing, limits, and features may
          change as external services evolve. The service may reject unsafe or
          unsupported requests and may suspend access needed to protect users,
          providers, or the platform. Material term changes will be reflected on
          this page with a new effective date.
        </p>
      </section>

      <section>
        <h2>Questions, billing issues, and privacy</h2>
        <p className="mt-4">
          Use the <Link href="/contact">contact page</Link> for account or
          payment questions. The <Link href="/privacy">privacy notice</Link>
          explains how account, benchmark, payment, and analytics data are
          handled.
        </p>
      </section>
    </PolicyPage>
  );
}
