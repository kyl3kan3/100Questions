import { describe, expect, it, vi, afterEach } from "vitest";

import type { AiReadinessResult } from "./ai-readiness";

vi.mock("./public-site-http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./public-site-http")>();
  return {
    ...actual,
    fetchPublicResourceFollowRedirects: vi.fn(),
  };
});

import { fetchPublicResourceFollowRedirects } from "./public-site-http";
import { fetchPublicSiteReadinessWithFallback } from "./fetch-public-site-readiness";

const mockedFetch = vi.mocked(fetchPublicResourceFollowRedirects);

describe("fetchPublicSiteReadinessWithFallback", () => {
  afterEach(() => {
    mockedFetch.mockReset();
  });

  it("follows a cross-domain marketing redirect when a later candidate succeeds", async () => {
    mockedFetch.mockImplementation(async ({ initialUrl, requireHtml }) => {
      if (requireHtml && initialUrl.hostname === "notion.so") {
        throw new Error("Website returned 403");
      }
      if (requireHtml && initialUrl.hostname === "www.notion.so") {
        return {
          response: new Response("<html></html>", { status: 200 }),
          finalUrl: "https://www.notion.com/",
          text: "<html><head><title>Notion</title></head><body><h1>Notion</h1></body></html>",
          registrableDomain: "notion.com",
        };
      }
      if (!requireHtml) {
        return {
          response: new Response("User-agent: *\nAllow: /", { status: 200 }),
          finalUrl: initialUrl.href,
          text: "User-agent: *\nAllow: /",
          registrableDomain: "notion.com",
        };
      }
      throw new Error("unexpected");
    });

    const outcome = await fetchPublicSiteReadinessWithFallback("notion.so");
    expect(outcome.homepageFetched).toBe(true);
    expect(outcome.resolvedDomain).toBe("www.notion.com");
    expect(outcome.fetchNote).toMatch(/resolved to www\.notion\.com/i);
    expect(outcome.readiness?.score).toBeGreaterThan(0);
  });

  it("returns a partial sidecar result when homepage HTML cannot be fetched", async () => {
    mockedFetch.mockImplementation(async ({ requireHtml, initialUrl }) => {
      if (!requireHtml && initialUrl.pathname === "/robots.txt") {
        return {
          response: new Response("User-agent: *\nDisallow:", { status: 200 }),
          finalUrl: initialUrl.href,
          text: "User-agent: *\nDisallow:",
          registrableDomain: "blocked.test",
        };
      }
      throw new Error("Website returned 403");
    });

    const outcome = await fetchPublicSiteReadinessWithFallback("example.com");
    expect(outcome.homepageFetched).toBe(false);
    expect(outcome.fetchNote).toMatch(/blocked or challenged/i);
    expect(outcome.readiness).not.toBeNull();
    expect(outcome.readiness?.score).toBeLessThanOrEqual(45);
  });
});
