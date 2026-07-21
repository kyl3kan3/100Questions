import { getAuth } from "@/lib/auth/server";
import {
  isSignupEmailAllowed,
  signupRestrictedMessage,
} from "@/lib/auth/signup";

type AuthRouteContext = {
  params: Promise<{ path: string[] }>;
};

export function GET(request: Request, context: AuthRouteContext) {
  return getAuth().handler().GET(request, context);
}

export async function POST(request: Request, context: AuthRouteContext) {
  const { path } = await context.params;

  if (path[0] === "sign-up") {
    const body = await request
      .clone()
      .json()
      .catch(() => null) as { email?: unknown } | null;

    if (!isSignupEmailAllowed(body?.email)) {
      return Response.json(
        {
          code: "SIGN_UP_RESTRICTED",
          message: signupRestrictedMessage(),
        },
        { status: 403 },
      );
    }
  }

  return getAuth().handler().POST(request, context);
}

export function PUT(request: Request, context: AuthRouteContext) {
  return getAuth().handler().PUT(request, context);
}

export function DELETE(request: Request, context: AuthRouteContext) {
  return getAuth().handler().DELETE(request, context);
}

export function PATCH(request: Request, context: AuthRouteContext) {
  return getAuth().handler().PATCH(request, context);
}
