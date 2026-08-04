import { handleMcpOptions, handleMcpPost } from "@/lib/mcp";

export const runtime = "nodejs";

export const POST = handleMcpPost;
export const OPTIONS = handleMcpOptions;

export function GET() {
  return Response.json(
    {
      error: "Use POST with the MCP Streamable HTTP transport.",
      serverCard: "/.well-known/mcp/server-card.json",
    },
    {
      status: 405,
      headers: { allow: "POST, OPTIONS" },
    },
  );
}
