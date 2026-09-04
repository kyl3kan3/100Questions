import { createHash } from "node:crypto";

import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

export const AGENT_DISCOVERY_LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
  '</.well-known/mcp/server-card.json>; rel="describedby"; type="application/json"',
  '</mcp>; rel="service-doc"; type="text/html"',
  '</mcp.md>; rel="alternate"; type="text/markdown"',
  '</index.md>; rel="alternate"; type="text/markdown"',
  '</ai-visibility-checker>; rel="service-doc"; type="text/html"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
].join(", ");

export const API_CATALOG_CONTENT_TYPE =
  'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';

export const HOME_MARKDOWN = `# 100 Questions

100 Questions is a source-backed AI visibility benchmark. It compares one frozen buyer-question set across web-grounded answers from OpenAI, Claude, Gemini, and Grok, then reports brand mentions, prominence, competitor share of voice, claimed-domain citations, and provider coverage.

## Start here

- [Run an AI visibility benchmark](${absoluteUrl("/auth/sign-up")})
- [Use the free AI visibility checker](${absoluteUrl("/ai-visibility-checker")})
- [Browse the resource library](${absoluteUrl("/resources")})
- [Read the methodology](${absoluteUrl("/methodology")})
- [View a sample report](${absoluteUrl("/sample-report")})
- [Explore the 2026 AI Visibility Index](${absoluteUrl("/ai-visibility-index")})

## Company and policies

- [About the product and editorial team](${absoluteUrl("/about")})
- [Contact and corrections](${absoluteUrl("/contact")})
- [Support center](${absoluteUrl("/support")})
- [Privacy](${absoluteUrl("/privacy")})
- [Terms](${absoluteUrl("/terms")})

## Machine-readable resources

- [Concise site index](${absoluteUrl("/llms.txt")})
- [Full product and methodology reference](${absoluteUrl("/llms-full.txt")})
- [Public API catalog](${absoluteUrl("/.well-known/api-catalog")})
- [OpenAPI description](${absoluteUrl("/openapi.json")})
- [Agent skills index](${absoluteUrl("/.well-known/agent-skills/index.json")})
- [MCP server card](${absoluteUrl("/.well-known/mcp/server-card.json")})
- [MCP documentation and public endpoint](${absoluteUrl("/mcp")})
- [MCP documentation in Markdown](${absoluteUrl("/mcp.md")})
- [Agent authentication guidance](${absoluteUrl("/auth.md")})

## Important limitation

AI answers vary by provider, model, grounding source, locale, and time. Results are directional snapshots, not ranking guarantees. Failed or unsourced provider calls remain visible in coverage and are excluded from eligible-score denominators.
`;

export const AUTH_MARKDOWN = `# 100 Questions auth.md

## Agent registration

You are an agent. This service supports credential-free agent registration for MCP clients and API clients performing public website readiness checks.

- \`register_uri\`: not applicable; anonymous access requires no registration.
- Registration and provisioning endpoint: \`POST ${absoluteUrl("/mcp")}\`. Send a standard MCP \`initialize\` request to start a stateless client session and discover the public tool.
- Supported registration method: anonymous access; no pre-registration or account provisioning is required.
- \`identity_types_supported\`: \`["anonymous"]\`
- \`credential_types_supported\`: \`["none"]\`
- \`claim_uri\`: not applicable; the service does not issue credentials.
- Credential use: do not send an Authorization header or browser cookie to the public service.

Registration is complete when MCP initialization succeeds. The service returns no account, access token, API key, or persistent agent identity.

This document describes how agents and developers may access 100 Questions services.

## Public agent access

No registration or credential is required for the public AI readiness service:

- MCP Streamable HTTP endpoint: ${absoluteUrl("/mcp")}
- MCP server card: ${absoluteUrl("/.well-known/mcp/server-card.json")}
- REST endpoint: ${absoluteUrl("/api/tools/ai-readiness")}
- OpenAPI description: ${absoluteUrl("/openapi.json")}

The public service is read-only. Clients must provide a public website domain and must not submit secrets, private network addresses, or personal data.

## Interactive benchmark accounts

The paid benchmark application uses browser-based account registration and secure session cookies. Create an account at ${absoluteUrl("/auth/sign-up")}.

100 Questions does not currently issue OAuth bearer tokens, API keys, or autonomous agent credentials for protected benchmark APIs. Agents must not automate interactive account creation or present browser session cookies as machine credentials.
`;

export const MCP_PROTOCOL_VERSION = "2025-11-25";

export const MCP_TOOL = {
  name: "check_ai_visibility_readiness",
  title: "Check AI visibility readiness",
  description:
    "Inspect a public website for technical AI-search crawlability and discovery signals.",
  inputSchema: {
    type: "object",
    required: ["website"],
    additionalProperties: false,
    properties: {
      website: {
        type: "string",
        maxLength: 500,
        description: "A public website hostname such as example.com.",
      },
    },
  },
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
} as const;

export function buildMcpServerCard() {
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
    version: "1.0",
    protocolVersion: MCP_PROTOCOL_VERSION,
    serverInfo: {
      name: "100questions-ai-readiness",
      title: "100 Questions AI Readiness",
      version: "1.0.0",
    },
    description:
      "A public, read-only MCP service for checking a website's technical AI visibility readiness.",
    iconUrl: absoluteUrl("/icon-192.png"),
    documentationUrl: absoluteUrl("/ai-visibility-checker"),
    transport: {
      type: "streamable-http",
      endpoint: absoluteUrl("/mcp"),
    },
    capabilities: { tools: {} },
    authentication: {
      required: false,
      schemes: [],
    },
    tools: [MCP_TOOL],
  };
}

export const AGENT_SKILL_MARKDOWN = `---
name: audit-ai-visibility-readiness
description: Check a public website for the technical signals that help AI search systems crawl, understand, and cite it.
---

# Audit AI visibility readiness

Use the free 100 Questions readiness API to inspect a public website's homepage, robots.txt, sitemap, structured data, AI crawler access, and llms.txt availability.

## Endpoint

Send a POST request to ${absoluteUrl("/api/tools/ai-readiness")} with JSON:

\`\`\`json
{"website":"example.com"}
\`\`\`

The endpoint accepts public domain names only. It returns a score, individual checks, and prioritized actions. Results measure technical readiness, not current inclusion in any AI answer.

## Discovery and documentation

- OpenAPI: ${absoluteUrl("/openapi.json")}
- Human documentation: ${absoluteUrl("/ai-visibility-checker")}
- Methodology: ${absoluteUrl("/methodology")}

Do not treat a passing technical check as a ranking guarantee. AI answers vary by provider, model, grounding source, locale, and time.
`;

export const AGENT_SKILL_DIGEST = `sha256:${createHash("sha256")
  .update(AGENT_SKILL_MARKDOWN)
  .digest("hex")}`;

export function buildApiCatalog() {
  return {
    linkset: [
      {
        anchor: absoluteUrl("/api/tools/ai-readiness"),
        "service-desc": [
          {
            href: absoluteUrl("/openapi.json"),
            type: "application/vnd.oai.openapi+json",
          },
        ],
        "service-doc": [
          {
            href: absoluteUrl("/ai-visibility-checker"),
            type: "text/html",
          },
        ],
        status: [
          {
            href: absoluteUrl("/api/health"),
            type: "application/json",
          },
        ],
      },
    ],
  };
}

export function buildOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: `${SITE_NAME} AI Readiness API`,
      version: "1.0.0",
      description:
        "A free, read-only technical readiness check for public websites. It does not measure current rankings or guarantee inclusion in AI answers.",
    },
    servers: [{ url: SITE_URL }],
    paths: {
      "/api/tools/ai-readiness": {
        post: {
          operationId: "checkAiVisibilityReadiness",
          summary: "Check a public website's AI visibility readiness",
          description: SITE_DESCRIPTION,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["website"],
                  additionalProperties: false,
                  properties: {
                    website: {
                      type: "string",
                      maxLength: 500,
                      examples: ["example.com"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Technical readiness result",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ReadinessResult" },
                },
              },
            },
            "400": { description: "Invalid website" },
            "403": { description: "Cross-origin browser request rejected" },
            "422": { description: "Website could not be fetched safely" },
          },
        },
      },
      "/api/health": {
        get: {
          operationId: "getApiHealth",
          summary: "Check API availability",
          responses: {
            "200": {
              description: "API is available",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["status", "service"],
                    properties: {
                      status: { type: "string", const: "ok" },
                      service: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        ReadinessResult: {
          type: "object",
          required: ["score", "grade", "checkedUrl", "checkedAt", "checks"],
          properties: {
            score: { type: "integer", minimum: 0, maximum: 100 },
            grade: { type: "string" },
            checkedUrl: { type: "string", format: "uri" },
            checkedAt: { type: "string", format: "date-time" },
            checks: {
              type: "array",
              items: {
                type: "object",
                required: ["id", "label", "status", "detail"],
                properties: {
                  id: { type: "string" },
                  label: { type: "string" },
                  status: { type: "string", enum: ["pass", "warning", "fail"] },
                  detail: { type: "string" },
                },
              },
            },
            topActions: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  };
}

export function buildAgentSkillsIndex() {
  return {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "audit-ai-visibility-readiness",
        type: "skill-md",
        description:
          "Check a public website for technical AI-search crawlability and discovery signals.",
        url: absoluteUrl(
          "/.well-known/agent-skills/audit-ai-visibility-readiness/SKILL.md",
        ),
        digest: AGENT_SKILL_DIGEST,
      },
    ],
  };
}

export function buildRobotsText() {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /.well-known/workflow/",
    "Content-Signal: ai-train=no, search=yes, ai-input=yes",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
  ].join("\n");
}

export function acceptsMarkdown(acceptHeader: string | null) {
  if (!acceptHeader) return false;

  return acceptHeader
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .some((value) => {
      const [mediaType, ...parameters] = value.split(";").map((part) => part.trim());
      if (mediaType !== "text/markdown") return false;

      const quality = parameters.find((parameter) => parameter.startsWith("q="));
      return !quality || Number(quality.slice(2)) > 0;
    });
}
