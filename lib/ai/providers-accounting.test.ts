import { afterEach, describe, expect, it, vi } from "vitest";

const { getGenerationInfo } = vi.hoisted(() => ({
  getGenerationInfo: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@ai-sdk/gateway", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@ai-sdk/gateway")>();

  return {
    ...actual,
    gateway: {
      ...actual.gateway,
      getGenerationInfo,
    },
  };
});

import {
  getGatewayGenerationCostMicros,
  isDelayedGatewayCostRecordError,
} from "./gateway-cost";

describe("Gateway generation cost accounting", () => {
  afterEach(() => {
    getGenerationInfo.mockReset();
    vi.useRealTimers();
  });

  it("retries a delayed generation record and converts dollars to micros", async () => {
    vi.useFakeTimers();
    getGenerationInfo
      .mockRejectedValueOnce(Object.assign(new Error("not ready"), { statusCode: 404 }))
      .mockResolvedValueOnce({ totalCost: 0.012345 });

    const cost = getGatewayGenerationCostMicros("gen_01KValidGeneration");
    await vi.runAllTimersAsync();

    await expect(cost).resolves.toBe(12_345);
    expect(getGenerationInfo).toHaveBeenCalledTimes(2);
  });

  it("does not retry authentication failures", async () => {
    getGenerationInfo.mockRejectedValue(
      Object.assign(new Error("unauthorized"), { statusCode: 401 }),
    );

    await expect(
      getGatewayGenerationCostMicros("gen_01KValidGeneration"),
    ).rejects.toThrow("unauthorized");
    expect(getGenerationInfo).toHaveBeenCalledTimes(1);
  });

  it("does not amplify nonessential cost lookups during Gateway outages", async () => {
    getGenerationInfo.mockRejectedValue(
      Object.assign(new Error("unavailable"), { statusCode: 503 }),
    );

    await expect(
      getGatewayGenerationCostMicros("gen_01KValidGeneration"),
    ).rejects.toThrow("unavailable");
    expect(getGenerationInfo).toHaveBeenCalledTimes(1);
  });

  it("recognizes only delayed generation-record responses", () => {
    expect(isDelayedGatewayCostRecordError({ statusCode: 404 })).toBe(true);
    expect(isDelayedGatewayCostRecordError({ statusCode: 409 })).toBe(true);
    expect(isDelayedGatewayCostRecordError({ statusCode: 503 })).toBe(false);
    expect(isDelayedGatewayCostRecordError({ statusCode: 401 })).toBe(false);
  });
});
