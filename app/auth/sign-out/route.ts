import { NextRequest, NextResponse } from "next/server";

import { isNeonAuthCookieName } from "@/lib/auth/cookies";
import { auth } from "@/lib/auth/server";

const SIGN_OUT_TIMEOUT_MS = 3_000;

async function revokeUpstreamSession(): Promise<void> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("Sign-out request timed out")),
      SIGN_OUT_TIMEOUT_MS,
    );
  });

  try {
    const { error } = await Promise.race([auth.signOut(), timeout]);

    if (error) {
      console.warn("[auth] Upstream sign-out failed; local session was cleared.", {
        code: error.code,
        status: error.status,
      });
    }
  } catch (error) {
    console.warn("[auth] Upstream sign-out failed; local session was cleared.", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function POST(request: NextRequest) {
  await revokeUpstreamSession();

  const response = NextResponse.redirect(new URL("/", request.url), 303);

  for (const cookie of request.cookies.getAll()) {
    if (!isNeonAuthCookieName(cookie.name)) continue;

    response.cookies.set({
      name: cookie.name,
      value: "",
      expires: new Date(0),
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
