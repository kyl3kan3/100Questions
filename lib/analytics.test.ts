import { afterEach, describe, expect, it, vi } from "vitest";

import { trackEvent } from "./analytics";

describe("product analytics", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends product events to Google Analytics and DataFast", () => {
    const gtag = vi.fn();
    const datafast = vi.fn();
    vi.stubGlobal("window", { gtag, datafast });

    trackEvent("checkout_started", {
      package_id: "intro",
      account_state: "guest",
      quantity: 1,
      promoted: true,
    });

    expect(gtag).toHaveBeenCalledWith("event", "checkout_started", {
      package_id: "intro",
      account_state: "guest",
      quantity: 1,
      promoted: true,
    });
    expect(datafast).toHaveBeenCalledWith("checkout_started", {
      package_id: "intro",
      account_state: "guest",
      quantity: "1",
      promoted: "true",
    });
  });

  it("omits invalid and undefined DataFast parameters", () => {
    const datafast = vi.fn();
    vi.stubGlobal("window", { datafast });

    trackEvent("benchmark_started", {
      run_id: "run_123",
      "Invalid Property": "ignored",
      optional: undefined,
    });

    expect(datafast).toHaveBeenCalledWith("benchmark_started", {
      run_id: "run_123",
    });
  });

  it("does not fail when analytics scripts are unavailable", () => {
    vi.stubGlobal("window", {});

    expect(() => trackEvent("sample_report_viewed")).not.toThrow();
  });
});
