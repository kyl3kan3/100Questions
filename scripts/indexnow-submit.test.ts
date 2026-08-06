import { describe, expect, it, vi } from "vitest";

import {
  collectSitemapUrls,
  extractLocations,
  INDEXNOW_KEY,
  submitIndexNow,
  validateUrls,
} from "./indexnow-submit.mjs";

const siteUrl = "https://100questionsai.com";
const keyLocation = `${siteUrl}/${INDEXNOW_KEY}.txt`;
const sitemapUrl = `${siteUrl}/sitemap.xml`;

function requestUrl(input: Parameters<typeof fetch>[0]) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

describe("IndexNow submission", () => {
  it("extracts and decodes sitemap locations", () => {
    expect(
      extractLocations(
        "<urlset><url><loc>https://example.com/a?x=1&amp;y=2</loc></url></urlset>",
      ),
    ).toEqual(["https://example.com/a?x=1&y=2"]);
  });

  it("collects nested sitemap indexes once", async () => {
    const responses = new Map([
      [
        sitemapUrl,
        "<sitemapindex><sitemap><loc>https://100questionsai.com/pages.xml</loc></sitemap></sitemapindex>",
      ],
      [
        "https://100questionsai.com/pages.xml",
        "<urlset><url><loc>https://100questionsai.com/a</loc></url><url><loc>https://100questionsai.com/a</loc></url></urlset>",
      ],
    ]);
    const fetchImpl = vi.fn<typeof fetch>(async (input) =>
      new Response(responses.get(requestUrl(input)), { status: 200 }),
    );

    await expect(
      collectSitemapUrls(sitemapUrl, { fetchImpl }),
    ).resolves.toEqual(["https://100questionsai.com/a"]);
  });

  it("rejects URLs from another host", () => {
    expect(() =>
      validateUrls(["https://attacker.example/page"], siteUrl),
    ).toThrow("outside https://100questionsai.com");
  });

  it("verifies the hosted key and submits the sitemap as one batch", async () => {
    const submittedBodies: unknown[] = [];
    const fetchImpl = vi.fn<typeof fetch>(async (input, init) => {
      const value = requestUrl(input);
      if (value === keyLocation) return new Response(INDEXNOW_KEY);
      if (value === sitemapUrl) {
        return new Response(
          "<urlset><url><loc>https://100questionsai.com/</loc></url><url><loc>https://100questionsai.com/about</loc></url></urlset>",
        );
      }
      submittedBodies.push(JSON.parse(String(init?.body)));
      return new Response(null, { status: 202 });
    });

    const result = await submitIndexNow({
      endpoint: "https://api.indexnow.org/indexnow",
      fetchImpl,
      keyLocation,
      siteUrl,
      sitemapUrl,
    });

    expect(result).toMatchObject({ status: 202, submitted: 2 });
    expect(submittedBodies).toEqual([
      {
        host: "100questionsai.com",
        key: INDEXNOW_KEY,
        keyLocation,
        urlList: [
          "https://100questionsai.com/",
          "https://100questionsai.com/about",
        ],
      },
    ]);
  });

  it("does not POST during a dry run", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (input) => {
      if (requestUrl(input) === keyLocation) return new Response(INDEXNOW_KEY);
      return new Response(
        "<urlset><url><loc>https://100questionsai.com/</loc></url></urlset>",
      );
    });

    const result = await submitIndexNow({
      dryRun: true,
      fetchImpl,
      keyLocation,
      siteUrl,
      sitemapUrl,
    });

    expect(result).toMatchObject({ dryRun: true, submitted: 0 });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
