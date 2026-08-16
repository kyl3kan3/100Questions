"use client";

import { CheckCircle2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AnalyticsEvent } from "@/components/analytics-event";
import { Card, CardContent } from "@/components/ui/card";

type CheckoutReturnStatusProps = {
  state: string | null;
  checkoutSessionId: string | null;
};

export function CheckoutReturnStatus({
  state,
  checkoutSessionId,
}: CheckoutReturnStatusProps) {
  const router = useRouter();
  const hasSessionId = Boolean(checkoutSessionId);

  useEffect(() => {
    if (state !== "success" || !hasSessionId) {
      return;
    }

    const timers = [2_000, 5_000, 10_000].map((delay) =>
      window.setTimeout(() => router.refresh(), delay),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [hasSessionId, router, state]);

  if (state !== "success" && state !== "cancelled") {
    return null;
  }

  const completed = state === "success" && hasSessionId;

  return (
    <>
      {completed && checkoutSessionId ? (
        <AnalyticsEvent
          event="purchase_completed"
          onceKey={`purchase:${checkoutSessionId}`}
          properties={{ checkout_flow: "account" }}
        />
      ) : null}
      <Card
        className={`mb-6 ${
          completed
            ? "border-emerald-300/20 bg-emerald-300/[0.04]"
            : "border-zinc-700 bg-zinc-900/60"
        }`}
      >
        <CardContent className="flex items-start gap-3 py-4 text-sm">
          {completed ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />
          ) : (
            <Info className="mt-0.5 size-4 shrink-0 text-zinc-400" />
          )}
          <div>
            <p className={completed ? "text-emerald-100" : "text-zinc-200"}>
              {completed
                ? "Checkout completed. Stripe is confirming your run credit."
                : "Checkout was cancelled. You were not charged."}
            </p>
            {completed ? (
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                This page refreshes while the signed webhook grants the credit.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
