import { auth } from "@/lib/auth/server";
import { getBillingCustomerForUser } from "@/lib/billing/credits";
import {
  BillingConfigurationError,
  getApplicationOrigin,
  getStripe,
  isSameOriginRequest,
} from "@/lib/billing/stripe";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const { data: session, error: sessionError } = await auth.getSession();

  if (sessionError) {
    return Response.json(
      { error: "Authentication is temporarily unavailable" },
      { status: 503 },
    );
  }

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const customerId = await getBillingCustomerForUser(session.user.id);

    if (!customerId) {
      return Response.json(
        { error: "No Stripe customer is linked to this account" },
        { status: 409 },
      );
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getApplicationOrigin(request)}/dashboard`,
    });

    return Response.json({ url: portalSession.url });
  } catch (error) {
    if (error instanceof BillingConfigurationError) {
      return Response.json(
        { error: "Payments are not configured yet" },
        { status: 503 },
      );
    }

    return Response.json(
      { error: "Unable to open the Stripe billing portal" },
      { status: 502 },
    );
  }
}
