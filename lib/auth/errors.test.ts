import { describe, expect, it } from "vitest";

import {
  getAuthFailureLogContext,
  getSignInFailureMessage,
  getSignUpFailureMessage,
} from "./errors";

describe("auth failure messages", () => {
  it("keeps upstream and origin failures generic", () => {
    expect(
      getSignUpFailureMessage({ code: "NETWORK_TIMEOUT", status: 502 }),
    ).toContain("temporarily unavailable");
    expect(getSignUpFailureMessage({ status: 403 })).toContain(
      "temporarily unavailable",
    );
  });

  it("distinguishes duplicate accounts and rate limits", () => {
    expect(getSignUpFailureMessage({ code: "user_already_exists" })).toContain(
      "already exists",
    );
    expect(getSignUpFailureMessage({ status: 429 })).toContain("Too many");
    expect(getSignInFailureMessage({ status: 429 })).toContain("Too many");
  });

  it("builds a safe log context without user input", () => {
    expect(
      getAuthFailureLogContext("sign-up", {
        code: "feature_not_supported",
        status: 403,
      }),
    ).toEqual({
      operation: "sign-up",
      code: "feature_not_supported",
      status: 403,
    });
  });
});
