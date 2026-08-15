import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AuthForm } from "@/components/auth-form";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/server";
import {
  claimGuestCheckout,
  GUEST_CHECKOUT_COOKIE,
  getGuestCheckoutSummary,
} from "@/lib/billing/guest-checkout";

export const metadata = {
  title: "Complete your purchase",
  robots: { index: false, follow: false },
};

function StatusCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle as="h1">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm leading-6 text-zinc-300">
        {children}
      </CardContent>
    </Card>
  );
}

export default async function CheckoutCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const query = await searchParams;
  const sessionId =
    typeof query.session_id === "string" ? query.session_id : "";
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_CHECKOUT_COOKIE)?.value;
  const checkout = await getGuestCheckoutSummary(sessionId, token).catch(
    () => ({ state: "invalid" as const }),
  );
  const { data: session } = await auth.getSession();

  if (checkout.state === "paid" && session?.user?.id && session.user.email) {
    await claimGuestCheckout({
      sessionId,
      token,
      userId: session.user.id,
      userEmail: session.user.email,
    });
    redirect("/dashboard?checkout=success");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#070908] px-4 py-12">
      <div className="flex w-full flex-col items-center gap-8">
        <Link href="/" aria-label="Return to 100 Questions home">
          <BrandMark />
        </Link>

        {checkout.state === "paid" ? (
          <AuthForm
            mode="sign-up"
            checkoutSessionId={sessionId}
            email={checkout.email}
          />
        ) : checkout.state === "processing" ? (
          <StatusCard title="Your payment is processing">
            <p>
              Stripe has not marked the payment complete yet. Refresh this page
              in a moment; your account setup will appear as soon as it clears.
            </p>
            <Button asChild className="w-full">
              <Link href={`/checkout/complete?session_id=${encodeURIComponent(sessionId)}`}>
                Check payment status
              </Link>
            </Button>
          </StatusCard>
        ) : (
          <StatusCard title="We couldn’t verify this checkout">
            <p>
              Open the return link in the same browser that started payment, or
              contact support with the receipt Stripe emailed you.
            </p>
            <Button asChild className="w-full" variant="secondary">
              <Link href="/support">Open support</Link>
            </Button>
          </StatusCard>
        )}
      </div>
    </main>
  );
}
