import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PolicyPage } from "@/components/policy-page";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const pageUrl = absoluteUrl("/contact");

export const metadata: Metadata = {
  title: "Contact and Support",
  description:
    "Find the right support route for 100 Questions account, billing, benchmark, privacy, security, product, and public API questions.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Contact and Support · 100 Questions",
    description:
      "Support routes for account, billing, benchmark, privacy, security, and public developer questions.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact and Support · 100 Questions",
    description:
      "Support routes for account, billing, benchmark, privacy, security, and public developer questions.",
    images: [SOCIAL_IMAGE],
  },
};

export default function ContactPage() {
  return (
    <PolicyPage
      path="/contact"
      eyebrow="Contact and support"
      title="Get the question to the right place"
      description="Choose the route that matches the issue and share only the minimum information needed to investigate it."
    >
      <section>
        <h2>Account, benchmark, or billing help</h2>
        <p className="mt-4">
          Sign in to your <Link href="/dashboard">private dashboard</Link> to
          review credits, runs, exports, and billing controls. Keep the Stripe
          receipt and benchmark run identifier available when reporting a
          purchase or fulfillment problem. Never post receipt details, account
          information, or private report content in a public issue.
        </p>
      </section>

      <section>
        <h2>Public website, documentation, or API issue</h2>
        <p className="mt-4">
          Reproducible issues affecting public pages, downloadable resources,
          the readiness API, or the open-source repository can be reported in
          the public GitHub issue tracker. Remove domains, tokens, receipts, and
          personal information before posting.
        </p>
        <p className="mt-4">
          <a
            href="https://github.com/kyl3kan3/100Questions/issues"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            Open the GitHub issue tracker{" "}
            <ExternalLink className="inline size-4" aria-hidden="true" />
          </a>
        </p>
      </section>

      <section>
        <h2>Privacy or security</h2>
        <p className="mt-4">
          Read the <Link href="/privacy">privacy notice</Link> first. Do not
          disclose a vulnerability or private account data in a public issue.
          Use the private contact route included with the applicable account,
          payment receipt, or service notification.
        </p>
      </section>

      <section>
        <h2>Product and methodology questions</h2>
        <p className="mt-4">
          The <Link href="/faq">FAQ</Link>,{" "}
          <Link href="/methodology">methodology</Link>, and{" "}
          <Link href="/sample-report">sample report</Link> answer the most
          common questions about providers, evidence, scoring, privacy,
          coverage, retention, pricing, and interpretation.
        </p>
      </section>
    </PolicyPage>
  );
}
