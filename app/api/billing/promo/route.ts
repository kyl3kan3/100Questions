import { auth } from "@/lib/auth/server";
import { getCreditBalance } from "@/lib/billing/credits";
import {
  PROMO_CREDIT_GRANT,
  redeemPromoCode,
} from "@/lib/billing/promo";
import { isSameOriginRequest } from "@/lib/billing/stripe";

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

  const body = (await request.json().catch(() => null)) as {
    code?: unknown;
  } | null;

  if (typeof body?.code !== "string" || body.code.length > 64) {
    return Response.json(
      { error: "Enter a valid promo code" },
      { status: 400 },
    );
  }

  try {
    const result = await redeemPromoCode({
      userId: session.user.id,
      code: body.code,
    });

    if (result === "invalid") {
      return Response.json(
        { error: "That promo code is not valid" },
        { status: 400 },
      );
    }

    if (result === "already_redeemed") {
      return Response.json(
        { error: "This account has already redeemed that promo code" },
        { status: 409 },
      );
    }

    return Response.json({
      creditsGranted: PROMO_CREDIT_GRANT,
      balance: await getCreditBalance(session.user.id),
    });
  } catch (error) {
    console.error("[billing] Promo-code redemption failed.", {
      userId: session.user.id,
      error,
    });
    return Response.json(
      { error: "Unable to redeem the promo code right now" },
      { status: 500 },
    );
  }
}

