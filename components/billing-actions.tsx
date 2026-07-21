"use client";

import { Check, CreditCard, LoaderCircle, ReceiptText } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BillingPackageId } from "@/lib/billing/packages";

export type PurchasePackage = {
  id: BillingPackageId;
  name: string;
  credits: number;
  price: string;
  description: string;
};

type BillingActionsProps = {
  billingConfigured: boolean;
  hasCustomer: boolean;
  packages: PurchasePackage[];
};

type PendingAction = BillingPackageId | "portal" | null;

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || "The billing request failed.";
  } catch {
    return "The billing request failed.";
  }
}

export function BillingActions({
  billingConfigured,
  hasCustomer,
  packages,
}: BillingActionsProps) {
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  async function openCheckout(packageId: BillingPackageId) {
    setPending(packageId);
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({ packageId }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const body = (await response.json()) as { url?: string };
      if (!body.url) throw new Error("Stripe Checkout was unavailable.");
      window.location.assign(body.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The billing request failed.");
      setPending(null);
    }
  }

  async function openPortal() {
    setPending("portal");
    setError(null);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      if (!response.ok) throw new Error(await readError(response));
      const body = (await response.json()) as { url?: string };
      if (!body.url) throw new Error("Billing history was unavailable.");
      window.location.assign(body.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The billing request failed.");
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-3">
        {packages.map((billingPackage) => {
          const recommended = billingPackage.id === "three";
          return (
            <Card
              key={billingPackage.id}
              className={recommended ? "border border-emerald-300/25 bg-emerald-300/[0.035]" : "bg-[#0a0d0b]"}
            >
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{billingPackage.name}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{billingPackage.price}</p>
                  </div>
                  {recommended ? <Badge variant="success">Best value</Badge> : null}
                </div>
                <p className="mt-3 min-h-10 text-xs leading-5 text-zinc-400">{billingPackage.description}</p>
                <p className="mt-3 flex items-center gap-2 text-xs text-zinc-300">
                  <Check className="size-3.5 text-emerald-300" />
                  {billingPackage.credits} run credit{billingPackage.credits === 1 ? "" : "s"}
                </p>
                <Button
                  className="mt-5 w-full"
                  variant={recommended ? "default" : "secondary"}
                  type="button"
                  disabled={!billingConfigured || pending !== null}
                  onClick={() => void openCheckout(billingPackage.id)}
                >
                  {pending === billingPackage.id ? (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  ) : (
                    <CreditCard aria-hidden="true" />
                  )}
                  Buy package
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 text-xs leading-5 text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <p>One credit runs the complete benchmark. Purchased credits are valid for 12 months.</p>
        {hasCustomer ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={!billingConfigured || pending !== null}
            onClick={() => void openPortal()}
          >
            {pending === "portal" ? <LoaderCircle className="animate-spin" /> : <ReceiptText />}
            Billing history
          </Button>
        ) : null}
      </div>

      {!billingConfigured ? (
        <p className="text-sm leading-5 text-amber-200">Payments are awaiting Stripe configuration.</p>
      ) : null}
      <p aria-live="polite" className="min-h-5 text-sm text-red-300">{error}</p>
    </div>
  );
}
