"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import type { BillingPackageId } from "@/lib/billing/packages";

type MarketingCheckoutButtonProps = {
  buttonClassName?: string;
  className?: string;
  label?: ReactNode;
  packageId?: BillingPackageId;
  showInlineError?: boolean;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "secondary";
};

function signUpPath(packageId: BillingPackageId): string {
  return `/auth/sign-up?package=${encodeURIComponent(packageId)}`;
}

export function MarketingCheckoutButton({
  buttonClassName,
  className,
  label = "Run my first audit — $9",
  packageId = "intro",
  showInlineError = true,
  size = "lg",
  variant = "default",
}: MarketingCheckoutButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function redirectToSignUp() {
    window.location.assign(signUpPath(packageId));
  }

  async function startCheckout() {
    setPending(true);
    setError(null);
    trackEvent("checkout_started", {
      package_id: packageId,
      account_state: "guest",
    });

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({ packageId }),
      });
      const body = (await response.json().catch(() => null)) as
        | { url?: string; error?: string; code?: string }
        | null;

      if (response.status === 503) {
        redirectToSignUp();
        return;
      }

      if (!response.ok || !body?.url) {
        throw new Error(body?.error || "Checkout is temporarily unavailable.");
      }

      window.location.assign(body.url);
    } catch (caught) {
      if (!showInlineError) {
        redirectToSignUp();
        return;
      }

      setError(
        caught instanceof Error
          ? caught.message
          : "Checkout is temporarily unavailable.",
      );
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <Button
        className={`w-full ${buttonClassName || ""}`}
        size={size}
        variant={variant}
        type="button"
        disabled={pending}
        onClick={() => void startCheckout()}
      >
        {pending ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden="true" />
            Opening secure checkout…
          </>
        ) : (
          <>
            {label} <ArrowRight aria-hidden="true" />
          </>
        )}
      </Button>
      {showInlineError && error ? (
        <p className="mt-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
