import type { LookupAddress, LookupOptions } from "node:dns";

import { describe, expect, it, vi } from "vitest";

import {
  createPinnedAddressLookup,
  isPublicInternetAddress,
  resolvePublicAddresses,
} from "./public-network";

describe("public network address validation", () => {
  it.each([
    "8.8.8.8",
    "1.1.1.1",
    "2001:4860:4860::8888",
    "2606:4700:4700::1111",
  ])("accepts globally routable address %s", (address) => {
    expect(isPublicInternetAddress(address)).toBe(true);
  });

  it.each([
    "0.0.0.0",
    "10.0.0.1",
    "100.64.0.1",
    "127.0.0.1",
    "169.254.1.1",
    "172.16.0.1",
    "192.168.1.1",
    "192.0.2.1",
    "198.18.0.1",
    "198.51.100.1",
    "203.0.113.1",
    "224.0.0.1",
    "255.255.255.255",
    "::",
    "::1",
    "fc00::1",
    "fe80::1",
    "ff02::1",
    "2001:db8::1",
    "2002:0808:0808::1",
    "3fff::1",
    "::ffff:127.0.0.1",
    "::ffff:7f00:1",
    "::ffff:169.254.1.1",
    "::ffff:a9fe:101",
    "::ffff:172.16.0.1",
    "::ffff:ac10:1",
    "::ffff:192.168.1.1",
    "::ffff:c0a8:101",
  ])("rejects non-public address %s", (address) => {
    expect(isPublicInternetAddress(address)).toBe(false);
  });

  it("rejects an entire DNS response when any answer is unsafe", async () => {
    await expect(
      resolvePublicAddresses("example.com", async () => [
        { address: "8.8.8.8", family: 4 },
        { address: "127.0.0.1", family: 4 },
      ]),
    ).rejects.toThrow("Unsafe homepage address");
  });

  it("deduplicates validated DNS answers", async () => {
    await expect(
      resolvePublicAddresses("example.com", async () => [
        { address: "8.8.8.8", family: 4 },
        { address: "8.8.8.8", family: 4 },
      ]),
    ).resolves.toEqual([{ address: "8.8.8.8", family: 4 }]);
  });
});

describe("pinned address lookup", () => {
  it("returns the validated address instead of resolving the hostname again", () => {
    const callback = vi.fn();
    const pinnedLookup = createPinnedAddressLookup({
      address: "8.8.8.8",
      family: 4,
    });

    pinnedLookup(
      "attacker-controlled.example",
      { all: false } as LookupOptions,
      callback,
    );

    expect(callback).toHaveBeenCalledWith(null, "8.8.8.8", 4);
  });

  it("supports Node's all-address lookup mode without adding new answers", () => {
    const callback = vi.fn<
      (
        error: NodeJS.ErrnoException | null,
        addresses: string | LookupAddress[],
        family?: number,
      ) => void
    >();
    const target = { address: "2001:4860:4860::8888", family: 6 } as const;
    const pinnedLookup = createPinnedAddressLookup(target);

    pinnedLookup(
      "attacker-controlled.example",
      { all: true } as LookupOptions,
      callback,
    );

    expect(callback).toHaveBeenCalledWith(null, [target]);
  });
});
