import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { PUBLIC_MARKETING_PATHS } from "./seo";
import {
  ALL_PUBLIC_MARKDOWN_PAGES,
  ADVERTISED_PUBLIC_MARKDOWN_PAGES,
  advertisedPublicMarkdownForHtmlPath,
  publicMarkdownForHtmlPath,
  publicMarkdownForMarkdownPath,
  publicMarkdownResponse,
} from "./public-markdown";

describe("public Markdown editions", () => {
  it("covers every public marketing page with unique explicit URLs", () => {
    expect(ALL_PUBLIC_MARKDOWN_PAGES).toHaveLength(
      PUBLIC_MARKETING_PATHS.length,
    );
    expect(
      new Set(ALL_PUBLIC_MARKDOWN_PAGES.map((page) => page.htmlPath)).size,
    ).toBe(PUBLIC_MARKETING_PATHS.length);
    expect(
      new Set(ALL_PUBLIC_MARKDOWN_PAGES.map((page) => page.markdownPath)).size,
    ).toBe(PUBLIC_MARKETING_PATHS.length);

    for (const htmlPath of PUBLIC_MARKETING_PATHS) {
      const page = publicMarkdownForHtmlPath(htmlPath);
      expect(page, htmlPath).toBeDefined();
      expect(page?.markdown).toContain(`# ${page?.title}`);
      expect(page?.markdownPath).toBe(
        htmlPath === "/" ? "/index.md" : `${htmlPath}.md`,
      );
      expect(publicMarkdownForMarkdownPath(page!.markdownPath)).toBe(page);
    }
  });

  it("preserves the detailed Markdown edition for priority pages", () => {
    const checker = publicMarkdownForHtmlPath("/ai-visibility-checker");
    expect(checker?.markdown).toContain("## What it checks");
    expect(checker?.markdown).toContain("Optional llms.txt discovery");
  });

  it("returns negotiation headers and no body for HEAD", async () => {
    const page = publicMarkdownForHtmlPath("/pricing")!;
    const response = publicMarkdownResponse(page);
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(response.headers.get("content-location")).toBe("/pricing.md");
    expect(response.headers.get("vary")).toBe("Accept");
    expect(response.headers.get("link")).toContain(
      '<https://100questionsai.com/pricing>; rel="canonical"',
    );
    expect(await response.text()).toContain("# AI Visibility Benchmark Pricing");

    const head = publicMarkdownResponse(page, "HEAD");
    expect(await head.text()).toBe("");
  });

  it("advertises only substantive Markdown editions in llms.txt", () => {
    const llms = readFileSync("public/llms.txt", "utf8");

    for (const page of ADVERTISED_PUBLIC_MARKDOWN_PAGES) {
      expect(llms).toContain(
        `https://100questionsai.com${page.markdownPath}`,
      );
    }

    expect(advertisedPublicMarkdownForHtmlPath("/about")).toBeUndefined();
    expect(llms).not.toContain("https://100questionsai.com/about.md");
  });
});
