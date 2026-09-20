import Link from "next/link";
import { MarketingCheckoutButton } from "@/components/marketing-checkout-button";
import { AnalyticsEvent } from "@/components/analytics-event";
import { buildReadinessOffer, readinessDomain, readinessSource } from "@/lib/readiness-offer";

export const metadata = { title: "Go beyond your free scan", robots: { index: false, follow: false } };

export default async function AuditAfterScan({ searchParams }: {
  searchParams: Promise<{ website?: string; source?: string }>;
}) {
  const query = await searchParams;
  const domain = readinessDomain(query.website);
  const source = readinessSource(query.source);
  const offer = buildReadinessOffer(domain, 80, source);
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <AnalyticsEvent event="readiness_offer_viewed" properties={{ source }} />
      <Link href="/" className="text-sm text-emerald-300">100 Questions</Link>
      <p className="eyebrow mt-12">Beyond technical readiness</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Does AI recommend your business?</h1>
      {domain && <p className="mt-4 break-all text-emerald-300">Your audit website: {domain}</p>}
      <p className="mt-6 leading-7 text-zinc-300">{offer.description}</p>
      <p className="mt-4 leading-7 text-zinc-400">Your free scan and its fixes remain free. This separate benchmark measures actual API-grounded answers; results are a snapshot, not a ranking guarantee or a test of consumer chat interfaces.</p>
      <MarketingCheckoutButton className="mt-8" website={domain} source={source} label={offer.label} />
      <p className="mt-3 text-sm text-zinc-400">{offer.priceNote}</p>
      <p className="mt-3 text-sm text-zinc-400">After payment, create or sign in to your account and confirm your brand and market before starting. Your website will be prefilled in this browser for 24 hours.</p>
      <div className="mt-8 flex flex-wrap gap-6 text-sm text-emerald-300">
        <Link href="/sample-report">See a sample report</Link>
        <Link href="/ai-visibility-checker">Back to the free checker</Link>
        <Link href="/dashboard">Already have credits? Open dashboard</Link>
      </div>
    </main>
  );
}
