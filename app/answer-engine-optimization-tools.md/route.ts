import {
  machineMarkdownForSlug,
  machineMarkdownResponse,
} from "@/lib/machine-pages";

const page = machineMarkdownForSlug("answer-engine-optimization-tools")!;

export function GET() {
  return machineMarkdownResponse(page);
}

export function HEAD() {
  return machineMarkdownResponse(page, "HEAD");
}
