import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const { createNeonAuthMock } = vi.hoisted(() => ({
  createNeonAuthMock: vi.fn(() => ({ marker: "auth" })),
}));

vi.mock("server-only", () => ({}));
vi.mock("@neondatabase/auth/next/server", () => ({
  createNeonAuth: createNeonAuthMock,
}));

import {
  deriveSessionDataCookieSecret,
  getAuth,
  SESSION_DATA_COOKIE_KEY_VERSION,
  SESSION_DATA_TTL_SECONDS,
} from "./server";

describe("Neon Auth server configuration", () => {
  const configuredSecret =
    "test-secret-that-is-at-least-thirty-two-characters";

  beforeAll(() => {
    vi.stubEnv("NEON_AUTH_BASE_URL", "https://auth.example.test");
    vi.stubEnv("NEON_AUTH_COOKIE_SECRET", configuredSecret);
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("bounds and version-signs the cached authorization snapshot", () => {
    getAuth();

    expect(SESSION_DATA_TTL_SECONDS).toBe(60);
    const versionedSecret = deriveSessionDataCookieSecret(configuredSecret);
    expect(versionedSecret).not.toBe(configuredSecret);
    expect(versionedSecret.length).toBeGreaterThanOrEqual(32);
    expect(createNeonAuthMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cookies: expect.objectContaining({
          secret: versionedSecret,
          sessionDataTtl: 60,
        }),
      }),
    );
  });

  it("changes the signing key when the application snapshot version changes", () => {
    expect(
      deriveSessionDataCookieSecret(
        configuredSecret,
        `${SESSION_DATA_COOKIE_KEY_VERSION}-next`,
      ),
    ).not.toBe(deriveSessionDataCookieSecret(configuredSecret));
  });

  it("does not let derivation bypass the configured secret strength check", () => {
    expect(() => deriveSessionDataCookieSecret("  too-short  ")).toThrow(
      "NEON_AUTH_COOKIE_SECRET must be at least 32 characters",
    );
  });
});
