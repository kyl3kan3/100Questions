import { describe, expect, it } from "vitest";

import { analyzeAiReadiness } from "./ai-readiness";

const healthyHtml = `
  <!doctype html>
  <html>
    <head>
      <title>Northstar Analytics</title>
      <meta name="description" content="Warehouse-native analytics for SaaS teams.">
      <link rel="canonical" href="https://northstar.example/">
      <script type="application/ld+json">
        {"@context":"https://schema.org","@type":"SoftwareApplication","name":"Northstar Analytics"}
      </script>
    </head>
    <body>
      <h1>Warehouse-native analytics</h1>
      <h2>What does Northstar do?</h2>
      <h2>How much does it cost?</h2>
      <h2>Which teams is it best for?</h2>
    </body>
  </html>
`;

describe("AI readiness analysis", () => {
  it("scores a complete public page without pretending to measure mentions", () => {
    const result = analyzeAiReadiness({
      finalUrl: "https://northstar.example/",
      html: healthyHtml,
      robotsText:
        "User-agent: *\nAllow: /\nSitemap: https://northstar.example/sitemap.xml",
      sitemapFound: true,
      llmsText: "# Northstar Analytics",
      checkedAt: "2026-07-24T12:00:00.000Z",
    });

    expect(result.score).toBe(100);
    expect(result.grade).toBe("Strong technical foundation");
    expect(result.topActions).toEqual([]);
    expect(result.detected.schemaTypes).toContain("SoftwareApplication");
    expect(result.detected.questionHeadingCount).toBe(3);
  });

  it("detects noindex and bot-specific full-site blocks", () => {
    const result = analyzeAiReadiness({
      finalUrl: "https://northstar.example/",
      html: `<meta name="robots" content="noindex, nofollow"><h1>Private</h1>`,
      responseHeaders: { "x-robots-tag": "noindex" },
      robotsText: [
        "User-agent: GPTBot",
        "Disallow: /",
        "",
        "User-agent: OAI-SearchBot",
        "Disallow: /",
        "",
        "User-agent: *",
        "Allow: /",
      ].join("\n"),
      sitemapFound: false,
      llmsText: null,
    });

    expect(
      result.checks.find((check) => check.id === "indexability"),
    ).toMatchObject({ status: "fail", score: 0 });
    expect(result.detected.blockedCrawlers).toEqual([
      "GPTBot",
      "OAI-SearchBot",
    ]);
    expect(
      result.checks.find((check) => check.id === "crawler-access"),
    ).toMatchObject({ status: "warning", score: 7 });
  });

  it("uses wildcard robots rules when no crawler-specific group exists", () => {
    const result = analyzeAiReadiness({
      finalUrl: "https://northstar.example/",
      html: healthyHtml,
      robotsText: "User-agent: *\nDisallow: /",
      sitemapFound: false,
      llmsText: null,
    });

    expect(result.detected.blockedCrawlers).toHaveLength(4);
    expect(
      result.checks.find((check) => check.id === "crawler-access"),
    ).toMatchObject({ status: "fail", score: 0 });
  });
});
