import {
  machineMarkdownForSlug,
  machineMarkdownResponse,
} from "@/lib/machine-pages";

const page = machineMarkdownForSlug("ai-visibility")!;

export function GET() {
  return machineMarkdownResponse(page);
}

export function HEAD() {
  return machineMarkdownResponse(page, "HEAD");
}
