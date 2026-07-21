import { describe, expect, it } from "vitest";

import { isNeonAuthCookieName } from "./cookies";

describe("Neon Auth cookies", () => {
  it("matches session cookies without matching unrelated secure cookies", () => {
    expect(
      isNeonAuthCookieName("__Secure-neon-auth.session_token"),
    ).toBe(true);
    expect(
      isNeonAuthCookieName("__Secure-neon-auth.local.session_data"),
    ).toBe(true);
    expect(isNeonAuthCookieName("__Secure-stripe.session")).toBe(false);
    expect(isNeonAuthCookieName("__Secure-neon-authentic.cookie")).toBe(false);
  });
});
