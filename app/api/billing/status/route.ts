import { BILLING_PACKAGES, type BillingPackageId } from "@/lib/billing/packages";
import {
  isStripeCheckoutConfigured,
  isStripePackageConfigured,
} from "@/lib/billing/stripe";

export async function GET() {
  const packages = Object.fromEntries(
    BILLING_PACKAGES.map((billingPackage) => [
      billingPackage.id,
      isStripePackageConfigured(billingPackage.id as BillingPackageId),
    ]),
  ) as Record<BillingPackageId, boolean>;

  return Response.json(
    {
      checkoutAvailable: isStripeCheckoutConfigured(),
      packages,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
