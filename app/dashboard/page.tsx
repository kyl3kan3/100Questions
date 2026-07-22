import { eq } from "drizzle-orm";
import { CreditCard, Gauge, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { BillingActions } from "@/components/billing-actions";
import { CheckoutReturnStatus } from "@/components/checkout-return-status";
import { RunForm } from "@/components/run-form";
import { RunHistory } from "@/components/run-history";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { hasUnlimitedAccess } from "@/lib/access";
import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  getCreditBalance,
  hasPurchasedCredits,
  isStripeCheckoutConfigured,
} from "@/lib/billing/credits";
import {
  formatPackagePrice,
  getPublicBillingPackages,
} from "@/lib/billing/packages";
import { getBenchmarkConfig, PROVIDERS } from "@/lib/config";
import { getDb } from "@/lib/db";
import { billingCustomers } from "@/lib/db/schema";
import { listRunsForUser } from "@/lib/runs";

export const metadata: Metadata = {
  title: "Dashboard",
  alternates: { canonical: null },
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{
    checkout?: string | string[];
    session_id?: string | string[];
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/sign-in?next=/dashboard");
  }

  const unlimitedAccess = hasUnlimitedAccess(user.id);

  const [creditBalance, hasPurchased, runs, customer, query] = await Promise.all([
    getCreditBalance(user.id),
    hasPurchasedCredits(user.id),
    listRunsForUser(user.id),
    getDb()
      .select({ id: billingCustomers.id })
      .from(billingCustomers)
      .where(eq(billingCustomers.userId, user.id))
      .limit(1),
    searchParams,
  ]);
  const config = getBenchmarkConfig();
  const completed = runs.filter((run) => ["complete", "partial"].includes(run.status)).length;

  return (
    <main className="min-h-screen bg-[#070908] text-zinc-100">
      <AppHeader email={user.email} />
      <div className="page-shell py-10 md:py-14">
        <CheckoutReturnStatus
          state={typeof query.checkout === "string" ? query.checkout : null}
          hasSessionId={
            typeof query.session_id === "string" &&
            query.session_id.startsWith("cs_")
          }
        />
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              AI visibility, with the evidence attached.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Benchmarks use a shared web-search harness through Vercel AI Gateway. No result without sources enters the score.
            </p>
          </div>
          {unlimitedAccess ? <Badge variant="success">Unlimited test access</Badge> : null}
        </div>

        {!unlimitedAccess ? (
          <section className="mb-8" aria-labelledby="buy-credits-heading">
            <div className="mb-4">
              <p className="eyebrow">Prepaid benchmark credits</p>
              <h2 id="buy-credits-heading" className="mt-2 text-xl font-semibold text-white">
                Buy only the benchmarks you need.
              </h2>
            </div>
            <BillingActions
              billingConfigured={isStripeCheckoutConfigured()}
              hasCustomer={customer.length > 0}
              packages={getPublicBillingPackages(hasPurchased).map((billingPackage) => ({
                id: billingPackage.id,
                name: billingPackage.name,
                credits: billingPackage.credits,
                price: formatPackagePrice(billingPackage.priceCents),
                description: billingPackage.description,
              }))}
            />
          </section>
        ) : null}

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Summary
            icon={<CreditCard />}
            label="Available credits"
            value={unlimitedAccess ? "Unlimited" : String(creditBalance)}
            detail={
              unlimitedAccess
                ? "Internal testing access"
                : "One credit reserves one run"
            }
          />
          <Summary icon={<Gauge />} label="Completed runs" value={String(completed)} detail={`${runs.length} total benchmarks`} />
          <Summary icon={<ShieldCheck />} label="Coverage threshold" value="90%" detail="Below this, metrics are provisional" />
        </div>

        {!unlimitedAccess && !isStripeCheckoutConfigured() ? (
          <Card className="mb-6 border border-amber-300/15 bg-amber-300/[0.035]">
            <CardContent className="flex flex-col gap-3 py-4 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
              <span>Stripe Checkout is ready in code but needs the connected Stripe account and server environment values.</span>
              <Badge variant="warning">Configuration required</Badge>
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-6">
          <RunForm
            creditBalance={creditBalance}
            unlimitedAccess={unlimitedAccess}
            providerCount={PROVIDERS.length}
            questionCount={config.benchmark.defaultQuestionCount}
          />
          <RunHistory runs={runs} />
        </div>
      </div>
    </main>
  );
}

function Summary({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <Card className="bg-[#0a0d0b]">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-emerald-300 [&>svg]:size-4">{icon}</div>
        <div>
          <p className="text-xs text-zinc-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-zinc-100 tabular-nums">{value}</p>
          <p className="mt-1 text-[11px] leading-4 text-zinc-400">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
