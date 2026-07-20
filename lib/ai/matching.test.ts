import { describe, expect, it } from "vitest";

import {
  isOwnedDomainCitation,
  isOwnedHostname,
  matchBrand,
  normalizeCanonicalDomain,
  normalizeHostname,
  normalizeMatchText,
} from "./matching";

describe("matching normalization", () => {
  it("normalizes punctuation, whitespace, case, ampersands, and diacritics", () => {
    expect(normalizeMatchText("  CAFÉ—A&B  ")).toBe("cafe a and b");
  });

  it("matches aliases only on normalized token boundaries", () => {
    const identity = {
      canonicalName: "AI",
      aliases: ["Acme Labs"],
      canonicalDomain: "acme.example",
    };

    expect(matchBrand("A paid listing", identity).mentioned).toBe(false);
    expect(matchBrand("AI recommends ACME—LABS.", identity).matchedAliases).toEqual([
      "AI",
      "Acme Labs",
    ]);
  });

  it("deduplicates aliases after normalization", () => {
    const result = matchBrand("Acme", {
      canonicalName: "Acme",
      aliases: ["ACME", "Acme!"],
    });

    expect(result.matches).toHaveLength(1);
    expect(result.matchedAliases).toEqual(["Acme"]);
  });
});

describe("hostname normalization", () => {
  it("normalizes bare hosts, URLs, case, ports, and conventional www", () => {
    expect(normalizeHostname("HTTPS://WWW.Example.COM:443/a?q=1")).toBe(
      "www.example.com",
    );
    expect(normalizeCanonicalDomain("www.Example.com/path")).toBe("example.com");
  });

  it("rejects credentials, invalid input, and non-http protocols", () => {
    expect(normalizeHostname("https://user:pass@example.com")).toBeNull();
    expect(normalizeHostname("not a domain")).toBeNull();
    expect(normalizeHostname("ftp://example.com/file")).toBeNull();
  });

  it("rejects public suffixes, IPs, local hosts, and invalid labels as claimed sites", () => {
    expect(normalizeCanonicalDomain("com")).toBeNull();
    expect(normalizeCanonicalDomain("co.uk")).toBeNull();
    expect(normalizeCanonicalDomain("localhost")).toBeNull();
    expect(normalizeCanonicalDomain("127.0.0.1")).toBeNull();
    expect(normalizeCanonicalDomain("under_score.example")).toBeNull();
    expect(normalizeCanonicalDomain("product.example")).toBe("product.example");
  });

  it("accepts the canonical host and true subdomains only", () => {
    expect(isOwnedHostname("https://example.com/about", "example.com")).toBe(true);
    expect(isOwnedHostname("docs.example.com", "https://www.example.com")).toBe(true);
    expect(isOwnedHostname("evilexample.com", "example.com")).toBe(false);
    expect(isOwnedHostname("example.com.evil.test", "example.com")).toBe(false);
  });

  it("requires absolute safe citation URLs", () => {
    expect(isOwnedDomainCitation("https://blog.example.com/post", "example.com")).toBe(
      true,
    );
    expect(isOwnedDomainCitation("//example.com/post", "example.com")).toBe(false);
    expect(isOwnedDomainCitation("javascript:alert(1)", "example.com")).toBe(false);
  });
});
