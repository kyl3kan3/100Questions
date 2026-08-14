import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  acceptsMarkdown,
  AGENT_DISCOVERY_LINK_HEADER,
  AUTH_MARKDOWN,
  AGENT_SKILL_DIGEST,
  AGENT_SKILL_MARKDOWN,
  API_CATALOG_CONTENT_TYPE,
  buildAgentSkillsIndex,
  buildApiCatalog,
  buildMcpServerCard,
  buildOpenApiDocument,
  buildRobotsText,
  HOME_MARKDOWN,
} from "./agent-discovery";

describe("agent discovery", () => {
  it("advertises registered RFC 8288 link relations", () => {
    expect(AGENT_DISCOVERY_LINK_HEADER).toContain('rel="api-catalog"');
    expect(AGENT_DISCOVERY_LINK_HEADER).toContain('rel="service-desc"');
    expect(AGENT_DISCOVERY_LINK_HEADER).toContain('rel="service-doc"');
    expect(AGENT_DISCOVERY_LINK_HEADER).toContain('rel="describedby"');
    expect(AGENT_DISCOVERY_LINK_HEADER).toContain(
      '</mcp.md>; rel="alternate"; type="text/markdown"',
    );
  });

  it("publishes an RFC 9727 Linkset catalog for the public readiness API", () => {
    expect(API_CATALOG_CONTENT_TYPE).toContain("application/linkset+json");
    expect(buildApiCatalog()).toEqual({
      linkset: [
        expect.objectContaining({
          anchor: "https://100questionsai.com/api/tools/ai-readiness",
          "service-desc": [
            expect.objectContaining({
              href: "https://100questionsai.com/openapi.json",
            }),
          ],
          "service-doc": [
            expect.objectContaining({
              href: "https://100questionsai.com/ai-visibility-checker",
            }),
          ],
          status: [
            expect.objectContaining({
              href: "https://100questionsai.com/api/health",
            }),
          ],
        }),
      ],
    });
  });

  it("describes only the public API in OpenAPI", () => {
    const document = buildOpenApiDocument();

    expect(document.openapi).toBe("3.1.0");
    expect(document.paths).toHaveProperty("/api/tools/ai-readiness");
    expect(document.paths).toHaveProperty("/api/health");
    expect(document.paths).not.toHaveProperty("/api/runs");
  });

  it("publishes an unauthenticated MCP server card for the public tool", () => {
    expect(buildMcpServerCard()).toMatchObject({
      protocolVersion: "2025-11-25",
      transport: {
        type: "streamable-http",
        endpoint: "https://100questionsai.com/mcp",
      },
      capabilities: { tools: {} },
      authentication: { required: false },
      tools: [
        expect.objectContaining({
          name: "check_ai_visibility_readiness",
        }),
      ],
    });
  });

  it("keeps auth guidance honest about supported machine credentials", () => {
    expect(AUTH_MARKDOWN).toContain("# 100 Questions auth.md");
    expect(AUTH_MARKDOWN).toContain("No registration or credential is required");
    expect(AUTH_MARKDOWN).toContain("## Agent registration");
    expect(AUTH_MARKDOWN).toContain('`identity_types_supported`: `["anonymous"]`');
    expect(AUTH_MARKDOWN).toContain("does not currently issue OAuth bearer tokens");
  });

  it("publishes a valid skill digest", () => {
    const expected = `sha256:${createHash("sha256")
      .update(AGENT_SKILL_MARKDOWN)
      .digest("hex")}`;

    expect(AGENT_SKILL_DIGEST).toBe(expected);
    expect(buildAgentSkillsIndex().skills[0]).toMatchObject({
      name: "audit-ai-visibility-readiness",
      type: "skill-md",
      digest: expected,
    });
  });

  it("declares content-use preferences without blocking search or AI input", () => {
    const robots = buildRobotsText();

    expect(robots).toContain(
      "Content-Signal: ai-train=no, search=yes, ai-input=yes",
    );
    expect(robots).toContain(
      "Sitemap: https://100questionsai.com/sitemap.xml",
    );
  });

  it("honors explicit markdown media ranges", () => {
    expect(acceptsMarkdown("text/markdown")).toBe(true);
    expect(acceptsMarkdown("text/html, text/markdown;q=0.8")).toBe(true);
    expect(acceptsMarkdown("text/markdown;q=0")).toBe(false);
    expect(acceptsMarkdown("text/html, */*;q=0.1")).toBe(false);
    expect(acceptsMarkdown(null)).toBe(false);
    expect(HOME_MARKDOWN).toContain("# 100 Questions");
    expect(HOME_MARKDOWN).toContain(
      "https://100questionsai.com/.well-known/api-catalog",
    );
    expect(HOME_MARKDOWN).toContain("https://100questionsai.com/resources");
    expect(HOME_MARKDOWN).toContain("https://100questionsai.com/privacy");
    expect(HOME_MARKDOWN).toContain("https://100questionsai.com/mcp.md");
  });
});
