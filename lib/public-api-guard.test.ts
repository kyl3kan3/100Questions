import { describe, expect, it } from "vitest";

import {
  checkPublicApiRateLimit,
  readMemoryCache,
  writeMemoryCache,
} from "./public-api-guard";

describe("public API guard", () => {
  it("rate limits within the configured window", () => {
    const key = `test-${Date.now()}`;
    expect(
      checkPublicApiRateLimit(key, { limit: 2, windowMs: 60_000 }).allowed,
    ).toBe(true);
    expect(
      checkPublicApiRateLimit(key, { limit: 2, windowMs: 60_000 }).allowed,
    ).toBe(true);
    const blocked = checkPublicApiRateLimit(key, {
      limit: 2,
      windowMs: 60_000,
    });
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("caches values until ttl expires", () => {
    const key = `cache-${Date.now()}`;
    writeMemoryCache(key, { ok: true }, 60_000);
    expect(readMemoryCache<{ ok: boolean }>(key)?.ok).toBe(true);
  });
});
