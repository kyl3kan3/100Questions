import { describe, expect, it } from "vitest";

import {
  NON_HTML_NOINDEX_HEADER,
  nonHtmlNoindexHeaderRules,
} from "./non-html-crawler-headers";

describe("non-html crawler headers", () => {
  it("marks static assets and machine-readable files as noindex", () => {
    const sources = nonHtmlNoindexHeaderRules().map(({ source }) => source);

    expect(sources).toEqual([
      "/_next/static/:path*",
      "/favicon.ico",
      "/favicon-v3.ico",
      "/apple-touch-icon.png",
      "/icon-192.png",
      "/icon-512.png",
      "/maskable-icon-512.png",
      "/icon.svg",
      "/:path*.md",
      "/:path*.csv",
      "/:path*.json",
      "/data/:path*",
      "/.well-known/:path*",
    ]);

    for (const rule of nonHtmlNoindexHeaderRules()) {
      expect(rule.headers).toEqual([NON_HTML_NOINDEX_HEADER]);
    }
  });
});
