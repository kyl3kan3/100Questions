import { describe, expect, it } from "vitest";

import { matchesUserIdAllowlist } from "./access-policy";

describe("matchesUserIdAllowlist", () => {
  it("matches an exact user ID in a comma or whitespace separated allowlist", () => {
    expect(matchesUserIdAllowlist("user-2", "user-1, user-2\nuser-3")).toBe(
      true,
    );
  });

  it("does not grant partial, blank, or missing matches", () => {
    expect(matchesUserIdAllowlist("user-2", "user-20,user-3")).toBe(false);
    expect(matchesUserIdAllowlist("", "user-2")).toBe(false);
    expect(matchesUserIdAllowlist("user-2", undefined)).toBe(false);
  });
});
