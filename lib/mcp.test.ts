import { afterEach, describe, expect, it, vi } from "vitest";

import { handleMcpPost } from "./mcp";

function mcpRequest(body: unknown) {
  return new Request("https://100questionsai.com/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MCP transport", () => {
  it("negotiates the current protocol and advertises tools", async () => {
    const initialize = await handleMcpPost(
      mcpRequest({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: "2025-11-25" },
      }),
    );
    const initialized = (await initialize.json()) as {
      result: { protocolVersion: string; capabilities: unknown };
    };

    expect(initialized.result).toMatchObject({
      protocolVersion: "2025-11-25",
      capabilities: { tools: {} },
    });

    const tools = await handleMcpPost(
      mcpRequest({ jsonrpc: "2.0", id: 2, method: "tools/list" }),
    );
    const toolList = (await tools.json()) as {
      result: { tools: Array<{ name: string }> };
    };
    expect(toolList.result.tools[0]?.name).toBe(
      "check_ai_visibility_readiness",
    );
  });

  it("invokes the existing readiness API from the MCP tool", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ score: 90, grade: "Strong technical foundation" }),
    );
    const response = await handleMcpPost(
      mcpRequest({
        jsonrpc: "2.0",
        id: "call-1",
        method: "tools/call",
        params: {
          name: "check_ai_visibility_readiness",
          arguments: { website: "example.com" },
        },
      }),
    );
    const body = (await response.json()) as {
      result: { structuredContent: { score: number } };
    };

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://100questionsai.com/api/tools/ai-readiness"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          origin: "https://100questionsai.com",
        }),
      }),
    );
    expect(body.result.structuredContent.score).toBe(90);
  });

  it("acknowledges notifications without a response body", async () => {
    const response = await handleMcpPost(
      mcpRequest({
        jsonrpc: "2.0",
        method: "notifications/initialized",
      }),
    );

    expect(response.status).toBe(202);
    expect(await response.text()).toBe("");
  });
});
