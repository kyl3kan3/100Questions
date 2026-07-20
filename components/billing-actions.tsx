"use client";

import { CreditCard, LoaderCircle, ReceiptText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type BillingActionsProps = {
  billingConfigured: boolean;
  hasCustomer: boolean;
  creditsPerPurchase?: number;
};

type PendingAction = "checkout" | "portal" | null;

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
  creditsPerPurchase = 1,
}: BillingActionsProps) {
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  async function openBillingDestination(
    action: Exclude<PendingAction, null>,
    endpoint: string,
  ) {
    setPending(action);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers:
          action === "checkout"
            ? { "Idempotency-Key": crypto.randomUUID() }
            : undefined,
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const body = (await response.json()) as { url?: string };

      if (!body.url) {
        throw new Error("The billing destination was unavailable.");
      }

      window.location.assign(body.url);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The billing request failed.",
      );
      setPending(null);
    }
  }

  const creditLabel = `${creditsPerPurchase} run credit${creditsPerPurchase === 1 ? "" : "s"}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={!billingConfigured || pending !== null}
          onClick={() =>
            void openBillingDestination("checkout", "/api/billing/checkout")
          }
        >
          {pending === "checkout" ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <CreditCard aria-hidden="true" />
          )}
          Buy {creditLabel}
        </Button>
        {hasCustomer ? (
          <Button
            type="button"
            variant="secondary"
            disabled={!billingConfigured || pending !== null}
            onClick={() =>
              void openBillingDestination("portal", "/api/billing/portal")
            }
          >
            {pending === "portal" ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <ReceiptText aria-hidden="true" />
            )}
            Billing history
          </Button>
        ) : null}
      </div>

      {!billingConfigured ? (
        <p className="text-sm leading-5 text-amber-200">
          Payments are awaiting Stripe configuration. No charge can be created
          yet.
        </p>
      ) : null}
      <p aria-live="polite" className="min-h-5 text-sm text-red-300">
        {error}
      </p>
    </div>
  );
}
