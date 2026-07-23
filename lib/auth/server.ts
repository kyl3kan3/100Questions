import "server-only";

import { createHmac } from "node:crypto";

import {
  createNeonAuth,
  type NeonAuth,
} from "@neondatabase/auth/next/server";

let neonAuth: NeonAuth | undefined;

// Keep polling inexpensive while bounding how long a revoked upstream session
// can remain authorized by the signed session-data snapshot.
export const SESSION_DATA_TTL_SECONDS = 60;
// Bump this whenever a rollout must invalidate already-minted local snapshots.
// The upstream Neon session token uses a separate key and remains valid.
export const SESSION_DATA_COOKIE_KEY_VERSION = "2026-07-22-v2";

export function deriveSessionDataCookieSecret(
  configuredSecret: string,
  version = SESSION_DATA_COOKIE_KEY_VERSION,
) {
  const normalizedSecret = configuredSecret.trim();

  if (normalizedSecret.length < 32) {
    throw new Error("NEON_AUTH_COOKIE_SECRET must be at least 32 characters");
  }

  return createHmac("sha256", normalizedSecret)
    .update(`100questions/neon-auth/session-data/${version}`)
    .digest("base64url");
}

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
      // Versioning the local signing key rejects snapshots minted before this
      // rollout. The still-valid upstream session token is then revalidated,
      // and middleware/auth handlers mint a fresh one-minute snapshot.
      secret: deriveSessionDataCookieSecret(
        readRequiredEnvironmentVariable("NEON_AUTH_COOKIE_SECRET"),
      ),
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
