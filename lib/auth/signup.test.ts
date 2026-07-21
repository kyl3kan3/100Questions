import { describe, expect, it } from "vitest";

import { isSignupEmailAllowed } from "./signup";

describe("signup allowlist", () => {
  it("allows the private beta owner email", () => {
    expect(isSignupEmailAllowed("kyle@decent4.com")).toBe(true);
    expect(isSignupEmailAllowed("  KYLE@DECENT4.COM  ")).toBe(true);
  });

  it("rejects every other value", () => {
    expect(isSignupEmailAllowed("someone@example.com")).toBe(false);
    expect(isSignupEmailAllowed("kyle+test@decent4.com")).toBe(false);
    expect(isSignupEmailAllowed("kyle@decent4.co")).toBe(false);
    expect(isSignupEmailAllowed(undefined)).toBe(false);
  });
});
