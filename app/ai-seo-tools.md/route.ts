import {
  machineMarkdownForSlug,
  machineMarkdownResponse,
} from "@/lib/machine-pages";

const page = machineMarkdownForSlug("ai-seo-tools")!;

export function GET() {
  return machineMarkdownResponse(page);
}

export function HEAD() {
  return machineMarkdownResponse(page, "HEAD");
}
