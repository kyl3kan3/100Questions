import "server-only";

import { matchesUserIdAllowlist } from "@/lib/access-policy";

/**
 * Server-side entitlement check for internal accounts that do not consume
 * prepaid credits or the per-user daily quota. The allowlist stays in runtime
 * configuration so account identifiers are never committed to the repository.
 */
export function hasUnlimitedAccess(
  userId: string,
): boolean {
  return matchesUserIdAllowlist(
    userId,
    process.env.UNLIMITED_ACCESS_USER_IDS,
  );
}
