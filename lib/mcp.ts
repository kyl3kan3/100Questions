import {
  MCP_PROTOCOL_VERSION,
  MCP_TOOL,
} from "./agent-discovery";

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc?: unknown;
  id?: unknown;
  method?: unknown;
  params?: unknown;
};

const MCP_HEADERS = {
  "access-control-allow-headers":
    "Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-origin": "*",
  "access-control-expose-headers": "MCP-Protocol-Version, MCP-Session-Id",
  "cache-control": "no-store",
} as const;

function jsonRpcResult(id: JsonRpcId, result: unknown) {
  return { jsonrpc: "2.0", id, result } as const;
}

function jsonRpcError(id: JsonRpcId, code: number, message: string) {
  return {
    jsonrpc: "2.0",
    id,
    error: { code, message },
  } as const;
}

function responseJson(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      ...MCP_HEADERS,
      "mcp-protocol-version": MCP_PROTOCOL_VERSION,
    },
  });
}

function requestId(value: unknown): JsonRpcId {
  return typeof value === "string" || typeof value === "number" || value === null
    ? value
    : null;
}

async function handleToolCall(request: Request, params: unknown) {
  if (!params || typeof params !== "object") {
    throw new Error("Tool parameters are required.");
  }

  const { name, arguments: toolArguments } = params as {
    name?: unknown;
    arguments?: unknown;
  };
  if (name !== MCP_TOOL.name) {
    throw new Error("Unknown tool.");
  }

  const website =
    toolArguments && typeof toolArguments === "object"
      ? (toolArguments as { website?: unknown }).website
      : undefined;
  if (typeof website !== "string" || !website.trim()) {
    throw new Error("website must be a non-empty string.");
  }

  const origin = new URL(request.url).origin;
  const readinessResponse = await fetch(
    new URL("/api/tools/ai-readiness", origin),
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin,
      },
      body: JSON.stringify({ website }),
      cache: "no-store",
    },
  );
  const payload = (await readinessResponse.json().catch(() => ({
    error: "The readiness service returned an invalid response.",
  }))) as Record<string, unknown>;

  if (!readinessResponse.ok) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text:
            typeof payload.error === "string"
              ? payload.error
              : "The readiness check failed.",
        },
      ],
    };
  }

  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

async function handleRequest(request: Request, message: JsonRpcRequest) {
  const id = requestId(message.id);
  if (message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return jsonRpcError(id, -32600, "Invalid Request");
  }

  switch (message.method) {
    case "initialize": {
      const requestedVersion =
        message.params && typeof message.params === "object"
          ? (message.params as { protocolVersion?: unknown }).protocolVersion
          : undefined;
      return jsonRpcResult(id, {
        protocolVersion:
          requestedVersion === MCP_PROTOCOL_VERSION
            ? requestedVersion
            : MCP_PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: {
          name: "100questions-ai-readiness",
          title: "100 Questions AI Readiness",
          version: "1.0.0",
        },
        instructions:
          "Use check_ai_visibility_readiness with a public website domain. Do not submit secrets or private network addresses.",
      });
    }
    case "ping":
      return jsonRpcResult(id, {});
    case "tools/list":
      return jsonRpcResult(id, { tools: [MCP_TOOL] });
    case "tools/call":
      try {
        return jsonRpcResult(id, await handleToolCall(request, message.params));
      } catch (error) {
        return jsonRpcResult(id, {
          isError: true,
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "Tool call failed.",
            },
          ],
        });
      }
    case "notifications/initialized":
    case "notifications/cancelled":
      return null;
    default:
      return jsonRpcError(id, -32601, "Method not found");
  }
}

export async function handleMcpPost(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | JsonRpcRequest
    | JsonRpcRequest[]
    | null;
  if (!body) return responseJson(jsonRpcError(null, -32700, "Parse error"), 400);

  const messages = Array.isArray(body) ? body : [body];
  if (!messages.length) {
    return responseJson(jsonRpcError(null, -32600, "Invalid Request"), 400);
  }

  const results = (
    await Promise.all(messages.map((message) => handleRequest(request, message)))
  ).filter((result) => result !== null);

  if (!results.length) {
    return new Response(null, { status: 202, headers: MCP_HEADERS });
  }
  return responseJson(Array.isArray(body) ? results : results[0]);
}

export function handleMcpOptions() {
  return new Response(null, { status: 204, headers: MCP_HEADERS });
}
