import { describe, expect, it } from "vitest";
import { buildReadinessOffer, readinessDomain, readinessSource } from "./readiness-offer";

describe("free scan audit handoff", () => {
  it("keeps referral links on our site and removes paths and query strings", () => {
    const offer = buildReadinessOffer("https://example.com/private?token=secret", 90, "mcp");
    const url = new URL(offer.url);
    expect(url.origin).toBe("https://100questionsai.com");
    expect(url.searchParams.get("website")).toBe("example.com");
    expect(url.searchParams.get("source")).toBe("mcp");
    expect(offer.url).not.toContain("secret");
  });
  it("rejects unsafe values and constrains attribution", () => {
    expect(readinessDomain("javascript:alert(1)")).toBe("");
    expect(readinessDomain("https://user:secret@example.com")).toBe("");
    expect(readinessDomain(["example.com"])).toBe("");
    expect(readinessSource("untrusted-source")).toBe("website");
    expect(readinessSource("muse")).toBe("muse");
  });
  it("does not frame weak scans as strong foundations", () => {
    expect(buildReadinessOffer("example.com", 20).title).toContain("Fix access issues");
    expect(buildReadinessOffer("example.com", 90).title).toContain("foundation looks strong");
  });
});
