import type { Metadata } from "next";
import Link from "next/link";

import { PolicyPage } from "@/components/policy-page";
import { absoluteUrl, SITE_NAME, SOCIAL_IMAGE } from "@/lib/site";

const pageUrl = absoluteUrl("/privacy");

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How 100 Questions handles account, benchmark, payment, analytics, generated-answer, citation, and retention data.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Privacy at 100 Questions",
    description:
      "A plain-language explanation of the data used to operate the 100 Questions AI visibility benchmark.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy at 100 Questions",
    description:
      "How 100 Questions handles benchmark data, processors, retention, deletion, and user choices.",
    images: [SOCIAL_IMAGE],
  },
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      path="/privacy"
      eyebrow="Plain-language privacy notice"
      title="Privacy at 100 Questions"
      description="This notice explains which data the service needs, why it is used, which processors help operate it, and which controls are available to account owners."
    >
      <section>
        <h2>Data the service processes</h2>
        <ul className="mt-4">
          <li>Account details such as an email address and authentication records.</li>
          <li>
            Benchmark inputs such as a subject name, public domain, description,
            market, locale, and selected competitors.
          </li>
          <li>
            Generated questions, provider answers, source URLs, analysis labels,
            scores, coverage records, and report exports.
          </li>
          <li>
            Payment identifiers, purchased-credit records, and fulfillment
            metadata. Full card details are handled by Stripe rather than stored
            by 100 Questions.
          </li>
          <li>
            Operational and analytics data needed to secure, diagnose, and
            understand use of the public website and application.
          </li>
        </ul>
      </section>

      <section>
        <h2>How the data is used</h2>
        <p className="mt-4">
          Data is used to create and operate an account, run the benchmark,
          preserve evidence, calculate results, generate exports, fulfill
          purchases, send service notifications, prevent abuse, and improve
          reliability. Private benchmark runs are not published as public
          profile pages.
        </p>
      </section>

      <section>
        <h2>Service providers</h2>
        <p className="mt-4">
          The service relies on specialist processors for hosting and workflows
          (Vercel), database and authentication services (Neon), payments
          (Stripe), transactional email (Resend), AI model access and routing
          (Vercel AI Gateway and the selected model providers), and website
          analytics (Google Analytics, DataFast, and Vercel Analytics). Those
          services process data under their own applicable terms and privacy
          commitments.
        </p>
      </section>

      <section>
        <h2>Retention and account controls</h2>
        <p className="mt-4">
          The default answer-evidence retention window is 30 days. The service
          may retain account, billing, security, and minimum explanatory records
          for longer when they are needed to operate the account, fulfill a
          purchase, prevent abuse, resolve a dispute, or meet legal obligations.
          Account owners can delete individual benchmark runs from their private
          workspace.
        </p>
      </section>

      <section>
        <h2>Public website checks</h2>
        <p className="mt-4">
          The free readiness checker fetches only publicly reachable website
          resources supplied by the user. Do not submit secrets, private network
          addresses, or personal data. See the{" "}
          <Link href="/ai-visibility-checker">checker documentation</Link> for
          the scope and limitations of that service.
        </p>
      </section>

      <section>
        <h2>Questions and requests</h2>
        <p className="mt-4">
          Use the <Link href="/contact">contact page</Link> for privacy,
          account, or payment questions. Include only the minimum information
          needed to identify the request and never post receipts or account
          details in a public issue.
        </p>
      </section>
    </PolicyPage>
  );
}
