import { describe, expect, it } from "vitest";

import { buildDataFastCheckoutMetadata } from "./datafast-attribution";

describe("DataFast Stripe attribution metadata", () => {
  it("maps visitor and session cookies to DataFast's Stripe keys", () => {
    expect(
      buildDataFastCheckoutMetadata({
        visitorId: "visitor_123",
        sessionId: "session_456",
      }),
    ).toEqual({
      datafast_visitor_id: "visitor_123",
      datafast_session_id: "session_456",
    });
  });

  it("keeps available attribution when one cookie is missing", () => {
    expect(
      buildDataFastCheckoutMetadata({ visitorId: "visitor_123" }),
    ).toEqual({ datafast_visitor_id: "visitor_123" });
  });

  it("omits values that cannot be safely stored without changing them", () => {
    expect(
      buildDataFastCheckoutMetadata({
        visitorId: " visitor_123 ",
        sessionId: `session_${"x".repeat(500)}`,
      }),
    ).toEqual({});
    expect(
      buildDataFastCheckoutMetadata({ sessionId: "session\n456" }),
    ).toEqual({});
  });
});
