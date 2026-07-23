import { describe, expect, it } from "vitest";

import {
  getCheckoutIdempotencyKey,
  getIntroductoryClaimIdempotencyKey,
} from "./checkout-policy";

describe("checkout idempotency policy", () => {
  it("keys an introductory attempt by its persisted claim snapshot", () => {
    expect(
      getIntroductoryClaimIdempotencyKey(
        "2a44e642-5c4f-43ae-9f35-6ef80ce0146e",
        3,
      ),
    ).toBe(
      "100q:checkout:intro-claim:2a44e642-5c4f-43ae-9f35-6ef80ce0146e:3",
    );
    expect(
      getIntroductoryClaimIdempotencyKey(
        "2a44e642-5c4f-43ae-9f35-6ef80ce0146e",
        4,
      ),
    ).not.toBe(
      getIntroductoryClaimIdempotencyKey(
        "2a44e642-5c4f-43ae-9f35-6ef80ce0146e",
        3,
      ),
    );
  });

  it("keeps repeat purchases independently idempotent", () => {
    const first = getCheckoutIdempotencyKey({
      userId: "user_123",
      packageId: "three",
      clientRequestKey: "browser-request-a",
    });
    const second = getCheckoutIdempotencyKey({
      userId: "user_123",
      packageId: "three",
      clientRequestKey: "browser-request-b",
    });

    expect(first).not.toBe(second);
  });
});
