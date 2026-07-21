const NEON_AUTH_COOKIE_PREFIX = "__Secure-neon-auth";

export function isNeonAuthCookieName(name: string): boolean {
  return name.startsWith(`${NEON_AUTH_COOKIE_PREFIX}.`);
}
