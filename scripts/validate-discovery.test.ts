import { describe, expect, it, vi } from "vitest";

import {
  extractJsonLdNodes,
  runDiscoveryValidation,
  validateDiscoveryPage,
  visibleText,
} from "./validate-discovery.mjs";

function page(graph: Record<string, unknown>[], content: string) {
  return `<!doctype html><html><body>${content}<script type="application/ld+json">${JSON.stringify(
    { "@context": "https://schema.org", "@graph": graph },
  )}</script></body></html>`;
}

describe("raw HTML discovery validation", () => {
  it("extracts graph nodes and excludes JSON-LD text from visible copy", () => {
    const html = page(
      [{ "@type": "FAQPage", name: "Hidden schema name" }],
      "<h1>Visible &amp; useful</h1>",
    );

    expect(extractJsonLdNodes(html)).toHaveLength(1);
    expect(visibleText(html)).toBe("Visible & useful");
    expect(visibleText(html)).not.toContain("Hidden schema name");
  });

  it("accepts FAQ schema only when every answer is visible", () => {
    const faq = {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What does it do?",
          acceptedAnswer: { "@type": "Answer", text: "It shows the evidence." },
        },
      ],
    };
    const html = page(
      [faq],
      "<h2>What does it do?</h2><p>It shows the evidence.</p>",
    );

    expect(
      validateDiscoveryPage({
        html,
        path: "/faq",
        requiredTypes: ["FAQPage"],
      }),
    ).toEqual({ nodes: 1, types: 1 });
  });

  it("rejects facts hidden only in JSON-LD", () => {
    const html = page(
      [
        {
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Hidden question?",
              acceptedAnswer: { "@type": "Answer", text: "Hidden answer." },
            },
          ],
        },
      ],
      "<h1>Visible page</h1>",
    );

    expect(() =>
      validateDiscoveryPage({
        html,
        path: "/faq",
        requiredTypes: ["FAQPage"],
      }),
    ).toThrow("not visible in raw HTML");
  });

  it("checks fetched pages through the production entry point", async () => {
    const html = page(
      [{ "@type": "Brand", name: "100 Questions" }],
      "<h1>100 Questions</h1>",
    );
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(html, { status: 200 }),
    );

    await expect(
      runDiscoveryValidation({
        baseUrl: "https://example.com",
        fetchImpl,
        requirements: [{ path: "/", types: ["Brand"] }],
      }),
    ).resolves.toEqual([{ path: "/", nodes: 1, types: 1 }]);
  });
});
