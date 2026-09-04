import { describe, expect, it } from "vitest";

import { acceptsMarkdown } from "./agent-discovery";
import {
  ALL_MACHINE_MARKDOWN_PAGES,
  buildMcpLandingHtml,
  machineMarkdownForHtmlPath,
  machineMarkdownForSlug,
  machineMarkdownResponse,
  mcpLandingResponse,
} from "./machine-pages";

describe("machine-readable SEO pages", () => {
  it("publishes unique Markdown editions for the priority HTML pages", () => {
    expect(ALL_MACHINE_MARKDOWN_PAGES).toHaveLength(8);
    expect(
      new Set(ALL_MACHINE_MARKDOWN_PAGES.map((page) => page.markdownPath)).size,
    ).toBe(8);

    for (const page of ALL_MACHINE_MARKDOWN_PAGES) {
      expect(page.markdownPath).toBe("/" + page.slug + ".md");
      expect(page.markdown).toContain("# " + page.title);
      expect(page.markdown).toContain(
        "Canonical HTML: https://100questionsai.com" + page.htmlPath,
      );
    }
  });

  it("finds Markdown editions by canonical path and explicit slug", () => {
    expect(
      machineMarkdownForHtmlPath("/ai-visibility-checker")?.markdownPath,
    ).toBe("/ai-visibility-checker.md");
    expect(machineMarkdownForSlug("mcp")?.htmlPath).toBe("/mcp");
    expect(machineMarkdownForSlug("missing")).toBeUndefined();
  });

  it("serves explicit Markdown with an HTML canonical link", async () => {
    const page = machineMarkdownForSlug("ai-seo-tools");
    expect(page).toBeDefined();

    const response = machineMarkdownResponse(page!);
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(response.headers.get("content-location")).toBe("/ai-seo-tools.md");
    expect(response.headers.get("link")).toContain(
      '<https://100questionsai.com/ai-seo-tools>; rel="canonical"',
    );
    expect(await response.text()).toContain("Best AI Visibility Tools");
  });

  it("renders a crawlable MCP HTML page with schema and canonical resources", () => {
    const html = buildMcpLandingHtml();

    expect(html).toContain("<title>Free AI Visibility Readiness MCP");
    expect(html).toContain('"@type":"WebPage"');
    expect(html).toContain('"@type":"Organization"');
    expect(html).toContain('"@type":"WebAPI"');
    expect(html).not.toContain('"@type":"SoftwareApplication"');
    expect(html).toContain("https://100questionsai.com/llms.txt");
    expect(html).toContain("https://100questionsai.com/mcp.md");
    expect(html).toContain('property="og:image"');
    expect(html).toContain('name="twitter:image"');
    expect(html).toContain("/favicon-v3.ico");
  });

  it("negotiates HTML and Markdown on GET /mcp", async () => {
    const html = mcpLandingResponse(
      new Request("https://100questionsai.com/mcp", {
        headers: { accept: "text/html" },
      }),
      acceptsMarkdown,
    );
    expect(html.status).toBe(200);
    expect(html.headers.get("content-type")).toContain("text/html");
    expect(await html.text()).toContain("Free AI visibility readiness MCP");

    const markdown = mcpLandingResponse(
      new Request("https://100questionsai.com/mcp", {
        headers: { accept: "text/markdown" },
      }),
      acceptsMarkdown,
    );
    expect(markdown.status).toBe(200);
    expect(markdown.headers.get("content-type")).toContain("text/markdown");
    expect(await markdown.text()).toContain(
      "# 100 Questions AI Visibility Readiness MCP",
    );
  });
});
