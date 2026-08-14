import { acceptsMarkdown } from "@/lib/agent-discovery";
import { mcpLandingResponse } from "@/lib/machine-pages";
import { handleMcpOptions, handleMcpPost } from "@/lib/mcp";

export const runtime = "nodejs";

export const POST = handleMcpPost;
export const OPTIONS = handleMcpOptions;

export function GET(request: Request) {
  return mcpLandingResponse(request, acceptsMarkdown);
}

export function HEAD(request: Request) {
  return mcpLandingResponse(request, acceptsMarkdown);
}
