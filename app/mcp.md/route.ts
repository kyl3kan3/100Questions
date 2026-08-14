import {
  MCP_MARKDOWN_PAGE,
  machineMarkdownResponse,
} from "@/lib/machine-pages";

export function GET() {
  return machineMarkdownResponse(MCP_MARKDOWN_PAGE);
}

export function HEAD() {
  return machineMarkdownResponse(MCP_MARKDOWN_PAGE, "HEAD");
}
