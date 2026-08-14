import {
  machineMarkdownForSlug,
  machineMarkdownResponse,
} from "@/lib/machine-pages";

const page = machineMarkdownForSlug(
  "how-to-get-chatgpt-to-recommend-your-business",
)!;

export function GET() {
  return machineMarkdownResponse(page);
}

export function HEAD() {
  return machineMarkdownResponse(page, "HEAD");
}
