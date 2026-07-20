import "server-only";

import { auth } from "@/lib/auth/server";

export async function getAuthenticatedUser() {
  const { data, error } = await auth.getSession();

  if (error || !data?.user) {
    return null;
  }

  return data.user;
}
