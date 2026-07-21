import "server-only";

import {
  createNeonAuth,
  type NeonAuth,
} from "@neondatabase/auth/next/server";

let neonAuth: NeonAuth | undefined;

// A benchmark can stay open for up to two hours. Keep the signed session
// snapshot valid beyond that window so progress polling does not depend on an
// upstream auth refresh every five minutes. The underlying account session
// lifetime and sign-out behavior are unchanged.
const SESSION_DATA_TTL_SECONDS = 4 * 60 * 60;

function readRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

/**
 * Returns the single Managed Neon Auth server instance. Initialization is lazy
 * so importing a route during `next build` does not require runtime secrets.
 */
export function getAuth(): NeonAuth {
  if (neonAuth) {
    return neonAuth;
  }

  neonAuth = createNeonAuth({
    baseUrl: readRequiredEnvironmentVariable("NEON_AUTH_BASE_URL"),
    cookies: {
      secret: readRequiredEnvironmentVariable("NEON_AUTH_COOKIE_SECRET"),
      sessionDataTtl: SESSION_DATA_TTL_SECONDS,
    },
    logLevel: process.env.NODE_ENV === "development" ? "warn" : "error",
  });

  return neonAuth;
}

/**
 * Lazy facade preserving Neon Auth's documented `auth.getSession()` contract.
 * Property access happens inside requests and Server Actions, not at import
 * time, which keeps auth-consuming modules build-safe.
 */
export const auth = new Proxy({} as NeonAuth, {
  get(_target, property, receiver) {
    const instance = getAuth();
    const value = Reflect.get(instance, property, receiver);

    return typeof value === "function" ? value.bind(instance) : value;
  },
});
