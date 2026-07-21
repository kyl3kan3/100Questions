import "server-only";

import { isTransientAuthFailure } from "@/lib/auth/errors";
import { auth } from "@/lib/auth/server";

export async function getAuthenticatedUser() {
  const { data, error } = await auth.getSession();

  if (error && isTransientAuthFailure(error)) {
    console.error("[auth] Session lookup temporarily failed.", {
      code: error.code,
      status: error.status,
    });
    throw new Error("Authentication service temporarily unavailable.");
  }

  if (error || !data?.user) {
    return null;
  }

  return data.user;
}
